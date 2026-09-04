import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function LeaveForm({ onRequestCreated }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState(null);

  const [courseModule, setCourseModule] = useState('');
  const [replacementUserId, setReplacementUserId] = useState('');
  const [proposedCatchupDate, setProposedCatchupDate] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    API.get('/me').then(res => setLeaveTypes(res.data.leave_balances || [])).catch(console.error);
    API.get('/colleagues').then(res => setColleagues(res.data || [])).catch(console.error);
  }, []);

  const currentTypeConfig = leaveTypes.find(b => b.leave_type?.id === parseInt(selectedType))?.leave_type;
  
  const isMaladieOrRequiresProof = Boolean(currentTypeConfig?.requires_proof) || 
    currentTypeConfig?.name?.toLowerCase().includes('maladie');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMaladieOrRequiresProof && !proof) {
      setMessage('Veuillez joindre une pièce justificative.');
      return;
    }

    const formData = new FormData();
    formData.append('leave_type_id', selectedType);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('is_half_day', isHalfDay ? 1 : 0);
    if (reason) formData.append('reason', reason);
    if (proof) formData.append('proof', proof);

    if (courseModule) formData.append('course_module', courseModule);
    if (replacementUserId) formData.append('replacement_user_id', replacementUserId);
    if (proposedCatchupDate) formData.append('proposed_catchup_date', proposedCatchupDate);

    try {
      await API.post('/leave-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Demande envoyée avec succès!');
      setSelectedType('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setProof(null);
      setCourseModule('');
      setReplacementUserId('');
      setProposedCatchupDate('');
      if (onRequestCreated) onRequestCreated();
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de l\'envoi de la demande.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-6 text-left">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Nouvelle Demande de Congé</h2>
      {message && (
        <div className={`p-3 rounded mb-4 text-sm font-medium ${message.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Type de Congé</label>
        <select 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)} 
          className="w-full p-2 border rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">-- Sélectionner --</option>
          {leaveTypes.map(b => b.leave_type && (
            <option key={b.leave_type.id} value={b.leave_type.id}>
              {b.leave_type.name} ({b.remaining_days} jours restants)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Date Début</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="w-full p-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Date Fin</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="w-full p-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500" 
            required 
          />
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <input 
          type="checkbox" 
          id="halfDay" 
          checked={isHalfDay} 
          onChange={(e) => setIsHalfDay(e.target.checked)} 
          className="mr-2 h-4 w-4 text-blue-600 rounded" 
        />
        <label htmlFor="halfDay" className="text-sm text-gray-700 font-medium select-none cursor-pointer">Demi-journée</label>
      </div>

      {}
      <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="text-sm font-bold text-blue-800 mb-3">Continuité Pédagogique (Formateurs)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Module / Cours</label>
            <input 
              type="text" 
              placeholder="ex: React / Laravel" 
              value={courseModule} 
              onChange={(e) => setCourseModule(e.target.value)} 
              className="w-full p-2 border rounded-lg text-sm bg-white text-black" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Remplaçant</label>
            <select 
              value={replacementUserId} 
              onChange={(e) => setReplacementUserId(e.target.value)} 
              className="w-full p-2 border rounded-lg text-sm bg-white text-black"
            >
              <option value="">-- Collègue --</option>
              {colleagues.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">Rattrapage Prévu</label>
            <input 
              type="date" 
              value={proposedCatchupDate} 
              onChange={(e) => setProposedCatchupDate(e.target.value)} 
              className="w-full p-2 border rounded-lg text-sm bg-white text-black" 
            />
          </div>
        </div>
      </div>

      {}
      {isMaladieOrRequiresProof && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <label className="block text-sm font-semibold mb-1 text-yellow-800">
            Pièce Justificative (Obligatoire)
          </label>
          <input 
            type="file" 
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setProof(e.target.files[0])} 
            className="w-full text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200" 
            required 
          />
          {proof && <p className="text-xs text-gray-500 mt-1">Fichier sélectionné: {proof.name}</p>}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1 text-gray-700">Motif</label>
        <textarea 
          value={reason} 
          onChange={(e) => setReason(e.target.value)} 
          className="w-full p-2 border rounded-lg text-black focus:ring-2 focus:ring-blue-500" 
          rows="2"
        ></textarea>
      </div>

      <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold transition shadow-sm">
        Soumettre la demande
      </button>
    </form>
  );
}