/** Real screenshots of the prototype, captured from the running app at 1440px wide. Each has numbered callouts (positions in percent of the
 *  image) whose labels are explained under the picture. To refresh one, re-capture it and replace the file and its entry here. */

import type { Callout } from '@/pages/documentation/content/types'

import aimodelDetailImg from '@/assets/documentation/aimodel-detail.jpg'
import aimodelInfoImg from '@/assets/documentation/aimodel-info.jpg'
import aimodelVersionsImg from '@/assets/documentation/aimodel-versions.jpg'
import authSignInImg from '@/assets/documentation/auth-sign-in.jpg'
import chartBuildImg from '@/assets/documentation/chart-build.jpg'
import collabAboutImg from '@/assets/documentation/collab-about.jpg'
import collabConnectionsImg from '@/assets/documentation/collab-connections.jpg'
import collabReviewImg from '@/assets/documentation/collab-review.jpg'
import collaborativeDetailImg from '@/assets/documentation/collaborative-detail.jpg'
import collaborativeExploreImg from '@/assets/documentation/collaborative-explore.jpg'
import communityOrganisationsImg from '@/assets/documentation/community-organisations.jpg'
import communityPeopleImg from '@/assets/documentation/community-people.jpg'
import dashDatasetsImg from '@/assets/documentation/dash-datasets.jpg'
import dashHomeImg from '@/assets/documentation/dash-home.jpg'
import datasetApplicationsImg from '@/assets/documentation/dataset-applications.jpg'
import datasetDataImg from '@/assets/documentation/dataset-data.jpg'
import datasetDetailImg from '@/assets/documentation/dataset-detail.jpg'
import datasetMetadataImg from '@/assets/documentation/dataset-metadata.jpg'
import datasetStepFilesImg from '@/assets/documentation/dataset-step-files.jpg'
import datasetStepMetadataImg from '@/assets/documentation/dataset-step-metadata.jpg'
import datasetStepReviewImg from '@/assets/documentation/dataset-step-review.jpg'
import datasetTypeDialogImg from '@/assets/documentation/dataset-type-dialog.jpg'
import datasetVisualisationsImg from '@/assets/documentation/dataset-visualisations.jpg'
import editPublishedReviewImg from '@/assets/documentation/edit-published-review.jpg'
import editPublishedImg from '@/assets/documentation/edit-published.jpg'
import navDiscoverMenuImg from '@/assets/documentation/nav-discover-menu.jpg'
import navHeaderImg from '@/assets/documentation/nav-header.jpg'
import orgDashboardImg from '@/assets/documentation/org-dashboard.jpg'
import orgMembersImg from '@/assets/documentation/org-members.jpg'
import orgProfileImg from '@/assets/documentation/org-profile.jpg'
import orgSelectorImg from '@/assets/documentation/org-selector.jpg'
import personProfileImg from '@/assets/documentation/person-profile.jpg'
import reviewPublishButtonImg from '@/assets/documentation/review-publish-button.jpg'
import searchDatasetsImg from '@/assets/documentation/search-datasets.jpg'
import unpublishDialogImg from '@/assets/documentation/unpublish-dialog.jpg'
import usecaseBuilderImg from '@/assets/documentation/usecase-builder.jpg'
import usecaseConnectImg from '@/assets/documentation/usecase-connect.jpg'
import usecaseDetailImg from '@/assets/documentation/usecase-detail.jpg'

export interface Shot {
  src: string
  title: string
  aspect: string
  callouts: Callout[]
}

