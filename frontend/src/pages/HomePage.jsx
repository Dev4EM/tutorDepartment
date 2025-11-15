import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div
      className="h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: `url('./images/homePageImg.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">

        <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-lg border border-white/20">
          <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
            Tutor Department Portal
          </h1>

          <p className="text-lg text-gray-200 mb-8">
            Your gateway to academic support and tutor management.
          </p>

          <Link
            to="/login"
            className="px-8 py-3 bg-yellow-500 text-black font-semibold rounded-full shadow-lg transition duration-300 hover:bg-yellow-400 hover:scale-105"
          >
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
