<div align="center">

# 🏆 Plataforma Torneos

**Plataforma Full Stack para la gestión de torneos de videojuegos.**

Monorepo con arquitectura desacoplada: una **SPA** en React y una **API REST** en Node/Express.

<br>

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

</div>

---

## 📑 Tabla de contenidos

- [Sobre el proyecto](#-sobre-el-proyecto)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack tecnológico](#-stack-tecnológico)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y arranque](#-instalación-y-arranque)
- [Variables de entorno](#-variables-de-entorno)
- [Scripts disponibles](#-scripts-disponibles)
- [API REST](#-api-rest)
- [Modelo de datos](#-modelo-de-datos)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

## 📖 Sobre el proyecto

**Plataforma Torneos** permite a los usuarios explorar videojuegos, consultar torneos
disponibles e inscribirse en ellos, mientras que los administradores gestionan juegos,
torneos e inscripciones. El proyecto está organizado como un **monorepo** con dos
aplicaciones independientes que se comunican a través de una API REST:

- **`client/`** → SPA (Single Page Application) construida con React + Vite.
- **`server/`** → API REST construida con Node + Express + MySQL.

> ⚠️ **Estado actual:** este repositorio contiene el **scaffolding** del proyecto
> (estructura de carpetas, archivos placeholder con sus tipos/exports, dependencias y
> configuración). La lógica de negocio se implementa de forma incremental.

---

## ✨ Características

- 🔐 **Autenticación con JWT** y control de acceso por **roles** (`user` / `admin`).
- 🎮 **Gestión de juegos** (CRUD para administradores).
- 🏟️ **Gestión de torneos** asociados a juegos.
- 📝 **Inscripciones** de usuarios a torneos con estados (`pending` / `confirmed` / `rejected`).
- 🛡️ **Rutas protegidas** en el frontend según sesión y rol.
- 🧩 **Modales con React Portals** (`createPortal`).
- 🌐 **CORS** configurado y **proxy `/api`** en desarrollo (Vite → Express).
- 🟦 **TypeScript** de extremo a extremo (frontend y backend).

---

## 🏗️ Arquitectura

```
┌──────────────────────────┐         HTTP / JSON        ┌──────────────────────────┐
│         CLIENT           │  ───────────────────────▶  │         SERVER           │
│  React + Vite + TS (SPA) │     /api  (proxy en dev)   │  Express + TS (API REST) │
│                          │  ◀───────────────────────  │                          │
│  · React Router          │          JWT               │  · Rutas / Controladores │
│  · Axios                 │                            │  · Middlewares (auth...) │
│  · Context (Auth)        │                            │  · mysql2/promise (pool) │
└──────────────────────────┘                            └────────────┬─────────────┘
                                                                      │
                                                                      ▼
                                                            ┌──────────────────┐
                                                            │      MySQL       │
                                                            │  users, games,   │
                                                            │  tournaments,    │
                                                            │  registrations   │
                                                            └──────────────────┘
```

---

## 🧰 Stack tecnológico

### Frontend (`client/`)
| Herramienta | Uso |
|---|---|
| **React 18** | Librería de UI |
| **Vite 5** | Bundler / dev server |
| **TypeScript** | Tipado estático |
| **React Router DOM** | Enrutado de la SPA |
| **Axios** | Cliente HTTP |

### Backend (`server/`)
| Herramienta | Uso |
|---|---|
| **Node + Express 4** | Servidor HTTP / API REST (ESM) |
| **TypeScript** | Tipado estático |
| **mysql2** | Driver MySQL (pool de conexiones) |
| **jsonwebtoken** | Autenticación con JWT |
| **bcrypt** | Hash de contraseñas |
| **express-validator** | Validación de datos |
| **cors / dotenv** | CORS y variables de entorno |
| **tsx** | Ejecución/recarga en desarrollo |

---

## 📂 Estructura del proyecto

```
plataforma-torneos/
├── client/                          # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/axios.ts             # instancia base de Axios
│   │   ├── context/AuthContext.tsx  # contexto de autenticación
│   │   ├── hooks/                   # useAuth, useFetch
│   │   ├── routes/                  # ProtectedRoute, AppRoutes
│   │   ├── pages/                   # Home, Login, Register, Games...
│   │   ├── components/
│   │   │   ├── layout/              # Navbar, Layout
│   │   │   └── ui/                  # Modal (createPortal)
│   │   ├── types/index.ts           # User, Game, Tournament, Registration
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html                   # incluye #modal-root para Portals
│   ├── vite.config.ts               # proxy /api → :4000
│   └── .env.example
│
├── server/                          # Node + Express + TypeScript (ESM)
│   ├── src/
│   │   ├── config/db.ts             # pool mysql2/promise
│   │   ├── routes/                  # auth, users, games, tournaments, registrations
│   │   ├── controllers/             # un controlador por recurso
│   │   ├── middlewares/             # auth, role, validate, errorHandler
│   │   ├── types/index.ts
│   │   ├── app.ts                   # configuración de Express + CORS
│   │   └── server.ts                # arranque del servidor
│   ├── database/schema.sql          # esquema SQL (placeholder)
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## ✅ Requisitos previos

- [Node.js](https://nodejs.org/) **>= 18**
- **npm >= 9**
- [MySQL](https://www.mysql.com/) **>= 8** en ejecución

---

## 🚀 Instalación y arranque

Clona el repositorio:

```bash
git clone https://github.com/<tu-usuario>/plataforma-torneos.git
cd plataforma-torneos
```

### 1️⃣ Backend

```bash
cd server
npm install
cp .env.example .env          # Windows (PowerShell): Copy-Item .env.example .env
```

Edita `server/.env` con tus credenciales de MySQL y un `JWT_SECRET`, carga el esquema
y arranca:

```bash
mysql -u root -p < database/schema.sql   # cuando tengas el schema definido
npm run dev                              # http://localhost:4000
```

### 2️⃣ Frontend (en otra terminal)

```bash
cd client
npm install
cp .env.example .env          # Windows (PowerShell): Copy-Item .env.example .env
npm run dev                   # http://localhost:5173
```

> En desarrollo, las peticiones a `/api` se redirigen por **proxy** a
> `http://localhost:4000` (configurado en `vite.config.ts`).

---

## 🔑 Variables de entorno

### `client/.env`
```env
VITE_API_URL=http://localhost:4000/api
```

### `server/.env`
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=plataforma_torneos
JWT_SECRET=cambia_este_secreto
PORT=4000
```

---

## 📜 Scripts disponibles

### Frontend (`client/`)
| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción |
| `npm run preview` | Previsualiza el build |

### Backend (`server/`)
| Script | Descripción |
|---|---|
| `npm run dev` | Desarrollo con recarga (`tsx watch`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta `dist/server.js` |

---

## 🌐 API REST

> Prefijo base: `/api`

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/health` | Healthcheck del servidor | Público |
| `POST` | `/api/auth/register` | Registro de usuario | Público |
| `POST` | `/api/auth/login` | Inicio de sesión (devuelve JWT) | Público |
| `GET` | `/api/auth/me` | Usuario autenticado | 🔐 Sesión |
| `GET` | `/api/users` | Listar usuarios | 🛡️ Admin |
| `GET` | `/api/users/:id` | Obtener usuario | 🔐 Sesión |
| `PUT` | `/api/users/:id` | Actualizar usuario | 🔐 Sesión |
| `DELETE` | `/api/users/:id` | Eliminar usuario | 🛡️ Admin |
| `GET` | `/api/games` | Listar juegos | Público |
| `GET` | `/api/games/:id` | Detalle de juego | Público |
| `POST` | `/api/games` | Crear juego | 🛡️ Admin |
| `PUT` | `/api/games/:id` | Actualizar juego | 🛡️ Admin |
| `DELETE` | `/api/games/:id` | Eliminar juego | 🛡️ Admin |
| `GET` | `/api/tournaments` | Listar torneos | Público |
| `GET` | `/api/tournaments/:id` | Detalle de torneo | Público |
| `POST` | `/api/tournaments` | Crear torneo | 🛡️ Admin |
| `PUT` | `/api/tournaments/:id` | Actualizar torneo | 🛡️ Admin |
| `DELETE` | `/api/tournaments/:id` | Eliminar torneo | 🛡️ Admin |
| `GET` | `/api/registrations/me` | Mis inscripciones | 🔐 Sesión |
| `POST` | `/api/registrations` | Inscribirse a un torneo | 🔐 Sesión |
| `PATCH` | `/api/registrations/:id/status` | Cambiar estado de inscripción | 🛡️ Admin |
| `DELETE` | `/api/registrations/:id` | Eliminar inscripción | 🔐 Sesión |

> 🔐 = requiere token JWT · 🛡️ = requiere rol `admin`

---

## 🗃️ Modelo de datos

| Entidad | Campos principales |
|---|---|
| **User** | `id`, `username`, `email`, `password` (hash), `role`, `created_at` |
| **Game** | `id`, `name`, `slug`, `description`, `cover_url` |
| **Tournament** | `id`, `game_id`, `name`, `description`, `status`, `max_players`, `starts_at` |
| **Registration** | `id`, `user_id`, `tournament_id`, `status`, `created_at` |

Relaciones: un **Game** tiene muchos **Tournaments**; un **Tournament** tiene muchas
**Registrations**; un **User** tiene muchas **Registrations**.

---

## 🗺️ Roadmap

- [x] Scaffolding del monorepo (client + server)
- [ ] Esquema SQL definitivo (`database/schema.sql`)
- [ ] Autenticación (register / login / JWT)
- [ ] CRUD de juegos
- [ ] CRUD de torneos
- [ ] Inscripciones y gestión de estados
- [ ] Panel de administración (frontend)
- [ ] Validaciones con `express-validator`
- [ ] Pruebas

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.

<div align="center">

Hecho con ❤️ y ☕ — **Plataforma Torneos**

</div>
