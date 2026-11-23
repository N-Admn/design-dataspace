# Unified identity and membership: migration plan

**Date:** 2026-11-18 (revised the same day with confirmed product decisions). **Branch:** `feat/notification-system` (uncommitted work included).
**Type:** architecture assessment and plan. **No source files, seed data, data stores or browser storage were changed, and the app was not run.**
**Builds on:** [platform-roles-permissions-audit-2026-11-16.md](platform-roles-permissions-audit-2026-11-16.md), [user-persona-model-investigation-2026-11-18.md](user-persona-model-investigation-2026-11-18.md), [docs/notification-system.md](../docs/notification-system.md).

**Revision log:** r1 added decisions CD-1 to CD-11. r2 added the Evaluator decisions CD-12 to CD-19. r4 (same day) records four more confirmed decisions (CD-27 to CD-30) and moves the Evaluator edge cases and the simulation approach into a clearly separate list of **recommendations awaiting product-owner confirmation** (§B, RC-1 to RC-8). r3 (same day) adds the **prototype-scope decisions CD-20 to CD-26**: every person, email and organisation is fictional seed data, and nothing needs real-world verification. r3 and r4 supersede any conflicting text from r1 and r2 (noted where they do). **Convention in the body: "(RC-n)" marks a recommendation, not a decision. Everything tagged only "CD-n" is confirmed.**

**Scope principle (CD-20):** this is a prototype validating product behaviour and the data model. The plan has **no external verification dependency**: no real identity, email, organisation, administrator or membership is checked, and none of the phases may add such work.

**How this document labels things**
- **Confirmed decision** (CD-n): a product requirement given by the product owner on 2026-11-18. Treated as fixed.
- **Verified finding**: read in the current code for this plan.
- **Inferred**: reasoned from code, not stated in it.
- **Proposed**: a technical design offered for review; it is not a product decision.
- **Prototype limitation**: something the single-user, backend-less prototype cannot do faithfully; documented, not solved.
- **Future enhancement**: deliberately out of the current scope; not a permanent limitation.
- **Open**: unresolved; the plan records the uncertainty and what depends on it (§9).

---

## A. Confirmed product decisions (fixed inputs)

