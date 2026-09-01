import React, { useState } from 'react';
import API from '../api/axios';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('employee@enaa.ma');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Connexion</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
            required 
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
            required 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
          Se connecter
        </button>
      </form>
    </div>
  );
}