import { useMemo, useState } from 'react'
import { ArrowDownUp, Compass, Filter, LocateFixed, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'
import { demoProfiles, type DemoProfile } from '../data/demo'
import { DiscoveryMap } from '../components/DiscoveryMap'
import { ProfileCard } from '../components/ProfileCard'
import { Avatar } from '../components/Brand'
import { DemoBadge, InterestPill, LocationLabel, PageHeader, PrimaryButton } from '../components/UI'
import { navigateTo } from '../lib/utils'

const interests = ['All people', 'Design', 'Food trails', 'Music', 'Games', 'Photo walks']

export function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [activeInterest, setActiveInterest] = useState('All people')
  const [selected, setSelected] = useState<DemoProfile | null>(null)
  const profiles = useMemo(() => demoProfiles.filter((profile) => {
    const matchesQuery = `${profile.name} ${profile.bio} ${profile.interests.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    const matchesInterest = activeInterest === 'All people' || profile.interests.some((interest) => interest.toLowerCase().includes(activeInterest.toLowerCase().replace(' walks', '')))
    return matchesQuery && matchesInterest
  }), [activeInterest, query])
  const featured = profiles[0] ?? demoProfiles[0]

  return <div className="page-content discover-page">
    <PageHeader eyebrow="Your social orbit" title="Find a little more your kind of people." description="A few curious humans, approximate nearby. Start with a shared spark — the rest can unfold." action={<button className="location-button"><LocateFixed size={16} /><span>Use approximate location</span></button>} />
    <div className="discover-controls"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by interest, mood, or name" /><kbd>⌘ K</kbd></label><button className="filter-button"><SlidersHorizontal size={16} /> Filters <span>2</span></button><button className="sort-button"><ArrowDownUp size={16} /> Nearby first</button></div>
    <div className="interest-row" aria-label="Interest filters">{interests.map((interest) => <InterestPill key={interest} selected={activeInterest === interest} onClick={() => setActiveInterest(interest)}>{interest}</InterestPill>)}</div>
    <div className="discover-grid"><DiscoveryMap profiles={profiles} onSelect={setSelected} /><aside className="nearby-rail"><div className="section-heading"><div><span className="eyebrow"><Compass size={13} /> Just nearby</span><h2>{profiles.length} people in your orbit</h2></div><span className="live-count"><i />Live</span></div><div className="compact-list">{profiles.slice(0, 3).map((profile) => <button className="compact-person" key={profile.id} onClick={() => setSelected(profile)}><Avatar initials={profile.initials} avatarClass={profile.avatarClass} size="md" online={profile.status.includes('online')} /><span><strong>{profile.name}</strong><small>{profile.energy}</small></span><span className="compact-distance">{profile.distance}</span></button>)}</div><div className="nearby-note"><ShieldCheck size={16} /><p><strong>Privacy first.</strong> Pins are intentionally approximate. Your location stays yours until you choose otherwise.</p></div></aside></div>
    <div className="section-heading people-heading"><div><span className="eyebrow"><SparklesIcon /> A few good possibilities</span><h2>People worth a hello</h2></div><span className="results-copy">{profiles.length} results</span></div>
    <div className="profile-grid">{profiles.map((profile, index) => <ProfileCard key={profile.id} profile={profile} featured={index === 0} onSelect={setSelected} onStart={() => navigateTo('/messages')} />)}</div>
    {profiles.length === 0 && <div className="empty-card"><Filter size={22} /><h3>No exact match yet.</h3><p>Try a broader interest or a little less specificity. The good people are often hiding behind a synonym.</p><button onClick={() => { setQuery(''); setActiveInterest('All people') }}>Clear filters</button></div>}
    {selected && <div className="profile-modal-backdrop" onClick={() => setSelected(null)}><section className="profile-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close profile"><X size={18} /></button><div className="modal-profile-head"><Avatar initials={selected.initials} avatarClass={selected.avatarClass} size="lg" online /><div><DemoBadge /><h2>{selected.name}</h2><span>{selected.handle} · {selected.energy}</span></div></div><p className="modal-bio">{selected.bio}</p><div className="interest-list">{selected.interests.map((interest) => <InterestPill key={interest}>{interest}</InterestPill>)}</div><div className="modal-prompt"><span>Try opening with</span><p>“{selected.prompt}”</p></div><div className="modal-detail"><LocationLabel>{selected.city} · {selected.distance}</LocationLabel><span><i className="online-dot" /> {selected.status}</span></div><PrimaryButton onClick={() => navigateTo('/messages')} className="modal-cta">Start a conversation</PrimaryButton><p className="modal-safe"><ShieldCheck size={14} /> Approximate location only · no exact home pins</p></section></div>}
  </div>
}

function SparklesIcon() { return <span className="eyebrow-spark">✦</span> }
