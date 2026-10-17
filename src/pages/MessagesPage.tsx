import { useMemo, useState } from 'react'
import { CheckCheck, ChevronLeft, Headphones, Info, Mic, MoreHorizontal, Paperclip, Search, Send, Sparkles, Volume2 } from 'lucide-react'
import { demoConversations, demoProfiles, type DemoMessage } from '../data/demo'
import { Avatar } from '../components/Brand'
import { DemoBadge, PageHeader, PrimaryButton } from '../components/UI'
import { cn } from '../lib/utils'

export function MessagesPage() {
  const [activeId, setActiveId] = useState(demoConversations[0].id)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState<DemoMessage[]>([])
  const activeConversation = demoConversations.find((conversation) => conversation.id === activeId) ?? demoConversations[0]
  const activeProfile = demoProfiles.find((profile) => profile.id === activeConversation.profileId) ?? demoProfiles[0]
  const filteredConversations = useMemo(() => demoConversations.filter((conversation) => demoProfiles.find((profile) => profile.id === conversation.profileId)?.name.toLowerCase().includes(query.toLowerCase())), [query])
  const allMessages = [...activeConversation.messages, ...sent.filter((message) => message.id.startsWith(activeId))]

  function sendMessage() {
    if (!draft.trim()) return
    setSent((current) => [...current, { id: `${activeId}-${Date.now()}`, from: 'me', text: draft.trim(), time: 'now' }])
    setDraft('')
  }

  return <div className="page-content messages-page"><PageHeader eyebrow="Keep the spark going" title="Messages" description="No awkward opener required. Start somewhere small and see where it goes." action={<button className="icon-button header-icon-button"><Headphones size={17} /></button>} />
    <div className="message-demo-banner"><div className="demo-banner-icon"><Info size={16} /></div><div><strong>Demo mode is on.</strong><span>These sample conversations stay in your browser. Supabase database + Realtime wiring is ready in the project SQL handoff.</span></div><button>See setup</button></div>
    <div className="messages-layout"><aside className="conversation-list"><div className="conversation-list-head"><div><span className="eyebrow">Your threads</span><h2>Good hellos</h2></div><span className="unread-total">2 unread</span></div><label className="mini-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" /></label><div className="conversation-items">{filteredConversations.map((conversation) => { const profile = demoProfiles.find((item) => item.id === conversation.profileId) ?? demoProfiles[0]; return <button key={conversation.id} className={cn('conversation-item', activeId === conversation.id && 'is-active')} onClick={() => { setActiveId(conversation.id); setSent([]) }}><Avatar initials={profile.initials} avatarClass={profile.avatarClass} size="md" online={profile.status.includes('online')} /><span className="conversation-copy"><strong>{profile.name}</strong><small>{conversation.preview}</small></span><span className="conversation-time">{conversation.time}{conversation.unread > 0 && <b>{conversation.unread}</b>}</span></button> })}</div><button className="new-message-button"><Sparkles size={15} /> Find someone new to message</button></aside>
      <section className="thread-panel"><header className="thread-header"><button className="thread-back"><ChevronLeft size={19} /></button><Avatar initials={activeProfile.initials} avatarClass={activeProfile.avatarClass} size="md" online /><div><h2>{activeProfile.name}</h2><span><i className="online-dot" /> {activeProfile.status}</span></div><div className="thread-actions"><button className="icon-button"><Volume2 size={17} /></button><button className="icon-button"><MoreHorizontal size={18} /></button></div></header><div className="thread-context"><span className="context-line" /><div><DemoBadge /><p>{activeProfile.prompt}</p></div><span className="context-line" /></div><div className="thread-body"><div className="date-divider"><span>Today</span></div>{allMessages.map((message) => <div className={cn('message-row', message.from === 'me' && 'from-me')} key={message.id}><div className="message-bubble"><p>{message.text}</p><span>{message.time} {message.from === 'me' && <CheckCheck size={13} />}</span></div></div>)}{allMessages.length === 0 && <div className="thread-empty"><Sparkles size={22} /><h3>Make the first tiny move.</h3><p>Reply to the conversation starter above, or send a simple hello.</p></div>}</div><div className="voice-placeholder"><div className="voice-placeholder-icon"><Mic size={15} /></div><span><strong>Voice notes are coming soon.</strong> ElevenLabs will transcribe before sending — no secret key in the browser.</span><button aria-label="Learn about voice messages"><Info size={15} /></button></div><form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage() }}><button type="button" className="composer-icon" aria-label="Attach a file"><Paperclip size={18} /></button><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a thoughtful hello…" /><button type="button" className="composer-voice" aria-label="Record a voice message"><Mic size={18} /></button><button type="submit" className="send-button" aria-label="Send message" disabled={!draft.trim()}><Send size={17} /></button></form></section>
    </div>
  </div>
}
