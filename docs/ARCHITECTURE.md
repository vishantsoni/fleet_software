# Production-Ready Folder / Module Architecture

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Table, Recharts
- **Backend**: Next.js Server Actions + Route Handlers (with Prisma ORM)
- **Database**: PostgreSQL 15+ (PostGIS-ready for future GPS integration)
- **Cache & Jobs**: Redis + BullMQ (scheduled alerts, P&L batch jobs)
- **Auth**: NextAuth.js (for internal users) + role-based access control
- **Monitoring**: Sentry / OpenTelemetry

## Directory Structure

```
fleet_software/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── client.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── providers.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── ...
│   │   ├── vehicles/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── trips/
│   │   │   │       └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   │       ├── vehicle-table.tsx
│   │   │       ├── vehicle-form.tsx
│   │   │       └── vehicle-card.tsx
│   │   ├── drivers/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── documents/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── payroll/
│   │   │   │       └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   ├── trips/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   │       └── trip-form.tsx
│   │   ├── fuel/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   │       └── fuel-form.tsx
│   │   ├── maintenance/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   │       └── maintenance-form.tsx
│   │   ├── tyres/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── _components/
│   │   │       └── tyre-form.tsx
│   │   ├── compliance/
│   │   │   ├── page.tsx
│   │   │   ├── _components/
│   │   │   │   ├── alert-badges.tsx
│   │   │   │   └── expiry-tracker.tsx
│   │   │   └── vehicles/
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   ├── fleet-pnl/
│   │   │   │   └── page.tsx
│   │   │   ├── vehicle-pnl/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── _components/
│   │   │       ├── revenue-chart.tsx
│   │   │       ├── cost-breakdown.tsx
│   │   │       └── kpi-cards.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── data-table/                  # TanStack Table wrappers
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   └── column-visibility.tsx
│   │   ├── charts/                      # Recharts wrappers
│   │   │   ├── bar-chart.tsx
│   │   │   ├── line-chart.tsx
│   │   │   └── pie-chart.tsx
│   │   ├── forms/                       # Shared form logic
│   │   │   ├── vehicle-form.tsx
│   │   │   ├── driver-form.tsx
│   │   │   └── date-range-picker.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── page-shell.tsx
│   │   └── providers/
│   │       ├── auth-provider.tsx
│   │       └── theme-provider.tsx
│   ├── server/
│   │   ├── actions/                     # Next.js Server Actions
│   │   │   ├── vehicles/
│   │   │   │   ├── create-vehicle.ts
│   │   │   │   ├── update-vehicle.ts
│   │   │   │   └── delete-vehicle.ts
│   │   │   ├── drivers/
│   │   │   │   ├── create-driver.ts
│   │   │   │   └── update-driver.ts
│   │   │   ├── trips/
│   │   │   │   ├── create-trip.ts
│   │   │   │   ├── update-trip-status.ts
│   │   │   │   └── complete-trip.ts
│   │   │   ├── fuel/
│   │   │   │   └── create-fuel-entry.ts
│   │   │   ├── maintenance/
│   │   │   │   └── create-maintenance-job.ts
│   │   │   ├── tyres/
│   │   │   │   ├── fit-tyre.ts
│   │   │   │   └── remove-tyre.ts
│   │   │   ├── compliance/
│   │   │   │   ├── renew-document.ts
│   │   │   │   └── recalculate-alerts.ts
│   │   │   └── analytics/
│   │   │       ├── generate-pnl.ts
│   │   │       └── get-kpis.ts
│   │   ├── services/                    # Business logic layer
│   │   │   ├── vehicle.service.ts
│   │   │   ├── trip.service.ts
│   │   │   ├── fuel.service.ts
│   │   │   ├── maintenance.service.ts
│   │   │   ├── tyre.service.ts
│   │   │   ├── compliance.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── odometer.service.ts
│   │   ├── jobs/                        # BullMQ queue definitions & workers
│   │   │   ├── compliance-alert.job.ts
│   │   │   ├── pnl-calculation.job.ts
│   │   │   ├── odometer-sync.job.ts
│   │   │   └── queue.ts
│   │   ├── auth/                        # NextAuth configuration
│   │   │   ├── route.ts
│   │   │   ├── options.ts
│   │   │   └── middleware.ts
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   └── utils/
│   │       ├── validators.ts
│   │       ├── formatters.ts
│   │       └── calculations.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── bullmq.ts
│   └── types/
│       ├── index.ts
│       ├── vehicle.ts
│       ├── trip.ts
│       ├── fuel.ts
│       ├── maintenance.ts
│       ├── tyre.ts
│       ├── compliance.ts
│       └── analytics.ts
├── public/
│   ├── favicon.ico
│   └── ...
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── docker-compose.yml
├── Dockerfile
├── README.md
└── AGENTS.md
```

