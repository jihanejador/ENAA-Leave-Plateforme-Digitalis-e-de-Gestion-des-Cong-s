import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    try {
      const res = await API.get('/manager/leave-requests/pending');
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await API.patch(`/manager/leave-requests/${id}/status`, { status });
      alert(`Demande ${status === 'approved' ? 'approuvée' : 'refusée'} avec succès!`);
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du statut.');
    }
  };

  if (loading) return <p className="text-gray-500">Chargement des demandes...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Validation des Demandes de Congé</h2>

      {requests.length === 0 ? (
        <p className="text-gray-500 py-4">Aucune demande en attente de validation.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600">
                <th className="p-3">Employé</th>
                <th className="p-3">Type</th>
                <th className="p-3">Période</th>
                <th className="p-3">Jours</th>
                <th className="p-3">Motif</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50 transition text-sm">
                  <td className="p-3 font-semibold text-gray-800">{req.user?.name}</td>
                  <td className="p-3 text-blue-600 font-medium">{req.leave_type?.name}</td>
                  <td className="p-3 text-gray-600">{req.start_date} au {req.end_date}</td>
                  <td className="p-3 font-bold">{req.calculated_days} j</td>
                  <td className="p-3 text-gray-500">{req.reason || '-'}</td>
                  <td className="p-3 flex gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'approved')} 
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                    >
                      Approuver
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'rejected')} 
                      className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-700 transition"
                    >
                      Refuser
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}