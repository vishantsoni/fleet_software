export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatKm(km: number): string {
  return `${formatNumber(km, 2)} km`
}

export function getAlertColor(status: string): string {
  switch (status) {
    case 'GREEN':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'AMBER':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'RED':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getAlertLabel(status: string): string {
  switch (status) {
    case 'GREEN':
      return 'Valid'
    case 'AMBER':
      return 'Expiring Soon'
    case 'RED':
      return 'Expired'
    default:
      return 'Unknown'
  }
}
