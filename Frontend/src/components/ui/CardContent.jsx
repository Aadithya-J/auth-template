
// components/CardContent.jsx
import React from 'react';

const CardContent = ({ name, orientation }) => {
  return (
    <div className="flex flex-col items-center">
      <span role="img" aria-label={name} className="text-4xl">
        {name === 'fish' ? '🐟' : '🐭'}
      </span>
      <div className="text-lg mt-1">
        {orientation === 'left' ? '⬅️' : '➡️'}
      </div>
    </div>
  );
};

export default CardContent;