| # | Decision |
|---|---|
| **CD-1** | Organisations have **exactly three roles: Admin, Editor, Evaluator.** Viewer and Auditor are not part of the model. |
| **CD-2** | An organisation card is visible in My Organisations to anyone with an **active** membership (Admin, Editor or Evaluator). What they can do after clicking depends on the role. *(Refined by CD-14: an Evaluator with no active assignments sees the card but cannot enter.)* |
| **CD-3** | **Admin:** organisation-level administration; **only Admins** invite members, assign evaluation responsibilities, and manage those assignments. |
| **CD-4** | **Editor:** the defined content-management permissions. Cannot invite members, cannot assign evaluation responsibilities. |
| **CD-5** | **Evaluator:** an assigned reviewer, not an owner, administrator or content manager. Has an active `Evaluator` membership, which grants **no general access** to organisation modules or content. Sees only the modules that have an **active assignment**, and within each only the **assigned records**. The sidebar shows only those modules; the module table lists only assigned records, including when there is exactly one. Cannot reach unassigned modules or records. Cannot manage membership. *(Entry to the workspace is refined by CD-14; permissions inside records by CD-15.)* |
| **CD-6** | **Membership and evaluation assignment are different things.** Membership decides workspace access; assignments decide which modules and records an Evaluator can reach. Membership never implies access to all content. |
| **CD-7** | One canonical person registry and one identity reference. **Merge `john` and `me`.** **Merge `rahul` and `person-2`** if the prototype data confirms they are the same seeded persona (it does; §1.9). **Keep `priya`/`person-3` and `marcus`/`person-6` separate** unless the existing prototype data establishes that they are duplicate records; no real-world identity verification is required or implied. Preserve historical references. *(Refined by CD-21 to CD-23.)* |
| **CD-8** | **`createdById`** is the canonical creator reference into the person registry. `createdBy` stays only as a display / backward-compatibility field. **Creator and owner are different concepts** and are never interchangeable. *(The earlier requirement to verify John's email is replaced by CD-22.)* |
| **CD-9** | **Invitation statuses:** `pending`, `accepted`, `declined`, `revoked`, `expired`. An invitation creates or activates a membership **only when accepted**. |
| **CD-10** | Target model: one person registry, one organisation registry, one membership store (organisation, person, role, status), one current-user reference, a **distinct evaluation-assignment relationship**, and **separate collaborative relationships** (owner, partner, follower, requester, contributor). Following or contributing is never membership or an ownership transfer. |
| **CD-11** | Migration stays **phased and reversible**: decisions, then introduce the model with no behaviour change, then redirect readers and writers, then re-key identity and browser state as a separate controlled phase, then remove obsolete code only after validation. |

| **CD-12** | **Evaluators are not owner-side.** They are not owners, administrators or content managers. Organisation membership, evaluation assignment, and content ownership/management permission stay three distinct things. An Evaluator is never treated as owner-side for ownership, management, publishing or approval checks. *(Supersedes the earlier open item D7 for the Evaluator role.)* |
| **CD-13** | **Assignable modules, initial scope:** Datasets, Use Cases, AI Models, Publications, Events. **Charts and Collaboratives are excluded for now.** This is the initial supported scope, **not a permanent technical limitation**: the design must allow adding a module later without a data migration. |
| **CD-14** | **No assignments, no entry.** An Evaluator with an active membership but no active assignment still sees the organisation card in My Organisations. Clicking it does **not** open the workspace; a **blocking empty state** is shown ("No content has been assigned to you for evaluation yet."). No modules, tables, dashboards or other organisation content are exposed. With **at least one active assignment**, the Evaluator enters the workspace and sees only assigned modules and records. The same rules apply to **direct URLs, search, dashboards and record-level routes**. |
| **CD-15** | **Evaluators are view-only inside assigned records.** They can open and view assigned records and the information needed to review them. They **cannot** edit content or metadata, upload or replace resources, publish or unpublish, delete, change ownership, manage members, invite users, or assign evaluation responsibilities. **No other evaluation actions, scoring, approval outcomes or feedback workflows are defined**; those are future product decisions. |
| **CD-16** | **Evaluator leaves.** When an Evaluator's membership is revoked or otherwise becomes inactive: all their active assignments **for that organisation** are revoked; access to assigned modules and records stops; **historical evaluation and assignment records are preserved** for auditability; the person's identity and historical activity are **not deleted**. |
| **CD-17** | **Assigned content is deleted.** The corresponding active assignment is invalidated; the record is no longer reachable through the Evaluator's workspace, search, dashboard or direct URL; relevant historical assignment information is preserved where appropriate; **no active assignment may point to a deleted record.** |
| **CD-18** | **Invitation and notification flow (prototype).** Start from the **existing** organisation invitation mechanism (the Add Members side sheet and the invitation list); **no new invitation-management interface and no new acceptance workflow** at this stage. An Admin initiates the invitation; it **does not create an active membership by itself**. Acceptance is **reflected through the notification system**: when the invited Evaluator accepts, the Admin receives a **notification card** saying the Evaluator accepted the invitation to evaluate content for the organisation. The card offers the Admin a **revoke evaluation access** action; revocation deactivates the relevant assignment(s) and stops access. The card **informs** the Admin and offers revocation; it **does not itself perform the acceptance**. Revoking evaluation access is distinct from deleting the person or their history. |
| **CD-19** | **Prototype limitation, stated by the product owner:** do not invent a multi-user authentication or acceptance mechanism. The remaining technical consequences are documented in §2.5 and §9.2. |

| **CD-20** | **Prototype scope.** All users are fictional seeded users with dummy email addresses. No external verification dependency is introduced anywhere in the plan. |
| **CD-21** | **Dummy emails everywhere.** Seeded users use dummy email addresses throughout the prototype. |
| **CD-22** | **John Doe:** `john` and `me` merge into one canonical person; the canonical dummy email is **`john.doe@example.com`**. |
| **CD-23** | **Identity pairs:** `rahul`/`person-2` merge if existing prototype data confirms the same seeded persona; `priya`/`person-3` and `marcus`/`person-6` stay separate unless existing prototype data establishes they are duplicate records. |
| **CD-24** | **Organisations are seeded prototype entities:** CivicDataLab, WHO, UN Women and OKF. Their real-world existence, administrators and membership are not verified. |
| **CD-25** | **Seeded dummy users** act as organisation Admins, Editors and Evaluators. |
| **CD-26** | **Invitation, acceptance and revocation are simulated** through prototype state and notifications. No real email delivery, external account or multi-user authentication is required. *(Restates CD-18/CD-19; E2 now only asks which simulation form to use.)* |
| **CD-27** | **Identity pairs are settled.** `john`/`me` and `rahul`/`person-2` are merged. `priya`/`person-3` and `marcus`/`person-6` are **separate identities**, following the existing product decision (CD-7, CD-23). Not to be re-asked unless new contradictory prototype data is discovered. *(Closes the former PM1.)* |
| **CD-28** | **Dummy emails: only John's is fixed** (`john.doe@example.com`). Other seeded users use consistent dummy addresses, **with no mandated naming convention.** *(Replaces the `first.last@example.com` proposal in r3.)* |
| **CD-29** | **Organisation registry entry and organisation workspace are separate concepts.** UN Women and OKF get **organisation registry entries** but **no automatically created workspaces.** *(Resolves the former PM2.)* |
| **CD-30** | **Priya's conflicting seeded affiliations are kept as separate source data.** The migration must not force one affiliation and must not lose either value. The discrepancy is documented (§1.3). *(Resolves the former PM3.)* |

CD-9 still holds: only an accepted invitation creates or activates a membership. CD-18 describes how that acceptance is *surfaced*; how the prototype produces it is a documented limitation (§2.5), not something this plan invents.

Everything not listed above is **not decided**; see §9. In particular: scoring, approval outcomes and feedback for evaluations (CD-15), and the exact module-level treatment of Charts and Collaboratives later (CD-13).

---

## B. Recommendations awaiting product-owner confirmation

These are **not decisions.** They are proposals the plan adopts provisionally so the data model and tests are complete. Each says what it replaces, what the plan assumes if confirmed, and what changes if it is rejected. Until confirmed, the model, flows and tests that rely on them are tagged **(RC-n)**.

| # | Recommendation | Replaces open item | If confirmed | If rejected |
|---|---|---|---|---|
| **RC-1** | **Unpublishing assigned content invalidates the active assignment.** Republishing does **not** reactivate it; the Admin must create a **new** assignment. | E4 | Assignment → `invalidated`, `endedReason:'record-unpublished'`; the old row is kept as history; a new row is created on re-assignment | Add an unpublished-record rule to the selector; tests V18, V21 change |
| **RC-2** | **Admin revocation deactivates evaluation assignments but leaves the organisation membership active.** | E10 | Evaluator keeps the card, hits the blocking empty state (CD-14); membership untouched; to remove them entirely the Admin uses member removal (CD-16) | Revocation also sets the membership `inactive` |
| **RC-3** | **Changing a member's role away from Evaluator revokes their active evaluation assignments.** | E11 | `endedReason:'role-changed'`; applies in that organisation only; a change *to* Evaluator creates no assignments | Assignments would linger for non-Evaluators and need a selector rule |
| **RC-4** | **Evaluators with assignments land on a dedicated "My Assignments" view** (assigned records grouped by module), not the organisation dashboard. | E5 | New route/nav entry visible only to Evaluators; the dashboard stays hidden (CD-14) | Land on the first assigned module |
| **RC-5** | **Seed demo assignments for Sana Khan** so the Evaluator experience is visible. | E8 | A small number of active assignments for `person-5` at CivicDataLab, across supported modules (CD-13). **Which records is not chosen here**; they must be existing seeded CivicDataLab records, picked at implementation and confirmed | Sana stays unassigned and shows the blocking empty state |
| **RC-6** | **Records are assigned only after the invitation is accepted**, never during the invitation. | E9 | Invite sheet is unchanged (CD-18); the assign action exists only for active Evaluator members | Add record selection to the invite sheet (contradicts "reuse the existing mechanism") |
| **RC-7** | **All active Organisation Admins receive the acceptance notification, and any active Admin can revoke access.** | T5 | Recipients = active Admins of that organisation; first revoke wins, the card shows "revoked by <Admin>" for the others; a repeat click changes nothing | Inviting Admin only |
| **RC-8** | **Simulate acceptance with an internal prototype action and/or a seeded event** (details in §2.5). No user-facing acceptance screen, no real email, no multi-user authentication, no persona switching. | E2 | Internal store action + optional seeded fixture, both without UI callers | Another internal mechanism with the same constraints |

Two details the recommendations leave open (technical, not product): whether a **never-published draft** can be assigned (RC-1 only speaks about unpublishing), and whether "revoked by" in RC-7 needs a display name for each Admin.

---

## 0. Summary

- **Today:** one active user (John), but four person registries and two independent membership stores joined by an alias list (`ACTIVE_MEMBER_IDS = ['john','me']`). The two stores agree only because the seeds were hand-aligned.
- **The decisions simplify the role question:** one vocabulary (`admin/editor/evaluator`) already exists in the workspace types; `viewer`/`auditor` exist only as a type in `types/notifications.ts:112` and **no seed uses them**, so removing them is a type-level clean-up, not a data migration (verified).
- **The biggest new requirement is the Evaluator model (CD-5, CD-6, CD-12 to CD-17).** The code has the role (`organisation-permissions.ts` describes it as scoped to AI-model evaluation through Parakh) and two seeded Evaluators, but **no assignment data, no per-record filtering, no workspace-entry gate, no per-module sidebar scoping, and no way for an Admin to assign** (verified by search; `organisationNavGroups(organisationId)` takes no role). This needs a new relationship (§2.3, §2.8), not a re-pointing.
- **The invitation lifecycle is also net-new, but now smaller in UI terms (CD-18):** only `pending | revoked` exist today and no invitation ever becomes a member. The plan reuses the existing invite mechanism and adds the lifecycle states plus **one new notification card** (Evaluator accepted, with a revoke action). The existing notification model has no such event kind (§1.9), so that is new work too.
- **Identity work:** John/`me` and Rahul/`person-2` are merged; Priya/`person-3` and Marcus/`person-6` stay separate identities (CD-27). Priya's two seeded affiliations are both preserved (CD-30). The registry must tolerate the intentionally unmerged same-name records and must not auto-link them. No real-world verification is involved.
- **The risky part is still persisted `localStorage` ids** and legacy ids, isolated in its own phase (§8, Phase 4).
- **Still open:** only technical details (§9). The Evaluator edge cases and the acceptance simulation are now written up as **recommendations awaiting confirmation** (§B), not open questions. No open item depends on real-world verification.

---

## 1. Current architecture (verified)

### 1.1 What changed since the earlier audits
| Earlier finding | Status now |
|---|---|
| Two "current users" (`me` and persona) | **Reduced.** Persona switching and the DEV panel are gone. John is fixed. `me` and `john` still both exist and are joined by `ACTIVE_MEMBER_IDS` (`notification-personas.ts`). |
| Workspace ignores persona | **Moot**, but the workspace and notifications still read different stores. |
| Org membership stored twice and disagreeing | **Aligned for John and Anil only.** Still two stores. Marcus and Rahul still differ (§3). |
| Role vocabularies conflict | **Unchanged.** `OrganisationRole = admin / editor / evaluator`; `OrgRole = admin / editor / viewer / auditor`. |
| Invitations never become members | **Unchanged.** No accept action exists (`grep acceptInvitation` finds nothing). |
| `createdBy` is a display string | **Unchanged.** Now set from the active person's name at creation (`AppDataContext.tsx`). |
| Hard-coded personal owner `'john'` | **Unchanged** (`notification-model.ts:47`, `DEMO_*` tables). |

### 1.2 Sources of person identity
| # | Registry | Ids | Defined in | Read by |
|---|---|---|---|---|
| P1 | **Personas** (`Persona`: id, name, initials, email, blurb, `memberships`) | `john anil rahul priya meera marcus` | `lib/notification-personas.ts` `PERSONAS` | `NotificationsContext`, `notification-model.ts`, `NotificationRow`, `HistorySheet`, `RequestActions`, `RestrictedAccessBar`, `FollowingAccessSections`, `CollaborativeItemsPage`, `CollaborativeDetailPage`, `TopNav`, `ContributorSidebar` |
| P2 | **Extra people** (`Person`, no memberships) | `sasha dev kiran`, plus the literal `system` | same file, `EXTRA_PEOPLE` | History display only (`getPerson`). `system` has no record (falls back to "Someone"). |
| P3 | **Workspace member rows** (`OrganisationMember`: id, personId, name, email, avatar, role, dates) | `me`, `anil`, `person-1/2/4/5/6`, `directory-member-N` | `lib/mock-organisation-workspaces.ts`, persisted in `civicdataspace:organisation-workspaces` | Workspace pages, `OrganisationMembersPage`, community profiles |
| P4 | **Contributor directory** (`MockPerson`: id, name, title, initials, role, organisation) | `person-1` … `person-6` | `lib/mock-people.ts` | Add-members picker, collaborative/event/use-case/publication people pickers, `mock-collaboratives.ts` (`refId`) |
| P5 | **Public people** (`MockPublicPerson`: bio, image, social, organisationIds) | `person-1` … `person-15` | `lib/mock-community.ts` | `community.ts` directory, publisher profiles, breadcrumbs |
| P6 | **Profile** (`ContributorProfile`) | none (the id is `me`) | `types/profile.ts` `MOCK_PROFILE`, persisted in `civicdataspace:profile` | Profile pages, community "me", `dataset-publisher.ts`, `HelpSupportPanel` |
| P7 | **Creator labels** | free text (`'John Doe'`, `'Rahul Mehta'`, `'Sana Khan'`) | mock records (`createdBy`) and new records | Org tables "Created by", `usecase-creator.ts`, `global-search.ts`, publisher resolution |
| P8 | **Active-user constants** | `ACTIVE_PERSON_ID='john'`, `ACTIVE_PERSONA`, `ACTIVE_MEMBER_IDS`, `CURRENT_USER_PERSON_ID='me'`, hard-coded `'john'` | `notification-personas.ts`, `types/organisation-workspace.ts`, `notification-model.ts:47` | everywhere "the current user" is needed |

### 1.3 Duplicate and conflicting people
| Person | Ids in use | Differences |
|---|---|---|
| **John Doe** | `john` (P1), `me` (P3, P6, community) | Persona email `johndoe@gmail.com`; member row and profile `john.doe@civicdatalab.in`. **Resolved by CD-22:** one person, canonical dummy email `john.doe@example.com`. Has a personal workspace, two org seats (CivicDataLab Admin, WHO Editor). |
| **Rahul Mehta** | `rahul` (P1), `person-2` (P3, P4, P5) | Same name and `rahul.mehta@civicdatalab.in`. Persona Editor at CivicDataLab; workspace row Editor. Consistent in role, different id. |
| **Priya Nair** | `priya` (P1), `person-3` (P4, P5) | Persona: no org memberships, email `priya.nair@unwomen.org`, "Outsider who requests access". Directory (`mock-people.ts:20`): Program Manager, UN Women. Public profile (`mock-community.ts:61`): `organisationIds: ['org-workspace-5']`, which is **UNICEF**. **Separate identities (CD-27). The UN Women vs UNICEF discrepancy is preserved as two separate source values (CD-30); neither is overwritten.** |
| **Marcus Bell** | `marcus` (P1), `person-6` (P3 as a *revoked invitation*, P4, P5) | Persona: no memberships, follower. Directory: Independent Journalist, no organisation. Public profile: `organisationIds: []`. Workspace: a **revoked** CivicDataLab Editor invitation (grants nothing, so no live role conflict). **Separate identities (CD-27).** |
| **Anil Rao** | `anil` (P1, P3) | Consistent. Not in P4/P5 (no directory entry). |
| **Meera Joshi** | `meera` (P1) | Admin of `org-external-unwomen`, which is **not a workspace** (§1.4). Not in P3/P4/P5. |
| **Sasha, Dev, Kiran** | `sasha dev kiran` (P2) | History actors only. `kiran` has an `okfn.org` email. Not in any directory. |
| **Sana Khan** | `person-5` (P3, P4, P5) | CivicDataLab Evaluator in workspace data. No persona. Org label in directory is "Open Knowledge Foundation". |
| **Jordan Rivera, Dr. Aisha Verma** | `person-4`, `person-1` | Pending CivicDataLab invitations. No persona. |

**Verified:** the same `person-N` id means the same person in P3, P4 and P5, so those three are already consistent with each other. The split is between the persona set (P1/P2) and the `person-N` set, and between `me` and `john`.

### 1.4 Organisation identity (relevant because membership references it)
| Source | Ids | Used for |
|---|---|---|
| Workspace organisations (`MOCK_ORGANISATION_WORKSPACES`) | `org-workspace-1` (CivicDataLab), `-2` (WHO) … `-11` | Workspace, community directory, content `organisationId` |
| External organisations | `org-external-okf`, `org-external-unwomen` | Exist **only** in `PERSONAS` memberships, `DEMO_RESTRICTED`, `ORG_NAMES`. **No workspace record.** |
| Event organiser directory (`MOCK_ORGANISATIONS`) | `org-1`, `org-2`, `org-3` | Event and collaborative organiser pickers. A third org id space. |
| `ORG_NAMES` | four ids | Name lookup for notification owners (`orgNameOf`) |

### 1.5 Sources of organisation membership
| # | Store | Shape | Authority today |
|---|---|---|---|
| M1 | `PERSONAS[].memberships` | `{kind:'org', orgId, orgName, role: OrgRole}` + `{kind:'personal'}` | **Notifications and collaborative rules**: `hasOrgRole`, `managersOf`, `isOwnerSide`, `orgAdmins`, `canDecide`, `collaborativeRole`, `canEditAsOwner`, `workspacesOf`, `workspaceKeyOf`, context chips (`membershipLabel`, `ownerContextLabel`) |
| M2 | `OrganisationRecord.members[]` | `{id, personId, name, email, avatarUrl, role: OrganisationRole, joinedAt, updatedAt}` | **Workspace**: `currentUserMembership/Role`, `isOrganisationMember`, `currentUserPermissions`, `useOrganisation`, `OrganisationSidebar`, `OrganisationsPage`, members page, `isLastAdmin`, community org profiles |
| M3 | `OrganisationRecord.invitations[]` | `{id, personId?, name, email?, role, status: pending|revoked}` | Invitations tab only. Never converts to M2. |
| M4 | `mock-community.ts` `organisationIds` (public affiliation) and `MOCK_ME_ORGANISATION_IDS=['org-workspace-1']` | list of org ids per person | **Community public profiles only.** A third membership notion ("publicly belongs to"). John's list omits WHO. |
| M5 | `DEMO_COLLABORATIVES[id].partnerOrgIds` + `state.partners` | org ids | Collaborative partnership (a *relationship*, not membership, correctly separate) |

### 1.6 Where membership is read or changed
| Operation | Code |
|---|---|
| **Write M2** | `AppDataContext`: `createOrganisationWorkspace` (founding admin), `addOrganisationMember`, `updateOrganisationMemberRole`, `removeOrganisationMember`; load-time backfill of persona seats (`AppDataContext.tsx` ~l.438). UI: `AddMembersSideSheet`, `EditMemberRoleSideSheet`, `OrganisationMembersPage`, `CreateOrganisationSideSheet`. |
| **Write M3** | `inviteOrganisationMember`, `revokeOrganisationInvitation`. |
| **Write M1** | none at runtime; static table. **Nothing the user does can change a notification-side role.** |
| **Read M2** | `types/organisation-workspace.ts` (`currentUser*`), `organisation-permissions.ts`, `use-organisation.ts`, `OrganisationSidebar`, `OrganisationsPage`, `OrganisationMembersPage`, `AddMembersSideSheet` (existing-member checks), `ProfileViews` (member lists), `CommunityPage`. |
| **Read M1** | `notification-model.ts` (≈10 functions), `NotificationsContext` (owner checks, recipients), `CollaborativeItemsPage` (partner label), `use-owner-edit.ts` (via `canEditAsOwner`). |

### 1.7 How notification permissions and workspace permissions differ today
| | Workspace (M2) | Notifications/collaboratives (M1) |
|---|---|---|
| Person key | `personId` (`me`, `anil`, `person-N`) | persona id |
| Roles | admin / editor / evaluator | admin / editor / viewer / auditor |
| "Can decide / manage" | `canEditOrganisation`, `canAddMembers` … = admin only | `managersOf` = admins of the owning org |
| "Can edit content" | admin or editor (`canEditOrganisationContent`) | `canEditAsOwner` = admin or editor (matches) |
| Owner-side | n/a | **any member of the org**, any role (`isOwnerSide`) |
| Evaluator | exists, no surface | not representable |
| Who counts as a member | whoever is in `members` | whoever is in `PERSONAS` |
| Adding or removing a member | works, **no effect** on notifications | not possible |
| Org identity | workspace ids only | workspace ids **and** external ids |

**Consequence (verified):** removing Anil from CivicDataLab in the Members page leaves him a notification-side Admin; adding Rahul-as-Admin in the workspace does not make him a manager of access requests.

### 1.8 Persisted state that holds identity
| Key | Contains person ids |
|---|---|
| `civicdataspace:notifications:v2` | `requests[].requesterId/actorId`, `events[].recipientIds/actorId`, `collabItems[].addedById`, `follows` (person ids per collaborative), `reads` (keyed by person id), `partners` (org ids) |
| `civicdataspace:organisation-workspaces` | `members[].personId`, `invitations[].personId` |
| `civicdataspace:profile` | profile fields (no id) |
| Record keys (`datasets`, `usecases`, …) | `createdBy` strings, `organisationId` |

---

## 1.9 Findings added in this revision (verified)

### Evaluator and invitations today
| Topic | Finding |
|---|---|
| Role exists | `OrganisationRole = 'admin' \| 'editor' \| 'evaluator'` (`types/organisation-workspace.ts:11`), label "Evaluator". Matches CD-1. |
| Seeded Evaluators | Sana Khan (`org1-member-3`, `person-5`) is a member. Dr. Aisha Verma (`person-1`) is a **pending** invitation as Evaluator. |
| What the code says an Evaluator is | `organisation-permissions.ts` header: "specialised role for AI model evaluation through Parakh… no access to manage the organisation's datasets, use cases, or other content". Documentation text says the same (`documentation/content/contributing.ts:431`). |
| Assignments | **None.** No type, field, seed or action links an Evaluator to a module or a record. |
| Record-level scoping | **None.** Nothing filters a module table by person. |
| Sidebar scoping | **None.** `organisationNavGroups(organisationId)` takes no role. (Whether an Evaluator already sees an empty or restricted workspace was not run; **unverified**.) |
| Who can invite today | `canAddMembers` is Admin-only (matches CD-3). There is no "assign evaluation" permission. |
| Invitation statuses | `OrganisationInvitationStatus = 'pending' \| 'revoked'`. `accepted`, `declined`, `expired` do not exist. |
| Invitation to member | No accept action exists; an invitation never creates a member. |
| Notification event kinds | Notifications have `kind: 'request' | 'update'` and history actions `requested/approved/declined/withdrawn/revoked/granted` (`types/notifications.ts`); item kinds are only `dataset` and `use-case`. **There is no invitation or acceptance event**, so the Admin card in CD-18 needs a new event kind. |
| Workspace pages an Evaluator would reach | The organisation sidebar shows Dashboard, Datasets, Use Cases, Collaboratives, AI Models, Publications, Charts, Events and "Admin & Members" with no role argument (`organisation-nav-config.ts`). Charts and Collaboratives are therefore present in the nav and must be hidden from Evaluators (CD-13). |
| `viewer` / `auditor` | Present only in `OrgRole` (`types/notifications.ts:112`). **No seed or persona uses them** (searched `notification-*.ts`). Safe to drop; keep a read-time guard for stored data (R6). |

### Identity facts needed for CD-7 and CD-8
| Fact | Evidence |
|---|---|
| John's email | Three sources, two values today (`johndoe@gmail.com` persona; `john.doe@civicdatalab.in` profile and member row). **Resolved by CD-22** to `john.doe@example.com`. For context, the mock sign-in uses a separate account (`jane.doe@civicdataspace.org`, `auth-mock.ts`) and `AuthContext` stores no email; email is **not** used as a join key between people anywhere (the only email comparisons are in the mock sign-in and the invite sheet's duplicate-row key). So changing seeded emails does not break any identity link. |
| Rahul and `person-2` match | Name `Rahul Mehta`; email `rahul.mehta@civicdatalab.in` in both the persona and the workspace row; directory "Data Engineer, CivicDataLab"; public profile `organisationIds: ['org-workspace-1']`; Editor at CivicDataLab in both stores; `createdBy: 'Rahul Mehta'` on several records. **No contradicting field. CD-23's condition is met: merge.** (Compare these values before the email normalisation in §6.1, not after.) |
| Priya / `person-3` | **Separate (CD-27).** Same name only; affiliation differs between sources (UN Women vs UNICEF), preserved as-is (CD-30). |
| Marcus / `person-6` | **Separate (CD-27).** Same name; no shared id or alias. |

