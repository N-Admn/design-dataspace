import * as React from 'react'

import { formatTimestamp } from '@/lib/format'
import { resolveLifecycle } from '@/lib/content-status'
import { diffActivity, emitActivity, type ActivitySnapshot } from '@/lib/activity-events'
import { generateInviteToken, resolveClaim, type ClaimIdentity, type ClaimOutcome } from '@/lib/invite-links'
import {
  EVALUATION_PICKER_MODULES,
  checkAssignment,
  checkEvaluationScope,
  invalidateAssignmentsForRecord,
  isEligibleForEvaluation,
  reconcileOrganisationAssignments,
  revokeAssignmentsOf,
  type AssignableRecord,
  type AssignmentCheck,
} from '@/lib/evaluation-assignments'
import { MOCK_DATASETS } from '@/lib/mock-datasets'
import { MOCK_EVENTS } from '@/lib/mock-events'
import { MOCK_ORGANISATIONS } from '@/lib/mock-organisations'
import { MOCK_USE_CASE_RECORDS } from '@/lib/mock-usecases'
import { MOCK_COLLABORATIVE_RECORDS } from '@/lib/mock-collaboratives'
import { slugify } from '@/lib/collaborative-validation'
import { withDashboardUrl } from '@/lib/dashboard-embed'
import { MOCK_AI_MODEL_RECORDS } from '@/lib/mock-ai-models'
import { MOCK_PUBLICATION_RECORDS } from '@/lib/mock-publications'
import { MOCK_CHART_RECORDS } from '@/lib/mock-charts'
import type { DatasetFormState, DatasetRecord, DatasetStatus } from '@/types/dataset'
import type { EventFormState, EventRecord, EventStatus, Organisation } from '@/types/event'
import { MOCK_PROFILE, type ContributorProfile } from '@/types/profile'
import type { UseCaseFormState, UseCaseRecord, UseCaseStatus } from '@/types/usecase'
import type { CollaborativeFormState, CollaborativeRecord, CollaborativeStatus } from '@/types/collaborative'
import type { AIModelFormState, AIModelRecord, AIModelStatus } from '@/types/ai-model'
import type { PublicationFormState, PublicationMetadata, PublicationRecord, PublicationStatus } from '@/types/publication'
import type { ChartFormState, ChartRecord, ChartStatus } from '@/types/chart'
import { normaliseSources } from '@/lib/dataset-sources'
import { MOCK_ORGANISATION_WORKSPACES } from '@/lib/mock-organisation-workspaces'
import { ACTIVE_PERSON_ID, ACTIVE_PERSONA } from '@/lib/notification-personas'
import { canonicalPersonId, setMembershipSource } from '@/lib/membership-source'
import { contentActionRefusal, isLastAdmin, type ContentAction } from '@/lib/organisation-permissions'
import {
  currentUserRole,
  type EvaluationAssignment,
  type EvaluationModule,
  type EvaluationScopeItem,
  type OrganisationInvitation,
  type OrganisationInviteLink,
  type OrganisationMember,
  type OrganisationMetadata,
  type OrganisationRecord,
  type OrganisationRole,
} from '@/types/organisation-workspace'

/** Migrate any records persisted before the lifecycle was simplified to two
 * statuses: a legacy 'pending' record always had a live published version, so it
 * becomes 'published' (its working copy in `form` still reads as unsaved changes). */
function normalizeStoredRecords<T extends { status: string }>(records: T[]): T[] {
  return records.map((r) => ((r.status as string) === 'pending' ? { ...r, status: 'published' } : r))
}

/** The signed-in person (John Doe), who new organisation content and new organisations are attributed to. */
const activePersona = () => ACTIVE_PERSONA

let datasetIdCounter = 0
let eventIdCounter = 0
let orgIdCounter = 0
let useCaseIdCounter = 0
let collaborativeIdCounter = 0
let aiModelIdCounter = 0
let publicationIdCounter = 0
let chartIdCounter = 0
let organisationWorkspaceIdCounter = 0
let organisationMemberIdCounter = 0
let organisationInvitationIdCounter = 0

/** Use cases are persisted to localStorage (and synced across tabs) so a Use Case
 * previewed/published from a separate preview tab is reflected back in the
 * original editor tab without a page reload. */
const USE_CASES_STORAGE_KEY = 'civicdataspace:usecases'

function loadStoredUseCases(): UseCaseRecord[] | null {
  try {
    const raw = window.localStorage.getItem(USE_CASES_STORAGE_KEY)
    if (!raw) return null
    return normalizeStoredRecords(JSON.parse(raw) as UseCaseRecord[]).map((r) => ({
      ...r,
      form: withDashboardUrl(r.form),
      publishedForm: r.publishedForm ? withDashboardUrl(r.publishedForm) : null,
    }))
  } catch {
    return null
  }
}

/** Bump when the bundled sample Use Cases / Collaboratives change. A browser holding an older copy then gets the new samples
 * once (records with a sample id are replaced, missing ones added) while records people created themselves are kept. */
const SEED_VERSION = '2026-10-29-no-event-publications'
const SEED_VERSION_KEY = 'civicdataspace:seed-version'

/** Publications keep their own seed version, so a change to the sample Publications doesn't reset the other samples. */
const PUBLICATIONS_SEED_VERSION = '2026-10-29-publication-detail'
const PUBLICATIONS_SEED_VERSION_KEY = 'civicdataspace:publications-seed-version'

function reconcileWithSeed<T extends { id: string }>(stored: T[] | null, seed: T[], version = SEED_VERSION, key = SEED_VERSION_KEY): T[] {
  if (!stored) return seed
  try {
    if (window.localStorage.getItem(key) === version) return stored
  } catch {
    return stored
  }
  const seedIds = new Set(seed.map((r) => r.id))
  return [...seed, ...stored.filter((r) => !seedIds.has(r.id))]
}

/** The sample records that now belong to the organisations John holds a role in (WHO as Editor, UNICEF as Evaluator). A browser that saved
 *  them before still has them in their old place; each is moved once, and only while it is still where the sample first put it. */
const SEED_ORGANISATION_MOVES: Record<string, { from: string | undefined; to: string }> = {
  'ds-4': { from: undefined, to: 'org-workspace-5' },
  'ds-5': { from: undefined, to: 'org-workspace-2' },
  'ds-8': { from: 'org-workspace-1', to: 'org-workspace-2' },
  'evt-2': { from: undefined, to: 'org-workspace-5' },
  'evt-5': { from: undefined, to: 'org-workspace-5' },
}

function withSeedOrganisations<T extends { id: string; organisationId?: string }>(records: T[]): T[] {
  return records.map((r) => {
    const move = SEED_ORGANISATION_MOVES[r.id]
    return move && r.organisationId === move.from ? { ...r, organisationId: move.to } : r
  })
}

/** Bump when the sample organisations gain seats, invitations or assignments that a browser holding an older copy should be given once. */
const ORGANISATION_SEED_VERSION = '2026-11-20-direct-invitations'
const ORGANISATION_SEED_KEY = 'civicdataspace:organisation-seed'

function organisationSeedIsStale(): boolean {
  try {
    return window.localStorage.getItem(ORGANISATION_SEED_KEY) !== ORGANISATION_SEED_VERSION
  } catch {
    return false
  }
}

function markOrganisationSeedCurrent() {
  try {
    window.localStorage.setItem(ORGANISATION_SEED_KEY, ORGANISATION_SEED_VERSION)
  } catch {
    /* storage unavailable: the sample is simply merged again next time */
  }
}

function markSeedCurrent(version = SEED_VERSION, key = SEED_VERSION_KEY) {
  try {
    window.localStorage.setItem(key, version)
  } catch {
    /* storage unavailable: samples simply stay as bundled */
  }
}

/** Datasets, events, charts and the profile are saved the same way as the other content, so a record created in one tab (a preview
 * opened in a new tab, "View live" on a dataset) is there when another tab loads, and survives a reload. */
const DATASETS_STORAGE_KEY = 'civicdataspace:datasets'
const EVENTS_STORAGE_KEY = 'civicdataspace:events'
const CHARTS_STORAGE_KEY = 'civicdataspace:charts'
const PROFILE_STORAGE_KEY = 'civicdataspace:profile'

function loadStoredList<T extends { status: string }>(key: string): T[] | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return normalizeStoredRecords(JSON.parse(raw) as T[])
  } catch {
    return null
  }
}

function loadStoredProfile(): ContributorProfile {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    return raw ? { ...MOCK_PROFILE, ...(JSON.parse(raw) as Partial<ContributorProfile>) } : MOCK_PROFILE
  } catch {
    return MOCK_PROFILE
  }
}

function bumpDatasetIdCounter(records: { id: string }[]) {
  for (const record of records) {
    const match = /^dataset-(\d+)$/.exec(record.id)
    if (match) datasetIdCounter = Math.max(datasetIdCounter, Number(match[1]))
  }
}

