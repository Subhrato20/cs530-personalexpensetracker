import requests
import base64
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
IMAGE_PATH = "sample_receipt_images/3.png"

expense_categories = [
    "Groceries", "Dining & Restaurants", "Food & Beverage", "Rent/Mortgage",
    "Utilities", "Transportation", "Insurance", "Healthcare", "Entertainment",
    "Personal Care", "Education", "Investments & Savings", "Debt Payments", "Gifts & Donations",
    "Travel", "Business Expenses", "Taxes", "Household Maintenance & Repairs",
    "Childcare & School Expenses", "Pets", "Miscellaneous"
]

def encode_image(image_path):
    """Encodes the image in Base64 format."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def extract_json_from_response(response_text):
    """Extracts JSON from text output, handling both Markdown and raw JSON."""
    match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
    if match:
        json_text = match.group(1)
    else:
        json_text = response_text
    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        return {"error": "Extracted text is not valid JSON."}

def extract_receipt_details(image_path):
    base64_image = encode_image(image_path)
    payload = {
        "model": "llama-3.2-90b-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (f"""
Extract the following details from this receipt accurately in a JSON like this:

    "amount": "The total amount spent",
    "category": "Classify based on the most relevant option from the predefined categories: {expense_categories}",
    "date": "The transaction date in MM/DD/YY format",
    "name": "The name of the store, merchant, or business where the transaction occurred"
                        
If any field is missing or unreadable, return `null` for that field
Return ONLY a single JSON object with these exact keys: 'name', 'amount', 'category', 'date'
Do NOT include any extra text, explanations, or formatting (ticks or dashes)
Ensure the extracted details are correctly assigned to the appropriate fields
"""
                        )
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    }
                ]
            }
        ],
        "temperature": 0,
        "max_tokens": 512,
        "top_p": 1,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(ENDPOINT, headers=headers, json=payload)

    # Check HTTP status code
    if response.status_code != 200:
        print("Error from server:", response.status_code)
        print("Response text:", response.text)
        return {"error": "API request failed", "status_code": response.status_code}

    response_data = response.json()

    # Check if 'choices' is in the response
    if "choices" not in response_data or not response_data["choices"]:
        print("Unexpected response:", response_data)
        return {"error": "No choices in response"}

    raw_content = response_data["choices"][0]["message"]["content"]
    print("Raw API Response:", raw_content)  # for debugging

    # Extract JSON from response
    data = extract_json_from_response(raw_content)
    return data

def main():
    details = extract_receipt_details(IMAGE_PATH)
    print(json.dumps(details, indent=4))

if __name__ == "__main__":
    main()
