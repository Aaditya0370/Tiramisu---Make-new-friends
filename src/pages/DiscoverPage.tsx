import { useMemo, useState } from 'react'
import { ArrowDownUp, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react'
import { demoProfiles, type DemoProfile } from '../data/demo'
import { DiscoveryMap } from '../components/DiscoveryMap'
import { Avatar } from '../components/Brand'
import { DemoBadge, InterestPill, LocationLabel, PrimaryButton } from '../components/UI'
import { navigateTo } from '../lib/utils'

const interests = ['All people', 'Design', 'Food trails', 'Music', 'Games', 'Photo walks']

export function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [activeInterest, setActiveInterest] = useState('All people')
  const [selected, setSelected] = useState<DemoProfile | null>(null)

  const profiles = useMemo(() => {
    return demoProfiles.filter((profile) => {
      const matchesQuery = `${profile.name} ${profile.bio} ${profile.interests.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesInterest =
        activeInterest === 'All people' ||
        profile.interests.some((interest) =>
          interest.toLowerCase().includes(activeInterest.toLowerCase().replace(' walks', ''))
        )
      return matchesQuery && matchesInterest
    })
  }, [activeInterest, query])

  return (
    <div className="page-content discover-page">
      {/* 1. Discover Controls (Search box, filter button, sort button) */}
      <div className="discover-controls">
        <label className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by interest, mood, or name"
          />
          <kbd>⌘ K</kbd>
        </label>
        <button className="filter-button">
          <SlidersHorizontal size={16} /> Filters <span>2</span>
        </button>
        <button className="sort-button">
          <ArrowDownUp size={16} /> Nearby first
        </button>
      </div>

      {/* 2. Interest Filter Pills */}
      <div className="interest-row" aria-label="Interest filters">
        {interests.map((interest) => (
          <InterestPill
            key={interest}
            selected={activeInterest === interest}
            onClick={() => setActiveInterest(interest)}
          >
            {interest}
          </InterestPill>
        ))}
      </div>

      {/* 3. Full-width Discovery Map with MapLibre GL JS & Liberty Style */}
      <div className="discover-grid discover-grid-full">
        <DiscoveryMap
          profiles={profiles}
          selectedProfile={selected}
          onSelect={setSelected}
        />
      </div>

      {/* Selected Profile Detail Modal */}
      {selected && (
        <div className="profile-modal-backdrop" onClick={() => setSelected(null)}>
          <section className="profile-modal" onClick={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close profile"
            >
              <X size={18} />
            </button>
            <div className="modal-profile-head">
              <Avatar
                initials={selected.initials}
                avatarClass={selected.avatarClass}
                size="lg"
                online
              />
              <div>
                <DemoBadge />
                <h2>{selected.name}</h2>
                <span>
                  {selected.handle} · {selected.energy}
                </span>
              </div>
            </div>
            <p className="modal-bio">{selected.bio}</p>
            <div className="interest-list">
              {selected.interests.map((interest) => (
                <InterestPill key={interest}>{interest}</InterestPill>
              ))}
            </div>
            <div className="modal-prompt">
              <span>Try opening with</span>
              <p>“{selected.prompt}”</p>
            </div>
            <div className="modal-detail">
              <LocationLabel>
                {selected.city} · {selected.distance}
              </LocationLabel>
              <span>
                <i className="online-dot" /> {selected.status}
              </span>
            </div>
            <PrimaryButton
              onClick={() => {
                sessionStorage.setItem('tiramisu_target_contact', selected.id)
                navigateTo('/messages?contact=' + encodeURIComponent(selected.id))
              }}
              className="modal-cta"
            >
              Start a conversation
            </PrimaryButton>
          </section>
        </div>
      )}
    </div>
  )
}
