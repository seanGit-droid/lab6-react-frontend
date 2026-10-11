# Product Management System – React frontend (Lab 6)

React 18 + Vite + axios. Talks only to the LavaLust API (never to the database).

## Run locally
```bash
npm install
cp .env.example .env      # set VITE_API_URL
npm run dev               # http://localhost:5173
```

## Deploy (Render Static Site)
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-api>.onrender.com`

Then put the frontend URL in the API's `ALLOW_ORIGIN` environment variable on Render.
