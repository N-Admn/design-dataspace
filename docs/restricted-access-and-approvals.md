# DataSpace: restricted items, collaborative contributions and approvals

This is how these features will work on DataSpace in production: what each person sees, what they can do, and what happens at every step. It also shows what exists today and what is being added.

## 1\. People in these flows

| Person | Who they are |
| :---- | :---- |
| Visitor | Anyone on the site, signed in or not |
| Signed-in user | Anyone with a DataSpace account |
| Item owner | The person who created a dataset, use case or publication, or the organisation it belongs to |
| Organisation admin | Manages an organisation's people and items. Organisations keep their four roles: admin, editor, viewer, auditor |
| Collaborative owner | The organisation or person that created the collaborative |
| Partner | An organisation formally associated with a collaborative. Once the collaborative is published, it can add items directly. It does not approve submissions |
| Supporter | An organisation formally associated with a collaborative, shown on its page. |
| Contributor | Any individual or organisation that owns an item in the collaborative. The list fills itself; nobody is added to it by hand |
| Follower | A person that follows a collaborative to get updates |

### Organisation roles in these flows

The four roles stay as they are on the **Admin & Members** page. This is what each one does in the new flows:

| Role | Can do |
| :---- | :---- |
| Admin | Manage who can access the organisation's restricted items, approve or decline access requests, add items to collaboratives where the organisation is a partner, leave a partnership |
| Editor | Create and edit the organisation's items, set them to Restricted Access, add items to collaboratives where the organisation is a partner |
| Viewer | See everything in the organisation, including restricted and draft items. Can't change anything |
| Auditor | Same as viewer (used for reviewing AI models) |

## 

## 

## 2\. What exists today and what is added

| Area | Today | After this release |
| :---- | :---- | :---- |
| Access setting | The dataset editor (Metadata step, Publishing Settings) already offers **Open Access** / **Restricted Access**, but nothing respects it | It's respected everywhere: files and data are locked for people without access |
| Item page | Everything is open to everyone | Restricted items show a lock on their files and data, with a **Request access** button |
| Managing access | None | A **"Who can access"** field in the editor, and a **Manage access** button after publishing: add people or organisations, see who has access, revoke |
| Access requests | None | Request, approve and decline, with emails and a history |
| Collaborative items | Only the owner adds items, in the **Content** step (Connect Dataset / Connect Use Case), only while it's a draft | Anyone can add any published item: the owner and partners directly, everyone else with approval. Works on published collaboratives too |
| Partners and supporters | Shown on the collaborative for credit only | Partners can add items directly once the collaborative is published. Only the collaborative owner approves submissions. Supporters stay as they are |
| Contributors | People added by hand in the **People** step | A list that fills itself with the owners (individuals or organisations) of every item in the collaborative. Contributors are no longer added by hand |
| Followers | None | People can follow a collaborative and get update emails |
| Organisation roles and members | Four roles; admins add members directly | No change |
| Pending approvals | None | A **Notifications & Requests** page in the dashboard sidebar, next to Datasets, Use Cases, AI Models, Publications, Collaboratives and Charts |
| Emails | Only signup and OTP emails from the login system | Platform emails from **"CivicDataSpace" [no-reply@civicdataspace.in](mailto:no-reply@civicdataspace.in)** |
| Notifications | None | Email, a bell in the top bar and the Notifications & Requests page. |

## 3\. Restricted items

Restricted items show a lock on their files and data. A signed-in user can request access, and once the owner approves, they can open them.

### 3.1 Where the restricted setting applies

We start with **datasets**. Other modules will follow, and we'll decide which ones later.

**Example:** a dataset is set to Restricted Access. Anyone can still find it and read its page, but its files, downloads, data preview and charts stay locked until the owner approves access.

### 3.2 Making an item restricted

- In the editor's Metadata step, under Publishing Settings, the owner picks **Access type**: **Open Access** (default, "Anyone can browse and download") or **Restricted Access** ("Requires approval to access").  
- The label at the top of the editor shows the choice. Today it reads "Public visibility · Public once published"; for restricted items it changes to say restricted.  
- The owner can change it at any time, before or after publishing.  
- Restricted items show a **lock** badge in lists and search.

