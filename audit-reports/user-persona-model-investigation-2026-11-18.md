# User and persona model: investigation

**Date:** 2026-11-18. **Branch:** `feat/notification-system` (uncommitted work included).
**Type:** read-only investigation. No source files were changed and the app was not run. Follows [platform-roles-permissions-audit-2026-11-16.md](platform-roles-permissions-audit-2026-11-16.md) (findings C1, C2).

**Evidence labels:** **Confirmed** = stated in a code comment or doc, or directly visible in code. **Inferred** = the best reading of the evidence, not stated anywhere. **Not found** = looked for and absent.

---

## 0. Short answer

- The six personas are **deliberate** and were added with the notification system. Their purpose is stated in code comments and docs: a DEV switcher that lets one prototype play several people, so that one request "reads the same way for every persona" (Confirmed: `docs/notification-system.md:72`).
- The fixed workspace user `'me'` predates them and is an **acknowledged prototype shortcut** (Confirmed: `organisation-workspace.ts:43` says "there is no real auth/session in this prototype").
- The two systems were **not designed to be linked**. Nothing in the code or docs says how `'me'` relates to the persona `john`. They are connected only by convention (both mean "John Doe", both are Admin of `org-workspace-1`).
- Switching persona does **not** sign anyone in or out. It changes one string held in `sessionStorage`. The organisation and personal workspaces ignore it.
- So the gap is real, but it is a gap between two intentional pieces, not a bug in either. Nothing in the evidence says the personas should be removed.

---

## 1. Identity inventory

| # | Identity | Id | Defined in | Kind | Used for |
|---|---|---|---|---|---|
| 1 | Signed-in flag | none (boolean) | `AuthContext.tsx`, `localStorage['civicdataspace:session']` | Fallback / stub | "Is anyone signed in". Gates provider routes and sign-in prompts. Carries **no identity**. |
| 2 | Workspace user | `'me'` (`CURRENT_USER_PERSON_ID`) | `types/organisation-workspace.ts:113` | Mock, fixed | Organisation workspace membership and permissions (`currentUserMembership`, `useOrganisation`), community "own profile" (`community.ts:272,286`), breadcrumb own-profile check (`BreadcrumbBar.tsx:323`), the member row created when you create an organisation (`AppDataContext.tsx:855`). Seeded as John Doe, Admin of CivicDataLab only (`mock-organisation-workspaces.ts:143`). |
| 3 | Notification personas | `john anil rahul priya meera marcus` | `lib/notification-personas.ts` `PERSONAS` | Test personas (switchable) | Everything in the notification and collaborative layer: recipient, requester, approver, follower, owner, partner, restricted access, owner Edit, My Contributions, dashboard cards. Also top-nav email and sidebar name. |
| 4 | Extra people | `sasha dev kiran` | `notification-personas.ts` `EXTRA_PEOPLE` | Seed-history actors | Appear in seeded history. Cannot be switched to. `sasha` and `dev` are used by the DEV simulator as extra requesters. |
| 5 | Contributor directory | `person-1` … `person-6` | `lib/mock-people.ts` | Mock directory | Stand-in people for organisation member lists and the community directory. Includes **namesakes** of personas: Rahul Mehta (`person-2`), Priya Nair (`person-3`), Marcus Bell (`person-6`). |
| 6 | Seeded organisation members | `directory-member-N` and `person-N` | `mock-organisation-workspaces.ts` | Mock | Member tables. CivicDataLab members: `me`, `person-2`, `person-5`, `person-4`, `person-1`, `person-6`. |
| 7 | Personal profile | none | `types/profile.ts` | Mock | John Doe's profile page content (name, links). |
| 8 | `createdBy` strings | free text | mock records | Display | "John Doe" on seeded org records. A label, not a reference. |
| 9 | Hard-coded personal owner | `'john'` | `notification-model.ts:47`, `notification-personas.ts` (`DEMO_RESTRICTED`, `DEMO_COLLABORATIVES`) | Fallback | The owner of every record with no `organisationId`. |

Persona 3 is the only one the user can switch. `signedInEmail` in the top nav and the workspace name in the sidebar already follow the persona (`TopNav.tsx:74,898`, `ContributorSidebar.tsx:114`), so the persona already acts as "the current person" in the chrome, while the org workspace does not.

---

## 2. Why the personas exist

