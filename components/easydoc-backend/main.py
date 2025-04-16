from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import fitz  # PyMuPDF
import google.generativeai as genai
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

# ✅ Initialize Gemini AI
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-pro")

# ✅ Load system prompt from file
with open("EasyDoc_AI_SystemPrompt.txt", "r") as f:
    SYSTEM_PROMPT = f.read()

# ✅ Flask app setup
app = Flask(__name__)
CORS(app)  # 🔥 Enable CORS for all routes

# ✅ PDF Text Extraction
def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

# ✅ Health check
@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "EasyDoc backend is live"}), 200

# ✅ Upload from Firebase Storage URL
@app.route("/api/upload-url", methods=["POST"])
def upload_from_url():
    data = request.get_json()
    file_url = data.get("file_url")

    if not file_url:
        return jsonify({"error": "No file_url provided"}), 400

    try:
        # Download the PDF from the Firebase Storage URL
        response = requests.get(file_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to download file from URL"}), 400

        filename = "/tmp/remote_upload.pdf"
        with open(filename, "wb") as f:
            f.write(response.content)

        # Extract text from the PDF
        text = extract_text_from_pdf(filename)

        # Build and send the AI prompt
        prompt = f"{SYSTEM_PROMPT}\n\nDOCUMENT CONTENT:\n{text}"
        result = model.generate_content(prompt)
        parsed = eval(result.text)

        return jsonify({
            "status": "success",
            "chat_message": "✅ AI scan complete. Here’s what I found:",
            "fields": parsed.get("fields", []),
            "suggestions": ["Summarize", "Edit Fields", "Send for Signature"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Run local dev server (only needed if running locally)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

