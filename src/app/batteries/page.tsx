import { BatteryTable } from './_components/battery-table'

export default function BatteriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Batteries</h1>
      <BatteryTable />
    </div>
  )
}