---

## 2. Target architecture

### 2.1 Principles
1. One `Person` per individual, one id, one source (CD-7, CD-10).
2. One `Organisation` registry, one `Membership` store (organisation, person, role, status).
3. Membership and evaluation assignment are separate relations (CD-6).
4. Every module resolves "who is signed in" through one function.
5. Collaborative relationships stay separate and reference canonical ids (CD-10).
6. Every legacy id keeps resolving during the transition (CD-7, CD-11).

### 2.2 Proposed modules (new files; names are proposals)
```
src/lib/identity/people.ts         // Person[] : the one registry
src/lib/identity/organisations.ts  // Organisation[] : the one registry (entries exist independently of workspaces, CD-29)
src/lib/identity/memberships.ts    // Membership[] and Invitation[] : seed + runtime
src/lib/identity/assignments.ts    // EvaluationAssignment[] : seed + runtime
src/lib/identity/current-user.ts   // CURRENT_USER_ID, useCurrentUser()
src/lib/identity/selectors.ts      // roleOf, membersOf, orgsOf, adminsOf, isActiveMember, activeAssignments, assignedModules, assignedRecords, canEnterWorkspace, canAccessModule, canAccessRecord, isOwnerSide (Evaluator-excluding)
src/lib/identity/legacy-ids.ts     // canonicalId(): the alias map (removed in the last phase)
```

### 2.3 Proposed data model
```ts
interface Person {
  id: string                // canonical
  name: string
  initials: string
  email: string             // dummy address (CD-21); John: john.doe@example.com (CD-22)
  avatarUrl?: string
}

type OrganisationRole = 'admin' | 'editor' | 'evaluator'          // CD-1; the only values

interface Organisation { id: string; name: string; /* seeded prototype entity (CD-24). A registry entry is NOT a workspace (CD-29): the workspace is a separate record keyed by organisationId and may not exist */ }

// A membership is kept, not deleted, when it ends: history is preserved (CD-16).
type MembershipStatus = 'active' | 'inactive'
interface Membership {
  id: string                // keeps existing ids such as org1-member-1
  organisationId: string
  personId: string
  role: OrganisationRole
  status: MembershipStatus  // 'inactive' = removed, left, or access revoked; never grants access
  joinedAt: string
  updatedAt: string
  endedAt?: string          // set when status becomes 'inactive'
  sourceInvitationId?: string   // set when created by an accepted invitation
}

type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired'   // CD-9
interface Invitation {
  id: string
  organisationId: string
  personId?: string         // present when the invitee has a registry record
  email?: string            // for invitees with no record yet
  role: OrganisationRole    // the role granted on acceptance
  status: InvitationStatus
  invitedById: string       // an Admin (CD-3)
  invitedAt: string
  respondedAt?: string
  expiresAt?: string        // see RC-8 / §9.2
}

// CD-13: initial scope. A union, not a hard-coded list, so a module can be added later without migrating data.
type AssignableModule = 'dataset' | 'use-case' | 'ai-model' | 'publication' | 'event'

type AssignmentStatus = 'active' | 'revoked' | 'invalidated'
interface EvaluationAssignment {                                   // CD-5, CD-6
  id: string
  organisationId: string
  evaluatorId: string       // person with an active Evaluator membership in that organisation
  module: AssignableModule  // never 'chart' or 'collaborative' in the initial scope
  recordId: string          // one specific record
  assignedById: string      // an Admin (CD-3)
  assignedAt: string
  status: AssignmentStatus
  endedAt?: string
  endedReason?: 'admin-revoked' | 'membership-ended' | 'record-deleted' | 'record-unpublished' /* RC-1 */ | 'role-changed' /* RC-3 */   // history, never deleted (CD-16, CD-17)
  endedById?: string        // who revoked, when a person did
}
```
Notes on the model:
- **An invitation is not a membership state.** It lives in `Invitation` until accepted (CD-9), so "invited" cannot grant access by construction.
- `Membership.status` replaces the earlier `removed` idea: `inactive` rows are kept for audit (CD-16). This removes the earlier open question about whether removed members keep a row. **Caveat:** today the code *deletes* the member row on removal (`removeOrganisationMember`); keeping it is a behaviour change to that action and to every list that renders members (they must show `active` only).
- **Assignments are never deleted.** Ending an assignment sets `status` and `endedReason`. Selectors treat only `active` as access.
- `AssignableModule` excludes `chart` and `collaborative` by type, which also makes it a compile-time guard for CD-13. The type is the list; widening it later is a one-line change (**not** a permanent limitation).
- A module's access is the set of that Evaluator's **active record assignments** in the module; there is no whole-module grant (CD-5). If product wants one, that is a new decision.
- Display fields on today's `OrganisationMember` (`name`, `email`, `avatarUrl`) are derived from `Person`.
- "Personal" is not a membership; it is the person's own workspace.
- **Registry entry versus workspace (CD-29).** `Organisation` is identity (id, name). The organisation workspace (`OrganisationRecord` metadata, members UI, content) is a separate record that references the organisation id. UN Women and OKF are `Organisation` entries only; CivicDataLab, WHO and the other directory organisations also have workspaces. Membership and ownership rows reference the **organisation id**, so they work with or without a workspace. Nothing creates a workspace as a side effect of adding a registry entry.
- **Affiliations are not in `Person`** (CD-30). Display fields such as the directory `title`/`organisation` and the public `organisationIds` stay in their own tables, keyed by person id. The migration re-keys the key only and **copies, merges or overwrites no affiliation value**, so Priya keeps UN Women (directory) and UNICEF (public profile).

