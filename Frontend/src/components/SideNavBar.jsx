import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/daira-logo.png"; // Replace with your logo.
import profile from "../assets/default-profile.jpg"; // Replace with the correct image path if needed.
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { MdOutlineContactSupport } from "react-icons/md";
import { FiLogOut } from "react-icons/fi"; // Import logout icon

export default function SideNavBar({ children, onToggle, handleLogout }) {
  const [expand, setExpand] = useState(true);
  const [activeItem, setActiveItem] = useState("/");
  const navigate = useNavigate();

  const userDetails = {
    name: "Rahul Mahesh",
    email: "rahul_mahesh@gmail.com",
  };

  const handleClick = () => {
    navigate("/userprofile", { state: { userDetails } });
  };

  const handleToggle = () => {
    setExpand(!expand);
    onToggle(!expand);
  };

  return (
    <aside className={`h-screen ${expand ? "w-80" : "w-20"} transition-all duration-300 fixed left-0 top-0 z-10 text-gray-600 pr -10`} style={{ backgroundColor: '#121212' }}>
      <nav className="h-full flex flex-col justify-between p-.5">
        <div className={`p-5 flex ${expand ? "justify-between items-center" : "flex-col items-center"}`}>
          <h1
            className={`text-3xl mt-5 pl-2 font-extrabold overflow-hidden transition-all duration-300 ${expand ? "w-48 scale-100 opacity-100" : "w-50 scale-50 opacity-100"}`}
            style={{ color: 'white', letterSpacing: '1px', transformOrigin: 'center' }} // Adjust transform origin to scale from the left
          >
            DAIRA
          </h1>

          <button onClick={handleToggle} className="mt-5">
            {expand ? <FiChevronsLeft size={27} /> : <FiChevronsRight size={27} />}
          </button>
        </div>

        <hr className="border-t-2 border-gray-300 mt-4 mb-8" />

        <ul className="flex flex-col justify-start flex-1 px-2 ">
          {React.Children.map(children, (child) =>
            React.cloneElement(child, { expand, activeItem, setActiveItem })
          )}
        </ul>



        {/* Profile and Logout Section */}
        <div className="border-t p-3 flex items-center justify-center">
          <div className="flex items-center">
            <img
              src={profile}
              // onClick={handleClick}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className={`overflow-hidden transition-all duration-300 ${expand ? "w-48 ml-3" : "w-0"}`}>
              <h4 className="font-semibold text-gray-300 " >{userDetails.name}</h4>
              <span className="text-xs text-gray-300 ">{userDetails.email}</span>
            </div>
            <div>
              {expand && (
                <button
                  onClick={handleLogout}
                  className="flex items-center bg-transparent hover:scale-110 text-[#ff615e] px-3 py-2 rounded-md shadow-lg ml-auto" // `ml-auto` will push the button to the right
                >
                  <FiLogOut size={15} />
                </button>
              )}
            </div>
          </div>


        </div>
      </nav>
    </aside>

  );
}

export function SideNavBarItem({ icon, text, route, expand, activeItem, setActiveItem }) {
  const navigate = useNavigate();

  const handleItemClick = () => {
    setActiveItem(route);
    navigate(route);
  };

  return (
    <li
      onClick={handleItemClick}
      className={`relative flex items-center py-4 pl-6 my-1 pr-2 font-medium rounded-md cursor-pointer transition-transform duration-300 group
        ${activeItem === route ? "bg-gray-200 text-black" : "text-gray-400 hover:bg-gray-300 hover:text-black"} 
        hover:scale-105
      `}
      style={{
        transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
      }}
    >
      <span className={`icon-wrapper ${expand ? "text-base" : "text-lg"}`}>
        {icon}
      </span>
      <span className={`ml-3 text-l font-medium overflow-hidden transition-all duration-300 ${expand ? "w-48 ml-3" : "w-0 opacity-0"}`}>
        {text}
      </span>
    </li>
  );
}
