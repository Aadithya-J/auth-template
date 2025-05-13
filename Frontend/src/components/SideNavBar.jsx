import React from "react";
import { BiBarChartAlt2 } from "react-icons/bi";
import { FaUserFriends } from "react-icons/fa";
import {
  FiChevronsLeft,
  FiChevronsRight,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { HiOutlineClipboardList } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { RiGraduationCapLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import logo from "../assets/daira-logo1.png";
import profile from "../../public/profile-icon.jpg";
import PropTypes from "prop-types";
import { useLanguage } from "../contexts/LanguageContext";
export default function SideNavBar({ onToggle, handleLogout }) {
  const [expand, setExpand] = React.useState(true);
  const [activeItem, setActiveItem] = React.useState("/");
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const userDetails = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
    email: "u@gmail.com",
  };

  const handleToggle = () => {
    setExpand(!expand);
    if (onToggle) onToggle(!expand);
  };

  const handleItemClick = (route) => {
    setActiveItem(route);
    navigate(route);
  };

  return (
    <aside
      className={`h-screen ${
        expand ? "w-64" : "w-28"
      } bg-white flex flex-col transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0`}
    >
      {/* Logo and Toggle */}
      <div
        className={`flex items-center ${
          expand ? "justify-between" : "justify-center"
        } py-5 px-4 relative`}
      >
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Logo" className="w-9 h-9 min-w-[36px]" />
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              expand ? "w-auto opacity-100 ml-3" : "w-0 opacity-0 ml-0"
            }`}
          >
            <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">
              Daira
            </h1>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`text-blue-500 hover:text-blue-700 transition-all duration-300 hover:bg-blue-50 rounded-full p-1 flex items-center justify-center ${
            expand ? "" : "absolute right-4"
          }`}
          aria-label={expand ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expand ? (
            <FiChevronsLeft size={20} />
          ) : (
            <FiChevronsRight size={20} />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="mt-2 px-3">
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expand ? "max-h-6 opacity-100 mb-4" : "max-h-0 opacity-0"
          }`}
        >
          <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
            Main Menu
          </span>
        </div>
        <ul className="space-y-2">
          <SideNavBarItem
            icon={<MdDashboard size={20} />}
            text="Dashboard"
            route="/"
            expand={expand}
            activeItem={activeItem}
            onClick={handleItemClick}
          />
          <SideNavBarItem
            icon={<HiOutlineClipboardList size={20} />}
            text="Students"
            route="/viewstudents"
            expand={expand}
            activeItem={activeItem}
            onClick={handleItemClick}
          />
          <SideNavBarItem
            icon={<HiOutlineClipboardList size={20} />}
            text="Tests"
            route="/taketests"
            expand={expand}
            activeItem={activeItem}
            onClick={handleItemClick}
          />

          <SideNavBarItem
            icon={<BiBarChartAlt2 size={20} />}
            text="Analytics"
            route="/analytics"
            expand={expand}
            activeItem={activeItem}
            onClick={handleItemClick}
          />
        </ul>
      </div>
      <div className="mt-4 px-3">
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expand ? "max-h-6 opacity-100 mb-2" : "max-h-0 opacity-0"
          }`}
        >
          <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
            Language
          </span>
        </div>
        <div className={`flex ${expand ? "gap-2" : "flex-col items-center"}`}>
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              language === "en"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {expand ? "English" : "EN"}
          </button>
          <button
            onClick={() => setLanguage("ta")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              language === "ta"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {expand ? "தமிழ்" : "TA"}
          </button>
        </div>
      </div>
      {/* Settings & Profile Section */}
      <div className="mt-auto px-3">
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            expand ? "max-h-6 opacity-100 mb-3 pt-4" : "max-h-0 opacity-0"
          }`}
        >
          <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
            Account
          </span>
        </div>

        <div className="border-t border-gray-100 pt-3 pb-2">
          <div
            className={`flex items-center ${expand ? "" : "justify-center"}`}
          >
            <div className="relative">
              <img
                src={profile}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-100"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                expand ? "max-w-[160px] opacity-100 ml-3" : "max-w-0 opacity-0"
              }`}
            >
              <h2 className="font-medium text-gray-800 text-sm line-clamp-1">
                {userDetails.name}
              </h2>
              <span className="text-gray-500 text-xs line-clamp-1">
                {userDetails.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center text-red-500 hover:text-red-600 transition-colors duration-300 
            ${
              expand
                ? "px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg justify-start w-full"
                : "mx-auto justify-center w-10 h-10 rounded-full hover:bg-red-50"
            }`}
            aria-label="Logout"
          >
            <FiLogOut size={18} />
            <span
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                expand ? "max-w-[80px] opacity-100 ml-3" : "max-w-0 opacity-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

SideNavBar.propTypes = {
  onToggle: PropTypes.func,
  handleLogout: PropTypes.func.isRequired,
};

export function SideNavBarItem({
  icon,
  text,
  route,
  expand,
  activeItem,
  onClick,
}) {
  const isActive = activeItem === route;

  return (
    <li
      className={`flex items-center ${
        expand ? "px-3" : "justify-center"
      } py-3 rounded-lg cursor-pointer transition-all duration-300 
      ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm"
          : "text-gray-600 hover:bg-blue-50"
      }`}
      onClick={() => onClick(route)}
    >
      <div
        className={`${
          isActive ? "text-white" : "text-blue-500"
        } transition-colors duration-300`}
      >
        {icon}
      </div>
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expand ? "max-w-[160px] opacity-100 ml-3" : "max-w-0 opacity-0"
        }`}
      >
        <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>
          {text}
        </span>
      </div>
    </li>
  );
}

SideNavBarItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  expand: PropTypes.bool.isRequired,
  activeItem: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
