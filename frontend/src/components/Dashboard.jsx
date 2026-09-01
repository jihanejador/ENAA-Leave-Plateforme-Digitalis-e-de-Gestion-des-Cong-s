import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    API.get('/me')
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!user) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue, {user.name}</h1>
      <p className="text-gray-600 mb-6">Rôle: <span className="font-semibold uppercase">{user.role}</span></p>

      <h2 className="text-xl font-bold mb-4 text-gray-700">Vos Soldes de Congés</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user.leave_balances?.map((balance) => (
          <div key={balance.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-blue-600 mb-2">{balance.leave_type?.name}</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Restant: <strong className="text-green-600 text-lg">{balance.remaining_days} jours</strong></span>
              <span>Utilisé: {balance.used_days} / {balance.allocated_days}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}