import { DocSection, PropsTable } from '@/pages/design-system/docs/primitives'
import { ResponsiveBehaviourSection } from '@/pages/design-system/ResponsiveBehaviourSection'
import { ResponsivePlayground } from '@/pages/design-system/ResponsivePlayground'

/** Responsive behaviour and the components that need live app data. */

export function ResponsiveBehaviourPage() {
  return (
    <DocSection id="behaviour" title="Behaviour" description="How the existing components adapt across the existing breakpoints, demonstrated with the real prototype.">
      <ResponsiveBehaviourSection />
    </DocSection>
  )
}

export function ResponsivePlaygroundPage() {
  return (
    <DocSection id="playground" title="Playground" description="Compare live components and page compositions across representative viewport widths.">
      <ResponsivePlayground />
    </DocSection>
  )
}

export function ReferenceOnlyPage() {
  return (
    <>
      <DocSection
        id="management-table"
        title="ManagementTable"
        description="src/components/shared/management-table/: the sortable, responsive list table behind every module’s index page. It works out column fit in JavaScript with useBreakpointUp('md') and ('lg') and scrolls horizontally below the combined minimum width."
      >
        <PropsTable
          rows={[
            { name: 'columns', type: 'ColumnDef[]', description: 'Header, accessor, width class, and priority for the responsive drop.' },
            { name: 'rows', type: 'T[]', description: 'The row data.' },
            { name: 'onRowClick', type: '(row) => void', description: 'Navigates to the item.' },
            { name: 'sort / onSortChange', type: 'controlled', description: 'The active sort key and direction.' },
          ]}
        />
      </DocSection>
      <DocSection
        id="dataset-connections-card"
        title="DatasetConnectionsCard"
        description="A card wrapping SearchableSelect, StatusBadge and EmptyState to link datasets to an event or use case. It reads the dataset list from AppDataContext."
      >
        <PropsTable
          rows={[
            { name: 'datasets', type: 'ConnectedDataset[]', description: 'The currently linked datasets.' },
            { name: 'onChange', type: '(datasets) => void', description: 'Add or remove a link.' },
            { name: 'parentLabel', type: 'string', description: '“this event” or “this Use Case”, used in copy and toasts.' },
          ]}
        />
      </DocSection>
      <DocSection id="organisation-search-field" title="OrganisationSearchField" description="A popover typeahead over an Organisation list, excluding the ids already selected.">
        <PropsTable
          rows={[
            { name: 'organisations', type: 'Organisation[]', description: 'The searchable pool.' },
            { name: 'excludeIds', type: 'string[]', description: 'Ids already picked.' },
            { name: 'onSelect', type: '(org) => void', description: 'Commit a choice.' },
          ]}
        />
      </DocSection>
      <DocSection
        id="resource-preview-dialog"
        title="ResourcePreviewDialog"
        description="A read-only preview of one uploaded resource: an image or PDF render, or an EmptyState for types with no inline render. It never mutates or replaces the upload."
      >
        <PropsTable
          rows={[
            { name: 'resource', type: 'PreviewResource', description: 'Normalised with assetToPreviewResource(asset, title?).' },
            { name: 'open / onOpenChange', type: 'controlled', description: 'Dialog visibility.' },
          ]}
        />
      </DocSection>
    </>
  )
}
