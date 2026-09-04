import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import API from '../api/axios';

export default function TeamCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedLeaves();
  }, []);

  const fetchApprovedLeaves = async () => {
    try {
      const res = await API.get('/leave-requests');
      const data = res.data || [];

      const approved = data
        .filter((req) => req.status === 'approved')
        .map((req) => ({
          id: req.id,
          title: `${req.user?.name || 'Employé'} - ${req.leave_type?.name || 'Congé'}`,
          start: req.start_date?.split('T')[0],
          end: req.end_date?.split('T')[0],
          color: req.leave_type?.name?.toLowerCase().includes('maladie') ? '#e11d48' : '#2563eb',
        }));

      setEvents(approved);
    } catch (err) {
      console.error('Erreur lors du chargement du calendrier:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Chargement du calendrier...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800"> Planning & Calendrier d'Équipe</h2>
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth',
          }}
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
          }}
        />
      </div>
    </div>
  );
}