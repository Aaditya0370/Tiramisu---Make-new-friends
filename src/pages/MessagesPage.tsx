import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import {
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  CheckCheck,
  MessageCircle,
  HelpCircle,
  MapPin,
  Heart,
  Compass,
  Smile,
} from 'lucide-react'
import { demoProfiles, type DemoProfile } from '../data/demo'
import { playChatTone } from '../lib/utils'

export type ChatMessage = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  senderName?: string
  read?: boolean
}

// Built-in Gemini social personas
const AI_PERSONAS: Array<{
  id: string
  name: string
  handle: string
  vibe: string
  city: string
  avatarClass: string
  initials: string
  prompt: string
  welcomeMsg: string
}> = [
  {
    id: 'maya',
    name: 'Maya Chen',
    handle: '@mayamakes',
    vibe: 'Product Designer · Creative spark',
    city: 'SoHo, NYC',
    avatarClass: 'avatar-lilac',
    initials: 'MC',
    prompt: 'A perfect Sunday is… a new neighborhood, a shared playlist, and no agenda.',
    welcomeMsg: `Hey! I'm Maya. I was just browsing a tiny print shop behind Mercer St. What are you up to today in SoHo?`,
  },
  {
    id: 'noah',
    name: 'Noah Williams',
    handle: '@noahlaughs',
    vibe: 'Stand-up comedy · Long walks',
    city: 'Lower East Side, NYC',
    avatarClass: 'avatar-coral',
    initials: 'NW',
    prompt: 'Always down for the scenic route and late-night diner runs.',
    welcomeMsg: `Hey there! Noah here. Halfway through a podcast stroll. Got any good comedy or food recs around downtown?`,
  },
  {
    id: 'elena',
    name: 'Elena Rostova',
    handle: '@elenafilm',
    vibe: 'Ceramics & 35mm film',
    city: 'East Village, NYC',
    avatarClass: 'avatar-mint',
    initials: 'ER',
    prompt: 'Looking for coffee shops with good light and quiet conversation.',
    welcomeMsg: `Hi! Elena here. Just picked up a fresh roll of film from Chinatown. Do you know any good quiet spots to read?`,
  },
  {
    id: 'tiramisu-guide',
    name: 'Tiramisu AI Matchmaker',
    handle: '@tiramisu.ai',
    vibe: 'Gemini 3.8 Flash · Local Social Concierge',
    city: 'Downtown Manhattan',
    avatarClass: 'avatar-violet',
    initials: 'AI',
    prompt: 'Helping you break the ice, plan low-pressure meetups, and find local vibes.',
    welcomeMsg: `Welcome to Tiramisu AI Chat! I'm your Gemini AI companion. Ask me for icebreakers, neighborhood hangout ideas in NYC, or test your conversation vibes with local personas.`,
  },
]

const QUICK_PROMPTS = [
  'What are the best cozy coffee spots in SoHo?',
  'Give me 3 low-pressure first hangout ideas',
  'What should I say to break the ice with someone who loves art?',
  'Plan a relaxing Sunday walk starting at Washington Square',
]

const STORAGE_KEY = 'tiramisu_ai_chat_history'

