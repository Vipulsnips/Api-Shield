# 🛡️ APIShield

<p align="center">
  <b>A Full-Stack API Gateway & API Management Platform</b><br>
  Built with <b>Node.js, Express, MongoDB, Redis, React, and Tailwind CSS</b>
</p>

<p align="center">
<img src="https://img.shields.io/badge/Node.js-Backend-green" />
<img src="https://img.shields.io/badge/Express.js-API-black" />
<img src="https://img.shields.io/badge/React-Frontend-61DAFB" />
<img src="https://img.shields.io/badge/TailwindCSS-UI-38BDF8" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-green" />
<img src="https://img.shields.io/badge/Redis-Upstash-red" />
<img src="https://img.shields.io/badge/Deployment-Render-blue" />
<img src="https://img.shields.io/badge/Frontend-Vercel-black" />
<img src="https://img.shields.io/badge/Version-v1.0.0-success" />
</p>

---

## 🚀 Overview

APIShield is a production oriented **API Gateway and API Management Platform** that enables developers to securely expose backend services through a centralized gateway.

It allows authenticated users to register services, generate API keys, enforce Redis backed rate limits, monitor service health, collect request analytics, and securely proxy client requests to backend services.

The project demonstrates real world backend engineering concepts such as API Gateway design, request forwarding, authentication, authorization, rate limiting, analytics, health monitoring, and cloud deployment.

---

## 🌐 Live Demo

| | |
|---|---|
| **Frontend** | https://api-shield-eight.vercel.app |
| **Backend API** | https://api-shield-1e4k.onrender.com |
| **Repository** | https://github.com/Vipulsnips/Api-Shield |

> This is a full stack application. The backend API has no root UI — visit the frontend link above for the dashboard.

---

## ✨ Features

### 🔐 Authentication
- User Signup & Login
- JWT based Authentication
- Protected Routes (frontend + backend)
- Current User Endpoint

### 🚀 Service Management
- Register Backend Services with Auto Slug Generation
- Delete Owned Services
- Ownership based Authorization

### 🔑 API Key Management
- Generate & Delete API Keys
- Associate Keys with Individual Services

### 🌉 API Gateway
- Centralized Gateway Routing
- API Key Validation
- Dynamic Request Forwarding (method, body, query params, headers)
- Header Sanitization
- Gateway Secret Authentication (per-service secret attached to every forwarded request)

### 📊 Analytics
- Per-request Logging (status code, response time, method, path)
- Aggregated Stats: Total, Successful, Failed Requests & Avg Response Time
- MongoDB Aggregation Pipelines

### ❤️ Health Monitoring
- Manual Health Checks
- Automated Scheduled Health Checks via `node-cron` (every 5 minutes)
- Healthy / Unhealthy Status with Last Checked Timestamp

### ⚡ Rate Limiting
- Redis-backed Fixed Window Rate Limiting
- 10 Requests per Minute per API Key

---

## 🏗️ System Architecture

```text
                    React Frontend (Vercel)
                           │
                           ▼
                  Express API (Render)
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
 Authentication      Service Manager      Analytics
                           │
                           ▼
                     MongoDB Atlas
                  (Users, Services,
                  API Keys, Request Logs)

Redis (Upstash)          Cron Scheduler
└── Rate Limiting        └── Health Monitoring
```

---

## 🔄 Request Flow

```text
Client
   │
   ▼
APIShield Gateway
   │
   ├── Validate API Key
   ├── Redis Rate Limiting
   ├── Sanitize & Forward Request (with x-gateway-secret)
   ├── Capture Response
   ├── Store Analytics Log
   └── Return Response to Client
        │
        ▼
Target Backend Service
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Caching & Rate Limiting | Redis (Upstash) |
| Authentication | JWT (Bearer Token) |
| Scheduler | node-cron |
| Deployment | Render (backend), Vercel (frontend) |

---

## 📚 REST API Reference

### Authentication

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/signup` |
| POST | `/api/auth/login` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/me` |

### Services

| Method | Endpoint |
|--------|----------|
| POST | `/api/services` |
| GET | `/api/services/me` |
| GET | `/api/services/:id` |
| DELETE | `/api/services/:id` |
| POST | `/api/services/:id/check-health` |

### API Keys

| Method | Endpoint |
|--------|----------|
| POST | `/api/apiKeys/:serviceId` |
| GET | `/api/apiKeys` |
| DELETE | `/api/apiKeys/:id` |

### Gateway

| Method | Endpoint |
|--------|----------|
| ALL | `/api/gateway/:slug` |
| ALL | `/api/gateway/:slug/*` |

### Analytics

| Method | Endpoint |
|--------|----------|
| GET | `/api/analytics/service/:serviceId` |
| GET | `/api/analytics/service/:serviceId/logs` |

---

## 📊 Analytics Collected Per Request

| Field | Description |
|---|---|
| `responseTime` | Time taken to get response from upstream |
| `statusCode` | HTTP status returned by upstream |
| `method` | HTTP method (GET, POST, etc.) |
| `path` | Forwarded path |
| `service` | Service ID |
| `apiKey` | API Key used |
| `createdAt` | Timestamp |

---

## 🖥️ Local Setup

```bash
git clone https://github.com/Vipulsnips/Api-Shield.git
cd Api-Shield
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Backend `.env`

```env
PORT=8000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_connection_string
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🎯 Technical Concepts Demonstrated

- API Gateway Architecture & Reverse Proxy Pattern
- JWT Authentication & Authorization
- API Key Management & Validation
- Redis-backed Rate Limiting
- Request Forwarding with Header Sanitization
- Gateway Secret Authentication
- MongoDB Aggregation Pipelines
- Automated Health Monitoring with Cron Jobs
- Middleware Design & Global Error Handling
- REST API Design
- Protected React Routes
- Full-Stack Cloud Deployment

---

## 🚀 Roadmap

### v1.1
- API Key Enable/Disable Toggle
- Request Log Retention & Cleanup (TTL Index)
- SSRF Protection on Service URLs
- Docker & Docker Compose Support

### v2.0
- Load Balancing Across Multiple Service Instances
- Service Discovery
- OpenAPI (Swagger) Documentation
- CI/CD Pipeline

---

## 👨‍💻 Author

**Vipul Rawat**

- GitHub: https://github.com/Vipulsnips
- LinkedIn: https://www.linkedin.com/in/vipul-rawat-codes

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub!
