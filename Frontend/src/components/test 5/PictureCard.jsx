import React from "react";

const PictureCard = ({ letter }) => {
  return (
    <div className="w-32 h-32 flex items-center justify-center bg-white rounded-2xl shadow-xl text-4xl font-bold">
      {letter}
    </div>
  );
};

export default PictureCard;