### Evidence that states the purpose
- `notification-personas.ts` header: *"The people the prototype can sign in as (DEV persona switcher). John is deliberately multi-hat: he has a personal workspace, administers CivicDataLab and edits at a second organisation, so one inbox mixes three contexts."* (Confirmed)
- `DevPrototypeControls.tsx` header: *"DEV only. Switches who the prototype is signed in as and pushes simulated events through the same store the real actions use, so the badge, panel, page and dataset page all react the way they would for real."* (Confirmed)
- `docs/notification-system.md:3`: *"Prototype only: no APIs, auth, email delivery or queues … every action must update the toast, bell, panel, page and every persona consistently."* (Confirmed)
- `docs/notification-system.md:64-72`: the switcher is DEV-only (`import.meta.env.DEV`), and *"Seed data is authored as requests, so the same request reads the same way for every persona."* (Confirmed)
- `NotificationsContext.tsx:37`: the active persona lives in **sessionStorage "so two tabs can be two people"** while the data lives in `localStorage` and syncs across tabs. (Confirmed. This is the strongest sign the design is a multi-actor simulator.)
- Commit `217c461` (2026-11-03): *"DEV-only persona switcher and event simulator."* Both persona and simulator arrived in the same commit as the notification store. (Confirmed)
- `App.tsx:351`: `{import.meta.env.DEV && <DevPrototypeControls />}`. Not rendered in a production build. (Confirmed)

### What each persona's blurb says it tests
Each persona carries a one-line `blurb`, and the doc repeats them. They match the roles a request lifecycle needs:

| Persona | Stated purpose (Confirmed: blurb) |
|---|---|
| John | Multi-hat: personal workspace, Admin at CivicDataLab, Editor at WHO. One inbox, three contexts. |
| Anil | Second admin, so "another admin decides" and the first-decision-wins rule can be tested. |
| Rahul | Editor who "cannot decide access". |
| Priya | "Outsider who requests access". |
| Meera | Admin at UN Women, "a partner on a collaborative". |
| Marcus | "Follower of collaboratives". |

### Does switching simulate sign-in?
**No** (Confirmed in code). `setPersonaId` writes the id to `sessionStorage` and sets React state (`NotificationsContext.tsx:410-416`). It does not touch `AuthContext`, `localStorage['…session']`, the organisation workspace, or any route. There is no sign-out, no re-auth and no reload. Docs call it a switch of "who the prototype is signed in as", but it is only the notification actor.

### Do personas test the recipient/requester/approver/follower/partner flows?
Yes (Confirmed). The simulator (`DevPrototypeControls.tsx`) takes an actor id for each action: `requestAccess(who, …)`, `decide(actor, …)`, `revoke`, `grant`, `submitItem`, `addItem`, `addPartner`, `sendDigests`, `addDigest`. Because every store action takes an explicit actor id, one browser can play requester and approver.

### What the docs do **not** say
- Nothing says the workspace user `'me'` should follow the persona, or that it should not. (**Not found**)
- Nothing says personas are meant to be a long-term identity layer. The doc says "Prototype only".
- Nothing explains why `john` and `'me'` both exist. The most likely reading is that the workspace work came first and used a fixed user, and the notification work later added its own identity rather than changing the workspace one. This is **Inferred**; I found no document or commit message stating it.

---

## 3. Persona relationship matrix

Memberships are from `PERSONAS`. "In workspace data?" is whether the person is a member of that organisation in `mock-organisation-workspaces.ts` **under the same id**.

| Persona | Personal account | Org memberships (notification model) | Roles | Collaborative relationships | In workspace data? | Main scenarios tested |
|---|---|---|---|---|---|---|
| **John Doe** (`john`) | Yes; owns every no-org record, `ds-9`, `collaborative-4` | CivicDataLab; World Health Organization | Admin; Editor | Owner of `collaborative-1` (via CivicDataLab) and `collaborative-4` (personal) | Workspace user is `'me'`, Admin of CivicDataLab only. **Not** a member of WHO there. | Multi-context inbox; approver for his own and CivicDataLab items; owner Edit; Manage items |
| **Anil Rao** (`anil`) | Yes | CivicDataLab | Admin | Owner side of `collaborative-1` | **No** (not in any member list) | Second admin decides; first decision wins; actor not notified |
| **Rahul Mehta** (`rahul`) | Yes | CivicDataLab | Editor | Owner side of `collaborative-1` (adds directly) | Namesake `person-2`, Editor. Different id | Editor can edit and add but not decide; sees "waiting for" |
| **Priya Nair** (`priya`) | Yes | none | none | none | Namesake `person-3` is a mock person, not a member | Outsider requests restricted access; submits to a collaborative; withdraw |
| **Meera Joshi** (`meera`) | Yes | UN Women (`org-external-unwomen`) | Admin | Partner on `collaborative-1` (once published) | **No** (UN Women is not a workspace) | Partner adds items directly; partner removes own items |
| **Marcus Bell** (`marcus`) | Yes | none | none | Follower | Namesake `person-6`, **Editor at CivicDataLab**. Different id, and a different role from the persona | Follow and unfollow; daily digest; Updates tab |
| `sasha`, `dev`, `kiran` | n/a | n/a | n/a | n/a | n/a | History actors and DEV extra requesters only |

