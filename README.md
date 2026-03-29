# Commuter Transit

Premium transport solutions for NDIS, corporate, and civil crew transport in Melbourne.

We are a Melbourne-based transport provider delivering reliable, safe, and scalable mobility solutions for individuals, businesses, government organisations, and infrastructure projects.

## How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- Postgres Database (Neon.tech recommended)
- Resend API Key (for emails)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgres_url
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=your_email@example.com
ADMIN_SECRET=your_admin_password
```

### 3. Install & Run
```bash
# Install dependencies
npm install

# Start development server (Vite + Express)
npm run dev
```

## Vercel Deployment

This project is configured for seamless deployment on Vercel.

1. **Connect Repository**: Link your GitHub/GitLab repo to Vercel.
2. **Environment Variables**: Add all variables from your `.env` to the Vercel Project Settings.
3. **Build Settings**: 
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy**: Vercel will automatically handle the API routing via `api/index.ts` and the SPA routing via `vercel.json`.

## Project Structure
- `public/images/`: Store your logos, vehicle photos, and icons here.
- `src/`: React frontend components.
- `api/`: Vercel serverless function (Express API).
- `server.ts`: Local development server (Vite + Express hybrid).

## Our Core Services
- **Vehicle Hire:** Short- and long-term vehicle hire for individuals and businesses.
- **Accessible Transport:** Transport services covering essential appointments, outings, and community engagements. Wheelchair-accessible vehicles for individuals and group travel. Safe, comfortable, and timely arrivals.
- **Corporate and Event Transport:** Corporate shuttle services, event transport coordination, airport transfers, and group movements.
- **Tour and Charter Services:** Private and group tours throughout Melbourne and regional Victoria. Charter transport for organisations, visitors, and events.
- **School and Group Transport:** School bus services and group transport, including airport pickup and drop-off services.
- **Transport Disruption Support:** Temporary shuttle and replacement transport services during public transport disruptions.
- **Removal and Logistics Services:** Residential and commercial removals within Melbourne and interstate.
- **Civil Project Crew Transport:** Crew bus services designed to meet civil construction and infrastructure project specifications. Safe and reliable workforce transport to and from project sites.

*We are committed to delivering safe, compliant, and dependable transport solutions, supported by professional drivers, well-maintained vehicles, and a strong focus on customer service.*