### 2.4 Organisation workspace access rules (from CD-2 to CD-6, CD-12 to CD-17)
`activeAssignments(user, org)` = assignments with `status:'active'`, whose evaluator has an **active Evaluator membership**, and whose record still **exists**. All Evaluator rules below read this one selector.

| Question | Rule |
|---|---|
| Does the organisation card show in My Organisations? | An **active** membership exists, any role (CD-2). |
| May the user enter the workspace? | **Admin / Editor:** yes. **Evaluator:** only if `activeAssignments` is non-empty (CD-14). |
| Evaluator with no active assignment clicks the card | Not admitted. A **blocking empty state** replaces the workspace: "No content has been assigned to you for evaluation yet." No sidebar, no dashboard, no tables, no counts (CD-14). Exact copy beyond this message is UX text, not logic. |
| Which sidebar items does an Evaluator see? | Only modules, among the five assignable ones (CD-13), that have at least one active assignment. **Never** Dashboard, Charts, Collaboratives, or "Admin & Members" (see below). |
| Evaluator "dashboard" | The organisation dashboard exposes organisation-wide content and counts, so it is not shown to Evaluators (CD-14). **(RC-4, recommended):** an Evaluator with assignments lands on a dedicated **My Assignments** view listing their assigned records grouped by module; the sidebar shows only that view and the assigned modules. Without RC-4 the fallback is the first assigned module. |
| Which rows does a module table show? | Admin / Editor: all organisation records (as today). **Evaluator: only records with an active assignment**, even when there is exactly one. |
| Direct URL, deep link, record route, search, "recently opened", dashboards | **Same selector.** An unassigned module or record, a Chart, a Collaborative, or a deleted record is refused. This is a route-level guard, not just hidden links. |
| Who may invite, assign, or revoke assignments? | Admin only (CD-3, CD-4, CD-5). One shared selector, no inline role comparisons. |
| Evaluator and content actions | View-only (CD-15): no edit, upload/replace, publish/unpublish, delete, ownership change, member management, invite, or assignment. |
| Is an Evaluator owner-side? | **No (CD-12).** Evaluators are excluded from `isOwnerSide`, `managersOf`, `orgAdmins`, `canDecide`, `canEditAsOwner` and any publishing or approval rule. |

### 2.5 Invitation, acceptance and notification flow (CD-9, CD-18, CD-19)

**Starting point (verified):** the Add Members side sheet calls `inviteOrganisationMember`, invitations list on the Members page, and `revokeOrganisationInvitation` exists. Nothing accepts an invitation. **This plan adds no new invitation interface and no new acceptance workflow.**

Proposed flow, reusing that mechanism:
1. **Admin invites** through the existing sheet. An `Invitation` (`pending`, role `evaluator`) is created. **No `Membership` is created**, so §2.4 grants nothing.
2. **Acceptance** happens by the invitee. Acceptance is the only event that creates or activates the membership (CD-9): `accepted` creates one `active` Evaluator membership (or reactivates an `inactive` one for the same person and organisation, never a duplicate).
3. **Notification (RC-7, recommended: all active Admins of the organisation receive it; CD-18 confirms an Admin is notified):** accepting emits a notification: a **new event kind** (name proposed: `evaluator-accepted`) shown as a card with text such as "Dr. Aisha Verma accepted your invitation to evaluate content for CivicDataLab" and one action, **Revoke evaluation access**. The card **does not accept anything**; it reports that acceptance occurred (CD-18).
4. **Assignments (RC-6, recommended):** records are assigned **only after the invitation is accepted**, by an Admin, through an assign action available for active Evaluator members. The invite sheet is unchanged and does not select records (CD-18). Until an assignment exists the Evaluator sees the blocking empty state (CD-14).
5. **Revoke from the card (RC-2, RC-7, recommended):** **any active Admin** of the organisation can revoke. It sets the Evaluator's active assignments for that organisation to `revoked` (`endedReason:'admin-revoked'`, `endedById`) and **leaves the membership active** (the Evaluator keeps the card and meets the blocking empty state; full removal is a separate Admin action under CD-16). The person record and history are untouched. After the first revoke, other Admins see the card in a revoked state and a repeat click changes nothing.
6. `declined`, `revoked`, `expired` create no membership; the invitation is kept as history. Dr. Aisha Verma (pending Evaluator) and Marcus Bell's `revoked` Editor invitation (seeded dummy data) convert unchanged (§6.1).

**Prototype limitation (CD-19, CD-26) and simulation proposal (RC-8, recommended):**
- There is one signed-in user (John, an Admin) and no real invitee identity, so **no user can truly "accept"**. The same person cannot be both the inviting Admin and the invited Evaluator.
- The plan therefore does **not** invent multi-user authentication, an acceptance screen, email delivery or persona switching. **RC-8 proposes** two internal mechanisms, neither with a user-facing control:
  1. **An internal store action** (name proposed: `simulateInvitationAccepted(organisationId, invitationId)`), in the same family as the retained, caller-less `addDigest`/`sendDigests`/`reset`/`addPartner` actions. It performs exactly what a real acceptance would: invitation → `accepted`, membership created or reactivated, and the `evaluator-accepted` event emitted to the active Admins. A sibling `simulateInvitationExpired` can exercise `expired`. They are used by tests, fixtures and the browser console only. No button, menu, route or panel may call them, and the Prototype Controls panel does not come back.
  2. **An optional seeded event**: a seed fixture in which an Evaluator invitation is already `accepted` (with its membership and notification) so the Admin card is visible on first load without any action. It must be a **different** invitation from the seeded pending ones (Dr. Aisha Verma stays pending) so seeded states do not contradict each other. Which fictional person it uses is a seed-design detail, not chosen here.
  The action spans two stores (invitations/memberships in `AppDataContext`, events in `NotificationsContext`), so it must be wired through the provider order noted in R15.
- `expired` has no real clock in a prototype. It is produced by `simulateInvitationExpired`, or by a stored `expiresAt` checked on load; the plan does not require both.

### 2.5b Evaluation assignment lifecycle (CD-14 to CD-18)
| Event | Effect on the assignment | Effect on access | History |
|---|---|---|---|
| Admin assigns a record to an active Evaluator | `active` (rejected if the person is not an active Evaluator member, the module is `chart`/`collaborative`, or the record does not exist) | Module and record become visible | `assignedById`, `assignedAt` |
| Admin withdraws an assignment | `revoked`, `endedReason:'admin-revoked'` | That record disappears; module disappears if it was the last in it | kept |
| Admin revokes evaluation access from the notification card (CD-18) | All the Evaluator's active assignments in that organisation → `revoked`, `endedReason:'admin-revoked'`. **Membership stays active (RC-2, recommended)** | No assigned module or record; the card stays but entry is blocked (CD-14) | kept |
| Evaluator's membership becomes inactive (removed, left, or revoked) (CD-16) | All their active assignments **in that organisation** → `revoked`, `endedReason:'membership-ended'`; other organisations unaffected | Access stops immediately | Membership row, assignments, and the person kept |
| Assigned record deleted (CD-17) | That assignment → `invalidated`, `endedReason:'record-deleted'` | Record unreachable by workspace, search, dashboard or URL | Assignment row and the fact of deletion kept; record content is not retained by this plan |
| Assigned record unpublished **(RC-1, recommended)** | → `invalidated`, `endedReason:'record-unpublished'`. **Republishing does not reactivate it**; the Admin creates a new assignment | Record unreachable by the Evaluator while unpublished and after republishing until re-assigned | Old row kept |
| Evaluator's role changed away from Evaluator **(RC-3, recommended)** | All their active assignments in that organisation → `revoked`, `endedReason:'role-changed'` | Assignment-based access ends; the new role's permissions apply | Old rows kept. A change *to* Evaluator creates no assignments |
| Invitation declined / revoked / expired | No assignment can exist yet | None | Invitation kept |

**Invariant (CD-17):** no `active` assignment may reference a missing record or an inactive Evaluator membership. Enforced twice: the write paths (delete record, end membership) update assignments in the same action; the `activeAssignments` selector also ignores any such leftover (defence in depth).

### 2.5c Permission matrix (organisation workspace)
Y = allowed, N = not allowed, A = only for assigned records/modules. Rows reflect confirmed decisions; "as today" means current behaviour is unchanged and not a new decision.

| Capability | Admin | Editor | Evaluator |
|---|---|---|---|
| See the organisation card | Y | Y | Y (active membership) |
| Enter the workspace | Y | Y | **A** (only with ≥1 active assignment; otherwise blocking empty state) |
| Dashboard / organisation overview | Y | Y | N |
| See Datasets, Use Cases, AI Models, Publications, Events | Y | Y (as today) | **A** (assigned modules only) |
| See Charts, Collaboratives | Y | Y (as today) | **N** (excluded, CD-13) |
| View a record | Y | Y | **A** (assigned records only) |
| Edit content or metadata | Y | Y (as today) | N |
| Upload or replace resources | Y | Y (as today) | N |
| Publish / unpublish | Y | Y (as today) | N |
| Delete content | per existing rules | per existing rules | N |
| Change ownership | per existing rules | per existing rules | N |
| See / manage members (Admin & Members) | Y | per existing view rule | N (not in the sidebar or by URL) |
| Invite members | **Y** | N | N |
| Assign / withdraw evaluation | **Y** | N | N |
| Revoke evaluation access (notification card) | **Y** | N | N |
| Treated as owner-side for access-request decisions, publishing, approval | Y (as today) | as today | **N** (CD-12) |
| Evaluation actions beyond viewing (score, approve, comment) | not defined | not defined | **not defined** (future decision) |

