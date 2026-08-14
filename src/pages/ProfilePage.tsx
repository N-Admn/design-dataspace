import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { useToast } from '@/components/ui/toast'
import { useAppData } from '@/context/AppDataContext'
import type { ContributorProfile } from '@/types/profile'

function ProfilePage() {
  const { profile, updateProfile } = useAppData()
  const toast = useToast()

  const handleSave = (next: ContributorProfile) => {
    updateProfile(next)
    toast({ title: 'Profile updated', description: 'Your changes have been saved.', variant: 'success' })
  }

  return <ProfileEditForm profile={profile} onSave={handleSave} />
}

export { ProfilePage }
