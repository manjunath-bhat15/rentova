# Rentova — Peer-to-Peer Rental Platform

> A full-stack peer-to-peer rental and service management platform built with Spring Boot + React. Supports real-time notifications, OTP-based authentication, role-based access (User / Vendor / Admin), and booking workflows.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3.4.5 (Java 17) | REST API framework |
| Spring Security + JWT (jjwt 0.12.6) | Authentication & authorization |
| Spring Data JPA + Hibernate | ORM / database layer |
| Spring WebSocket + STOMP | Real-time notifications |
| Spring Mail + Brevo SMTP | Transactional email (OTP, booking alerts) |
| H2 (in-memory) | Local development database |
| PostgreSQL | Production database (Neon free tier) |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon library |

### Infrastructure
| Service | Role |
|---|---|
| Render | Backend hosting (free tier) |
| Vercel | Frontend hosting |
| Neon | PostgreSQL database (free tier) |
| GitHub Actions | CI/CD pipeline |

---

## Features

- **OTP Authentication** — Email-based verification for registration and login
- **Role-Based Access** — User, Vendor, and Admin roles with route guards
- **Real-Time Notifications** — WebSocket/STOMP with SockJS fallback
- **Booking Workflow** — Request, approval, active rental, return cycle
- **Admin Dashboard** — User management, service oversight, analytics
- **Vendor Panel** — Listing management, booking approvals, earnings

---

## Quick Start

### Prerequisites
- Java 17+ (JDK)
- Node.js 18+

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
API available at `http://localhost:8080`

> **Dev shortcut**: OTP bypass is enabled locally. Use `123456` as the OTP code for any verification step without needing real email credentials.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:5173`

### Docker (Full Stack)
```bash
docker-compose up --build
```

---

## Project Structure
```
rentova/
├── backend/
│   └── src/main/
│       ├── java/com/rentova/
│       │   ├── config/          # Security, CORS, Async, WebSocket, DB Seeder
│       │   ├── controller/      # REST controllers (Auth, User, Booking, Admin, Vendor)
│       │   ├── model/           # JPA entities
│       │   ├── repository/      # Spring Data JPA repositories
│       │   └── service/         # Business logic (UserService, EmailService, BookingService...)
│       └── resources/
│           └── application.yml  # Multi-profile config (default + prod)
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level pages (Landing, Dashboard, Admin, Vendor...)
│   │   └── App.jsx
│   └── index.html
├── docker-compose.yml
├── render.yaml                  # Render deployment config
├── vercel.json                  # Vercel SPA routing config
├── .github/workflows/
│   ├── backend-ci.yml
│   └── frontend-ci.yml
└── README.md
```

---

## Environment Variables

### Backend (Render → Environment)

| Variable | Required | Description |
|---|---|---|
| `BREVO_SMTP_USER` | ✅ Prod | Brevo SMTP login (email address) |
| `BREVO_SMTP_KEY` | ✅ Prod | Brevo SMTP password / API key |
| `JWT_SECRET` | ✅ Prod | JWT signing secret (min 256-bit string) |
| `SPRING_DATASOURCE_URL` | ✅ Prod | PostgreSQL JDBC URL (from Neon) |
| `SPRING_DATASOURCE_USERNAME` | ✅ Prod | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | ✅ Prod | PostgreSQL password |
| `CORS_ORIGINS` | ✅ Prod | Comma-separated allowed frontend origins |

> **Local dev**: Set `BREVO_SMTP_USER` / `BREVO_SMTP_KEY` only if you want real emails locally. Otherwise, use the `123456` OTP bypass — no email config needed.

### Frontend (.env)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `https://rentova-api.onrender.com`) |
| `VITE_WS_URL` | WebSocket endpoint (e.g. `wss://rentova-api.onrender.com/ws`) |

---

## Email Setup (Brevo)

Rentova uses **Brevo** (formerly Sendinblue) for transactional emails. Brevo's SMTP relay on port 587 is not blocked by Render's free tier.

1. Create a free account at [app.brevo.com](https://app.brevo.com)
2. Go to **Settings → SMTP & API → SMTP**
3. Copy your **SMTP Login** and **Master Password**
4. Add them as `BREVO_SMTP_USER` and `BREVO_SMTP_KEY` in Render environment variables

Free tier: **300 emails/day**, no domain verification required.

---

## Deployment

### Backend (Render)
- Connect your GitHub repo to Render
- Use `render.yaml` for service configuration or configure manually:
  - **Build Command**: `cd backend && ./mvnw clean package -DskipTests`
  - **Start Command**: `java -jar backend/target/*.jar --spring.profiles.active=prod`
- Add all required environment variables listed above

### Frontend (Vercel)
- Connect your GitHub repo to Vercel
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- Add `VITE_API_URL` and `VITE_WS_URL` as environment variables

---

## License
MIT
