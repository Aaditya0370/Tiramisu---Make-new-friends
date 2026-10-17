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
  Sparkles,
  MapPin,
  Image as ImageIcon,
  FileText,
  Volume2,
  Bell,
  BellOff,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react'
import { demoConversations, demoProfiles, type DemoProfile } from '../data/demo'
import { formatInitials } from '../lib/utils'
import '../styles/messages-copilot.css'

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

export function MessagesPage() {
  const [conversations, setConversations] = useState<ExtendedConversation[]>(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string>(INITIAL_CONVERSATIONS[0].id)
  const [tab, setTab] = useState<TabType>('all')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [replyingTo, setReplyingTo] = useState<ExtendedMessage | null>(null)
  const [showDetails, setShowDetails] = useState(true)
  const [showInChatSearch, setShowInChatSearch] = useState(false)
  const [inChatQuery, setInChatQuery] = useState('')
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modals & popovers
  const [showNewMsgModal, setShowNewMsgModal] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceRecordingSeconds, setVoiceRecordingSeconds] = useState(0)
  const [voiceRecordingActive, setVoiceRecordingActive] = useState(false)
  const [showEmojiPopover, setShowEmojiPopover] = useState(false)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? conversations[0],
    [conversations, activeId]
  )

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unread > 0 ? c.unread : 0), 0),
    [conversations]
  )

  // Filter conversations by tab and search query
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Tab filter
      if (tab === 'unread' && c.unread === 0) return false
      if (tab === 'groups' && !c.isGroup) return false

      // Text query
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
  }, [activeConversation.messages])

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

  // Send message
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

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
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

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'
    }
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

    const voiceMsg: ExtendedMessage = {
      id: `voice-${Date.now()}`,
      from: 'me',
      text: `🎤 Voice note (${voiceRecordingSeconds}s) — “Hey, let’s definitely catch up this weekend!”`,
      time: timeStr,
      read: false,
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
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
      {/* Quiet top status bar */}
      <div className="dm-notice-bar">
        <div className="dm-notice-bar-left">
          <span className="dm-notice-dot" />
          <span className="dm-notice-pill">Direct Messages</span>
          <span>· Realtime client storage active · Supabase ready</span>
        </div>
        <button
          className="dm-notice-link"
          onClick={() => setShowVoiceModal(true)}
        >
          <Volume2 size={13} style={{ display: 'inline', marginRight: 4 }} />
          Voice note preview
        </button>
      </div>

      {/* Main Workstation */}
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
                      width: 170,
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
                        alert('Chat history exported (demo preview)')
                        setHeaderMenuOpen(false)
                      }}
                      style={{ fontSize: 12 }}
                    >
                      <ArrowUpRight size={14} />
                      <span>Export transcript</span>
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
                  <Sparkles size={14} />
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

            {displayedMessages.length === 0 && (
              <div className="dm-empty-sidebar" style={{ margin: 'auto' }}>
                <p>No messages match your search.</p>
              </div>
            )}

            <div ref={messagesEndRef} />
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
                  onClick={() => alert('Media preview: "Gallery visit - Mercer St"')}
                  title="Gallery visit"
                >
                  <ImageIcon size={18} style={{ color: 'var(--dm-text-muted)' }} />
                  <span className="dm-media-thumb-label">Gallery</span>
                </div>
                <div
                  className="dm-media-thumb"
                  onClick={() => alert('Media preview: "Cafe menu and bakery"')}
                  title="Cafe & Bakery"
                >
                  <ImageIcon size={18} style={{ color: 'var(--dm-text-muted)' }} />
                  <span className="dm-media-thumb-label">Cafe</span>
                </div>
                <div
                  className="dm-media-thumb"
                  onClick={() => alert('Media preview: "SoHo sunset walk"')}
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
                    alert('Opening maps link: Maman Bakery, SoHo')
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
                    alert('Opening playlist: Sunday Morning Walking Beats')
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
                  if (confirm(`Block ${activeConversation.title}? They won't be able to message you.`)) {
                    alert(`${activeConversation.title} has been blocked.`)
                  }
                }}
              >
                Block {activeConversation.title}
              </button>
              <button
                className="dm-destructive-btn"
                onClick={() => {
                  if (confirm(`Report ${activeConversation.title} for review?`)) {
                    alert('Report submitted. Our team reviews all reports within 24 hours.')
                  }
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
    </div>
  )
}