"Delete content" and "change ownership" for Admin and Editor are not changed by this plan; the Evaluator column is the only part decided here.

### 2.6 What stays separate (CD-10)
| Relationship | Stays where | References canonical |
|---|---|---|
| Collaborative owner | `DEMO_COLLABORATIVES[id].owner` / record `organisationId` | person or organisation id |
| Collaborative partner | `partnerOrgIds` + `state.partners` | organisation id |
| Follower | `state.follows` | person id |
| Contributor | `state.collabItems.addedById` | person id |
| Requester / access request | `state.requests` | person id |
| Creator of content | `createdById` (new) + `createdBy` (display) | person id |
| Owner of content | existing owner fields (`organisationId`, owner context) | person or organisation id |

Rules: following, contributing or partnering **never** writes a `Membership` and never changes an owner. Conversely, being a member does not make someone a collaborative partner or follower.

### 2.7 Creator versus owner (CD-8)
- `createdById` answers "who made this record". It is set once at creation from `CURRENT_USER_ID`, and never changes when ownership or membership changes.
- Ownership answers "who controls it" (`organisationId` for organisation content; the personal workspace otherwise). It can differ from the creator: John creates a dataset inside CivicDataLab, so creator = John, owner = CivicDataLab.
- `createdBy` (string) is retained as a display and backward-compatibility field. When `createdById` is present, the display name is derived from the registry; when it is absent (legacy records), the string is shown unchanged.
- **Backfill:** a `createdBy` string maps to `createdById` only on an **exact, unambiguous** match to one registry name (for example "Rahul Mehta" → `rahul`, "John Doe" → `john`). Names with no match (for example "Sana Khan" has `person-5` but no persona) resolve by the registry once `person-5` is in it. Ambiguous or unmatched strings stay without an id. No guessing; list them in the Phase 4 report.
- The seven record types carry `createdBy?: string` today (chart, collaborative, AI model, dataset, event, use case, publication). Each gets an optional `createdById?: string` (**Proposed**, optional so old stored records stay valid).

---

## 3. Current versus proposed data structures

| Concern | Now | Proposed |
|---|---|---|
| Person record | `Persona` + `Person` (P1/P2), `OrganisationMember` copy (P3), `MockPerson` (P4), `MockPublicPerson` (P5), `ContributorProfile` (P6) | One `Person`; others keep only extra fields, keyed by canonical id |
| John's id | `john` and `me` | `john` (CD-7), `me` kept as legacy alias |
| Rahul's id | `rahul` and `person-2` | `rahul`, `person-2` kept as legacy alias |
| Priya, Marcus | `priya`/`person-3`, `marcus`/`person-6` | **Four separate Person records**, no alias, by default (CD-23) |
| Organisation membership | `PERSONAS[].memberships` (M1) and `OrganisationRecord.members` (M2) | One `Membership[]`; M1 deleted; M2 becomes a selector |
| Membership end | the member row is **deleted** on removal | `status:'inactive'` + `endedAt`; row kept for audit; assignments revoked (CD-16) |
| Owner-side | `isOwnerSide` = any member of the owning organisation | Admin and Editor only; **Evaluators excluded** (CD-12) |
| Role type | `OrganisationRole` and `OrgRole` (viewer/auditor) | `OrganisationRole` only (CD-1); `OrgRole` removed |
| Invitations | `pending`/`revoked`, never become members | `Invitation` with 5 statuses; accepted creates a `Membership` (CD-9); acceptance surfaces as an Admin notification card (CD-18) |
| Evaluator access | role only; no assignments, no entry gate | `EvaluationAssignment` relation (CD-5, CD-6), `AssignableModule` scope (CD-13), entry gate and view-only rule (CD-14, CD-15) |
| "Who is a member" in notification rules | scan `PERSONAS` | `membersOf`, `roleOf`, active only |
| Org names / identity | `ORG_NAMES`, workspace metadata, `MOCK_ORGANISATIONS` | one registry of seeded prototype entities (CD-24); representation of UN Women / OKF is PM2 |
| Creator | `createdBy: string` | `createdById` canonical, `createdBy` display (CD-8) |
| Current user | `ACTIVE_PERSON_ID`, `ACTIVE_PERSONA`, `ACTIVE_MEMBER_IDS`, `CURRENT_USER_PERSON_ID`, literal `'john'` | `CURRENT_USER_ID` + `useCurrentUser()` |

---

## 4. Migration strategy

### 4.1 Canonical id mapping (applies CD-7, CD-22, CD-23)
| Canonical id | Absorbs | Status | Evidence |
|---|---|---|---|
| `john` | `me` | **Merged (CD-22, CD-27)** | Same person; `ACTIVE_MEMBER_IDS` already pairs them. Canonical dummy email `john.doe@example.com`. |
| `rahul` | `person-2` | **Merged (CD-27)** | Name, email, CivicDataLab Editor role, directory and public profile all agree (§1.9). |
| `priya` | nothing | **Separate (CD-27)** | `person-3` remains its own record. Both seeded affiliations stay where they are (CD-30). |
| `marcus` | nothing | **Separate (CD-27)** | `person-6` remains its own record. |
| `anil`, `meera`, `sasha`, `dev`, `kiran` | none | unique | n/a |
| `person-1`, `-4`, `-5`, `-7`…`-15` | none | no persona counterpart | n/a |

**Id direction (Proposed, not a product decision):** keep the *persona* ids (`john`, `rahul`) canonical, because they sit in persisted notification state and seed history; re-key the `me` and `person-2` side. The alternative (re-key personas) is riskier. This is reversible: the alias map is data.

**Handling duplicate ids:**
1. `legacy-ids.ts` holds `{ me: 'john', 'person-2': 'rahul' }` only. It is deliberately **not** extended to Priya or Marcus.
2. Every read of persisted data and every seed passes through `canonicalId()`; unknown ids pass through unchanged.
3. Where two source records for one person disagree, the registry takes the value fixed by a confirmed decision (John's email: CD-22) or, otherwise, the value from the richer record (Rahul's avatar lives only on the workspace row); no value is invented and nothing is looked up externally. Rahul's avatar moves to `Person.avatarUrl` as-is.
4. A person pair that stays separate must never be collapsed by name matching, including in the `createdBy` backfill (§2.7). A dev-time check flags any two Person records with the same name so the unmerged pairs are visible, not silent.
5. Historical references are preserved: nothing is deleted; legacy ids resolve to the canonical record, and old rows are re-keyed in a reversible step (§6.2).

### 4.2 Approach: introduce, redirect, then re-key, then delete
1. **Introduce** the registry, membership store, invitation and assignment types, and the alias map, fed from existing tables, with no behaviour change.
2. **Redirect** readers and writers one family at a time behind unchanged function signatures.
3. **Re-key** seeds and persisted data in its own controlled step (§6).
4. **Delete** obsolete stores and the compatibility layer only after validation.

### 4.3 Compatibility shims (temporary)
- `canonicalId(id)` on every read of persisted or seeded data.
- Existing helper signatures (`hasOrgRole`, `managersOf`, `isOwnerSide`, `currentUserRole`) keep their signatures; their bodies change.
- `'viewer'` / `'auditor'` found in stored data are mapped by an explicit, logged rule (Open Item E7); none exist in current seeds.

---

## 5. Affected files and modules

### 5.1 New (proposed)
`lib/identity/people.ts`, `organisations.ts`, `memberships.ts`, `assignments.ts`, `current-user.ts`, `selectors.ts`, `legacy-ids.ts`.

### 5.2 Changed
| Group | Files | Change |
|---|---|---|
| **Identity source** | `lib/notification-personas.ts` | People move to `identity/people.ts`; remove `PERSONAS[].memberships`, `ACTIVE_*`; keep `DEMO_*` and label helpers |
| **Types** | `types/notifications.ts` (`Persona`, `Membership`, `OrgRole`, `Person`, `OwnerContext`), `types/organisation-workspace.ts` (`OrganisationMember`, `OrganisationInvitation`, `OrganisationInvitationStatus`, `CURRENT_USER_PERSON_ID`, `currentUser*`) | Remove `OrgRole`; add 5-status invitations, `Membership`, `EvaluationAssignment`; reshape |
| **Notification rules** | `lib/notification-model.ts` | Re-point `hasOrgRole`, `managersOf`, `isOwnerSide`, `orgAdmins`, `workspacesOf`, `workspaceKeyOf`, `ownerFromWorkspace` to selectors (active memberships only) |
| **Notification store** | `context/NotificationsContext.tsx`, `lib/notification-seed.ts` | `CURRENT_USER_ID`; persisted-state upgrade; seed ids via `canonicalId` |
| **Workspace store** | `context/AppDataContext.tsx` | Membership, invitation and assignment actions write the shared store; add accept/decline/expire; remove persona-seat backfill; creation uses `CURRENT_USER_ID` and sets `createdById` |
| **Notifications** | `types/notifications.ts`, `lib/notification-model.ts`, `context/NotificationsContext.tsx`, `NotificationRow`, `lib/notification-seed.ts`, `docs/notification-system.md` | New event kind for "Evaluator accepted" with a Revoke action (CD-18); extend recipients so the inviting Admin(s) receive it; make `isOwnerSide`/`managersOf`/`canEditAsOwner` exclude Evaluators (CD-12) |
| **Permissions** | `lib/organisation-permissions.ts` | Add `canInviteMembers`, `canAssignEvaluations`, `canManageAssignments` (Admin only); add `canEnterWorkspace`, `canAccessModule`/`canAccessRecord` for Evaluators and a view-only guard for every write action (CD-15); keep one place for role checks |
| **Workspace readers** | `hooks/use-organisation.ts`, `components/layout/OrganisationSidebar.tsx`, `components/layout/organisation-nav-config.ts`, `pages/OrganisationsPage.tsx`, `OrganisationMembersPage`, `AddMembersSideSheet`, `EditMemberRoleSideSheet`, `CreateOrganisationSideSheet`, `OrganisationContentTable` | Sidebar takes the role and assignments; Evaluator-scoped tables; invitation UI to the new statuses |
| **Module list views** | `DatasetListView`, `AIModelListView`, `PublicationListView`, `UseCaseListView`, `EventListView`, and the org-level content table | Filter rows by assignment for Evaluators; view-only (no create, edit, publish, delete actions). `CollaborativeListView` and Charts are not assignable and are blocked for Evaluators (CD-13) |
| **Route guards** | `src/App.tsx` (organisation routes), `pages/OrganisationsPage.tsx` (card click) | Guard for unassigned module/record, for Charts/Collaboratives, and for entry without assignments; blocking empty state (CD-14) |
| **Search, dashboard, pickers** | `lib/global-search.ts`, the organisation dashboard page, and any picker listing organisation content | Scope by `activeAssignments` for Evaluators; dashboard not shown (CD-14) |
| **Record deletion paths** | the delete actions in `AppDataContext` for datasets, use cases, AI models, publications, events | Same action invalidates matching assignments (CD-17) |
| **Member removal** | `removeOrganisationMember` and the Members UI | Soft-end the membership and revoke the Evaluator's assignments in the same action (CD-16) |
| **Display of people** | `NotificationRow`, `HistorySheet`, `RequestActions`, `RestrictedAccessBar`, `FollowingAccessSections`, `CollaborativeItemsPage`, `CollaborativeDetailPage`, `TopNav`, `ContributorSidebar` | `getPerson` import moves; otherwise unchanged |
| **Community / profile** | `lib/community.ts`, `lib/mock-community.ts`, `components/community/ProfileViews.tsx`, `BreadcrumbBar.tsx`, `lib/dataset-publisher.ts`, `types/profile.ts` | Re-key `me`→`john`, `person-2`→`rahul`; profile fields keyed by canonical id |
| **Directories** | `lib/mock-people.ts`, `mock-collaboratives.ts` (`person()` helper, e.g. `person('person-2', …)` at l.179) | Re-key `person-2` only |
| **Content types and mocks** | `types/{chart,collaborative,ai-model,dataset,event,usecase,publication}.ts` and `lib/mock-*.ts` | Optional `createdById`; backfill (§2.7) |
| **Seeds** | `lib/mock-organisation-workspaces.ts`, `lib/notification-seed.ts` | Convert to `Membership[]`, `Invitation[]`, `EvaluationAssignment[]` (§6.1) |
| **Docs** | `docs/notification-system.md`, `docs/restricted-access-and-approvals.md`, `pages/documentation/content/contributing.ts` (Evaluator wording), the audit reports | Update after each phase; the Evaluator doc text must change once assignments exist |

