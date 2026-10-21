import { shot } from '@/pages/documentation/content/shots'
import type { Article } from '@/pages/documentation/content/types'

export const PLATFORM_REFERENCE: Article[] = [
  {
    slug: 'datasets',
    title: 'Datasets',
    group: 'platform-reference',
    intro:
      'Datasets are a foundational content type in CivicDataSpace. They provide structured information that users can discover, understand, and explore through associated resources.',
    aliases: ['data', 'files', 'csv', 'licence', 'license', 'source', 'publisher', 'metadata', 'prompt dataset', 'download', 'data card', 'provenance'],
    related: ['use-cases', 'charts', 'content-contribution'],
    sections: [
      {
        id: 'records-and-resources',
        title: 'Dataset records and resources',
        blocks: [
          {
            type: 'defs',
            items: [
              { term: 'Dataset record', desc: 'Describes the dataset and its metadata.' },
              {
                term: 'Resource',
                desc: 'A file that belongs to a dataset. It is either uploaded directly or imported from a public platform (Kaggle, GitHub or Hugging Face) by its URL. Each resource has its own title and description.',
              },
            ],
          },
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'Dataset record and its resources',
              layout: 'hub',
              hub: { label: 'Dataset record', caption: 'Name, description, sector, geography, sources, licence, access' },
              nodes: [
                { label: 'Resource: uploaded file', caption: 'Added by direct upload' },
                { label: 'Resource: imported file', caption: 'Imported from Kaggle, GitHub or Hugging Face' },
              ],
              caption: 'One dataset record can have several resources.',
            },
          },
        ],
      },
      {
        id: 'dataset-types',
        title: 'Dataset types',
        blocks: [
          { type: 'p', text: 'When a dataset is created, one of two types is chosen:' },
          {
            type: 'defs',
            items: [
              { term: 'Dataset', desc: 'A standard dataset containing structured or unstructured data for public discovery, analysis and reuse.' },
              { term: 'Prompt Dataset', desc: 'A dataset of prompts and prompt-response examples, for AI training, evaluation and machine learning use.' },
            ],
          },
          { type: 'note', tone: 'note', text: 'The type cannot be changed after the draft has been created. A Prompt Dataset’s page adds a “Prompt Dataset details” section to its Metadata view.' },
        ],
      },
      {
        id: 'dataset-summary',
        title: 'The dataset summary',
        blocks: [
          {
            type: 'p',
            text: 'Every dataset page starts with the same summary card, whichever view you are on. It gathers what most people want to know before opening any file.',
          },
          { type: 'visual', visual: shot('dataset-detail', { alt: 'The top of a dataset page: the title, the Dataset download button and share button, the summary card and the four views.' }) },
          {
            type: 'list',
            items: [
              'The Data Card, “What this data tells us”, which summarises the dataset from its description.',
              'How the dataset is used: how many use cases it supports, how many collaboratives it is part of, and how many visualisations it powers. Each count is a link: use cases and collaboratives open the Applications view at that list, and visualisations opens the Visualisations view.',
              'Counts: records, downloads, data files and the file types.',
              'Sector, geography, licence, source, last updated date and the publisher.',
            ],
          },
          {
            type: 'p',
            text: 'The Dataset button downloads the dataset. The share button opens a menu to copy the link, download the Data Card as an image, or share to social networks and email.',
          },
          { type: 'note', tone: 'note', text: 'In the current prototype the download buttons show a “coming soon” message: file downloads are not connected yet.' },
        ],
      },
      {
        id: 'data-view',
        title: 'The Data view',
        blocks: [
          { type: 'p', text: 'Browse and preview the files in the dataset. Files are shown as a folder tree on the left; choose one to see it on the right.' },
          { type: 'visual', visual: shot('dataset-data', { alt: 'The Data view with the folder tree of files on the left and a preview table of the selected CSV on the right.' }) },
          {
            type: 'list',
            items: [
              'The selected file’s name, its path, type, size, number of rows and number of columns.',
              'A preview of the first rows of a tabular file, with each column’s type and its range or number of unique values.',
              'File details, for the file’s own title, description and metadata, and a Download button for that file.',
            ],
          },
        ],
      },
      {
        id: 'metadata-view',
        title: 'The Metadata view',
        blocks: [
          { type: 'visual', visual: shot('dataset-metadata', { alt: 'The Metadata view with the About this dataset section and the Dataset information grid.' }) },
          {
            type: 'defs',
            items: [
              { term: 'About this dataset', desc: 'The full description. The summary card’s Data Card draws on it.' },
              { term: 'Dataset information', desc: 'Sector, geography, publisher, the created and last-updated dates, the access type and the licence, with a link to the licence terms.' },
              { term: 'Source & Provenance', desc: 'The sources the dataset documents. A source is identified by its name, with its website when there is one.' },
              { term: 'About the publisher', desc: 'Who published the dataset.' },
            ],
          },
        ],
      },
      {
        id: 'visualisations-view',
        title: 'The Visualisations view',
        blocks: [
          { type: 'p', text: 'Charts and maps created from this dataset. Each card shows the chart, its title and the file it was built from. See Charts.' },
          { type: 'visual', visual: shot('dataset-visualisations', { alt: 'The Visualisations view with a line chart titled GDP Trend by Quarter.' }) },
        ],
      },
      {
        id: 'applications-view',
        title: 'The Applications view',
        blocks: [
          {
            type: 'p',
            text: 'Where this dataset is applied across CivicDataSpace. It lists the published use cases, collaboratives and events that use the dataset, each as the same card you see in Search, grouped under a heading with a count. A group appears only when something of that kind uses the dataset.',
          },
          { type: 'visual', visual: shot('dataset-applications', { alt: 'The Applications view of a dataset with its use cases listed as cards, followed by the collaboratives that include it.' }) },
          {
            type: 'list',
            items: [
              'Use cases: the stories that draw on the dataset.',
              'Collaboratives: the initiatives the dataset is connected to.',
              'Events: the events that list the dataset as a related resource.',
              'A line at the end links to the Visualisations view when charts have been built from the dataset.',
            ],
          },
          {
            type: 'p',
            text: 'Only published records are listed, and the numbers in the summary card come from the same relationships, so the two always agree. Publications are not listed here yet: a publication does not currently link to a dataset.',
          },
        ],
      },
      {
        id: 'licence-and-access',
        title: 'Licence and access',
        blocks: [
          {
            type: 'p',
            text: 'Each dataset has an access type, either open or restricted, and a licence. When the licence is “Other”, the contributor supplies a link to the licence document, and that link is shown as “View licence terms”.',
          },
        ],
      },
      {
        id: 'sources-and-publishers',
        title: 'Sources and publishers',
        blocks: [
          {
            type: 'p',
            text: 'A source describes where data originated or where it can be obtained. A publisher identifies the organisation or person responsible for publishing the dataset record on CivicDataSpace. These are distinct concepts.',
          },
          {
            type: 'note',
            tone: 'note',
            text: 'A dataset can document more than one source. The publisher is not entered as a source: it is the organisation workspace or the individual the record was published from.',
          },
        ],
      },
      {
        id: 'relationships',
        title: 'Dataset relationships',
        blocks: [
          {
            type: 'p',
            text: 'Datasets may be associated with use cases, charts and collaboratives. These relationships help users understand how data connects to applications, visual representations and initiatives. They show up in the summary card, and the contributor’s Review & Publish step lists the published content that uses a dataset.',
          },
        ],
      },
    ],
  },
  {
    slug: 'use-cases',
    title: 'Use Cases',
    group: 'platform-reference',
    intro:
      'Use cases describe applications of data to particular problems, needs, or objectives. They help users understand how datasets can support research, analysis, reporting, and public-interest work.',
    aliases: ['stories', 'applications', 'dashboard', 'sdg', 'contributors'],
    related: ['datasets', 'collaboratives', 'content-contribution'],
    sections: [
      {
        id: 'use-case-page',
        title: 'What a use case page shows',
        blocks: [
          { type: 'visual', visual: shot('usecase-detail', { alt: 'A use case page with its title, summary, publishing organisation, a share panel and a contents list beside the story.' }) },
          {
            type: 'list',
            items: [
              'A header with the title, a one-line summary, the organisation it is published by, where it applies and when it was published.',
              'The story, in sections. A panel beside it lists the contents so you can jump to a section, and offers sharing.',
              'Explore the data: an embedded dashboard, when the use case provides one.',
              'Datasets behind this story: the datasets it draws on, each a link.',
              'The contributors and organisations connected to the use case.',
            ],
          },
        ],
      },
      {
        id: 'use-case-information',
        title: 'Use case information',
        blocks: [
          { type: 'p', text: 'A use case may include:' },
          {
            type: 'list',
            items: [
              'A title, subtitle and thumbnail.',
              'Sectors, geographies, tags and the SDG goals it relates to.',
              'The story itself, written in content blocks (text, image, chart, highlight and link blocks).',
              'Associated datasets.',
              'A dashboard link, where one is provided.',
              'Contributors and associated organisations.',
              'Publication status (draft or published).',
            ],
          },
        ],
      },
      {
        id: 'relationship-with-datasets',
        title: 'Relationship with datasets',
        blocks: [
          { type: 'p', text: 'Datasets provide the underlying data, while use cases describe how that data is applied. Only published datasets can be connected to a use case.' },
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'A use case connects to datasets',
              layout: 'flow',
              nodes: [
                { label: 'Datasets', caption: 'Published datasets', next: 'connected to' },
                { label: 'Use case', caption: 'The application of that data' },
              ],
            },
          },
        ],
      },
      {
        id: 'discovering-use-cases',
        title: 'Discovering use cases',
        blocks: [
          {
            type: 'p',
            text: 'Open Use Cases from the Discover menu’s Stories group, browse the listing, and open individual records to understand their context, associated datasets, and available information.',
          },
        ],
      },
    ],
  },
  {
    slug: 'organisations-and-people',
    title: 'Organisations & People',
    group: 'platform-reference',
    intro:
      'CivicDataSpace includes organisation profiles and individual people associated with platform contributions. Organisations and people are separate entities.',
    aliases: ['community', 'publishers', 'directory', 'profile', 'contributor', 'attribution', 'affiliation', 'members'],
    related: ['collaboratives', 'dashboard-and-organisations'],
    sections: [
      {
        id: 'the-directory',
        title: 'The Community directory',
        blocks: [
          {
            type: 'p',
            text: 'Organisations and People are listed on the Community page, in two tabs that never overlap: an organisation is never listed under People, and a person is never listed under Organisations.',
          },
          { type: 'visual', visual: shot('community-organisations', { alt: 'The Community page on its Organisations tab, with the search field, the filters and organisation cards.' }) },
          {
            type: 'defs',
            items: [
              { term: 'Organisations', desc: 'Every organisation with a public profile, whether or not it has published anything.' },
              { term: 'People', desc: 'Individuals with at least one published contribution, affiliated with an organisation or publishing independently.' },
            ],
          },
          {
            type: 'p',
            text: 'Each tab has its own search, filters and sorting, and each tab’s count reflects its own records. Organisations can be filtered by type and by the content they publish; people by the content they publish and when they last published. A card shows the name, a short description, where they are based and, for organisations, how many people belong; its footer shows how many contributions have been published.',
          },
          { type: 'visual', visual: shot('community-people', { alt: 'The People tab of the Community page.' }) },
        ],
      },
      {
        id: 'organisation-profiles',
        title: 'Organisation profiles',
        blocks: [
          { type: 'p', text: 'An organisation profile provides information about an organisation and may connect it to relevant platform content.' },
          { type: 'visual', visual: shot('org-profile', { alt: 'An organisation profile with its logo, name, type and website, counts of its published content, an About section and its people.' }) },
          {
            type: 'list',
            items: [
              'The organisation’s name, type, location, website and logo.',
              'Counts of what it has published: datasets, use cases, publications, collaboratives, events and AI models.',
              'An About section with its description.',
              'The people who belong to it, each with a profile of their own.',
              'A way to ask to join the organisation.',
              'A tab for each kind of content it has published.',
            ],
          },
          { type: 'note', tone: 'note', text: 'An organisation can have a profile even if it has not published content on CivicDataSpace.' },
        ],
      },
      {
        id: 'people-profiles',
        title: 'People profiles',
        blocks: [
          {
            type: 'p',
            text: 'People represent individual contributors. A person may be affiliated with an organisation or contribute independently. A profile is labelled “Individual publisher”.',
          },
          { type: 'visual', visual: shot('person-profile', { alt: 'A person’s profile with their photo, name, headline, location, links elsewhere, organisations, areas of expertise and counts of what they have published.' }) },
          {
            type: 'list',
            items: [
              'Name, headline and location.',
              'Links to their profiles elsewhere (for example GitHub, LinkedIn or X), when they have provided them.',
              'The organisations they belong to, if any. A person who contributes independently shows none.',
              'An About section and areas of expertise.',
              'Counts of what they are credited on, and a tab for each kind of content.',
            ],
          },
        ],
      },
      {
        id: 'content-attribution',
        title: 'Content attribution',
        blocks: [
          {
            type: 'p',
            text: 'The individual who contributes a record, the organisation associated with it, and the publisher displayed on the record may represent different roles. They follow the information stored on the record and are not inferred.',
          },
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'Organisation, person and content',
              layout: 'hub',
              hub: { label: 'Published content', caption: 'A dataset, use case, collaborative or other record' },
              nodes: [
                { label: 'Organisation', caption: 'Has a profile and may have members' },
                { label: 'Person', caption: 'Affiliated with an organisation, or independent' },
                { label: 'Publisher shown on the record', caption: 'Taken from where the record was published' },
              ],
              caption: 'These are three separate relationships. A record can show one, two or all three.',
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'collaboratives',
    title: 'Collaboratives',
    group: 'platform-reference',
    intro: 'Collaboratives bring together related resources, people, and organisations around a shared initiative or area of work.',
    aliases: ['initiative', 'sdg', 'partners', 'ecosystem', 'connections', 'collaborate'],
    related: ['datasets', 'use-cases', 'organisations-and-people', 'content-contribution'],
    sections: [
      {
        id: 'the-page',
        title: 'What a collaborative page shows',
        blocks: [
          { type: 'visual', visual: shot('collaborative-detail', { alt: 'A collaborative page with its title and topics, the headline figures, the SDG goals and an image.' }) },
          {
            type: 'list',
            items: [
              'The collaborative’s name and the topics it covers.',
              'Three figures: how many people and organisations, datasets and use cases, and publications and events are connected.',
              'The SDG goals it works towards; hover over a goal for its title and statement.',
              'A Collaborate button, which goes to the initiative’s own website, and a share button for copying the link, downloading the page’s top section as an image, or sharing to social networks.',
              'A description, with the website, geography and last-updated date, and a diagram of the collaborative’s ecosystem.',
            ],
          },
        ],
      },
      {
        id: 'collaborative-information',
        title: 'Collaborative information',
        blocks: [
          { type: 'p', text: 'A collaborative may include:' },
          {
            type: 'list',
            items: [
              'A name, a page address, a description, an image and a website.',
              'Sectors, geographies, tags and the SDG goals it works towards.',
              'Associated people and organisations, each marked as a Contributor, Partner or Supporter.',
              'Connected datasets and use cases.',
              'Connected publications and events.',
              'Publication status (draft or published).',
            ],
          },
        ],
      },
      {
        id: 'explore-section',
        title: 'Exploring what is connected',
        blocks: [
          {
            type: 'p',
            text: 'The Explore section is one search for everything connected to the collaborative. Type to narrow every section at once, or use the chips to show one kind at a time. Below it, a section for each kind lists what is connected, in this order: Use Cases, Publications, Datasets, Events, Organisations and People.',
          },
          { type: 'visual', visual: shot('collaborative-explore', { alt: 'The Explore this collaborative section with its search field, the filter chips and the first row of use case cards.' }) },
          { type: 'p', text: 'A section appears only when something of that kind is connected. Organisations and people are shown as a moving set of pills, which can be paused.' },
        ],
      },
      {
        id: 'connections',
        title: 'Connections between resources',
        blocks: [
          {
            type: 'p',
            text: 'A collaborative provides a way to discover related resources in one place. Connecting existing published datasets, use cases, publications and events helps users explore what is associated with an initiative.',
          },
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'A collaborative as the context for its connections',
              layout: 'hub',
              hub: { label: 'Collaborative', caption: 'The shared initiative' },
              nodes: [{ label: 'Datasets' }, { label: 'Use cases' }, { label: 'Publications and events' }, { label: 'Organisations' }, { label: 'People' }],
            },
          },
        ],
      },
      {
        id: 'discovering-collaboratives',
        title: 'Discovering collaboratives',
        blocks: [
          {
            type: 'p',
            text: 'Open Collaboratives from the header, or from the Discover menu’s Stories group, which lists them in Search. Open a card to read the initiative’s page.',
          },
        ],
      },
    ],
  },
  {
    slug: 'ai-models',
    title: 'AI Models',
    group: 'platform-reference',
    intro: 'The AI Models section provides information about AI models available on CivicDataSpace, helping users understand what a model does and how it can be accessed.',
    aliases: ['model', 'versions', 'access', 'endpoint', 'api', 'language support'],
    related: ['content-contribution', 'publishing-lifecycle'],
    sections: [
      {
        id: 'model-page',
        title: 'What a model page shows',
        blocks: [
          { type: 'visual', visual: shot('aimodel-detail', { alt: 'An AI model’s page with its name and tags, description, purpose and audience, version and access details, language support, geography, tags and licence.' }) },
          {
            type: 'list',
            items: [
              'The model’s name, its type and the sectors it relates to, a description and a link to its website.',
              'Purpose & Audience: who it is for and what it is intended to be used for.',
              'Version & Access: the primary version, labelled Current, and its primary access method.',
              'The languages it supports, the geographies it applies to, tags and its usage licence.',
            ],
          },
          { type: 'note', tone: 'note', text: 'In the current prototype an AI model opens in the same view that contributors see when previewing it before publishing.' },
        ],
      },
      {
        id: 'model-information',
        title: 'Model information',
        blocks: [
          { type: 'p', text: 'A model record may include:' },
          {
            type: 'list',
            items: [
              'Name, model type and description.',
              'Domain, intended use and target users.',
              'Sectors, geographies, tags and supported languages.',
              'A website and a licence.',
              'Model versions and their access methods.',
              'Publication status (draft or published).',
            ],
          },
        ],
      },
      {
        id: 'model-versions',
        title: 'Model versions',
        blocks: [
          {
            type: 'p',
            text: 'A model can have multiple versions. Version information helps distinguish different releases or iterations of the same model. One version can be marked as the primary version. The model’s page shows the primary version, labelled “Current”.',
          },
        ],
      },
      {
        id: 'access-methods',
        title: 'Access methods',
        blocks: [
          {
            type: 'p',
            text: 'An access method describes how a particular model version can be accessed. A version may have more than one access method, and one of them can be marked as primary. The model’s page shows the primary version’s primary access method: its provider, the model identifier and the endpoint address, or “Access not configured yet” when none has been set up.',
          },
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'Model, versions and access methods',
              layout: 'flow',
              nodes: [
                { label: 'Model', caption: 'The record', next: 'has' },
                { label: 'Versions', caption: 'One can be primary', next: 'each has' },
                { label: 'Access methods', caption: 'One can be primary' },
              ],
            },
          },
        ],
      },
      {
        id: 'understanding-model-records',
        title: 'Understanding model records',
        blocks: [
          {
            type: 'note',
            tone: 'warning',
            title: 'A record is not a guarantee',
            text: 'The model record provides information about the model and its versions. It should not be read as a guarantee that an endpoint is operational or that access is available to every user.',
          },
        ],
      },
    ],
  },
  {
    slug: 'charts',
    title: 'Charts',
    group: 'platform-reference',
    intro:
      'Charts provide visual representations of data associated with a dataset. They help users interpret information and understand patterns without relying exclusively on tabular data.',
    aliases: ['visualisation', 'visualization', 'bar', 'line', 'pie', 'map', 'big number', 'upload image', 'live preview'],
    related: ['datasets', 'content-contribution', 'publishing-lifecycle'],
    sections: [
      {
        id: 'dataset-resource-chart',
        title: 'Dataset, resource, and chart relationship',
        blocks: [
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'Dataset, resource and chart',
              layout: 'flow',
              nodes: [
                { label: 'Dataset', caption: 'The record the chart belongs to', next: 'has' },
                { label: 'Resource', caption: 'The file the chart is built from', next: 'used by' },
                { label: 'Chart', caption: 'The visual representation' },
              ],
            },
          },
          {
            type: 'defs',
            items: [
              { term: 'Dataset', desc: 'The record to which the chart belongs.' },
              { term: 'Resource', desc: 'The specific file or data resource used to create the chart.' },
              { term: 'Chart', desc: 'The visual representation configured from that resource, or uploaded as an existing image.' },
            ],
          },
          { type: 'p', text: 'A chart is associated with one dataset. A dataset can contain multiple resources and multiple charts.' },
        ],
      },
      {
        id: 'where-charts-appear',
        title: 'Where charts appear',
        blocks: [
          { type: 'p', text: 'A published chart is shown on its dataset’s Visualisations view, with its title and the file it was built from. It is also counted in the dataset’s summary (“powers 1 visualisation”) and can be added to a use case’s story.' },
          { type: 'visual', visual: shot('dataset-visualisations', { alt: 'A dataset’s Visualisations view showing a published line chart.' }) },
        ],
      },
      {
        id: 'chart-types',
        title: 'Supported chart types',
        blocks: [
          {
            type: 'table',
            headers: ['Type', 'Use it to'],
            rows: [
              ['Bar', 'Compare values across categories.'],
              ['Line', 'Show change or trends over time.'],
              ['Pie', 'Show parts of a meaningful whole.'],
              ['Map', 'Show values by geography.'],
              ['Big Number', 'Highlight one key value.'],
              ['Upload Image', 'Add an externally created visualisation.'],
            ],
          },
        ],
      },
      {
        id: 'creating-charts',
        title: 'Creating charts',
        blocks: [
          { type: 'p', text: 'There are two approaches: build a chart from a dataset’s data, or upload an existing chart as an image.' },
          { type: 'visual', visual: shot('chart-build', { alt: 'The first step of building a chart, with the Data section listing the datasets you can choose from.' }) },
          {
            type: 'walkthrough',
            steps: [
              { title: 'Choose the data', text: 'In the Data section, pick one of your published datasets, then one of its files. Only tabular files can be charted.' },
              { title: 'Choose a chart type', text: 'In Chart Type, pick Bar, Line, Pie, Map or Big Number, or Upload Image to add an existing chart.' },
              { title: 'Configure it', text: 'In Configure, choose the fields to show. A Live Preview updates as you configure the chart.' },
              { title: 'Review and publish', text: 'Check the chart on the Review & Publish step, then publish it.' },
            ],
          },
        ],
      },
      {
        id: 'chart-management',
        title: 'Chart management',
        blocks: [
          {
            type: 'p',
            text: 'Charts are managed from the Charts area of the contributor dashboard. What you can do with a chart depends on whether it is a draft or published; see Publishing lifecycle.',
          },
        ],
      },
    ],
  },
]
