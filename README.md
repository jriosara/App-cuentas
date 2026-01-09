# Control de Gastos Personales 🐱

Este proyecto es una aplicación fullstack para llevar el control de gastos e ingresos personales.

## Tecnologías

- **Frontend**: React + Vite (Desplegar en Vercel)
- **Backend**: Node.js + Express (Desplegar en Render)
- **Base de Datos**: Supabase (PostgreSQL)

## Configuración Local

### 1. Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Ve al "SQL Editor" y ejecuta el contenido del archivo `db_schema.sql` para crear la tabla.
3. Obtén tu `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde la configuración del proyecto (Project Settings > API).

### 2. Backend (Server)

1. Entra a la carpeta `server`.
2. Renombra `.env` y agrega tus credenciales de Supabase:
   ```env
   PORT=3000
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_KEY=tu_anon_key_de_supabase
   ```
3. Instala dependencias y corre el servidor:
   ```bash
   cd server
   npm install
   npm run dev
   ```

### 3. Frontend (Client)

1. Entra a la carpeta `client`.
2. El archivo `.env` ya está configurado para desarrollo local (`http://localhost:3000/api`).
3. Instala dependencias y corre el cliente:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Despliegue

### Backend (Render)
1. Crea un nuevo "Web Service" en Render conectado a este repositorio (carpeta `server` o raíz si configuras el root directory).
2. **Build Command**: `npm install`
3. **Start Command**: `node index.js`
4. Agrega las variables de entorno `SUPABASE_URL` y `SUPABASE_KEY` en el dashboard de Render.

### Frontend (Vercel)
1. Importa el proyecto en Vercel (carpeta `client`).
2. Agrega la variable de entorno `VITE_API_URL` con la URL de tu backend en Render (ej. `https://mi-backend.onrender.com/api`).
   - Nota: Asegúrate de que no termine en `/` extra si la lógica no lo maneja, el código actual espera la base sin `/` final o ajusta según necesidad, pero el código añade `/transactions`, así que `.../api` está bien.

## Estructura

- `/server`: API RESTful con Express.
- `/client`: SPA con React y Vite.
