export interface MockPerson {
  id: string
  name: string
  title: string
  initials: string
}

/** Stand-in for a real contributor directory — lets People search reuse existing
 * profiles instead of free-text entry, matching how Organisation search already works. */
export const MOCK_PEOPLE: MockPerson[] = [
  { id: 'person-1', name: 'Dr. Aisha Verma', title: 'Public Health Researcher', initials: 'AV' },
  { id: 'person-2', name: 'Rahul Mehta', title: 'Data Engineer, CivicDataLab', initials: 'RM' },
  { id: 'person-3', name: 'Priya Nair', title: 'Program Manager, UN Women', initials: 'PN' },
  { id: 'person-4', name: 'Jordan Rivera', title: 'Policy Analyst', initials: 'JR' },
]
