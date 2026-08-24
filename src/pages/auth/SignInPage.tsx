import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, CheckCircle2 } from 'lucide-react'

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

type SignInView =
  | 'sign-in'
  | 'google-failure'
  | 'account-found'
  | 'account-verified'
  | 'different-account'
  | 'create-account-google'
  | 'create-account-failure'
  | 'account-created-google'

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </button>
  )
}

function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const navState = (location.state as { email?: string; openGoogle?: boolean } | null) ?? null
  const prefillEmail = navState?.email ?? ''

  const [view, setView] = React.useState<SignInView>('sign-in')
  const [email, setEmail] = React.useState(prefillEmail)
  const [password, setPassword] = React.useState('')
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [googleChooserOpen, setGoogleChooserOpen] = React.useState(false)

  const [linkedAccount, setLinkedAccount] = React.useState<MockGoogleAccount | null>(null)
  const [pendingGoogleAccount, setPendingGoogleAccount] = React.useState<MockGoogleAccount | null>(null)
  const [pendingNewAccount, setPendingNewAccount] = React.useState<MockGoogleAccount | null>(null)
  const [verifyingLink, setVerifyingLink] = React.useState(false)

  const [creating, setCreating] = React.useState(false)

  React.useEffect(() => {
    if (navState?.openGoogle) setGoogleChooserOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Confirmation states converge on the dashboard without requiring another click.
  React.useEffect(() => {
    if (view === 'account-verified' || view === 'account-created-google') {
      const timeout = window.setTimeout(() => navigate('/'), 1100)
      return () => window.clearTimeout(timeout)
    }
  }, [view, navigate])

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
        setErrors({ password: 'Email or password is incorrect.' })
        return
      }

      toast({ title: 'Welcome back', description: 'Signed in successfully.' })
      navigate('/')
    }, 500)
  }

  const proceedWithGoogleAccount = (account: MockGoogleAccount) => {
    if (account.kind === 'auth-error') {
      setView('google-failure')
      return
    }
    if (account.kind === 'existing-google') {
      toast({ title: 'Welcome back', description: 'Signed in with Google.' })
      navigate('/')
      return
    }
    if (account.kind === 'existing-password') {
      setLinkedAccount(account)
      setView('account-found')
      return
    }
    // 'new' or 'new-fails' — no CivicDataSpace account exists for this Google email yet.
    setPendingNewAccount(account)
    setView('create-account-google')
  }

  const handleGoogleSelect = (account: MockGoogleAccount) => {
    setGoogleChooserOpen(false)

    // If the sign-in form already identifies a known CivicDataSpace account by email,
    // and the chosen Google account belongs to someone else, surface the mismatch
    // before doing anything — never silently merge two different identities.
    const typedKnownEmail = email.trim().toLowerCase() === MOCK_EXISTING_USER.email
    if (typedKnownEmail && account.email.toLowerCase() !== MOCK_EXISTING_USER.email) {
      setPendingGoogleAccount(account)
      setView('different-account')
      return
    }

    proceedWithGoogleAccount(account)
  }

  const handleConnectGoogle = () => {
    if (!linkedAccount) return
    setVerifyingLink(true)
    window.setTimeout(() => {
      setVerifyingLink(false)
      toast({ title: 'Account verified', description: 'Your Google account is now connected to CivicDataSpace.' })
      setView('account-verified')
    }, 500)
  }

  const handleCreateAccount = () => {
    if (!pendingNewAccount) return

    setCreating(true)
    window.setTimeout(() => {
      setCreating(false)
      if (pendingNewAccount.kind === 'new-fails') {
        setView('create-account-failure')
        return
      }
      toast({ title: 'Account created', description: 'Your CivicDataSpace account is ready.' })
      setView('account-created-google')
    }, 500)
  }

  const returnToSignIn = () => setView('sign-in')

  /* ---------- Google sign-in failed ---------- */
  if (view === 'google-failure') {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-semibold text-primary">Google sign-in failed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't sign you in with Google. Please try again or use another sign-in method.
        </p>
        <div className="mt-6 flex flex-col items-start gap-4">
          <Button type="button" size="lg" className="w-full" onClick={() => { setView('sign-in'); setGoogleChooserOpen(true) }}>
            Try again
          </Button>
          <BackLink label="Use another sign-in method" onClick={returnToSignIn} />
        </div>
      </AuthLayout>
    )
  }

  /* ---------- Existing account found (Google not yet linked — re-verify identity via Google, no password) ---------- */
  if (view === 'account-found' && linkedAccount) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-semibold text-primary">Existing account found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This email is already associated with a CivicDataSpace account. Continue with Google to verify your
          identity.
        </p>
        <div className="mt-6 flex flex-col items-start gap-4">
          <GoogleButton className="w-full" onClick={handleConnectGoogle} disabled={verifyingLink}>
            {verifyingLink ? 'Verifying…' : 'Continue with Google'}
          </GoogleButton>
          <BackLink label="Back to Sign in" onClick={returnToSignIn} />
        </div>
      </AuthLayout>
    )
  }

  /* ---------- Account verified (brief confirmation, then Dashboard) ---------- */
  if (view === 'account-verified') {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-primary">Account verified</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your Google account is now connected to CivicDataSpace.
          </p>
        </div>
      </AuthLayout>
    )
  }

  /* ---------- Different Google account than the one already typed in ---------- */
  if (view === 'different-account' && pendingGoogleAccount) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-semibold text-primary">Different account detected</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This Google account is different from your existing CivicDataSpace account.
        </p>
        <div className="mt-6 flex flex-col items-start gap-4">
          <Button type="button" size="lg" className="w-full" onClick={() => proceedWithGoogleAccount(pendingGoogleAccount)}>
            Continue with this Google account
          </Button>
          <BackLink
            label="Use another account"
            onClick={() => { setView('sign-in'); setGoogleChooserOpen(true) }}
          />
        </div>
      </AuthLayout>
    )
  }

  /* ---------- Create a CivicDataSpace account from a new Google sign-in ---------- */
  if (view === 'create-account-google' && pendingNewAccount) {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-semibold text-primary">Create your CivicDataSpace account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your Google account is ready. Create your CivicDataSpace account.</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="new-google-email">Email</Label>
            <div
              id="new-google-email"
              className="mt-1.5 flex h-10 items-center justify-between gap-3 rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground"
            >
              <span className="truncate">{pendingNewAccount.email}</span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-success">
                <Check className="size-3.5" />
                Verified
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setView('sign-in'); setGoogleChooserOpen(true) }}
            className="self-start text-xs font-medium text-primary hover:underline"
          >
            Use a different Google account
          </button>

          <div className="mt-2 flex flex-col gap-3">
            <Button type="button" size="lg" onClick={handleCreateAccount} disabled={creating}>
              {creating ? 'Creating account…' : 'Create account'}
            </Button>
            <BackLink label="Back to Sign in" onClick={returnToSignIn} />
          </div>
        </div>
      </AuthLayout>
    )
  }

  /* ---------- Account creation failed ---------- */
  if (view === 'create-account-failure') {
    return (
      <AuthLayout>
        <h1 className="text-2xl font-semibold text-primary">We couldn't create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while creating your CivicDataSpace account. Please try again.
        </p>
        <div className="mt-6 flex flex-col items-start gap-4">
          <Button type="button" size="lg" className="w-full" onClick={() => setView('create-account-google')}>
            Try again
          </Button>
          <BackLink label="Return to Sign in" onClick={returnToSignIn} />
        </div>
      </AuthLayout>
    )
  }

  /* ---------- Account created (brief confirmation, then Dashboard) ---------- */
  if (view === 'account-created-google') {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-primary">Account created</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your CivicDataSpace account is ready.</p>
        </div>
      </AuthLayout>
    )
  }

  /* ---------- Sign in (default) ---------- */
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
