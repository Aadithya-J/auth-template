import React from 'react';

const Button = ({ label, onClick }) => {
  return (
    <div className='flex justify-center items-center h-full'>
      <button
        onClick={onClick}
        className="flex justify-center items-center w-full h-full text-[13px] font-roboto text-black border-gray-700 hover:text-black font-bold border-2 border-gray-500 hover:border-black py-2 px-4 bg-transparent hover:v.png hover:bg-[#FFFFFF] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:bg-[#F89880] rounded-md transition-all duration-300"
      >
        {label}
      </button>
    </div>
  );
};

export default Button;
