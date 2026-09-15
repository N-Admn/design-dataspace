export interface MockPerson {
  id: string
  name: string
  title: string
  initials: string
  /** Role / designation on its own, when known. Consumed by Speaker search so it
   * can render "Organisation · Role" without parsing the combined `title`. */
  role?: string
  /** Affiliated organisation, when any. Contributors without one are still listed
   * — they simply have no organisation value to show. */
  organisation?: string
}

/** Stand-in for a real contributor directory — lets People / Speaker search reuse
 * existing profiles instead of free-text entry, matching how Organisation search
 * already works. */
export const MOCK_PEOPLE: MockPerson[] = [
  { id: 'person-1', name: 'Dr. Aisha Verma', title: 'Public Health Researcher', initials: 'AV', role: 'Public Health Researcher' },
  { id: 'person-2', name: 'Rahul Mehta', title: 'Data Engineer, CivicDataLab', initials: 'RM', role: 'Data Engineer', organisation: 'CivicDataLab' },
  { id: 'person-3', name: 'Priya Nair', title: 'Program Manager, UN Women', initials: 'PN', role: 'Program Manager', organisation: 'UN Women' },
  { id: 'person-4', name: 'Jordan Rivera', title: 'Policy Analyst', initials: 'JR', role: 'Policy Analyst' },
  { id: 'person-5', name: 'Sana Khan', title: 'Open Knowledge Foundation', initials: 'SK', organisation: 'Open Knowledge Foundation' },
  { id: 'person-6', name: 'Marcus Bell', title: 'Independent Journalist', initials: 'MB', role: 'Independent Journalist' },
]
