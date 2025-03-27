import React from 'react';

const ProgressTracker = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold text-kid-purple">Progress</div>
      
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-yellow-400 transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressTracker;
