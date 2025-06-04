import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const { USER_ID, ULCA_API_KEY, INFERENCE_API_KEY, CALLBACK_URL } = process.env;

export const getTTSAudio = async (text) => {
  const payload = {
    pipelineTasks: [
      {
        taskType: "tts",
        config: {
          language: {
            sourceLanguage: "en",
            sourceScriptCode: "Latn",
          },
          serviceId: "ai4bharat/indic-tts-coqui-misc-gpu--t4",
          gender: "female",
          samplingRate: 8000,
        },
      },
    ],
    inputData: {
      input: [
        {
          source: text,
        },
      ],
    },
  };

  const response = await axios.post(CALLBACK_URL, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: INFERENCE_API_KEY,
      userID: USER_ID,
      ulcaApiKey: ULCA_API_KEY,
    },
  });

  const base64Audio =
    response.data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent;

  if (!base64Audio) {
    throw new Error("No audio returned from Bhashini TTS API");
  }

  return Buffer.from(base64Audio, "base64");
};
