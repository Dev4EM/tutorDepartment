import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const ProtectedLayout = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Invalid user data in localStorage');
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* ✅ Top Navbar */}
        <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
     <p></p>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-gray-800 font-medium">{user.name || user.fullName || 'User'}</p>
                <p className="text-gray-500 text-sm">{user.workEmail || user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </header>

        {/* ✅ Page Content */}
        <main className="flex-1 p-6">
          <Outlet /> {/* This renders nested pages like Dashboard */}
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