### Coverage of the combinations you listed

| Combination | Covered by | Note |
|---|---|---|
| Organisation Admin | John, Anil, Meera | Three, with overlap |
| Organisation Editor | Rahul, John (at WHO) | |
| Organisation Evaluator | **nobody** | **Gap.** `OrgRole` in the notification model has no evaluator. The workspace has one (`Sana Khan`, `Dr. Aisha Verma`) but no persona maps to it |
| Individual content owner | John | Only John; every personal record is his |
| Organisation content owner | John, Anil, Rahul | |
| Collaborative Owner | John, Anil, Rahul | |
| Collaborative Partner | Meera | Only Meera, one collaborative, one partner org |
| Collaborative Follower | Marcus; any persona can follow | |
| Contributor | any signed-in persona | |
| Requester | Priya, Marcus (and `sasha`, `dev` simulated) | |
| Approver | John, Anil | |
| Restricted dataset requester | Priya, Marcus | |

**Overlaps:** Admin is tested three ways; owner-side roles are mostly the same code path. **Gaps:** Evaluator/Viewer/Auditor; a non-admin partner member (the partner check accepts admin or editor but only Meera, an admin, exists); an organisation member with no rights to a given item; a person with a personal item who is not John.

---

## 4. Where each area gets "who is the user"

| Area | Source | Evidence |
|---|---|---|
| Sign-in / current-user context | Boolean only; **no identity** | `AuthContext.tsx` |
| Top-nav email, sidebar workspace name | **Persona** | `TopNav.tsx:74,898`; `ContributorSidebar.tsx:114` (John falls back to a default identity with a photo) |
| Organisation workspace pages, role and permission checks | **`'me'`** | `use-organisation.ts` → `currentUserPermissions` → `currentUserMembership` |
| Personal workspace lists | **Neither.** Lists every record regardless of owner (audit C3) | `DatasetsPage`, `UseCasesPage` |
| Organisation membership and role in notification rules | **Persona**, from `PERSONAS[].memberships` | `notification-model.ts` `hasOrgRole` |
| Content ownership | **Hard-coded `'john'`** for no-org records; `organisationId` otherwise; demo tables for specific ids | `ownerFromWorkspace`, `DEMO_RESTRICTED`, `DEMO_COLLABORATIVES` |
| Public Edit actions | **Persona** → `canEditAsOwner` | `use-owner-edit.ts` |
| Collaborative owner / partner checks | **Persona** → `collaborativeRole` | `notification-model.ts:76-89` |
| Follow / unfollow | **Persona** | `CollaborativeDetailPage.tsx:30,89` |
| Contribution submissions | **Persona** as requester | `submitItem`, `ItemPickerDrawer` |
| Approve / decline | **Persona** as actor; `canDecide` uses persona memberships | `RequestActions.tsx` |
| Restricted dataset requests | **Persona** | `hasAccess(persona.id, …)` in `DatasetDetailPage.tsx:80` |
| Notification recipients | **Persona** (derived per recipient) | `deriveItems(state, persona, …)` |
| Notification history and read state | **Persona**; reads keyed by persona id | `NotificationsContext.tsx:399-402` |
| My Contributions | **Persona** | `MyContributionsPage.tsx` |
| Dashboard contribution and access cards | **Persona** | `FollowingAccessSections.tsx` |
| Org "Created by" label | Free-text name | mock `createdBy` |

So the **notification/collaborative layer is internally consistent** (one actor, the persona). The **organisation workspace is internally consistent** too (one actor, `'me'`). The inconsistency is only at their boundary.

