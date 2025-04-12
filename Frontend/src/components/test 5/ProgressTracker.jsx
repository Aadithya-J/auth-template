import React from "react";

const ProgressTracker = ({ current, total }) => {
  return (
    <div className="my-4 text-lg font-medium text-gray-700">
      Letter {current + 1} of {total}
    </div>
  );
};

export default ProgressTracker;
