# Check Insurance Risk Frontend (Sober / Tier-1)

A restrained, audit-friendly console designed for regulated environments.
- React + Vite + TypeScript
- Tailwind (sober styling)
- TanStack Query + Table
- React Hook Form + Zod
- Sonner toasts

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Netlify
- Build: `npm run build`
- Publish: `dist`
- Env var: `VITE_API_BASE_URL=https://check-insurance-risk-backend-railway.onrender.com`
- SPA redirects: `public/_redirects`
