# Albion Market Bot (prototype)

This is a small prototype for a real-time Albion Online market price feeder.

Quick start

1. Install dependencies

```powershell
cd market-bot
npm install
```

2. Start the socket server

```powershell
npm run start-server
```

3. In another terminal, start the worker (it will poll albion-online-data and POST updates to the socket server)

```powershell
# default items and locations can be overridden via env vars
set ITEMS=T4_SWORD,T4_HELMET
set LOCATIONS=Caerleon,BlackMarket
set SERVER_URL=http://localhost:4000
npm run start-worker
```

4. Open the static client at `market-bot/public/index.html` in your browser (or serve it via a simple static server) to see live updates.

Configuration

- `ITEMS` - comma-separated list of Albion item ids (e.g., `T4_SWORD`).
- `LOCATIONS` - comma-separated list of locations (default `Caerleon,BlackMarket`). Adjust if the API uses slightly different names.
- `INTERVAL` - polling interval in seconds (default `5`).
- `SERVER_URL` - URL of the socket server (default `http://localhost:4000`).

Flip detection (prototype)

- The worker includes a simple flip-detection step that compares two configured locations (the first two entries in `LOCATIONS`) and reports opportunities when estimated profit after fees exceeds `MIN_PROFIT`.
- Config options:
	- `FEE_PERCENT` - estimated marketplace fee % (default `5`).
	- `MIN_PROFIT` - minimum profit in silver/gold to report (default `50`).

Example (run with flip detection enabled):

```powershell
set ITEMS=T4_SWORD,T4_HAMMER
set LOCATIONS=Caerleon,BlackMarket
set FEE_PERCENT=5
set MIN_PROFIT=100
set SERVER_URL=http://localhost:4000
npm run start-worker
```

The worker will POST opportunities to the socket server which emits `flip_opportunity` events. A Next.js page can subscribe to these events (see `app/market/page.jsx` in the main project).

Notes

- This is a minimal prototype: it polls `https://www.albion-online-data.com` and posts price maps to the socket server. It does not persist history. For production use, add rate-limit handling, caching, Redis pub/sub, persistence, and authentication.