## Module Breakdown

### 1. Vehicle Master (`src/app/vehicles/`)
- **Table**: TanStack Table with filters (make, model, owner type, status)
- **Form**: shadcn/ui Dialog with Zod validation
- **Details Page**: Tabs for trips, fuel, maintenance, tyres, compliance
- **Server Actions**: create, update, delete, list, search

### 2. Trip & Revenue Register (`src/app/trips/`)
- **Form**: Vehicle selection (pre-filtered by active vehicles), driver selection, origin/destination autocomplete
- **Workflow**: Scheduled → In Progress → Completed (status transition)
- **Validation**: Odometer progression checked against FuelEntry / MaintenanceJob

### 3. Diesel / Fuel Register (`src/app/fuel/`)
- **Auto-calculation**:
  - `kmSinceLastFill` = currentOdometerReading - previousFuelEntryOdometerReading
  - `fuelEconomy` = kmSinceLastFill / litres
- **Validation**: Odometer must be strictly increasing

### 4. Maintenance & Repair Register (`src/app/maintenance/`)
- **Form**: Workshop dropdown, parts + labour split
- **Cost Rollup**: Auto-calculates totalCost

### 5. Tyre Management (`src/app/tyres/`)
- **Lifecycle**: Fitted → Removed → Scrapped
- **Auto-calculation**: costPerKm = purchaseCost / (removalOdometer - fittedOdometer)
- **Validation**: Removal odometer must be > fitted odometer

### 6. Driver & Payroll (`src/app/drivers/`)
- **Master**: License tracking with expiry alerts
- **Documents**: Upload and expiry tracking
- **Payroll**: Advances and deductions (to be modeled as separate tables if needed for audit trail)

### 7. Compliance & Expiry Tracker (`src/app/compliance/`)
- **Unified View**: Documents from both vehicles and drivers in one dashboard
- **Alert System**:
  - Green: > 30 days
  - Amber: 0-30 days
  - Red: Expired
- **BullMQ Job**: Daily recalculation of daysToExpiry and alertStatus

### 8. P&L & Analytics Engine (`src/app/analytics/`)
- **P&L per Vehicle**: Revenue - (Fuel + Maintenance + Tyres + Overheads)
- **Fleet-wide Aggregation**: Sum across all vehicles
- **Metrics**:
  - Total KM run
  - CPK (Cost Per KM)
  - RPK (Revenue Per KM)
  - Net Profit Margin
- **Recharts**: Bar charts for revenue vs cost, line charts for trends, pie charts for cost breakdown
- **BullMQ Job**: Nightly batch recalculation stored in Redis for fast reads

## Key Design Decisions

### Next.js Server Actions vs NestJS
- Use **Next.js Server Actions** for the CRUD-heavy UI interactions. This keeps the stack simple.
- If future requirements demand complex business logic, microservices, or external integrations, introduce a NestJS backend as a separate API service and proxy through Route Handlers.

### PostGIS Readiness
- The schema currently has `origin` and `destination` as strings on Trip.
- To enable PostGIS later, add `originLatLng` and `destinationLatLng` columns with type `Unsupported("geography")` or `Unsupported("geometry")`.
- Indexes: `@@index([originLatLng(geography)])` is not directly supported; use GIST indexes via raw SQL in migrations.

### Caching Strategy
- **Redis**:
  - Store P&L aggregates (fleet + per vehicle) with TTL matching the BullMQ recalculation interval.
  - Store session data for authenticated users.
  - Cache dropdown options (workshops, customers).
- **BullMQ**:
  - `compliance-alert.job.ts`: Daily at 6 AM - recalculates alertStatus for all documents.
  - `pnl-calculation.job.ts`: Nightly at 2 AM - recalculates P&L for all vehicles for the previous day.
  - `odometer-sync.job.ts`: Hourly - ensures Vehicle.currentOdometer is updated from latest odometer reading.

### Error Handling & Logging
- All Server Actions should wrap logic in try/catch and return structured errors.
- Use Zod schemas for input validation at the entry point.
- Log to structured JSON (console or file) in development; ship to external service in production.
