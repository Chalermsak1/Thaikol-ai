# ThaiKOL AI — API Documentation

## Base URLs
- **Local Dev Backend**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 1. System Health Endpoint

### `GET /health`
Returns system operational status, application version, database connectivity, and demo mode state.

#### Response: `200 OK`
```json
{
  "status": "ok",
  "app_name": "ThaiKOL AI",
  "version": "0.1.0",
  "environment": "development",
  "demo_mode": true,
  "database_connected": true,
  "timestamp": "2026-09-17T13:45:00.000000Z"
}
```

---

## 2. Roadmap Endpoints (Upcoming Phases)

### `POST /api/v1/brands/analyze`
Extracts brand attributes from a website URL and Facebook page URL.

### `POST /api/v1/kols/match`
Discovers and ranks Thai TikTok influencers according to brand profile embeddings and explainable scoring weights.

### `GET /api/v1/kols/{id}`
Retrieves detailed profile metadata, public video captions, and score breakdown for a specific KOL.
