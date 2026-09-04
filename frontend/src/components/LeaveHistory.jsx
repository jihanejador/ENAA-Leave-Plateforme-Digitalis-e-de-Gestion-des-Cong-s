import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function LeaveHistory() {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const meRes = await API.get('/me');
      setBalances(meRes.data.leave_balances || []);

      const reqRes = await API.get('/leave-requests');
      setRequests(reqRes.data || []);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approuvée</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Refusée</span>;
      case 'pending_manager':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">En attente Manager</span>;
      case 'pending_hr':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">En attente RH</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Chargement de votre historique...</div>;

  return (
    <div className="space-y-6 text-left">
      {}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4"> Mon Solde de Congés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {balances.map((b) => (
            <div key={b.id} className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">{b.leave_type?.name}</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">
                {b.remaining_days} <span className="text-sm font-normal text-gray-600">jours</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4"> Historique de mes Demandes</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune demande effectuée pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600">
                  <th className="p-3">Type</th>
                  <th className="p-3">Période</th>
                  <th className="p-3">Jours</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Motif</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-800">{req.leave_type?.name}</td>
                    <td className="p-3 text-gray-600">
                      Du {req.start_date?.split('T')[0]} au {req.end_date?.split('T')[0]}
                    </td>
                    <td className="p-3 font-bold text-gray-700">{req.calculated_days} j</td>
                    <td className="p-3">{getStatusBadge(req.status)}</td>
                    <td className="p-3 text-gray-500">{req.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}