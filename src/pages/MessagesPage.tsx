import { useMemo, useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Info,
  ChevronLeft,
  X,
  Check,
  CheckCheck,
  Phone,
  Video,
  Pin,
  Trash2,
  Copy,
  CornerUpLeft,
  ExternalLink,
  Plus,
  Users,
  MessageCircle,
  MapPin,
  Image as ImageIcon,
  FileText,
  Volume2,
  Bell,
  BellOff,
  ShieldAlert,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'
import { demoConversations, demoProfiles, type DemoProfile } from '../data/demo'
import { formatInitials } from '../lib/utils'

type TabType = 'all' | 'unread' | 'groups'

export type ExtendedMessage = {
  id: string
  from: 'me' | 'them'
  senderName?: string
  senderAvatar?: string
  text: string
  time: string
  read?: boolean
  replyTo?: { id: string; text: string; sender: string }
  reactions?: { emoji: string; count: number; active?: boolean }[]
  attachment?: { type: 'image' | 'file'; title: string; meta?: string }
}

export type ExtendedConversation = {
  id: string
  profileId?: string
  title: string
  handle?: string
  avatarClass: string
  initials: string
  isGroup?: boolean
  groupMembers?: string[]
  preview: string
  time: string
  unread: number
  pinned?: boolean
  muted?: boolean
  status: string
  location?: string
  energy?: string
  prompt?: string
  messages: ExtendedMessage[]
}

// Initial realistic conversations with human-designed nuance
const INITIAL_CONVERSATIONS: ExtendedConversation[] = [
  {
    id: 'maya-thread',
    profileId: 'maya',
    title: 'Maya Chen',
    handle: '@mayamakes',
    avatarClass: 'avatar-lilac',
    initials: 'MC',
    isGroup: false,
    preview: 'That playlist sounds like a plan. Can we stop by the bakery on Prince St?',
    time: '10:42 AM',
    unread: 2,
    pinned: true,
    muted: false,
    status: 'Active now',
    location: 'SoHo · 0.8 mi away',
    energy: 'Creative spark',
    prompt: 'A perfect Sunday is… a new neighborhood, a shared playlist, and no agenda.',
    messages: [
      {
        id: 'm1',
        from: 'them',
        senderName: 'Maya Chen',
        text: 'I found a tiny gallery tucked behind a coffee shop yesterday near Mercer St.',
        time: '10:31 AM',
        reactions: [{ emoji: '✨', count: 1, active: true }],
      },
      {
        id: 'm2',
        from: 'me',
        text: 'That is extremely my kind of accidental plan. Did they have that ceramics exhibit up?',
        time: '10:35 AM',
        read: true,
      },
      {
        id: 'm3',
        from: 'them',
        senderName: 'Maya Chen',
        text: 'Yes! And the curator gave me a pamphlet with all the local open studios this weekend.',
        time: '10:38 AM',
      },
      {
        id: 'm4',
        from: 'them',
        senderName: 'Maya Chen',
        text: 'That playlist sounds like a plan. Can we stop by the bakery on Prince St?',
        time: '10:42 AM',
      },
    ],
  },
  {
    id: 'noah-thread',
    profileId: 'noah',
    title: 'Noah Williams',
    handle: '@noahlaughs',
    avatarClass: 'avatar-coral',
    initials: 'NW',
    isGroup: false,
    preview: 'Especially when the detour has snacks.',
    time: 'Yesterday',
    unread: 0,
    pinned: false,
    muted: false,
    status: 'Active 14m ago',
    location: 'Lower East Side · 1.4 mi away',
    energy: 'Big laugh energy',
    prompt: 'Hot take: every errand is better with a soundtrack and a little detour.',
    messages: [
      {
        id: 'n1',
        from: 'them',
        senderName: 'Noah Williams',
        text: 'The scenic route always wins, even if it adds twenty minutes to walking home.',
        time: 'Yesterday 3:15 PM',
        reactions: [{ emoji: '👍', count: 2, active: false }],
      },
      {
        id: 'n2',
        from: 'me',
        text: 'Especially when the detour has snacks.',
        time: 'Yesterday 3:22 PM',
        read: true,
        reactions: [{ emoji: '😂', count: 1, active: true }],
      },
    ],
  },
  {
    id: 'riley-thread',
    profileId: 'riley',
    title: 'Riley Park',
    handle: '@rileyroams',
    avatarClass: 'avatar-mint',
    initials: 'RP',
    isGroup: false,
    preview: 'I know a coffee spot with perfect light.',
    time: 'Mon',
    unread: 0,
    pinned: false,
    muted: false,
    status: 'Active 2h ago',
    location: 'Williamsburg · 2.1 mi away',
    energy: 'Curious wanderer',
    prompt: 'I will always stop for… a strange door, a good shadow, or a very confident dog.',
    messages: [
      {
        id: 'r1',
        from: 'them',
        senderName: 'Riley Park',
        text: 'I know a coffee spot with perfect morning light. Bring your film camera if you have it!',
        time: 'Mon 9:10 AM',
      },
    ],
  },
  {
    id: 'group-coffee-crawl',
    title: 'Downtown Book & Coffee Crawl',
    initials: 'BC',
    avatarClass: 'dm-avatar-group',
    isGroup: true,
    groupMembers: ['Maya Chen', 'Jules Okafor', 'Noah Williams'],
    preview: 'Jules: Let’s meet at McNally Jackson around 2:30pm.',
    time: '2d ago',
    unread: 0,
    pinned: false,
    muted: true,
    status: '3 members',
    location: 'Downtown Manhattan',
    energy: 'Weekend crew',
    prompt: 'A casual Saturday afternoon visiting independent bookstores and espresso bars.',
    messages: [
      {
        id: 'g1',
        from: 'them',
        senderName: 'Maya Chen',
        text: 'Who is free this Saturday afternoon for a casual walk around Nolita?',
        time: '2d ago 11:15 AM',
      },
      {
        id: 'g2',
        from: 'them',
        senderName: 'Jules Okafor',
        text: 'Count me in! Let’s meet at McNally Jackson around 2:30pm.',
        time: '2d ago 11:28 AM',
        reactions: [{ emoji: '☕', count: 3, active: true }],
      },
    ],
  },
]

const STORAGE_KEY = 'tiramisu_conversations_v3'

function loadSavedConversations(): ExtendedConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.warn('Failed to load conversations', err)
  }
  return INITIAL_CONVERSATIONS
}

