import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function LeaveForm({ onRequestCreated }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    API.get('/me').then(res => setLeaveTypes(res.data.leave_balances || []));
  }, []);

  const currentTypeConfig = leaveTypes.find(b => b.leave_type_id === parseInt(selectedType))?.leave_type;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('leave_type_id', selectedType);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('is_half_day', isHalfDay ? 1 : 0);
    if (reason) formData.append('reason', reason);
    if (proof) formData.append('proof', proof);

    try {
      await API.post('/leave-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Demande envoyée avec succès!');
      if (onRequestCreated) onRequestCreated();
    } catch (err) {
      setMessage('Erreur lors de l\'envoi de la demande.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-6">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Nouvelle Demande de Congé</h2>
      {message && <div className="p-3 bg-blue-50 text-blue-600 rounded mb-4 text-sm">{message}</div>}

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Type de Congé</label>
        <select 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)} 
          className="w-full p-2 border rounded-lg text-black"
          required
        >
          <option value="">-- Sélectionner --</option>
          {leaveTypes.map(b => (
            <option key={b.leave_type.id} value={b.leave_type.id}>{b.leave_type.name} ({b.remaining_days} jours restants)</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Date Début</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded-lg text-black" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Date Fin</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded-lg text-black" required />
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <input type="checkbox" id="halfDay" checked={isHalfDay} onChange={(e) => setIsHalfDay(e.target.checked)} className="mr-2" />
        <label htmlFor="halfDay" className="text-sm text-gray-700">Demi-journée</label>
      </div>

      {currentTypeConfig?.requires_proof && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <label className="block text-sm font-semibold mb-1 text-yellow-800">Pièce Justificative (Obligatoire)</label>
          <input type="file" onChange={(e) => setProof(e.target.files[0])} className="w-full text-sm text-gray-600" required />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Motif</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border rounded-lg text-black" rows="2"></textarea>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">
        Soumettre la demande
      </button>
    </form>
  );
}