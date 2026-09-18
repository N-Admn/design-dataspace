import { isValidEmail } from '@/lib/auth-mock'
import { ORGANISATION_NAME_MAX_LENGTH, type OrganisationMetadata } from '@/types/organisation-workspace'

export const ORGANISATION_DESCRIPTION_MAX_LENGTH = 1000

/** Matches the `isValidUrl` pattern already used in ai-model-validation.ts —
 *  requires an http(s) URL, rather than accepting any URL scheme. */
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export interface OrganisationMetadataErrors {
  name?: string
  description?: string
  website?: string
  contactEmail?: string
  linkedin?: string
  github?: string
  x?: string
}

/** Format-only validation shared by Create and (Organisation Profile) Edit —
 * only Organisation name is required here; every other field is validated for
 * format only when the user actually enters a value. Used as-is by
 * `OrganisationProfilePage`, which has no logo/type requirement of its own. */
export function validateOrganisationMetadata(metadata: OrganisationMetadata): OrganisationMetadataErrors {
  const errors: OrganisationMetadataErrors = {}
  const name = metadata.name.trim()

  if (!name) errors.name = 'Enter an organisation name.'
  else if (metadata.name.length > ORGANISATION_NAME_MAX_LENGTH) {
    errors.name = `Organisation name must be ${ORGANISATION_NAME_MAX_LENGTH} characters or fewer.`
  }

  if (metadata.description.length > ORGANISATION_DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${ORGANISATION_DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }

  if (metadata.website.trim() && !isValidUrl(metadata.website.trim())) {
    errors.website = 'Enter a valid homepage URL.'
  }
  if (metadata.contactEmail.trim() && !isValidEmail(metadata.contactEmail.trim())) {
    errors.contactEmail = 'Enter a valid email address.'
  }
  if (metadata.linkedin.trim() && !isValidUrl(metadata.linkedin.trim())) {
    errors.linkedin = 'Enter a valid LinkedIn profile URL.'
  }
  if (metadata.github.trim() && !isValidUrl(metadata.github.trim())) {
    errors.github = 'Enter a valid GitHub profile URL.'
  }
  if (metadata.x.trim() && !isValidUrl(metadata.x.trim())) {
    errors.x = 'Enter a valid Twitter/X profile URL.'
  }

  return errors
}

export function isOrganisationMetadataValid(metadata: OrganisationMetadata): boolean {
  return Object.keys(validateOrganisationMetadata(metadata)).length === 0
}

export interface CreateOrganisationErrors extends OrganisationMetadataErrors {
  logo?: string
  type?: string
}

/** Create Organisation's three mandatory fields (logo, name, type) plus every
 * format-only check `validateOrganisationMetadata` already runs for the optional
 * fields. Name error messages here are Create-flow specific wording (distinct
 * from the Edit flow's) and include a client-side duplicate-name check against
 * the organisations already in the workspace store — there is no real backend
 * to enforce this, so it's checked against the same in-memory list the rest of
 * the app treats as the source of truth. */
export function validateCreateOrganisationForm(
  metadata: OrganisationMetadata,
  hasLogo: boolean,
  existingNames: string[],
): CreateOrganisationErrors {
  const errors: CreateOrganisationErrors = { ...validateOrganisationMetadata(metadata) }
  delete errors.name

  const trimmedName = metadata.name.trim()
  if (!metadata.name) {
    errors.name = 'Organisation name is required'
  } else if (!trimmedName) {
    errors.name = 'Enter a valid organisation name'
  } else if (metadata.name.length > ORGANISATION_NAME_MAX_LENGTH) {
    errors.name = `Organisation name must be ${ORGANISATION_NAME_MAX_LENGTH} characters or fewer`
  } else if (existingNames.some((existing) => existing.trim().toLowerCase() === trimmedName.toLowerCase())) {
    errors.name = 'An organisation with this name already exists'
  }

  if (!hasLogo) errors.logo = 'Organisation logo is required'
  if (!metadata.type) errors.type = 'Organisation type is required'

  return errors
}

/** Cheap, reactive check for enabling/disabling the Create Organisation button —
 * deliberately looks at only the three mandatory fields (Section 9: optional
 * fields, even ones mid-typed with an invalid format, must never affect button
 * enablement). Full validation — including optional-field formats — still runs
 * at submit time via `validateCreateOrganisationForm`. */
export function areMandatoryCreateFieldsFilled(metadata: OrganisationMetadata, hasLogo: boolean): boolean {
  const name = metadata.name.trim()
  return hasLogo && name.length > 0 && metadata.name.length <= ORGANISATION_NAME_MAX_LENGTH && Boolean(metadata.type)
}
