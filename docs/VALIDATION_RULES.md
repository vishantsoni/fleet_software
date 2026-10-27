# Validation Rules & Business Constraints

## 1. Odometer Sequence Integrity

### Rule: Strictly increasing odometer readings per vehicle
- All odometer-dependent entries must have an odometer reading >= the vehicle's current known maximum.
- **Affected models**: FuelEntry, MaintenanceJob, Tyre
- **Enforcement**:
  - On FuelEntry.odometerReading: must be >= Vehicle.currentOdometer AND >= previous FuelEntry.odometerReading for the same vehicle.
  - On MaintenanceJob.odometerAtService: must be >= Vehicle.currentOdometer.
  - On Tyre.fittedOdometer: must be >= previous Tyre.removalOdometer for the same vehicle (if re-fitting).

### Rule: Odometer progression check on Trip
- Trip.totalKm represents distance covered, not an odometer reading, so it must be >= 0.
- The vehicle's currentOdometer is NOT updated by trips directly; it is updated by the highest odometer reading across FuelEntry and MaintenanceJob.

## 2. Non-Negative Numeric Constraints

| Field | Rule |
|-------|------|
| Vehicle.capacityTonnage | >= 0 |
| Vehicle.year | Between 1900 and current year + 1 |
| Driver.baseSalary | >= 0 |
| Trip.freightAmount | >= 0 |
| Trip.revenue | >= 0 |
| Trip.totalKm | >= 0 |
| FuelEntry.litres | > 0 |
| FuelEntry.ratePerLitre | > 0 |
| FuelEntry.totalAmount | >= 0 (auto-calculated: litres * ratePerLitre) |
| FuelEntry.kmSinceLastFill | >= 0 (auto-calculated) |
| MaintenanceJob.partsCost | >= 0 |
| MaintenanceJob.labourCost | >= 0 |
| MaintenanceJob.totalCost | >= 0 (auto-calculated: partsCost + labourCost) |
| Tyre.purchaseCost | > 0 |
| Tyre.fittedOdometer | >= 0 |
| Tyre.removalOdometer | >= fittedOdometer (if not null) |
| Tyre.costPerKm | >= 0 (auto-calculated: purchaseCost / (removalOdometer - fittedOdometer)) |
| DriverDocument.renewalCost | >= 0 |
| VehicleDocument.renewalCost | >= 0 |

## 3. Date Constraints

| Field | Rule |
|-------|------|
| Vehicle.registrationDate | <= now() |
| Driver.licenseExpiry | >= issueDate of the associated DriverDocument of type DRIVER_LICENSE |
| DriverDocument.issueDate | <= expiryDate |
| DriverDocument.expiryDate | > issueDate |
| VehicleDocument.issueDate | <= expiryDate |
| VehicleDocument.expiryDate | > issueDate |
| Trip.tripDate | <= now() |
| FuelEntry.entryDate | <= now() |
| MaintenanceJob.jobDate | <= now() |
| Tyre.purchaseDate | <= now() |
| Tyre.fittedOdometer | must correspond to a date >= purchaseDate |

## 4. Uniqueness & Referential Integrity

- Vehicle.vehicleNo: unique, non-empty, uppercase normalized
- Driver.licenseNumber: unique, non-empty
- User.email: unique, valid email format
- Customer.name: unique (or enforce business key of name + phone)
- Workshop.name: unique

## 5. Compliance & Alert Flag Rules

### AlertStatus Calculation (triggered daily by BullMQ job):
- daysToExpiry = (expiryDate - now()) in days (rounded down)
- AlertStatus = RED if daysToExpiry < 0
- AlertStatus = AMBER if 0 <= daysToExpiry <= 30
- AlertStatus = GREEN if daysToExpiry > 30

### Enforced Transitions:
- Once a document is marked as RED, it cannot be manually set back to GREEN or AMBER without updating expiryDate.
- Tyre.status: allowed values are FITTED, REMOVED, SCRAPPED. Transition to REMOVED requires removalOdometer. Transition to SCRAPPED requires removalOdometer.

## 6. P&L Aggregation Rules

### Revenue Aggregation
- Vehicle-level revenue = sum(Trip.revenue) where Trip.status = COMPLETED
- Fleet-wide revenue = sum across all vehicles

### Cost Aggregation
- Fuel cost per vehicle = sum(FuelEntry.totalAmount) within period
- Maintenance cost per vehicle = sum(MaintenanceJob.totalCost) within period
- Tyre cost per vehicle = sum(Tyre.purchaseCost) within period (or amortized based on costPerKm * totalKm)
- Overheads: manually configurable per month (stored in Redis/bullmq job)

### Derived Metrics
- Total KM run per vehicle = sum(Trip.totalKm) where Trip.status = COMPLETED
- Cost Per KM (CPK) = Total Costs / Total KM run
- Revenue Per KM (RPK) = Total Revenue / Total KM run
- Net Profit Margin = (Revenue - Total Costs) / Revenue * 100

## 7. Application-Level Validation (Server Actions / NestJS Pipes)

### Zod Schema Examples (TypeScript)

```typescript
import { z } from "zod";

export const VehicleSchema = z.object({
  vehicleNo: z.string().min(3).max(50).regex(/^[A-Z0-9-]+$/),
  registrationDate: z.coerce.date().max(new Date()),
  makeModel: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  capacityTonnage: z.number().nonNegative().multipleOf(0.01),
  ownerType: z.enum(["OWNED", "MARKET"]),
  engineRef: z.string().max(100).optional(),
  chassisRef: z.string().max(100).optional(),
  currentOdometer: z.number().int().nonNegative(),
});

export const FuelEntrySchema = z.object({
  entryDate: z.coerce.date().max(new Date()),
  vehicleId: z.string().cuid(),
  station: z.string().min(1).max(200),
  fuelType: z.enum(["DIESEL", "PETROL", "CNG", "ELECTRIC"]),
  litres: z.number().positive().multipleOf(0.01),
  ratePerLitre: z.number().positive().multipleOf(0.01),
  totalAmount: z.number().nonNegative().optional(),
  odometerReading: z.number().int().nonNegative(),
});

export const MaintenanceJobSchema = z.object({
  jobDate: z.coerce.date().max(new Date()),
  vehicleId: z.string().cuid(),
  odometerAtService: z.number().int().nonNegative(),
  jobType: z.enum(["PREVENTATIVE", "BREAKDOWN"]),
  workshopId: z.string().cuid().optional().nullable(),
  partsCost: z.number().nonNegative().default(0),
  labourCost: z.number().nonNegative().default(0),
  totalCost: z.number().nonNegative().optional(),
  description: z.string().max(1000).optional(),
});
```

## 8. Concurrency & Race Condition Guards

- Use database transactions for odometer progression checks to prevent two simultaneous fuel entries from bypassing validation.
- Use `SELECT ... FOR UPDATE` on the Vehicle row when validating odometer sequence.
- BullMQ jobs should be idempotent and use unique job IDs per vehicle+date combination.
