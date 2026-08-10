import { useEffect, useRef, useState } from 'react'

import { TopNav } from '@/components/layout/TopNav'
import { BreadcrumbBar } from '@/components/layout/BreadcrumbBar'
import { ContributorSidebar } from '@/components/layout/ContributorSidebar'
import { Card } from '@/components/ui/card'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { ProgressStepper, type WizardStep } from '@/components/dataset/ProgressStepper'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { Step1Metadata } from '@/components/dataset/Step1Metadata'
import { Step2DataFiles } from '@/components/dataset/Step2DataFiles'
import { Step3Review } from '@/components/dataset/Step3Review'
import { DatasetListView } from '@/components/dataset/DatasetListView'
import { validateMetadata, isMetadataValid } from '@/lib/validation'
import { formatTimestamp } from '@/lib/format'
import { MOCK_DATASETS } from '@/lib/mock-datasets'
import { emptyDatasetForm, type DatasetFormState, type DatasetMetadata, type DatasetRecord } from '@/types/dataset'

type View = 'list' | 'create'

let recordIdCounter = 0

function App() {
  const [view, setView] = useState<View>('list')
  const [datasets, setDatasets] = useState<DatasetRecord[]>(MOCK_DATASETS)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [step, setStep] = useState<WizardStep>(1)
  const [form, setForm] = useState<DatasetFormState>(emptyDatasetForm)
  const [showMetadataErrors, setShowMetadataErrors] = useState(false)
  const [saved, setSaved] = useState(true)

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setSaved(false)
    const timeout = setTimeout(() => setSaved(true), 700)
    return () => clearTimeout(timeout)
  }, [form])

  const metadataErrors = validateMetadata(form.metadata)
  const visibleMetadataErrors = showMetadataErrors ? metadataErrors : {}

  const updateMetadata = <K extends keyof DatasetMetadata>(field: K, value: DatasetMetadata[K]) => {
    setForm((prev) => ({ ...prev, metadata: { ...prev.metadata, [field]: value } }))
  }

  const handleAddDataset = () => {
    setEditingId(null)
    setForm(emptyDatasetForm)
    setShowMetadataErrors(false)
    setStep(1)
    setView('create')
  }

  const openDataset = (id: string, initialStep: WizardStep) => {
    const record = datasets.find((d) => d.id === id)
    if (!record) return
    setEditingId(record.id)
    setForm(record.form)
    setShowMetadataErrors(false)
    setStep(initialStep)
    setView('create')
  }

  const handleViewDataset = (id: string) => openDataset(id, 3)
  const handleEditDataset = (id: string) => openDataset(id, 1)

  const handleDeleteDataset = (id: string) => {
    const record = datasets.find((d) => d.id === id)
    if (!record) return
    const name = record.form.metadata.name || 'this dataset'
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDatasets((prev) => prev.filter((d) => d.id !== id))
  }

  const handleCloseWorkspace = () => {
    setView('list')
  }

  const handleContinueFromMetadata = () => {
    if (!isMetadataValid(form.metadata)) {
      setShowMetadataErrors(true)
      return
    }
    setShowMetadataErrors(false)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinueFromFiles = () => {
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const upsertDataset = (status: DatasetRecord['status']) => {
    const updatedAt = formatTimestamp(new Date())
    const id = editingId ?? `local-${(recordIdCounter += 1)}`
    setDatasets((prev) => {
      const exists = prev.some((d) => d.id === id)
      if (exists) {
        return prev.map((d) => (d.id === id ? { ...d, status, updatedAt, form } : d))
      }
      return [{ id, status, updatedAt, form }, ...prev]
    })
    if (!editingId) setEditingId(id)
  }

  const handleSaveDraft = () => {
    setSaved(false)
    upsertDataset('draft')
    setTimeout(() => setSaved(true), 500)
  }

  const handlePublish = () => {
    if (!isMetadataValid(form.metadata)) {
      setShowMetadataErrors(true)
      setStep(1)
      return
    }
    upsertDataset('published')
    window.alert('Dataset published. It is now publicly available on CivicDataSpace.')
    setView('list')
  }

  return (
    <div className="min-h-screen">
      <TopNav />
      <BreadcrumbBar />

      <main className="mx-auto flex max-w-[1760px] flex-col gap-6 px-10 py-8 md:flex-row">
        <ContributorSidebar active="datasets" onSelectDatasets={() => setView('list')} />

        <div className="min-w-0 flex-1">
          {view === 'list' ? (
            <DatasetListView
              datasets={datasets}
              onAddDataset={handleAddDataset}
              onViewDataset={handleViewDataset}
              onEditDataset={handleEditDataset}
              onDeleteDataset={handleDeleteDataset}
            />
          ) : (
            <Card>
              <WorkspaceHeader
                saved={saved}
                onClose={handleCloseWorkspace}
                title={editingId ? form.metadata.name || 'Untitled Dataset' : 'New Dataset'}
              />
              <div className="border-t border-border px-6 py-6">
                <ProgressStepper currentStep={step} />
              </div>
              <div className="border-t border-border px-6 py-6">
                {step === 1 && (
                  <Step1Metadata
                    metadata={form.metadata}
                    errors={visibleMetadataErrors}
                    onChange={updateMetadata}
                  />
                )}
                {step === 2 && (
                  <Step2DataFiles
                    files={form.files}
                    onFilesAdd={(newFiles) =>
                      setForm((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }))
                    }
                    onFileRemove={(id) =>
                      setForm((prev) => ({ ...prev, files: prev.files.filter((f) => f.id !== id) }))
                    }
                    enablePreview={form.enablePreview}
                    onTogglePreview={(value) => setForm((prev) => ({ ...prev, enablePreview: value }))}
                  />
                )}
                {step === 3 && (
                  <Step3Review
                    form={form}
                    canPublish={isMetadataValid(form.metadata)}
                    onEditMetadata={() => setStep(1)}
                    onPublish={handlePublish}
                  />
                )}
              </div>
              <div className="border-t border-border">
                <WizardFooter
                  showPrevious={step > 1}
                  showContinue={step < 3}
                  onPrevious={handlePrevious}
                  onContinue={step === 1 ? handleContinueFromMetadata : handleContinueFromFiles}
                  onSaveDraft={handleSaveDraft}
                />
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
