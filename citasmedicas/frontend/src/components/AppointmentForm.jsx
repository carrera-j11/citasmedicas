import React, { useEffect, useState } from 'react';
import api from '../api';

function AppointmentForm() {
  const [form, setForm] = useState({
    paciente_id: '',
    doctor_id: '',
    especialidad_id: '',
    fecha_cita: '',
    hora_cita: '',
    motivo: ''
  });
  const [doctores, setDoctores] = useState([]);
  const [slots, setSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const perfilRes = await api.get('/patients/me');
        const doctRes = await api.get('/doctors');
        setForm((prev) => ({ ...prev, paciente_id: perfilRes.data.id }));
        setDoctores(doctRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.doctor_id) newErrors.doctor_id = 'Seleccione un doctor';
    if (!form.fecha_cita) newErrors.fecha_cita = 'Seleccione una fecha';
    if (!form.hora_cita) newErrors.hora_cita = 'Seleccione una hora';
    if (!form.motivo || form.motivo.length < 5)
      newErrors.motivo = 'Describa brevemente el motivo (mínimo 5 caracteres)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDoctorOrDateChange = async (e) => {
    handleChange(e);
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    if (newForm.doctor_id && newForm.fecha_cita) {
      try {
        const res = await api.get('/appointments/disponibilidad', {
          params: {
            doctor_id: newForm.doctor_id,
            fecha: newForm.fecha_cita
          }
        });
        setSlots(res.data.slots);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    if (!validate()) return;

    try {
      await api.post('/appointments', form);
      setSuccess('Cita creada correctamente.');
      setForm((prev) => ({
        ...prev,
        fecha_cita: '',
        hora_cita: '',
        motivo: ''
      }));
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al crear cita');
    }
  };

  return (
    <div className="card">
      <h2>Nueva cita</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Doctor</label>
          <select
            name="doctor_id"
            value={form.doctor_id}
            onChange={handleDoctorOrDateChange}
            className={errors.doctor_id ? 'error' : ''}
          >
            <option value="">Seleccione un doctor</option>
            {doctores.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} - {d.especialidad}
              </option>
            ))}
          </select>
          {errors.doctor_id && <div className="error-text">{errors.doctor_id}</div>}
        </div>
        <div className="form-group">
          <label>Fecha</label>
          <input
            type="date"
            name="fecha_cita"
            value={form.fecha_cita}
            onChange={handleDoctorOrDateChange}
            className={errors.fecha_cita ? 'error' : ''}
          />
          {errors.fecha_cita && <div className="error-text">{errors.fecha_cita}</div>}
        </div>
        <div className="form-group">
          <label>Hora</label>
          <select
            name="hora_cita"
            value={form.hora_cita}
            onChange={handleChange}
            className={errors.hora_cita ? 'error' : ''}
          >
            <option value="">Seleccione un horario disponible</option>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.hora_cita && <div className="error-text">{errors.hora_cita}</div>}
        </div>
        <div className="form-group">
          <label>Motivo</label>
          <input
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            className={errors.motivo ? 'error' : ''}
          />
          {errors.motivo && <div className="error-text">{errors.motivo}</div>}
        </div>
        {serverError && <div className="error-text">{serverError}</div>}
        {success && <div style={{ color: 'green', fontSize: '0.9rem' }}>{success}</div>}
        <button type="submit">Guardar cita</button>
      </form>
    </div>
  );
}

export default AppointmentForm;