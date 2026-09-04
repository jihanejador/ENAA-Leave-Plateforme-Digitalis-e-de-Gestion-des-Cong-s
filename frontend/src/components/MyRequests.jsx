import React, { useEffect, useState } from 'react';
import API from '../api/axios';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await API.get('/leave-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_manager':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded border border-yellow-300">En attente (Manager)</span>;
      case 'pending_hr':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded border border-blue-300">En attente (RH)</span>;
      case 'approved':
        return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded border border-green-300">Approuvé</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded border border-red-300">Refusé</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded">{status}</span>;
    }
  };

  if (loading) return <div className="p-4 text-center">Chargement des demandes...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Mes Demandes de Congé</h2>
      
      {requests.length === 0 ? (
        <p className="text-gray-500">Aucune demande trouvée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 border">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-3 border-b">Type</th>
                <th className="p-3 border-b">Période</th>
                <th className="p-3 border-b">Jours</th>
                <th className="p-3 border-b">Remplacement</th>
                <th className="p-3 border-b">Statut</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">
                    {req.leave_type?.name || 'N/A'}
                  </td>
                  <td className="p-3">
                    Du {formatDate(req.start_date)} au {formatDate(req.end_date)}
                    {req.is_half_day && <span className="text-xs text-purple-600 block">(Demi-journée)</span>}
                  </td>
                  <td className="p-3">{req.calculated_days} j</td>
                  <td className="p-3">
                    {req.course_replacements && req.course_replacements.length > 0 ? (
                      <div>
                        <span className="font-semibold">{req.course_replacements[0].course_module}</span>
                        <span className="block text-xs text-gray-500">
                          Par: {req.course_replacements[0].replacement_user?.name || 'N/A'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Aucun</span>
                    )}
                  </td>
                  <td className="p-3">
                    {getStatusBadge(req.status)}
                    {req.status === 'rejected' && req.rejection_reason && (
                      <p className="text-xs text-red-500 mt-1">Raison: {req.rejection_reason}</p>
                    )}
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