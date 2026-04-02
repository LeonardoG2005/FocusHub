# FocusHub Demo Deploy (Angular + NestJS)

Este documento describe una ruta recomendada y probada para desplegar demo:

- Frontend Angular en Vercel
- Backend NestJS en Railway
- Base de datos PostgreSQL en Neon

## Por que esta combinacion

- Vercel sirve frontend estatico Angular con CI/CD muy simple.
- Railway despliega NestJS sin friccion y permite variables de entorno faciles.
- Neon ofrece PostgreSQL gestionado con plan gratuito para demo.
- Mantienes separacion frontend/backend y buenas practicas de configuracion.

## 1) Preparar rama de despliegue

```bash
git checkout -b deploy-demo
```

## 2) Backend: variables y base de datos

### 2.1 Crear archivo .env local para probar

En focus-hub-backend, copia .env.example a .env y completa valores.

Variables clave:

- PORT=3000
- FRONTEND_URL=https://TU_FRONTEND_VERCEL.app
- JWT_SECRET=una_clave_larga_y_aleatoria
- DB_TYPE=postgres
- DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- DB_SSL=true
- DB_SYNCHRONIZE=true (demo)
- DB_LOGGING=false

### 2.2 Crear base de datos en Neon

1. Crea proyecto en Neon.
2. Crea base de datos focushub.
3. Copia credenciales de conexion.
4. Llena DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME.

## 3) Backend en Railway

### 3.1 Crear servicio

1. Railway -> New Project -> Deploy from GitHub Repo.
2. Selecciona repo y servicio focus-hub-backend.
3. Root Directory: focus-hub-backend.

### 3.2 Variables de entorno en Railway

Configura las variables de focus-hub-backend/.env.example.

Minimas para demo:

- NODE_ENV=production
- PORT=3000
- FRONTEND_URL=https://TU_FRONTEND_VERCEL.app
- ENABLE_SWAGGER=true
- JWT_SECRET=valor_seguro
- DB_TYPE=postgres
- DB_HOST=...
- DB_PORT=5432
- DB_USERNAME=...
- DB_PASSWORD=...
- DB_NAME=...
- DB_SSL=true
- DB_SYNCHRONIZE=true
- DB_LOGGING=false

### 3.3 Build/Start en Railway

- Build Command: npm install ; npm run build
- Start Command: npm run start:prod

## 4) Frontend en Vercel

### 4.1 Configurar URL de backend

Edita FocusHub-app/src/environments/environment.production.ts:

- apiUrl debe apuntar al dominio publico del backend Railway.

Ejemplo:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://focushub-api-production.up.railway.app'
};
```

### 4.2 Crear proyecto en Vercel

1. Vercel -> Add New Project -> importa repo.
2. Framework Preset: Angular.
3. Root Directory: FocusHub-app.
4. Build Command: npm run build.
5. Output Directory: dist/focus-hub-app/browser (si Vercel lo requiere en tu version de Angular).

Si Vercel no detecta bien el output, usa:

- Output Directory: dist/focus-hub-app

## 5) Orden recomendado de despliegue

1. Despliega backend en Railway.
2. Copia URL publica del backend.
3. Actualiza environment.production.ts con esa URL.
4. Despliega frontend en Vercel.
5. Actualiza FRONTEND_URL del backend con dominio final de Vercel.
6. Re-deploy backend para aplicar CORS definitivo.

## 6) Autenticacion para demo (recomendado)

No desactivar JWT. Mantener seguridad basica con estas reglas:

- Conserva login/register actual.
- Usa una cuenta demo semilla (manual) para mostrar la app.
- Expiracion actual 1h esta bien para demo.
- Cambia JWT_SECRET por uno fuerte en Railway.

Opcional: crear endpoint de login demo en entorno demo, pero no es obligatorio.

## 7) Verificacion final

Checklist:

- Frontend abre por URL publica.
- Registro/login funciona.
- Se crea token y se envian headers Authorization.
- CRUD de tareas/eventos/productividad responde 200/201.
- CORS no bloquea peticiones.
- Swagger accesible en /api (si ENABLE_SWAGGER=true).

## 8) Problemas comunes y solucion

- Error CORS:
  - FRONTEND_URL no coincide exactamente con dominio Vercel.
- Error 401 en endpoints protegidos:
  - JWT_SECRET vacio o distinto entre despliegues.
- Error de DB:
  - DB_SSL incorrecto para Neon (normalmente true).
  - Credenciales de Neon mal copiadas.
- Frontend apunta a localhost:
  - Revisar environment.production.ts antes de deploy.

## 9) Comandos utiles

```bash
# backend local
cd focus-hub-backend
npm install
npm run build
npm run start:prod

# frontend local
cd FocusHub-app
npm install
npm run build
```