### 3.3 What visitors see

| Part of the item | People with access | People without access |
| :---- | :---- | :---- |
| Title, description, organisation, tags, sectors, licence | Shown | Shown |
| File list (names and formats) | Shown | Shown, with a lock |
| Downloads, file links, data preview, charts | Shown | Not shown |
| Publication files, use case dashboard link | Shown | Not shown |

- The same rules apply wherever the item appears: its own page, lists, search, inside a collaborative, and inside a use case.  
- **People with access:** the owner, everyone in the owning organisation, and anyone added to the item's access list (directly or through an approved request).  
- The description is always shown, so owners shouldn't put sensitive details in the title or summary. The setting screen says this.  
- Use case dashboards are hosted on other websites. DataSpace hides the link, but it can't protect the dashboard itself. The setting screen says this too.

### 3.4 Managing who can access

There is one access list per item. The owner can edit it in two places:

1. **In the editor:** when **Restricted Access** is picked, a **"Who can access"** field appears under Publishing Settings. The owner searches and picks **users** or **organisations**. The field is hidden for Open Access items.  
2. **After publishing:** a **Manage access** button opens the same list. It's on the item's row in the dashboard list (Actions column) and on the item's public page.

The Manage access panel shows:

- everyone with access, each with **Revoke**;  
- an **Add** box for people or organisations;  
- pending requests, with **Approve** / **Decline**;  
- the history: who was given or lost access, when, and by whom.

**Who can manage access**

| Item belongs to | Who can manage access |
| :---- | :---- |
| A person | That person |
| An organisation | That organisation's admins |

Nobody else sees the "Who can access" field or the Manage access button, including the organisation's editors, viewers and auditors. An editor can still set an item to Restricted Access; the organisation's admins then choose who gets in.

**How access works**

- **A person added** gets access straight away.  
- **An organisation added** gives access to all its members, including people who join later.  
- Whoever is added gets an email: "You've been given access".  
- **Revoke** stops access straight away and sends an email.  
- The owner and the owning organisation's members always have access, so they're not listed.

### 3.5 Requesting access

1. The visitor clicks **Request access** and can add a short reason.  
2. The button changes to **Request sent**.  
3. The owner gets an email. For an organisation's item, all of that organisation's admins get it.  
4. The request appears in the item's Manage access panel, and on the Notifications & Requests page under **Pending**.  
5. Any one of them clicks **Approve** or **Decline**, and can add a reason. The first decision counts, and everyone else sees it's already done.  
6. The visitor gets an email with the answer.  
   - **Approved:** they're added to the access list. Downloads and data now show for that user.  
   - **Declined:** the button goes back to **Request access**, so they can ask again later.

### 3.6 How long access lasts

- Access stays when the item is edited or gets a new version.  
- It lasts until the owner revokes it.

### 3.7 History

- Every request, approval, decline, addition and revoke is recorded with who did it and when.  
- Owners see the full history in the Manage access panel.  
- Requesters see their own requests and answers on the Notifications & Requests page.

## 4\. Collaboratives

A collaborative keeps four separate lists: **Partners**, **Supporters**, **Contributors** and **Followers (/ Subscriber)**. Each has its own purpose.

### 4.1 Setting up a collaborative

1. The owner creates the collaborative, as today. The steps stay **About → People → Content → Review & Publish**.  
2. The **People** step is for organisations only: the owner adds them as **Partner** or **Supporter** in the existing dropdown. The **Contributor** option for people is removed, because contributors now come from the items (section 4.4).  
3. When an organisation is added as a partner, its admins get a heads-up email: "You've been added as a partner on *collaborative*. Once it's published, you can add items directly."  
4. **Partner rights start when the collaborative is published.** While it's a draft, only the owner works on it. If it's unpublished later, partner rights pause until it's published again.  
5. A partner organisation's admins can **Leave** the collaborative if they don't want to be a partner.  
6. In the People step, the owner also chooses **Who can submit items**:  
   - **Anyone signed in** (the default). Submissions go through approval.  
   - **Only partners**, for closed groups.  
