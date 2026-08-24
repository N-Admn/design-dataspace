interface MockGoogleAccount {
  name: string
  email: string
  initials: string
  kind: 'new' | 'existing-google' | 'existing-password' | 'auth-error' | 'new-fails'
}

const MOCK_EXISTING_USER = {
  email: 'jane.doe@civicdataspace.org',
  password: 'Password123',
}

const GOOGLE_MOCK_ACCOUNTS: MockGoogleAccount[] = [
  { name: 'Jordan Rivera', email: 'jordan.rivera@gmail.com', initials: 'JR', kind: 'new' },
  { name: 'Amara Chen', email: 'amara.chen@gmail.com', initials: 'AC', kind: 'existing-google' },
  { name: 'Sam Patel', email: 'sam.patel@gmail.com', initials: 'SP', kind: 'existing-password' },
  { name: 'Priya Nair', email: 'priya.nair@gmail.com', initials: 'PN', kind: 'new-fails' },
  { name: 'Marcus Webb', email: 'marcus.webb@gmail.com', initials: 'MW', kind: 'auth-error' },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim())
}

function isExistingEmail(email: string) {
  return email.trim().toLowerCase() === MOCK_EXISTING_USER.email
}

interface PasswordRequirementState {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
}

function getPasswordRequirements(password: string): PasswordRequirementState {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }
}

function isPasswordValid(password: string) {
  const req = getPasswordRequirements(password)
  return req.minLength && req.hasUppercase && req.hasNumber
}

export {
  MOCK_EXISTING_USER,
  GOOGLE_MOCK_ACCOUNTS,
  isValidEmail,
  isExistingEmail,
  getPasswordRequirements,
  isPasswordValid,
}
export type { MockGoogleAccount, PasswordRequirementState }
