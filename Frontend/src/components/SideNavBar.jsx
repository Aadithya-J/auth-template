// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "../assets/daira-logo.png"; // Replace with your logo.
// import profile from "../assets/default-profile.jpg"; // Replace with the correct image path if needed.
// import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
// import { MdOutlineContactSupport } from "react-icons/md";
// import { FiLogOut } from "react-icons/fi"; // Import logout icon

// export default function SideNavBar({ children, onToggle, handleLogout }) {
//   const [expand, setExpand] = useState(true);
//   const [activeItem, setActiveItem] = useState("/");
//   const navigate = useNavigate();


//   const userDetails = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : { name: "user", email: "u@gmail.com" };  // const userDetails = { name: "user", email: "

//   const handleClick = () => {
//     navigate("/userprofile", { state: { userDetails } });
//   };

//   const handleToggle = () => {
//     setExpand(!expand);
//     onToggle(!expand);
//   };

//   return (
//     <aside className={`h-screen ${expand ? "w-80" : "w-20"} transition-all duration-300 fixed left-0 top-0 z-10 text-gray-600 pr -10`} style={{ backgroundColor: '#121212' }}>
//       <nav className="h-full flex flex-col justify-between p-.5">
//         <div className={`p-5 flex ${expand ? "justify-between items-center" : "flex-col items-center"}`}>
//           <h1
//           onClick={() => navigate("/")}
//             className={`text-3xl mt-5 pl-2 cursor-pointer font-extrabold overflow-hidden transition-all duration-300 ${expand ? "w-48 scale-100 opacity-100" : "w-50 scale-50 opacity-100"}`}
//             style={{ color: 'white', letterSpacing: '1px', transformOrigin: 'center' }} // Adjust transform origin to scale from the left
//           >
//             DAIRA
//           </h1>

//           <button onClick={handleToggle} className="mt-5">
//             {expand ? <FiChevronsLeft size={27} /> : <FiChevronsRight size={27} />}
//           </button>
//         </div>

//         <hr className="border-t-2 border-gray-300 mt-4 mb-8" />

//         <ul className="flex flex-col justify-start flex-1 px-2 ">
//           {React.Children.map(children, (child) =>
//             React.cloneElement(child, { expand, activeItem, setActiveItem })
//           )}
//         </ul>



