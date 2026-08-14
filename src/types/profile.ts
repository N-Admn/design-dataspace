export interface ProfileSocialLinks {
  github: string
  linkedin: string
  x: string
}

export interface ContributorProfile {
  firstName: string
  lastName: string
  email: string
  location: string
  bio: string
  avatarDataUrl: string | null
  social: ProfileSocialLinks
}

export const MOCK_PROFILE: ContributorProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@civicdatalab.in',
  location: 'New Delhi, India',
  bio: 'Data researcher working on public health and civic data.',
  avatarDataUrl: null,
  social: {
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    x: '',
  },
}

export const BIO_MAX_LENGTH = 500
