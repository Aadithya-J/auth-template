import { motion } from "framer-motion";
import React from "react";
import images from "../../Data/imageData"; // Importing images array

const PictureCard = ({ imageName }) => {
  // Find the correct image object (case-insensitive matching)
  const imageObj = images.find((img) =>
    img.imageUrl.toLowerCase().endsWith(imageName.toLowerCase())
  );

  const imageContainerClasses = "w-[23rem] h-[23rem] mx-auto";
// Fixed size

  if (!imageObj) {
    return (
      <div className={`flex flex-col items-center ${imageContainerClasses}`}>
        <p className="text-red-500 text-center mb-2">Image not found!</p>
        <div className="w-full h-full">
          <img
            src="/path-to-placeholder-image.jpg"
            alt="Placeholder"
            className="rounded-3xl border-4 border-gray-300 shadow-lg w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className={`mb-8 ${imageContainerClasses}`}
    >
      <div className="w-full h-full">
        <img
          src={imageObj.imageUrl}
          alt={imageObj.name || "Image"}
          loading="lazy"
          className="rounded-3xl border-4 border-kid-orange shadow-lg w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
};

export default PictureCard;

