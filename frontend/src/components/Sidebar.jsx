// components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdOutlineDashboard } from "react-icons/md";
import { PiStudentBold } from "react-icons/pi";
import { FaTasks } from "react-icons/fa";
import { LuSheet } from "react-icons/lu";
import { GoTasklist } from "react-icons/go";
import { VscLayersActive } from "react-icons/vsc";
import { FaChalkboardTeacher } from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";
const Sidebar = () => {
  const { pathname } = useLocation();

  const linkClasses = (path) =>
    `block px-4 py-2 rounded hover:bg-blue-100 w-full rounded-full flex flex-col items-start  transition ${
      pathname === path ? 'bg-blue-100 w-full rounded-full  text-blue-800 font-semibold' : 'text-gray-700'
    }`;

  return (
    <div className="w-64 min-h-screen  font-josefin bg-white  p-4 shadow-sm">
      <h2 className="text-3xl font-bold text-blue-900 mb-6 ">TUTOR PANEL</h2>
      <nav className="space-y-2 flex flex-col items-start">
       <Link to="/dashboard" className={`${linkClasses('/dashboard')} `} style={{ display: 'flex',flexDirection:'row',alignItems:'center' }}><MdOutlineDashboard className="mr-2 text-2xl" />  Dashboard </Link>
        <Link to="/daily-batch" className={`${linkClasses('/daily-batch')} `}  style={{ display: 'flex',flexDirection:'row',alignItems:'center' }}><PiStudentBold className='mr-2 text-2xl'/>Daily Batch</Link>
        <Link to="/add-task" className={linkClasses('/add-task')} style={{ display: 'flex',flexDirection:'row',alignItems:'center' }}><FaTasks className='mr-2 text-2xl'/> Add Task</Link>
        <Link to="/add-sheet" className={linkClasses('/add-sheet')} style={{ display: 'flex',flexDirection:'row',alignItems:'center' }}><LuSheet className='mr-2 text-2xl'/> Add Sheet Links</Link>
        {/* <Link to="/assign-task" className={linkClasses('/assign-task')} style={{ display: 'flex',flexDirection:'row',alignItems:'center' }}><GoTasklist className='mr-2 text-2xl'/> Assign Tasks</Link> */}
        <Link to="/curr-activity" className={linkClasses('/curr-activity')} style={{ display: 'flex',flexDirection:'row',alignItems:'center' }}><VscLayersActive className='mr-2 text-2xl'/> Curriculum Activity</Link>  
        <Link to="/new-tutor" className={linkClasses('/new-tutor')} style={{ display: 'flex',flexDirection:'row',alignItems:'center' }}> <FaChalkboardTeacher className='mr-2 text-2xl'/>Create New Tutor</Link>
        <Link to="/logout" className={linkClasses('/logout')} style={{ display: 'flex',flexDirection:'row',alignItems:'center' }}> <RiLogoutCircleRLine className='mr-2 text-2xl'/>Logout</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
