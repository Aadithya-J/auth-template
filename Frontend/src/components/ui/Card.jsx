// components/Card.jsx
import React from 'react';
import CardContent from './CardContent';

const Card = ({ name, orientation, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-24 h-28 text-2xl m-2 rounded-2xl bg-gradient-to-br from-yellow-100 to-pink-200 flex flex-col items-center justify-center shadow-md hover:scale-105 transition-transform duration-200 disabled:opacity-50"
    >
      <CardContent name={name} orientation={orientation} />
    </button>
  );
};

export default Card;
