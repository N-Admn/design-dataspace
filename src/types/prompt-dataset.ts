/** Prompt Dataset — a Dataset Module content type for AI training, evaluation, and
 * prompt-library use cases. Kept in its own module (rather than folded into
 * dataset.ts) because it owns a distinct, still-evolving taxonomy: Task Type,
 * Domain, Target Languages and Target Model Types are Prompt Dataset-specific and
 * are NOT the same fields as the standard Dataset's Sector/Geography/Tags, nor the
 * AI Model module's Domain/Language/Provider fields. Product has not yet reconciled
 * Domain vs Tags vs Sector across modules — until that decision lands, this file is
 * the single place to update the Prompt Dataset option lists. */

export type DatasetType = 'dataset' | 'prompt_dataset'

export const DATASET_TYPE_OPTIONS: { value: DatasetType; label: string; description: string }[] = [
  {
    value: 'dataset',
    label: 'Dataset',
    description:
      'Create a standard dataset containing structured or unstructured data for public discovery, analysis, and reuse.',
  },
  {
    value: 'prompt_dataset',
    label: 'Prompt Dataset',
    description:
      'Create a dataset containing prompts and prompt-response examples for AI training, evaluation, and machine learning use cases.',
  },
]

export function datasetTypeLabel(type: DatasetType | undefined): string {
  return DATASET_TYPE_OPTIONS.find((o) => o.value === (type ?? 'dataset'))?.label ?? 'Dataset'
}

/** Task Type — the kind of AI/ML task this Prompt Dataset supports. */
export const TASK_TYPE_OPTIONS = [
  { value: 'text-generation', label: 'Text Generation' },
  { value: 'text-classification', label: 'Text Classification' },
  { value: 'question-answering', label: 'Question Answering' },
  { value: 'summarization', label: 'Summarization' },
  { value: 'translation', label: 'Translation' },
  { value: 'conversational', label: 'Conversational / Dialogue' },
  { value: 'code-generation', label: 'Code Generation' },
  { value: 'reasoning', label: 'Reasoning' },
  { value: 'evaluation', label: 'Evaluation / Benchmarking' },
  { value: 'other', label: 'Other' },
]

/** Domain — Prompt Dataset categorisation. Deliberately separate from the standard
 * Dataset `SECTOR_OPTIONS` (dataset.ts) and the AI Model `DOMAIN_OPTIONS`
 * (ai-model.ts): a future taxonomy reconciliation may merge these, but that
 * product decision hasn't been made, so each module keeps its own list for now. */
export const PROMPT_DOMAIN_OPTIONS = [
  { value: 'health', label: 'Health' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'education', label: 'Education' },
  { value: 'climate', label: 'Climate & Environment' },
  { value: 'public-policy', label: 'Public Policy' },
  { value: 'finance', label: 'Finance' },
  { value: 'disaster-management', label: 'Disaster Management' },
  { value: 'governance', label: 'Governance' },
  { value: 'urban-planning', label: 'Urban Planning' },
  { value: 'legal', label: 'Legal' },
  { value: 'general', label: 'General Purpose' },
]

/** Target Languages — language(s) the prompt content itself is written in. Kept
 * separate from the AI Model module's `LANGUAGE_OPTIONS` (ai-model.ts), which
 * doesn't cover every language a Prompt Dataset may target. */
export const TARGET_LANGUAGE_OPTIONS = [
  { value: 'as', label: 'Assamese' },
  { value: 'bn', label: 'Bengali' },
  { value: 'en', label: 'English' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'hi', label: 'Hindi' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'mr', label: 'Marathi' },
  { value: 'or', label: 'Odia' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'ur', label: 'Urdu' },
  { value: 'ne', label: 'Nepali' },
  { value: 'si', label: 'Sinhala' },
  { value: 'other', label: 'Other' },
]

/** Target Model Types — the model families this Prompt Dataset is designed for.
 * A classification label only — NOT the same thing as an AI Model Access Method's
 * `provider` (ai-model.ts), which configures a live API connection. */
export const TARGET_MODEL_TYPE_OPTIONS = [
  { value: 'gpt', label: 'GPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'llama', label: 'Llama' },
  { value: 'falcon', label: 'Falcon' },
  { value: 'bloom', label: 'BLOOM' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'indic-llm', label: 'Indic LLM' },
  { value: 'custom', label: 'Custom' },
  { value: 'other', label: 'Other' },
]

/** Dataset-level Prompt Dataset metadata — distinct from PromptFileMetadata, which
 * describes a single file within the dataset. */
export interface PromptDatasetMetadata {
  taskType: string
  domain: string
  targetLanguages: string[]
  targetModelTypes: string[]
}

export const emptyPromptDatasetMetadata: PromptDatasetMetadata = {
  taskType: '',
  domain: '',
  targetLanguages: [],
  targetModelTypes: [],
}

/** Prompt Format — a classification label describing how a prompt file is
 * structured. This field never generates, stores, or exposes actual
 * chain-of-thought content; "Chain of Thought" here is only an option label. */
export const PROMPT_FORMAT_OPTIONS = [
  { value: 'zero-shot', label: 'Zero Shot' },
  { value: 'few-shot', label: 'Few Shot' },
  { value: 'chain-of-thought', label: 'Chain of Thought' },
  { value: 'instruction', label: 'Instruction' },
  { value: 'chat', label: 'Chat' },
  { value: 'completion', label: 'Completion' },
  { value: 'other', label: 'Other' },
]

/** A single field detected from a prompt file's schema (e.g. a CSV column). The
 * name always comes from the file — only `description` is contributor-editable. */
export interface PromptFileField {
  name: string
  description?: string
}

export const PROMPT_FILE_NAME_MAX_LENGTH = 120

/** Per-file Prompt Dataset metadata — one instance per uploaded prompt file. */
export interface PromptFileMetadata {
  promptFileName: string
  promptFormat: string
  hasSystemPrompt: boolean
  hasExampleResponses: boolean
  /** Empty array + `fieldsUnavailable: true` means the file's schema couldn't be
   * read (e.g. a non-tabular file, or a platform import that didn't return a
   * parseable schema) — distinct from "no fields yet detected". */
  fields: PromptFileField[]
  fieldsUnavailable?: boolean
}

export function emptyPromptFileMetadata(promptFileName: string): PromptFileMetadata {
  return {
    promptFileName: promptFileName.slice(0, PROMPT_FILE_NAME_MAX_LENGTH),
    promptFormat: '',
    hasSystemPrompt: false,
    hasExampleResponses: false,
    fields: [],
  }
}
