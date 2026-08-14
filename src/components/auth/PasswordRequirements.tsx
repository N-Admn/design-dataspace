import { Check, Circle } from 'lucide-react'

import { getPasswordRequirements } from '@/lib/auth-mock'
import { cn } from '@/lib/utils'

function PasswordRequirements({ password }: { password: string }) {
  const req = getPasswordRequirements(password)
  const items: { label: string; met: boolean }[] = [
    { label: 'At least 8 characters', met: req.minLength },
    { label: 'One uppercase letter', met: req.hasUppercase },
    { label: 'One number', met: req.hasNumber },
  ]

  return (
    <div className="mt-2 rounded-md border border-border bg-muted/50 p-3">
      <p className="text-xs font-medium text-foreground">Password must contain:</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              'flex items-center gap-1.5 text-xs',
              item.met ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {item.met ? (
              <Check className="size-3.5 shrink-0" strokeWidth={3} />
            ) : (
              <Circle className="size-3.5 shrink-0" />
            )}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export { PasswordRequirements }