7. Any organisation on DataSpace can be a partner, including one created through **Add New → Organisation**. When someone creates an organisation that way, they become its admin. They should add that organisation's real people on its **Admin & Members** page, so those people get the partner rights.  
8. Partners already on collaboratives before this release get partner rights at release, and their admins get the heads-up email.

### 4.2 Supporters

- Supporters are organisations only.  
- They're shown on the collaborative page.  
- They have no special rights for now. Their members can submit items like any signed-in user.

### 4.3 Adding items

Anyone can add **any published dataset, use case on the platform** to a collaborative. Who needs approval depends on who is adding it.

**The collaborative owner** (admins and editors of the owner organisation, or the person who owns it)

- They use **Connect Dataset / Connect Use Case** in the Content step, or **Add item** on the collaborative page.  
- The item shows straight away.

**Partners** (admins and editors of a partner organisation, once the collaborative is published)

- They use **Add item** on the collaborative page.  
- The item shows straight away.  
- Viewers and auditors of a partner organisation can't add or remove items. People who join the organisation later get these rights through their role automatically.

**Anyone else signed in** (when the collaborative is open to anyone)

1. They click **Submit an item** on the collaborative page and pick any published item.  
2. They see **Waiting for approval**. The item doesn't show on the collaborative yet.  
3. The collaborative owner gets an email (for an organisation's collaborative, all of its admins), and the submission appears on their Notifications & Requests page.  
4. Any one of them clicks **Approve** or **Decline**. The first decision counts, and the others see it's already decided.  
5. The submitter gets an email with the answer. Approved items show on the collaborative.

**Rules**

- Only **published** items can be added. Nobody can add someone else's draft.  
- Items can be added while the collaborative is a draft (by the owner) and after it's published.  
- An item always stays with its owner. Being in a collaborative never changes who owns it or who can edit it.  
- When someone else's item is added, **its owner gets an email**: "Your item was added to *collaborative*".  
- The item's owner can **Remove from this collaborative** at any time.  
- Each item shows **"Added by"** with the person or organisation that added it.  
- Whoever added an item can remove it. The collaborative owner can remove any item, partner or supporter.  
- Only the collaborative owner can edit or delete the collaborative.  
- Restricted items keep their lock inside a collaborative. People without access still request it from the item's owner.

### 4.4 Contributors

- **A contributor is anyone who owns an item in the collaborative**: an individual (for personal items) or an organisation (for an organisation's items).  
- It doesn't matter how the item got there: added by the owner, added by a partner, or submitted and approved. Once it's in the collaborative, its owner is a contributor.  
- Items **waiting for approval** or **declined** don't count.  
- The **Contributors** list on the collaborative page fills itself. Nobody adds or removes contributors by hand.  
  - Example: a collaborative with 10 datasets and 20 use cases lists the owners of all 30 items. Each owner appears once, even if they own several items.  
- When an owner's last item is removed, they drop off the list.  
- An item's owner is listed whether the item is open or restricted. Being listed doesn't change the item's access.  
- Being a contributor is credit only. It doesn't let anyone skip approval or edit the collaborative.

### 4.5 Followers

- Any signed-in person can click **Follow** on a collaborative, and **Unfollow** at any time.  
- Followers get **one summary email a day**, only on days something changed:  
  - new items added (restricted items show with a lock, the same as on the site);  
  - the collaborative being published or updated;  
  - new partners or supporters.  
- Following doesn't make anyone a contributor, partner or supporter, and doesn't give access to restricted items.

### 4.6 Who can do what

|  | Add items | Approve / decline submissions | Remove items | Edit or delete the collaborative |
| :---- | :---- | :---- | :---- | :---- |
| Collaborative owner | Any published item, directly | Yes | Any item, partner or supporter | Yes |
| Partner (after publishing) | Any published item, directly (admins and editors) | No | Items they added | No |
| Supporter | Submit for approval, like anyone | No | Items they added | No |
| Anyone signed in | Submit any published item for approval, if the collaborative is open | No | Items they added | No |
| Item owner | Same as their row above | No | **Their own items**, wherever they were added from | No |
| Contributor | Credit only. Rights depend on the rows above |  |  |  |
| Follower | Gets updates only |  |  |  |

## 5\. Notifications & Requests

One page per account, in the dashboard sidebar, plus a **bell** in the top bar for a quick look. It covers the person's personal workspace and every organisation they belong to; each row carries a context chip (for example "Personal" or "CivicDataLab · Admin"). The full design is in `docs/notification-system.md`.

| Tab | Shows | Actions |
| :---- | :---- | :---- |
| **Pending** | Requests waiting for a decision: ones I can decide, and ones I sent | Approve / Decline (deciders), Withdraw (requester) |
| **Updates** | Information that needs no decision (collaborative updates, items added, partner added) | None |
| **Approved** | Requests that were approved, including direct grants | Revoke (deciders) |
| **Closed** | Declined, Withdrawn and Revoked requests, each with its own chip | Request again (requester) |

- Filters: direction (waiting for me, sent by me), context, unread only.
- **View history** opens a side sheet with the request's timeline: who did what, and when.
- Every email links to its row on this page.
- A request is always in one of these states: **Waiting**, **Approved**, **Declined**, **Withdrawn** or **Revoked**.
- Decisions are shared: when one authorised admin decides, everyone else sees it decided. Read or unread is individual.
- The person who performs an action never gets a notification about it.
- Approving has no undo. Declining and revoking ask for confirmation first.

## 6\. Emails

All emails come from **"CivicDataSpace" [no-reply@civicdataspace.in](mailto:no-reply@civicdataspace.in)**. 

| When | Who gets it |
| :---- | :---- |
| Someone requests access to an item | Item owner, or the organisation's admins |
| Access request approved or declined | The requester |
| You've been given access | The person, or the organisation's admins |
| Your access was revoked | The person, or the organisation's admins |
| New submission to a collaborative | The collaborative owner, or the owning organisation's admins. Not partners |
| Submission approved or declined | The submitter |
| Your organisation was added as a partner | The partner organisation's admins |
| Your item was added to a collaborative | The item's owner |
| Daily update on a collaborative you follow | Followers |

- Emails go out in the background. If the email service is down, they're sent later, not lost.  
- Follower updates are one summary a day rather than one email per change.  
- On busy days some emails may arrive a little late.

## 

## 7\. Screens to design and build

| Screen | New or changed | What it needs |
| :---- | :---- | :---- |
| Dataset editor, Metadata step | Changed | Access type is already there. Add the **"Who can access"** field when Restricted Access is picked, the warning about descriptions, and the updated top label |
| Dashboard item lists | Changed | **Manage access** in the Actions column, for people who can manage access |
| Manage access panel | New | Who has access with Revoke, Add people or organisations, pending requests, history |
| Public item page (dataset first) | Changed | Lock badge, locked files, **Request access** / **Request sent** button, **Manage access** for people who can manage access |
| Lists and search results | Changed | Lock badge on restricted items |
| Request access dialog | New | Optional reason, then Send |
| Public collaborative page | Changed | **Add item** (owner and partners), **Submit an item** (others), **Follow** / **Unfollow**, "Added by" and **Remove from this collaborative** on items, and Partners, Supporters, Contributors and Followers lists |
| Collaborative editor, People step | Changed | Organisations only, as Partner or Supporter (remove the Contributor option), the "Who can submit items" setting, **Leave** for partner admins |
| Notifications & Requests page (dashboard sidebar) and bell | New | Four tabs, filters, approve / decline actions, history. See `docs/notification-system.md` |
| Admin & Members page | No change | Roles stay Admin, Editor, Viewer, Auditor |
| Email templates | New | The 9 emails above, linking to the Notifications & Requests page, the item or the collaborative |

## 8\. Related cards

- **\#313:** collaboratives: partners, supporters, contributors, followers (section 4\)  
- **\#314:** what "restricted" means (section 3\)  
- **\#315:** email service and sender (section 6\)  
- **\#316:** restricted setting and locks (sections 3.1 to 3.3)  
- **\#317:** managing access and access requests (sections 3.4 to 3.7)  
- **\#320:** emails (section 6\)

