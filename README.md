https://clypt-v3.lovable.app

## Getting Started

### Prerequisites
- Node.js 18+
- A running Clypt V3 backend (see `/Users/rithvik/Clypt-V3/README.md`)

### Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local and set VITE_API_BASE_URL to your backend URL
npm run dev
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL |
| `VITE_DEBUG_API` | `false` | Verbose API logging |

### Running Tests

```bash
npm run test
```
