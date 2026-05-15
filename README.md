# FocusHub

FocusHub es un monorepo con frontend Angular y backend NestJS para gestión de productividad.
Incluye módulos de tareas, calendario, técnicas de concentración, sesiones de foco, estadísticas y autenticación JWT.

## Estado actual (rama main)

- Frontend: Angular 19 (standalone components + signals)
- Backend: NestJS 11 + TypeORM
- Base de datos configurada en código: SQLite local (archivo focushub.db)
- Orquestación adicional disponible: Docker Compose con frontend, backend, MySQL y stack ELK

## Estructura del repositorio

```text
FocusHub/
	FocusHub-app/            # Frontend Angular
	focus-hub-backend/       # Backend NestJS
	elk/                     # Configuración ELK (Logstash)
	docker-compose.yml       # Orquestación completa para desarrollo/demo
```

## Arquitectura funcional

### Frontend (FocusHub-app)

Rutas principales:

- / (welcome)
- /sign-up
- /log-in
- /tasks (protegida)
- /calendar (protegida)
- /techniques (protegida)
- /stats (protegida)

Servicios clave:

- AuthService: registro, login, logout y estado de autenticación
- TokenService: gestión de JWT en localStorage
- TaskService: CRUD de tareas y estado reactivo con signals
- EventService: CRUD de eventos y filtrado por fecha
- TechniqueService: técnicas globales/usuario, sesiones de foco, tareas por sesión y persistencia de estado UI en sessionStorage
- StatsService: consumo de estadísticas de productividad

Notas de frontend:

- El interceptor global agrega Authorization: Bearer token cuando hay sesión.
- La ruta /techniques integra temporizador de foco, restauración de sesión activa y asociación de tareas.
- En main solo existe src/environments/environment.ts.

### Backend (focus-hub-backend)

Módulos:

- auth
- users
- tasks
- events
- categories
- productivity
- ambient-sound
- reminders (estructura base, sin endpoints funcionales expuestos)

Configuración actual de base de datos (app.module.ts):

- type: sqlite
- database: focushub.db
- synchronize: true
- logging: true

Documentación API:

- Swagger disponible en /api

## Endpoints principales

### Autenticación

- POST /auth/register
- POST /auth/login

### Usuarios

- GET /users/me (requiere JWT)
- POST /users
- GET /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

### Tareas (requiere JWT)

- POST /tasks
- GET /tasks
- GET /tasks/:id
- PATCH /tasks/:id
- PATCH /tasks/:id/status
- DELETE /tasks/:id

### Eventos (requiere JWT)

- POST /events
- GET /events
- GET /events/:id
- PUT /events/:id
- DELETE /events/:id
- GET /events/by-date?date=YYYY-MM-DD

### Categorías

- POST /categories?userId=
- GET /categories?userId=
- GET /categories/:id?userId=
- PATCH /categories/:id?userId=
- DELETE /categories/:id?userId=

### Productividad (requiere JWT)

Técnicas:

- POST /productivity/techniques?userId=
- GET /productivity/techniques?userId=
- GET /productivity/techniques/global
- GET /productivity/techniques/:name?userId=
- PATCH /productivity/techniques/:name?userId=
- DELETE /productivity/techniques/:name?userId=

Sesiones de foco:

- POST /productivity/focus-sessions
- GET /productivity/focus-sessions?userId=
- GET /productivity/focus-sessions/active/:userId
- GET /productivity/focus-sessions/:id?userId=
- PATCH /productivity/focus-sessions/:id?userId=
- DELETE /productivity/focus-sessions/:id?userId=

Relación sesión-tarea:

- POST /productivity/focus-session-tasks
- GET /productivity/focus-session-tasks
- GET /productivity/focus-session-tasks/:id
- PATCH /productivity/focus-session-tasks/:id
- DELETE /productivity/focus-session-tasks/:id
- DELETE /productivity/focus-sessions/:sessionId/tasks/:taskId

Estadísticas:

- GET /productivity/stats

### Sonidos ambientales

- GET /ambient-sounds
- GET /ambient-sounds/:id
- POST /ambient-sounds
- PUT /ambient-sounds/:id
- DELETE /ambient-sounds/:id

## Requisitos

- Node.js 20+
- npm 10+
- Docker Desktop (opcional, solo para flujo con contenedores)

## Configuración de entorno

En focus-hub-backend, crear un archivo .env para desarrollo local:

```env
JWT_SECRET=replace_with_secure_secret
PORT=3000
NODE_ENV=development
LOGSTASH_HOST=localhost
LOGSTASH_PORT=5000
```

Nota:

- JWT_SECRET es obligatorio para que la estrategia JWT arranque correctamente.
- Actualmente main.ts escucha en el puerto 3000 de forma fija.

## Ejecución local (sin Docker)

### 1) Backend

```bash
cd focus-hub-backend
npm install
npm run start:dev
```

Backend disponible en:

- http://localhost:3000
- Swagger: http://localhost:3000/api

### 2) Frontend

```bash
cd FocusHub-app
npm install
npm start
```

Frontend disponible en:

- http://localhost:4200

## Ejecución con Docker Compose

```bash
docker compose up
```

Servicios definidos en docker-compose.yml:

- frontend: 4200
- backend: 3000
- mysql_db: 3307 (host) -> 3306 (container)
- elasticsearch: 9200
- logstash: 5000
- kibana: 5601

Nota:

- El compose de la raíz usa imágenes publicadas en Docker Hub por defecto.
- Las secciones build están comentadas en docker-compose.yml.

## Scripts útiles

### Backend

```bash
cd focus-hub-backend
npm run build
npm run start:dev
npm run start:prod
npm run lint
npm run test
npm run test:e2e
```

### Frontend

```bash
cd FocusHub-app
npm start
npm run build
npm test
```

## Observaciones técnicas importantes

1. En la rama main, el backend está configurado para SQLite en código, mientras que docker-compose también levanta MySQL.
2. En frontend, AuthService usa environment.apiUrl, pero otros servicios usan URLs hardcodeadas a http://localhost:3000.
3. El módulo reminders existe a nivel de estructura/entidades, pero su servicio y controlador están en estado base.
4. Existe configuración para despliegue del frontend en Vercel (ver FocusHub-app/vercel.json).