### 5.3 Deliberately not changed
Collaborative owner/partner/follower structures; the request/event store shape; consumer-page behaviour; the `DEMO_*` tables (they reference ids); record stores beyond the optional `createdById`.

---

## 6. Seed and persisted-data migration

### 6.1 Seeds
| Seed | Action | Must preserve |
|---|---|---|
| CivicDataLab members | Convert 5 rows to memberships: John admin, Anil admin, Rahul editor (`person-2`→`rahul`), Sana evaluator (`person-5`) | Member ids `org1-member-1…4`, joined dates, avatars (move to `Person`) |
| WHO members | John editor (`org2-member-2`) + the seeded "Directory member" admin | The seeded admin is a **fictional seeded person** (CD-25); it gets a registry record with a dummy email. No real-world administrator is implied or checked (CD-24) |
| UN Women, OKF (CD-29) | Create **organisation registry entries** from `org-external-unwomen` and `org-external-okf` (names from `ORG_NAMES`). **Do not create workspaces.** Meera's UN Women Admin seat becomes a membership against the registry entry | Existing ids, names, `DEMO_RESTRICTED` references |
| Priya affiliations (CD-30) | Migrate the person record only. Leave the directory entry (UN Women) and the public profile (`org-workspace-5`, UNICEF) **as they are** | Both values present after migration |
| Directory orgs 3–11 | Seeded "Directory member" admin each | Unchanged: each becomes a fictional seeded person with a dummy email (CD-25) |
| **Dummy email normalisation (CD-21, CD-22, CD-28)** | Every seeded email in the person registry, member rows, invitations and profile becomes a dummy address. John becomes `john.doe@example.com` (confirmed). **Other users get consistent dummy addresses with no mandated convention (CD-28)**; the only requirements are that each address is a dummy one and that two people do not share an address. Real-looking domains currently appear for Anil, Rahul, Meera, Priya and Kiran, plus `johndoe@gmail.com`; organisation contact emails (`contact@civicdatalab.in`) follow the same rule. **Do this after the identity comparison**, because the Rahul merge evidence uses the current values. | Distinct emails per person; no email is used as a key, so there is no join risk (§1.9) |
| Members removed in the past | None in seeds; no `inactive` rows are created | n/a |
| Invitations (3, CivicDataLab) | Convert to `Invitation`: Jordan Rivera (editor, pending), Dr. Aisha Verma (evaluator, pending), Marcus Bell (editor, **revoked**) | Statuses unchanged; Marcus's `person-6` stays **his own record**, not merged with `marcus` |
| **Evaluation assignments** | **Nothing is seeded by inference.** **(RC-5, recommended)** seed a small set of active assignments for Sana Khan (`person-5`) at CivicDataLab across the supported modules (CD-13), so she lands on My Assignments (RC-4) rather than the blocking empty state. The specific records are not chosen here; they must be existing seeded CivicDataLab records and need confirmation. Dr. Aisha Verma (pending Evaluator) gets none. | Assignments reference existing record ids only |
| Notification seed (`notification-seed.ts`) | Re-key through `canonicalId` (`me`/`person-2` only) | Every request, event, actor, timestamp |
| `PERSONAS` memberships | Generate from the membership store; delete the literal table | John: CivicDataLab Admin, WHO Editor; Anil admin; Rahul editor; Meera UN Women admin (registry entry, no workspace, CD-29) |
| Public people / credits | Re-key `me`→`john`, `person-2`→`rahul`; `MOCK_ME_ORGANISATION_IDS` | Public pages' content |
| `createdBy` strings | Keep. Add `createdById` only by exact unambiguous match (§2.7) | Display |

### 6.2 Persisted browser state (the risk)
A returning browser holds old ids in `civicdataspace:notifications:v2` and `civicdataspace:organisation-workspaces`. Proposed handling:
1. Add a **state version** to both stores, and a **backup key** written before the first upgrade (`…:backup-v<old>`), holding the original JSON.
2. On load with an old version, apply `canonicalId()` to `requests[].requesterId/actorId`, `events[].recipientIds/actorId`, `collabItems[].addedById`, `follows` values, and re-key `reads` map keys; and to `members[].personId`, `invitations[].personId`. Convert `invitations` statuses (unchanged values map 1:1), add an empty `assignments` list and `status:'active'` on every existing member row. **A stored state that has a member row removed earlier cannot be recovered** (it was deleted), so `inactive` history starts from the upgrade onward.
3. If re-keying collides (two ids merging to one, for example both `me` and `john` have `reads`), **merge** the entries, keeping the later read time for each item, rather than dropping either.
4. Write back with the new version only after the upgrade succeeded in memory.
5. Fallback: if parsing or upgrade fails, leave storage untouched and load the seed (the existing `loadState` behaviour), so the user is never left with a half-migrated state.
6. Records without `createdById` stay valid (field optional).

This reuses a pattern already in `AppDataContext` (seed versions and back-fill). Treat the persona-seat backfill (`AppDataContext.tsx` ~l.438) as **temporary** and remove it in Phase 5.

### 6.3 Rollback and recovery
| Phase | Rollback |
|---|---|
| 1, 2 | Revert the commit; nothing persisted changed. |
| 3 | Revert the commit; note that members ended after Phase 3 are `inactive` rows that the old code does not understand (it would show them as members). Prefer rolling forward, or ship the revert together with a filter that hides `inactive` rows; stored data is still readable because no ids changed yet. New stored fields (`assignments`, new invitation statuses) must be **ignored, not rejected**, by the old code, so the old build can still load the new data; verify this in Phase 3 testing. |
| 4 | The backup key restores the pre-upgrade JSON; shipping the old reader plus a "restore from backup" step undoes the re-key. Keep `legacy-ids.ts` and the backup for at least one release after Phase 4. |
| 5 | Irreversible by design; only run after the Phase 4 validation window and the final grep gate. |
Because the prototype has no backend, "recovery" for a user is also "clear the `civicdataspace:*` keys and reload", which restores the seed; document this in the release note.

---

## 7. Dependencies and migration risks

| # | Risk | Where | Mitigation |
|---|---|---|---|
| R1 | Re-keying breaks seeded request history or read state | notification store | Versioned upgrade; backup key; snapshot test of the seed before and after |
| R2 | Unread counts change if `reads` keys are lost or collide | bell, page | Merge on collision; test with a stored v2 state |
| R3 | Members-page edits now change notification permissions (intended, but new) | Members page → decisions | Document; one shared last-admin guard |
| R4 | Owner-side rule ("any member") differs from the workspace's role rules; once Evaluators are members, **`isOwnerSide` would wrongly include them** | `isOwnerSide`, `managersOf`, `canEditAsOwner`, `use-owner-edit` | CD-12: exclude Evaluators explicitly and add a test; leave the rule unchanged for Admin and Editor |
| R5 | UN Women and OKF are registry entries without workspaces (CD-29); code that assumes "organisation = workspace" (card list, member lookups, `workspacesOf`) must tolerate an organisation with no workspace | Meera, partner checks, `DEMO_RESTRICTED`, My Organisations | Keep registry and workspace lookups separate; John has no seat in a workspace-less organisation, so no signed-in behaviour changes; test lookups with Meera's seat |
| R6 | Removing `OrgRole` (`viewer`/`auditor`) ripples to types and any stored value | `types/notifications.ts`, labels | Seeds contain none; map unknown stored values with a logged rule (E7) |
| R7 | **Evaluator is net-new behaviour with no precedent in the code**: assignment data, entry gate, guards, sidebar scoping, table filtering and view-only enforcement arrive together | org workspace | Own sub-phase (3b); everything behind the selectors; Admin/Editor paths untouched |
| R8 | **Leaky scoping:** hiding links is not access control. Direct URLs, deep links, search, "recently opened", dashboards, counts and public-page links into the workspace may reveal unassigned records, Charts or Collaboratives to an Evaluator | routes, search, dashboards | Route guards use the same `activeAssignments` selector as the sidebar; one test per entry point (T2) |
| R9 | An assignment outliving its record, or its Evaluator's membership | delete and removal paths | CD-16/CD-17: both write paths update assignments in the same action, **and** the selector ignores leftovers (defence in depth) |
| R10 | Count mismatches: module counts, "Created by", dashboard totals show organisation-wide numbers to an Evaluator | tables, dashboards | Scope counts with the same selector |
| R11 | Changing `john`/`me` breaks the community "me" page and `/publishers/me` | community, breadcrumb | Keep `me` as a route alias during transition |
| R12 | Seeded emails are normalised to dummy addresses, and the same person currently has different emails in different stores | profile, nav, Members table, invite sheet | CD-21, CD-22, CD-28; do the Rahul comparison before normalising; no code keys on email (§1.9) |
| R13 | Accidentally merging Priya/`person-3` or Marcus/`person-6` through name matching in a script or the `createdBy` backfill | registry, backfill | Explicit alias map only; duplicate-name dev check; the pairs are separate by decision (CD-27) |
| R14 | Invitation lifecycle without a real recipient: acceptance has no second user in a single-user prototype (CD-19) | invitation and notification flow | Documented limitation; mechanism is Open Item E2; no accept UI, no multi-user auth |
| R15 | Provider order: shared stores used by both `AppDataContext` and `NotificationsContext` | `main.tsx`, `App.tsx` | Put the store in `AppDataContext` (outer) or a new outer provider |
| R16 | Hidden readers of `PERSONAS` or `ACTIVE_*` outside the grep set | whole `src` | Final grep gate (§10.1) |
| R18 | Soft-ending a membership changes `removeOrganisationMember` (today it deletes) and every member list, count and picker must filter `active` | Members page, community profiles, org cards, `isLastAdmin` | Central `activeMembers` selector; test all member lists |
| R19 | Notification event is new: seed/stored state, unread counts, tabs and the bell must handle an event kind that has an action | `types/notifications.ts`, bell, page, `reads` | Add to the model with a versioned stored state; unknown kinds in old builds are ignored |
| R20 | The Revoke action is performed from a notification card: it must be idempotent and safe if the assignments were already ended by another path | notification card | Revocation re-reads current assignment state; repeated clicks make no further change |
| R21 | View-only is a UI claim unless the store actions also refuse an Evaluator's edit, publish, upload and delete | module pages, `AppDataContext` actions | Enforce in the action layer as well as the UI (T6) |
| R22 | Extending `AssignableModule` later (Charts, Collaboratives) must not require a data migration | `AssignableModule` | Union type plus string stored values; only the type, nav and selectors change |
| R23 | Priya's two affiliations could be lost or flattened when the person record is re-keyed or merged into the registry | registry, directory, community | CD-30: affiliations stay in their own tables; the migration test asserts both values before and after |
| R24 | **RC-1 vs unreleased content:** if Evaluators are meant to review content before it is published, "unpublish invalidates" and "view assigned content" may interact; it is not stated whether a never-published draft can be assigned | assignment rules | Technical question U1 (§9.2); the model supports either |
| R17 | `expired` needs a time source and a rule; a client-only check can drift | invitations | RC-8 |

