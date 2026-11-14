# GlobalTrack — International Logistics & Freight Tracking Portal

A full-stack enterprise web application for managing and tracking international cargo shipments in real-time.

---

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Features](#features)
- [Default Credentials](#default-credentials)

---

## Overview

GlobalTrack provides two distinct interfaces:
- **Public Tracking Portal** — Any visitor can track a shipment using a code (no login required)
- **Admin/Staff Dashboard** — Authenticated operations management for logistics staff

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js, Helmet, CORS, JWT, bcryptjs |
| Database | MySQL 8+ / MariaDB 10.6+ |
| Driver | `mysql2` |

---

## Project Structure

```
GlobalTrack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js            # MySQL connection pool
│   │   │   └── seed.js          # Database seed script
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT authenticate + authorize middleware
│   │   │   └── errorHandler.js  # Global error handler
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── shipmentsController.js
│   │   │   ├── statsController.js
│   │   │   └── usersController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── publicRoutes.js
│   │   │   ├── shipmentsRoutes.js
│   │   │   ├── statsRoutes.js
│   │   │   └── usersRoutes.js
│   │   └── server.js            # Express app entry point
│   ├── sql/
│   │   └── schema.sql           # MySQL DDL: tables, foreign keys, indexes
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── StatusTimeline.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── LoadingSpinner.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state (JWT)
    │   ├── pages/
    │   │   ├── TrackPage.jsx     # Public tracking portal (F1.1–F1.3)
    │   │   ├── LoginPage.jsx     # Staff login (F2.1)
    │   │   ├── DashboardLayout.jsx
    │   │   ├── DashboardPage.jsx # Stats overview (F3.1)
    │   │   ├── ShipmentsPage.jsx # Registry + status updates (F3.2–F3.4)
    │   │   └── UsersPage.jsx     # User management (F3.5)
    │   ├── services/
    │   │   └── api.js            # Axios client + all API calls
    │   ├── utils/
    │   │   └── helpers.js        # Formatters, constants
    │   ├── App.jsx               # Router configuration
    │   ├── main.jsx
    │   └── index.css             # Tailwind base + custom components
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MySQL 8+ or MariaDB 10.6+

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Configure MySQL

```bash
cd backend
cp .env.example .env   # only if you do not already have a .env file
# Otherwise, add the DB_* settings below to your existing .env
```

**Backend `.env`:**
```
PORT=5000
JWT_SECRET=your_super_secret_key
DB_HOST=localhost
DB_PORT=3306
DB_NAME=globaltrack
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
FRONTEND_URL=http://localhost:5173
```

The backend connects to the configured MySQL database and does not create,
drop, or migrate existing tables on startup. The old
`backend/data/globaltrack.db` file is not used.

### 3. Create the Tables

Open `backend/sql/schema.sql` in MySQL Workbench (or your preferred MySQL tool)
and execute it. The script creates the `globaltrack` database and tables only
when they do not already exist; it does not drop tables or delete existing data.
If your database has a different name, select it and remove the `CREATE DATABASE`
and `USE globaltrack` lines before running the table definitions.

### 4. Seed Sample Data

```bash
cd backend
npm run seed
```

The seed command is safe to run more than once. It sets the documented
passwords for the three sample demo accounts and leaves existing shipment and
checkpoint rows unchanged. Run it only in development/demo databases. It
expects `DB_NAME` and the MySQL credentials to be set in `backend/.env`.

### 5. Start the Application

```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Frontend Dev Server
cd frontend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## Database Schema

The application uses MySQL. Sample data is managed separately by the seed command.

```
USERS
├── user_id       INT (PK, AUTO_INCREMENT)
├── full_name     VARCHAR(150)
├── email         VARCHAR(255) UNIQUE
├── password_hash VARCHAR(255)
├── role          ENUM('ADMIN','STAFF')
├── is_active     TINYINT(1) DEFAULT 1
└── created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP

SHIPMENTS
├── shipment_id       INT (PK, AUTO_INCREMENT)
├── tracking_code     VARCHAR(20) UNIQUE
├── sender_name       VARCHAR(200)
├── receiver_name     VARCHAR(200)
├── origin            VARCHAR(300)
├── destination       VARCHAR(300)
├── current_status    ENUM (shipment statuses)
├── estimated_delivery DATE
└── created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP

CHECKPOINTS
├── checkpoint_id   INT (PK, AUTO_INCREMENT)
├── shipment_id     INT FK → SHIPMENTS(shipment_id) ON DELETE CASCADE
├── location        VARCHAR(300)
├── status_note     VARCHAR(500)
└── checkpoint_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## API Reference

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/public/track/:code` | Track a shipment by code |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Shipments (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shipments` | List all (pagination, filter, sort) |
| GET | `/api/shipments/:id` | Single shipment + checkpoints |
| POST | `/api/shipments` | Create new shipment |
| PATCH | `/api/shipments/:id/status` | Update status + add checkpoint |
| DELETE | `/api/shipments/:id` | Delete (Admin only) |

### Stats (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard metrics |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create new account |
| PATCH | `/api/users/:id` | Update role / active status |
| DELETE | `/api/users/:id` | Delete account |

---

## Features

| Feature | Module | Status |
|---------|--------|--------|
| Public shipment search & tracking | F1.1 | ✅ |
| Dynamic status timeline visualization | F1.2 | ✅ |
| Error handling for invalid codes | F1.3 | ✅ |
| JWT-based staff authentication | F2.1 | ✅ |
| Role-Based Access Control (RBAC) | F2.2 | ✅ |
| Dashboard statistics overview | F3.1 | ✅ |
| Shipment creation with auto tracking code | F3.2 | ✅ |
| Shipment directory with pagination/filter | F3.3 | ✅ |
| Atomic status + checkpoint updates | F3.4 | ✅ |
| Admin user management | F3.5 | ✅ |

---

## Default Credentials

> ⚠️ Change these immediately in production!
>
> These credentials are for sample users inserted into a fresh database.
> Seeding preserves existing users and passwords, so they may not match your
> current MySQL records.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@globaltrack.com | Admin@1234 |
| Staff | sarah.mitchell@globaltrack.com | Staff@1234 |
| Staff | james.okonkwo@globaltrack.com | Staff@1234 |

---

## Demo Tracking Codes

| Code | Status |
|------|--------|
| TRK-983214 | In Transit |
| TRK-774501 | Customs Inspection |
| TRK-112938 | Delivered |
| TRK-558826 | Registered |
| TRK-329047 | Out for Delivery |