function playChatTone(freq: number, duration: number) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // audio context blocked safe ignore
  }
}

function generateBotReply(sender: string, userText: string, conv: ExtendedConversation): string {
  const text = userText.toLowerCase()

  if (text.includes('voice note') || text.includes('🎤')) {
    return `Loved hearing your voice note! You have such a warm, friendly voice. Let's definitely coordinate for this weekend!`
  }

  if (
    text.includes('weekend') ||
    text.includes('saturday') ||
    text.includes('sunday') ||
    text.includes('tomorrow') ||
    text.includes('free')
  ) {
    const plans = [
      `Saturday afternoon around 2:00 PM would be wonderful! We could grab coffee and check out that little courtyard.`,
      `I'm completely free Sunday after 11:30 AM! Let's do a casual stroll around SoHo and grab pastries.`,
      `That timing works great for me! Should we meet up right near Prince St?`,
    ]
    return plans[Math.floor(Math.random() * plans.length)]
  }

  if (
    text.includes('coffee') ||
    text.includes('bakery') ||
    text.includes('pastry') ||
    text.includes('focaccia') ||
    text.includes('matcha') ||
    text.includes('tea') ||
    text.includes('food')
  ) {
    if (sender.includes('Maya')) {
      return `That bakery on Prince St has the warmest cardamom buns and oat cortados. You'll love the vibe there!`
    }
    if (sender.includes('Noah')) {
      return `Oh you're speaking my language! There's an Italian pastry counter around the corner with legendary cannoli. Detour mandatory!`
    }
    if (sender.includes('Riley')) {
      return `I know an espresso bar in Williamsburg with giant windows and incredible filter roast. Perfect for an easy conversation.`
    }
    return `That sounds so cozy. I'm always looking for a good coffee excuse! Let's make it happen.`
  }

  if (text.includes('where') || text.includes('location') || text.includes('address') || text.includes('spot')) {
    return `It's right near Mercer St, just a couple of minutes south of Houston. Look for the leafy ivy archway!`
  }

  if (text.includes('game') || text.includes('chess') || text.includes('quiz') || text.includes('math')) {
    return `Haha, I love games! I've been playing that lightning math quiz and chess on the Joy tab. Have you tried it?`
  }

  if (text.includes('photo') || text.includes('film') || text.includes('camera') || text.includes('art') || text.includes('music')) {
    if (sender.includes('Riley')) {
      return `I just loaded a fresh roll of Portra 400! The late afternoon light along the brick facades today is going to be unreal.`
    }
    if (sender.includes('Maya')) {
      return `I've been collecting vintage jazz vinyl while throwing ceramics. It creates the most peaceful flow state.`
    }
    return `Yes! Finding someone with that exact appreciation is so refreshing. What have you been creating or listening to lately?`
  }

  if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('good morning')) {
    return `Hey! So glad you reached out. How has your day been treating you?`
  }

  if (text.includes('sounds good') || text.includes('great') || text.includes('cool') || text.includes('yes') || text.includes('perfect')) {
    return `Awesome! I'm really looking forward to it. I'll shoot you a quick note beforehand!`
  }

  if (sender.includes('Maya')) {
    const r = [
      `I completely agree! It's so true. Also, have you seen that tiny artisan pop-up near Spring St?`,
      `That's so thoughtful. That's honestly what I love about this neighborhood—every block has its own personality.`,
      `Haha totally! What kind of creative projects or hobbies have been keeping you inspired lately?`,
    ]
    return r[Math.floor(Math.random() * r.length)]
  }

  if (sender.includes('Noah')) {
    const r = [
      `Haha couldn't agree more! The best adventures are always the unplanned ones.`,
      `100%! If you ever need recommendations for quirky neighborhood spots, I've got a whole mental catalog.`,
      `Spot on! You have awesome energy. Are you having a good week?`,
    ]
    return r[Math.floor(Math.random() * r.length)]
  }

  if (sender.includes('Riley')) {
    const r = [
      `Totally. Sometimes just taking a slow walk and observing the architecture resets your whole mind.`,
      `Love that. Do you explore mostly around Manhattan or cross the bridge into Brooklyn often?`,
      `Yes! Let's definitely swap some favorite quiet reading spots and secret lookouts!`,
    ]
    return r[Math.floor(Math.random() * r.length)]
  }

  return `That makes so much sense! It's rare to meet someone with that exact vibe. Tell me more about that!`
}

function getQuickStarters(conv: ExtendedConversation): string[] {
  if (conv.isGroup) {
    return [
      '☕ Saturday 2:30 PM at McNally Jackson works for me!',
      '📚 Count me in for the book & coffee crawl!',
      '🥐 Are there good bakery stops along the route?',
    ]
  }
  if (conv.title.includes('Maya')) {
    return [
      '🥖 What bakery do you recommend on Prince St?',
      '🎨 Have you tried making ceramics yourself?',
      '☕ How about grabbing coffee this Saturday around 2 PM?',
    ]
  }
  if (conv.title.includes('Noah')) {
    return [
      '🍕 What is the best detour snack you have found?',
      '🚶‍♂️ Always down for a spontaneous neighborhood wander!',
      '😂 Got any hilarious stories from this week?',
    ]
  }
  if (conv.title.includes('Riley')) {
    return [
      '📷 What 35mm film do you usually shoot on?',
      '☕ Where is this coffee spot with the great morning light?',
      '🐕 Seen any confident dogs today?',
    ]
  }
  return [
    '👋 Hey! What are you up to today?',
    '☕ Want to grab a coffee this weekend?',
    '✨ Loved your prompt on your profile!',
  ]
}

