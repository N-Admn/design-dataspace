import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ListChecks, Sparkles } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { ChartStep1Build } from '@/components/chart/ChartStep1Build'
import { ChartStep2Review } from '@/components/chart/ChartStep2Review'
import { ChartPublishSuccessModal } from '@/components/chart/ChartPublishSuccessModal'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { OrganisationContextBanner } from '@/components/organisation/OrganisationContextBanner'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { getFileColumns } from '@/lib/chart-data'
import type { UploadedAsset } from '@/lib/generic-upload'
import { validateChartBuild } from '@/lib/chart-validation'
import { hasUnsavedEdits } from '@/lib/content-status'
import { emptyChartConfig, emptyChartForm, type ChartConfig, type ChartFormState, type ChartType } from '@/types/chart'

type ChartStep = 1 | 2

const CHART_STEPS = [
  { step: 1, label: 'Build', description: 'Choose data and build your chart', icon: Sparkles },
  { step: 2, label: 'Review & Publish', description: 'Check readiness', icon: ListChecks },
]

interface ChartNavState {
  chartId?: string
  initialStep?: ChartStep
  organisationId?: string
  returnTo?: string
}

function ChartCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { charts, upsertChart, organisationWorkspaces } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()
  const confirm = useConfirm()

  const navState = (location.state as ChartNavState | null) ?? null
  const resumeRecord = navState?.chartId ? charts.find((c) => c.id === navState.chartId) : undefined
  const organisationId = navState?.organisationId
  const returnTo = navState?.returnTo ?? '/dashboard/charts'
  const organisation = organisationId ? organisationWorkspaces.find((o) => o.id === organisationId) : undefined

  const [editingId, setEditingId] = useState<string | null>(resumeRecord?.id ?? null)
  const [step, setStep] = useState<ChartStep>(navState?.initialStep === 2 ? 2 : 1)
  const [form, setForm] = useState<ChartFormState>(resumeRecord?.form ?? emptyChartForm)
  const [lastSavedForm, setLastSavedForm] = useState<ChartFormState>(resumeRecord?.form ?? form)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showBuildErrors, setShowBuildErrors] = useState(false)
  const [publishState, setPublishState] = useState<'idle' | 'checking' | 'publishing'>('idle')
  const [justPublished, setJustPublished] = useState(false)
  // Stepper is a progress indicator until Review is reached with every step valid.
  const [stepperUnlocked, setStepperUnlocked] = useState(false)

  const stepLabel = CHART_STEPS.find((s) => s.step === step)?.label ?? 'Build'
  useEffect(() => {
    setContextLabel(`Charts → ${stepLabel}`)
  }, [stepLabel, setContextLabel])

  const hasUnsavedChanges = hasUnsavedEdits(form, lastSavedForm)

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

  const columns = form.datasetId ? getFileColumns(form.datasetId) : []
  const buildErrors = validateChartBuild(form, columns)
  const otherCharts = charts.filter((c) => c.id !== editingId).map((c) => ({ name: c.form.name, datasetId: c.form.datasetId }))

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    navigate(returnTo)
  }

  const goToStep = (next: ChartStep) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as ChartStep) : prev))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleContinue = () => {
    if (Object.keys(buildErrors).length > 0) {
      setShowBuildErrors(true)
      return
    }
    setShowBuildErrors(false)
    goToStep(2)
  }

  const editingRecord = editingId ? charts.find((c) => c.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published'
  const showUnsavedIndicator = hasLiveVersion && hasUnsavedChanges
  const readyToPublish = Object.keys(buildErrors).length === 0

  useEffect(() => {
    if (step === 2 && readyToPublish) setStepperUnlocked(true)
  }, [step, readyToPublish])

  const handleStepperNav = (next: ChartStep) => {
    // Surface any issues on the step being opened so they are visible immediately.
    setShowBuildErrors(true)
    goToStep(next)
  }

  const handleSaveDraft = () => {
    setSaved(false)
    const id = upsertChart(editingId, 'draft', form, organisationId)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    toast({
      title: hasLiveVersion ? 'Changes saved' : 'Draft saved',
      description: hasLiveVersion
        ? 'Your edits aren’t published yet. The current published version stays live.'
        : 'Your chart has been saved as a draft.',
      variant: 'success',
    })
    return id
  }


  const handleSelectDataset = (datasetId: string | null) => {
    setForm((prev) => ({
      ...prev,
      datasetId,
      fileId: null,
      chartType: null,
      config: emptyChartConfig,
      uploadedImage: null,
    }))
  }

  const handleSelectFile = (fileId: string) => {
    setForm((prev) => ({ ...prev, fileId, chartType: null, config: emptyChartConfig, uploadedImage: null }))
  }

  const handleSelectChartType = (chartType: ChartType) => {
    setForm((prev) => ({ ...prev, chartType, config: emptyChartConfig, uploadedImage: null }))
  }

  const handleConfigChange = (patch: Partial<ChartConfig>) => {
    setForm((prev) => ({ ...prev, config: { ...prev.config, ...patch } }))
  }

  const handleUploadImage = (asset: UploadedAsset | null) => {
    setForm((prev) => ({ ...prev, uploadedImage: asset }))
  }

  const handlePublish = async () => {
    if (publishState !== 'idle') return
    const ok = await confirm({
      title: hasLiveVersion ? 'Publish changes?' : 'Publish chart?',
      description: hasLiveVersion
        ? `Your changes to "${form.name}" will replace the current published version immediately.`
        : `You're about to publish "${form.name || 'this chart'}". It will appear on the dataset's public page.`,
      confirmLabel: hasLiveVersion ? 'Publish Changes' : 'Publish Chart',
    })
    if (!ok) return

    setPublishState('checking')
    window.setTimeout(() => {
      setPublishState('publishing')
      window.setTimeout(() => {
        const id = upsertChart(editingId, 'published', form, organisationId)
        if (!editingId) setEditingId(id)
        setLastSavedForm(form)
        setPublishState('idle')
        setJustPublished(true)
      }, 700)
    }, 500)
  }

  const handleViewOnDataset = () => {
    navigate('/dashboard/datasets', { state: { datasetId: form.datasetId } })
  }

  const handleBackToCharts = () => {
    navigate(returnTo)
  }

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={handleClose}
        title={form.name || 'Untitled Chart'}
        onTitleChange={(name) => setForm((prev) => ({ ...prev, name }))}
        editablePlaceholder="Untitled Chart"
        unsavedChanges={showUnsavedIndicator}
      />
      {organisation && <OrganisationContextBanner organisationName={organisation.metadata.name} />}
      <div className="border-t border-border px-6 py-6">
        <Stepper
          steps={CHART_STEPS}
          currentStep={step}
          interactive={stepperUnlocked}
          onStepClick={(n) => handleStepperNav(n as ChartStep)}
        />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && (
          <ChartStep1Build
            form={form}
            errors={showBuildErrors ? buildErrors : {}}
            onSelectDataset={handleSelectDataset}
            onSelectFile={handleSelectFile}
            onSelectChartType={handleSelectChartType}
            onConfigChange={handleConfigChange}
            onUploadImage={handleUploadImage}
          />
        )}
        {step === 2 && (
          <ChartStep2Review
            form={form}
            otherCharts={otherCharts}
            onNameChange={(name) => setForm((prev) => ({ ...prev, name }))}
            onEditBuild={() => goToStep(1)}
            onPublish={handlePublish}
            publishState={publishState}
            hasLiveVersion={Boolean(hasLiveVersion)}
          />
        )}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 2}
          onPrevious={handlePrevious}
          onContinue={handleContinue}
          onSaveDraft={handleSaveDraft}
          saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
        />
      </div>

      <LeaveCreationDialog
        open={showLeaveConfirm}
        itemLabel="chart"
        onCancel={() => setShowLeaveConfirm(false)}
        onSave={() => {
          setShowLeaveConfirm(false)
          handleSaveDraft()
          navigate(returnTo)
        }}
        onDiscard={() => {
          setShowLeaveConfirm(false)
          navigate(returnTo)
        }}
      />

      <ChartPublishSuccessModal
        open={justPublished}
        chartName={form.name}
        hasLiveVersion={Boolean(hasLiveVersion)}
        onViewOnDataset={handleViewOnDataset}
        onBackToCharts={handleBackToCharts}
      />
    </Card>
  )
}

export { ChartCreationPage }
