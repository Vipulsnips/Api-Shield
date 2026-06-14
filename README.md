# APIShield
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Redis](https://img.shields.io/badge/Redis-Upstash-red)
![Render](https://img.shields.io/badge/Deploy-Render-blue)

APIShield is a production-oriented API Gateway and API Management Platform that enables developers to register backend services, generate API keys, enforce rate limits, monitor traffic, and route requests through a centralized gateway.

The platform includes authentication, API key management, request analytics, health monitoring, Redis-backed rate limiting, and cloud deployment using MongoDB Atlas, Upstash Redis, and Render.

## Live Demo

**Deployment:** https://api-shield-1e4k.onrender.com/

**Repository:** https://github.com/Vipulsnips/Api-Shield

> **Note:** This is a backend-only API service with no frontend UI. Visiting the base URL returns a JSON status message. Use the endpoints listed below with a tool like Postman, curl, or Thunder Client.

---

## Highlights

- Built a centralized API Gateway capable of routing requests to registered services.
- Implemented Redis-backed fixed-window rate limiting.
- Secured routes using JWT authentication and ownership based authorization.
- Deployed using MongoDB Atlas, Upstash Redis, and Render.
- Built analytics using MongoDB Aggregation Pipelines to track request volume, success rate, failure rate, and average response time.

---

## Features

* JWT-based Authentication
* Service Registration & Management
* API Key Generation & Revocation
* API Gateway Request Forwarding
* Request Logging
* Analytics & Usage Statistics
* Redis-based Rate Limiting
* Service Health Checks
* Ownership-based Authorization
* Global Error Handling
* MongoDB Atlas Integration
* Render Deployment

---

## Architecture

```text
Client
   │
   ▼
APIShield Gateway
   │
   ├── API Key Validation
   ├── Redis Rate Limiting
   ├── Forward to Target Service
   └── Log Request Result
   │
   ▼
Target Service
   │
   ▼
Response

MongoDB Atlas
├── Users
├── Services
├── API Keys
└── Request Logs

Redis (Upstash)
└── Rate Limiting Counters
```

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Caching & Rate Limiting

* Redis (Upstash)

### Authentication

* JWT (Bearer Token)

### Deployment

* Render

---

## Core Workflow

1. User registers and logs in.
2. User creates a service.
3. User generates an API key.
4. Client sends requests through the API gateway.
5. Gateway validates the API key.
6. Redis enforces rate limits.
7. Request is forwarded to the target service.
8. Request metadata is logged.
9. Analytics are generated from collected logs.

---

## Rate Limiting

APIShield uses Redis-based rate limiting.

Current configuration:

* 10 requests per minute per API key

---

## API Management Features

### Service Management

* Register backend services
* View service information
* Delete owned services
* Health status monitoring

### API Key Management

* Generate API keys
* Revoke (delete) API keys
* Associate keys with services

### Analytics

* Total Requests
* Successful Requests
* Failed Requests
* Average Response Time

---

## API Endpoints

### Auth
* `POST /api/auth/signup` — Register a new user
* `POST /api/auth/login` — Log in and receive a JWT
* `POST /api/auth/logout` — Logout (client-side token discard)
* `GET /api/auth/me` — Get current authenticated user

### Services
* `POST /api/services` — Register a new service
* `GET /api/services/me` — List your services
* `GET /api/services/:id` — Get a service by ID
* `DELETE /api/services/:id` — Delete an owned service
* `POST /api/services/:id/check-health` — Check service health status

### API Keys
* `POST /api/apiKeys/:serviceId` — Generate an API key for a service
* `GET /api/apiKeys` — List your API keys
* `DELETE /api/apiKeys/:id` — Revoke an API key

### Gateway
* `ALL /api/gateway/:slug` — Forward a request to a registered service
* `ALL /api/gateway/:slug/*` — Forward a request with a sub-path to a registered service

### Analytics
* `GET /api/analytics/service/:serviceId/logs` — Get raw request logs for a service
* `GET /api/analytics/service/:serviceId` — Get aggregated request statistics for a service

---

## Environment Variables

Create a `.env` file:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_connection_string
PORT=8000
```

---

## Running Locally

```bash
git clone https://github.com/Vipulsnips/Api-Shield.git

cd Api-Shield/backend

npm install

npm start
```

---

## Future Enhancements

* Gateway-to-Service Secret Protection
* SSRF Protection for Registered Service URLs
* Standardized `/health` Endpoint for Services
* Load Balancing Across Multiple Service Instances
* Service Discovery
* Advanced Analytics Dashboard

---

## Technical Concepts Demonstrated

- API Gateway Design
- JWT Authentication & Authorization
- Redis-based Rate Limiting
- MongoDB Aggregation Pipelines
- Request Analytics
- Cloud Deployment
- Service Health Monitoring
