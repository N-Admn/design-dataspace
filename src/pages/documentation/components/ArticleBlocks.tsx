import { AlertTriangle, Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { MediaFigure, Visual } from '@/pages/documentation/components/Visuals'
import type { Block, WalkthroughStep } from '@/pages/documentation/content/types'

/** Renders an article's content blocks. Every block type has one look, so articles read the same way. */

/** Numbered steps, each with its own explanation and visual kept together (never a separate gallery). */
function StepByStepWalkthrough({ steps }: { steps: WalkthroughStep[] }) {
  return (
    <ol className="my-6 flex flex-col gap-6">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="type-heading-3 text-foreground">
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </p>
            <p className="type-body mt-1 text-text-subdued">{step.text}</p>
            {step.visual && <MediaFigure spec={step.visual} />}
          </div>
        </li>
      ))}
    </ol>
  )
}

function Note({ tone, title, text }: { tone: 'note' | 'warning'; title?: string; text: string }) {
  const Icon = tone === 'warning' ? AlertTriangle : Info
  return (
    <aside
      className={cn(
        'my-5 flex gap-3 rounded-lg border p-4 text-sm',
        tone === 'warning' ? 'border-warning/40 bg-warning/10' : 'border-border bg-secondary',
      )}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', tone === 'warning' ? 'text-warning-foreground' : 'text-text-subdued')} aria-hidden="true" />
      <div>
        <p className="font-semibold text-foreground">{title ?? (tone === 'warning' ? 'Important' : 'Note')}</p>
        <p className="mt-0.5 text-text-default">{text}</p>
      </div>
    </aside>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return <p className="type-body my-3 text-[15px] leading-7 text-text-default">{block.text}</p>
    case 'list':
      return (
        <ul className="my-3 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-7 text-text-default marker:text-text-subdued">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )
    case 'steps':
      return (
        <ol className="my-3 flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-7 text-text-default marker:font-semibold marker:text-text-subdued">
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      )
    case 'defs':
      return (
        <dl className="my-4 flex flex-col divide-y divide-border rounded-lg border border-border">
          {block.items.map((item) => (
            <div key={item.term} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-6">
              <dt className="text-sm font-semibold text-foreground sm:w-40 sm:shrink-0">{item.term}</dt>
              <dd className="text-[15px] leading-6 text-text-default">{item.desc}</dd>
            </div>
          ))}
        </dl>
      )
    case 'note':
      return <Note tone={block.tone} title={block.title} text={block.text} />
    case 'table':
      return (
        <div className="my-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                {block.headers.map((h) => (
                  <th key={h} scope="col" className="px-4 py-2.5 font-semibold text-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {block.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={cell} scope="row" className="px-4 py-2.5 align-top font-medium text-foreground">
                        {cell}
                      </th>
                    ) : (
                      <td key={cell} className="px-4 py-2.5 align-top text-text-default">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'visual':
      return <Visual visual={block.visual} />
    case 'walkthrough':
      return <StepByStepWalkthrough steps={block.steps} />
    case 'details':
      return (
        <details className="my-4 rounded-lg border border-border bg-card px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{block.summary}</summary>
          <div className="mt-2">
            <Blocks blocks={block.blocks} />
          </div>
        </details>
      )
  }
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </>
  )
}

export { Blocks, StepByStepWalkthrough }
