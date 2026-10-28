# Email notifications

Situations in the app where a user should get an email. Tick the **Done** box (`[ ]` → `[x]`) as each one is specified or built.

**Artifact** means any piece of content a contributor creates: dataset, use case, publication, AI model, chart, event or collaborative. Where this doc says "dataset", read "any artifact" unless it says otherwise.

**Priority:** **Required** means the flow breaks, or something changes without the person knowing. **Recommended** means it's expected, but the flow works without it. **Optional** is nice to have and best put behind a notification setting.

**Flags:**

* **PARKED**: the feature it depends on isn't on the platform yet. Specify the email, but don't build it.
* **DEPENDS ON EXTERNAL CONTRIBUTORS**: only applies once people or organisations from *outside* the owning organisation can be added to a collaborative (external individuals or external organisations). Until then, a collaborative's members are just the owning organisation's members.

**Rule for every email below:** never email the person who performed the action. For example, the person who links a dataset doesn't get the "your dataset was linked" email.

---

## Core set (build first)

The minimum set of emails. Everything else is under "Later".

### A. Account and sign-in

|Done|Situation|Who gets it|Priority|Flag|Where in app|
|-|-|-|-|-|-|
|[ ]|Account created: verify your email|New user|Required|—|`/auth/register` → "Account verified" on sign-in|
|[ ]|Forgot password: reset link|User|Required|—|`/auth/forgot-password` ("Send Reset Link")|
|[ ]|Account deleted (confirmation)|User|Required|**PARKED**: account deletion isn't enabled yet|Profile → Delete account dialog|

### B. Your artifact was changed by someone else

|Done|Situation|Who gets it|Priority|Flag|Notes|
|-|-|-|-|-|-|
|[ ]|Someone else in the organisation edited an artifact you created for the organisation|Artifact creator|Required|—|Any artifact type. Name who edited it and what.|

### C. Collaboratives

|Done|Situation|Who gets it|Priority|Flag|Notes|
|-|-|-|-|-|-|
|[ ]|Collaborative published|*To confirm* (see open questions)|Recommended|—|Publishing a collaborative sends an email. Publishing other artifacts doesn't.|
|[ ]|Collaborative edited|*To confirm* (see open questions)|Recommended|—|—|
|[ ]|You joined, or were added to, a collaborative|The person or organisation admins who joined|Required|**DEPENDS ON EXTERNAL CONTRIBUTORS**|Covers external individuals and external organisations|
|[ ]|New artifact added to a collaborative you're part of|Every member of the collaborative|Recommended|**DEPENDS ON EXTERNAL CONTRIBUTORS**|Sent after joining, for any artifact type, not just datasets|

### D. Your artifact was linked to something

|Done|Situation|Who gets it|Priority|Flag|Notes|
|-|-|-|-|-|-|
|[ ]|Your artifact was linked to a collaborative|Artifact owner|Required|—|Any artifact type (dataset, use case, publication, AI model …)|
|[ ]|Your artifact was linked to a use case|Artifact owner|Required|—|Use case step 2, "Where this dataset is used"|

### Not sending

* **Every artifact published.** No email each time a dataset (or other non-collaborative artifact) is published.

---

## Later

Specified but not in the core set.

### 1. Account and sign-in

|Done|Situation|Who gets it|Priority|Where in app|
|-|-|-|-|-|
|[ ]|Password changed|User|Required (security)|Profile → Change password|
|[ ]|Email address changed: confirm the new one, alert the old one (PARKED)|User|Required (if email can be edited)|Profile edit form|
|[ ]|Welcome / getting started (links to the Documentation pages) (Low priority)|New user|Optional|After first sign-in|

### 2. Organisation workspace and members

