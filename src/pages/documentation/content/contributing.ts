import { shot } from '@/pages/documentation/content/shots'
import type { Article } from '@/pages/documentation/content/types'

export const CONTRIBUTING: Article[] = [
  {
    slug: 'content-contribution',
    title: 'Content contribution',
    group: 'contributing',
    intro:
      'CivicDataSpace provides contributor workflows for creating and managing supported content types. Each workflow collects information relevant to the resource and ends with a review step before publication.',
    aliases: ['create', 'add', 'upload', 'wizard', 'steps', 'draft', 'autosave', 'contribute', 'stepper', 'save as draft'],
    related: ['publishing-lifecycle', 'dashboard-and-organisations', 'datasets'],
    sections: [
      {
        id: 'getting-started',
        title: 'Getting started',
        blocks: [
          {
            type: 'steps',
            items: [
              'Sign in or register.',
              'Open the dashboard and choose the content type under Contribution.',
              'Start a new item with the Create button at the top right of its list (for example Create Dataset).',
              'Complete the required information, step by step.',
              'Review the content on the final Review & Publish step before publishing.',
            ],
          },
          { type: 'visual', visual: shot('dash-datasets', { alt: 'The dashboard’s Datasets list, with the Contribution menu on the left and the Create Dataset button at the top right.' }) },
        ],
      },
      {
        id: 'anatomy-of-a-workflow',
        title: 'How a workflow works',
        blocks: [
          { type: 'p', text: 'Every workflow looks and behaves the same way, so once you have used one you know the others.' },
          { type: 'visual', visual: shot('dataset-step-files', { alt: 'The first step of the dataset workflow, with the title, save status, visibility notice, stepper and the upload area.' }) },
          {
            type: 'list',
            items: [
              'The header shows the item’s title and a save status that reads “All changes saved” when your work is stored.',
              'A visibility notice tells you who can see it: “Public once published” for something new, or “Live on CivicDataSpace” for something already published.',
              'The stepper shows the steps, with the current one highlighted and completed ones ticked.',
              'Required fields are marked with a red asterisk, and problems are explained next to the field.',
              'At the bottom, Previous and Continue move between steps, and Save as Draft stores your work without publishing (for something already published it reads Save Changes).',
            ],
          },
        ],
      },
      {
        id: 'workflows-at-a-glance',
        title: 'The workflows at a glance',
        blocks: [
          { type: 'p', text: 'Every workflow is a short sequence of steps shown in a stepper at the top of the page. They all finish with Review & Publish.' },
          {
            type: 'table',
            headers: ['Content', 'Steps'],
            rows: [
              ['Dataset', 'Data Files → Metadata → Review & Publish'],
              ['Use case', 'Builder → Connect → Review & Publish'],
              ['Collaborative', 'About → Connections → Review & Publish'],
              ['AI model', 'Versions → Model Information → Review & Publish'],
              ['Chart', 'Build → Review & Publish'],
              ['Publication', 'Files → Details → Review & Publish'],
              ['Event', 'Details → Connections → Resources → Review & Publish'],
            ],
          },
        ],
      },
      {
        id: 'dataset-contribution',
        title: 'Dataset contribution',
        blocks: [
          {
            type: 'p',
            text: 'Dataset contribution collects information about the dataset, its resources, and its publication settings. Start with Create Dataset and choose the dataset type, Dataset or Prompt Dataset. The type cannot be changed once the draft exists.',
          },
          { type: 'visual', visual: shot('dataset-type-dialog', { alt: 'The Add New Dataset dialog offering Dataset and Prompt Dataset.' }) },
          {
            type: 'walkthrough',
            steps: [
              {
                title: 'Data Files',
                text: 'Add the dataset’s files, either by uploading them (PDF, CSV, XLS, XLSX or TXT, up to 500MB each) or by importing from a public platform (Kaggle, GitHub or Hugging Face) with the file’s URL.',
                visual: shot('dataset-step-files', { alt: 'The Data Files step with the File Upload and Public Platform options.' }),
              },
              {
                title: 'Metadata',
                text: 'Enter the name and description, choose the sector, geography and tags, document the sources under Source & Provenance, and set the licence and access type.',
                visual: shot('dataset-step-metadata', { alt: 'The Metadata step with Basic Information, Classification and Source & Provenance.' }),
              },
              {
                title: 'Review & Publish',
                text: 'Check each section. Every section has a pencil to go back and edit it. Publish when the button is enabled.',
                visual: shot('dataset-step-review', { alt: 'The Review & Publish step of a new dataset.' }),
              },
            ],
          },
        ],
      },
      {
        id: 'use-case-contribution',
        title: 'Use case contribution',
        blocks: [
          { type: 'p', text: 'Use case contribution collects information about the application and its associated resources.' },
          {
            type: 'walkthrough',
            steps: [
              {
                title: 'Builder',
                text: 'Create and structure the use case: a thumbnail, a title, a subtitle, and the story, built from content blocks.',
                visual: shot('usecase-builder', { alt: 'The Builder step of a use case with the thumbnail upload and the title and subtitle fields.' }),
              },
              {
                title: 'Connect',
                text: 'Add context (tags, SDG goals, sectors and geographies), connect published datasets, and add contributors and organisations.',
                visual: shot('usecase-connect', { alt: 'The Connect step of a use case with classification fields and the Datasets section.' }),
              },
              { title: 'Review & Publish', text: 'Check readiness, then publish.' },
            ],
          },
        ],
      },
      {
        id: 'collaborative-contribution',
        title: 'Collaborative contribution',
        blocks: [
          { type: 'p', text: 'Collaborative contribution collects information about the initiative and the resources, people and organisations connected to it.' },
          {
            type: 'walkthrough',
            steps: [
              {
                title: 'About',
                text: 'Enter the name, the page address (filled in from the name, and editable), the description, an image and a website, and choose sectors, SDG goals, tags and geographies.',
                visual: shot('collab-about', { alt: 'The About step of a collaborative with the image upload and the name and address fields.' }),
              },
              {
                title: 'Connections',
                text: 'First add people and organisations: search for them, or use Add New for someone who is not listed. Then connect resources: search for publications, events, datasets and use cases by name, or use Add Resource to create a new dataset or publication and connect it. Only published records can be connected.',
                visual: shot('collab-connections', { alt: 'The Connections step with the People & Organisations section above the Resources section.' }),
              },
              {
                title: 'Review & Publish',
                text: 'Check readiness, open the preview to see the page as it will appear, and publish from there.',
                visual: shot('collab-review', { alt: 'The Review & Publish step of a collaborative with the Preview Collaborative button.' }),
              },
            ],
          },
          {
            type: 'visual',
            visual: {
              kind: 'media',
              title: 'Connecting resources',
              alt: 'A short recording of searching for a resource by name, filtering by type and connecting it to a collaborative.',
              media: 'video',
              capture: 'Screen recording on the Resources section: type a name, use a type filter, select a result, see it listed.',
              annotate: 'No annotations; add captions.',
              aspect: '16 / 9',
            },
          },
        ],
      },
      {
        id: 'ai-model-contribution',
        title: 'AI model contribution',
        blocks: [
          { type: 'p', text: 'AI model contribution collects information about the model, its versions, and the access methods associated with each version.' },
          {
            type: 'walkthrough',
            steps: [
              {
                title: 'Versions',
                text: 'Configure releases and how each can be accessed. A new model starts with Version 1.0, marked Primary; add more versions with Add Version.',
                visual: shot('aimodel-versions', { alt: 'The Versions step with Version 1.0 marked Primary and the Add Version button.' }),
              },
              {
                title: 'Model Information',
                text: 'Describe the model: its name, type and description, who it is for and what it is intended for, its languages, geographies and licence.',
                visual: shot('aimodel-info', { alt: 'The Model Information step with Basic Information and Purpose & Audience.' }),
              },
              { title: 'Review & Publish', text: 'Check readiness, then publish.' },
            ],
          },
        ],
      },
      {
        id: 'chart-contribution',
        title: 'Chart contribution',
        blocks: [
          { type: 'p', text: 'Chart contribution associates a visual representation with a dataset and its relevant resource.' },
          {
            type: 'walkthrough',
            steps: [
              {
                title: 'Build',
                text: 'Choose one of your published datasets and one of its files, choose the chart type, configure it, and watch the Live Preview.',
                visual: shot('chart-build', { alt: 'The Build step of a chart with the Data section.' }),
              },
              { title: 'Review & Publish', text: 'Check readiness, then publish.' },
            ],
          },
        ],
      },
      {
        id: 'publications-and-events',
        title: 'Publications and events',
        blocks: [
          {
            type: 'p',
            text: 'Publications (Files → Details → Review & Publish) and events (Details → Connections → Resources → Review & Publish) follow the same pattern. A publication can also be created from a collaborative or an event, with Add Resource, without leaving that workflow.',
          },
        ],
      },
      {
        id: 'saving-and-reviewing',
        title: 'Saving and leaving',
        blocks: [
          {
            type: 'p',
            text: 'Each workflow shows whether your changes are saved, and offers Save as Draft so that work in progress is kept before publication. Review content for accuracy and completeness on the final step before publishing.',
          },
          {
            type: 'note',
            tone: 'note',
            text: 'If you close a workflow with unsaved changes you are asked to save them or discard them, so nothing is lost by accident.',
          },
        ],
      },
    ],
  },
  {
    slug: 'publishing-lifecycle',
    title: 'Publishing lifecycle',
    group: 'contributing',
    intro: 'Publication states distinguish content that is still being prepared from content that is available publicly.',
    aliases: ['draft', 'published', 'unpublish', 'status', 'edit', 'publish changes', 'delete', 'save changes', 'actions'],
    related: ['content-contribution', 'dashboard-and-organisations'],
    sections: [
      {
        id: 'two-states',
        title: 'Draft and published',
        blocks: [
          {
            type: 'defs',
            items: [
              { term: 'Draft', desc: 'Content that is still being prepared and has never been published. It is not publicly available. A draft can be saved and edited before publication.' },
              { term: 'Published', desc: 'Content that is publicly available.' },
            ],
          },
          { type: 'p', text: 'These are the only two statuses, and they are the same for every content type. Each list in the dashboard shows the status of every record and has tabs for All, Draft and Published, with a count on each.' },
          { type: 'visual', visual: shot('dash-datasets', { alt: 'A dashboard list showing each record’s status and the actions for published and draft records.' }) },
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'The publishing lifecycle',
              layout: 'flow',
              nodes: [
                { label: 'Draft', caption: 'Not public', next: 'Publish' },
                { label: 'Published', caption: 'Public' },
              ],
              caption: 'A published record can also be moved back to Draft with Unpublish. Editing a published record does not change its status; see below.',
            },
          },
        ],
      },
      {
        id: 'row-actions',
        title: 'What you can do with a record',
        blocks: [
          { type: 'p', text: 'The actions at the end of each row depend on the record’s status:' },
          {
            type: 'table',
            headers: ['Status', 'Actions'],
            rows: [
              ['Draft', 'Continue editing, and Delete.'],
              ['Published', 'View live (opens the public page), Edit, and Unpublish.'],
            ],
          },
          { type: 'p', text: 'A published record is not deleted directly: unpublish it first, which moves it back to Draft.' },
        ],
      },
      {
        id: 'publishing',
        title: 'Publishing for the first time',
        blocks: [
          {
            type: 'p',
            text: 'Publishing happens on the Review & Publish step. The publish button stays disabled until everything required is complete, and the step lists what still needs attention. For a record that has never been published it reads, for example, Publish Dataset.',
          },
          {
            type: 'list',
            items: [
              'Required fields are complete.',
              'Descriptions and metadata are accurate.',
              'Associated resources and contributors are correct.',
              'Licence and access settings are appropriate.',
              'The content is ready to be made available.',
            ],
          },
        ],
      },
      {
        id: 'editing-published-content',
        title: 'Editing published content',
        blocks: [
          {
            type: 'p',
            text: 'You do not have to unpublish content to edit it. When you edit a published record, the version the public sees stays live while your edits are kept as a working copy.',
          },
          { type: 'visual', visual: shot('edit-published', { alt: 'A published dataset opened for editing, with the notice “Public visibility · Live on CivicDataSpace”.' }) },
          {
            type: 'steps',
            items: [
              'Choose Edit on the published record in its list.',
              'Make your changes. The notice at the top reminds you the record is live on CivicDataSpace.',
              'Use Save Changes to keep your edits. They are not public yet, and the current published version stays live.',
              'When the edits are ready, go to Review & Publish and choose Publish Changes. This replaces the public version immediately.',
              'To abandon the edits, close the workflow and choose Discard changes when asked.',
            ],
          },
          { type: 'visual', visual: shot('review-publish-button', { alt: 'The foot of the Review & Publish step of a published dataset, with a notice that publishing replaces the public version and the Publish Changes button.' }) },
          {
            type: 'note',
            tone: 'note',
            title: 'Unsaved changes are not a status',
            text: '“Unsaved changes” is an editing indicator. It never appears as a status, and editing never moves a published record back to Draft.',
          },
          {
            type: 'p',
            text: 'For a dataset, the Review & Publish step also lists the published content that uses it (use cases, for example) so you can see what your change will affect.',
          },
        ],
      },
      {
        id: 'unpublishing',
        title: 'Unpublishing',
        blocks: [
          { type: 'p', text: 'Unpublish takes a record out of public view. Use the Unpublish action on a published row, then confirm.' },
          { type: 'visual', visual: shot('unpublish-dialog', { alt: 'The confirmation dialog asking whether to unpublish a use case, explaining it will be removed from public view and moved back to Draft.' }) },
          { type: 'p', text: 'The record moves back to Draft. You can continue editing it and publish it again later.' },
        ],
      },
      {
        id: 'deleting',
        title: 'Deleting',
        blocks: [{ type: 'p', text: 'Drafts can be deleted from their list, after a confirmation. Published records cannot be deleted until they have been unpublished.' }],
      },
      {
        id: 'connecting-published-content',
        title: 'Only published content can be connected',
        blocks: [
          {
            type: 'p',
            text: 'When one record connects to another, for example a collaborative to datasets and use cases, or a chart to a dataset, only published records are offered. A draft cannot be connected.',
          },
        ],
      },
    ],
  },
  {
    slug: 'dashboard-and-organisations',
    title: 'Dashboard & organisations',
    group: 'contributing',
    intro:
      'The contributor dashboard provides an area for accessing and managing content associated with a user’s account or organisation, depending on the available permissions.',
    aliases: ['workspace', 'my organisations', 'members', 'roles', 'admin', 'editor', 'evaluator', 'invite', 'continue working', 'my workspace'],
    related: ['content-contribution', 'publishing-lifecycle', 'organisations-and-people'],
    sections: [
      {
        id: 'the-dashboard',
        title: 'The dashboard',
        blocks: [
          { type: 'p', text: 'The dashboard is where you choose where to work, and where unfinished work is waiting.' },
          { type: 'visual', visual: shot('dash-home', { alt: 'The dashboard with My Workspace, Organisation Workspace and the Continue Working list.' }) },
          {
            type: 'defs',
            items: [
              { term: 'My Workspace', desc: 'Your individual contributions: datasets, use cases, AI models, collaboratives, charts and events.' },
              { term: 'Organisation Workspace', desc: 'Contributions on behalf of an organisation you belong to.' },
              { term: 'Continue Working', desc: 'Drafts and unpublished edits across your personal and organisation workspaces. Continue reopens the record where you left off.' },
            ],
          },
        ],
      },
      {
        id: 'individual-contribution',
        title: 'Individual contribution',
        blocks: [
          {
            type: 'p',
            text: 'Users contributing individually work from My Workspace. Its sidebar lists the content types under Contribution (Datasets, Use Cases, Collaboratives, AI Models, Publications, Charts and Events), a Profile under Account, and Help & Support.',
          },
          {
            type: 'p',
            text: 'Each content type has a list. It has a search, a Filter and a Columns control, tabs for All, Draft and Published, columns such as status and last updated (the list can be sorted by last updated), and paging. The actions at the end of a row depend on the record’s status; see Publishing lifecycle.',
          },
        ],
      },
      {
        id: 'organisation-management',
        title: 'Organisation-level management',
        blocks: [
          {
            type: 'p',
            text: 'Organisations have their own workspace. Open My Organisations to choose one; inside, Switch organisation takes you back to the choice. Your role in the organisation is shown under its name.',
          },
          { type: 'visual', visual: shot('org-selector', { alt: 'The My Organisations page, listing the organisations you belong to.' }) },
          { type: 'visual', visual: shot('org-dashboard', { alt: 'An organisation’s dashboard with its sidebar, counts of its content, recent activity and Continue Working.' }) },
          {
            type: 'list',
            items: [
              'Overview: a Dashboard with counts of the organisation’s datasets, use cases, collaboratives, AI models, publications, charts and events, its recent activity, and work to continue.',
              'Contribution: the same content types as in My Workspace, but for the organisation.',
              'Organisation: Admin & Members, and the organisation’s Profile.',
            ],
          },
        ],
      },
      {
        id: 'members-and-roles',
        title: 'Members and roles',
        blocks: [
          { type: 'p', text: 'Admin & Members lists the organisation’s members (name, email, role and the date they joined) and its pending invitations, in two tabs. Admins add members with Add Member.' },
          { type: 'visual', visual: shot('org-members', { alt: 'The Admin & Members page with the Members and Invitations tabs and a table of members with their roles.' }) },
          {
            type: 'table',
            headers: ['Role', 'What it can do'],
            rows: [
              ['Admin', 'Manage the organisation and its members (add and remove members, change roles, edit the organisation’s details), and create, edit and publish its content.'],
              ['Editor', 'Create, edit and publish the organisation’s content. Cannot manage members or the organisation itself.'],
              ['Evaluator', 'A specialised role for evaluating AI models. It does not give access to manage the organisation’s datasets, use cases or other content.'],
            ],
          },
          {
            type: 'note',
            tone: 'note',
            text: 'Everyone in the organisation can see its members. An organisation always keeps at least one Admin, so the last Admin cannot be removed.',
          },
        ],
      },
      {
        id: 'ownership-and-attribution',
        title: 'Content ownership and attribution',
        blocks: [
          {
            type: 'p',
            text: 'Individual contribution and organisational association are related but distinct. The person who contributes a record, the organisation associated with it, and the publisher displayed on the record may represent different roles. Content created inside an organisation workspace belongs to that organisation, and the organisation is shown as its publisher.',
          },
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'Individual and organisation workspaces',
              layout: 'hub',
              hub: { label: 'A record', caption: 'Created in one workspace' },
              nodes: [
                { label: 'My workspace', caption: 'Published under the individual' },
                { label: 'Organisation workspace', caption: 'Published under the organisation' },
              ],
            },
          },
        ],
      },
      {
        id: 'managing-content',
        title: 'Managing content',
        blocks: [
          {
            type: 'p',
            text: 'Use the dashboard to locate a record and review its available actions. Editing, publishing, and unpublishing options depend on the record’s state and on your permissions.',
          },
        ],
      },
    ],
  },
]