export function MessagesPage() {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(() => {
    // Check if target contact was stored from map
    const target = sessionStorage.getItem('tiramisu_target_contact')
    if (target) {
      sessionStorage.removeItem('tiramisu_target_contact')
      const found = AI_PERSONAS.find((p) => p.id === target)
      if (found) return found.id
    }
    return AI_PERSONAS[0].id
  })

  const currentPersona =
    AI_PERSONAS.find((p) => p.id === selectedPersonaId) || AI_PERSONAS[0]

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${currentPersona.id}`)
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return [
      {
        id: `init-${currentPersona.id}`,
        from: 'them',
        senderName: currentPersona.name,
        text: currentPersona.welcomeMsg,
        time: 'Just now',
        read: true,
      },
    ]
  })

  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Switch persona
  function handleSelectPersona(id: string) {
    if (id === selectedPersonaId) return
    setSelectedPersonaId(id)
    const persona = AI_PERSONAS.find((p) => p.id === id) || AI_PERSONAS[0]
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${id}`)
      if (saved) {
        setMessages(JSON.parse(saved))
        return
      }
    } catch {
      // ignore
    }
    setMessages([
      {
        id: `init-${id}-${Date.now()}`,
        from: 'them',
        senderName: persona.name,
        text: persona.welcomeMsg,
        time: 'Just now',
        read: true,
      },
    ])
  }

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY}_${currentPersona.id}`,
        JSON.stringify(messages)
      )
    } catch {
      // ignore
    }
  }, [messages, currentPersona.id])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Send message
  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || draft).trim()
    if (!text) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      from: 'me',
      text,
      time: timeStr,
      read: true,
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setDraft('')
    playChatTone(580, 0.08)

    if (textareaRef.current) {
      textareaRef.current.style.height = '46px'
    }

    setIsTyping(true)

    try {
      // Send to server-side Gemini endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          contactName: currentPersona.name,
          contactBio: currentPersona.vibe,
          contactInterests: currentPersona.vibe,
          contactPrompt: currentPersona.prompt,
          contactEnergy: currentPersona.vibe,
          history: updatedMessages,
        }),
      })

      let replyText = ''
      if (response.ok) {
        const data = await response.json()
        replyText = data.reply
      }

      if (!replyText) {
        replyText = `That's such a lovely point! I really appreciate people who take the time to connect. What's been the most memorable spot you've checked out recently?`
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        from: 'them',
        senderName: currentPersona.name,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      }

      setIsTyping(false)
      setMessages((prev) => [...prev, botMsg])
      playChatTone(860, 0.12)
    } catch (err) {
      console.warn('Gemini chat request error:', err)
      setIsTyping(false)

      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        from: 'them',
        senderName: currentPersona.name,
        text: `I totally get what you mean! Lower Manhattan always has something unexpected happening. Have you visited the parks around here lately?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      }
      setMessages((prev) => [...prev, fallbackMsg])
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  function handleClearChat() {
    if (confirm(`Reset conversation with ${currentPersona.name}?`)) {
      const resetMsg: ChatMessage = {
        id: `init-${currentPersona.id}-${Date.now()}`,
        from: 'them',
        senderName: currentPersona.name,
        text: currentPersona.welcomeMsg,
        time: 'Just now',
        read: true,
      }
      setMessages([resetMsg])
      localStorage.removeItem(`${STORAGE_KEY}_${currentPersona.id}`)
    }
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100vh',
        maxHeight: '100vh',
        background: '#ffffff',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* 1. TOP HEADER WITH PERSONA SELECTION */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #ebd9c8',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className={`friend-popup-avatar ${currentPersona.avatarClass}`}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(101, 67, 33, 0.15)',
            }}
          >
            {currentPersona.initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#382015',
                  letterSpacing: '-0.02em',
                }}
              >
                {currentPersona.name}
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#FCE7F3',
                  color: '#831843',
                  border: '1px solid #F472B6',
                  padding: '2px 8px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                <Sparkles size={11} /> Gemini 3.8
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#82664c' }}>
              {currentPersona.handle} · {currentPersona.vibe} · {currentPersona.city}
            </span>
          </div>
        </div>

        {/* Persona quick switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#82664c',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginRight: '4px',
            }}
          >
            Personas:
          </span>
          {AI_PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPersona(p.id)}
              style={{
                padding: '6px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedPersonaId === p.id ? '#382015' : '#ebd9c8',
                background: selectedPersonaId === p.id ? '#382015' : '#fcfaf7',
                color: selectedPersonaId === p.id ? '#ffffff' : '#4a2b1c',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClearChat}
            title="Reset conversation"
            style={{
              marginLeft: '8px',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '8px',
              background: '#fcfaf7',
              border: '1px solid #ebd9c8',
              color: '#82664c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* 2. PROMINENT SIMULATION NOTICE BANNER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '11px 24px',
          background: '#FDF2F8',
          borderBottom: '1px solid #FBCFE8',
          color: '#831843',
          fontSize: '12.5px',
          lineHeight: '1.45',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#FCE7F3',
            color: '#BE185D',
            border: '1px solid #F472B6',
            flexShrink: 0,
          }}
        >
          <Sparkles size={15} />
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#701A39' }}>
            Simulated Friend Persona · Gemini AI Wrapper
          </strong>
          <p style={{ margin: '2px 0 0', color: '#9D174D', fontSize: '12px' }}>
            Live community members in your area are currently onboarding to Tiramisu. This chat is simulated by Google Gemini 3.8 Flash so you can test icebreakers, banter, and neighborhood meetups right now.
          </p>
        </div>
      </div>

      {/* 3. MESSAGES SCROLL FEED */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 32px',
          display: 'flex',
          flexDirection: 'column',
          background: '#fcfaf7',
          gap: '10px',
        }}
      >
        {/* Context starter */}
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto 16px',
            padding: '10px 16px',
            background: '#ffffff',
            border: '1px solid #ebd9c8',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#82664c',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(101, 67, 33, 0.04)',
          }}
        >
          <span style={{ fontWeight: 700, color: '#382015' }}>Prompt idea: </span>
          “{currentPersona.prompt}”
        </div>

        {/* Message rows */}
        {messages.map((msg) => {
          const isMe = msg.from === 'me'
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '74%',
                marginBottom: '4px',
              }}
            >
              {!isMe && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#BE185D',
                    marginBottom: '3px',
                    paddingLeft: '4px',
                  }}
                >
                  {msg.senderName || currentPersona.name}
                </span>
              )}

              <div
                style={{
                  position: 'relative',
                  padding: '12px 18px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  wordBreak: 'break-word',
                  // USER = DARK BROWN, BOT = PINK
                  background: isMe ? '#2B160E' : '#FCE7F3',
                  color: isMe ? '#FFFFFF' : '#4A1224',
                  border: isMe ? '1px solid #432417' : '1px solid #F472B6',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: isMe
                    ? '0 3px 10px rgba(43, 22, 14, 0.3)'
                    : '0 3px 10px rgba(244, 114, 182, 0.18)',
                }}
              >
                <p style={{ margin: 0, fontWeight: isMe ? 400 : 500 }}>{msg.text}</p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    marginTop: '5px',
                    fontSize: '10.5px',
                    color: isMe ? 'rgba(255, 255, 255, 0.75)' : '#831843',
                  }}
                >
                  <span>{msg.time}</span>
                  {isMe && (
                    <span style={{ color: '#F472B6' }}>
                      <CheckCheck size={13} />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => copyText(msg.text, msg.id)}
                    title="Copy message"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      padding: '0 2px',
                      cursor: 'pointer',
                      opacity: 0.7,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Real-time Typing Bubble (Pink) */}
        {isTyping && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              alignSelf: 'flex-start',
              maxWidth: '74%',
              marginTop: '4px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#BE185D',
                marginBottom: '3px',
                paddingLeft: '4px',
              }}
            >
              {currentPersona.name}
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: '#FCE7F3',
                border: '1px solid #F472B6',
                borderRadius: '16px 16px 16px 4px',
                boxShadow: '0 2px 8px rgba(244, 114, 182, 0.16)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#831843', fontWeight: 600 }}>
                {currentPersona.name} is thinking & typing…
              </span>
              <div className="dm-typing-dots">
                <span style={{ background: '#BE185D' }} />
                <span style={{ background: '#BE185D' }} />
                <span style={{ background: '#BE185D' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. QUICK SUGGESTION CHIPS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 24px',
          background: '#ffffff',
          borderTop: '1px solid #ebd9c8',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#82664c',
            whiteSpace: 'nowrap',
          }}
        >
          Suggested:
        </span>
        {QUICK_PROMPTS.map((promptText, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(promptText)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              background: '#fcfaf7',
              border: '1px solid #ebd9c8',
              borderRadius: '99px',
              color: '#382015',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FCE7F3'
              e.currentTarget.style.borderColor = '#F472B6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fcfaf7'
              e.currentTarget.style.borderColor = '#ebd9c8'
            }}
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* 5. MESSAGE INPUT COMPOSER */}
      <footer
        style={{
          padding: '14px 24px 20px',
          background: '#ffffff',
          borderTop: '1px solid #ebd9c8',
          flexShrink: 0,
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '10px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              flex: 1,
              position: 'relative',
              background: '#fcfaf7',
              border: '1px solid #ebd9c8',
              borderRadius: '14px',
              padding: '8px 14px',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#382015'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56, 32, 21, 0.12)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#ebd9c8'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${currentPersona.name} (Gemini AI)…`}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                resize: 'none',
                fontSize: '13.5px',
                color: '#382015',
                maxHeight: '120px',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!draft.trim() || isTyping}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: draft.trim() ? '#2B160E' : '#ebd9c8',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: draft.trim() && !isTyping ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s ease, transform 0.1s ease',
              flexShrink: 0,
            }}
            title="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  )
}