|Done|Situation|Who gets it|Priority|Where in app|
|-|-|-|-|-|
|[ ]|Invited to join an organisation (with role)|Invitee|Required|Members → Add members side sheet / invite link|
|[ ]|Invitation revoked|Invitee|Recommended|Members → Revoke invitation|
|[ ]|Invitation accepted|Org admins|Recommended|—|
|[ ]|Role changed (Admin / Editor / Evaluator)|Member|Required|Edit member role side sheet|
|[ ]|Removed from organisation|Member|Required|Members → Remove member|
|[ ]|Someone asked to join your organisation|Org admins|Required|Community profile "Request" button|
|[ ]|Join request approved / declined|Requester|Required|Follow-up to the request above|
|[ ]|Organisation created (confirmation)|Creator|Optional|"Organisation created"|

### 3. Being named in someone else's content

Today, people and organisations can be attached to content without being told. (Linking an artifact to a collaborative or use case is in the core set, section D.)

|Done|Situation|Who gets it|Priority|Where in app|
|-|-|-|-|-|
|[ ]|Added as a contributor to a use case|That person|Required|Use case step 2 "Contributor added"|
|[ ]|Added as an author/contributor to a publication|That person|Required|Publication step 1 "Contributor added"|
|[ ]|Organisation linked to an event|Org admins|Recommended|Event Connections step|

### 4. Publishing lifecycle

Applies to all artifacts. Publishing in general doesn't send an email (see "Not sending"). Collaborative publish and edit emails are in the core set.

|Done|Situation|Who gets it|Priority|Notes|
|-|-|-|-|-|
|[ ]|Content unpublished (moved back to Draft)|Creator, **if someone else did it**|Required|An admin can unpublish an editor's work|
|[ ]|Content deleted|Creator, **if someone else did it**|Required|All "… deleted" actions|
|[ ]|Something you connected was unpublished/deleted (e.g. a dataset your use case relies on)|Owners of connected content|Recommended|Prevents broken "Connected to" links|
|[ ]|New AI model version added|Org members / evaluators|Optional|"Version added"|
|[ ]|Draft left untouched for X days|Creator|Optional|Re-engagement nudge|

### 5. Evaluation (Evaluator role)

|Done|Situation|Who gets it|Priority|
|-|-|-|-|
|[ ]|AI model assigned or ready for evaluation|Evaluators|Recommended (needs product confirmation)|
|[ ]|Evaluation completed|Model owner|Recommended|

### 6. Support and contact

|Done|Situation|Who gets it|Priority|Where in app|
|-|-|-|-|-|
|[ ]|Support message received (confirmation + reference)|Sender|Required|Contact Support sheet "Message sent"|
|[ ]|Support reply|Sender|Required|—|
|[ ]|Contact form submitted|Sender + team inbox|Recommended|`/contact`|

### 7. Events

|Done|Situation|Who gets it|Priority|
|-|-|-|-|
|[ ]|Event you're connected to changed date/location, or was cancelled (unpublished)|Linked orgs/people|Recommended|
|[ ]|Event reminder|Linked orgs/people|Optional|

---

## Open questions

### Core set

* [ ] **Collaborative published / edited: who gets it?** Members of the collaborative, admins of the owning organisation, or the owners of artifacts linked to it?
* [ ] **What counts as an "edit"?** Every saved change, or only changes to *published* content going live? Should several edits within a short window be grouped into one email, so people don't get one per save?
* [ ] **Edited by someone else: who is "the creator"?** The person who first created the artifact, or everyone who has edited it?
* [ ] **Joining a collaborative:** does this email go only to the person who joined, or also to the collaborative's owners/admins? Is joining an invite you accept, or are you added directly?
* [ ] **Linked to a collaborative or use case:** should the owner be told only, or asked to approve before the link shows publicly? (Same question as consent, below.)

### General

* [ ] **Consent when someone is added to content:** send a notice only, or ask them to accept before their name appears publicly? Today they're added silently.
* [ ] **Join requests:** the Request button exists, but there's no screen to approve or decline requests and no "pending" state, so the join-request emails have nothing to hook onto yet.
* [ ] **Following:** there's no follow or subscribe feature, so emails like "new dataset from an org you follow" aren't possible yet. That would be a separate feature.
* [ ] **Email settings:** Optional emails, and most publishing emails, should go through a notification settings section in the Profile page. Required account and security emails should always be sent.
