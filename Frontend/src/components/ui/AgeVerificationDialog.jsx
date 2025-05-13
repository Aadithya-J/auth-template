import React, { useState, useEffect } from 'react';
import { FaChild, FaCheck, FaArrowLeft } from 'react-icons/fa';

// Accept onRejected prop
const AgeVerificationDialog = ({ onVerified, onRejected }) => { 
  const [isOpen, setIsOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = (hasPermission) => {
    setIsAnimating(true);
    setIsVisible(false);
    
    // Wait for exit animation before calling callbacks
    setTimeout(() => { 
      setIsOpen(false); // Ensure dialog state is updated
      if (hasPermission) {
        if (onVerified) onVerified(); 
      } else {
        // Call onRejected when "No" is clicked
        if (onRejected) onRejected(); 
      }
    }, 300); // Match animation duration
  };

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div 
        className={`w-full max-w-md p-6 mx-4 bg-white rounded-2xl shadow-xl transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        } ${isAnimating ? 'scale-95 opacity-0' : ''}`}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChild className="w-8 h-8 text-blue-500" /> 
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Confirm Permission</h2>
          <div className="space-y-3 mb-6">
            <p className="text-blue-600 text-lg">Are you over 18 or have parental permission to use this site?</p>
            <p className="text-blue-400 text-sm">We need to ensure compliance with safety regulations.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button 
              onClick={() => handleConfirm(true)}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:-translate-y-1 focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-2 group"
            >
              <FaCheck className="group-hover:rotate-12 transition-transform" />
              <span>Yes, I Confirm</span>
            </button>
            
            <button 
              onClick={() => handleConfirm(false)} // Calls handleConfirm(false) -> onRejected()
              className="flex-1 px-6 py-3 bg-white text-blue-600 border-2 border-blue-100 rounded-xl font-medium transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>No, I Need to Leave</span>
            </button>
          </div>
          
          <div className="mt-6 text-blue-300 text-sm">
            <p>Protecting users is our priority.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationDialog;