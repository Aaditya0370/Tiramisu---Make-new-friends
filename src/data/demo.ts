export type DemoProfile = {
  id: string
  name: string
  handle: string
  initials: string
  avatarClass: string
  bio: string
  city: string
  distance: string
  energy: string
  status: string
  interests: string[]
  prompt: string
  coordinates: [number, number]
}

export type DemoMessage = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
}

export type DemoConversation = {
  id: string
  profileId: string
  preview: string
  time: string
  unread: number
  messages: DemoMessage[]
}

export const demoProfiles: DemoProfile[] = [
  {
    id: 'maya',
    name: 'Maya Chen',
    handle: '@mayamakes',
    initials: 'MC',
    avatarClass: 'avatar-lilac',
    bio: 'Product designer collecting tiny joys, good dumplings, and people who actually want to make plans.',
    city: 'SoHo',
    distance: '0.8 mi away',
    energy: 'Creative spark',
    status: 'online now',
    interests: ['Design', 'Food trails', 'Indie music'],
    prompt: 'A perfect Sunday is… a new neighborhood, a shared playlist, and no agenda.',
    coordinates: [40.724, -74.003],
  },
  {
    id: 'noah',
    name: 'Noah Williams',
    handle: '@noahlaughs',
    initials: 'NW',
    avatarClass: 'avatar-coral',
    bio: 'Stand-up beginner, professional playlist overthinker, and always down for the scenic route.',
    city: 'Lower East Side',
    distance: '1.4 mi away',
    energy: 'Big laugh energy',
    status: 'online 12m ago',
    interests: ['Comedy', 'Vinyl', 'Long walks'],
    prompt: 'Hot take: every errand is better with a soundtrack and a little detour.',
    coordinates: [40.718, -73.985],
  },
  {
    id: 'riley',
    name: 'Riley Park',
    handle: '@rileyroams',
    initials: 'RP',
    avatarClass: 'avatar-mint',
    bio: 'Amateur photographer finding color in ordinary places. Will trade camera tips for your best hidden spot.',
    city: 'Williamsburg',
    distance: '2.1 mi away',
    energy: 'Curious wanderer',
    status: 'online 28m ago',
    interests: ['Street photo', 'Coffee', 'Museums'],
    prompt: 'I will always stop for… a strange door, a good shadow, or a very confident dog.',
    coordinates: [40.711, -73.958],
  },
  {
    id: 'jules',
    name: 'Jules Okafor',
    handle: '@julesplays',
    initials: 'JO',
    avatarClass: 'avatar-gold',
    bio: 'Board-game strategist who believes the best conversations start with “one more round?”',
    city: 'East Village',
    distance: '1.7 mi away',
    energy: 'Playful brain',
    status: 'online 41m ago',
    interests: ['Board games', 'Sci-fi', 'Trivia'],
    prompt: 'My most unnecessary skill is… explaining game rules with dramatic hand gestures.',
    coordinates: [40.728, -73.982],
  },
]

export const questions = [
  { question: 'Would you rather have a pause button for life or a rewind button?', left: 'Pause button', right: 'Rewind button', mood: 'Time traveler energy' },
  { question: 'Would you rather always find a perfect parking spot or never wait in line again?', left: 'Perfect parking', right: 'Skip every line', mood: 'Tiny luxury' },
  { question: 'Would you rather explore a new city by food or by music?', left: 'Follow the food', right: 'Follow the sound', mood: 'Make it a day out' },
  { question: 'Would you rather host the world’s coziest dinner or its most chaotic game night?', left: 'Cozy dinner', right: 'Game night', mood: 'Your social superpower' },
]

export const starters = [
  { label: 'Easy opener', text: 'What tiny thing made you smile this week?' },
  { label: 'For the curious', text: 'What is a place you would happily get lost in?' },
  { label: 'Playful', text: 'What is your most defensible hot take?' },
]

export const demoConversations: DemoConversation[] = [
  {
    id: 'maya-thread', profileId: 'maya', preview: 'That playlist sounds like a plan.', time: '10:42 AM', unread: 2,
    messages: [
      { id: 'm1', from: 'them', text: 'I found a tiny gallery tucked behind a coffee shop yesterday.', time: '10:31 AM' },
      { id: 'm2', from: 'me', text: 'That is extremely my kind of accidental plan.', time: '10:35 AM' },
      { id: 'm3', from: 'them', text: 'That playlist sounds like a plan.', time: '10:42 AM' },
    ],
  },
  {
    id: 'noah-thread', profileId: 'noah', preview: 'The scenic route always wins.', time: 'Yesterday', unread: 0,
    messages: [
      { id: 'n1', from: 'them', text: 'The scenic route always wins.', time: 'Yesterday' },
      { id: 'n2', from: 'me', text: 'Especially when the detour has snacks.', time: 'Yesterday' },
    ],
  },
  {
    id: 'riley-thread', profileId: 'riley', preview: 'I know a coffee spot with perfect light.', time: 'Mon', unread: 0,
    messages: [
      { id: 'r1', from: 'them', text: 'I know a coffee spot with perfect light.', time: 'Mon' },
    ],
  },
]
