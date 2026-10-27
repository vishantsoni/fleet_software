# Fleet Management System

Advanced Transport Fleet Management System built with Next.js 14, TypeScript, Prisma, PostgreSQL, and BullMQ.

## Features

- Vehicle Master management
- Trip & Revenue Register
- Diesel / Fuel Register with auto-calculated KM/L
- Maintenance & Repair Register
- Tyre Management with cost-per-KM tracking
- Driver & Payroll Input
- Compliance & Expiry Tracker with alert flags
- P&L & Analytics Engine with fleet-wide metrics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Table, Recharts
- **Backend**: Next.js Server Actions + Prisma ORM
- **Database**: PostgreSQL 15+ (PostGIS-ready)
- **Cache & Jobs**: Redis + BullMQ
- **Auth**: NextAuth.js

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables: Copy `.env.example` to `.env.local` and configure
4. Start PostgreSQL and Redis: `docker-compose up -d`
5. Run database migrations: `npm run db:generate`
6. Seed the database: `npm run db:seed`
7. Start the development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Login

- Email: `admin@fleet.com`
- Password: `admin123`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── vehicles/          # Vehicle Master module
│   ├── drivers/           # Driver & Payroll module
│   ├── trips/             # Trip & Revenue Register
│   ├── fuel/              # Fuel Register
│   ├── maintenance/       # Maintenance Register
│   ├── tyres/             # Tyre Management
│   ├── compliance/        # Compliance Tracker
│   └── analytics/         # P&L & Analytics
├── components/            # Shared UI components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── server/                # Server-side code
│   ├── actions/           # Next.js Server Actions
│   ├── services/          # Business logic
│   ├── jobs/              # BullMQ jobs
│   ├── auth/              # NextAuth configuration
│   └── utils/             # Utilities
├── lib/                   # Core utilities (Prisma, Redis)
└── types/                 # TypeScript type definitions
```

## License

MIT
