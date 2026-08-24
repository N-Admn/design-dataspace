import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Database, ListChecks, Sparkles } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { WorkspaceHeader } from '@/components/dataset/WorkspaceHeader'
import { WizardFooter } from '@/components/dataset/WizardFooter'
import { ChartStep1Dataset } from '@/components/chart/ChartStep1Dataset'
import { ChartStep2Create } from '@/components/chart/ChartStep2Create'
import { ChartStep3Review } from '@/components/chart/ChartStep3Review'
import { ChartPublishSuccessModal } from '@/components/chart/ChartPublishSuccessModal'
import { LeaveCreationDialog } from '@/components/shared/LeaveCreationDialog'
import { useToast } from '@/components/ui/toast'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useAppData } from '@/context/AppDataContext'
import { useHelpContext } from '@/context/HelpContext'
import { getFileColumns } from '@/lib/chart-data'
import type { UploadedAsset } from '@/lib/generic-upload'
import { validateChartStep1, validateChartStep2 } from '@/lib/chart-validation'
import { emptyChartConfig, emptyChartForm, type ChartFormState, type ChartStatus, type ChartType } from '@/types/chart'

type ChartStep = 1 | 2 | 3

const CHART_STEPS = [
  { step: 1, label: 'Dataset', description: 'Choose a dataset', icon: Database },
  { step: 2, label: 'Create', description: 'Build your chart', icon: Sparkles },
  { step: 3, label: 'Review', description: 'Check and publish', icon: ListChecks },
]

interface ChartNavState {
  chartId?: string
  initialStep?: ChartStep
}

function ChartCreationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { charts, upsertChart } = useAppData()
  const { setContextLabel } = useHelpContext()
  const toast = useToast()
  const confirm = useConfirm()

  const navState = (location.state as ChartNavState | null) ?? null
  const resumeRecord = navState?.chartId ? charts.find((c) => c.id === navState.chartId) : undefined

  const [editingId, setEditingId] = useState<string | null>(resumeRecord?.id ?? null)
  const [step, setStep] = useState<ChartStep>(navState?.initialStep ?? 1)
  const [form, setForm] = useState<ChartFormState>(resumeRecord?.form ?? emptyChartForm)
  const [lastSavedForm, setLastSavedForm] = useState<ChartFormState>(resumeRecord?.form ?? form)
  const [saved, setSaved] = useState(true)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showStep1Errors, setShowStep1Errors] = useState(false)
  const [showStep2Errors, setShowStep2Errors] = useState(false)
  const [publishState, setPublishState] = useState<'idle' | 'checking' | 'publishing'>('idle')
  const [publishedStatus, setPublishedStatus] = useState<ChartStatus | null>(null)

  const stepLabel = CHART_STEPS.find((s) => s.step === step)?.label ?? 'Dataset'
  useEffect(() => {
    setContextLabel(`Charts → ${stepLabel}`)
  }, [stepLabel, setContextLabel])

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(lastSavedForm)

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
  const step1Errors = validateChartStep1(form)
  const step2Errors = validateChartStep2(form, columns)
  const otherCharts = charts.filter((c) => c.id !== editingId).map((c) => ({ name: c.form.name, datasetId: c.form.datasetId }))

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowLeaveConfirm(true)
      return
    }
    navigate('/dashboard/charts')
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
    if (step === 1) {
      if (Object.keys(step1Errors).length > 0) {
        setShowStep1Errors(true)
        return
      }
      setShowStep1Errors(false)
      goToStep(2)
      return
    }
    if (step === 2) {
      if (Object.keys(step2Errors).length > 0) {
        setShowStep2Errors(true)
        return
      }
      setShowStep2Errors(false)
      goToStep(3)
    }
  }

  const editingRecord = editingId ? charts.find((c) => c.id === editingId) : undefined
  const hasLiveVersion = editingRecord?.status === 'published' || editingRecord?.status === 'pending'

  const handleSaveDraft = () => {
    setSaved(false)
    const nextStatus = hasLiveVersion ? 'pending' : 'draft'
    const id = upsertChart(editingId, nextStatus, form)
    if (!editingId) setEditingId(id)
    setLastSavedForm(form)
    setTimeout(() => setSaved(true), 500)
    toast({
      title: nextStatus === 'pending' ? 'Changes saved' : 'Draft saved',
      description:
        nextStatus === 'pending'
          ? 'Your changes are pending and awaiting publication. The current published version remains live.'
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

  const handleConfigChange = <K extends keyof ChartFormState['config']>(field: K, value: ChartFormState['config'][K]) => {
    setForm((prev) => ({ ...prev, config: { ...prev.config, [field]: value } }))
  }

  const handleUploadImage = (asset: UploadedAsset | null) => {
    setForm((prev) => ({ ...prev, uploadedImage: asset }))
  }

  const handlePublish = async () => {
    if (publishState !== 'idle') return
    const ok = await confirm({
      title: hasLiveVersion ? 'Submit changes?' : 'Publish chart?',
      description: hasLiveVersion
        ? `Your changes to "${form.name}" will be submitted for review before going live.`
        : `You're about to publish "${form.name || 'this chart'}". It will appear on the dataset's public page.`,
      confirmLabel: hasLiveVersion ? 'Submit Changes' : 'Publish Chart',
    })
    if (!ok) return

    setPublishState('checking')
    window.setTimeout(() => {
      setPublishState('publishing')
      window.setTimeout(() => {
        const nextStatus: ChartStatus = hasLiveVersion ? 'pending' : 'published'
        const id = upsertChart(editingId, nextStatus, form)
        if (!editingId) setEditingId(id)
        setLastSavedForm(form)
        setPublishState('idle')
        setPublishedStatus(nextStatus)
      }, 700)
    }, 500)
  }

  const handleViewOnDataset = () => {
    navigate('/dashboard/datasets', { state: { datasetId: form.datasetId } })
  }

  const handleBackToCharts = () => {
    navigate('/dashboard/charts')
  }

  return (
    <Card>
      <WorkspaceHeader
        saved={saved}
        onClose={handleClose}
        title={form.name || 'Untitled Chart'}
        onTitleChange={(name) => setForm((prev) => ({ ...prev, name }))}
        editablePlaceholder="Untitled Chart"
      />
      <div className="border-t border-border px-6 py-6">
        <Stepper steps={CHART_STEPS} currentStep={step} />
      </div>
      <div className="border-t border-border px-6 py-6">
        {step === 1 && (
          <ChartStep1Dataset
            datasetId={form.datasetId}
            error={showStep1Errors ? step1Errors.dataset : undefined}
            onSelect={handleSelectDataset}
          />
        )}
        {step === 2 && form.datasetId && (
          <ChartStep2Create
            datasetId={form.datasetId}
            form={form}
            errors={showStep2Errors ? step2Errors : {}}
            onSelectFile={handleSelectFile}
            onSelectChartType={handleSelectChartType}
            onConfigChange={handleConfigChange}
            onUploadImage={handleUploadImage}
          />
        )}
        {step === 3 && (
          <ChartStep3Review
            form={form}
            otherCharts={otherCharts}
            onNameChange={(name) => setForm((prev) => ({ ...prev, name }))}
            onEditStep={goToStep}
            onPublish={handlePublish}
            publishState={publishState}
            hasLiveVersion={Boolean(hasLiveVersion)}
          />
        )}
      </div>
      <div className="border-t border-border">
        <WizardFooter
          showPrevious={step > 1}
          showContinue={step < 3}
          onPrevious={handlePrevious}
          onContinue={handleContinue}
          onSaveDraft={handleSaveDraft}
          saveLabel={hasLiveVersion ? 'Save Changes' : 'Save as Draft'}
        />
      </div>

      <LeaveCreationDialog
        open={showLeaveConfirm}
        itemLabel="chart"
        onContinueEditing={() => setShowLeaveConfirm(false)}
        onSaveDraftAndExit={() => {
          setShowLeaveConfirm(false)
          handleSaveDraft()
          navigate('/dashboard/charts')
        }}
        onDiscardAndExit={() => {
          setShowLeaveConfirm(false)
          navigate('/dashboard/charts')
        }}
      />

      <ChartPublishSuccessModal
        open={publishedStatus !== null}
        chartName={form.name}
        hasLiveVersion={Boolean(hasLiveVersion)}
        onViewOnDataset={handleViewOnDataset}
        onBackToCharts={handleBackToCharts}
      />
    </Card>
  )
}

export { ChartCreationPage }