**Dependencies:** Phase 3b builds the Evaluator rules **as recommended (RC-1 to RC-8)**; if the owner rejects one, only the rows tagged with that RC change (§B). The notification card is visible only once the RC-8 simulation exists. RC-4 and RC-5 affect what is shown, not the rules. Phase 4 depends on the email normalisation. Phase 2 depends on CD-29 only for how the registry and workspaces are modelled. **No phase depends on external verification of people, emails or organisations (CD-20).**

---

## 8. Recommended phases (CD-11)

| Phase | Work | Behaviour change | Exit check |
|---|---|---|---|
| **1. Finalise decisions and contracts** | Confirm or reject the recommendations in §B (RC-1 to RC-8); write the data contracts in §2.3 as agreed types; dump `notification-seed.ts` as a fixture | none | Written answers; fixture committed |
| **2. Introduce (no behaviour change)** | Add `identity/*` modules and `legacy-ids.ts`; feed from existing tables; `getPerson`/`ACTIVE_*` read through them; dev-time assertion that M1 and M2 agree; add the `Invitation` and `EvaluationAssignment` types and empty stores, unused | none | `tsc`, build, identical UI |
| **3a. Redirect readers and writers** | Workspace readers and notification rules → selectors; delete `PERSONAS[].memberships`; membership writes go to the shared store; invitation statuses extended; accept action creates a membership | **Intended**: workspace edits now affect notification rules; accepting an invitation creates a member | Test matrix §10.3 (Admin, Editor, invitations) |
| **3b. Evaluator scoping and notification card** | Assignment actions (Admin only); `AssignableModule` scope; entry gate and blocking empty state; sidebar, tables, route guards, search and counts scoped for Evaluators; view-only enforcement; auto-revoke on membership end and on record delete; new "Evaluator accepted" notification event with Revoke action (reuses the existing invite mechanism) | **Intended**: Evaluators see only assigned modules/records, are blocked without assignments, are view-only, and the Admin gets the acceptance card | Test matrix §10.4 (Evaluator) and §10.4b |
| **4. Re-key and browser-state migration (separately controlled, reversible)** | Canonical ids in seeds, `canonicalId` on stored data with backup key, `createdById` backfill, community/directory re-key (`me`→`john`, `person-2`→`rahul`) | none visible if done right | Stored-state upgrade tests; rollback rehearsal |
| **5. Clean up** | Remove aliases, backfill, `CURRENT_USER_PERSON_ID`, duplicate stores; update docs and audits | none | Final grep gate |

Phases 2 is low-risk and reversible; 3a is the first behaviour change; 3b is the largest new surface; 4 is the riskiest and isolated; 5 is irreversible and last.

---

## 9. Remaining questions and open decisions

### 9.1 Open items
No item depends on real-world verification of a person, email or organisation (CD-20). **There are no open product-identity questions**: PM1, PM2 and PM3 are resolved (CD-27, CD-29, CD-30). The Evaluator edge cases (former E4, E5, E8, E9, E10, E11, T5) and the acceptance simulation (former E2) are no longer open questions; they are **recommendations awaiting confirmation** in §B.

| # | Item | Why it matters | Blocks |
|---|---|---|---|
| **E7** | Mapping of any legacy `viewer`/`auditor` found in stored data. None exist in seeds, so this only matters for a browser holding such a value; a logged drop-or-map rule is enough | Safety for old browsers | Phase 4 |
| D6 | Personal-workspace ownership (records have no owner id; `'john'` is hard-coded) | The "one id" goal is incomplete without it | Later |
| F1 | **Future product decisions** (recorded, not blocking): evaluation actions, scoring, approval outcomes, feedback workflow, and extending assignment to Charts and Collaboratives | CD-13 and CD-15 | None |

### 9.2 Technical questions and prototype limitations
The single-user, no-backend, no-email prototype has these inherent limits; none is solved or worked around by adding real services (CD-26).
| # | Item | Implication |
|---|---|---|
| **E2** | **Simulating acceptance** is covered by recommendation **RC-8** (§2.5, §B). What remains technical: the action spans `AppDataContext` and `NotificationsContext`, so it needs the provider order in R15; and whether `expired` is produced by an action, a stored `expiresAt`, or both. | Wiring only |
| T1 | Whether an Evaluator currently sees an empty, restricted or full workspace (not run) | Sizes how much of 3b adds a gate vs. removes existing exposure |
| T2 | Whether every entry point that lists organisation content (global search, recently opened, dashboards, pickers, public pages that link into the workspace) honours organisation scope today | Affects R8 effort |
| T3 | The exact request-to-person mapping in `notification-seed.ts` | Dump as a fixture first (Phase 1) |
| T4 | Creation-flow role checks for AI models, publications, events, charts and collaboratives | Unchanged from the 2026-11-16 audit §10.5; needed for Editor tests |
| T5 | Recipients of the new notification event: covered by **RC-7** (all active Admins; any can revoke). What remains technical: showing "revoked by <Admin>" to the others needs a display name per Admin, which the registry provides | Wiring only |
| U1 | Whether a **never-published draft** can be assigned to an Evaluator. RC-1 speaks only about unpublishing; CD-13 lists the modules but not the publication state of the content | Rules for the selector; test V18 | 
| T6 | Where per-record edit/publish/delete controls are rendered, so view-only can be enforced in the UI **and** in the store actions | Defence in depth; not yet inventoried |

### 9.3 Resolved by confirmed decisions (removed from the open list)
| Earlier item | Resolution |
|---|---|
| D1 role vocabulary | **CD-1:** `admin/editor/evaluator` |
| D7 Evaluator as owner-side | **CD-12:** No. (Whether Admin/Editor keep "any member of the owning organisation" in `isOwnerSide` is unchanged and unaffected by this decision.) |
| D4 creator identity | **CD-8** direction |
| E1 John's canonical email | **CD-22:** `john.doe@example.com`; all seeded emails become dummy addresses (CD-21). No verification required |
| D2 external organisations and placeholder admins | **CD-24, CD-25:** seeded prototype entities and seeded dummy users; no verification. Only the **representation** question remains (PM2) |
| PM1 Priya / Marcus separate | **CD-27:** separate identities, following CD-7/CD-23. Not to be re-asked unless contradictory prototype data is found |
| PM2 UN Women and OKF representation | **CD-29:** organisation registry entries; no automatic workspaces; registry entry and workspace are separate concepts |
| PM3 Priya's two affiliations | **CD-30:** both preserved as separate source data; none forced |
| `first.last@example.com` proposal | **Withdrawn by CD-28:** only John's email is fixed; no mandated convention |
| D3 Priya / Marcus verification | **CD-23:** keep separate by default unless the data shows duplicates; real-world verification is not required. A residual mapping question remains (PM1, PM3) |
| D5 invitation lifecycle | **CD-9** statuses; surfacing via notification **CD-18**; prototype limitation **CD-19** (E2) |
| D3 for John and Rahul | **CD-7, CD-22, CD-23** |
| E3 assignable modules | **CD-13:** Datasets, Use Cases, AI Models, Publications, Events (initial scope) |
| E5 (empty-state) | **CD-14:** blocking empty state. The landing after entry is **RC-4** (recommended) |
| E6 in-record Evaluator capability | **CD-15:** view-only; further actions are future decisions (F1) |
| E4 (removed Evaluator) | **CD-16:** assignments revoked, history kept |
| E4 (deleted record) | **CD-17:** assignment invalidated. Unpublished records are **RC-1** (recommended) |

I did not resolve any open item on the owner's behalf. Recommendations are listed only in §B and tagged **(RC-n)** in the text; they are not decisions.

### 9.4 Contradiction review against earlier text
- r1 said an Evaluator "can open its workspace" with an empty state (E5). **Superseded by CD-14:** no entry; blocking empty state. Fixed in §A, §2.4 and §10.
- r1 left Evaluator-as-owner-side open (D7). **Closed by CD-12.**
- r1 left the assignable modules open (E3). **Closed by CD-13.**
- r1's `removed` membership status is replaced by `inactive` (history kept, CD-16).
- CD-1 and CD-18 are consistent: invitations as `evaluator` use the one role vocabulary.
- r2 listed "John's canonical email", "external organisation and placeholder-admin verification" and "Priya/Marcus verification" as open and blocking. **Superseded by CD-20 to CD-25:** they are no longer verification items; the residue is PM1 to PM3.
- r1/r2 described Marcus's persona and workspace data as a role conflict. On re-reading, the only workspace record is a **revoked** invitation, which grants nothing, so there is no live role conflict. Corrected in §1.3.
- r1/r2 said Priya's directory entry and persona differ by email. The directory has no email field, so that was not established; the real discrepancy is the UN Women / UNICEF affiliation (PM3). Corrected in §1.3.
- r3 proposed `first.last@example.com` for other seeded emails and kept PM1, PM2 and PM3 open. **Superseded by CD-28 to CD-30.** The convention is withdrawn; PM1 to PM3 are closed.
- r3 listed E4, E5, E8, E9, E10, E11, E2 and T5 as open questions. They are now recommendations (RC-1 to RC-8) awaiting confirmation, with the plan stating what each assumes.
- CD-3 (only Admins assign/invite/manage) is applied to the notification card's revoke action too; the plan treats "revoke evaluation access" as an Admin-only assignment-management action. The decision text does not state this explicitly for the card, so it is recorded as an **inference** (T5).

---

## 10. Validation and testing plan