//         {/* Profile and Logout Section */}
//         <div className="border-t p-3 flex items-center justify-center">
//           <div className="flex items-center">
//             <img
//               src={profile}
//               // onClick={handleClick}
//               alt="Profile"
//               className="w-10 h-10 rounded-full"
//             />
//             <div className={`overflow-hidden transition-all duration-300 ${expand ? "w-48 ml-3" : "w-0"}`}>
//               <span className="text-gray-300 text-sm ">Logged in as </span>
//               <h4 className="font-semibold text-gray-300 " >{userDetails.name}</h4>
//               <span className="text-xs text-gray-300 ">{userDetails.email}</span>
//             </div>
//             <div>
//               {expand && (
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center bg-transparent hover:scale-110 text-[#ff615e] px-3 py-2 rounded-md shadow-lg ml-auto" // `ml-auto` will push the button to the right
//                 >
//                   <FiLogOut size={15} />
//                 </button>
//               )}
//             </div>
//           </div>


//         </div>
//       </nav>
//     </aside>

//   );
// }

// export function SideNavBarItem({ icon, text, route, expand, activeItem, setActiveItem }) {
//   const navigate = useNavigate();

//   const handleItemClick = () => {
//     setActiveItem(route);
//     navigate(route);
//   };

//   return (
//     <li
//       onClick={handleItemClick}
//       className={`relative flex items-center py-4 pl-6 my-1 pr-2 font-medium rounded-md cursor-pointer transition-transform duration-300 group
//         ${activeItem === route ? "bg-gray-200 text-black" : "text-gray-400 hover:bg-gray-300 hover:text-black"} 
//         hover:scale-105
//       `}
//       style={{
//         transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
//       }}
//     >
//       <span className={`icon-wrapper ${expand ? "text-base" : "text-lg"}`}>
//         {icon}
//       </span>
//       <span className={`ml-3 text-l font-medium overflow-hidden transition-all duration-300 ${expand ? "w-48 ml-3" : "w-0 opacity-0"}`}>
//         {text}
//       </span>
//     </li>
//   );
// }








import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiSettings, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { RiGraduationCapLine } from "react-icons/ri";
import { HiOutlineClipboardList } from "react-icons/hi";
import { BiBarChartAlt2 } from "react-icons/bi";
import { FaUserFriends } from "react-icons/fa";
import logo from "../assets/daira-logo.png";
import profile from "../assets/default-profile.jpg";

export default function SideNavBar({ onToggle, handleLogout }) {
  const [expand, setExpand] = useState(true);
  const [activeItem, setActiveItem] = useState("/");
  const navigate = useNavigate();

  const userDetails = JSON.parse(localStorage.getItem("user")) || { name: "User", email: "u@gmail.com" };

  const handleToggle = () => {
    setExpand(!expand);
    if (onToggle) onToggle(!expand);
  };

  const handleItemClick = (route) => {
    setActiveItem(route);
    navigate(route);
  };

  return (
    <aside className={`h-screen ${expand ? "w-64" : "w-20"} bg-white shadow-md flex flex-col p-4 transition-all duration-300 fixed left-0 top-0`}> 
      {/* Logo and Toggle */}
      <div className={`flex items-center ${expand ? "justify-between" : "justify-center"} mb-6`}>
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}> 
          <img src={logo} alt="Logo" className="w-8 h-8" />
          {expand && <h1 className="text-lg font-bold text-gray-900 ml-2">Daira</h1>}
        </div>
        <button onClick={handleToggle} className="text-gray-600">
          {expand ? <FiChevronsLeft size={20} /> : <FiChevronsRight size={20} />}
        </button>
      </div>

      {/* Navigation Items */}
      <ul className="flex-1 space-y-2">
        <SideNavBarItem icon={<MdDashboard size={20} />} text="Dashboard" route="/" expand={expand} activeItem={activeItem} onClick={handleItemClick} />
        <SideNavBarItem icon={<RiGraduationCapLine size={20} />} text="Classroom" route="/myclass" expand={expand} activeItem={activeItem} onClick={handleItemClick} />
        <SideNavBarItem icon={<HiOutlineClipboardList size={20} />} text="Tests" route="/taketests" expand={expand} activeItem={activeItem} onClick={handleItemClick} />
        <SideNavBarItem icon={<BiBarChartAlt2 size={20} />} text="Analytics" route="/analytics" expand={expand} activeItem={activeItem} onClick={handleItemClick} />
        <SideNavBarItem icon={<FaUserFriends size={20} />} text="Students" route="/selectstudent" expand={expand} activeItem={activeItem} onClick={handleItemClick} />
      </ul>

      {/* Profile & Logout */}
      <div className="border-t pt-4 flex items-center">
        <img src={profile} alt="Profile" className="w-10 h-10 rounded-full" />
        {expand && (
          <div className="ml-3 text-sm">
            <h4 className="font-semibold text-gray-900">{userDetails.name}</h4>
            <span className="text-gray-500 text-xs">{userDetails.email}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <SideNavBarItem icon={<FiSettings size={20} />} text="Settings" route="/settings" expand={expand} activeItem={activeItem} onClick={handleItemClick} />
        <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-500 p-2 w-full">
          <FiLogOut size={20} />
          {expand && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export function SideNavBarItem({ icon, text, route, expand, activeItem, onClick }) {
  return (
    <li
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${activeItem === route ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
      onClick={() => onClick(route)}
    >
      {icon}
      {expand && <span className="ml-3 text-sm font-medium">{text}</span>}
    </li>
  );
}