function bumpEventIdCounter(records: { id: string }[]) {
  for (const record of records) {
    const match = /^event-(\d+)$/.exec(record.id)
    if (match) eventIdCounter = Math.max(eventIdCounter, Number(match[1]))
  }
}

function bumpChartIdCounter(records: { id: string }[]) {
  for (const record of records) {
    const match = /^chart-(\d+)$/.exec(record.id)
    if (match) chartIdCounter = Math.max(chartIdCounter, Number(match[1]))
  }
}

/** Saves `value` under `key` whenever it changes, and applies a change made in another tab. */
function usePersistedValue<T>(key: string, value: T, apply: (next: T) => void) {
  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [key, value])
  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key || !event.newValue) return
      try {
        apply(JSON.parse(event.newValue) as T)
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

function bumpUseCaseIdCounter(records: UseCaseRecord[]) {
  for (const record of records) {
    const match = /^usecase-(\d+)$/.exec(record.id)
    if (match) useCaseIdCounter = Math.max(useCaseIdCounter, Number(match[1]))
  }
}

/** Collaboratives follow the same cross-tab persistence pattern as Use Cases —
 * their preview/publish also happens from a separate window.open() tab. */
const COLLABORATIVES_STORAGE_KEY = 'civicdataspace:collaboratives'

/** Records saved before the Collaborative URL existed have no slug — derive one from the name. */
function withCollaborativeSlug(form: CollaborativeFormState): CollaborativeFormState {
  if (typeof form.metadata.slug === 'string') return form
  return { ...form, metadata: { ...form.metadata, slug: slugify(form.metadata.name) } }
}

function loadStoredCollaboratives(): CollaborativeRecord[] | null {
  try {
    const raw = window.localStorage.getItem(COLLABORATIVES_STORAGE_KEY)
    if (!raw) return null
    return normalizeStoredRecords(JSON.parse(raw) as CollaborativeRecord[]).map((r) => ({
      ...r,
      form: withCollaborativeSlug(r.form),
      publishedForm: r.publishedForm ? withCollaborativeSlug(r.publishedForm) : null,
    }))
  } catch {
    return null
  }
}

function bumpCollaborativeIdCounter(records: CollaborativeRecord[]) {
  for (const record of records) {
    const match = /^collaborative-(\d+)$/.exec(record.id)
    if (match) collaborativeIdCounter = Math.max(collaborativeIdCounter, Number(match[1]))
  }
}

/** AI Models follow the same cross-tab persistence pattern as Use Cases and
 * Collaboratives — their preview/publish also happens from a separate window.open() tab. */
const AI_MODELS_STORAGE_KEY = 'civicdataspace:ai-models'

function loadStoredAIModels(): AIModelRecord[] | null {
  try {
    const raw = window.localStorage.getItem(AI_MODELS_STORAGE_KEY)
    return raw ? normalizeStoredRecords(JSON.parse(raw) as AIModelRecord[]) : null
  } catch {
    return null
  }
}

function bumpAIModelIdCounter(records: AIModelRecord[]) {
  for (const record of records) {
    const match = /^ai-model-(\d+)$/.exec(record.id)
    if (match) aiModelIdCounter = Math.max(aiModelIdCounter, Number(match[1]))
  }
}

/** Publications follow the same cross-tab persistence pattern as AI Models —
 * their preview/publish also happens from a separate window.open() tab. */
const PUBLICATIONS_STORAGE_KEY = 'civicdataspace:publications'

/** Migrate a Publication's metadata persisted before Contributors replaced the
 * plain Author Name(s) list: a legacy record has `authors: string[]` and no
 * `contributors` at all, so it's converted into one contributor per name. Records already on
 * the current shape (including a legitimately empty `contributors: []`) pass
 * through untouched. */
function migratePublicationMetadata(metadata: PublicationMetadata & { authors?: string[] }): PublicationMetadata {
  if (Array.isArray(metadata.contributors)) return metadata
  const legacyAuthors = Array.isArray(metadata.authors) ? metadata.authors : []
  return {
    ...metadata,
    contributors: legacyAuthors.map((name, index) => ({ id: `contributor-legacy-${index}-${name}`, name })),
  }
}

function normalizeStoredPublications(records: PublicationRecord[]): PublicationRecord[] {
  return records.map((r) => ({
    ...r,
    form: { ...r.form, metadata: migratePublicationMetadata(r.form.metadata) },
    publishedForm: r.publishedForm
      ? { ...r.publishedForm, metadata: migratePublicationMetadata(r.publishedForm.metadata) }
      : r.publishedForm,
  }))
}

function loadStoredPublications(): PublicationRecord[] | null {
  try {
    const raw = window.localStorage.getItem(PUBLICATIONS_STORAGE_KEY)
    return raw ? normalizeStoredPublications(normalizeStoredRecords(JSON.parse(raw) as PublicationRecord[])) : null
  } catch {
    return null
  }
}

function bumpPublicationIdCounter(records: PublicationRecord[]) {
  for (const record of records) {
    const match = /^publication-(\d+)$/.exec(record.id)
    if (match) publicationIdCounter = Math.max(publicationIdCounter, Number(match[1]))
  }
}

/** Organisation Workspaces follow the same cross-tab persistence pattern as Use
 * Cases — members added/roles changed from one tab should reflect in another. */
const ORGANISATION_WORKSPACES_STORAGE_KEY = 'civicdataspace:organisation-workspaces'

function loadStoredOrganisationWorkspaces(): OrganisationRecord[] | null {
  try {
    const raw = window.localStorage.getItem(ORGANISATION_WORKSPACES_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as OrganisationRecord[]
    // Back-fills `invitations` on records persisted before that field existed —
    // otherwise every `org.invitations.filter/map` call below throws on a
    // returning user's stale localStorage state.
    return parsed.map((org) => ({ ...org, invitations: org.invitations ?? [], inviteLinks: org.inviteLinks ?? [] }))
  } catch {
    return null
  }
}

let organisationAssignmentIdCounter = 0

function bumpOrganisationWorkspaceIdCounter(records: OrganisationRecord[]) {
  for (const record of records) {
    const match = /^org-workspace-(\d+)$/.exec(record.id)
    if (match) organisationWorkspaceIdCounter = Math.max(organisationWorkspaceIdCounter, Number(match[1]))
  }
}

/** Member ids are minted from the same shared counter across every organisation
 * (`createOrganisationWorkspace`'s founding admin and every `addOrganisationMember`
 * call), so this must scan every organisation's members — reconciling only the
 * just-created one's members would leave the counter behind and produce colliding
 * ids for a later organisation. */
function bumpOrganisationMemberIdCounter(records: OrganisationRecord[]) {
  for (const record of records) {
    for (const member of record.members) {
      const match = /^org-member-(\d+)$/.exec(member.id)
      if (match) organisationMemberIdCounter = Math.max(organisationMemberIdCounter, Number(match[1]))
    }
  }
}

/** Same shared-counter reasoning as `bumpOrganisationMemberIdCounter`, for invitation ids. */
function bumpOrganisationInvitationIdCounter(records: OrganisationRecord[]) {
  for (const record of records) {
    for (const invitation of record.invitations ?? []) {
      const match = /^org-invitation-(\d+)$/.exec(invitation.id)
      if (match) organisationInvitationIdCounter = Math.max(organisationInvitationIdCounter, Number(match[1]))
    }
  }
}

interface AppDataContextValue {
  datasets: DatasetRecord[]
  upsertDataset: (id: string | null, status: DatasetStatus, form: DatasetFormState, organisationId?: string) => string
  unpublishDataset: (id: string) => void
  deleteDataset: (id: string) => void

  events: EventRecord[]
  upsertEvent: (id: string | null, status: EventStatus, form: EventFormState, organisationId?: string) => string
  unpublishEvent: (id: string) => void
  deleteEvent: (id: string) => void

  organisations: Organisation[]
  addOrganisation: (org: Omit<Organisation, 'id'>) => Organisation

  useCases: UseCaseRecord[]
  upsertUseCase: (id: string | null, status: UseCaseStatus, form: UseCaseFormState, organisationId?: string) => string
  unpublishUseCase: (id: string) => void
  deleteUseCase: (id: string) => void

  collaboratives: CollaborativeRecord[]
  upsertCollaborative: (id: string | null, status: CollaborativeStatus, form: CollaborativeFormState, organisationId?: string) => string
  unpublishCollaborative: (id: string) => void
  deleteCollaborative: (id: string) => void

  aiModels: AIModelRecord[]
  upsertAIModel: (id: string | null, status: AIModelStatus, form: AIModelFormState, organisationId?: string) => string
  unpublishAIModel: (id: string) => void
  deleteAIModel: (id: string) => void

  charts: ChartRecord[]
  upsertChart: (id: string | null, status: ChartStatus, form: ChartFormState, organisationId?: string) => string
  unpublishChart: (id: string) => void
  deleteChart: (id: string) => void

  publications: PublicationRecord[]
  upsertPublication: (id: string | null, status: PublicationStatus, form: PublicationFormState, organisationId?: string) => string
  unpublishPublication: (id: string) => void
  deletePublication: (id: string) => void

  profile: ContributorProfile
  updateProfile: (profile: ContributorProfile) => void

  /** Organisation *Workspaces* (shared, multi-member) — distinct from the
   *  lightweight `organisations` list above, which is only used to tag content
   *  with an affiliated org name. See `types/organisation-workspace.ts`. */
  organisationWorkspaces: OrganisationRecord[]
  createOrganisationWorkspace: (metadata: OrganisationMetadata) => OrganisationRecord
  updateOrganisationWorkspaceMetadata: (organisationId: string, metadata: OrganisationMetadata) => void
  addOrganisationMember: (organisationId: string, member: { personId: string; name: string; email?: string; role: OrganisationRole }) => void
  /** Changing a member to Evaluator needs `evaluationScope` (at least one published record), otherwise it throws and saves nothing.
   *  Changing an Evaluator to another role ends their evaluation assignments. */
  updateOrganisationMemberRole: (organisationId: string, memberId: string, role: OrganisationRole, evaluationScope?: EvaluationScopeItem[]) => void
  removeOrganisationMember: (organisationId: string, memberId: string) => void
  /** Throws (and saves nothing) for an Evaluator invitation without at least one published record in `evaluationScope`. */
  inviteOrganisationMember: (
    organisationId: string,
    invitation: { personId?: string; name: string; email?: string; role: OrganisationRole; via?: 'link'; evaluationScope?: EvaluationScopeItem[] },
  ) => OrganisationInvitation
  /** Makes a shareable invitation link. It is not an invitation and not listed anywhere until someone claims it. Admin only; an Evaluator
   *  link needs at least one published record, otherwise it throws and saves nothing. */
  createInviteLink: (organisationId: string, input: { role: OrganisationRole; evaluationScope?: EvaluationScopeItem[] }) => OrganisationInviteLink
  /** Opens a link: the first call claims it (a pending invitation appears in the Invitations tab), later calls only resume it. */
  claimInviteLink: (token: string, claimantKey: string, identity: ClaimIdentity | null) => ClaimOutcome
  /** Finishes joining through a claimed link: only the account the link is bound to can do it. Same effects as accepting an invitation. */
  acceptInviteLink: (
    token: string,
    identity: ClaimIdentity,
  ) => { ok: true; activated: number; skipped: number } | { ok: false; message: string }
  /** The invited person's answer to a direct invitation. Accepting creates (or changes) their membership and activates the role; declining
   *  changes nothing else. Refused unless the invitation is pending and was sent to this person. */
  respondToInvitation: (
    organisationId: string,
    invitationId: string,
    response: 'accepted' | 'declined',
    person: { personId: string; name: string; email?: string },
  ) => { ok: true; activated: number; skipped: number } | { ok: false; reason: 'missing' | 'not-pending' | 'not-invitee' | 'already-member' | 'last-admin'; message: string }
  /** Sets the records an existing Evaluator is assigned (among the kinds the member drawer offers): records no longer listed are revoked,
   *  newly listed published records become active. Admin only. */
  setEvaluatorAssignments: (organisationId: string, evaluatorPersonId: string, scope: EvaluationScopeItem[]) => AssignmentActionResult
  /** Ends every active assignment of an Evaluator and keeps their membership. Admin only. */
  revokeEvaluatorAccess: (organisationId: string, evaluatorPersonId: string) => AssignmentActionResult
  revokeOrganisationInvitation: (organisationId: string, invitationId: string) => void
  /** Assigns a published record to an Evaluator. Refused (and nothing saved) unless the signed-in user is an Admin, the person is an
   *  Evaluator of the organisation, and the record is one of the organisation's published records. */
  assignEvaluation: (organisationId: string, input: { evaluatorPersonId: string; module: EvaluationModule; recordId: string }) => AssignmentCheck
}

type AssignmentActionResult = { ok: true } | { ok: false; message: string }

const AppDataContext = React.createContext<AppDataContextValue | null>(null)

function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = React.useState<DatasetRecord[]>(() => {
    const initial = withSeedOrganisations(loadStoredList<DatasetRecord>(DATASETS_STORAGE_KEY) ?? MOCK_DATASETS)
    bumpDatasetIdCounter(initial)
    return initial
  })
  const [events, setEvents] = React.useState<EventRecord[]>(() => {
    const initial = withSeedOrganisations(loadStoredList<EventRecord>(EVENTS_STORAGE_KEY) ?? MOCK_EVENTS)
    bumpEventIdCounter(initial)
    return initial
  })
  const [organisations, setOrganisations] = React.useState<Organisation[]>(MOCK_ORGANISATIONS)
  const [useCases, setUseCases] = React.useState<UseCaseRecord[]>(() => {
    const stored = loadStoredUseCases()
    const initial = reconcileWithSeed(stored, MOCK_USE_CASE_RECORDS)
    bumpUseCaseIdCounter(initial)
    return initial
  })
  const [collaboratives, setCollaboratives] = React.useState<CollaborativeRecord[]>(() => {
    const stored = loadStoredCollaboratives()
    const initial = reconcileWithSeed(stored, MOCK_COLLABORATIVE_RECORDS)
    markSeedCurrent()
    bumpCollaborativeIdCounter(initial)
    return initial
  })
  const [aiModels, setAIModels] = React.useState<AIModelRecord[]>(() => {
    const stored = loadStoredAIModels()
    const initial = stored ?? MOCK_AI_MODEL_RECORDS
    bumpAIModelIdCounter(initial)
    return initial
  })
  const [charts, setCharts] = React.useState<ChartRecord[]>(() => {
    const initial = loadStoredList<ChartRecord>(CHARTS_STORAGE_KEY) ?? MOCK_CHART_RECORDS
    bumpChartIdCounter(initial)
    return initial
  })
  const [publications, setPublications] = React.useState<PublicationRecord[]>(() => {
    const stored = loadStoredPublications()
    const initial = reconcileWithSeed(stored, MOCK_PUBLICATION_RECORDS, PUBLICATIONS_SEED_VERSION, PUBLICATIONS_SEED_VERSION_KEY)
    markSeedCurrent(PUBLICATIONS_SEED_VERSION, PUBLICATIONS_SEED_VERSION_KEY)
    bumpPublicationIdCounter(initial)
    return initial
  })
  const [profile, setProfile] = React.useState<ContributorProfile>(loadStoredProfile)
  const [organisationWorkspaces, setOrganisationWorkspaces] = React.useState<OrganisationRecord[]>(() => {
    const stored = loadStoredOrganisationWorkspaces()
    // What the sample gives each organisation (its seats, invitations, links and assignments) is added to a browser's saved copy **once**,
    // when the sample changes, so people who joined, were removed or changed role afterwards are never put back by a reload.
    const mergeSeed = organisationSeedIsStale()
    const initial = stored
      ? [
          ...stored.map((o) => {
            const seeded = MOCK_ORGANISATION_WORKSPACES.find((seed) => seed.id === o.id)
            // The directory-only organisations (ids 2 to 11) take their profile from the sample, as it describes them; their members,
            // invitations and assignments stay as saved.
            const isDirectorySeed = /^org-workspace-(?:[2-9]|1[01])$/.test(o.id)
            let current = isDirectorySeed && seeded ? { ...o, metadata: seeded.metadata } : o
            // CivicDataLab used to carry a stock photo as its sample logo, saved into this browser; drop that one so its real logo shows.
            if (current.metadata.logo?.name === 'civicdatalab-logo.jpg') current = { ...current, metadata: { ...current.metadata, logo: null } }
            if (!mergeSeed || !seeded) return current
            const byId = <T extends { id: string }>(have: T[] | undefined, seed: T[] | undefined) => [...(have ?? []), ...(seed ?? []).filter((x) => !(have ?? []).some((h) => h.id === x.id))]
            return {
              ...current,
              members: byId(current.members, seeded.members.filter((m) => !(current.removedPersonIds ?? []).includes(m.personId))),
              invitations: byId(current.invitations, seeded.invitations),
              assignments: byId(current.assignments, seeded.assignments),
              inviteLinks: [...(current.inviteLinks ?? []), ...(seeded.inviteLinks ?? []).filter((l) => !(current.inviteLinks ?? []).some((c) => c.token === l.token))],
            }
          }),
          ...MOCK_ORGANISATION_WORKSPACES.filter((seed) => !stored.some((o) => o.id === seed.id)),
        ]
      : MOCK_ORGANISATION_WORKSPACES
    bumpOrganisationWorkspaceIdCounter(initial)
    bumpOrganisationMemberIdCounter(initial)
    bumpOrganisationInvitationIdCounter(initial)
    for (const org of initial) {
      for (const a of org.assignments ?? []) {
        const n = /^evaluation-assignment-(\d+)$/.exec(a.id)
        if (n) organisationAssignmentIdCounter = Math.max(organisationAssignmentIdCounter, Number(n[1]))
      }
    }
    return initial
  })

  // The notification and collaborative rules read membership from this same list (see `lib/membership-source.ts`), so it is kept current
  // on every render, before any child reads it.
  setMembershipSource(organisationWorkspaces)

  // The latest records and organisations, for the permission checks and for actions that must see what is saved right now.
  const assignmentRecordsRef = React.useRef({ organisationWorkspaces, datasets, events, useCases, aiModels, publications, charts, collaboratives })
  assignmentRecordsRef.current = { organisationWorkspaces, datasets, events, useCases, aiModels, publications, charts, collaboratives }

  // ---- Permission checks. Every content and member mutation below runs one of these first, so a screen that hides a button is never the
  // only thing standing between a role and an action. They use the same role rules as the screens (`lib/organisation-permissions.ts`).
  const organisationById = (organisationId: string) => assignmentRecordsRef.current.organisationWorkspaces.find((o) => o.id === organisationId)

  type ContentKind = 'dataset' | 'event' | 'use-case' | 'collaborative' | 'ai-model' | 'chart' | 'publication'
  const contentPool = (kind: ContentKind): { id: string; organisationId?: string }[] => {
    const l = assignmentRecordsRef.current
    return { dataset: l.datasets, event: l.events, 'use-case': l.useCases, collaborative: l.collaboratives, 'ai-model': l.aiModels, chart: l.charts, publication: l.publications }[kind]
  }

  /** Content with no organisation is the person's own, so anything goes. Organisation content follows the person's role in that organisation. */
  const authoriseContent = (organisationId: string | undefined, action: ContentAction) => {
    if (!organisationId) return
    const organisation = organisationById(organisationId)
    if (!organisation) throw new Error('This organisation does not exist.')
    const refusal = contentActionRefusal(currentUserRole(organisation), action)
    if (refusal) throw new Error(refusal)
  }

  /** A save or publish: against the record's own organisation, never one named by the caller. Publishing is its own action. */
  const authoriseUpsert = (kind: ContentKind, id: string | null, status: 'draft' | 'published', organisationId: string | undefined) => {
    const existing = id ? contentPool(kind).find((r) => r.id === id) : undefined
    if (existing && organisationId !== undefined && organisationId !== existing.organisationId) {
      throw new Error('This record belongs to a different workspace.')
    }
    authoriseContent(existing ? existing.organisationId : organisationId, status === 'published' ? 'publish' : existing ? 'edit' : 'create')
  }

  const authoriseExisting = (kind: ContentKind, id: string, action: ContentAction) => {
    const record = contentPool(kind).find((r) => r.id === id)
    if (record) authoriseContent(record.organisationId, action)
  }

  // Evaluator assignments only ever hold while their record exists and is published and the person is still an Evaluator there. Whatever
  // changes any of that (a deletion, an unpublish, a removal, an edit made elsewhere, an older saved copy) ends the assignment here, as
  // history, so nothing can come back to life when a record is recreated, republished or reuses an id.
  React.useEffect(() => {
    const find = (module: EvaluationModule, recordId: string) => contentPool(module)?.find((r) => r.id === recordId) as AssignableRecord | undefined
    const endedAt = formatTimestamp(new Date())
    setOrganisationWorkspaces((prev) => {
      let changed = false
      const next = prev.map((o) => {
        const reconciled = reconcileOrganisationAssignments(o, find, endedAt)
        if (reconciled !== o) changed = true
        return reconciled
      })
      return changed ? next : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisationWorkspaces, datasets, events, useCases, aiModels, publications])

  // Whatever changes the stores, in whichever way (an action, an answer to an invitation, reconciliation, another tab), is compared with
  // what was there before and reported as platform events. The notification policy decides who is told (`lib/notification-policy.ts`).
  const activityRef = React.useRef<ActivitySnapshot | null>(null)
  React.useEffect(() => {
    const next = {
      organisations: organisationWorkspaces,
      content: { dataset: datasets, 'use-case': useCases, 'ai-model': aiModels, publication: publications, event: events, collaborative: collaboratives },
    } as unknown as ActivitySnapshot
    const before = activityRef.current
    activityRef.current = next
    if (!before) return
    for (const event of diffActivity(before, next, ACTIVE_PERSON_ID, Date.now())) emitActivity(event)
  }, [organisationWorkspaces, datasets, events, useCases, aiModels, publications, collaboratives])

  /** Member, invitation and organisation-profile actions belong to the organisation's Admins. */
  const authoriseAdmin = (organisationId: string, what: string) => {
    const organisation = organisationById(organisationId)
    if (!organisation) throw new Error('This organisation does not exist.')
    if (currentUserRole(organisation) !== 'admin') throw new Error(`Only an organisation Admin can ${what}.`)
  }

  usePersistedValue(DATASETS_STORAGE_KEY, datasets, (next) => {
    bumpDatasetIdCounter(next)
    setDatasets(next)
  })
  usePersistedValue(EVENTS_STORAGE_KEY, events, (next) => {
    bumpEventIdCounter(next)
    setEvents(next)
  })
  usePersistedValue(CHARTS_STORAGE_KEY, charts, (next) => {
    bumpChartIdCounter(next)
    setCharts(next)
  })
  usePersistedValue(PROFILE_STORAGE_KEY, profile, setProfile)

  React.useEffect(() => {
    try {
      window.localStorage.setItem(USE_CASES_STORAGE_KEY, JSON.stringify(useCases))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [useCases])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== USE_CASES_STORAGE_KEY || !event.newValue) return
      try {
        const next = JSON.parse(event.newValue) as UseCaseRecord[]
        bumpUseCaseIdCounter(next)
        setUseCases(next)
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(COLLABORATIVES_STORAGE_KEY, JSON.stringify(collaboratives))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [collaboratives])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== COLLABORATIVES_STORAGE_KEY || !event.newValue) return
      try {
        const next = JSON.parse(event.newValue) as CollaborativeRecord[]
        bumpCollaborativeIdCounter(next)
        setCollaboratives(next)
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(AI_MODELS_STORAGE_KEY, JSON.stringify(aiModels))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [aiModels])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AI_MODELS_STORAGE_KEY || !event.newValue) return
      try {
        const next = JSON.parse(event.newValue) as AIModelRecord[]
        bumpAIModelIdCounter(next)
        setAIModels(next)
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(PUBLICATIONS_STORAGE_KEY, JSON.stringify(publications))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
  }, [publications])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PUBLICATIONS_STORAGE_KEY || !event.newValue) return
      try {
        const next = normalizeStoredPublications(JSON.parse(event.newValue) as PublicationRecord[])
        bumpPublicationIdCounter(next)
        setPublications(next)
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(ORGANISATION_WORKSPACES_STORAGE_KEY, JSON.stringify(organisationWorkspaces))
    } catch {
      // Ignore storage write failures (e.g. private browsing quota).
    }
    // The saved copy now holds the merged sample, so it is not merged into again.
    markOrganisationSeedCurrent()
  }, [organisationWorkspaces])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ORGANISATION_WORKSPACES_STORAGE_KEY || !event.newValue) return
      try {
        const next = JSON.parse(event.newValue) as OrganisationRecord[]
        bumpOrganisationWorkspaceIdCounter(next)
        setOrganisationWorkspaces(next)
      } catch {
        // Ignore malformed payloads from other tabs.
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const upsertDataset = React.useCallback(
    (id: string | null, status: DatasetStatus, form: DatasetFormState, organisationId?: string) => {
      authoriseUpsert('dataset', id, status, organisationId)
      const updatedAt = formatTimestamp(new Date())
      const stored = normaliseSources(form)
      const recordId = id ?? `dataset-${(datasetIdCounter += 1)}`
      setDatasets((prev) => {
        const existing = prev.find((d) => d.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', stored)
        if (existing) {
          return prev.map((d) => (d.id === recordId ? { ...d, status: nextStatus, updatedAt, form: stored, publishedForm } : d))
        }
        return [
          {
            id: recordId,
            status: nextStatus,
            updatedAt,
            downloadCount: 0,
            form: stored,
            publishedForm,
            organisationId,
            createdBy: organisationId ? activePersona().name : undefined,
          },
          ...prev,
        ]
      })
      return recordId
    },
    [],
  )

  /** A record stopped being published: end its active evaluation assignments so its Evaluators lose access at once. */
  const invalidateEvaluationAssignments = React.useCallback((module: EvaluationModule, recordId: string, reason: 'record-unpublished' | 'record-deleted' = 'record-unpublished') => {
    const endedAt = formatTimestamp(new Date())
    setOrganisationWorkspaces((prev) => {
      let changed = false
      const next = prev.map((org) => {
        const assignments = invalidateAssignmentsForRecord(org.assignments, module, recordId, endedAt, reason)
        if (assignments === org.assignments) return org
        changed = true
        return { ...org, assignments }
      })
      return changed ? next : prev
    })
  }, [])

  const unpublishDataset = React.useCallback((id: string) => {
    authoriseExisting('dataset', id, 'unpublish')
    const updatedAt = formatTimestamp(new Date())
    setDatasets((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'draft', updatedAt } : d)))
    invalidateEvaluationAssignments('dataset', id)
  }, [invalidateEvaluationAssignments])

  const deleteDataset = React.useCallback((id: string) => {
    authoriseExisting('dataset', id, 'delete')
    setDatasets((prev) => prev.filter((d) => d.id !== id))
    // A deleted record ends its Evaluators' assignments, kept as history; a record made later is a new one and needs a new assignment.
    invalidateEvaluationAssignments('dataset', id, 'record-deleted')
  }, [invalidateEvaluationAssignments])

  const upsertEvent = React.useCallback(
    (id: string | null, status: EventStatus, form: EventFormState, organisationId?: string) => {
      authoriseUpsert('event', id, status, organisationId)
      const timestamp = formatTimestamp(new Date())
      const recordId = id ?? `event-${(eventIdCounter += 1)}`
      setEvents((prev) => {
        const existing = prev.find((e) => e.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((e) =>
            e.id === recordId ? { ...e, status: nextStatus, updatedAt: timestamp, form, publishedForm } : e,
          )
        }
        return [
          {
            id: recordId,
            status: nextStatus,
            createdAt: timestamp,
            updatedAt: timestamp,
            form,
            publishedForm,
            organisationId,
            createdBy: organisationId ? activePersona().name : undefined,
          },
          ...prev,
        ]
      })
      return recordId
    },
    [],
  )

  const unpublishEvent = React.useCallback((id: string) => {
    authoriseExisting('event', id, 'unpublish')
    const timestamp = formatTimestamp(new Date())
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'draft', updatedAt: timestamp } : e)))
    invalidateEvaluationAssignments('event', id)
  }, [invalidateEvaluationAssignments])

  const deleteEvent = React.useCallback((id: string) => {
    authoriseExisting('event', id, 'delete')
    setEvents((prev) => prev.filter((e) => e.id !== id))
    // A deleted record ends its Evaluators' assignments, kept as history; a record made later is a new one and needs a new assignment.
    invalidateEvaluationAssignments('event', id, 'record-deleted')
  }, [invalidateEvaluationAssignments])

  const addOrganisation = React.useCallback((org: Omit<Organisation, 'id'>) => {
    orgIdCounter += 1
    const newOrg: Organisation = { ...org, id: `org-local-${orgIdCounter}` }
    setOrganisations((prev) => [...prev, newOrg])
    return newOrg
  }, [])

  const upsertUseCase = React.useCallback(
    (id: string | null, status: UseCaseStatus, form: UseCaseFormState, organisationId?: string) => {
      authoriseUpsert('use-case', id, status, organisationId)
      const updatedAt = formatTimestamp(new Date())
      const recordId = id ?? `usecase-${(useCaseIdCounter += 1)}`
      setUseCases((prev) => {
        const existing = prev.find((u) => u.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((u) => (u.id === recordId ? { ...u, status: nextStatus, updatedAt, form, publishedForm } : u))
        }
        return [
          {
            id: recordId,
            status: nextStatus,
            updatedAt,
            form,
            publishedForm,
            organisationId,
            createdBy: organisationId ? activePersona().name : undefined,
          },
          ...prev,
        ]
      })
      return recordId
    },
    [],
  )

  const unpublishUseCase = React.useCallback((id: string) => {
    authoriseExisting('use-case', id, 'unpublish')
    const updatedAt = formatTimestamp(new Date())
    setUseCases((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'draft', updatedAt } : u)))
    invalidateEvaluationAssignments('use-case', id)
  }, [invalidateEvaluationAssignments])

  const deleteUseCase = React.useCallback((id: string) => {
    authoriseExisting('use-case', id, 'delete')
    setUseCases((prev) => prev.filter((u) => u.id !== id))
    // A deleted record ends its Evaluators' assignments, kept as history; a record made later is a new one and needs a new assignment.
    invalidateEvaluationAssignments('use-case', id, 'record-deleted')
  }, [invalidateEvaluationAssignments])

  const upsertCollaborative = React.useCallback(
    (id: string | null, status: CollaborativeStatus, form: CollaborativeFormState, organisationId?: string) => {
      authoriseUpsert('collaborative', id, status, organisationId)
      const updatedAt = formatTimestamp(new Date())
      const recordId = id ?? `collaborative-${(collaborativeIdCounter += 1)}`
      setCollaboratives((prev) => {
        const existing = prev.find((c) => c.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((c) => (c.id === recordId ? { ...c, status: nextStatus, updatedAt, form, publishedForm } : c))
        }
        return [
          {
            id: recordId,
            status: nextStatus,
            updatedAt,
            form,
            publishedForm,
            organisationId,
            createdBy: organisationId ? activePersona().name : undefined,
          },
          ...prev,
        ]
      })
      return recordId
    },
    [],
  )

  const unpublishCollaborative = React.useCallback((id: string) => {
    authoriseExisting('collaborative', id, 'unpublish')
    const updatedAt = formatTimestamp(new Date())
    setCollaboratives((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'draft', updatedAt } : c)))
  }, [])

  const deleteCollaborative = React.useCallback((id: string) => {
    authoriseExisting('collaborative', id, 'delete')
    setCollaboratives((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const upsertAIModel = React.useCallback(
    (id: string | null, status: AIModelStatus, form: AIModelFormState, organisationId?: string) => {
      authoriseUpsert('ai-model', id, status, organisationId)
      const updatedAt = formatTimestamp(new Date())
      const recordId = id ?? `ai-model-${(aiModelIdCounter += 1)}`
      setAIModels((prev) => {
        const existing = prev.find((m) => m.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((m) => (m.id === recordId ? { ...m, status: nextStatus, updatedAt, form, publishedForm } : m))
        }
        return [
          {
            id: recordId,
            status: nextStatus,
            updatedAt,
            form,
            publishedForm,
            organisationId,
            createdBy: organisationId ? activePersona().name : undefined,
          },
          ...prev,
        ]
      })
      return recordId
    },
    [],
  )

  const unpublishAIModel = React.useCallback((id: string) => {
    authoriseExisting('ai-model', id, 'unpublish')
    const updatedAt = formatTimestamp(new Date())
    setAIModels((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'draft', updatedAt } : m)))
    invalidateEvaluationAssignments('ai-model', id)
  }, [invalidateEvaluationAssignments])

  const deleteAIModel = React.useCallback((id: string) => {
    authoriseExisting('ai-model', id, 'delete')
    setAIModels((prev) => prev.filter((m) => m.id !== id))
    // A deleted record ends its Evaluators' assignments, kept as history; a record made later is a new one and needs a new assignment.
    invalidateEvaluationAssignments('ai-model', id, 'record-deleted')
  }, [invalidateEvaluationAssignments])

  const upsertChart = React.useCallback((id: string | null, status: ChartStatus, form: ChartFormState, organisationId?: string) => {
    authoriseUpsert('chart', id, status, organisationId)
    const updatedAt = formatTimestamp(new Date())
    const recordId = id ?? `chart-${(chartIdCounter += 1)}`
    setCharts((prev) => {
      const existing = prev.find((c) => c.id === recordId)
      const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
      if (existing) {
        return prev.map((c) => (c.id === recordId ? { ...c, status: nextStatus, updatedAt, form, publishedForm } : c))
      }
      return [
        {
          id: recordId,
          status: nextStatus,
          updatedAt,
          form,
          publishedForm,
          organisationId,
          createdBy: organisationId ? activePersona().name : undefined,
        },
        ...prev,
      ]
    })
    return recordId
  }, [])

  const unpublishChart = React.useCallback((id: string) => {
    authoriseExisting('chart', id, 'unpublish')
    const updatedAt = formatTimestamp(new Date())
    setCharts((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'draft', updatedAt } : c)))
  }, [])

  const deleteChart = React.useCallback((id: string) => {
    authoriseExisting('chart', id, 'delete')
    setCharts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const upsertPublication = React.useCallback(
    (id: string | null, status: PublicationStatus, form: PublicationFormState, organisationId?: string) => {
      authoriseUpsert('publication', id, status, organisationId)
      const updatedAt = formatTimestamp(new Date())
      const recordId = id ?? `publication-${(publicationIdCounter += 1)}`
      setPublications((prev) => {
        const existing = prev.find((p) => p.id === recordId)
        const { status: nextStatus, publishedForm } = resolveLifecycle(existing, status === 'published' ? 'publish' : 'save', form)
        if (existing) {
          return prev.map((p) => (p.id === recordId ? { ...p, status: nextStatus, updatedAt, form, publishedForm } : p))
        }
        return [
          {
            id: recordId,
            status: nextStatus,
            updatedAt,
            form,
            publishedForm,
            organisationId,
            createdBy: organisationId ? activePersona().name : undefined,
          },
          ...prev,
        ]
      })
      return recordId
    },
    [],
  )

  const unpublishPublication = React.useCallback((id: string) => {
    authoriseExisting('publication', id, 'unpublish')
    const updatedAt = formatTimestamp(new Date())
    setPublications((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'draft', updatedAt } : p)))
    invalidateEvaluationAssignments('publication', id)
  }, [invalidateEvaluationAssignments])

  const deletePublication = React.useCallback((id: string) => {
    authoriseExisting('publication', id, 'delete')
    setPublications((prev) => prev.filter((p) => p.id !== id))
    // A deleted record ends its Evaluators' assignments, kept as history; a record made later is a new one and needs a new assignment.
    invalidateEvaluationAssignments('publication', id, 'record-deleted')
  }, [invalidateEvaluationAssignments])

  const createOrganisationWorkspace = React.useCallback((metadata: OrganisationMetadata): OrganisationRecord => {
    const timestamp = formatTimestamp(new Date())
    organisationWorkspaceIdCounter += 1
    organisationMemberIdCounter += 1
    const record: OrganisationRecord = {
      id: `org-workspace-${organisationWorkspaceIdCounter}`,
      metadata,
      members: [
        {
          id: `org-member-${organisationMemberIdCounter}`,
          personId: activePersona().id,
          name: activePersona().name,
          email: activePersona().email,
          role: 'admin',
          joinedAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      invitations: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    setOrganisationWorkspaces((prev) => [record, ...prev])
    return record
  }, [])

  const updateOrganisationWorkspaceMetadata = React.useCallback((organisationId: string, metadata: OrganisationMetadata) => {
    authoriseAdmin(organisationId, 'edit the organisation profile')
    const updatedAt = formatTimestamp(new Date())
    setOrganisationWorkspaces((prev) =>
      prev.map((org) => (org.id === organisationId ? { ...org, metadata, updatedAt } : org)),
    )
  }, [])

  const addOrganisationMember = React.useCallback(
    (organisationId: string, member: { personId: string; name: string; email?: string; role: OrganisationRole }) => {
      authoriseAdmin(organisationId, 'add members')
      const timestamp = formatTimestamp(new Date())
      organisationMemberIdCounter += 1
      const newMember: OrganisationMember = {
        id: `org-member-${organisationMemberIdCounter}`,
        ...member,
        joinedAt: timestamp,
        updatedAt: timestamp,
      }
      setOrganisationWorkspaces((prev) =>
        prev.map((org) =>
          org.id === organisationId ? { ...org, members: [...org.members, newMember], updatedAt: timestamp } : org,
        ),
      )
    },
    [],
  )

  // The latest records, so an assignment is checked against what is published right now.

  const findAssignableRecord = React.useCallback((module: EvaluationModule, recordId: string): AssignableRecord | undefined => {
    const latest = assignmentRecordsRef.current
    const pool = { dataset: latest.datasets, 'use-case': latest.useCases, 'ai-model': latest.aiModels, publication: latest.publications, event: latest.events }[module]
    return pool?.find((r) => r.id === recordId)
  }, [])

  const updateOrganisationMemberRole = React.useCallback(
    (organisationId: string, memberId: string, role: OrganisationRole, evaluationScope?: EvaluationScopeItem[]) => {
      authoriseAdmin(organisationId, 'change member roles')
      const updatedAt = formatTimestamp(new Date())
      const current = assignmentRecordsRef.current.organisationWorkspaces.find((o) => o.id === organisationId)
      // An organisation always keeps an Admin: the last one cannot be demoted, whoever created the organisation.
      const target = current?.members.find((m) => m.id === memberId)
      if (current && target && role !== 'admin' && isLastAdmin(current, target)) throw new Error('An organisation must keep at least one Admin.')
      const becomesEvaluator = role === 'evaluator' && target?.role !== 'evaluator'
      if (becomesEvaluator) {
        const problem = current ? checkEvaluationScope(current, evaluationScope, findAssignableRecord) : 'This organisation does not exist.'
        if (problem) throw new Error(problem)
      }
      const created: EvaluationAssignment[] = becomesEvaluator
        ? (evaluationScope ?? []).map((item) => {
            organisationAssignmentIdCounter += 1
            return {
              id: `evaluation-assignment-${organisationAssignmentIdCounter}`,
              evaluatorPersonId: current?.members.find((m) => m.id === memberId)?.personId ?? '',
              module: item.module,
              recordId: item.recordId,
              assignedByPersonId: activePersona().id,
              assignedAt: updatedAt,
              status: 'active' as const,
            }
          })
        : []
      setOrganisationWorkspaces((prev) =>
        prev.map((org) => {
          if (org.id !== organisationId) return org
          const member = org.members.find((m) => m.id === memberId)
          // Someone who is no longer an Evaluator keeps no evaluation assignments: they would otherwise come back if the role changed back.
          const kept =
            member && role !== 'evaluator' ? revokeAssignmentsOf(org.assignments, member.personId, 'role-changed', updatedAt) : org.assignments
          const assignments = created.length > 0 ? [...(kept ?? []), ...created] : kept
          return { ...org, updatedAt, assignments, members: org.members.map((m) => (m.id === memberId ? { ...m, role, updatedAt } : m)) }
        }),
      )
    },
    [findAssignableRecord],
  )

  const removeOrganisationMember = React.useCallback((organisationId: string, memberId: string) => {
    authoriseAdmin(organisationId, 'remove members')
    const updatedAt = formatTimestamp(new Date())
    const present = assignmentRecordsRef.current.organisationWorkspaces.find((o) => o.id === organisationId)
    const leaving = present?.members.find((m) => m.id === memberId)
    // Nobody can leave an organisation without another Admin to carry on, including the person who created it.
    if (present && leaving && isLastAdmin(present, leaving)) throw new Error('An organisation must keep at least one Admin.')
    setOrganisationWorkspaces((prev) =>
      prev.map((org) => {
        if (org.id !== organisationId) return org
        const member = org.members.find((m) => m.id === memberId)
        // Removing a member ends their evaluation access too; the assignments stay as history.
        const assignments = member ? revokeAssignmentsOf(org.assignments, member.personId, 'membership-ended', updatedAt) : org.assignments
        const removedPersonIds = member ? [...new Set([...(org.removedPersonIds ?? []), member.personId])] : org.removedPersonIds
        return { ...org, updatedAt, assignments, removedPersonIds, members: org.members.filter((m) => m.id !== memberId) }
      }),
    )
  }, [])

  const inviteOrganisationMember = React.useCallback(
    (
      organisationId: string,
      invitation: { personId?: string; name: string; email?: string; role: OrganisationRole; via?: 'link'; evaluationScope?: EvaluationScopeItem[] },
    ) => {
      authoriseAdmin(organisationId, 'invite members')
      const timestamp = formatTimestamp(new Date())
      const org = assignmentRecordsRef.current.organisationWorkspaces.find((o) => o.id === organisationId)
      // Someone who is already a member, or who already has a pending invitation, is not invited again.
      const who = { personId: invitation.personId ?? '', email: invitation.email }
      if (org?.members.some((m) => (who.personId && memberMatches(m, who)) || (who.email && m.email?.toLowerCase() === who.email.toLowerCase()))) throw new Error('This person is already a member of the organisation.')
      if (org?.invitations.some((i) => i.status === 'pending' && ((who.personId && i.personId && canonicalPersonId(i.personId) === canonicalPersonId(who.personId)) || (who.email && i.email?.toLowerCase() === who.email.toLowerCase())))) throw new Error('This person already has a pending invitation.')
      // An Evaluator invitation must carry published records to review. Only those kinds of content, and only now-published records, count.
      if (invitation.role === 'evaluator') {
        const problem = org ? checkEvaluationScope(org, invitation.evaluationScope, findAssignableRecord) : 'This organisation does not exist.'
        if (problem) throw new Error(problem)
      }
      organisationInvitationIdCounter += 1
      const newInvitation: OrganisationInvitation = {
        id: `org-invitation-${organisationInvitationIdCounter}`,
        ...invitation,
        evaluationScope: invitation.role === 'evaluator' ? invitation.evaluationScope : undefined,
        invitedByPersonId: activePersona().id,
        status: 'pending',
        invitedAt: timestamp,
      }
      setOrganisationWorkspaces((prev) =>
        prev.map((org) =>
          org.id === organisationId
            ? { ...org, invitations: [...org.invitations, newInvitation], updatedAt: timestamp }
            : org,
        ),
      )
      return newInvitation
    },
    [findAssignableRecord],
  )

  const assignEvaluation = React.useCallback(
    (organisationId: string, input: { evaluatorPersonId: string; module: EvaluationModule; recordId: string }): AssignmentCheck => {
      const latest = assignmentRecordsRef.current
      const org = latest.organisationWorkspaces.find((o) => o.id === organisationId)
      if (!org) return { ok: false, reason: 'record-not-found', message: 'This organisation does not exist.' }
      const pool = { dataset: latest.datasets, 'use-case': latest.useCases, 'ai-model': latest.aiModels, publication: latest.publications, event: latest.events }[input.module]
      const check = checkAssignment(org, input, pool?.find((r) => r.id === input.recordId))
      if (!check.ok) return check
      const timestamp = formatTimestamp(new Date())
      organisationAssignmentIdCounter += 1
      const assignment: EvaluationAssignment = {
        id: `evaluation-assignment-${organisationAssignmentIdCounter}`,
        ...input,
        assignedByPersonId: activePersona().id,
        assignedAt: timestamp,
        status: 'active',
      }
      setOrganisationWorkspaces((prev) =>
        prev.map((o) => (o.id === organisationId ? { ...o, assignments: [...(o.assignments ?? []), assignment], updatedAt: timestamp } : o)),
      )
      return { ok: true }
    },
    [],
  )

  /** Saves one organisation's new state at once, in the latest-state ref as well as the store, so two answers in the same moment (a double
   *  click, a re-render) can never both pass the checks of an invitation that is no longer pending. */
  const commitOrganisation = (next: OrganisationRecord) => {
    assignmentRecordsRef.current.organisationWorkspaces = assignmentRecordsRef.current.organisationWorkspaces.map((o) => (o.id === next.id ? next : o))
    setOrganisationWorkspaces((prev) =>
      prev.map((o) => (o.id === next.id ? { ...o, updatedAt: next.updatedAt, members: next.members, invitations: next.invitations, assignments: next.assignments } : o)),
    )
  }

  const memberMatches = (m: OrganisationMember, person: { personId: string; email?: string }) =>
    canonicalPersonId(m.personId) === canonicalPersonId(person.personId) || Boolean(person.email && m.email && m.email.toLowerCase() === person.email.toLowerCase())

  type InvitationRefusal = 'missing' | 'not-pending' | 'not-invitee' | 'already-member' | 'last-admin'
  type InvitationResult = { ok: true; activated: number; skipped: number } | { ok: false; reason: InvitationRefusal; message: string }

  /** Turns a pending invitation into membership: a new member with the invited role, or, for someone already in the organisation (only when
   *  `allowExisting`), their role changed to it. Evaluator assignments become active here and only here, for records still published. */
  const acceptOrganisationInvitation = (
    organisationId: string,
    invitationId: string,
    person: { personId: string; name: string; email?: string },
    allowExisting = false,
  ): InvitationResult => {
    const org = organisationById(organisationId)
    const invitation = org?.invitations.find((i) => i.id === invitationId)
    if (!org || !invitation) return { ok: false, reason: 'missing', message: 'This invitation does not exist.' }
    if (invitation.status !== 'pending') return { ok: false, reason: 'not-pending', message: `This invitation was already ${invitation.status}.` }
    const existing = org.members.find((m) => memberMatches(m, person))
    if (existing && !allowExisting) return { ok: false, reason: 'already-member', message: 'This person is already a member.' }
    if (existing && existing.role === 'admin' && invitation.role !== 'admin' && isLastAdmin(org, existing)) {
      return { ok: false, reason: 'last-admin', message: 'An organisation must keep at least one Admin.' }
    }
    const timestamp = formatTimestamp(new Date())
    const becomesEvaluator = invitation.role === 'evaluator' && existing?.role !== 'evaluator'
    // Assignments only become active now, and only for records that are still published: one unpublished since the invitation was made
    // is skipped, and publishing it again later does not bring it back.
    const eligible = (becomesEvaluator ? invitation.evaluationScope ?? [] : []).filter((item) => {
      const record = findAssignableRecord(item.module, item.recordId)
      return isEligibleForEvaluation(record) && record?.organisationId === org.id
    })
    const skipped = becomesEvaluator ? (invitation.evaluationScope?.length ?? 0) - eligible.length : 0
    const evaluatorId = existing ? existing.personId : person.personId
    let members: OrganisationMember[]
    if (existing) {
      members = org.members.map((m) => (m.id === existing.id ? { ...m, role: invitation.role, updatedAt: timestamp } : m))
    } else {
      organisationMemberIdCounter += 1
      members = [...org.members, { id: `org-member-${organisationMemberIdCounter}`, personId: person.personId, name: person.name, email: person.email, role: invitation.role, joinedAt: timestamp, updatedAt: timestamp }]
    }
    // Someone moved away from Evaluator keeps no evaluation assignments.
    const kept = existing && existing.role === 'evaluator' && invitation.role !== 'evaluator' ? revokeAssignmentsOf(org.assignments, existing.personId, 'role-changed', timestamp) : org.assignments
    const created: EvaluationAssignment[] = eligible.map((item) => {
      organisationAssignmentIdCounter += 1
      return {
        id: `evaluation-assignment-${organisationAssignmentIdCounter}`,
        evaluatorPersonId: evaluatorId,
        module: item.module,
        recordId: item.recordId,
        assignedByPersonId: invitation.invitedByPersonId ?? activePersona().id,
        assignedAt: timestamp,
        status: 'active',
      }
    })
    commitOrganisation({
      ...org,
      updatedAt: timestamp,
      members,
      assignments: [...(kept ?? []), ...created],
      invitations: org.invitations.map((i) => (i.id === invitationId ? { ...i, status: 'accepted' as const, acceptedAt: timestamp, respondedAt: timestamp } : i)),
    })
    return { ok: true, activated: created.length, skipped }
  }

  /** The invitee's answer to a direct invitation (the "Invite people" flow). Only the invited person can answer, and only while it is pending:
   *  accepting makes them a member (or changes the role they hold) and activates the role; declining leaves membership untouched. A revoked,
   *  declined or accepted invitation can never be answered again. */
  const respondToInvitation = React.useCallback(
    (organisationId: string, invitationId: string, response: 'accepted' | 'declined', person: { personId: string; name: string; email?: string }): InvitationResult => {
      const org = organisationById(organisationId)
      const invitation = org?.invitations.find((i) => i.id === invitationId)
      if (!org || !invitation) return { ok: false, reason: 'missing', message: 'This invitation does not exist.' }
      if (invitation.via === 'link') return { ok: false, reason: 'not-invitee', message: 'This invitation is answered through its link.' }
      if (invitation.status !== 'pending') return { ok: false, reason: 'not-pending', message: `This invitation was already ${invitation.status}.` }
      const invitee = invitation.personId
        ? canonicalPersonId(invitation.personId) === canonicalPersonId(person.personId)
        : Boolean(invitation.email && person.email && invitation.email.toLowerCase() === person.email.toLowerCase())
      if (!invitee) return { ok: false, reason: 'not-invitee', message: 'This invitation was sent to someone else.' }
      if (response === 'accepted') return acceptOrganisationInvitation(organisationId, invitationId, person, true)
      const timestamp = formatTimestamp(new Date())
      commitOrganisation({ ...org, updatedAt: timestamp, invitations: org.invitations.map((i) => (i.id === invitationId ? { ...i, status: 'declined' as const, respondedAt: timestamp } : i)) })
      return { ok: true, activated: 0, skipped: 0 }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const setEvaluatorAssignments = React.useCallback(
    (organisationId: string, evaluatorPersonId: string, scope: EvaluationScopeItem[]): AssignmentActionResult => {
      const org = assignmentRecordsRef.current.organisationWorkspaces.find((o) => o.id === organisationId)
      if (!org) return { ok: false, message: 'This organisation does not exist.' }
      if (currentUserRole(org) !== 'admin') return { ok: false, message: 'Only an organisation Admin can assign content for evaluation.' }
      if (!org.members.some((m) => m.personId === evaluatorPersonId && m.role === 'evaluator')) {
        return { ok: false, message: 'Content can only be assigned to a member with the Evaluator role.' }
      }
      const key = (i: EvaluationScopeItem) => `${i.module}:${i.recordId}`
      const wanted = new Set(scope.map(key))
      const active = new Set((org.assignments ?? []).filter((a) => a.status === 'active' && a.evaluatorPersonId === evaluatorPersonId).map((a) => `${a.module}:${a.recordId}`))
      // Only records that are not assigned yet need to be eligible; one already assigned keeps its place until it is removed or unpublished.
      const added = scope.filter((i) => !active.has(key(i)))
      const problem = added.length > 0 ? checkEvaluationScope(org, added, findAssignableRecord) : null
      if (problem) return { ok: false, message: problem }
      const timestamp = formatTimestamp(new Date())
      const created: EvaluationAssignment[] = added.map((item) => {
        organisationAssignmentIdCounter += 1
        return {
          id: `evaluation-assignment-${organisationAssignmentIdCounter}`,
          evaluatorPersonId,
          module: item.module,
          recordId: item.recordId,
          assignedByPersonId: activePersona().id,
          assignedAt: timestamp,
          status: 'active',
        }
      })
      setOrganisationWorkspaces((prev) =>
        prev.map((o) => {
          if (o.id !== organisationId) return o
          // Only the kinds the drawer manages are reconciled; assignments of any other kind are left as they are.
          const revoked = revokeAssignmentsOf(o.assignments, evaluatorPersonId, 'admin-revoked', timestamp, EVALUATION_PICKER_MODULES, (a) => !wanted.has(key(a)))
          return { ...o, updatedAt: timestamp, assignments: [...(revoked ?? []), ...created] }
        }),
      )
      return { ok: true }
    },
    [findAssignableRecord],
  )

  const revokeEvaluatorAccess = React.useCallback((organisationId: string, evaluatorPersonId: string): AssignmentActionResult => {
    const org = assignmentRecordsRef.current.organisationWorkspaces.find((o) => o.id === organisationId)
    if (!org) return { ok: false, message: 'This organisation does not exist.' }
    if (currentUserRole(org) !== 'admin') return { ok: false, message: 'Only an organisation Admin can revoke evaluation access.' }
    const timestamp = formatTimestamp(new Date())
    setOrganisationWorkspaces((prev) =>
      prev.map((o) => (o.id === organisationId ? { ...o, updatedAt: timestamp, assignments: revokeAssignmentsOf(o.assignments, evaluatorPersonId, 'admin-revoked', timestamp) } : o)),
    )
    return { ok: true }
  }, [])

  const createInviteLink = React.useCallback(
    (organisationId: string, input: { role: OrganisationRole; evaluationScope?: EvaluationScopeItem[] }): OrganisationInviteLink => {
      const org = assignmentRecordsRef.current.organisationWorkspaces.find((o) => o.id === organisationId)
      if (!org) throw new Error('This organisation does not exist.')
      if (currentUserRole(org) !== 'admin') throw new Error('Only an organisation Admin can generate invitation links.')
      if (input.role === 'evaluator') {
        const problem = checkEvaluationScope(org, input.evaluationScope, findAssignableRecord)
        if (problem) throw new Error(problem)
      }
      const link: OrganisationInviteLink = {
        token: generateInviteToken(),
        role: input.role,
        evaluationScope: input.role === 'evaluator' ? input.evaluationScope : undefined,
        createdByPersonId: activePersona().id,
        createdAt: formatTimestamp(new Date()),
        status: 'unclaimed',
      }
      setOrganisationWorkspaces((prev) => prev.map((o) => (o.id === organisationId ? { ...o, inviteLinks: [...(o.inviteLinks ?? []), link] } : o)))
      assignmentRecordsRef.current.organisationWorkspaces = assignmentRecordsRef.current.organisationWorkspaces.map((o) =>
        o.id === organisationId ? { ...o, inviteLinks: [...(o.inviteLinks ?? []), link] } : o,
      )
      return link
    },
    [findAssignableRecord],
  )

  const claimInviteLink = React.useCallback((token: string, claimantKey: string, identity: ClaimIdentity | null): ClaimOutcome => {
    const timestamp = formatTimestamp(new Date())
    // Works from the latest saved state, updated here at once, so two opens in the same moment (a re-render, a double mount) can never both
    // claim the link or make two invitations.
    const { outcome, organisation } = resolveClaim(
      assignmentRecordsRef.current.organisationWorkspaces,
      token,
      claimantKey,
      identity,
      timestamp,
      () => {
        organisationInvitationIdCounter += 1
        return `org-invitation-${organisationInvitationIdCounter}`
      },
    )
    if (organisation && (outcome.status === 'claimed' || outcome.status === 'accepted') && (outcome.firstClaim || outcome.boundNow)) {
      assignmentRecordsRef.current.organisationWorkspaces = assignmentRecordsRef.current.organisationWorkspaces.map((o) => (o.id === organisation.id ? organisation : o))
      setOrganisationWorkspaces((prev) =>
        prev.map((o) => (o.id === organisation.id ? { ...o, updatedAt: organisation.updatedAt, inviteLinks: organisation.inviteLinks, invitations: organisation.invitations } : o)),
      )
    }
    return outcome
  }, [])

  const acceptInviteLink = React.useCallback(
    (token: string, identity: ClaimIdentity) => {
      const found = assignmentRecordsRef.current.organisationWorkspaces
        .map((o) => ({ organisation: o, link: o.inviteLinks?.find((l) => l.token === token) }))
        .find((x) => x.link)
      const link = found?.link
      const invitation = found?.organisation.invitations.find((i) => i.id === link?.invitationId)
      if (!found || !link || !invitation) return { ok: false as const, message: 'This invitation link is not valid.' }
      if (link.status !== 'claimed' || invitation.status !== 'pending') return { ok: false as const, message: 'This invitation can no longer be accepted.' }
      if (link.claimedByKey !== identity.key) return { ok: false as const, message: 'This invitation was claimed by someone else.' }
      return acceptOrganisationInvitation(found.organisation.id, invitation.id, { personId: identity.personId, name: identity.name, email: identity.email })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const revokeOrganisationInvitation = React.useCallback((organisationId: string, invitationId: string) => {
    authoriseAdmin(organisationId, 'revoke invitations')
    const target = assignmentRecordsRef.current.organisationWorkspaces.find((o) => o.id === organisationId)?.invitations.find((i) => i.id === invitationId)
    // Only a pending invitation can be revoked: one that was accepted or declined is history.
    if (!target) throw new Error('This invitation does not exist.')
    if (target.status !== 'pending') throw new Error(`This invitation was already ${target.status}.`)
    const updatedAt = formatTimestamp(new Date())
    setOrganisationWorkspaces((prev) =>
      prev.map((org) =>
        org.id === organisationId
          ? {
              ...org,
              updatedAt,
              invitations: org.invitations.map((i) => (i.id === invitationId ? { ...i, status: 'revoked' } : i)),
              // A revoked invitation closes its link for good: it cannot be claimed or accepted again, and is never reset.
              inviteLinks: org.inviteLinks?.map((l) => (l.invitationId === invitationId ? { ...l, status: 'revoked' as const } : l)),
            }
          : org,
      ),
    )
  }, [])

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      datasets,
      upsertDataset,
      unpublishDataset,
      deleteDataset,
      events,
      upsertEvent,
      unpublishEvent,
      deleteEvent,
      organisations,
      addOrganisation,
      useCases,
      upsertUseCase,
      unpublishUseCase,
      deleteUseCase,
      collaboratives,
      upsertCollaborative,
      unpublishCollaborative,
      deleteCollaborative,
      aiModels,
      upsertAIModel,
      unpublishAIModel,
      deleteAIModel,
      charts,
      upsertChart,
      unpublishChart,
      deleteChart,
      publications,
      upsertPublication,
      unpublishPublication,
      deletePublication,
      profile,
      updateProfile: setProfile,
      organisationWorkspaces,
      createOrganisationWorkspace,
      updateOrganisationWorkspaceMetadata,
      addOrganisationMember,
      updateOrganisationMemberRole,
      removeOrganisationMember,
      inviteOrganisationMember,
      revokeOrganisationInvitation,
      assignEvaluation,
      createInviteLink,
      claimInviteLink,
      acceptInviteLink,
      respondToInvitation,
      setEvaluatorAssignments,
      revokeEvaluatorAccess,
    }),
    [
      datasets,
      upsertDataset,
      unpublishDataset,
      deleteDataset,
      events,
      upsertEvent,
      unpublishEvent,
      deleteEvent,
      organisations,
      addOrganisation,
      useCases,
      upsertUseCase,
      unpublishUseCase,
      deleteUseCase,
      collaboratives,
      upsertCollaborative,
      unpublishCollaborative,
      deleteCollaborative,
      aiModels,
      upsertAIModel,
      unpublishAIModel,
      deleteAIModel,
      charts,
      upsertChart,
      unpublishChart,
      deleteChart,
      publications,
      upsertPublication,
      unpublishPublication,
      deletePublication,
      profile,
      organisationWorkspaces,
      createOrganisationWorkspace,
      updateOrganisationWorkspaceMetadata,
      addOrganisationMember,
      updateOrganisationMemberRole,
      removeOrganisationMember,
      inviteOrganisationMember,
      revokeOrganisationInvitation,
      assignEvaluation,
      createInviteLink,
      claimInviteLink,
      acceptInviteLink,
      respondToInvitation,
      setEvaluatorAssignments,
      revokeEvaluatorAccess,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

function useAppData(): AppDataContextValue {
  const ctx = React.useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}

export { AppDataProvider, useAppData }
