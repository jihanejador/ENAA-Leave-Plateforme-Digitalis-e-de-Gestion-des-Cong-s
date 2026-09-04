import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import LeaveForm from './LeaveForm';
import MyRequests from './MyRequests';
import ManagerDashboard from './ManagerDashboard';
import HRDashboard from './HRDashboard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [refreshRequests, setRefreshRequests] = useState(0);

  const fetchUserData = () => {
    API.get('/me')
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  };

  const handleRequestCreated = () => {
    fetchUserData();
    setRefreshRequests((prev) => prev + 1);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!user) return <div className="p-8 text-center text-gray-600">Chargement...</div>;

  const role = user.role?.toLowerCase();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {user.name}</h1>
        <p className="text-gray-600">
          Rôle: <span className="font-semibold uppercase text-blue-600">{user.role}</span>
        </p>
      </div>

      {role === 'manager' && <ManagerDashboard />}
      {(role === 'rh' || role === 'hr') && <HRDashboard />}
      {role === 'employee' && (
        <>
          <LeaveForm onRequestCreated={handleRequestCreated} />

          <h2 className="text-xl font-bold text-gray-700">Vos Soldes de Congés</h2>
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

          {}
          <MyRequests key={refreshRequests} />
        </>
      )}
    </div>
  );
}