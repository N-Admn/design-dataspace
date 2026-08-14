import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { GoogleAccountChooserDialog } from '@/components/auth/GoogleAccountChooserDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { useToast } from '@/components/ui/toast'
import { isValidEmail, MOCK_EXISTING_USER, type MockGoogleAccount } from '@/lib/auth-mock'

interface FormErrors {
  email?: string
  password?: string
}

function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const prefillEmail = (location.state as { email?: string } | null)?.email ?? ''

  const [view, setView] = React.useState<'sign-in' | 'account-exists'>('sign-in')
  const [linkedAccount, setLinkedAccount] = React.useState<MockGoogleAccount | null>(null)
  const [email, setEmail] = React.useState(prefillEmail)
  const [password, setPassword] = React.useState('')
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [googleChooserOpen, setGoogleChooserOpen] = React.useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!password) {
      nextErrors.password = 'Password is required.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      const credentialsMatch =
        email.trim().toLowerCase() === MOCK_EXISTING_USER.email && password === MOCK_EXISTING_USER.password

      if (!credentialsMatch) {
        setErrors({ password: 'Incorrect password. Try again or reset your password.' })
        return
      }

      toast({ title: 'Welcome back', description: 'Signed in successfully.' })
      navigate('/')
    }, 500)
  }

  const handleGoogleSelect = (account: MockGoogleAccount) => {
    setGoogleChooserOpen(false)

    if (account.kind === 'existing-password') {
      setLinkedAccount(account)
      setView('account-exists')
      return
    }

    if (account.kind === 'new') {
      toast({ title: 'Account created', description: 'Welcome to CivicDataSpace.' })
    } else {
      toast({ title: 'Welcome back', description: 'Signed in with Google.' })
    }
    navigate('/')
  }

  if (view === 'account-exists' && linkedAccount) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-semibold text-primary">An account already exists with this email.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {linkedAccount.email} is already registered with CivicDataSpace. You can sign in using your existing
          password or continue with Google to connect your accounts.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            onClick={() => {
              setEmail(linkedAccount.email)
              setView('sign-in')
            }}
          >
            Sign In
          </Button>
          <GoogleButton
            onClick={() => {
              toast({ title: 'Accounts linked', description: 'Welcome back.' })
              navigate('/')
            }}
          >
            Continue with Google
          </GoogleButton>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-primary">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to CivicDataSpace.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="signin-email">Email *</Label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            aria-invalid={Boolean(errors.email)}
            className="mt-1.5"
            placeholder="you@example.org"
          />
          <FieldError message={errors.email} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password">Password *</Label>
            <Link to="/auth/forgot-password" state={{ email }} className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="signin-password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            aria-invalid={Boolean(errors.password)}
            className="mt-1.5"
            placeholder="Enter your password"
          />
          <FieldError message={errors.password} />
        </div>

        <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={() => setGoogleChooserOpen(true)} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/auth/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>

      <GoogleAccountChooserDialog
        open={googleChooserOpen}
        onOpenChange={setGoogleChooserOpen}
        onSelect={handleGoogleSelect}
      />
    </AuthLayout>
  )
}

export { SignInPage }
