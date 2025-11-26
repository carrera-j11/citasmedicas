import React, { useEffect, useState } from 'react';
import api from '../api';

function AppointmentList({ user }) {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    async function loadCitas() {
      try {
        if (user.rol === 'PACIENTE') {
          const perfil = await api.get('/patients/me');
          const res = await api.get(`/appointments/paciente/${perfil.data.id}`);
          setCitas(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCitas();
  }, [user]);

  return (
    <div className="card">
      <h2>Mis citas</h2>
      {citas.length === 0 && <p>No tiene citas registradas.</p>}
      {citas.map((cita) => (
        <div key={cita.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <strong>{cita.fecha_cita}</strong> a las <strong>{cita.hora_cita}</strong>
          </div>
          <div>
            Doctor: {cita.nombre_doctor} ({cita.especialidad})
          </div>
          <div>Estado: {cita.estado}</div>
          {cita.motivo && <div>Motivo: {cita.motivo}</div>}
        </div>
      ))}
    </div>
  );
}

export default AppointmentList;