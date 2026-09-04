import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function HRDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    try {
      const res = await API.get('/hr/leave-requests/pending');
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
      await API.patch(`/hr/leave-requests/${id}/status`, { status });
      alert(`Demande ${status === 'approved' ? 'validée définitivement' : 'refusée'} par le RH!`);
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la validation RH.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  if (loading) return <p className="text-gray-500 p-4">Chargement des demandes en attente de validation RH...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-purple-800">Espace RH : Validation Finale des Congés</h2>

      {requests.length === 0 ? (
        <p className="text-gray-500 py-4">Aucune demande en attente de validation RH.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-purple-50 border-b text-purple-900">
                <th className="p-3">Employé</th>
                <th className="p-3">Type</th>
                <th className="p-3">Période</th>
                <th className="p-3">Remplacement</th>
                <th className="p-3">Jours</th>
                <th className="p-3">Motif</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-semibold text-gray-800">{req.user?.name}</td>
                  <td className="p-3 text-purple-600 font-medium">{req.leave_type?.name}</td>
                  <td className="p-3 text-gray-600">
                    {formatDate(req.start_date)} au {formatDate(req.end_date)}
                  </td>
                  <td className="p-3">
                    {req.course_replacements && req.course_replacements.length > 0 ? (
                      <div className="text-xs">
                        <span className="font-semibold text-purple-600 block">
                          {req.course_replacements[0].course_module}
                        </span>
                        <span className="text-gray-500">
                          Par: {req.course_replacements[0].replacement_user?.name || 'N/A'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Aucun</span>
                    )}
                  </td>
                  <td className="p-3 font-bold">{req.calculated_days} j</td>
                  <td className="p-3 text-gray-500">{req.reason || '-'}</td>
                  <td className="p-3 flex gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'approved')} 
                      className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-700 transition"
                    >
                      Valider DÉFINITIVEMENT
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