export const SHOTS = {
  'aimodel-detail': { src: aimodelDetailImg, title: "An AI model’s page", aspect: '1440 / 1100', callouts: [] },
  'aimodel-info': { src: aimodelInfoImg, title: "AI model: Model Information", aspect: '1440 / 1200', callouts: [{"n": 1, "x": 51.53, "y": 27.17, "label": "Describe the model"}] },
  'aimodel-versions': { src: aimodelVersionsImg, title: "AI model: Versions", aspect: '1440 / 1200', callouts: [{"n": 1, "x": 19.38, "y": 27.83, "label": "The stepper: Versions, Model Information, Review & Publish"}, {"n": 2, "x": 21.18, "y": 43.42, "label": "Add a version; one is marked Primary"}, {"n": 3, "x": 27.98, "y": 37.5, "label": "The primary version"}] },
  'auth-sign-in': { src: authSignInImg, title: "The sign-in page", aspect: '1440 / 900', callouts: [] },
  'chart-build': { src: chartBuildImg, title: "Chart: Build", aspect: '1440 / 1200', callouts: [{"n": 1, "x": 19.38, "y": 27.83, "label": "The stepper: Build, Review & Publish"}, {"n": 2, "x": 22.64, "y": 38.04, "label": "Choose a dataset, then one of its files"}] },
  'collab-about': { src: collabAboutImg, title: "Collaborative: About", aspect: '1440 / 1200', callouts: [{"n": 1, "x": 19.38, "y": 31.08, "label": "The stepper: About, Connections, Review & Publish"}, {"n": 2, "x": 22.64, "y": 75.21, "label": "Name and page address"}, {"n": 3, "x": 21.18, "y": 20.42, "label": "Public once published"}] },
  'collab-connections': { src: collabConnectionsImg, title: "Collaborative: Connections", aspect: '1440 / 1200', callouts: [{"n": 1, "x": 22.64, "y": 39.42, "label": "People and organisations, with Add New for anyone not listed"}, {"n": 2, "x": 85.21, "y": 40.42, "label": "Add someone who is not listed yet"}, {"n": 3, "x": 22.64, "y": 68.5, "label": "Resources: search, or Add Resource"}, {"n": 4, "x": 82.93, "y": 69.5, "label": "Create a dataset or publication and connect it"}] },
  'collab-review': { src: collabReviewImg, title: "Collaborative: Review & Publish", aspect: '1440 / 1000', callouts: [{"n": 1, "x": 83.68, "y": 37.3, "label": "The last step"}, {"n": 2, "x": 42.22, "y": 98.6, "label": "Open the preview, and publish from there"}] },
  'collaborative-detail': { src: collaborativeDetailImg, title: "A collaborative page", aspect: '1440 / 1000', callouts: [{"n": 1, "x": 3.33, "y": 35.5, "label": "Name and topics"}] },
  'collaborative-explore': { src: collaborativeExploreImg, title: "The Explore section of a collaborative", aspect: '1440 / 1000', callouts: [{"n": 1, "x": 1.67, "y": 27.88, "label": "One search for everything connected"}] },
  'community-organisations': { src: communityOrganisationsImg, title: "The Community directory, Organisations tab", aspect: '1440 / 900', callouts: [{"n": 1, "x": 26.25, "y": 25.33, "label": "The two tabs: Organisations and People"}, {"n": 2, "x": 3.13, "y": 21.33, "label": "Search this tab"}, {"n": 3, "x": 1.67, "y": 51, "label": "Filters for this tab"}, {"n": 4, "x": 84.46, "y": 52, "label": "Sort, and the grid / list toggle"}] },
  'community-people': { src: communityPeopleImg, title: "The Community directory, People tab", aspect: '1440 / 900', callouts: [{"n": 1, "x": 73.75, "y": 25.33, "label": "People who have published at least once"}, {"n": 2, "x": 29.5, "y": 78.87, "label": "A person’s card, with their organisation"}] },
  'dash-datasets': { src: dashDatasetsImg, title: "Datasets in the dashboard", aspect: '1440 / 900', callouts: [{"n": 1, "x": 2.57, "y": 28.89, "label": "Contribution: a list for each content type"}, {"n": 2, "x": 83.84, "y": 21.67, "label": "Start a new dataset"}, {"n": 3, "x": 24.49, "y": 32.33, "label": "Tabs: All, Draft and Published, with counts"}, {"n": 4, "x": 72.71, "y": 51.28, "label": "A record’s status"}, {"n": 5, "x": 95.3, "y": 43.5, "label": "Unpublish a published record"}, {"n": 6, "x": 94.79, "y": 54.17, "label": "Delete a draft"}] },
  'dash-home': { src: dashHomeImg, title: "The dashboard", aspect: '1440 / 900', callouts: [{"n": 1, "x": 6.67, "y": 81.89, "label": "My Workspace: your individual contributions"}, {"n": 2, "x": 52.5, "y": 23.44, "label": "Organisation Workspace: contribute for an organisation"}, {"n": 3, "x": 52.5, "y": 43.67, "label": "Continue Working: drafts and unpublished edits"}] },
  'dataset-applications': { src: datasetApplicationsImg, title: "The Applications view", aspect: '1440 / 1000', callouts: [{"n": 1, "x": 1.67, "y": 13.56, "label": "Where this dataset is applied"}, {"n": 2, "x": 1.67, "y": 21.76, "label": "Published use cases that use the dataset"}, {"n": 3, "x": 1.67, "y": 65.64, "label": "Collaboratives it is part of"}] },
  'dataset-data': { src: datasetDataImg, title: "The Data view", aspect: '1440 / 640', callouts: [{"n": 1, "x": 1.67, "y": 25.4, "label": "The dataset’s files, as a folder tree"}, {"n": 2, "x": 29.25, "y": 46.96, "label": "A preview of the selected file’s first rows"}, {"n": 3, "x": 77.94, "y": 34.93, "label": "File details, and a download for this file"}] },
  'dataset-detail': { src: datasetDetailImg, title: "A dataset detail page", aspect: '1440 / 1000', callouts: [{"n": 1, "x": 3.33, "y": 29.78, "label": "Dataset name"}, {"n": 2, "x": 83.42, "y": 18.6, "label": "Download the dataset"}, {"n": 3, "x": 95.69, "y": 16, "label": "Share menu: copy link, Download Data Card, social links"}, {"n": 4, "x": 5.56, "y": 39.96, "label": "The Data Card, summarised from the description"}, {"n": 5, "x": 5.69, "y": 68.96, "label": "Sector and geography"}, {"n": 6, "x": 5.69, "y": 79.36, "label": "Licence, source, last updated and publisher"}, {"n": 7, "x": 4.96, "y": 88.76, "label": "The four views: Data, Visualisations, Metadata and Applications"}] },
  'dataset-metadata': { src: datasetMetadataImg, title: "The Metadata view", aspect: '1440 / 640', callouts: [{"n": 1, "x": 3.13, "y": 23.84, "label": "The full description"}, {"n": 2, "x": 3.13, "y": 64.7, "label": "Sector, geography, publisher, dates, access and licence"}, {"n": 3, "x": 67.85, "y": 83.76, "label": "Open or restricted access"}, {"n": 4, "x": 23.51, "y": 96.56, "label": "The licence, with a link to its terms"}] },
  'dataset-step-files': { src: datasetStepFilesImg, title: "Dataset: Data Files", aspect: '1440 / 900', callouts: [{"n": 1, "x": 18.82, "y": 39.44, "label": "The stepper: Data Files, Metadata, Review & Publish"}, {"n": 2, "x": 84.08, "y": 21, "label": "Save status"}, {"n": 3, "x": 21.53, "y": 52.11, "label": "Upload files directly …"}, {"n": 4, "x": 57.92, "y": 52.11, "label": "… or import from Kaggle, GitHub or Hugging Face"}] },
  'dataset-step-metadata': { src: datasetStepMetadataImg, title: "Dataset: Metadata", aspect: '1440 / 1700', callouts: [{"n": 1, "x": 51.53, "y": 22.41, "label": "The Metadata step"}, {"n": 2, "x": 22.64, "y": 33.09, "label": "Name, description, sector, geography and tags"}, {"n": 3, "x": 84.01, "y": 75.82, "label": "Document where the data came from"}, {"n": 4, "x": 22.64, "y": 99.18, "label": "Licence and access type"}] },
  'dataset-step-review': { src: datasetStepReviewImg, title: "Dataset: Review & Publish", aspect: '1440 / 1100', callouts: [{"n": 1, "x": 83.68, "y": 33.91, "label": "The last step"}, {"n": 2, "x": 42.22, "y": 98.73, "label": "Disabled until everything required is complete"}] },
  'dataset-type-dialog': { src: datasetTypeDialogImg, title: "Choosing the dataset type", aspect: '1440 / 900', callouts: [{"n": 1, "x": 37.36, "y": 37.89, "label": "A standard dataset"}, {"n": 2, "x": 37.36, "y": 52.33, "label": "A dataset of prompts and responses"}, {"n": 3, "x": 32.85, "y": 65.11, "label": "The type is fixed once the draft exists"}] },
  'dataset-visualisations': { src: datasetVisualisationsImg, title: "The Visualisations view", aspect: '1440 / 560', callouts: [{"n": 1, "x": 1.67, "y": 29.03, "label": "Charts and maps made from this dataset"}, {"n": 2, "x": 2.85, "y": 84.21, "label": "A chart, with the file it was built from"}] },
  'edit-published-review': { src: editPublishedReviewImg, title: "Review & Publish for a published dataset", aspect: '1440 / 1100', callouts: [{"n": 1, "x": 85.49, "y": 32.27, "label": "Every section can be edited again from here"}] },
  'edit-published': { src: editPublishedImg, title: "Editing a published dataset", aspect: '1440 / 900', callouts: [{"n": 1, "x": 21.18, "y": 27.22, "label": "Live on CivicDataSpace: the public sees the published version"}, {"n": 2, "x": 84.08, "y": 21, "label": "Save status"}] },
  'nav-discover-menu': { src: navDiscoverMenuImg, title: "The Discover menu", aspect: '1440 / 520', callouts: [{"n": 1, "x": 19.51, "y": 27.69, "label": "Knowledge: Datasets, Publications, AI Models"}, {"n": 2, "x": 19.51, "y": 37.31, "label": "Stories: Use Cases, Collaboratives"}, {"n": 3, "x": 19.51, "y": 46.92, "label": "Community: Events, People, Organisations"}, {"n": 4, "x": 69.45, "y": 83.46, "label": "Contribute to the platform"}] },
  'nav-header': { src: navHeaderImg, title: "The platform header", aspect: '1440 / 130', callouts: [{"n": 1, "x": 36.78, "y": 16.92, "label": "Search"}, {"n": 2, "x": 43.86, "y": 16.92, "label": "Discover menu"}, {"n": 3, "x": 54, "y": 16.92, "label": "Collaboratives menu"}, {"n": 4, "x": 63.09, "y": 16.92, "label": "More menu"}, {"n": 5, "x": 85, "y": 13.85, "label": "Language picker"}, {"n": 6, "x": 92.43, "y": 12.31, "label": "Log In / Sign Up"}] },
  'org-dashboard': { src: orgDashboardImg, title: "An organisation workspace", aspect: '1440 / 900', callouts: [{"n": 1, "x": 2.57, "y": 28.89, "label": "Overview"}, {"n": 2, "x": 2.57, "y": 39.67, "label": "The same content types, for the organisation"}, {"n": 3, "x": 5.35, "y": 86.44, "label": "Members, roles and invitations"}, {"n": 4, "x": 2.29, "y": 93.67, "label": "Switch to another organisation"}] },
  'org-members': { src: orgMembersImg, title: "Admin & Members", aspect: '1440 / 900', callouts: [] },
  'org-profile': { src: orgProfileImg, title: "An organisation profile", aspect: '1440 / 1000', callouts: [{"n": 1, "x": 3.33, "y": 44.5, "label": "Organisation name, type and location"}] },
  'org-selector': { src: orgSelectorImg, title: "My Organisations", aspect: '1440 / 900', callouts: [{"n": 1, "x": 11.59, "y": 11.78, "label": "Choose the organisation to work in"}] },
  'person-profile': { src: personProfileImg, title: "A person’s profile", aspect: '1440 / 1000', callouts: [{"n": 1, "x": 3.33, "y": 46.15, "label": "Name and headline"}] },
  'review-publish-button': { src: reviewPublishButtonImg, title: "The publish button", aspect: '1440 / 900', callouts: [{"n": 1, "x": 42.22, "y": 73.54, "label": "Replaces the public version with your edits"}] },
  'search-datasets': { src: searchDatasetsImg, title: "Search on the Datasets tab", aspect: '1440 / 900', callouts: [{"n": 1, "x": 3.13, "y": 21.78, "label": "Search field"}, {"n": 2, "x": 15.61, "y": 25.78, "label": "A tab for each content type, with its count"}, {"n": 3, "x": 1.67, "y": 51.44, "label": "Filters for the type you are viewing"}, {"n": 4, "x": 81.45, "y": 52.44, "label": "Sort order, and the list / grid toggle beside it"}, {"n": 5, "x": 23.94, "y": 60, "label": "A dataset card: open it for the detail page"}] },
  'unpublish-dialog': { src: unpublishDialogImg, title: "Unpublishing a record", aspect: '1440 / 900', callouts: [{"n": 1, "x": 55.8, "y": 56.94, "label": "Confirm: the record moves back to Draft"}] },
  'usecase-builder': { src: usecaseBuilderImg, title: "Use case: Builder", aspect: '1440 / 1200', callouts: [{"n": 1, "x": 19.38, "y": 27.83, "label": "The stepper: Builder, Connect, Review & Publish"}, {"n": 2, "x": 22.64, "y": 42.96, "label": "Thumbnail, title and subtitle"}, {"n": 3, "x": 22.64, "y": 91.08, "label": "The story, built from content blocks"}] },
  'usecase-connect': { src: usecaseConnectImg, title: "Use case: Connect", aspect: '1440 / 1200', callouts: [{"n": 1, "x": 51.53, "y": 27.83, "label": "The Connect step"}] },
  'usecase-detail': { src: usecaseDetailImg, title: "A use case detail page", aspect: '1440 / 900', callouts: [{"n": 1, "x": 8.89, "y": 36.5, "label": "Title and one-line summary"}, {"n": 2, "x": 11.81, "y": 57.36, "label": "The organisation it is published by"}, {"n": 3, "x": 10.35, "y": 82.55, "label": "Share the use case"}, {"n": 4, "x": 10.35, "y": 95.11, "label": "Contents of the story"}, {"n": 5, "x": 10.35, "y": 98.27, "label": "The story, written in content blocks"}] },
} satisfies Record<string, Shot>

export type ShotKey = keyof typeof SHOTS
