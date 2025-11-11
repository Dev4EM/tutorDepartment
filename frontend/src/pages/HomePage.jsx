import React from 'react';
import { Link } from 'react-router-dom';


const HomePage = () => {
  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: `url('./images/tutorBg.png')`,backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'left'}}
    >
      <h1 className="text-4xl font-bold mb-4">Welcome to Tutor Department Portal</h1>
      <p className="text-lg">
        Please <Link to="/login" className="text-yellow-800 underline hover:text-yellow-400">Login</Link> to continue.
      </p>
    </div>
  );
};

export default HomePage;
