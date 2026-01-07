import { forwardRef, useState, useRef, useEffect, createContext, useContext } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const context = useContext(SelectContext)
  if (!context) {
    throw new Error('Select components must be used within a Select')
  }
  return context
}

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

function Select({ children, value: controlledValue, onValueChange, defaultValue = '' }: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const value = controlledValue ?? uncontrolledValue
  const handleValueChange = onValueChange ?? setUncontrolledValue

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className }, ref) => {
    const { open, setOpen } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        {children}
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext()

  return (
    <span className={cn(!value && 'text-muted-foreground')}>
      {value || placeholder}
    </span>
  )
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = useSelectContext()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-background shadow-lg animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

interface SelectItemProps {
  children: React.ReactNode
  value: string
  className?: string
}

function SelectItem({ children, value: itemValue, className }: SelectItemProps) {
  const { value, onValueChange, setOpen } = useSelectContext()
  const isSelected = value === itemValue

  return (
    <div
      onClick={() => {
        onValueChange(itemValue)
        setOpen(false)
      }}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none hover:bg-surface',
        isSelected && 'bg-surface',
        className
      )}
    >
      <span className="flex-1">{children}</span>
      {isSelected && <Check className="h-4 w-4" />}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
