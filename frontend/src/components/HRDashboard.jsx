import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import TeamCalendar from './TeamCalendar';
import * as XLSX from 'xlsx';
import LeaveTypeAdmin from './LeaveTypeAdmin';

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

  const exportToExcel = async () => {
    try {
      const res = await API.get('/leave-requests');
      const allRequests = res.data || [];
      
      const approvedRequests = allRequests.filter(r => r.status === 'approved');

      const dataToExport = approvedRequests.map(req => ({
        'Employé': req.user?.name || 'N/A',
        'Email': req.user?.email || 'N/A',
        'Type de Congé': req.leave_type?.name || 'N/A',
        'Date Début': formatDate(req.start_date),
        'Date Fin': formatDate(req.end_date),
        'Jours Déduits': req.calculated_days,
        'Motif': req.reason || '-',
        'Statut': 'Approuvé'
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport_Paie_Conges");

      XLSX.writeFile(workbook, `Rapport_Conges_Paie_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Erreur d'exportation:", err);
      alert("Erreur lors de l'exportation des données.");
    }
  };

  if (loading) return <p className="text-gray-500 p-4">Chargement des demandes en attente de validation RH...</p>;

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-purple-800">Espace RH : Validation Finale & Gestion Paie</h2>
          
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm"
          >
             Exporter Rapport Paie (Excel)
          </button>
        </div>

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
                  <th className="p-3">Motif & Pièce</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const filePath = req.proof_path || req.document_path;
                  return (
                    <tr key={req.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-semibold text-gray-800">{req.user?.name}</td>
                      <td className="p-3 text-purple-600 font-medium">{req.leave_type?.name}</td>
                      <td className="p-3 text-gray-600">
                        Du {formatDate(req.start_date)} au {formatDate(req.end_date)}
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
                      <td className="p-3 text-gray-500">
                        <div>{req.reason || '-'}</div>
                        {filePath && (
                          <a 
                            href={`http://localhost:8000/storage/${filePath}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline mt-1 font-semibold"
                          >
                            📄 Voir Pièce
                          </a>
                        )}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeaveTypeAdmin />
      <TeamCalendar />
    </div>
  );
}