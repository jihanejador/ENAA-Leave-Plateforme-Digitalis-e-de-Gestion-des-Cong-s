import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function LeaveTypeAdmin() {
  const [types, setTypes] = useState([]);
  const [name, setName] = useState('');
  const [defaultDays, setDefaultDays] = useState(0);
  const [requiresProof, setRequiresProof] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await API.get('/leave-types');
      setTypes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/leave-types', {
        name,
        default_days: defaultDays,
        requires_proof: requiresProof ? 1 : 0
      });
      alert('Type de congé ajouté avec succès !');
      setName('');
      setDefaultDays(0);
      setRequiresProof(false);
      fetchTypes();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création.');
    }
  };

  if (loading) return <p className="text-gray-500 p-4 text-left">Chargement des types...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left space-y-6">
      <h2 className="text-xl font-bold text-gray-800">⚙️ Gestion des Types de Congés & Quotas</h2>

      {/* Formulaire Ajouter */}
      <form onSubmit={handleCreate} className="p-4 bg-gray-50 rounded-lg border space-y-4">
        <h3 className="text-sm font-bold text-gray-700">Ajouter un nouveau type de congé</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600">Nom du Type</label>
            <input 
              type="text" 
              placeholder="ex: Congé Maternité" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-2 border rounded-lg text-sm bg-white" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-600">Quota par défaut (Jours)</label>
            <input 
              type="number" 
              value={defaultDays} 
              onChange={(e) => setDefaultDays(e.target.value)} 
              className="w-full p-2 border rounded-lg text-sm bg-white" 
              required 
            />
          </div>
          <div className="flex items-center pt-5">
            <input 
              type="checkbox" 
              id="proofReq" 
              checked={requiresProof} 
              onChange={(e) => setRequiresProof(e.target.checked)} 
              className="mr-2 h-4 w-4 text-blue-600 rounded" 
            />
            <label htmlFor="proofReq" className="text-xs text-gray-700 font-medium select-none cursor-pointer">
              Justificatif Obligatoire
            </label>
          </div>
        </div>
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition">
          + Ajouter le type
        </button>
      </form>

      {/* Liste des Types */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600">
              <th className="p-3">Type</th>
              <th className="p-3">Quota (Jours)</th>
              <th className="p-3">Justificatif</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold text-gray-800">{t.name}</td>
                <td className="p-3 text-purple-600 font-bold">{t.default_days} j</td>
                <td className="p-3">
                  {t.requires_proof ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-semibold">Oui</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">Non</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}