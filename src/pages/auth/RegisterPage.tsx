import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordRequirements } from '@/components/auth/PasswordRequirements'
import { LegalDialog } from '@/components/auth/LegalDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError } from '@/components/ui/field-error'
import { isValidEmail, isExistingEmail, isPasswordValid } from '@/lib/auth-mock'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
}

function RegisterPage() {
  const navigate = useNavigate()

  const [view, setView] = React.useState<'register' | 'account-created'>('register')

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [passwordTouched, setPasswordTouched] = React.useState(false)
  const [agree, setAgree] = React.useState(false)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [legalDialog, setLegalDialog] = React.useState<'terms' | 'privacy' | null>(null)

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.'
    } else if (isExistingEmail(email)) {
      nextErrors.email = 'An account already exists with this email. Sign in instead.'
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (!isPasswordValid(password)) {
      nextErrors.password = 'Password does not meet all requirements.'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!agree) {
      nextErrors.terms = 'Please accept the Terms & Conditions and Privacy Policy to continue.'
    }

    return nextErrors
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setView('account-created')
    }, 500)
  }

  const handleGoogleClick = () => {
    navigate('/auth/sign-in', { state: { openGoogle: true } })
  }

  if (view === 'account-created') {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-primary">Account created</h1>
          <p className="mt-2 text-sm text-muted-foreground">Welcome to CivicDataSpace.</p>
          <Button type="button" size="lg" className="mt-6 w-full" onClick={() => navigate('/')}>
            Continue to Dashboard
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-primary">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Join CivicDataSpace to create, manage and share civic data and knowledge.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="register-email">Email *</Label>
          <Input
            id="register-email"
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
          {errors.email === 'An account already exists with this email. Sign in instead.' ? (
            <p className="mt-1.5 text-xs font-medium text-destructive">
              An account already exists with this email.{' '}
              <Link to="/auth/sign-in" state={{ email }} className="underline underline-offset-2">
                Sign in instead.
              </Link>
            </p>
          ) : (
            <FieldError message={errors.email} />
          )}
        </div>

        <div>
          <Label htmlFor="register-password">Password *</Label>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            value={password}
            onFocus={() => setPasswordTouched(true)}
            onChange={(event) => {
              setPassword(event.target.value)
              setPasswordTouched(true)
              setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            aria-invalid={Boolean(errors.password)}
            className="mt-1.5"
            placeholder="Create a password"
          />
          {(passwordTouched || password.length > 0) && <PasswordRequirements password={password} />}
          <FieldError message={errors.password} />
        </div>

        <div>
          <Label htmlFor="register-confirm-password">Confirm Password *</Label>
          <PasswordInput
            id="register-confirm-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
            aria-invalid={Boolean(errors.confirmPassword)}
            className="mt-1.5"
            placeholder="Re-enter your password"
          />
          <FieldError message={errors.confirmPassword} />
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="register-terms"
              checked={agree}
              onCheckedChange={(checked) => {
                setAgree(checked === true)
                setErrors((prev) => ({ ...prev, terms: undefined }))
              }}
              className="mt-0.5"
              aria-invalid={Boolean(errors.terms)}
            />
            <Label htmlFor="register-terms" className="text-xs font-normal leading-relaxed text-muted-foreground">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setLegalDialog('terms')}
                className="font-medium text-primary underline underline-offset-2"
              >
                Terms &amp; Conditions
              </button>{' '}
              and acknowledge the{' '}
              <button
                type="button"
                onClick={() => setLegalDialog('privacy')}
                className="font-medium text-primary underline underline-offset-2"
              >
                Privacy Policy
              </button>
              .
            </Label>
          </div>
          <FieldError message={errors.terms} />
        </div>

        <Button type="submit" size="lg" className="mt-2" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={handleGoogleClick} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/auth/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>

      <LegalDialog open={legalDialog !== null} type={legalDialog} onOpenChange={(open) => !open && setLegalDialog(null)} />
    </AuthLayout>
  )
}

export { RegisterPage }
