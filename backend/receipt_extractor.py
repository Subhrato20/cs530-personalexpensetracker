import requests
import base64
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
IMAGE_PATH = "test_data/3.png"

def encode_image(image_path):
    """Encodes the image in Base64 format."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def extract_json_from_response(response_text):
    """Extracts JSON from text output, handling Markdown code blocks or raw JSON."""
    match = re.search(r'```json\n(.*?)\n```', response_text, re.DOTALL)
    if match:
        json_text = match.group(1)
    else:
        json_text = response_text

    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        return {"error": "Extracted text is not valid JSON."}

def extract_receipt_details(image_data_b64):
    """
    Accepts Base64-encoded image data, calls Groq API with the Vision model,
    and returns a JSON dict with fields: amount, category, date, name.
    """
    payload = {
        "model": "llama-3.2-90b-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Extract the following details from this receipt: "
                            "amount, category, date, name. Return ONLY a single JSON "
                            "object with these exact fields: amount, category, date, name. "
                            "Do not include extra text or formatting."
                        )
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_data_b64}"}
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
    if response.status_code != 200:
        return {"error": f"Groq API error (status {response.status_code})", "details": response.text}

    response_data = response.json()
    if "choices" not in response_data or not response_data["choices"]:
        return {"error": "No valid choices returned from Groq API."}

    raw_content = response_data["choices"][0]["message"]["content"]
    return extract_json_from_response(raw_content)
