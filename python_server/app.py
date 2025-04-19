from flask import Flask, request, jsonify
from flask_cors import CORS
from deepgram import DeepgramClient, PrerecordedOptions
from dotenv import load_dotenv
import os
import tempfile

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Specify allowed origins
allowed_origins = [
    "http://localhost:5174",
    "http://127.0.0.1:5001",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "https://sankalp-client1.vercel.app",
    "https://sankalp-server.onrender.com"
]

# Enable CORS
CORS(app, origins=allowed_origins, supports_credentials=True, 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Initialize Deepgram client
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY_nova2")
if not DEEPGRAM_API_KEY:
    raise ValueError("No DEEPGRAM_API_KEY_nova2 found in environment variables")

deepgram = DeepgramClient(DEEPGRAM_API_KEY)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Use tempfile to avoid file locking issues
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
        file.save(temp_audio.name)
        temp_path = temp_audio.name

    try:
        # Configure Deepgram options
        options = PrerecordedOptions(
            model="nova-2",
            language="en",
            smart_format=True,
        )

        # Read the saved file
        with open(temp_path, "rb") as audio:
            # Use the correct API call for your SDK version
            response = deepgram.listen.prerecorded.v("1").transcribe_file(
                {"buffer": audio.read()},
                options
            )
            
            # Clean up the file
            try:
                os.unlink(temp_path)
            except:
                pass
            
            # Return the transcription
            if hasattr(response, 'results') and response.results.channels:
                return jsonify({
                    "transcription": response.results.channels[0].alternatives[0].transcript,
                    "confidence": response.results.channels[0].alternatives[0].confidence,
                    "words": [word.word for word in response.results.channels[0].alternatives[0].words]
                }), 200
            else:
                return jsonify({"error": "No transcription results returned"}), 500

    except Exception as e:
        # Clean up file if it exists
        if os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass
            
        print(f"Error during transcription: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)