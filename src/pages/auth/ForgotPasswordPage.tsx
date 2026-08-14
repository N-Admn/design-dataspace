import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { isValidEmail } from '@/lib/auth-mock'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? ''

  const [view, setView] = React.useState<'request' | 'sent'>('request')
  const [email, setEmail] = React.useState(prefillEmail)
  const [error, setError] = React.useState<string | undefined>()
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setView('sent')
    }, 500)
  }

  if (view === 'sent') {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-primary">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for this email, we've sent instructions to reset your password.
          </p>
          <Button type="button" size="lg" className="mt-6 w-full" onClick={() => navigate('/auth/sign-in')}>
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-primary">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="reset-email">Email *</Label>
          <Input
            id="reset-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(undefined)
            }}
            aria-invalid={Boolean(error)}
            className="mt-1.5"
            placeholder="you@example.org"
          />
          <FieldError message={error} />
        </div>

        <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send Reset Link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/auth/sign-in" className="font-medium text-primary hover:underline">
          Back to Sign In
        </Link>
      </p>
    </AuthLayout>
  )
}

export { ForgotPasswordPage }
