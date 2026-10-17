import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { MapPin, ShieldCheck } from 'lucide-react'
import type { DemoProfile } from '../data/demo'
import { Avatar } from './Brand'
import { DemoBadge } from './UI'

export function DiscoveryMap({ profiles, onSelect }: { profiles: DemoProfile[]; onSelect: (profile: DemoProfile) => void }) {
  return (
    <div className="map-card">
      <div className="map-card-top"><div><div className="map-label"><MapPin size={14} /> Around you</div><h2>Around the corner, not in a catalog.</h2></div><span className="map-privacy"><ShieldCheck size={14} /> Approximate only</span></div>
      <div className="map-wrap">
        <MapContainer center={[40.721, -73.987]} zoom={13} scrollWheelZoom={false} zoomControl={false} className="leaflet-map">
          <TileLayer url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          {profiles.map((profile) => <CircleMarker key={profile.id} center={profile.coordinates} radius={11} pathOptions={{ color: '#0b1020', weight: 4, fillColor: '#c8ff5a', fillOpacity: 1 }} eventHandlers={{ click: () => onSelect(profile) }}><Popup><div className="map-popup"><Avatar initials={profile.initials} avatarClass={profile.avatarClass} size="sm" online /><div><strong>{profile.name}</strong><span>{profile.energy}</span></div></div><button className="popup-link" onClick={() => onSelect(profile)}>View profile</button></Popup></CircleMarker>)}
          <CircleMarker center={[40.721, -73.987]} radius={8} pathOptions={{ color: '#c8ff5a', weight: 5, fillColor: '#8c75ff', fillOpacity: 1 }} />
        </MapContainer>
        <div className="map-orbit-label"><span className="orbit-dot" /> Your approximate area</div>
        <div className="map-legend"><span><i className="legend-dot lime" />People nearby</span><span><i className="legend-dot violet" />You</span></div>
      </div>
    </div>
  )
}