### Concrete effects of the boundary (Confirmed from code, not run)
1. As **Anil**, the org workspace still shows "John Doe, Admin" (it reads `'me'`). Anil is not in that member list at all.
2. As **Priya** (no memberships), `/organisations/org-workspace-1/...` still opens with full Admin rights, because the workspace never consults the persona.
3. As **John**, the persona says he is also an Editor at WHO. The workspace data says `'me'` is not a member of WHO.
4. Every record without an organisation belongs to `john`, so as any other persona the personal workspace lists records that are not theirs.
5. The persona's name for a member row (Rahul, Marcus) and the workspace row with the same name use different ids; Marcus is a CivicDataLab **Editor** in the workspace data but has **no membership** as a persona.

---

## 5. Answers to the questions

| # | Question | Answer | Basis |
|---|---|---|---|
| 1 | Are multiple personas intentionally a dev simulation of several platform users? | **Yes.** | Confirmed: file header, DEV controls header, doc §Prototype controls, per-tab sessionStorage, DEV-gated mount |
| 2 | Is the fixed workspace user a temporary shortcut? | **Yes, by its own comment.** | Confirmed: "there is no real auth/session in this prototype" (`organisation-workspace.ts:43`), seed comment "Prototype-only seed data" |
| 3 | Different contexts, or accidental duplicates? | **Neither fully.** They were built for different features at different times; no document says they are meant to differ. The *roles* in each are partly different by accident (Evaluator vs Viewer/Auditor). | Inferred. Not stated anywhere |
| 4 | Does the notification system depend on persona switching to test its workflows? | **Yes.** Every workflow needs at least two actors (requester and approver, submitter and owner, partner and owner). The simulator partly substitutes for switching by acting as another person, but approving, withdrawing, partner adds and My Contributions are tested by switching. | Confirmed in code (explicit actor ids, per-persona reads) |
| 5 | Would removing or consolidating personas break important scenarios? | **Removing:** yes, every multi-actor scenario. **Consolidating onto one current user:** it would remove the ability to see the same request from both sides without the simulator, and would remove the only means of checking restricted-access and partner behaviour as an outsider. | Inferred from dependency map |
| 6 | What is worth preserving? | The persona switcher; actor-explicit store actions; per-persona read state; the DEV-only gate; seed-as-requests; the multi-hat John; the owner-side/partner/outsider spread; `sessionStorage` per tab. | Judgement |
| 7 | What is a genuine inconsistency? | The seven items in §6 below. | See §6 |

---

## 6. Intentional behaviour versus real inconsistency

### Intentional prototype behaviour (do not treat as bugs)
- Six switchable personas with hand-written memberships.
- Switching changes the notification actor, not a session.
- DEV-only controls and simulator.
- Personas' memberships living in a TypeScript table rather than in organisation data.
- Seed data authored as requests so every persona sees the same events.
- No backend; all rules client-side.

### Genuine inconsistencies
| # | Inconsistency | Why it matters |
|---|---|---|
| I1 | Workspace role/permissions read `'me'`; collaborative/notification roles read the persona. The two never meet. | Switching persona can show a person who is not an admin with admin controls in the workspace (and vice versa). |
| I2 | `john` and `'me'` are two ids for one person with no link. | A change to one will not reach the other. |
| I3 | Org membership is stored twice: `PERSONAS[].memberships` and `OrganisationRecord.members`. They disagree (Anil, Meera, John at WHO; Marcus as Editor). | Two sources of truth for "who is a member". |
| I4 | Two role vocabularies: workspace `admin/editor/evaluator`; notification `admin/editor/viewer/auditor`. | Evaluator has no persona, and Viewer/Auditor have no workspace screen. |
| I5 | Personal ownership is hard-coded to `john` (`ownerFromWorkspace`). | Only John can ever be an individual owner; other personas' personal workspaces cannot own anything. |
| I6 | Namesakes in `mock-people.ts` carry different ids and sometimes different roles. | Rahul/Marcus look like the same person in two views but are not. |
| I7 | Personal workspace lists all records (audit C3). | With personas this becomes visible as "someone else's items in my workspace". |

I1, I2, I3 and I5 are one root cause: **there is no single record of "a person and what they belong to"**. I4, I6 and I7 are consequences or neighbours of it.

---

## 7. Options

All three keep the DEV switcher; they differ in how much of the model becomes shared.

