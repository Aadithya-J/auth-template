/*import React from "react";
import { motion } from "framer-motion";
import images from "../../Data/imageData"; // Importing images array

const PictureCard = ({ imageName }) => {
  // Find the correct image object
  const imageObj = images.find((img) => img.imageUrl.endsWith(imageName));

  if (!imageObj) {
    return <p className="text-red-500 text-center">Image not found!</p>;
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="w-full max-w-md mx-auto mb-8"
    >
      <img
        src={imageObj.imageUrl}
        alt={imageObj.name || "Image"}
        className="rounded-3xl border-4 border-kid-orange shadow-lg w-full h-full object-cover"
      />
    </motion.div>
  );
};

export default PictureCard;
*/

import React from "react";
import { motion } from "framer-motion";
import images from "../../Data/imageData"; // Importing images array

const PictureCard = ({ imageName }) => {
  // Find the correct image object (case-insensitive matching)
  const imageObj = images.find((img) => 
    img.imageUrl.toLowerCase().endsWith(imageName.toLowerCase())
  );

  if (!imageObj) {
    return (
      <div className="flex flex-col items-center">
        <p className="text-red-500 text-center mb-2">Image not found!</p>
        <img 
          src="/path-to-placeholder-image.jpg" 
          alt="Placeholder" 
          className="rounded-3xl border-4 border-gray-300 shadow-lg w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="w-full max-w-md mx-auto mb-8"
    >
      <img
        src={imageObj.imageUrl}
        alt={imageObj.name || "Image"}
        loading="lazy"
        className="rounded-3xl border-4 border-kid-orange shadow-lg w-full h-full object-cover"
      />
    </motion.div>
  );
};

export default PictureCard;
