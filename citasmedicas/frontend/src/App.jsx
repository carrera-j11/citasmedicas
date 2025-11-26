import React, { useState, useEffect } from 'react';
import api, { setAuthToken, loadTokenFromStorage } from './api';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Solo vuelve a cargar el token en axios; el usuario se vuelve a loguear
    loadTokenFromStorage();
  }, []);

  const handleLoginSuccess = (data) => {
    // data viene del backend: { token, nombre, rol }
    setAuthToken(data.token);
    setUser({
      nombre: data.nombre,
      rol: data.rol
    });

    // Vista inicial según el rol
    if (data.rol === 'ADMIN') {
      setView('admin');
    } else if (data.rol === 'PACIENTE') {
      setView('citas');
    } else if (data.rol === 'DOCTOR') {
      setView('doctor');
    } else {
      setView('login');
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setView('login');
  };

  return (
    <div className="app-container">
      <h1>Sistema de Citas Médicas Comunitarias</h1>

      {user && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Sesión:</strong> {user.nombre} ({user.rol})
          <button style={{ marginLeft: '0.5rem' }} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      )}

      <nav>
        {/* Navegación cuando NO hay usuario */}
        {!user && (
          <>
            <button
              className={view === 'login' ? 'active' : ''}
              onClick={() => setView('login')}
            >
              Iniciar sesión
            </button>
            <button
              className={view === 'register' ? 'active' : ''}
              onClick={() => setView('register')}
            >
              Registrarse
            </button>
          </>
        )}

        {/* Navegación PACIENTE */}
        {user && user.rol === 'PACIENTE' && (
          <>
            <button
              className={view === 'citas' ? 'active' : ''}
              onClick={() => setView('citas')}
            >
              Mis citas
            </button>
            <button
              className={view === 'nueva' ? 'active' : ''}
              onClick={() => setView('nueva')}
            >
              Nueva cita
            </button>
          </>
        )}

        {/* Navegación ADMIN */}
        {user && user.rol === 'ADMIN' && (
          <button
            className={view === 'admin' ? 'active' : ''}
            onClick={() => setView('admin')}
          >
            Panel administrador
          </button>
        )}

        {/* Navegación DOCTOR */}
        {user && user.rol === 'DOCTOR' && (
          <button
            className={view === 'doctor' ? 'active' : ''}
            onClick={() => setView('doctor')}
          >
            Mis citas
          </button>
        )}
      </nav>

      {/* Vistas sin usuario */}
      {!user && view === 'login' && (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
      {!user && view === 'register' && <RegisterForm />}

      {/* Vistas PACIENTE */}
      {user && user.rol === 'PACIENTE' && view === 'nueva' && (
        <AppointmentForm />
      )}

      {user && user.rol === 'PACIENTE' && view === 'citas' && (
        <AppointmentList user={user} />
      )}

      {/* Vista ADMIN */}
      {user && user.rol === 'ADMIN' && view === 'admin' && (
        <AdminDashboard />
      )}

      {/* Vista DOCTOR */}
      {user && user.rol === 'DOCTOR' && view === 'doctor' && (
        <DoctorDashboard />
      )}
    </div>
  );
}

export default App;
