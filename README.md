# GOSHEN COLLECTION Frontend

React/Vite frontend for the GOSHEN COLLECTION multi-store clothing business management application.

## Technology Stack

- React.js
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios
- React Hook Form
- Recharts
- React Icons
- QR/barcode-ready dependencies
- PDF, print, and Excel export-ready dependencies

## Installation

```bash
npm install
```

## Environment Variables

Create `.env` from `.env.example`.

```env
VITE_APP_NAME=GOSHEN COLLECTION
VITE_API_BASE_URL=http://localhost:5001/api/v1
VITE_NODE_ENV=development
```

Do not place backend secrets in frontend environment files.

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Folder Structure

- `src/api`: Axios API client.
- `src/store`: Redux Toolkit configuration.
- `src/features`: feature modules.
- `src/components`: reusable UI components.
- `src/routes`: protected route handling.
- `src/utils`: shared helpers.

## API Connection

The frontend reads the backend base URL from `VITE_API_BASE_URL`. The backend should expose versioned routes under `/api/v1`.

## Mobile Responsiveness

The layout is mobile-first with bottom navigation, a slide-in drawer, responsive dashboard cards, responsive charts, touch-friendly controls, sticky POS checkout actions, and table overflow handling for small screens.

## Deployment

Build the app with:

```bash
npm run build
```

Deploy `dist/` to Vercel, Netlify, DigitalOcean App Platform, or another static frontend host. Set `VITE_API_BASE_URL` in the deployment platform.
