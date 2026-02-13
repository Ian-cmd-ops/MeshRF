# Release v1.15.3: Security Hardening & Stability

This patch release focuses on critical security remediations and backend stability improvements.

## 🔒 Security Hardening

### Infrastructure & Config

- **Redis Authentication**: Enabled password protection for the Redis database service, ensuring the data layer is secure.
- **Environment Safety**: Removed `process.env` usage from the frontend build process to prevent potential leakage of secrets.
- **CORS Restriction**: Tightened API access control to allow requests only from localhost origins.

### Input & Output Validation

- **Coordinate Validation**: Added strict validation for latitude/longitude bounds to reject invalid geographic data early.
- **Rate Limiting**: Introduced rate limits on expensive simulation endpoints to prevent abuse and denial-of-service scenarios.
- **KML Sanitization**: Implemented XML escaping for KML exports to neutralize potential injection vectors.

## 🐛 Bug Fixes

### Worker Stability

- **Connection Pooling**: Fixed a critical issue where the background worker would exhaust system sockets (`Error 99`) during heavy multi-site scans. Implemented proper Redis connection pooling to reuse connections efficiently.

---

## Upgrade Instructions

Requires a restart of the backend services to apply new Redis password configurations:

```bash
docker-compose down
docker-compose up -d --build
```
