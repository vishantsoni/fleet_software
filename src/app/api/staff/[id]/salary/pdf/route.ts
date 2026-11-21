import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth/options'
import { getStaffSalarySummary } from '@/server/actions/staff/salary'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  try {
    const { id } = await params
    const month = request.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
    const summary = await getStaffSalarySummary(id, month) as any

    const html = `<!doctype html><html><head><title>Staff Salary ${month}</title><style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #111; }
      .card { max-width: 720px; margin: auto; border: 1px solid #ddd; padding: 24px; border-radius: 8px; }
      h1 { text-align: center; margin-bottom: 4px; }
      .meta { text-align: center; color: #555; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      td { padding: 8px 0; border-bottom: 1px solid #eee; }
      .label { color: #555; }
      .value { text-align: right; font-weight: 600; }
      .total { font-size: 18px; }
    </style></head><body>
      <div class="card">
        <h1>Staff Salary Slip</h1>
        <p class="meta">${summary.staff?.name ?? id} • ${month}</p>
        <table>
          <tr><td class="label">Base Salary</td><td class="value">${summary.staff?.baseSalary ?? 0}</td></tr>
          <tr><td class="label">Absent Days</td><td class="value">${summary.absentDays ?? 0}</td></tr>
          <tr><td class="label">Absence Deduction</td><td class="value">${summary.salaryPayment?.absenceDeducted ?? summary.absenceDeduction ?? 0}</td></tr>
          <tr><td class="label">Advance Deduction</td><td class="value">${summary.salaryPayment?.advanceDeducted ?? summary.advanceDeduction ?? 0}</td></tr>
          <tr><td class="label">Expense Reimbursed</td><td class="value">${summary.salaryPayment?.expenseReimbursed ?? 0}</td></tr>
          <tr><td class="label total">Net Salary</td><td class="value total">${summary.salaryPayment?.netSalary ?? summary.netSalary ?? 0}</td></tr>
        </table>
      </div>
      <script>window.print()</script>
    </body></html>`

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (error) {
    console.error('Staff salary slip error:', error)
    return NextResponse.json({ error: 'Could not generate slip.' }, { status: 500 })
  }
}
