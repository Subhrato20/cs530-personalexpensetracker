from flask import Flask, request, jsonify
from flask_cors import CORS
import db_handler

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

    required_fields = ['username', 'expense_name', 'amount', 'category', 'date']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]

    if missing_fields:
        return jsonify({"success": False, "message": f"Missing fields: {', '.join(missing_fields)}"}), 400

    result = db_handler.add_expense(data['username'], data['expense_name'], data['amount'], data['category'], data['date'])
    return jsonify(result)

@app.route('/api/get_expenses', methods=['GET'])
def get_expenses():
    username = request.args.get('username')

    if not username:
        return jsonify({"success": False, "message": "Username is required."}), 400

    result = db_handler.get_expenses(username)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
