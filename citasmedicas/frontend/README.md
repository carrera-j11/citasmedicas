# Frontend - Sistema Web de Gestión de Citas Médicas Comunitarias

Aplicación SPA construida con **React + Vite**.  
Permite a los pacientes:

- Registrarse
- Iniciar sesión
- Crear una nueva cita
- Ver el historial de citas

## Validaciones implementadas

- Formularios de **login y registro**:
  - Campos obligatorios (email, contraseña, nombre, cédula).
  - Longitud mínima de contraseña (6 caracteres).
  - Campos con error se marcan en rojo y muestran mensaje de ayuda.

- Formulario de **nueva cita**:
  - Selección obligatoria de doctor.
  - Fecha obligatoria.
  - Hora obligatoria (de lista de slots disponibles).
  - Motivo de la cita mínimo 5 caracteres.
  - Si faltan datos, los campos se marcan en rojo con mensaje de error.

## Configuración

```bash
cd frontend
npm install
npm run dev
```

Crear un archivo `.env` (opcional) para definir la URL de la API:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

## Estrategia de despliegue

### Frontend en Vercel

1. Crear un nuevo proyecto en Vercel y seleccionar el repositorio que contiene la carpeta `frontend`.
2. En **Project Settings → Environment Variables**, configurar:
   - `VITE_API_BASE_URL=https://mi-backend-citas.up.railway.app`
3. Deploy automático de la rama `main`.
4. Probar el flujo completo:
   - Registro de paciente.
   - Login.
   - Creación de cita.
   - Visualización del historial.

### Backend en Railway / Render

El backend de este proyecto está pensado para desplegarse en Railway o Render.
Una vez desplegado, copiar la URL pública en `VITE_API_BASE_URL`.

## Navegación principal

- Barra de navegación superior para cambiar entre:
  - `Iniciar sesión`
  - `Registrarse`
  - `Mis citas`
  - `Nueva cita` (solo pacientes autenticados)

Esto cumple con la rúbrica de **diseño de frontend**: componentes, navegación, formularios, consumo de API y manejo básico de errores.