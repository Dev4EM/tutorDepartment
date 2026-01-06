import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Ensure Tailwind CSS or global styles are here
import { AuthProvider } from './components/AuthContext.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider >
       <GoogleOAuthProvider clientId="992360862281-obc53nr56483i5ajvmae88s6m0384r88.apps.googleusercontent.com">
    <App  />
    </GoogleOAuthProvider>
    </AuthProvider>
  </React.StrictMode>
)
