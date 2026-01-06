import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, googleLogin } from '../api';
import AuthContext from '../components/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Normal login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginUser({ workEmail: email, password });
      const { token, user } = response;

      login({ token, user });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  // Google login
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await googleLogin(credentialResponse.credential);
      const { token, user } = response;

      login({ token, user });
      navigate('/dashboard');
    } catch (err) {
      setError('Google login failed');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: `url('./images/homePageImg.png')` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-10 rounded-2xl w-full max-w-md text-white">

        <h2 className="text-3xl font-bold text-center mb-6">
          Tutor Portal Login
        </h2>

        {/* Google Login */}
       

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-200">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-yellow-500 text-black py-2 rounded-full font-semibold"
          >
            Login
          </button>
        </form>
        <div className="text-center text-gray-300 my-4">OR</div>
        <div className="flex justify-center w-full">  <div className="rounded-xl shadow-md border border-gray-300 p-1">
    <GoogleLogin
      onSuccess={handleGoogleLogin}
      onError={() => setError("Google login failed")}
      theme="outline"
      size="large"
      width="300"
      text="continue_with"
      shape="pill"
      logo_alignment="center"
    />
  </div>
  </div>

      </div>
    </div>
  );
};

export default Login;
