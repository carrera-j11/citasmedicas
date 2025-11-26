# Caso 5 – Sistema Web de Gestión de Citas Médicas Comunitarias

Autor: **Javier Carrera**

Este repositorio contiene una propuesta **full-stack** (backend + frontend) para el caso de estudio:

> Un centro médico comunitario que necesita gestionar citas médicas de distintas especialidades,
> evitando doble asignación de pacientes, choques de horario y sin perder el historial de citas.

## 1. Entendimiento del problema

Actualmente las citas se manejan en hojas de Excel, lo que provoca:

- Doble asignación de pacientes y horarios duplicados.
- Falta de control en la disponibilidad real de cada doctor.
- No existe historial estructurado de citas atendidas o canceladas.
- No se pueden generar reportes ni recordatorios de forma sencilla.

El sistema propuesto soluciona estos puntos mediante:

- Una **base de datos relacional** con tablas para usuarios, pacientes, doctores,
  especialidades, horarios, citas y observaciones médicas.
- Reglas de negocio en el backend que **impiden crear citas duplicadas** para el mismo
  doctor, día y hora.
- Endpoints para que:
  - El **paciente** se registre, inicie sesión, solicite o cancele citas y vea su historial.
  - El **doctor** vea su agenda diaria, marque citas como atendidas o canceladas y registre observaciones.
  - El **administrador** (puede ampliarse) gestione doctores, especialidades y horarios.
- Un frontend con formularios validados para reducir errores de ingreso de datos.

## 2. Arquitectura general

- **Backend**: Node.js + Express + SQLite
  - API REST con rutas para autenticación, citas, pacientes y doctores.
  - Validaciones con express-validator.
  - Autenticación JWT y manejo de roles (PACIENTE, DOCTOR, ADMIN).
  - Manejo de errores centralizado y medidas básicas de seguridad (Helmet, CORS).

- **Frontend**: React + Vite
  - Componentes reutilizables:
    - Login, registro, formulario de nueva cita, listado de citas.
  - Navegación según rol del usuario.
  - Validaciones visuales (inputs en rojo + mensajes de error) cuando faltan campos.

- **Base de datos**: SQLite (puede migrarse a MySQL/PostgreSQL sin cambiar la lógica).
  - Entidades principales:
    - `usuarios`, `pacientes`, `doctores`, `especialidades`,
      `horarios_doctor`, `citas`, `historial_citas`.
  - Relaciones bien definidas por claves foráneas.

## 3. Seguridad y buenas prácticas

- Autenticación con JWT (token en cabecera `Authorization: Bearer ...`).
- Autorización por rol con middleware `requireRole`.
- Validación de datos en todas las entradas críticas.
- Prevención de SQL Injection utilizando parámetros en las consultas.
- Helmet para agregar cabeceras de seguridad HTTP.
- CORS configurado por variable de entorno (`CLIENT_ORIGIN`).

## 4. Estructura del proyecto

- `backend/` → API REST + BD
- `frontend/` → Aplicación React
- Cada carpeta tiene su propio `README.md` con instrucciones de ejecución y despliegue.

Con esta estructura se cubren los criterios de la rúbrica:

- Comprensión clara del problema y de los usuarios/roles.
- Diseño correcto de backend (entidades, relaciones, endpoints, validaciones).
- Frontend con componentes, navegación, formularios y consumo de API.
- Estrategia de despliegue (Railway/Render para backend, Vercel para frontend).
- Medidas básicas de seguridad y reflexión incorporada en la documentación.