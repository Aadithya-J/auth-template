/*import React from 'react';

const ProgressTracker = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold text-kid-purple">Progress</div>
        <div className="text-lg font-semibold text-gray-700">
          {currentStep}/{totalSteps}
        </div>
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
*/
import React from 'react';

const ProgressTracker = ({ currentStep, totalSteps }) => {
  const progress = totalSteps > 0 ? Math.min(100, Math.max(0, (currentStep / totalSteps) * 100)) : 0;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold text-kid-purple">Progress</div>
        <div className="text-lg font-semibold text-gray-700">
          {currentStep}/{totalSteps}
        </div>
      </div>
  
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div  
        className="h-full bg-yellow-400 transition-all duration-300"
        role="progressbar"
        aria-label={`Progress: ${currentStep} out of ${totalSteps}`}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
        style={{ width: `${progress}%` }}
></div>
      </div>
    </div>
  );
  
};

export default ProgressTracker;
