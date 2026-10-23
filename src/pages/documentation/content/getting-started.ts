import { shot } from '@/pages/documentation/content/shots'
import type { Article } from '@/pages/documentation/content/types'

export const GETTING_STARTED: Article[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    group: 'getting-started',
    intro:
      'CivicDataSpace is a platform for discovering and connecting datasets, use cases, organisations, people, collaboratives, and AI models related to civic and public-interest work.',
    aliases: ['overview', 'about', 'what is', 'getting started', 'welcome', 'glossary', 'terms', 'definitions'],
    related: ['navigating-the-platform', 'datasets', 'content-contribution'],
    sections: [
      {
        id: 'what-is-civicdataspace',
        title: 'What is CivicDataSpace?',
        blocks: [
          {
            type: 'p',
            text: 'CivicDataSpace provides a shared space where users can explore available data, understand how it is being used, discover related initiatives, and contribute resources to the broader ecosystem.',
          },
          {
            type: 'p',
            text: 'The platform is built around connections. A dataset is not just a file: it can feed a use case, appear in a chart, and belong to a collaborative. The organisation that published it and the people who worked on it have profiles of their own. Following those connections is how most people find what they are looking for.',
          },
          {
            type: 'visual',
            visual: {
              kind: 'diagram',
              title: 'How the main content types relate',
              layout: 'hub',
              hub: { label: 'Collaborative', caption: 'An initiative that brings related resources together' },
              nodes: [
                { label: 'Datasets', caption: 'The underlying data' },
                { label: 'Use cases', caption: 'How data is applied' },
                { label: 'Publications and events', caption: 'Related knowledge and gatherings' },
                { label: 'Organisations and people', caption: 'Who is involved' },
              ],
              caption:
                'A collaborative connects existing resources and the people and organisations behind them. Datasets also feed use cases and charts; AI models are published and discovered on their own.',
            },
          },
        ],
      },
      {
        id: 'content-types',
        title: 'The kinds of content',
        blocks: [
          { type: 'p', text: 'Everything on the platform is one of the following. Each has its own listing, its own detail pages, and its own contribution workflow.' },
          {
            type: 'table',
            headers: ['Content', 'What it is'],
            rows: [
              ['Dataset', 'A set of files with a description, sources, a licence and an access type. Can be a standard dataset or a Prompt Dataset.'],
              ['Use case', 'A story that shows how data is applied to a problem, with the datasets behind it.'],
              ['Collaborative', 'An initiative that connects datasets, use cases, publications, events, organisations and people.'],
              ['AI model', 'A model’s description, its versions and how each version can be accessed.'],
              ['Chart', 'A visualisation built from one of a dataset’s files, or uploaded as an image. Charts appear under their dataset’s Visualisations.'],
              ['Publication', 'A report, presentation or other supporting document.'],
              ['Event', 'A conference, workshop or other gathering, with its organisers, speakers and related resources.'],
              ['Organisation', 'A public profile for an organisation, which can publish content and have members.'],
              ['Person', 'An individual who has published content, whether or not they belong to an organisation.'],
            ],
          },
        ],
      },
      {
        id: 'what-can-you-do',
        title: 'What can you do on CivicDataSpace?',
        blocks: [
          {
            type: 'list',
            items: [
              'Discover datasets and explore their details and associated resources.',
              'Explore use cases and understand how data is applied.',
              'Find organisations and individual contributors associated with platform content.',
              'Discover collaboratives that connect related resources and contributors.',
              'Explore available AI model information.',
              'Contribute and manage content through supported workflows.',
            ],
          },
        ],
      },
      {
        id: 'who-is-it-for',
        title: 'Who is CivicDataSpace for?',
        blocks: [
          {
            type: 'list',
            items: [
              'Researchers and analysts exploring data.',
              'Government stakeholders and public-sector practitioners.',
              'Organisations publishing or managing data resources.',
              'Individual contributors.',
              'Practitioners exploring applications of data and AI.',
            ],
          },
        ],
      },
      {
        id: 'exploring-and-contributing',
        title: 'Exploring and contributing',
        blocks: [
          {
            type: 'p',
            text: 'Users can explore publicly available content without contributing. To create or manage content, sign in or register and use the available contributor features. Available actions depend on account permissions, content ownership, and the current workflow.',
          },
          {
            type: 'p',
            text: 'Content you create is public once you publish it. Until then it is a draft and is not publicly available.',
          },
        ],
      },
      {
        id: 'key-terms',
        title: 'Key terms',
        blocks: [
          { type: 'p', text: 'These terms are used consistently throughout the documentation and the platform. Several look alike but mean different things.' },
          {
            type: 'defs',
            items: [
              { term: 'Dataset record', desc: 'The description of a dataset: its name, sector, geography, sources, licence and access type.' },
              { term: 'Resource', desc: 'A file that belongs to a dataset.' },
              { term: 'Source', desc: 'Where the data originally came from. A dataset can document several.' },
              { term: 'Publisher', desc: 'The organisation or person the record was published from on CivicDataSpace. Not the same as a source.' },
              { term: 'Organisation', desc: 'A public profile for an organisation, with members and published content.' },
              { term: 'Person', desc: 'An individual contributor, affiliated with an organisation or independent.' },
              { term: 'Collaborative', desc: 'An initiative that connects existing resources, people and organisations.' },
              { term: 'Model version', desc: 'One release of an AI model. A model can have several; one can be primary.' },
              { term: 'Access method', desc: 'A way a model version can be accessed. A version can have several; one can be primary.' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'navigating-the-platform',
    title: 'Navigating the platform',
    group: 'getting-started',
    intro: 'Learn how to move through CivicDataSpace, discover resources, and access relevant content.',
    aliases: ['navigation', 'menu', 'search', 'discover', 'sign in', 'register', 'login', 'header', 'filters', 'breadcrumb', 'language'],
    related: ['introduction', 'datasets', 'content-contribution'],
    sections: [
      {
        id: 'main-navigation',
        title: 'Main navigation',
        blocks: [
          { type: 'p', text: 'The header runs across every page. It carries the platform’s main sections, a language picker, and the account button. Below it, a breadcrumb shows where you are and lets you step back.' },
          { type: 'visual', visual: shot('nav-header', { alt: 'The CivicDataSpace header with its logo, the Search, Discover, Collaboratives and More items, the language picker and the Log In / Sign Up button.' }) },
          {
            type: 'defs',
            items: [
              { term: 'Search', desc: 'Find content through the platform’s unified search, with a tab for each content type.' },
              {
                term: 'Discover',
                desc: 'A menu that groups content into Knowledge (Datasets, Publications, AI Models), Stories (Use Cases, Collaboratives) and Community (Events, People, Organisations).',
              },
              { term: 'Collaboratives', desc: 'A menu of featured initiatives that bring related resources and contributors together.' },
              { term: 'More', desc: 'Additional sections and information, including About Us, Contact, Privacy & Policy and Resources such as this documentation.' },
              { term: 'Language', desc: 'The language picker, an icon at the right of the header.' },
              { term: 'Log In / Sign Up', desc: 'The button at the right of the header for signing in or registering. Once you are signed in it is replaced by your account menu.' },
            ],
          },
        ],
      },
      {
        id: 'discover-menu',
        title: 'The Discover menu',
        blocks: [
          {
            type: 'p',
            text: 'Hover over or click Discover to open it. The groups on the left switch what the right-hand side lists; each item opens that content type in Search.',
          },
          { type: 'visual', visual: shot('nav-discover-menu', { alt: 'The open Discover menu with Knowledge, Stories and Community on the left and the Knowledge items on the right.' }) },
          {
            type: 'p',
            text: 'At the foot of the menu, “Contribute to CivicDataSpace” leads into the contributor features for people who want to share datasets, use cases and other resources.',
          },
        ],
      },
      {
        id: 'searching',
        title: 'Searching and filtering',
        blocks: [
          {
            type: 'p',
            text: 'Search is the platform’s one listing page. Type in the field and press Enter, or choose a tab to browse a single content type. Each tab shows how many records it holds, and the heading and description under the tabs name the type you are viewing.',
          },
          { type: 'visual', visual: shot('search-datasets', { alt: 'The Search page on its Datasets tab with the search field, the content type tabs, the filter rail, the sort control and dataset cards.' }) },
          {
            type: 'list',
            items: [
              'With nothing typed, Search suggests popular topics and popular searches to start from.',
              'The filter rail on the left changes with the type. Every tab can be filtered by when it was updated, and then by one more thing: Sector for datasets and AI models, SDG goals for use cases and collaboratives, resource type for publications and event type for events. Each option shows how many records match.',
              'Sort changes the order (for example, by relevance), and the toggle beside it switches between list and grid views.',
              'A tab can offer a button for contributing that kind of content; the Datasets tab, for example, has Contribute Dataset.',
              '“Close search” returns you to the page you came from.',
            ],
          },
          {
            type: 'note',
            tone: 'note',
            text: 'Which filters appear depends on the content type and on what the current results contain. An option that matches nothing is not shown.',
          },
        ],
      },
      {
        id: 'detail-pages',
        title: 'Opening a record',
        blocks: [
          {
            type: 'p',
            text: 'Click a card to open the record’s detail page. A Back link and the breadcrumb take you to where you came from. What a detail page shows depends on the content type:',
          },
          {
            type: 'table',
            headers: ['Content', 'The page shows'],
            rows: [
              ['Dataset', 'A summary card, then four views: Data (the files and a preview), Visualisations (its charts), Metadata (description, details, sources and publisher) and Applications (the use cases, collaboratives and events that use it).'],
              ['Use case', 'A title and summary, the story in sections, an embedded dashboard where one is provided, and the datasets behind it.'],
              ['Collaborative', 'Headline figures, the SDG goals it works towards, a description, and one search across everything connected to it.'],
              ['AI model', 'What the model does, who it is for, its versions and how each can be accessed.'],
              ['Organisation or person', 'A profile with counts, an About section and a tab for each kind of content they have published.'],
            ],
          },
        ],
      },
      {
        id: 'community',
        title: 'Finding organisations and people',
        blocks: [
          {
            type: 'p',
            text: 'Organisations and People are under Discover, in the Community group. They open the Community page, which lists them in two tabs. See Organisations & People for how the two relate.',
          },
        ],
      },
      {
        id: 'signing-in',
        title: 'Signing in and contributing',
        blocks: [
          { type: 'p', text: 'Use Log In / Sign Up in the header to sign in or register, and gain access to the available contribution and management features.' },
          { type: 'visual', visual: shot('auth-sign-in', { alt: 'The sign-in page.' }) },
          {
            type: 'p',
            text: 'Once you are signed in, the Dashboard is where you create and manage content. See Content contribution and Dashboard & organisations.',
          },
        ],
      },
    ],
  },
]
