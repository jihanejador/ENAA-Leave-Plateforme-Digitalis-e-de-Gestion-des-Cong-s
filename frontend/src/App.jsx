import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <div>
          <nav className="bg-white shadow-sm p-4 flex justify-between items-center px-8 border-b">
            <span className="font-bold text-lg text-blue-600">ENAA Leave Portal</span>
            <button 
              onClick={handleLogout} 
              className="text-sm bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-lg transition"
            >
              Déconnexion
            </button>
          </nav>
          <Dashboard />
        </div>
      ) : (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}