import React, { useEffect, useState } from 'react';
import api from '../api';

function DoctorDashboard() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCitas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/appointments/doctor/mis-citas');
      setCitas(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar citas del doctor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitas();
  }, []);

  const updateEstado = async (id, nuevoEstado) => {
    try {
      await api.patch(`/appointments/${id}/estado`, { estado: nuevoEstado });
      await loadCitas();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado de la cita');
    }
  };

  return (
    <div className="card">
      <h2>Agenda del doctor</h2>

      {loading && <p>Cargando citas...</p>}
      {error && <div className="error-text">{error}</div>}

      {!loading && citas.length === 0 && (
        <p>No tiene citas próximas registradas.</p>
      )}

      {!loading && citas.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((c) => (
              <tr key={c.id}>
                <td>{c.fecha_cita}</td>
                <td>{c.hora_cita}</td>
                <td>{c.nombre_paciente}</td>
                <td>{c.motivo}</td>
                <td>{c.estado}</td>
                <td>
                  {c.estado === 'AGENDADA' ? (
                    <>
                      <button
                        onClick={() => updateEstado(c.id, 'ATENDIDA')}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Marcar atendida
                      </button>
                      <button
                        onClick={() => updateEstado(c.id, 'CANCELADA')}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <span>Sin acciones</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DoctorDashboard;
