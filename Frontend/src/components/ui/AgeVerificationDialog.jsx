import React, { useState, useEffect } from 'react';
import { FaChild, FaCheck, FaArrowLeft } from 'react-icons/fa';

const AgeVerificationDialog = ({ onVerified }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Control entrance animation
  useEffect(() => {
    if (isOpen) {
      
      setTimeout(() => {
        setIsVisible(true);
      }, 50);
    }
  }, [isOpen]);

  const handleConfirm = (hasPermission) => {
    setIsAnimating(true);
    setIsVisible(false);
    
    setTimeout(() => {
      if (hasPermission) {
        setIsOpen(false);
        onVerified();
        // You might want to set a cookie or localStorage here to remember the choice
      } else {
        // Redirect or handle the "No" case
        window.location.href = '/'; // Or your preferred "go back" location
      }
    }, 500);
  };

  // Prevent scrolling when dialog is open
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
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-md transition-all duration-700 ease-out ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div 
        className={`w-full max-w-md p-6 mx-4 bg-white rounded-2xl shadow-xl transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
        } ${isAnimating ? 'scale-95 opacity-0' : ''}`}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChild className="w-8 h-8 text-blue-500 animate-bounce" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Let's Play Safely!</h2>
          
          <div className="space-y-3 mb-6">
            <p className="text-blue-600 text-lg">Are you under 18 years old?</p>
            <p className="text-blue-500">If yes, please make sure you're playing with a grown-up's permission!</p>
            <p className="text-blue-400 text-sm">By clicking "Yes", you agree that you have permission to play here.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button 
              onClick={() => handleConfirm(true)}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-lg hover:-translate-y-1 focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-2 group"
            >
              <FaCheck className="group-hover:rotate-12 transition-transform" />
              <span>Yes, I have permission</span>
            </button>
            
            <button 
              onClick={() => handleConfirm(false)}
              className="flex-1 px-6 py-3 bg-white text-blue-600 border-2 border-blue-100 rounded-xl font-medium transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-1 flex items-center justify-center gap-2 group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>No, take me back</span>
            </button>
          </div>
          
          <div className="mt-6 text-blue-300 text-sm">
            <p>We care about keeping kids safe online!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationDialog;