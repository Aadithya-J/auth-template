import { useEffect } from "react";
import { backendURL } from "../definedURL";
export const useTTS = () => {
  const speak = async (text) => {
    if (!text) return;

    try {
      const response = await fetch(`${backendURL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Failed to get TTS audio");

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      new Audio(audioUrl).play();
    } catch (err) {
      console.error("🔇 TTS error:", err.message);
    }
  };

  return { speak };
};