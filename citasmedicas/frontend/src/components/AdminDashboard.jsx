import React, { useEffect, useState } from 'react';
import api from '../api';

function AdminDashboard() {
  const [tab, setTab] = useState('citas');

  // --- Citas pendientes ---
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [citasError, setCitasError] = useState('');
  const [citasLoading, setCitasLoading] = useState(false);

  // Especialidades
  const [especialidades, setEspecialidades] = useState([]);
  const [espForm, setEspForm] = useState({ nombre: '', descripcion: '' });
  const [espError, setEspError] = useState('');

  // Doctores
  const [doctores, setDoctores] = useState([]);
  const [docForm, setDocForm] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    telefono: '',
    numero_licencia: '',
    especialidad_id: ''
  });
  const [docError, setDocError] = useState('');
  const [docSuccess, setDocSuccess] = useState('');

  // Horarios
  const [horarios, setHorarios] = useState([]);
  const [horarioForm, setHorarioForm] = useState({
    doctor_id: '',
    dia_semana: '',
    hora_inicio: '',
    hora_fin: '',
    duracion_cita_min: 30
  });
  const [horarioError, setHorarioError] = useState('');

  // Reportes
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [reporte, setReporte] = useState(null);
  const [reporteError, setReporteError] = useState('');

  useEffect(() => {
    loadEspecialidades();
    loadDoctores();
  }, []);

  useEffect(() => {
    if (tab === 'citas') {
      loadPendingAppointments();
    }
  }, [tab]);

  const loadEspecialidades = async () => {
    try {
      const res = await api.get('/admin/especialidades');
      setEspecialidades(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDoctores = async () => {
    try {
      const res = await api.get('/admin/doctores');
      setDoctores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHorarios = async (doctorId) => {
    if (!doctorId) {
      setHorarios([]);
      return;
    }
    try {
      const res = await api.get('/admin/horarios', { params: { doctor_id: doctorId } });
      setHorarios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPendingAppointments = async () => {
    setCitasLoading(true);
    setCitasError('');
    try {
      const res = await api.get('/appointments/admin/pendientes');
      setPendingAppointments(res.data);
    } catch (err) {
      console.error(err);
      setCitasError('Error al cargar citas pendientes');
    } finally {
      setCitasLoading(false);
    }
  };

  // ------- ESPECIALIDADES -------
  const handleEspecialidadSubmit = async (e) => {
    e.preventDefault();
    setEspError('');
    if (!espForm.nombre) {
      setEspError('El nombre es obligatorio');
      return;
    }
    try {
      await api.post('/admin/especialidades', espForm);
      setEspForm({ nombre: '', descripcion: '' });
      loadEspecialidades();
    } catch (err) {
      setEspError(err.response?.data?.message || 'Error al crear especialidad');
    }
  };

  // ------- DOCTORES -------
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setDocError('');
    setDocSuccess('');
    if (
      !docForm.nombre_completo ||
      !docForm.email ||
      !docForm.password ||
      !docForm.numero_licencia ||
      !docForm.especialidad_id
    ) {
      setDocError('Complete todos los campos obligatorios');
      return;
    }
    try {
      await api.post('/admin/doctores', {
        ...docForm,
        especialidad_id: Number(docForm.especialidad_id)
      });
      setDocSuccess('Doctor creado correctamente');
      setDocForm({
        nombre_completo: '',
        email: '',
        password: '',
        telefono: '',
        numero_licencia: '',
        especialidad_id: ''
      });
      loadDoctores();
    } catch (err) {
      setDocError(err.response?.data?.message || 'Error al crear doctor');
    }
  };

  // ------- HORARIOS -------
  const handleHorarioDoctorChange = async (e) => {
    const doctor_id = e.target.value;
    setHorarioForm((prev) => ({ ...prev, doctor_id }));
    loadHorarios(doctor_id);
  };

  const handleHorarioSubmit = async (e) => {
    e.preventDefault();
    setHorarioError('');
    const { doctor_id, dia_semana, hora_inicio, hora_fin, duracion_cita_min } = horarioForm;
    if (!doctor_id || !dia_semana || !hora_inicio || !hora_fin) {
      setHorarioError('Complete todos los campos obligatorios');
      return;
    }
    try {
      await api.post('/admin/horarios', {
        doctor_id: Number(doctor_id),
        dia_semana,
        hora_inicio,
        hora_fin,
        duracion_cita_min: Number(duracion_cita_min)
      });
      loadHorarios(doctor_id);
    } catch (err) {
      setHorarioError(err.response?.data?.message || 'Error al crear horario');
    }
  };

  // ------- REPORTES -------
  const handleReporteSubmit = async (e) => {
    e.preventDefault();
    setReporteError('');
    try {
      const res = await api.get('/admin/reportes/mensuales', {
        params: { anio, mes }
      });
      setReporte(res.data);
    } catch (err) {
      setReporte(null);
      setReporteError(err.response?.data?.message || 'Error al obtener reporte');
    }
  };

  // ------- APROBAR / RECHAZAR CITA -------
  const updateAppointmentStatus = async (id, nuevoEstado) => {
    try {
      await api.patch(`/appointments/${id}/estado`, { estado: nuevoEstado });
      await loadPendingAppointments(); // recargar lista
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado de la cita');
    }
  };

  return (
    <div className="card">
      <h2>Panel de Administración</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className={tab === 'citas' ? 'active' : ''}
          onClick={() => setTab('citas')}
        >
          Citas pendientes
        </button>
        <button
          className={tab === 'especialidades' ? 'active' : ''}
          onClick={() => setTab('especialidades')}
        >
          Especialidades
        </button>
        <button
          className={tab === 'doctores' ? 'active' : ''}
          onClick={() => setTab('doctores')}
        >
          Doctores
        </button>
        <button
          className={tab === 'horarios' ? 'active' : ''}
          onClick={() => setTab('horarios')}
        >
          Horarios
        </button>
        <button
          className={tab === 'reportes' ? 'active' : ''}
          onClick={() => setTab('reportes')}
        >
          Reportes mensuales
        </button>
      </div>

      {/* CITAS PENDIENTES */}
      {tab === 'citas' && (
        <>
          <h3>Citas pendientes de aprobación</h3>
          {citasLoading && <p>Cargando citas...</p>}
          {citasError && <div className="error-text">{citasError}</div>}
          {!citasLoading && pendingAppointments.length === 0 && (
            <p>No hay citas pendientes.</p>
          )}
          {!citasLoading && pendingAppointments.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Doctor</th>
                  <th>Especialidad</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendingAppointments.map((cita) => (
                  <tr key={cita.id}>
                    <td>{cita.fecha_cita}</td>
                    <td>{cita.hora_cita}</td>
                    <td>{cita.nombre_paciente}</td>
                    <td>{cita.nombre_doctor}</td>
                    <td>{cita.especialidad}</td>
                    <td>{cita.motivo}</td>
                    <td>
                      {/* APROBAR: pasa de AGENDADA -> ATENDIDA para que salga de pendientes */}
                      <button
                        onClick={() => updateAppointmentStatus(cita.id, 'ATENDIDA')}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Aprobar
                      </button>
                      {/* RECHAZAR: AGENDADA -> RECHAZADA */}
                      <button
                        onClick={() => updateAppointmentStatus(cita.id, 'RECHAZADA')}
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ESPECIALIDADES */}
      {tab === 'especialidades' && (
        <>
          <h3>Crear especialidad</h3>
          <form onSubmit={handleEspecialidadSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                value={espForm.nombre}
                onChange={(e) => setEspForm((p) => ({ ...p, nombre: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input
                value={espForm.descripcion}
                onChange={(e) => setEspForm((p) => ({ ...p, descripcion: e.target.value }))}
              />
            </div>
            {espError && <div className="error-text">{espError}</div>}
            <button type="submit">Guardar especialidad</button>
          </form>

          <h3 style={{ marginTop: '1rem' }}>Listado de especialidades</h3>
          <ul>
            {especialidades.map((e) => (
              <li key={e.id}>
                <strong>{e.nombre}</strong> {e.descripcion && `- ${e.descripcion}`}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* DOCTORES */}
      {tab === 'doctores' && (
        <>
          <h3>Crear doctor</h3>
          <form onSubmit={handleDoctorSubmit}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input
                value={docForm.nombre_completo}
                onChange={(e) =>
                  setDocForm((p) => ({ ...p, nombre_completo: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                value={docForm.email}
                onChange={(e) => setDocForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={docForm.password}
                onChange={(e) => setDocForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                value={docForm.telefono}
                onChange={(e) => setDocForm((p) => ({ ...p, telefono: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Número de licencia</label>
              <input
                value={docForm.numero_licencia}
                onChange={(e) =>
                  setDocForm((p) => ({ ...p, numero_licencia: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Especialidad</label>
              <select
                value={docForm.especialidad_id}
                onChange={(e) =>
                  setDocForm((p) => ({ ...p, especialidad_id: e.target.value }))
                }
              >
                <option value="">Seleccione una especialidad</option>
                {especialidades.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
            {docError && <div className="error-text">{docError}</div>}
            {docSuccess && (
              <div style={{ color: 'green', fontSize: '0.9rem' }}>{docSuccess}</div>
            )}
            <button type="submit">Guardar doctor</button>
          </form>

          <h3 style={{ marginTop: '1rem' }}>Listado de doctores</h3>
          <ul>
            {doctores.map((d) => (
              <li key={d.id}>
                <strong>{d.nombre_completo}</strong> ({d.especialidad}) – {d.email}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* HORARIOS */}
      {tab === 'horarios' && (
        <>
          <h3>Configurar horarios</h3>
          <form onSubmit={handleHorarioSubmit}>
            <div className="form-group">
              <label>Doctor</label>
              <select
                value={horarioForm.doctor_id}
                onChange={handleHorarioDoctorChange}
              >
                <option value="">Seleccione un doctor</option>
                {doctores.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre_completo} ({d.especialidad})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Día de la semana (ej. LUNES)</label>
              <input
                value={horarioForm.dia_semana}
                onChange={(e) =>
                  setHorarioForm((p) => ({ ...p, dia_semana: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Hora inicio (HH:MM)</label>
              <input
                value={horarioForm.hora_inicio}
                onChange={(e) =>
                  setHorarioForm((p) => ({ ...p, hora_inicio: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Hora fin (HH:MM)</label>
              <input
                value={horarioForm.hora_fin}
                onChange={(e) =>
                  setHorarioForm((p) => ({ ...p, hora_fin: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>Duración cita (minutos)</label>
              <input
                type="number"
                value={horarioForm.duracion_cita_min}
                onChange={(e) =>
                  setHorarioForm((p) => ({
                    ...p,
                    duracion_cita_min: e.target.value
                  }))
                }
              />
            </div>
            {horarioError && <div className="error-text">{horarioError}</div>}
            <button type="submit">Guardar horario</button>
          </form>

          <h3 style={{ marginTop: '1rem' }}>Horarios actuales</h3>
          {horarios.length === 0 && <p>No hay horarios configurados para este doctor.</p>}
          <ul>
            {horarios.map((h) => (
              <li key={h.id}>
                {h.dia_semana}: {h.hora_inicio} - {h.hora_fin} ({h.duracion_cita_min} min)
              </li>
            ))}
          </ul>
        </>
      )}

      {/* REPORTES */}
      {tab === 'reportes' && (
        <>
          <h3>Reporte mensual de citas</h3>
          <form onSubmit={handleReporteSubmit}>
            <div className="form-group">
              <label>Año</label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Mes (1-12)</label>
              <input
                type="number"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
              />
            </div>
            {reporteError && <div className="error-text">{reporteError}</div>}
            <button type="submit">Generar reporte</button>
          </form>

          {reporte && (
            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Total de citas:</strong> {reporte.total_citas}
              </p>
              <p>
                <strong>Por estado:</strong>
              </p>
              <ul>
                <li>AGENDADA: {reporte.estados.AGENDADA || 0}</li>
                <li>ATENDIDA: {reporte.estados.ATENDIDA || 0}</li>
                <li>CANCELADA: {reporte.estados.CANCELADA || 0}</li>
                <li>RECHAZADA: {reporte.estados.RECHAZADA || 0}</li>
              </ul>
              <p>
                <strong>Citas por especialidad:</strong>
              </p>
              <ul>
                {reporte.citas_por_especialidad.map((e) => (
                  <li key={e.especialidad}>
                    {e.especialidad}: {e.total}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
