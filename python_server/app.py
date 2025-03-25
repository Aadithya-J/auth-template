# from flask import Flask, request, jsonify
# import whisper
# import os

# app = Flask(__name__)

# # Load the Whisper model
# model = whisper.load_model("small")

# @app.route('/transcribe', methods=['POST'])
# def transcribe_audio():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files['file']
#     file_path = os.path.join('uploads', file.filename)
#     file.save(file_path)

#     # Transcribe the audio using Whisper
#     result = model.transcribe(file_path)

#     # Optionally remove the uploaded file after transcription
#     os.remove(file_path)

#     return jsonify({"transcription": result['text']}), 200

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5001)





# from flask import Flask, request, jsonify
# import whisper
# import os
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# # Load the Whisper model
# model = whisper.load_model("small")

# # Ensure the 'uploads' directory exists
# UPLOAD_FOLDER = 'uploads'
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

# @app.route('/transcribe', methods=['POST'])
# def transcribe_audio():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files['file']
#     file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
#     # Save the file to the 'uploads' directory
#     file.save(file_path)

#     # Transcribe the audio using Whisper
#     result = model.transcribe(file_path)

#     # Optionally remove the uploaded file after transcription
#     os.remove(file_path)

#     return jsonify({"transcription": result['text']}), 200

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5001)






from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import os

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

# Enable CORS for specific origins and methods including OPTIONS
CORS(app, origins=allowed_origins, supports_credentials=True, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Load the Whisper model
model = whisper.load_model("small")

# Ensure the 'uploads' directory exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    # Save the file to the 'uploads' directory
    file.save(file_path)

    try:
        # Transcribe the audio using Whisper
        result = model.transcribe(file_path, fp16=False, language="en")
        # Optionally remove the uploaded file after transcription
        os.remove(file_path)
        return jsonify({"transcription": result['text']}), 200
        #test return
        # return jsonify({"transcription": "tree little milk egg book school sit frog plaing bin fower road clack"}), 200
    except Exception as e:
        # Catch any errors from Whisper/FFmpeg and log them
        print(f"Error during transcription: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)