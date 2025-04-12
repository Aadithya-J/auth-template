import React from "react";

const PictureCard = ({ letter }) => {
  return (
    <div className="w-64 h-64 flex items-center justify-center bg-white rounded-2xl shadow-xl text-6xl font-bold">
      {letter}
    </div>
  );
};

export default PictureCard;