### Option A: keep personas, connect both systems to one current-user id
- **Change:** `AuthContext` (or the notifications context) exposes one `currentPersonId`. The workspace's `currentUserMembership` looks up the active persona instead of `'me'`. The `'me'` id is replaced with `john`, or mapped to it in one place. Personal ownership is read from the active persona instead of hard-coded `john`.
- **Preserved:** all personas, simulator, notification rules, seeds, DEV gate.
- **Scenarios affected:** the organisation workspace would start to react to the switcher. As Priya it would show no organisation; as Anil it would require adding Anil to the member list or reading memberships from the persona table. Org member tables would still need reconciling with persona memberships.
- **Complexity:** low to medium. A handful of lookups change; no new data model.
- **Risks:** leaves two membership tables (I3) and two role vocabularies (I4) in place unless also reconciled; a mapping layer could harden into permanent duplication.

### Option B: simplify to one current user and the minimum personas
- **Change:** drop the workspace/persona split by choosing one current user; keep only the personas the notification flows need (likely John, Anil/Rahul, Priya, Meera).
- **Preserved:** the lifecycle flows with fewer actors; fewer places to keep in sync.
- **Scenarios affected:** loses the follower-only (Marcus) and second-admin or editor-only checks unless folded into the kept personas. Loses Rahul's "editor cannot decide" unless Rahul stays.
- **Complexity:** low to medium, but mostly removal and re-seeding.
- **Risks:** shrinks test coverage that the notification spec explicitly lists (`docs/notification-system.md:68`); contradicts the documented persona set, so the docs would need rewriting. The least reversible option.

### Option C: unified mock authentication model (every persona a complete mock user)
- **Change:** one `MockUser` record per person (id, name, email, personal workspace, memberships with roles, collaborative relationships). The workspace, notifications, community directory and `mock-people` all read it. One role vocabulary. Records carry an owner id. Switching actually sets the current user for every module.
- **Preserved:** everything user-visible, including personas, plus makes the workspace respond to them. It is also the closest to a real backend's shape.
- **Scenarios affected:** all of them gain consistency, but many seeds need reworking (member lists, `createdBy`, `DEMO_*` tables, `mock-people` namesakes, `ownerFromWorkspace`).
- **Complexity:** high. It touches data, types and most permission checks, and would overlap the open findings on roles and ownership.
- **Risks:** large change in a prototype with uncommitted work in flight; the biggest chance of regressions in the flows that currently work; scope could creep into the unresolved product questions (e.g. what "contribution" means, who sees drafts).

### Comparison

| | A | B | C |
|---|---|---|---|
| Keeps multi-actor testing | Yes | Reduced | Yes |
| Fixes I1, I2 | Yes | Yes | Yes |
| Fixes I3, I4, I6 | No | Partly | Yes |
| Fixes I5, I7 | Partly (I5) | No | Yes |
| Size | Small-medium | Small-medium | Large |
| Reversibility | High | Low | Medium |

---

## 8. Recommended next step

**Option A, done first, and designed as the first step of C.** Reasons from the evidence:
1. The personas are intentional and the notification flows depend on them (§5, Q4), so B removes working coverage for little gain.
2. The most visible problem (I1, I2) is a missing link, not a modelling error. A fixes it with the smallest change and keeps everything that works.
3. C is the right end state if the prototype is meant to look like a real multi-user product, but it is large and overlaps several unresolved product questions from the 2026-11-16 audit (what a contribution is, who owns drafts, role vocabulary). Starting it before those are decided risks doing the work twice.

Two decisions are needed from you before any change, because the code cannot answer them:
1. **Which id wins?** Should the workspace identity become the persona `john`, or should the persona table point at `'me'`? (Affects every seed that says `'me'`.)
2. **Should switching persona also switch the workspace?** In particular, should an outsider such as Priya see no organisation workspace and an empty "My Organisations"? This decides how much of A is "link the id" and how much is "reconcile memberships".

## 9. Not verified

- The app was not run; every finding is from reading code and docs.
- Whether any page outside the files searched reads `'me'` or `PERSONAS` indirectly (searched `src` for `CURRENT_USER_PERSON_ID`, `'me'`, `useNotifications`, `PERSONAS`; the design-system pages were excluded from the `'me'` search).
- The community profile pages (`community.ts`) were only checked for their use of `CURRENT_USER_PERSON_ID`, not for how a switched persona would look there.
- No design brief or ticket for the persona work was found; git history for these files has two commits (`217c461`, `e48dce5`) and both describe the personas only as a "DEV-only persona switcher".