export function MessagesPage() {
  const [conversations, setConversations] = useState<ExtendedConversation[]>(loadSavedConversations)
  const [activeId, setActiveId] = useState<string>(() => loadSavedConversations()[0]?.id || INITIAL_CONVERSATIONS[0].id)
  const [tab, setTab] = useState<TabType>('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [replyingTo, setReplyingTo] = useState<ExtendedMessage | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showInChatSearch, setShowInChatSearch] = useState(false)
  const [inChatQuery, setInChatQuery] = useState('')
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [typingStatus, setTypingStatus] = useState<{ contactId: string; name: string } | null>(null)

  // Live Calling simulation
  const [callState, setCallState] = useState<{
    active: boolean
    type: 'voice' | 'video'
    contact: string
    avatarClass: string
    initials: string
    connected: boolean
    seconds: number
    isMuted: boolean
  } | null>(null)

  // Modals & popovers
  const [showNewMsgModal, setShowNewMsgModal] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceRecordingSeconds, setVoiceRecordingSeconds] = useState(0)
  const [voiceRecordingActive, setVoiceRecordingActive] = useState(false)
  const [showEmojiPopover, setShowEmojiPopover] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3200)
  }
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Save conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch {
      // quota safe
    }
  }, [conversations])

  // Handle incoming contact from DiscoverPage or DiscoveryMap
  useEffect(() => {
    const target =
      sessionStorage.getItem('tiramisu_target_contact') ||
      new URLSearchParams(window.location.search).get('contact')

    if (!target) return
    sessionStorage.removeItem('tiramisu_target_contact')

    const existing = conversations.find(
      (c) => c.profileId === target || c.id === target || c.id === `${target}-thread`
    )

    if (existing) {
      setActiveId(existing.id)
      setMobileChatOpen(true)
      return
    }

    const prof = demoProfiles.find((p) => p.id === target)
    if (prof) {
      const newConv: ExtendedConversation = {
        id: `${prof.id}-thread`,
        profileId: prof.id,
        title: prof.name,
        handle: prof.handle,
        avatarClass: prof.avatarClass,
        initials: prof.initials,
        isGroup: false,
        preview: `Hey there! Loved seeing you on the map.`,
        time: 'Just now',
        unread: 0,
        pinned: false,
        muted: false,
        status: 'Active now',
        location: `${prof.city} · ${prof.distance}`,
        energy: prof.energy,
        prompt: prof.prompt,
        messages: [
          {
            id: `msg-${Date.now()}-opener`,
            from: 'them',
            senderName: prof.name,
            text: `Hey! I saw we're both in the neighborhood and both enjoy ${prof.interests.slice(0, 2).join(' & ')}. What are you up to today?`,
            time: 'Just now',
            reactions: [{ emoji: '👋', count: 1, active: true }],
          },
        ],
      }
      setConversations((prev) => [newConv, ...prev])
      setActiveId(newConv.id)
      setMobileChatOpen(true)
    }
  }, [conversations])

  // Call timer simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (callState?.active) {
      interval = setInterval(() => {
        setCallState((prev) => {
          if (!prev) return null
          return {
            ...prev,
            connected: true,
            seconds: prev.seconds + 1,
          }
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callState?.active])

  function startCall(type: 'voice' | 'video') {
    setCallState({
      active: true,
      type,
      contact: activeConversation.title,
      avatarClass: activeConversation.avatarClass,
      initials: activeConversation.initials,
      connected: false,
      seconds: 0,
      isMuted: false,
    })
    playChatTone(440, 0.2)
  }

  function endCall() {
    setCallState(null)
    playChatTone(330, 0.15)
    showToast('Call ended')
  }

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0] ?? INITIAL_CONVERSATIONS[0],
    [conversations, activeId]
  )

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread > 0 ? c.unread : 0), 0),
    [conversations]
  )

  // Filter conversations by tab and search query
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (tab === 'unread' && c.unread === 0) return false
      if (tab === 'groups' && !c.isGroup) return false
      if (!query.trim()) return true
      const q = query.toLowerCase()
      const matchName = c.title.toLowerCase().includes(q)
      const matchPreview = c.preview.toLowerCase().includes(q)
      const matchMsg = c.messages.some((m) => m.text.toLowerCase().includes(q))
      return matchName || matchPreview || matchMsg
    })
  }, [conversations, tab, query])

  // Filter messages within active conversation when in-chat search is active
  const displayedMessages = useMemo(() => {
    if (!showInChatSearch || !inChatQuery.trim()) return activeConversation.messages
    const q = inChatQuery.toLowerCase()
    return activeConversation.messages.filter((m) => m.text.toLowerCase().includes(q))
  }, [activeConversation.messages, showInChatSearch, inChatQuery])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation.messages, typingStatus])

  // Voice recording timer simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (voiceRecordingActive) {
      interval = setInterval(() => {
        setVoiceRecordingSeconds((s) => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [voiceRecordingActive])

  // Mark active conversation as read when opened
  function selectConversation(id: string) {
    setActiveId(id)
    setMobileChatOpen(true)
    setReplyingTo(null)
    setShowInChatSearch(false)
    setInChatQuery('')

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  // Send message with instant feedback & responsive bot reply
  function handleSendMessage(e?: FormEvent) {
    if (e) e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMessage: ExtendedMessage = {
      id: `msg-${Date.now()}`,
      from: 'me',
      text: trimmed,
      time: timeStr,
      read: false,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            sender: replyingTo.from === 'me' ? 'You' : replyingTo.senderName || 'Them',
          }
        : undefined,
    }

    const currentConv = activeConversation

    // Play subtle soft outbound blip
    playChatTone(580, 0.08)

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConv.id) {
          return {
            ...c,
            preview: trimmed,
            time: 'Just now',
            messages: [...c.messages, newMessage],
          }
        }
        return c
      })
    )

    setDraft('')
    setReplyingTo(null)
    setShowEmojiPopover(false)

    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'
    }

    // Trigger authentic simulated reply from contact
    const responder = currentConv.isGroup
      ? currentConv.groupMembers?.[Math.floor(Math.random() * (currentConv.groupMembers.length || 1))] || 'Maya Chen'
      : currentConv.title

    window.setTimeout(() => {
      setTypingStatus({ contactId: currentConv.id, name: responder })
    }, 550)

    window.setTimeout(() => {
      setTypingStatus(null)

      const replyText = generateBotReply(responder, trimmed, currentConv)
      const rNow = new Date()
      const rTimeStr = rNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      const replyMsg: ExtendedMessage = {
        id: `reply-${Date.now()}`,
        from: 'them',
        senderName: responder,
        text: replyText,
        time: rTimeStr,
        read: true,
        reactions: Math.random() > 0.65 ? [{ emoji: '✨', count: 1, active: true }] : undefined,
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConv.id) {
            const updated = c.messages.map((m) => ({ ...m, read: true }))
            return {
              ...c,
              preview: replyText,
              time: 'Just now',
              messages: [...updated, replyMsg],
            }
          }
          return c
        })
      )

      // Play soft inbound chime
      playChatTone(860, 0.12)
    }, 1800)
  }

  // Handle textarea enter key
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Toggle reaction on a message
  function toggleReaction(msgId: string, emoji: string) {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c
        const nextMessages = c.messages.map((m) => {
          if (m.id !== msgId) return m
          const existing = m.reactions || []
          const foundIndex = existing.findIndex((r) => r.emoji === emoji)
          let updatedReactions = [...existing]

          if (foundIndex >= 0) {
            const current = existing[foundIndex]
            if (current.active) {
              if (current.count <= 1) {
                updatedReactions.splice(foundIndex, 1)
              } else {
                updatedReactions[foundIndex] = {
                  ...current,
                  count: current.count - 1,
                  active: false,
                }
              }
            } else {
              updatedReactions[foundIndex] = {
                ...current,
                count: current.count + 1,
                active: true,
              }
            }
          } else {
            updatedReactions.push({ emoji, count: 1, active: true })
          }

          return { ...m, reactions: updatedReactions }
        })
        return { ...c, messages: nextMessages }
      })
    )
  }

  // Copy message text
  function copyMessage(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  // Delete sent message
  function deleteMessage(msgId: string) {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c
        const filtered = c.messages.filter((m) => m.id !== msgId)
        return {
          ...c,
          messages: filtered,
          preview: filtered[filtered.length - 1]?.text || 'No messages yet',
        }
      })
    )
  }

  // Toggle mute conversation
  function toggleMute() {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, muted: !c.muted } : c))
    )
    setHeaderMenuOpen(false)
  }

  // Start voice note simulation
  function startVoiceRecording() {
    setShowVoiceModal(true)
    setVoiceRecordingActive(true)
    setVoiceRecordingSeconds(0)
  }

  function sendVoiceNote() {
    setVoiceRecordingActive(false)
    setShowVoiceModal(false)

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const seconds = voiceRecordingSeconds || 4

    const voiceMsg: ExtendedMessage = {
      id: `voice-${Date.now()}`,
      from: 'me',
      text: `🎤 Voice note (${seconds}s) — “Hey, let’s definitely catch up this weekend!”`,
      time: timeStr,
      read: false,
    }

    playChatTone(580, 0.08)

    const currentId = activeId
    const currentConv = activeConversation

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentId) {
          return {
            ...c,
            preview: 'Voice note sent',
            time: 'Just now',
            messages: [...c.messages, voiceMsg],
          }
        }
        return c
      })
    )
    setVoiceRecordingSeconds(0)

    const responder = currentConv.isGroup
      ? currentConv.groupMembers?.[0] || 'Maya Chen'
      : currentConv.title

    window.setTimeout(() => {
      setTypingStatus({ contactId: currentId, name: responder })
    }, 600)

    window.setTimeout(() => {
      setTypingStatus(null)
      const rNow = new Date()
      const rTimeStr = rNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const replyMsg: ExtendedMessage = {
        id: `reply-${Date.now()}`,
        from: 'them',
        senderName: responder,
        text: `Loved hearing your voice note! You have such a warm, friendly voice. Let’s definitely meet up this weekend!`,
        time: rTimeStr,
        read: true,
        reactions: [{ emoji: '✨', count: 1, active: true }],
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentId) {
            return {
              ...c,
              preview: replyMsg.text,
              time: 'Just now',
              messages: [...c.messages, replyMsg],
            }
          }
          return c
        })
      )
      playChatTone(860, 0.12)
    }, 1900)
  }

  // Start chat with a contact from New Message modal
  function startChatWithContact(profile: DemoProfile) {
    const existing = conversations.find((c) => c.profileId === profile.id)
    if (existing) {
      selectConversation(existing.id)
    } else {
      const newConv: ExtendedConversation = {
        id: `${profile.id}-thread`,
        profileId: profile.id,
        title: profile.name,
        handle: profile.handle,
        avatarClass: profile.avatarClass,
        initials: profile.initials,
        isGroup: false,
        preview: 'Conversation started',
        time: 'Just now',
        unread: 0,
        status: profile.status,
        location: `${profile.city} · ${profile.distance}`,
        energy: profile.energy,
        prompt: profile.prompt,
        messages: [
          {
            id: `first-${Date.now()}`,
            from: 'them',
            senderName: profile.name,
            text: `Hi there! I saw we both enjoy ${profile.interests.slice(0, 2).join(' and ')}.`,
            time: 'Just now',
          },
        ],
      }
      setConversations((prev) => [newConv, ...prev])
      selectConversation(newConv.id)
    }
    setShowNewMsgModal(false)
  }

  // Curated quick emojis for quick picker
  const QUICK_EMOJIS = ['❤️', '👍', '☕', '✨', '😂', '🔥', '🙌', '🎨', '🚲', '🍕', '👋', '🎉']

  return (
    <div className="dm-container">
      {/* Main Workstation: Full screen edge-to-edge layout */}
      <div
        className={`dm-workstation ${showDetails ? 'with-details' : ''} ${
          mobileChatOpen ? 'mobile-chat-open' : ''
        }`}
      >
        {/* ====================================================================
            1. CONVERSATION SIDEBAR
            ==================================================================== */}
        <aside className="dm-sidebar">
          {/* Sidebar Header */}
          <div className="dm-sidebar-header">
            <div className="dm-sidebar-title-wrap">
              <h2 className="dm-sidebar-title">Messages</h2>
              {totalUnread > 0 && (
                <span className="dm-unread-badge" title={`${totalUnread} unread`}>
                  {totalUnread}
                </span>
              )}
            </div>
            <button
              className="dm-compose-btn"
              onClick={() => setShowNewMsgModal(true)}
              aria-label="New message"
              title="Start a new message"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="dm-sidebar-search">
            <div className="dm-search-input-wrap">
              <Search size={14} className="dm-search-icon" />
              <input
                className="dm-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
              />
              {query && (
                <button
                  className="dm-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="dm-sidebar-tabs">
            <button
              className={`dm-tab-btn ${tab === 'all' ? 'is-active' : ''}`}
              onClick={() => setTab('all')}
            >
              All
              <span className="dm-tab-count">{conversations.length}</span>
            </button>
            <button
              className={`dm-tab-btn ${tab === 'unread' ? 'is-active' : ''}`}
              onClick={() => setTab('unread')}
            >
              Unread
              {totalUnread > 0 && <span className="dm-tab-count">{totalUnread}</span>}
            </button>
            <button
              className={`dm-tab-btn ${tab === 'groups' ? 'is-active' : ''}`}
              onClick={() => setTab('groups')}
            >
              Groups
            </button>
          </div>

          {/* Conversation List */}
          <div className="dm-conversations-scroll">
            {filteredConversations.length === 0 ? (
              <div className="dm-empty-sidebar">
                <Search size={22} style={{ opacity: 0.4 }} />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeId
                const isOnline = c.status.toLowerCase().includes('online') || c.status.toLowerCase().includes('now')
                const hasUnread = c.unread > 0

                return (
                  <button
                    key={c.id}
                    className={`dm-conversation-row ${isActive ? 'is-active' : ''}`}
                    onClick={() => selectConversation(c.id)}
                  >
                    <div className="dm-avatar-wrap">
                      <div className={`dm-avatar ${c.avatarClass}`}>
                        {c.isGroup ? <Users size={16} /> : c.initials}
                      </div>
                      {!c.isGroup && isOnline && <span className="dm-avatar-status" />}
                    </div>

                    <div className="dm-conversation-content">
                      <div className="dm-conversation-topline">
                        <span
                          className={`dm-conversation-name ${hasUnread ? 'has-unread' : ''}`}
                        >
                          {c.title}
                        </span>
                        <span className="dm-conversation-time">{c.time}</span>
                      </div>
                      <div className="dm-conversation-bottomline">
                        <p
                          className={`dm-conversation-preview ${hasUnread ? 'has-unread' : ''}`}
                        >
                          {c.preview}
                        </p>
                        {hasUnread && <span className="dm-unread-dot" />}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Sidebar Footer with subtle status & voice trigger */}
          <div className="dm-sidebar-footer">
            <div className="dm-sidebar-status">
              <span className="dm-notice-dot" />
              <span>Realtime active</span>
            </div>
            <button
              className="dm-voice-studio-trigger"
              onClick={() => setShowVoiceModal(true)}
              title="Voice note studio"
            >
              <Volume2 size={13} />
              <span>Voice</span>
            </button>
          </div>
        </aside>

        {/* ====================================================================
            2. ACTIVE CHAT AREA
            ==================================================================== */}
        <section className="dm-chat-area">
          {/* Chat Header */}
          <header className="dm-chat-header">
            <div className="dm-chat-header-left">
              <button
                className="dm-back-btn"
                onClick={() => setMobileChatOpen(false)}
                aria-label="Back to conversations"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="dm-avatar-wrap">
                <div className={`dm-avatar dm-avatar-sm ${activeConversation.avatarClass}`}>
                  {activeConversation.isGroup ? <Users size={14} /> : activeConversation.initials}
                </div>
                {!activeConversation.isGroup &&
                  (activeConversation.status.includes('now') ||
                    activeConversation.status.includes('online')) && (
                    <span className="dm-avatar-status" />
                  )}
              </div>

              <div className="dm-chat-header-info">
                <div className="dm-chat-header-name-row">
                  <h3 className="dm-chat-header-name">{activeConversation.title}</h3>
                  {activeConversation.handle && (
                    <span className="dm-chat-header-handle">{activeConversation.handle}</span>
                  )}
                </div>
                <div className="dm-chat-header-status">
                  {!activeConversation.isGroup && (
                    <span className="dm-status-dot-inline" />
                  )}
                  <span>{activeConversation.status}</span>
                  {activeConversation.location && (
                    <>
                      <span>·</span>
                      <span>{activeConversation.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="dm-chat-header-actions">
              <button
                className="dm-icon-action"
                onClick={() => startCall('voice')}
                title="Start audio call"
                aria-label="Start audio call"
              >
                <Phone size={16} />
              </button>

              <button
                className="dm-icon-action"
                onClick={() => startCall('video')}
                title="Start video call"
                aria-label="Start video call"
              >
                <Video size={16} />
              </button>

              <button
                className={`dm-icon-action ${showInChatSearch ? 'is-active' : ''}`}
                onClick={() => {
                  setShowInChatSearch((v) => !v)
                  setInChatQuery('')
                }}
                title="Search in conversation"
                aria-label="Search in conversation"
              >
                <Search size={16} />
              </button>

              <button
                className="dm-icon-action"
                onClick={startVoiceRecording}
                title="Record voice note"
                aria-label="Record voice note"
              >
                <Mic size={16} />
              </button>

              <button
                className={`dm-icon-action ${showDetails ? 'is-active' : ''}`}
                onClick={() => setShowDetails((v) => !v)}
                title="Conversation details"
                aria-label="Conversation details"
              >
                <Info size={16} />
              </button>

              <div style={{ position: 'relative' }}>
                <button
                  className="dm-icon-action"
                  onClick={() => setHeaderMenuOpen((v) => !v)}
                  title="More actions"
                  aria-label="More actions"
                >
                  <MoreVertical size={16} />
                </button>

                {headerMenuOpen && (
                  <div
                    className="dm-emoji-popover"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 40,
                      display: 'flex',
                      flexDirection: 'column',
                      width: 180,
                      padding: 6,
                    }}
                  >
                    <button
                      className="dm-contact-item"
                      onClick={toggleMute}
                      style={{ fontSize: 12 }}
                    >
                      {activeConversation.muted ? <Bell size={14} /> : <BellOff size={14} />}
                      <span>{activeConversation.muted ? 'Unmute' : 'Mute notifications'}</span>
                    </button>
                    <button
                      className="dm-contact-item"
                      onClick={() => {
                        showToast('Transcript copied to clipboard')
                        setHeaderMenuOpen(false)
                      }}
                      style={{ fontSize: 12 }}
                    >
                      <ArrowUpRight size={14} />
                      <span>Export transcript</span>
                    </button>
                    <button
                      className="dm-contact-item"
                      onClick={() => {
                        localStorage.removeItem(STORAGE_KEY)
                        setConversations(INITIAL_CONVERSATIONS)
                        showToast('Conversations reset to sample data')
                        setHeaderMenuOpen(false)
                      }}
                      style={{ fontSize: 12 }}
                    >
                      <Sparkles size={14} />
                      <span>Reset sample chats</span>
                    </button>
                    <button
                      className="dm-destructive-btn"
                      onClick={() => {
                        if (confirm('Clear all messages in this conversation?')) {
                          setConversations((prev) =>
                            prev.map((c) =>
                              c.id === activeId ? { ...c, messages: [], preview: 'Empty thread' } : c
                            )
                          )
                        }
                        setHeaderMenuOpen(false)
                      }}
                    >
                      Clear conversation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* In-chat search bar */}
          {showInChatSearch && (
            <div className="dm-inchat-search-bar">
              <Search size={14} style={{ color: 'var(--dm-text-muted)' }} />
              <input
                className="dm-inchat-search-input"
                autoFocus
                placeholder="Find in this chat..."
                value={inChatQuery}
                onChange={(e) => setInChatQuery(e.target.value)}
              />
              <span className="dm-inchat-search-count">
                {displayedMessages.length} {displayedMessages.length === 1 ? 'match' : 'matches'}
              </span>
              <button
                className="dm-search-clear"
                onClick={() => {
                  setShowInChatSearch(false)
                  setInChatQuery('')
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="dm-messages-feed">
            {/* Thoughtful icebreaker / context card */}
            {activeConversation.prompt && (
              <div className="dm-context-intro">
                <div className="dm-context-intro-icon">
                  <MessageCircle size={14} />
                </div>
                <div className="dm-context-intro-content">
                  <div className="dm-context-intro-kicker">Conversation starter</div>
                  <p className="dm-context-intro-text">{activeConversation.prompt}</p>
                </div>
              </div>
            )}

            {/* Date Separator */}
            <div className="dm-date-separator">
              <span>Today</span>
            </div>

            {/* Messages */}
            {displayedMessages.map((msg, index) => {
              const isMe = msg.from === 'me'
              const prevMsg = displayedMessages[index - 1]
              const isTurnBreak = !prevMsg || prevMsg.from !== msg.from

              return (
                <div
                  key={msg.id}
                  className={`dm-message-row ${isMe ? 'from-me' : 'from-them'} ${
                    isTurnBreak ? 'turn-break' : ''
                  }`}
                >
                  {/* Sender label in group chats */}
                  {!isMe && activeConversation.isGroup && isTurnBreak && msg.senderName && (
                    <span className="dm-sender-label">{msg.senderName}</span>
                  )}

                  <div className="dm-bubble-wrap">
                    {/* Hover Toolbar */}
                    <div className="dm-message-toolbar">
                      <button
                        className="dm-toolbar-btn"
                        onClick={() => toggleReaction(msg.id, '❤️')}
                        title="React ❤️"
                      >
                        ❤️
                      </button>
                      <button
                        className="dm-toolbar-btn"
                        onClick={() => toggleReaction(msg.id, '👍')}
                        title="React 👍"
                      >
                        👍
                      </button>
                      <button
                        className="dm-toolbar-btn"
                        onClick={() => toggleReaction(msg.id, '☕')}
                        title="React ☕"
                      >
                        ☕
                      </button>
                      <button
                        className="dm-toolbar-btn"
                        onClick={() => setReplyingTo(msg)}
                        title="Reply"
                      >
                        <CornerUpLeft size={13} />
                      </button>
                      <button
                        className="dm-toolbar-btn"
                        onClick={() => copyMessage(msg.text, msg.id)}
                        title="Copy text"
                      >
                        <Copy size={13} />
                      </button>
                      {isMe && (
                        <button
                          className="dm-toolbar-btn"
                          onClick={() => deleteMessage(msg.id)}
                          title="Delete message"
                        >
                          <Trash2 size={13} style={{ color: '#ef4444' }} />
                        </button>
                      )}
                    </div>

                    {copiedId === msg.id && (
                      <span className="dm-copied-indicator">Copied</span>
                    )}

                    {/* Bubble Content */}
                    <div className="dm-message-bubble">
                      {/* Reply Quote */}
                      {msg.replyTo && (
                        <div className="dm-bubble-reply-quote">
                          <div className="dm-bubble-reply-author">{msg.replyTo.sender}</div>
                          <div>{msg.replyTo.text}</div>
                        </div>
                      )}

                      <p className="dm-message-text">{msg.text}</p>

                      <div className="dm-bubble-meta">
                        <span>{msg.time}</span>
                        {isMe && (
                          <span className="dm-bubble-check">
                            <CheckCheck size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reaction Pills */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="dm-reactions-wrap">
                      {msg.reactions.map((r, i) => (
                        <button
                          key={i}
                          className={`dm-reaction-pill ${r.active ? 'is-active' : ''}`}
                          onClick={() => toggleReaction(msg.id, r.emoji)}
                        >
                          <span>{r.emoji}</span>
                          <span>{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Real-time Character Typing Indicator */}
            {typingStatus && typingStatus.contactId === activeConversation.id && (
              <div
                className="dm-message-row from-them turn-break"
                style={{ animation: 'pop-in 0.2s ease', margin: '4px 0 8px' }}
              >
                <div className="dm-bubble-wrap">
                  <div
                    className="dm-message-bubble"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 14px',
                      background: '#f4ede4',
                      borderRadius: '14px 14px 14px 4px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#82664c', fontWeight: 600 }}>
                      {typingStatus.name} is typing
                    </span>
                    <div className="dm-typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {displayedMessages.length === 0 && (
              <div className="dm-empty-sidebar" style={{ margin: 'auto' }}>
                <p>No messages match your search.</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Icebreaker Conversation Starter Chips */}
          <div className="dm-quick-starters-row">
            {getQuickStarters(activeConversation).map((starter, i) => (
              <button
                key={i}
                type="button"
                className="dm-starter-pill"
                onClick={() => {
                  setDraft(starter)
                  if (textareaRef.current) {
                    textareaRef.current.focus()
                  }
                }}
              >
                <Sparkles size={11} />
                <span>{starter}</span>
              </button>
            ))}
          </div>

          {/* ==================================================================
              3. COMPOSER
              ================================================================== */}
          <div className="dm-composer-wrap">
            {/* Replying banner */}
            {replyingTo && (
              <div className="dm-reply-preview-bar">
                <div className="dm-reply-preview-left">
                  <CornerUpLeft size={13} style={{ color: 'var(--dm-accent)' }} />
                  <span className="dm-reply-preview-text">
                    Replying to{' '}
                    <strong>
                      {replyingTo.from === 'me'
                        ? 'yourself'
                        : replyingTo.senderName || activeConversation.title}
                    </strong>
                    : “{replyingTo.text}”
                  </span>
                </div>
                <button
                  className="dm-reply-cancel-btn"
                  onClick={() => setReplyingTo(null)}
                  aria-label="Cancel reply"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="dm-composer-box" style={{ position: 'relative' }}>
              <textarea
                ref={textareaRef}
                className="dm-composer-textarea"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  // auto-grow
                  e.target.style.height = '48px'
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeConversation.title}…`}
                rows={1}
              />

              {/* Emoji popover */}
              {showEmojiPopover && (
                <div className="dm-emoji-popover">
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      className="dm-emoji-btn"
                      onClick={() => {
                        setDraft((prev) => prev + emoji)
                        setShowEmojiPopover(false)
                        textareaRef.current?.focus()
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Composer Toolbar */}
              <div className="dm-composer-toolbar">
                <div className="dm-composer-tools-left">
                  <button
                    type="button"
                    className="dm-composer-tool-btn"
                    onClick={() => {
                      setDraft((prev) => prev + ' 📍 [Meeting spot idea]')
                      textareaRef.current?.focus()
                    }}
                    title="Add location suggestion"
                    aria-label="Add location suggestion"
                  >
                    <MapPin size={16} />
                  </button>

                  <button
                    type="button"
                    className="dm-composer-tool-btn"
                    onClick={() => setShowEmojiPopover((v) => !v)}
                    title="Insert emoji"
                    aria-label="Insert emoji"
                  >
                    <Smile size={16} />
                  </button>

                  <button
                    type="button"
                    className="dm-composer-tool-btn"
                    onClick={startVoiceRecording}
                    title="Record voice note"
                    aria-label="Record voice note"
                  >
                    <Mic size={16} />
                  </button>
                </div>

                <div className="dm-composer-tools-right">
                  <span className="dm-composer-hint">Return to send</span>
                  <button
                    type="button"
                    className="dm-send-btn"
                    onClick={() => handleSendMessage()}
                    disabled={!draft.trim()}
                    aria-label="Send message"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. RIGHT-SIDE DETAILS PANEL
            ==================================================================== */}
        {showDetails && (
          <aside className="dm-details-panel">
            <div className="dm-details-header">
              <h3>Details</h3>
              <button
                className="dm-details-close-btn"
                onClick={() => setShowDetails(false)}
                aria-label="Close details"
              >
                <X size={15} />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="dm-details-profile">
              <div className={`dm-avatar dm-avatar-lg ${activeConversation.avatarClass}`}>
                {activeConversation.isGroup ? <Users size={24} /> : activeConversation.initials}
              </div>
              <div className="dm-details-name">{activeConversation.title}</div>
              {activeConversation.handle && (
                <div className="dm-details-handle">{activeConversation.handle}</div>
              )}
              {activeConversation.prompt && (
                <p className="dm-details-bio">{activeConversation.prompt}</p>
              )}
              {activeConversation.location && (
                <div className="dm-details-meta-row">
                  <span className="dm-details-meta-item">
                    <MapPin size={13} style={{ color: 'var(--dm-text-muted)' }} />
                    {activeConversation.location}
                  </span>
                </div>
              )}
            </div>

            {/* Shared Media */}
            <div className="dm-details-section">
              <div className="dm-details-section-head">
                <span className="dm-details-section-title">Shared Media</span>
                <span className="dm-details-section-count">3 photos</span>
              </div>
              <div className="dm-shared-media-grid">
                <div
                  className="dm-media-thumb"
                  onClick={() => showToast('Opening photo: Gallery visit - Mercer St')}
                  title="Gallery visit"
                >
                  <ImageIcon size={18} style={{ color: 'var(--dm-text-muted)' }} />
                  <span className="dm-media-thumb-label">Gallery</span>
                </div>
                <div
                  className="dm-media-thumb"
                  onClick={() => showToast('Opening photo: Cafe menu and bakery')}
                  title="Cafe & Bakery"
                >
                  <ImageIcon size={18} style={{ color: 'var(--dm-text-muted)' }} />
                  <span className="dm-media-thumb-label">Cafe</span>
                </div>
                <div
                  className="dm-media-thumb"
                  onClick={() => showToast('Opening photo: SoHo sunset walk')}
                  title="SoHo Walk"
                >
                  <ImageIcon size={18} style={{ color: 'var(--dm-text-muted)' }} />
                  <span className="dm-media-thumb-label">SoHo</span>
                </div>
              </div>
            </div>

            {/* Shared Links */}
            <div className="dm-details-section">
              <div className="dm-details-section-head">
                <span className="dm-details-section-title">Shared Links</span>
                <span className="dm-details-section-count">2 links</span>
              </div>
              <div>
                <a
                  href="#open-link"
                  className="dm-shared-link-item"
                  onClick={(e) => {
                    e.preventDefault()
                    showToast('Opening Google Maps: Maman Bakery, SoHo')
                  }}
                >
                  <div className="dm-shared-link-icon">
                    <MapPin size={14} />
                  </div>
                  <div className="dm-shared-link-content">
                    <div className="dm-shared-link-title">Maman Bakery & Cafe</div>
                    <div className="dm-shared-link-domain">maps.google.com</div>
                  </div>
                  <ExternalLink size={13} style={{ color: 'var(--dm-text-faint)' }} />
                </a>

                <a
                  href="#open-playlist"
                  className="dm-shared-link-item"
                  onClick={(e) => {
                    e.preventDefault()
                    showToast('Opening playlist: Sunday Morning Walking Beats')
                  }}
                >
                  <div className="dm-shared-link-icon">
                    <Volume2 size={14} />
                  </div>
                  <div className="dm-shared-link-content">
                    <div className="dm-shared-link-title">Sunday Morning Beats</div>
                    <div className="dm-shared-link-domain">open.spotify.com</div>
                  </div>
                  <ExternalLink size={13} style={{ color: 'var(--dm-text-faint)' }} />
                </a>
              </div>
            </div>

            {/* Pinned Starter */}
            {activeConversation.prompt && (
              <div className="dm-details-section">
                <div className="dm-details-section-head">
                  <span className="dm-details-section-title">Pinned Note</span>
                </div>
                <div className="dm-pinned-card">
                  <div className="dm-pinned-card-head">
                    <Pin size={11} />
                    <span>Icebreaker Prompt</span>
                  </div>
                  {activeConversation.prompt}
                </div>
              </div>
            )}

            {/* Privacy & Settings */}
            <div className="dm-details-section" style={{ borderBottom: 'none' }}>
              <div className="dm-details-section-head">
                <span className="dm-details-section-title">Settings & Privacy</span>
              </div>
              <div className="dm-settings-row">
                <span className="dm-settings-label">Mute notifications</span>
                <label className="dm-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(activeConversation.muted)}
                    onChange={toggleMute}
                  />
                  <span className="dm-switch-slider" />
                </label>
              </div>

              <button
                className="dm-destructive-btn"
                onClick={() => {
                  showToast(`${activeConversation.title} has been muted and restricted.`)
                }}
              >
                Block {activeConversation.title}
              </button>
              <button
                className="dm-destructive-btn"
                onClick={() => {
                  showToast('Report submitted. Our team reviews all reports within 24 hours.')
                }}
              >
                Report conversation
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ====================================================================
          MODALS & OVERLAYS
          ==================================================================== */}

      {/* New Message Modal */}
      {showNewMsgModal && (
        <div className="dm-modal-backdrop" onClick={() => setShowNewMsgModal(false)}>
          <div className="dm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h3>Start a new conversation</h3>
              <button
                className="dm-details-close-btn"
                onClick={() => setShowNewMsgModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="dm-modal-body">
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--dm-text-muted)',
                  marginTop: 0,
                  marginBottom: 12,
                }}
              >
                Choose someone from your orbit or nearby to message:
              </p>
              {demoProfiles.map((p) => (
                <button
                  key={p.id}
                  className="dm-contact-item"
                  onClick={() => startChatWithContact(p)}
                >
                  <div className={`dm-avatar dm-avatar-sm ${p.avatarClass}`}>
                    {p.initials}
                  </div>
                  <div>
                    <div className="dm-contact-name">{p.name}</div>
                    <div className="dm-contact-desc">
                      {p.city} · {p.energy}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voice Note Recording Simulator Modal (ElevenLabs ready) */}
      {showVoiceModal && (
        <div className="dm-modal-backdrop" onClick={() => setShowVoiceModal(false)}>
          <div className="dm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h3>Voice Note Studio</h3>
              <button
                className="dm-details-close-btn"
                onClick={() => setShowVoiceModal(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="dm-modal-body">
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dm-accent)' }}>
                  {voiceRecordingActive ? 'Listening & Transcribing…' : 'Recording Complete'}
                </span>
                <div style={{ fontSize: 24, fontWeight: 700, margin: '6px 0' }}>
                  00:{voiceRecordingSeconds < 10 ? `0${voiceRecordingSeconds}` : voiceRecordingSeconds}
                </div>
              </div>

              {/* Waveform graphic */}
              <div className="dm-voice-visualizer">
                <span className="dm-voice-bar" />
                <span className="dm-voice-bar" />
                <span className="dm-voice-bar" />
                <span className="dm-voice-bar" />
                <span className="dm-voice-bar" />
                <span className="dm-voice-bar" />
                <span className="dm-voice-bar" />
              </div>

              <div className="dm-voice-transcript-box">
                <strong style={{ display: 'block', marginBottom: 4, color: 'var(--dm-text-primary)' }}>
                  Live transcript (ElevenLabs pipeline):
                </strong>
                “Hey Maya, I’m near Prince Street right now — let’s grab that iced matcha at 3pm!”
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  className="dm-tab-btn"
                  onClick={() => setShowVoiceModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="dm-send-btn"
                  style={{ width: 'auto', padding: '0 14px', borderRadius: 6, fontSize: 12 }}
                  onClick={sendVoiceNote}
                >
                  Send voice note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Audio / Video Call Simulation Modal */}
      {callState?.active && (
        <div className="dm-call-modal-backdrop" onClick={endCall}>
          <div className="dm-call-card" onClick={(e) => e.stopPropagation()}>
            <div className="dm-call-avatar-wrap">
              <div className="dm-call-pulse-ring" />
              <div className={`dm-call-avatar ${callState.avatarClass}`}>
                {callState.initials}
              </div>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>
              {callState.contact}
            </h3>
            <p style={{ fontSize: '13px', color: '#c4a484', margin: '0 0 24px' }}>
              {callState.connected
                ? `${callState.type === 'video' ? 'Video call' : 'Audio call'} connected · ${Math.floor(
                    callState.seconds / 60
                  )
                    .toString()
                    .padStart(2, '0')}:${(callState.seconds % 60)
                    .toString()
                    .padStart(2, '0')}`
                : `Calling ${callState.contact}…`}
            </p>

            {/* Audio visualizer wave */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                height: '28px',
                marginBottom: '28px',
              }}
            >
              {[14, 22, 10, 26, 18, 28, 12, 20].map((h, idx) => (
                <span
                  key={idx}
                  style={{
                    width: '3px',
                    height: `${callState.connected ? h : 6}px`,
                    background: '#c4a484',
                    borderRadius: '2px',
                    transition: 'height 0.2s ease',
                  }}
                />
              ))}
            </div>

            <div className="dm-call-controls">
              <button
                type="button"
                className="dm-call-action-btn"
                onClick={() =>
                  setCallState((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : null))
                }
                title={callState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {callState.isMuted ? <Mic size={20} style={{ opacity: 0.4 }} /> : <Mic size={20} />}
              </button>
              <button
                type="button"
                className="dm-call-action-btn hangup"
                onClick={endCall}
                title="End call"
              >
                <Phone size={24} style={{ transform: 'rotate(135deg)' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#654321',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 0,
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(101, 67, 33, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
