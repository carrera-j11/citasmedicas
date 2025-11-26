import React, { useState } from 'react';
import api from '../api';

function RegisterForm() {
  const [form, setForm] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    cedula: '',
    telefono: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.nombre_completo) newErrors.nombre_completo = 'El nombre es obligatorio';
    if (!form.email) newErrors.email = 'El email es obligatorio';
    if (!form.password || form.password.length < 6)
      newErrors.password = 'Mínimo 6 caracteres';
    if (!form.cedula) newErrors.cedula = 'La cédula es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Registro exitoso, ahora puede iniciar sesión.');
      setForm({
        nombre_completo: '',
        email: '',
        password: '',
        cedula: '',
        telefono: ''
      });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Registro de paciente</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Nombre completo</label>
          <input
            name="nombre_completo"
            value={form.nombre_completo}
            onChange={handleChange}
            className={errors.nombre_completo ? 'error' : ''}
          />
          {errors.nombre_completo && (
            <div className="error-text">{errors.nombre_completo}</div>
          )}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>
        <div className="form-group">
          <label>Cédula</label>
          <input
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
            className={errors.cedula ? 'error' : ''}
          />
          {errors.cedula && <div className="error-text">{errors.cedula}</div>}
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />
        </div>
        {serverError && <div className="error-text">{serverError}</div>}
        {success && <div style={{ color: 'green', fontSize: '0.9rem' }}>{success}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;