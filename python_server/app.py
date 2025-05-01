from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import azure.cognitiveservices.speech as speechsdk
from pydub import AudioSegment
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "eastus")

def convert_to_wav(input_path, output_path):
    try:
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_frame_rate(16000).set_channels(1)
        audio.export(output_path, format="wav", codec="pcm_s16le")
        return True
    except Exception as e:
        print(f"Conversion error: {e}")
        return False

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    original_path = converted_path = None
    try:
        # Save original file
        with tempfile.NamedTemporaryFile(suffix='.tmp', delete=False) as tmp:
            file.save(tmp.name)
            original_path = tmp.name

        # Convert to WAV
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as wav_tmp:
            converted_path = wav_tmp.name
        
        if not convert_to_wav(original_path, converted_path):
            raise ValueError("Audio conversion failed")

        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        speech_config.speech_recognition_language = "en-US"
        speech_config.request_word_level_timestamps()  # Enable detailed results

        audio_config = speechsdk.audio.AudioConfig(filename=converted_path)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, 
                                              audio_config=audio_config)

        result = recognizer.recognize_once_async().get()  # Use async version

        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            # Get confidence from the first alternative
            confidence = None
            if hasattr(result, 'properties') and result.properties.get(speechsdk.PropertyId.SpeechServiceResponse_JsonResult):
                import json
                json_result = json.loads(result.properties[speechsdk.PropertyId.SpeechServiceResponse_JsonResult])
                if json_result.get('NBest') and len(json_result['NBest']) > 0:
                    confidence = json_result['NBest'][0]['Confidence']

            return jsonify({
                "transcription": result.text,
                "confidence": confidence
            })
        else:
            error_details = result.cancellation_details.error_details if result.cancellation_details else "Unknown error"
            raise Exception(f"Recognition failed: {error_details}")

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({
            "error": "Transcription failed",
            "details": str(e)
        }), 500

    finally:
        for path in [original_path, converted_path]:
            if path and os.path.exists(path):
                try:
                    os.unlink(path)
                except:
                    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)






# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from deepgram import DeepgramClient, PrerecordedOptions
# from dotenv import load_dotenv
# import os
# import tempfile

# # Load environment variables
# load_dotenv()

# app = Flask(__name__)

# # Specify allowed origins
# allowed_origins = [
#     "http://localhost:5174",
#     "http://127.0.0.1:5001",
#     "http://127.0.0.1:3000",
#     "http://localhost:5173",
#     "https://sankalp-client1.vercel.app",
#     "https://sankalp-server.onrender.com",
#     "https://jiveesha.vercel.app"
# ]

# # Enable CORS
# CORS(app, origins=allowed_origins, supports_credentials=True, 
#      methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# # Initialize Deepgram client
# DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY_nova2")
# if not DEEPGRAM_API_KEY:
#     raise ValueError("No DEEPGRAM_API_KEY_nova2 found in environment variables")

# deepgram = DeepgramClient(DEEPGRAM_API_KEY)

# @app.route('/transcribe', methods=['POST'])
# def transcribe_audio():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file uploaded"}), 400

#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({"error": "No selected file"}), 400

#     # Use tempfile to avoid file locking issues
#     with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
#         file.save(temp_audio.name)
#         temp_path = temp_audio.name

#     try:
#         # Configure Deepgram options
#         options = PrerecordedOptions(
#             model="nova-2",
#             language="en",
#             smart_format=True,
#         )

#         # Read the saved file
#         with open(temp_path, "rb") as audio:
#             # Use the correct API call for your SDK version
#             response = deepgram.listen.prerecorded.v("1").transcribe_file(
#                 {"buffer": audio.read()},
#                 options
#             )
            
#             # Clean up the file
#             try:
#                 os.unlink(temp_path)
#             except:
#                 pass
            
#             # Return the transcription
#             if hasattr(response, 'results') and response.results.channels:
#                 return jsonify({
#                     "transcription": response.results.channels[0].alternatives[0].transcript,
#                     "confidence": response.results.channels[0].alternatives[0].confidence,
#                     "words": [word.word for word in response.results.channels[0].alternatives[0].words]
#                 }), 200
#             else:
#                 return jsonify({"error": "No transcription results returned"}), 500

#     except Exception as e:
#         # Clean up file if it exists
#         if os.path.exists(temp_path):
#             try:
#                 os.unlink(temp_path)
#             except:
#                 pass
            
#         print(f"Error during transcription: {e}")
#         return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     port = int(os.environ.get("PORT", 5001))  
#     app.run(host='0.0.0.0', port=port)


# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import whisper
# import os

# app = Flask(__name__)

# # Specify allowed origins
# allowed_origins = [
#     "http://localhost:5174",
#     "http://127.0.0.1:5001",
#     "http://127.0.0.1:3000",
#     "http://localhost:5173",
#     "https://sankalp-client1.vercel.app",
#     "https://sankalp-server.onrender.com"
# ]

# # Enable CORS for specific origins and methods including OPTIONS
# CORS(app, origins=allowed_origins, supports_credentials=True, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

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

#     try:
#         # Transcribe the audio using Whisper
#         result = model.transcribe(file_path, fp16=False, language="en")
#         # Optionally remove the uploaded file after transcription
#         os.remove(file_path)
#         return jsonify({"transcription": result['text']}), 200
#         #test return
#         # return jsonify({"transcription": "tree little milk egg book school sit frog plaing bin fower road clack"}), 200
#     except Exception as e:
#         # Catch any errors from Whisper/FFmpeg and log them
#         print(f"Error during transcription: {e}")
#         return jsonify({"error": str(e)}), 500

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5001)