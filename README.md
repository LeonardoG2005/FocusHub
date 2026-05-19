# FocusHub
# FocusHub

FocusHub es una aplicación compuesta por un frontend en Angular y un backend en NestJS. Este repositorio está preparado para ejecutarse fácilmente usando Docker y Docker Compose.

Este proyecto utiliza:
- Angular CLI: **19.2.6**
- Node.js: **20.17.0**
- NestJS: **11.0.1**

---

## ¿Cómo ejecutar el proyecto desde cero?

### Requisitos previos

Asegurarse de tener instalado Docker Desktop y luego abrirlo.

Antes de comenzar, asegúrese de tener instalado lo siguiente:

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

### Pasos para clonar y levantar la app

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
docker-compose up
```

El archivo docker-compose.yml ya usa las imágenes de Docker Hub subidas (https://hub.docker.com/repository/docker/pholcast25/focus-hub-angular/general y https://hub.docker.com/repository/docker/pholcast25/focus-hub-nest-js/general) y no requiere que se instale nada más.

Esto levanta los dos servicios de Frontend y Backend:
Frontend Angular en http://localhost:4200

Backend NestJS en http://localhost:3000

Además, puedes acceder a la documentación de la API (Swagger) en:
http://localhost:3000/api

