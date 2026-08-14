import * as React from 'react'
import { useLocation } from 'react-router-dom'

import { deriveContextLabel } from '@/lib/help-context-labels'

interface HelpContextValue {
  contextLabel: string
  /** Lets the current page refine the route-derived label with step-level detail,
   * e.g. "Datasets → Create Dataset → Resources". Tagged with the pathname it was
   * set for, so a stale label from a previous page never leaks into the next one. */
  setContextLabel: (label: string) => void
}

interface LabelOverride {
  pathname: string
  label: string
}

const HelpContext = React.createContext<HelpContextValue | null>(null)

function HelpProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [override, setOverride] = React.useState<LabelOverride | null>(null)

  const setContextLabel = React.useCallback(
    (label: string) => setOverride({ pathname: location.pathname, label }),
    [location.pathname],
  )

  const contextLabel =
    override && override.pathname === location.pathname ? override.label : deriveContextLabel(location.pathname)

  const value = React.useMemo<HelpContextValue>(
    () => ({ contextLabel, setContextLabel }),
    [contextLabel, setContextLabel],
  )

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>
}

function useHelpContext(): HelpContextValue {
  const ctx = React.useContext(HelpContext)
  if (!ctx) throw new Error('useHelpContext must be used within HelpProvider')
  return ctx
}

export { HelpProvider, useHelpContext }
