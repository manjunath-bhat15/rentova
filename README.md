# Rentova — Rental Management Platform

> Scalable real-time rental and service management platform built with Spring Boot + React.

## Tech Stack

- **Backend**: Spring Boot 3.4.5 (Java 17), Spring Security, Spring Data JPA, WebSocket/STOMP
- **Frontend**: React 18, Vite 5, Vanilla CSS
- **Database**: H2 (dev) / PostgreSQL (prod — Neon free tier)
- **Real-Time**: STOMP over WebSocket with SockJS fallback
- **CI/CD**: GitHub Actions
- **Hosting**: Render (backend) + Vercel (frontend) + Neon (database) — all free tier

## Quick Start

### Prerequisites
- Java 17+ (JDK)
- Node.js 18+

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
API runs at `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`

### Docker (Full Stack)
```bash
docker-compose up --build
```

## Project Structure
```
rentova/
├── backend/          # Spring Boot API
├── frontend/         # React + Vite SPA
├── docker-compose.yml
├── .github/workflows/
│   ├── backend-ci.yml
│   └── frontend-ci.yml
└── README.md
```

## Environment Variables

### Backend (application.yml / Render)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (min 256 bits) |
| `CORS_ORIGINS` | Allowed frontend origins |

### Frontend (.env)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |
| `VITE_WS_URL` | WebSocket endpoint URL |

## License
MIT
