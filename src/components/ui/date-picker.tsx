'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  min?: string
  max?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  className,
  min,
  max,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(() => {
    if (value) {
      const d = new Date(value)
      return isNaN(d.getTime()) ? new Date() : d
    }
    return new Date()
  })
  const [selected, setSelected] = React.useState<string | null>(value || null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (value) {
      setSelected(value)
      const d = new Date(value)
      if (!isNaN(d.getTime())) setViewDate(d)
    }
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const handleSelect = (day: number) => {
    const date = new Date(year, month, day)
    const formatted = date.toISOString().split('T')[0]
    setSelected(formatted)
    onChange?.(formatted)
    setOpen(false)
  }

  const handleToday = () => {
    const today = new Date()
    setViewDate(today)
    const formatted = today.toISOString().split('T')[0]
    setSelected(formatted)
    onChange?.(formatted)
    setOpen(false)
  }

  const handleClear = () => {
    setSelected(null)
    onChange?.('')
    setOpen(false)
  }

  const monthName = viewDate.toLocaleString('default', { month: 'long' })
  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day)
    const formatted = date.toISOString().split('T')[0]
    if (min && formatted < min) return true
    if (max && formatted > max) return true
    return false
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    const date = new Date(year, month, day)
    return date.toISOString().split('T')[0] === selected
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          'w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm',
          !selected && 'text-muted-foreground'
        )}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        {selected ? (
          <span>{new Date(selected).toLocaleDateString('en-GB')}</span>
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-72 rounded-md border bg-popover p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {monthName} {year}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {weekdayNames.map((wd) => (
              <div key={wd} className="text-muted-foreground py-1">
                {wd}
              </div>
            ))}
            {days.map((day, idx) =>
              day === null ? (
                <div key={`empty-${idx}`} />
              ) : (
                <Button
                  key={day}
                  type="button"
                  variant={isSelected(day) ? 'default' : 'ghost'}
                  size="icon"
                  className={cn(
                    'h-8 w-8 p-0 text-xs',
                    isDisabled(day) && 'opacity-40 cursor-not-allowed'
                  )}
                  disabled={isDisabled(day)}
                  onClick={() => handleSelect(day)}
                >
                  {day}
                </Button>
              )
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToday}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}