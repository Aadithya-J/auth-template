// components/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="relative w-4/5 max-w-md mx-auto my-3 h-6 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-300 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
      <span className="absolute w-full text-center text-white font-semibold text-sm top-0">
        {current} / {total}
      </span>
    </div>
  );
};

export default ProgressBar;