import os
import requests
from flask import Flask, request, jsonify, send_file, make_response

from dotenv import load_dotenv
import tempfile

load_dotenv()

app = Flask(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
BASE_URL = "https://api.groq.com/openai/v1/chat/completions"


def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.after_request
def apply_cors(response):
    return add_cors_headers(response)


@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return add_cors_headers(make_response())

    data = request.json
    user_message = data.get("message", "")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": "You are a helpful medical assistant."},
            {"role": "user", "content": user_message}
        ]
    }

    response = requests.post(BASE_URL, headers=headers, json=payload)
    if response.status_code == 200:
        reply = response.json()["choices"][0]["message"]["content"]
        return jsonify({"reply": reply})
    else:
        return jsonify({"error": response.text}), response.status_code


@app.route("/speak", methods=["POST", "OPTIONS"])
def speak():
    if request.method == "OPTIONS":
        return add_cors_headers(make_response())

    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    tts = gTTS(text=text, lang="en")
    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tts.save(tmp_file.name)

    return send_file(tmp_file.name, mimetype="audio/mpeg")


if __name__ == "__main__":
    app.run(port=5000, debug=True)
