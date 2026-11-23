import * as React from 'react'

import { useAuth } from '@/context/AuthContext'
import type { ClaimIdentity } from '@/lib/invite-links'
import { ACTIVE_MEMBER_IDS, ACTIVE_PERSONA } from '@/lib/notification-personas'
import { CURRENT_USER_PERSON_ID } from '@/types/organisation-workspace'

const CLAIMANT_KEY = 'civicdataspace:invite-claimant'

/** The browser opening an invitation link, as a stable id: the first person to open a link claims it, and until they have signed in this
 *  is all there is to tell them apart. */
function readClaimantKey(): string {
  try {
    const existing = window.localStorage.getItem(CLAIMANT_KEY)
    if (existing) return existing
    const created = `browser-${crypto.randomUUID()}`
    window.localStorage.setItem(CLAIMANT_KEY, created)
    return created
  } catch {
    return 'browser-unknown'
  }
}

/** "jane.doe@example.org" → "Jane Doe": a readable name for an account that signed in with only an email. */
function nameFromEmail(email: string): string {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Who the signed-in person is, for claiming and accepting an invitation link; null when signed out. The prototype's default signed-in
 *  person (John Doe) has no account record, so he is identified as himself; any other account is identified by its email. */
function useClaimIdentity(): ClaimIdentity | null {
  const { isSignedIn, account } = useAuth()
  return React.useMemo(() => {
    if (!isSignedIn) return null
    if (account) {
      const personId = `account:${account.email}`
      return { key: account.email, name: account.name ?? nameFromEmail(account.email), email: account.email, personId, memberIds: [personId] }
    }
    return { key: 'me', name: ACTIVE_PERSONA.name, email: ACTIVE_PERSONA.email, personId: CURRENT_USER_PERSON_ID, memberIds: ACTIVE_MEMBER_IDS }
  }, [isSignedIn, account])
}

export { useClaimIdentity, readClaimantKey }
