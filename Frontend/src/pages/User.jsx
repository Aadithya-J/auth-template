import React from "react";
import { useLocation } from "react-router-dom";

export default function User() {
  const location = useLocation();
  const { name, email } = location.state.userDetails;
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold"> {name}</h1>
      <h3 className="text-2xl font-bold"> {email} </h3>
    </div>
  );
  
}
