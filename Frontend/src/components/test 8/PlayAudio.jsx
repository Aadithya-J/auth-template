import React, { useState, useRef } from "react";

const PlayAudio = ({ src, onPlayStart }) => {
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Audio could not be loaded.");
  };

  const handleAudioEnd = () => {
    setStatusMessage("Audio has ended.");
  };

  const playAudio = () => {
    setIsButtonClicked(true);
    if (audioRef.current) {
      if (error) {
        return;
      }
      if (isLoading) {
        setStatusMessage("Audio is loading. Please wait.");
        return;
      }
      audioRef.current.play()
        .then(() => {
          setStatusMessage("Audio Playing...");
          onPlayStart();
        })
        .catch(() => {
          setStatusMessage("");
          setError("Failed to play audio.");
        });
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={handleAudioEnd}
      />
      <button onClick={playAudio} className="play-button" disabled={isLoading}>
        {isLoading ? "Loading..." : "Play Audio"}
      </button>
      {isButtonClicked && (
        <div className="message-container">
          {statusMessage && <p className="status-message">{statusMessage}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </>
  );
};

export default PlayAudio;