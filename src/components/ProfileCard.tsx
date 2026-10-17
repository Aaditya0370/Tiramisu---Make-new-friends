import { ArrowUpRight, MessageCircle, MoreHorizontal } from 'lucide-react'
import type { DemoProfile } from '../data/demo'
import { Avatar } from './Brand'
import { DemoBadge, InterestPill, LocationLabel, PrimaryButton } from './UI'

export function ProfileCard({ profile, featured = false, onSelect, onStart }: { profile: DemoProfile; featured?: boolean; onSelect: (profile: DemoProfile) => void; onStart: (profile: DemoProfile) => void }) {
  return <article className={`profile-card ${featured ? 'profile-card-featured' : ''}`} onClick={() => onSelect(profile)}>
    <div className="profile-card-top"><div className="profile-card-person"><Avatar initials={profile.initials} avatarClass={profile.avatarClass} size={featured ? 'lg' : 'md'} online={profile.status.includes('online')} /><div><h3>{profile.name}</h3><span className="handle">{profile.handle}</span></div></div><button className="icon-button" aria-label={`More about ${profile.name}`} onClick={(event) => { event.stopPropagation(); onSelect(profile) }}><MoreHorizontal size={18} /></button></div>
    <DemoBadge />
    <p className="profile-bio">{profile.bio}</p>
    <div className="profile-meta"><LocationLabel>{profile.city} · {profile.distance}</LocationLabel><span className="online-copy"><i />{profile.status}</span></div>
    <div className="interest-list">{profile.interests.map((interest) => <InterestPill key={interest}>{interest}</InterestPill>)}</div>
    <div className="profile-prompt"><span>Conversation starter</span><p>“{profile.prompt}”</p></div>
    <div className="card-actions"><PrimaryButton onClick={(event) => { event?.stopPropagation?.(); onStart(profile) }}>Start a conversation</PrimaryButton><button className="round-action" onClick={(event) => { event.stopPropagation(); onSelect(profile) }} aria-label="Open profile"><MessageCircle size={17} /></button></div>
  </article>
}

export function CompactProfile({ profile, onClick }: { profile: DemoProfile; onClick: () => void }) {
  return <button className="compact-profile" onClick={onClick}><Avatar initials={profile.initials} avatarClass={profile.avatarClass} size="md" online={profile.status.includes('online')} /><span><strong>{profile.name}</strong><small><i />{profile.energy}</small></span><ArrowUpRight size={16} /></button>
}
