# 🏙️ CIVIC-PULSE — Smart Municipal Operations Platform

<div align="center">

![CIVIC-PULSE Banner](https://img.shields.io/badge/CIVIC--PULSE-Smart%20City%20Platform-0ea5e9?style=for-the-badge&logo=city&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-ISC-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

**Turning Jaipur City Problems into Real-Time Action.**

*A full-stack civic engagement platform built for the Smart City Hackathon — enabling citizens to report issues, officials to act, and ministry to oversee — all in one unified system.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [User Roles & Dashboards](#-user-roles--dashboards)
- [Authentication System](#-authentication-system)
- [Database Models](#-database-models)
- [API Reference](#-api-reference)
- [Backend Services](#-backend-services)
- [Frontend Pages & Components](#-frontend-pages--components)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Docker Setup](#-docker-setup)
- [Demo Accounts](#-demo-accounts)
- [Data Flow](#-data-flow)
- [Complaint Lifecycle](#-complaint-lifecycle)
- [City Health Score Algorithm](#-city-health-score-algorithm)
- [Priority Engine](#-priority-engine)
- [What-If Simulator](#-what-if-simulator)
- [DigiLocker Verification](#-digilocker-verification)
- [Contributing](#-contributing)

---

## 🌟 Overview

**CIVIC-PULSE** is a production-grade, full-stack civic engagement and smart city operations platform designed for **Jaipur Municipal Corporation (JMC)**. It enables seamless communication between citizens, field workers, department officials, and ministry-level administrators through a single, real-time unified interface.

The platform addresses a core urban governance challenge: the massive gap between a citizen reporting a civic issue and that issue actually being resolved. With CIVIC-PULSE, every complaint follows a transparent, auditable lifecycle with:
- ⚡ Sub-30-second issue reporting with automatic GPS pin-drop
- 📊 Real-time city health scoring
- 🗺️ Interactive live complaint map
- 🔐 DigiLocker-based government identity verification
- 📱 Role-based dashboards for every stakeholder
- 📈 Ministry-level compliance and analytics

---

## ✨ Key Features

### For Citizens
- **1-tap Issue Reporting** — Submit complaints in under 30 seconds via a multi-step wizard
- **Real-Time Status Tracking** — Track complaint progress through a visual timeline
- **GPS Location Pinning** — Exact location attached automatically or manually placed on map
- **Citizen Verification** — Verify resolution before complaint is officially closed
- **Reputation System** — Earn points for active civic participation
- **Anonymous Reporting** — Option to file complaints without revealing identity
- **Emergency Alerts** — Receive and view city-wide emergency notifications

### For Field Workers
- **Assigned Task Queue** — View all complaints assigned to their zone/department
- **Status Updates** — Update complaint progress from the field
- **Location-Based Filtering** — See complaints near their current location

### For Department Officials
- **Department Dashboard** — Full overview of department complaints, SLA compliance, and worker performance
- **Worker Management** — Assign field workers to complaints, track deployment
- **SLA Monitoring** — Real-time visibility into breached and at-risk SLAs
- **Escalation Tools** — Escalate or reject complaints with documented reasons
- **Analytics** — Resolution rate, average resolution time, backlog index

### For Ministry / IAS Officers
- **Cross-Department Oversight** — Monitor all departments under jurisdiction
- **Ministry Directives** — Issue binding directives to departments
- **Compliance Ratings** — Automatic compliance scoring for each department
- **What-If Simulator** — Project city health improvement scenarios
- **Aggregate Analytics** — City-wide performance metrics and trends

### For Admins
- **User Management** — Full CRUD on all users and roles
- **Seed Database** — One-click seed endpoint to populate demo data
- **System Health** — Backend health monitoring

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        CIVIC-PULSE Platform                    │
├──────────────────────────┬─────────────────────────────────────┤
│      FRONTEND (Next.js)  │        BACKEND (Express.js)         │
│      Port: 3000/3001     │        Port: 8080                   │
│                          │                                     │
│  ┌─────────────────────┐ │  ┌──────────────────────────────┐   │
│  │  Next.js App Router │ │  │  Express REST API            │   │
│  │  (React + TS)       │ │  │  /api/v1/*                   │   │
│  │                     │ │  │                              │   │
│  │  ┌───────────────┐  │ │  │  ┌──────────────────────┐   │   │
│  │  │ API Routes    │  │ │  │  │ Auth Routes          │   │   │
│  │  │ /app/api/**   │◄─┼─┼──┼─►│ /api/v1/auth/*       │   │   │
│  │  └───────────────┘  │ │  │  └──────────────────────┘   │   │
│  │  ┌───────────────┐  │ │  │  ┌──────────────────────┐   │   │
│  │  │ Zustand Store │  │ │  │  │ Analytics Services   │   │   │
│  │  │ useCivicStore │  │ │  │  │ CityHealthScore      │   │   │
│  │  └───────────────┘  │ │  │  │ WhatIfSimulator      │   │   │
│  └─────────────────────┘ │  │  │ PriorityEngine       │   │   │
│                          │  │  └──────────────────────┘   │   │
│                          │  └──────────────────────────────┘   │
│                          │              │                       │
│                          │              ▼                       │
│                          │  ┌──────────────────────────────┐   │
│                          │  │     MongoDB Database          │   │
│                          │  │     civicpulse DB            │   │
│                          │  │                              │   │
│                          │  │  Collections:                │   │
│                          │  │  • users                     │   │
│                          │  │  • complaints                │   │
│                          │  │  • complaintcategories       │   │
│                          │  │  • departments               │   │
│                          │  │  • cityzones                 │   │
│                          │  │  • complaintstatushistories  │   │
│                          │  └──────────────────────────────┘   │
└──────────────────────────┴─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 15.x | Full-stack React framework (App Router) |
| **TypeScript** | 5.x | Type safety across the entire frontend |
| **Zustand** | Latest | Global state management |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Lucide React** | Latest | Icon library |
| **Mongoose** | 7+ | MongoDB ODM (used in Next.js API routes) |
| **bcryptjs** | 3.x | Password hashing in Next.js API layer |
| **jsonwebtoken** | 9.x | JWT signing and verification |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20.x | JavaScript runtime |
| **Express.js** | 5.x | REST API framework |
| **MongoDB** | 7+ | NoSQL database |
| **Mongoose** | 9.x | MongoDB ODM for backend |
| **bcryptjs** | 3.x | Password hashing |
| **jsonwebtoken** | 9.x | JWT access + refresh tokens |
| **cookie-parser** | 1.4.x | HTTP cookie management |
| **cors** | 2.8.x | Cross-Origin Resource Sharing |
| **dotenv** | 17.x | Environment variable management |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** | Containerisation |
| **Docker Compose** | Multi-service orchestration |
| **MongoDB Compass** | Database GUI (development) |

---

## 📁 Project Structure

```
CIVIC-PULSE/
│
├── 📄 README.md                    # This file
├── 📄 docker-compose.yml           # Docker orchestration (mongo + backend + frontend)
├── 📄 .gitignore
│
├── 🐳 docker/
│   ├── backend.Dockerfile          # Backend container image
│   └── frontend.Dockerfile         # Frontend container image (multi-stage)
│
├── 🖥️  backend/                     # Express.js REST API server
│   ├── .env                        # Backend environment variables
│   ├── package.json                # Backend dependencies (ESM modules)
│   └── src/
│       ├── server.js               # Entry point — Express app setup, DB connect
│       │
│       ├── controllers/
│       │   └── authController.js   # register(), login(), getMe()
│       │
│       ├── middleware/
│       │   └── auth.js             # authenticate(), requireRole(), generateTokens(), verifyRefreshToken()
│       │
│       ├── models/
│       │   ├── User.js             # User schema (bcrypt pre-save hook)
│       │   ├── Complaint.js        # Complaint schema (GeoJSON, SLA, severity)
│       │   ├── ComplaintCategory.js
│       │   ├── ComplaintStatusHistory.js
│       │   ├── Department.js
│       │   └── CityZone.js
│       │
│       ├── routes/
│       │   ├── auth.js             # POST /register, POST /login, GET /me
│       │   └── authRefresh.js      # POST /refresh, POST /logout
│       │
│       └── services/
│           ├── CityHealthScoreService.js   # 0-100 city health score calculator
│           ├── PriorityEngineService.js    # Complaint priority classifier
│           └── WhatIfSimulatorService.js   # Resolution impact projector
│
└── 🌐 frontend/                    # Next.js 15 App Router application
    ├── .env.local                  # Frontend environment variables
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    └── src/
        │
        ├── app/                    # Next.js App Router pages
        │   ├── layout.tsx          # Root layout (fonts, metadata)
        │   ├── page.tsx            # Home / Public Dashboard
        │   ├── globals.css         # Global CSS
        │   │
        │   ├── login/
        │   │   └── page.tsx        # Login page
        │   ├── register/
        │   │   └── page.tsx        # Registration page (multi-role)
        │   ├── verify-authority/
        │   │   └── page.tsx        # DigiLocker verification flow
        │   ├── transparency/       # Public transparency portal
        │   │
        │   ├── citizen/            # Citizen-specific pages
        │   │   ├── page.tsx        # Citizen dashboard
        │   │   ├── report/         # Report new issue wizard
        │   │   └── complaints/     # My complaints list
        │   │
        │   ├── official/           # Department official pages
        │   │   ├── page.tsx        # Official dashboard (SLA, workers, analytics)
        │   │   └── workers/        # Worker management
        │   │
        │   ├── ministry/
        │   │   └── page.tsx        # Ministry oversight dashboard
        │   │
        │   ├── worker/
        │   │   └── page.tsx        # Field worker task queue
        │   │
        │   ├── admin/
        │   │   └── page.tsx        # Admin panel
        │   │
        │   ├── city/               # City-wide public map view
        │   │
        │   └── api/                # Next.js API Routes (server-side)
        │       ├── auth/
        │       │   ├── login/      # POST /api/auth/login
        │       │   │   └── route.ts
        │       │   ├── register/   # POST /api/auth/register
        │       │   │   └── route.ts
        │       │   └── me/         # GET /api/auth/me
        │       │       └── route.ts
        │       ├── complaints/     # GET/POST /api/complaints
        │       │   ├── route.ts
        │       │   └── [id]/       # GET/PATCH /api/complaints/:id
        │       ├── city/           # City health score endpoint
        │       ├── seed/           # POST /api/seed (admin data seeder)
        │       └── verify/         # POST /api/verify (DigiLocker mock)
        │
        ├── components/
        │   ├── common/
        │   │   ├── RoleSwitcher.tsx        # Role-based nav / login links
        │   │   └── EmergencyBanner.tsx     # City-wide emergency alert banner
        │   ├── dashboard/
        │   │   └── CityHealthCard.tsx      # City health score widget
        │   ├── complaints/
        │   │   ├── ReportIssueWizard.tsx   # Multi-step complaint submission form
        │   │   └── StatusTimeline.tsx      # Complaint status progress timeline
        │   ├── admin/
        │   │   └── WhatIfSimulator.tsx     # Resolution impact scenario tool
        │   ├── map/
        │   │   └── InteractiveCityMap.tsx  # SVG-based live complaint map
        │   └── layout/                     # Shared layout components
        │
        ├── store/
        │   └── useCivicStore.ts    # Zustand global store (920 lines)
        │                           # All app state: users, complaints, zones,
        │                           # departments, workers, health scores, alerts
        │
        ├── lib/
        │   ├── db.ts               # MongoDB singleton connection manager
        │   ├── jwt.ts              # JWT sign/verify helpers
        │   ├── utils.ts            # Utilities: priority calc, formatting, badges
        │   └── models/
        │       ├── User.ts         # Mongoose User model (frontend API routes)
        │       └── Complaint.ts    # Mongoose Complaint model
        │
        └── types/
            └── index.ts            # Shared TypeScript type definitions
```

---

## 👥 User Roles & Dashboards

The platform supports **5 distinct user roles**, each with a tailored interface:

### 1. 🧑 CITIZEN
- **Path:** `/citizen`
- **Capabilities:** Report issues, track complaints, verify resolutions, earn reputation
- **Demo Account:** `citizen@civicpulse.gov.in`

### 2. 🪖 FIELD_WORKER
- **Path:** `/worker`
- **Capabilities:** View assigned complaints, update status, mark progress
- **Demo Account:** `worker@civicpulse.gov.in`

### 3. 👔 OFFICIAL (Department)
- **Path:** `/official`
- **Capabilities:** Manage department complaints, assign workers, monitor SLA, run analytics
- **Demo Account:** `official@civicpulse.gov.in`

### 4. 🏛️ MINISTRY (IAS / Principal Secretary)
- **Path:** `/ministry`
- **Capabilities:** Cross-department oversight, issue directives, compliance monitoring, city-level analytics
- **Demo Account:** `ministry@civicpulse.gov.in`

### 5. ⚙️ ADMIN
- **Path:** `/admin`
- **Capabilities:** Full user management, data seeding, system health monitoring
- **Demo Account:** `admin@civicpulse.gov.in`

---

## 🔐 Authentication System

CIVIC-PULSE implements a **dual-layer JWT authentication** system:

### Frontend Authentication (Next.js API Routes)
The frontend has its own auth layer using Next.js API routes that connect directly to MongoDB via Mongoose:

```
POST /api/auth/register    → Creates user, hashes password, returns JWT
POST /api/auth/login       → Validates credentials, returns JWT  
GET  /api/auth/me          → Returns current user profile (requires JWT)
```

**Token Strategy:**
- Single long-lived JWT (`7d` expiry) stored in localStorage / app state
- Password hashing using `bcryptjs` with salt rounds = 10
- JWT signed with `JWT_SECRET` (from `.env.local`)

### Backend Authentication (Express API)
The Express backend has its own fully independent JWT auth with **Access + Refresh token rotation**:

```
POST /api/v1/auth/register   → Register user, returns accessToken + sets refreshToken cookie
POST /api/v1/auth/login      → Login, returns accessToken + sets refreshToken cookie
GET  /api/v1/auth/me         → Protected route (requires Bearer token)
POST /api/v1/auth/refresh    → Rotates tokens using httpOnly refresh cookie
POST /api/v1/auth/logout     → Clears refresh token cookie
```

**Token Strategy:**
- **Access Token:** Short-lived (15 minutes), sent as Bearer in `Authorization` header
- **Refresh Token:** Long-lived (7 days), stored in `httpOnly; SameSite=Strict` cookie — not accessible to JavaScript (XSS-safe)
- Automatic token rotation on every `/refresh` call

### Auth Middleware (`backend/src/middleware/auth.js`)

```javascript
// Protect any route with:
router.get('/protected-route', authenticate, handler);

// Protect with role requirement:
router.delete('/admin-only', authenticate, requireRole('ADMIN'), handler);
```

### Password Security
- Passwords are **never stored in plaintext**
- `bcryptjs` with `saltRounds: 10` is used for hashing
- The `pre('save')` Mongoose hook automatically hashes the password field before persistence
- > ⚠️ **Important (Mongoose 7+ compatibility):** The pre-save hook must be declared as `async function()` without a `next` parameter. Calling `next()` inside an async hook throws `TypeError: next is not a function` in Mongoose 7+.

---

## 🗄️ Database Models

All models live in `backend/src/models/` (used by Express) and `frontend/src/lib/models/` (used by Next.js API routes).

### User Model

| Field | Type | Description |
|---|---|---|
| `email` | String (unique) | User's login email |
| `passwordHash` / `password` | String | bcrypt-hashed password |
| `firstName` | String | First name |
| `lastName` | String | Last name |
| `phone` | String? | Contact number |
| `role` | Enum | `CITIZEN`, `WORKER`, `OFFICIAL`, `ADMIN`, `MINISTRY`, `FIELD_WORKER` |
| `isActive` | Boolean | Account active status |
| `isSuspended` | Boolean | Suspension flag |
| `avatarUrl` | String? | Profile picture URL |
| `departmentId` | String? | For OFFICIAL / FIELD_WORKER |
| `zoneId` | String? | For CITIZEN |
| `ministryId` | String? | For MINISTRY |
| `employeeId` | String? | Government employee ID |
| `designation` | String? | Official title/designation |
| `reputationPoints` | Number | Civic reputation score |
| `isVerified` | Boolean | Account verification status |
| `digiLockerVerified` | Boolean | DigiLocker identity check |
| `digiLockerDocId` | String? | Verified DigiLocker document ID |
| `govIdType` | Enum? | `AADHAAR`, `GOV_EMPLOYEE_ID`, etc. |
| `govIdNumber` | String? | Masked government ID |
| `lastLoginAt` | Date? | Last login timestamp |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

### Complaint Model

| Field | Type | Description |
|---|---|---|
| `complaintNumber` | String (unique) | Human-readable ID (e.g., `CP-2024-001`) |
| `citizen` | ObjectId → User | Complaint reporter |
| `category` | ObjectId → ComplaintCategory | Issue category |
| `department` | ObjectId → Department | Assigned department |
| `zone` | ObjectId → CityZone | City zone |
| `title` | String | Short issue title |
| `description` | String | Detailed description |
| `status` | Enum | See [Complaint Lifecycle](#-complaint-lifecycle) |
| `priority` | Enum | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `severity` | Enum | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `affectedCount` | Number | Number of people affected |
| `address` | String? | Street address |
| `landmark` | String? | Nearby landmark |
| `city` | String? | City name |
| `pincode` | String? | Postal code |
| `location` | GeoJSON Point | `[longitude, latitude]` for map display |
| `slaDeadline` | Date? | Service Level Agreement deadline |
| `slaBreached` | Boolean | Whether SLA was missed |
| `isEmergency` | Boolean | Emergency flag (boosts priority) |
| `isAnonymous` | Boolean | Anonymous submission flag |
| `resolvedAt` | Date? | Resolution timestamp |
| `closedAt` | Date? | Closure timestamp |

> The Complaint model includes a **`2dsphere` geospatial index** on the `location` field, enabling efficient geo-queries for nearby complaints.

### Other Models

**ComplaintCategory**
- `name`, `code`, `description`, `iconName`
- `defaultPriority` — initial priority assigned based on category
- `slaHours` — hours before SLA breach
- `categoryWeight` — weight in city health score calculation

**Department**
- `name`, `code`, `description`
- `headName`, `phone`, `email`
- `colorHex` — for UI colour coding

**CityZone**
- `name`, `code`, `population`, `areaSqkm`
- `zonalOfficerName`, `zonalOfficeContact`

**ComplaintStatusHistory**
- Full audit trail of every status transition for a complaint
- Who changed it, when, and any notes

---

## 📡 API Reference

### Backend API (Express — Port 8080)

#### Health Check
```
GET /api/v1/health
Response: { "status": "UP", "service": "civicpulse-backend" }
```

#### Authentication
```
POST /api/v1/auth/register
Body: { email, password, firstName, lastName, role, phone? }
Response: { accessToken, user: { id, email, role, firstName, lastName } }
Sets Cookie: refreshToken (httpOnly)

POST /api/v1/auth/login
Body: { email, password }
Response: { accessToken, user: { id, email, role, firstName, lastName } }
Sets Cookie: refreshToken (httpOnly)

GET /api/v1/auth/me
Headers: Authorization: Bearer <accessToken>
Response: { user: { ...allFields } }

POST /api/v1/auth/refresh
Cookie: refreshToken=<token>
Response: { accessToken }
Sets Cookie: refreshToken (rotated)

POST /api/v1/auth/logout
Cookie: refreshToken=<token>
Response: { message: "Logged out" }
Clears Cookie: refreshToken
```

#### Analytics
```
GET /api/v1/city-health-score?zoneId=<optional>
Response: { score: 87.5 }

POST /api/v1/simulate-impact
Body: { complaintIds: ["id1", "id2"] }
Response: { currentScore, projectedScore, improvement }
```

---

### Frontend API Routes (Next.js — Port 3000)

#### Auth
```
POST /api/auth/register
Body: { email, password, firstName, lastName, role, phone?, departmentId?, zoneId?, ... }
Response: { success, message, token, user: { ...fullProfile } }

POST /api/auth/login
Body: { email, password }
Response: { success, token, user: { ...fullProfile } }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user: { ...fullProfile } }
```

#### Complaints
```
GET /api/complaints?departmentId=&citizenId=&status=&zoneId=
Response: { success, count, complaints: [...] }

POST /api/complaints
Body: { title, description, severity, categoryId, departmentId, zoneId, latitude?, longitude?, address?, ... }
Response: { success, complaint: { ...fullComplaint } }

GET /api/complaints/:id
Response: { success, complaint: { ...fullComplaint } }

PATCH /api/complaints/:id
Body: { status?, assignedWorkerId?, notes? }
Response: { success, complaint: { ...updated } }
```

#### City
```
GET /api/city/health-score
Response: { score, zones: [...], breakdown: { ... } }
```

#### Seeding (Admin Only)
```
POST /api/seed
Response: { success, message, counts: { users, complaints, ... } }
```

#### Verification (DigiLocker Mock)
```
POST /api/verify
Body: { govIdType, govIdNumber, userId }
Response: { success, verified, docId }
```

---

## ⚙️ Backend Services

### 1. CityHealthScoreService

**File:** `backend/src/services/CityHealthScoreService.js`

Calculates a **0–100 city health score** based on active (unresolved) complaints. A perfect city scores 100; each active complaint reduces the score:

```
Score deductions:
  CRITICAL severity   → -5 points per complaint
  HIGH severity       → -2 points per complaint
  MEDIUM/LOW          → -0.5 points per complaint
  SLA breached        → additional -3 points

Final score = max(0, round(score × 10) / 10)
```

**Usage:**
```javascript
import CityHealthScoreService from './services/CityHealthScoreService.js';

const score = await CityHealthScoreService.calculateScore('zone-id'); // or null for city-wide
// Returns: 87.5
```

---

### 2. PriorityEngineService

**File:** `backend/src/services/PriorityEngineService.js`

Classifies complaint priority based on category defaults and affected citizen count:

```
Priority Calculation:
  Emergency flag        → always CRITICAL (override)
  Base score from category.defaultPriority
  +2 if affectedCount > 50
  +1 if affectedCount > 10

  baseScore ≥ 4 → CRITICAL
  baseScore = 3  → HIGH
  baseScore = 2  → MEDIUM
  baseScore = 1  → LOW
```

**Usage:**
```javascript
import PriorityEngineService from './services/PriorityEngineService.js';

const priority = PriorityEngineService.calculatePriority(category, 75, false);
// Returns: 'HIGH'
```

---

### 3. WhatIfSimulatorService

**File:** `backend/src/services/WhatIfSimulatorService.js`

Projects the impact on city health score if specific complaints were resolved today — enables officials to prioritize actions with highest civic benefit:

```javascript
import WhatIfSimulatorService from './services/WhatIfSimulatorService.js';

const result = await WhatIfSimulatorService.simulateResolutionImpact(['id1', 'id2']);
// Returns:
// {
//   currentScore: 72.5,
//   projectedScore: 85.0,
//   improvement: 12.5
// }
```

**API Endpoint:**
```
POST /api/v1/simulate-impact
Body: { complaintIds: ["id1", "id2"] }
```

---

## 🖼️ Frontend Pages & Components

### Pages

| Route | Component | Description |
|---|---|---|
| `/` | `page.tsx` | Public home dashboard with live stats, map, recent complaints |
| `/login` | `login/page.tsx` | Login form with role-aware redirect |
| `/register` | `register/page.tsx` | Multi-role registration with optional DigiLocker |
| `/verify-authority` | `verify-authority/page.tsx` | Government identity verification |
| `/citizen` | `citizen/page.tsx` | Citizen dashboard |
| `/citizen/report` | `citizen/report/page.tsx` | Multi-step complaint submission wizard |
| `/citizen/complaints` | `citizen/complaints/page.tsx` | Personal complaint history |
| `/official` | `official/page.tsx` | Department official dashboard |
| `/official/workers` | `official/workers/page.tsx` | Field worker management |
| `/worker` | `worker/page.tsx` | Field worker task queue |
| `/ministry` | `ministry/page.tsx` | Ministry oversight dashboard |
| `/admin` | `admin/page.tsx` | Admin control panel |
| `/city` | `city/page.tsx` | Public city map and analytics |
| `/transparency` | `transparency/page.tsx` | Open government data portal |

### Key Components

#### `ReportIssueWizard.tsx`
Multi-step form for complaint submission:
1. **Category Selection** — Choose issue type with icon grid
2. **Location** — GPS auto-detect or manual map pin
3. **Details** — Title, description, severity, affected count
4. **Media** — Photo/video upload (optional)
5. **Review & Submit** — Confirmation with priority preview

#### `InteractiveCityMap.tsx`
SVG-based live complaint map showing:
- Zone boundaries with colour-coded health scores
- Complaint pins with severity indicators
- Clickable pins with complaint details popup
- Real-time update via Zustand store

#### `CityHealthCard.tsx`
Dashboard widget displaying:
- Current city health score (0–100)
- Score trend (improving/declining)
- Top contributing problem categories
- Zone-wise breakdown

#### `WhatIfSimulator.tsx`
Interactive tool for ministry/official users:
- Select complaints from a filterable list
- Preview projected health score improvement
- Compare current vs. projected scores side-by-side
- Powered by backend `/api/v1/simulate-impact` endpoint

#### `StatusTimeline.tsx`
Visual complaint lifecycle tracker showing:
- All status transitions with timestamps
- Who actioned each change
- SLA deadlines and breach indicators

#### `EmergencyBanner.tsx`
Site-wide alert banner for city emergencies:
- Dismissable by user
- Severity-coded (WARNING / CRITICAL)
- Links to related complaints or official advisories

#### `RoleSwitcher.tsx`
Dev/demo navigation component:
- Quick-switch between role dashboards
- Login / Register shortcut links
- Shows current active role

### Global State — `useCivicStore.ts`

The Zustand store (`920+ lines`) is the single source of truth for the entire frontend application:

```typescript
interface CivicStore {
  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Complaints
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;

  // Departments
  departments: Department[];
  categories: ComplaintCategory[];

  // Zones & Map
  zones: CityZone[];
  healthScore: CityHealthScore;

  // Workers
  workers: FieldWorker[];
  assignWorker: (complaintId: string, workerId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  alerts: EmergencyAlert[];

  // Ministry
  ministries: Ministry[];
  directives: MinistryDirective[];
}
```

---

## 🌍 Environment Variables

### Backend — `backend/.env`
```env
# Server
PORT=8080
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/civicpulse

# JWT — Access + Refresh token secrets (must be different!)
JWT_ACCESS_SECRET=your-super-secret-jwt-access-key
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS — comma-separated list of allowed origins
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend — `frontend/.env.local`
```env
# MongoDB (used by Next.js API routes)
MONGODB_URI=mongodb://localhost:27017/civicpulse

# JWT Secret (must match for token verification)
JWT_SECRET=civicpulse_production_jwt_super_secret_key_2026_smart_city_jaipur

# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

> ⚠️ **Security Note:** Never commit `.env` or `.env.local` files to version control. Both are listed in `.gitignore`. Use strong, randomly-generated secrets in production.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **npm** v9 or higher
- **MongoDB** v7+ (local install or MongoDB Atlas)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/CIVIC-PULSE.git
cd CIVIC-PULSE
```

### 2. Start MongoDB

If running MongoDB locally:
```bash
# Windows (if installed as a service)
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

### 3. Set Up the Backend

```bash
cd backend

# Copy environment file
copy .env.example .env    # (or manually create .env)

# Install dependencies
npm install

# Start the backend server
npm start
# OR for auto-reload on file changes:
npm run dev
```

Backend will start at: **http://localhost:8080**

Verify: `GET http://localhost:8080/api/v1/health`
Expected: `{ "status": "UP", "service": "civicpulse-backend" }`

### 4. Set Up the Frontend

```bash
cd ../frontend

# Create environment file
# Create .env.local with the content from the Environment Variables section above

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will start at: **http://localhost:3000**

### 5. Seed Demo Data (Optional)

Once both servers are running, seed the database with demo users and complaints:

```bash
curl -X POST http://localhost:3000/api/seed
```

Or visit `http://localhost:3000/api/seed` in your browser (POST request via Postman or similar).

### 6. Log In

Use any of the [Demo Accounts](#-demo-accounts) below, or register a new account at `/register`.

---

## 🐳 Docker Setup

Run the entire stack (MongoDB + Backend + Frontend) with a single command:

```bash
# From the project root
docker-compose up --build
```

**Services started:**
| Service | Port | Container Name |
|---|---|---|
| MongoDB | 27017 | `civicpulse_mongo` |
| Backend (Express) | 8080 | `civicpulse_backend` |
| Frontend (Next.js) | 3000 | `civicpulse_frontend` |

**Stop all services:**
```bash
docker-compose down
```

**Stop and remove volumes (clean slate):**
```bash
docker-compose down -v
```

### Docker Compose Environment Overrides

Create a `.env` file in the project root to override defaults:

```env
DB_USER=admin
DB_PASSWORD=your_strong_password
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRATION_MS=86400000
```

---

## 🎭 Demo Accounts

All demo accounts use password: **`password123`**

| Role | Email | Description |
|---|---|---|
| **CITIZEN** | `citizen@civicpulse.gov.in` | Rahul Sharma, Mansarovar Zone |
| **FIELD_WORKER** | `worker@civicpulse.gov.in` | Amit Kumar, Roads Dept. |
| **OFFICIAL** | `official@civicpulse.gov.in` | Executive Engineer, Roads & Infrastructure |
| **MINISTRY** | `ministry@civicpulse.gov.in` | Dr. Jogaram IAS, DLB Rajasthan |
| **ADMIN** | `admin@civicpulse.gov.in` | Vikramaditya Rathore, Municipal Commissioner |

> These demo accounts are available even before seeding the database — the login API has fallback in-memory demo records for instant standalone demo mode.

---

## 🔄 Data Flow

### Complaint Submission Flow

```
Citizen fills ReportIssueWizard
         │
         ▼
POST /api/complaints (Next.js API Route)
         │
         ├─── Validate input fields
         ├─── Connect to MongoDB
         ├─── Calculate priority (deterministic algorithm)
         ├─── Generate complaint number (CP-YYYY-XXXX)
         ├─── Calculate SLA deadline from category.slaHours
         ├─── Save to MongoDB complaints collection
         └─── Return created complaint
         │
         ▼
useCivicStore.addComplaint() — updates global state
         │
         ▼
UI re-renders: Map pin appears, dashboard count updates
```

### Authentication Flow (Frontend)

```
User submits Login form
         │
         ▼
POST /api/auth/login (Next.js API Route)
         │
         ├─── Find user in MongoDB by email
         ├─── bcrypt.compare(password, hashedPassword)
         ├─── If match: signJwt({ userId, email, role, ... })
         └─── Return { success, token, user }
         │
         ▼
Frontend stores token (Zustand state / localStorage)
         │
         ▼
Role-based redirect:
  CITIZEN      → /citizen
  OFFICIAL     → /official
  MINISTRY     → /ministry
  FIELD_WORKER → /worker
  ADMIN        → /admin
```

---

## 🔁 Complaint Lifecycle

Every complaint moves through a structured pipeline:

```
REPORT_SUBMITTED
      │
      ▼ (Official reviews)
   IN_REVIEW
      │
      ▼ (Department assigns worker)
   ASSIGNED
      │
      ▼ (Worker begins work)
  IN_PROGRESS
      │
      ├──────────────────► REJECTED (with reason)
      │
      ▼ (Worker marks done)
   RESOLVED
      │
      ▼ (Citizen confirms fix)
CITIZEN_VERIFIED → CLOSED
      │
      ▼ (Citizen disputes fix)
   REOPENED → (back to IN_REVIEW)
      │
      ▼ (Escalated by official)
  ESCALATED → (routed to Ministry)
```

**SLA Monitoring:**
- Each category has a defined `slaHours` value
- `slaDeadline` is set automatically on complaint creation
- `slaBreached` flag is set if the complaint is not resolved by the deadline
- SLA breaches deduct additional points from city health score (-3 each)

---

## 🏥 City Health Score Algorithm

The City Health Score (0–100) provides a single, real-time measure of municipal service quality:

```javascript
// Pseudocode
let score = 100;

for each active_complaint in (unresolved complaints):
  if (complaint.severity === 'CRITICAL') score -= 5;
  else if (complaint.severity === 'HIGH') score -= 2;
  else score -= 0.5;                         // MEDIUM / LOW

  if (complaint.slaBreached) score -= 3;     // Additional SLA penalty

return max(0, round(score × 10) / 10);      // Floor at 0, 1 decimal
```

**Score Interpretation:**
| Score | Status | Colour |
|---|---|---|
| 90–100 | 🟢 Excellent | Green |
| 70–89 | 🟡 Good | Yellow |
| 50–69 | 🟠 Fair | Orange |
| 30–49 | 🔴 Poor | Red |
| 0–29 | ⛔ Critical | Dark Red |

---

## 🎯 Priority Engine

Complaint priority is determined automatically at submission time by `PriorityEngineService`:

```
Input:  category (with defaultPriority), affectedCount, isEmergency

Logic:
  1. If isEmergency → CRITICAL (override all)
  2. baseScore from category.defaultPriority:
       CRITICAL → 4
       HIGH     → 3
       MEDIUM   → 2
       LOW      → 1
  3. affectedCount boosts:
       > 50 → +2
       > 10 → +1
  4. Final score maps to:
       ≥ 4 → CRITICAL
        3  → HIGH
        2  → MEDIUM
        1  → LOW
```

**Examples:**
- Pothole (MEDIUM category) + 15 affected → `baseScore = 2 + 1 = 3` → **HIGH**
- Sewage overflow (HIGH category) + 5 affected + isEmergency → **CRITICAL**
- Street light broken (LOW category) + 3 affected → `baseScore = 1` → **LOW**

---

## 🔮 What-If Simulator

The What-If Simulator helps officials and ministry personnel make data-driven prioritization decisions:

**How it works:**
1. Select any set of open complaints from the list
2. The system calculates how much each complaint contributes to the health score deficit
3. Projects the city health score if all selected complaints were resolved right now
4. Shows the improvement delta

**Formula:**
```
projectedScore = min(100, currentScore + Σ(scoreRecoveredPerComplaint))

Where per complaint:
  CRITICAL severity → recovers 5 points
  HIGH severity     → recovers 2 points
  MEDIUM/LOW        → recovers 0.5 points
  slaBreached       → recovers additional 3 points
```

**API:**
```
POST /api/v1/simulate-impact
Body: { complaintIds: ["abc123", "def456"] }
Response: {
  currentScore: 72.5,
  projectedScore: 85.0,
  improvement: 12.5
}
```

---

## 🪪 DigiLocker Verification

Government officials (OFFICIAL, MINISTRY) are required to verify their identity through DigiLocker before accessing sensitive features:

**Verification Flow:**
1. After registration, government-role users are prompted to verify
2. User selects their credential type:
   - `GOV_EMPLOYEE_ID` — for department officials
   - `OFFICER_SERVICE_CARD` — for IAS/IPS officers
   - `MINISTERIAL_CREDENTIAL` — for ministry staff
   - `AADHAAR` — for citizens (optional)
3. User enters their government ID number
4. System verifies via `POST /api/verify`
5. On success: `digiLockerVerified: true`, `digiLockerDocId` assigned
6. Only verified officials can access department management features

> **Note:** The current implementation uses a **mock DigiLocker integration** for hackathon purposes. In production, this would connect to the real [DigiLocker API](https://www.digilocker.gov.in/developer.html).

---

## 🧪 Testing the APIs

### Quick Health Check
```bash
curl http://localhost:8080/api/v1/health
```

### Register a New User (Backend)
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"mypassword","firstName":"Test","lastName":"User","role":"CITIZEN"}'
```

### Login (Backend)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"mypassword"}'
```

### Register a New User (Frontend)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"mypassword","firstName":"Test","lastName":"User","role":"CITIZEN"}'
```

### Get City Health Score
```bash
curl http://localhost:8080/api/v1/city-health-score
```

### Simulate Impact
```bash
curl -X POST http://localhost:8080/api/v1/simulate-impact \
  -H "Content-Type: application/json" \
  -d '{"complaintIds":["complaint-id-1","complaint-id-2"]}'
```

---

## 🤝 Contributing

This project was built for the **Smart City Hackathon — CivicSense Challenge**.

If you'd like to extend or contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Code Style
- TypeScript for all frontend code
- ES Modules (`import/export`) throughout backend
- Async/await preferred over callbacks
- Mongoose 7+ hook compatibility: async pre-hooks must NOT use `next()` parameter

### Folder Conventions
- New backend services → `backend/src/services/`
- New API routes → `frontend/src/app/api/<resource>/route.ts`
- New components → `frontend/src/components/<domain>/`
- New pages → `frontend/src/app/<role>/<page>/page.tsx`

---

## 📄 License

ISC License — see `package.json` for details.

---

<div align="center">

**Built with ❤️ for Smart City Jaipur**

*Connecting citizens to solutions, one complaint at a time.*

![Made for Hackathon](https://img.shields.io/badge/Made%20for-Smart%20City%20Hackathon-FF6B35?style=for-the-badge)
![Jaipur](https://img.shields.io/badge/City-Jaipur%2C%20Rajasthan-FF69B4?style=for-the-badge)

</div>
