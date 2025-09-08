## Exchange Project

Real-time crypto trading stack: matching engine, HTTP API, and a Next.js UI.

### Structure

- `exchange-backend/`
  - `api/`: Bun + Express API (port 3000)
  - `engine/`: Bun matching engine (uses Redis)
- `exchange-proxy/`: Next.js frontend
- `order-book/`: TypeScript order book library

### Requirements

- Bun, Node.js 18+, Redis

### Run

API
```bash
cd exchange-backend/api && bun install && bun dev
```

Engine
```bash
cd exchange-backend/engine && bun install && bun dev
```

Frontend
```bash
cd exchange-proxy && npm install && npm run dev
```

### Frontend API target

- Set `PROXY_URL` in `exchange-proxy/app/utils/constants.ts` (e.g. `http://localhost:3000/api/v1`).

### Routes

- `POST /api/v1/order`
- `GET /api/v1/depth`
