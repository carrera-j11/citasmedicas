# Backend - Sistema Web de Gestión de Citas Médicas Comunitarias

API REST construida con **Node.js + Express + SQLite** para gestionar:

- Usuarios (pacientes, doctores, administrador)
- Citas médicas por especialidad
- Disponibilidad de doctores
- Historial de citas

Incluye:

- Autenticación con **JWT**
- Validaciones con **express-validator**
- Prevención de **doble asignación de citas**
- Manejo centralizado de errores
- Medidas básicas de seguridad (Helmet, CORS)

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

La base de datos SQLite se crea automáticamente en `data/citas.db` al iniciar el servidor.

## Endpoints principales

### Autenticación

- `POST /api/auth/register`
  - Registra un nuevo paciente.
  - Validaciones:
    - `nombre_completo` obligatorio.
    - `email` con formato válido y único.
    - `password` mínimo 6 caracteres.
    - `cedula` obligatoria.
- `POST /api/auth/login`
  - Devuelve token JWT si las credenciales son correctas.

### Citas

- `POST /api/appointments` (PACIENTE)
  - Crea una cita.
  - Validaciones:
    - `paciente_id`, `doctor_id`, `especialidad_id` enteros > 0.
    - `fecha_cita` formato ISO (YYYY-MM-DD) y **fecha futura**.
    - `hora_cita` formato `HH:mm`.
    - `motivo` mínimo 5 caracteres.
  - Reglas de negocio:
    - No permite citas en el pasado.
    - No permite dos citas en el mismo día/hora con el mismo doctor
      en estado `AGENDADA` o `ATENDIDA`.

- `GET /api/appointments/paciente/:pacienteId` (PACIENTE / ADMIN)
  - Devuelve historial de citas del paciente.

- `PATCH /api/appointments/:id/estado` (DOCTOR / ADMIN)
  - Cambia el estado de la cita a `AGENDADA | ATENDIDA | CANCELADA | RECHAZADA`.

- `GET /api/appointments/disponibilidad?doctor_id=1&fecha=2025-11-25`
  - Devuelve los horarios disponibles (slots) para un doctor según su horario configurado
    y las citas ya ocupadas.

### Doctores

- `GET /api/doctors` (cualquier usuario autenticado)
  - Lista de doctores y sus especialidades (para mostrar en el frontend).

- `GET /api/doctors/mis-citas?fecha=YYYY-MM-DD` (DOCTOR)
  - Agenda diaria del doctor autenticado.

### Pacientes

- `GET /api/patients/me` (PACIENTE)
  - Datos del paciente correspondiente al usuario autenticado.

## Seguridad y buenas prácticas

- Autenticación con JWT y middleware `authRequired`.
- Control de acceso por rol con `requireRole('PACIENTE', 'DOCTOR', 'ADMIN')`.
- Helmet configurado para cabeceras seguras.
- CORS limitado mediante la variable `CLIENT_ORIGIN`.
- Validaciones de entrada con `express-validator` para evitar datos inválidos
  y reducir riesgo de **SQL Injection**.
- Manejo centralizado de errores con `errorHandler`.

## Estrategia de despliegue

### Backend (Railway / Render)

1. Crear nuevo servicio e importar el repositorio con la carpeta `backend`.
2. Configurar variables de entorno:
   - `PORT` (ej. 4000)
   - `JWT_SECRET` (clave fuerte)
   - `DB_FILE` (por defecto `./data/citas.db`)
   - `CLIENT_ORIGIN` (URL del frontend en producción)
3. Habilitar persistencia de disco para conservar el archivo SQLite.
4. Desplegar y probar con herramientas como Postman.

### Frontend (Vercel / Netlify)

El frontend consumirá esta API configurando la URL base en una variable de entorno, por ejemplo:  
`VITE_API_BASE_URL=https://mi-backend-citas.up.railway.app`.