### 10.1 Static
- `tsc --noEmit -p tsconfig.app.json` and `npm run build` after every phase.
- **Grep gates** at the end of Phase 5, each must return nothing: `PERSONAS`, `memberships` (old shape), `OrgRole`, `'viewer'`, `'auditor'`, `ACTIVE_PERSON_ID`, `ACTIVE_MEMBER_IDS`, `CURRENT_USER_PERSON_ID`, `'me'` (as a person id), `person-2` outside the alias map, `readActivePersonaId`.
- Dev-time checks: every `personId`, `createdById`, `invitedById`, `assignedById` and `evaluatorId` resolves to a `Person`; every membership's `organisationId` resolves to an organisation; every assignment's `evaluatorId` has an **active Evaluator** membership in that organisation; **no `active` assignment points to a missing record, a `chart` or `collaborative`, or an inactive membership**; **no two Person records share a name unless on the known unmerged list** (Priya, Marcus).

### 10.2 Unit level
- Selectors against the seed: John → CivicDataLab Admin, WHO Editor; Anil admin; Rahul editor; Sana evaluator.
- `canonicalId`: `me`→`john`, `person-2`→`rahul`; `person-3`, `person-6`, `priya`, `marcus` unchanged.
- Stored-state upgrade: feed a saved v2 notification state and workspace list; assert request, event, read and member counts and roles unchanged; assert the backup key exists; assert collision merge for `reads`.
- Invitation state machine: only `pending` transitions; terminal states never create or change a membership; `accepted` creates exactly one membership.

### 10.3 Behaviour matrix: Admin, Editor, invitations (manual, browser)
| # | Scenario | Expected |
|---|---|---|
| A1 | Admin opens the organisation | Sees all modules and all records; Members page with invite, change role, remove |
| A2 | Admin invites a person through the existing Add Members sheet | An `Invitation` (`pending`) is created; **no membership**; not in the Members list, not counted for notification rules; no new invitation UI |
| A3 | Invitee accepts (simulated per RC-8) | Invitation becomes `accepted`; exactly one active membership with the invited role; the Admin receives the notification card (see N1) |
| A4 | Invitee declines / Admin revokes / invitation expires | Status updates; **no membership** is created; history kept |
| A5 | Re-invite someone previously removed and accepted | Reactivates, no duplicate row |
| A6 | Admin assigns evaluation responsibilities | Allowed; creates assignments for an active Evaluator only; assigning to an Editor or non-member is rejected |
| A7 | Admin manages (withdraws, changes) assignments | Allowed; Evaluator's visible modules/records update |
| A8 | Last Admin guard | Cannot remove or demote the last Admin |
| ED1 | Editor opens the organisation | Sees content modules per the existing Editor rules; **no** invite, member-management or assignment controls |
| ED2 | Editor attempts to invite someone or assign an Evaluator (UI and direct call) | Controls absent; the action is rejected by the permission selector if called directly |
| ED3 | Editor edits content | Allowed per current rules (unchanged) |
| X1 | John at WHO (Editor) vs CivicDataLab (Admin) | Role shown and permissions differ correctly per organisation |
| X2 | Notifications context chips and workspace row | "CivicDataLab · Admin", "World Health Organization · Editor" |
| X3 | Cross-store: change Anil's role in Members | Notification manager/recipient set changes accordingly |
| X4 | Collaborative relationships | Follow/contribute/partner never create a membership or change an owner |

### 10.4 Behaviour matrix: Evaluator (CD-5, CD-12 to CD-18)
The ten scenarios requested are marked **[R1]** to **[R10]**.

| # | Scenario | Expected |
|---|---|---|
| V1 **[R1]** | Evaluator with active membership and **no assignments** clicks the organisation card | Card is visible in My Organisations; click does **not** enter the workspace; blocking empty state "No content has been assigned to you for evaluation yet."; no sidebar, dashboard, tables or counts |
| V2 **[R2]** | Evaluator with **one assigned record** (for example one AI Model) | Enters the workspace; sidebar shows only AI Models; the table lists exactly that record; opening any other record by URL is refused |
| V3 **[R3]** | Assignments across **multiple supported modules** (for example a Dataset and an Event) | Sidebar shows exactly those two modules, each listing only its assigned records; other supported modules are absent |
| V4 **[R4]** | Evaluator opens **Charts** or **Collaboratives** by direct URL (list and record routes), even if the organisation has such content | Refused (not-found or redirect); never listed in the sidebar; not reachable via search or dashboard |
| V5 **[R5]** | Evaluator tries to **edit, publish, unpublish, delete** assigned content, upload/replace a resource, or change ownership (UI and via direct action) | Controls absent; the store action refuses; content unchanged |
| V6 **[R6]** | Evaluator's **membership becomes inactive** (removed or left) | All their active assignments in that organisation → `revoked` (`membership-ended`); assigned modules and records are inaccessible; assignment and membership rows kept; the person record untouched; assignments in other organisations unaffected |
| V7 **[R7]** | **Assigned content is deleted** | The assignment → `invalidated` (`record-deleted`); the record is gone from the Evaluator's table, search, dashboard and direct URL; if it was their last assignment, the next entry hits the blocking empty state (V1); the assignment row is kept as history |
| V8 **[R8]** | An Evaluator accepts an invitation (simulated per RC-8) | The active Admins (RC-7) receive a notification card: the Evaluator accepted the invitation to evaluate content for the organisation. The card is informational; it did not perform the acceptance |
| V9 **[R9]** | Admin clicks **Revoke evaluation access** on that card | The Evaluator's active assignment(s) for that organisation → `revoked` (`admin-revoked`, `endedById`); access ends; the person, history and **membership** are kept **(RC-2)**; repeat clicks change nothing |
| V10 **[R10]** | A revoked Evaluator tries to open a previously assigned record (URL, search, dashboard, back button) | Refused; never shown; the organisation card remains and opens the blocking empty state **(RC-2)** |
| V11 | Evaluator tries to invite, assign, withdraw assignments, or manage members (UI and direct call) | Controls absent; rejected by the permission selector |
| V12 | Evaluator is **not owner-side** (CD-12) | Does not receive or decide access requests for the organisation's datasets; not a manager of collaboratives; not allowed to publish or approve |
| V13 | Search, global search, dashboards, "recently opened", counts, pickers | No unassigned title, count or thumbnail leaks (R8, R10) |
| V14 | Admin withdraws the Evaluator's only assignment while signed in | After the next load or navigation the module is gone; a stale tab cannot open the record |
| V15 | Same person is Evaluator in one organisation and Editor in another | Scope applies per organisation only |
| V16 | Pending Evaluator invitation (Dr. Aisha Verma) | No workspace access and no assignments possible until accepted |
| V17 | Admin tries to assign a Chart or Collaborative, or assign to a non-Evaluator | Rejected by type (CD-13) and by the active-Evaluator-membership rule |
| V18 **(RC-1)** | Assigned record is **unpublished** | The assignment → `invalidated` (`record-unpublished`); the record is unreachable for the Evaluator; the row is kept |
| V19 **(RC-3)** | Evaluator is changed to Editor or Admin in that organisation | Their active assignments → `revoked` (`role-changed`); Evaluator-only scoping stops applying; assignments in other organisations are unaffected. Changing a member **to** Evaluator creates no assignments |
| V20 **(RC-1)** | The unpublished record is **republished** | The old assignment stays `invalidated`; the Evaluator still cannot see it until an Admin creates a **new** assignment |
| V21 **(RC-4)** | Evaluator with assignments enters the organisation | Lands on **My Assignments** (records grouped by module); no dashboard; the sidebar shows only that view and the assigned modules |
| V22 **(RC-5)** | First load of the seed | Sana Khan sees her seeded assignments, not the blocking empty state; Dr. Aisha Verma (pending) has none |
| V23 **(RC-6)** | Admin tries to assign a record to someone who is only invited | Not possible: the assign action requires an active Evaluator membership |
| V24 **(RC-2)** | After Admin revocation, the Evaluator's membership | Still active and listed in Members; the card still shows; entry is blocked until a new assignment exists |

### 10.4b Notification-flow tests (CD-18)
| # | Scenario | Expected |
|---|---|---|
| N1 | After simulated acceptance, the Admin opens the bell and the Notifications page | One new card with the specified wording, correct organisation and Evaluator name; unread count increments; appears for the Admin only (T5 defines other Admins) |
| N2 | The card is the only place the accept result is shown | No accept button, no invitation-management UI added |
| N3 | Revoke from the card, then reload | State persisted; the card shows its post-revocation state; assignments stay `revoked`; no double revoke |
| N4 | Revoke when the assignments were already ended elsewhere | No error; no change |
| N5 | Persisted state upgrade | Existing requests, events and read state keep their values; unknown event kinds are ignored by old builds |
| N6 **(RC-7)** | Organisation with two active Admins; an Evaluator accepts | Both receive the card |
| N7 **(RC-7)** | One Admin revokes; the other opens the same card | The second sees "revoked" with the first Admin's name; no further effect from a second click |
| N8 **(RC-8)** | Simulated acceptance via the internal action, and via the seeded accepted fixture | Same end state as a real acceptance (accepted invitation, active membership, notification); **no UI control, route or panel can trigger the action**; no network call, email or second account; no persona switching |

### 10.5 Identity and migration tests
| # | Scenario | Expected |
|---|---|---|
| I1 | Load a browser with a stored v2 notification state containing `me`/`person-2` | Requests, events, read counts unchanged; ids canonical; backup key present |
| I2 | Load with a stored workspace list containing `person-2` | Rahul still Editor at CivicDataLab; one record, not two |
| I3 | `/publishers/me` and Rahul's profile route | Still resolve (alias) |
| I4 | Priya / Marcus (default separate) | Remain two separate records each; no merge; Marcus's revoked invitation unchanged; the duplicate-name dev check lists exactly these two pairs |
| I5 | `createdBy` strings | Unchanged display; `createdById` set only for exact matches; unmatched listed |
| I6 | Corrupt stored JSON | Seed loads, storage untouched, no crash |
| I7 | Rollback rehearsal | Restoring the backup key and old build restores the pre-upgrade state |
| I8 | Run the upgrade twice | Idempotent |
| I9 | Dummy emails (CD-21, CD-22) | John's persona, profile and Members row all show `john.doe@example.com`; no seeded email uses a real-world domain; every person still has a distinct email; nothing keyed on email changes behaviour |
| I10 | Seeded organisations (CD-24, CD-29) | CivicDataLab, WHO, UN Women and OKF resolve in the organisation registry; **UN Women and OKF have no workspace and none is created**; lookups that need a workspace handle that absence; nothing reaches outside the prototype |
| I11 | Simulated invitation flow (CD-26) | The whole flow works with no network call, email or second account |
| I12 | Priya's affiliations (CD-30) | After the migration the directory still says UN Women and the public profile still says `org-workspace-5` (UNICEF); neither value changed or lost; `priya` and `person-3` are still two records |

### 10.6 What I could not verify
- No app run; every statement is from reading code.
- Whether an Evaluator already sees a restricted workspace today (T1) and whether other entry points scope by organisation (T2).
- The full `notification-seed.ts` request-to-person mapping (T3).
- Role checks in the creation flows for the remaining modules (T4).
