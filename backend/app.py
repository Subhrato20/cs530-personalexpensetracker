from flask import Flask, request, jsonify
from flask_cors import CORS
import db_handler
import base64
from receipt_extractor import extract_receipt_details

app = Flask(__name__)
CORS(app)

@app.route('/api/hello')
def hello_world():
    return jsonify({"message": "Hello World"})

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()

    # Ensure all required fields are present
    required_fields = ['username', 'name', 'email', 'password']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

    result = db_handler.signup_user(data['username'], data['name'], data['email'], data['password'])
    return jsonify(result)

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()

    # Ensure username or email and password are provided
    if ('email' not in data and 'username' not in data) or 'password' not in data or not data['password']:
        return jsonify({"success": False, "message": "Email or Username and password are required."}), 400

    if 'email' in data and data['email']:
        result = db_handler.signin_user_by_email(data['email'], data['password'])
    else:
        result = db_handler.signin_user_by_username(data['username'], data['password'])

    return jsonify(result)


@app.route('/api/add_expense', methods=['POST'])
def add_expense():
    data = request.get_json()

    required_fields = ['username', 'name', 'amount', 'category', 'date']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

    result = db_handler.add_expense(data['username'], data['name'], data['amount'], data['category'], data['date'])
    return jsonify(result)

@app.route('/api/get_expenses', methods=['GET'])
def get_expenses():
    username = request.args.get('username')

    if not username:
        return jsonify({"success": False, "message": "Username is required."}), 400

    result = db_handler.get_expenses(username)
    return jsonify(result)

@app.route('/api/upload_expense', methods=['POST'])
def upload_expense():
    """
    Upload a receipt image, extract structured data using LLM, and save it to the expenses database."""

    username = request.form.get('username') or (request.json.get('username') if request.is_json else None)
    if not username:
        return jsonify({"success": False, "message": "Username is required"}), 400

    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No image file provided."}), 400

    image_file = request.files['file']
    if image_file.filename == '':
        return jsonify({"success": False, "message": "Empty file name."}), 400

    image_data = image_file.read() 
    image_base64 = base64.b64encode(image_data).decode('utf-8')

    details = extract_receipt_details(image_base64)
    if 'error' in details:
        return jsonify({
            "success": False,
            "message": f"Error extracting receipt: {details['error']}",
            "details": details.get("details")
        }), 500

    required_fields = ["amount", "category", "date", "name"]
    for field in required_fields:
        if field not in details:
            return jsonify({"success": False, "message": f"Missing '{field}' in extracted data."}), 400

    result = db_handler.add_expense(
        username=username,
        name=details["name"],
        amount=details["amount"],
        category=details["category"],
        date=details["date"]
    )

    return jsonify(result), (200 if result.get("success") else 400)


@app.route('/api/set_alert', methods=['POST'])
def set_alert():
    data = request.get_json()

    required_fields = ['username', 'name', 'amount', 'due_date']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

    result = db_handler.set_alert(data['username'], data['name'], data['amount'], data['due_date'])
    return jsonify(result)

@app.route('/api/get_alerts', methods=['GET'])
def get_alerts():
    username = request.args.get('username')

    if not username:
        return jsonify({"success": False, "message": "Username is required."}), 400

    result = db_handler.get_alerts(username)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
