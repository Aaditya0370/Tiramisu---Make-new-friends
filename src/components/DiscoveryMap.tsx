import { useState, useMemo, useEffect } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import {
  Compass,
  LocateFixed,
  Radio,
  ZoomIn,
  ZoomOut,
  MessageCircle,
} from 'lucide-react'
import type { DemoProfile } from '../data/demo'
import { navigateTo } from '../lib/utils'

interface DiscoveryMapProps {
  profiles: DemoProfile[]
  selectedProfile?: DemoProfile | null
  onSelect: (profile: DemoProfile) => void
}

const USER_POSITION = { lat: 40.724, lng: -73.992 }
const GOOGLE_MAPS_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
  'AIzaSyCEnDZ9jN-RHYTWaFCj35u4euNs5-y5l0I'

function MapControls({
  onScan,
  isScanning,
  selectedProfile,
}: {
  onScan: () => void
  isScanning: boolean
  selectedProfile?: DemoProfile | null
}) {
  const map = useMap()

  // Recenter map on user location
  function handleRecenter() {
    if (!map) return
    map.panTo(USER_POSITION)
    map.setZoom(14)
  }

  function handleZoomIn() {
    if (!map) return
    const z = map.getZoom() || 14
    map.setZoom(z + 1)
  }

  function handleZoomOut() {
    if (!map) return
    const z = map.getZoom() || 14
    map.setZoom(Math.max(2, z - 1))
  }

  // Pan to selected profile when changed externally
  useEffect(() => {
    if (!map || !selectedProfile) return
    map.panTo({
      lat: selectedProfile.coordinates[0],
      lng: selectedProfile.coordinates[1],
    })
    map.setZoom(15)
  }, [map, selectedProfile])

  return (
    <>
      {/* Floating custom map controls */}
      <div className="maplibre-floating-controls" style={{ zIndex: 10 }}>
        <button
          type="button"
          className="map-control-btn"
          onClick={handleRecenter}
          title="Center on your location"
          aria-label="Center on your location"
        >
          <LocateFixed size={16} />
        </button>
        <button
          type="button"
          className="map-control-btn"
          onClick={handleZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          className="map-control-btn"
          onClick={handleZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
      </div>
    </>
  )
}

export function DiscoveryMap({ profiles, selectedProfile, onSelect }: DiscoveryMapProps) {
  const [maxDistance, setMaxDistance] = useState<'all' | '1mi' | '2mi'>('all')
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState<string | null>(null)
  const [activeWindowProfile, setActiveWindowProfile] = useState<DemoProfile | null>(null)

  // Filter profiles based on selected distance
  const filteredProfiles = useMemo(() => {
    if (maxDistance === 'all') return profiles
    return profiles.filter((p) => {
      const distMatch = p.distance.match(/([\d.]+) mi/)
      const dist = distMatch ? parseFloat(distMatch[1]) : 1.0
      return maxDistance === '1mi' ? dist <= 1.0 : dist <= 2.0
    })
  }, [profiles, maxDistance])

  function handleScanNearby() {
    setIsScanning(true)
    setScanMessage('Scanning neighborhood for active circles…')

    window.setTimeout(() => {
      setIsScanning(false)
      const count = filteredProfiles.length
      setScanMessage(`Found ${count} friendly people nearby`)
      window.setTimeout(() => setScanMessage(null), 3500)
    }, 1600)
  }

  function handleMarkerClick(profile: DemoProfile) {
    setActiveWindowProfile(profile)
    onSelect(profile)
  }

  return (
    <div className="map-card discovery-maplibre-card">
      {/* Top Header */}
      <div className="map-card-top">
        <div className="map-label">
          <Radio size={14} className={isScanning ? 'radar-spin' : ''} />
          <span>Google Maps Discovery</span>
        </div>

        <div className="map-top-actions">
          <button
            type="button"
            className={`map-scan-button ${isScanning ? 'is-active' : ''}`}
            onClick={handleScanNearby}
            disabled={isScanning}
            title="Scan for nearby friends"
          >
            <Compass size={14} />
            <span>{isScanning ? 'Scanning…' : 'Scan area'}</span>
          </button>
        </div>
      </div>

      {/* Distance filter tabs */}
      <div className="map-toolbar">
        <div className="map-distance-filters">
          <span className="map-filter-label">Distance:</span>
          <button
            type="button"
            className={`map-distance-btn ${maxDistance === 'all' ? 'is-active' : ''}`}
            onClick={() => setMaxDistance('all')}
          >
            All ({profiles.length})
          </button>
          <button
            type="button"
            className={`map-distance-btn ${maxDistance === '1mi' ? 'is-active' : ''}`}
            onClick={() => setMaxDistance('1mi')}
          >
            &lt; 1 mile
          </button>
          <button
            type="button"
            className={`map-distance-btn ${maxDistance === '2mi' ? 'is-active' : ''}`}
            onClick={() => setMaxDistance('2mi')}
          >
            &lt; 2 miles
          </button>
        </div>

        {/* Scan notice banner if active */}
        {scanMessage && (
          <div className="map-scan-banner">
            <Radio size={13} className="radar-spin" />
            <span>{scanMessage}</span>
          </div>
        )}
      </div>

      {/* Google Maps Container with explicit height to prevent height collapse (CF2) */}
      <div className="map-wrap maplibre-wrap" style={{ position: 'relative', width: '100%', height: '540px' }}>
        <APIProvider apiKey={GOOGLE_MAPS_KEY}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={USER_POSITION}
            defaultZoom={13.5}
            gestureHandling="greedy"
            disableDefaultUI={true}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapControls
              onScan={handleScanNearby}
              isScanning={isScanning}
              selectedProfile={selectedProfile}
            />

            {/* Current user location pin */}
            <AdvancedMarker position={USER_POSITION} title="Your Location">
              <div className="user-location-marker" aria-label="Your location">
                <div className="user-location-halo" />
                <div className="user-location-dot" />
              </div>
            </AdvancedMarker>

            {/* Friend markers */}
            {filteredProfiles.map((profile) => {
              const isSelected =
                selectedProfile?.id === profile.id || activeWindowProfile?.id === profile.id
              return (
                <AdvancedMarker
                  key={profile.id}
                  position={{
                    lat: profile.coordinates[0],
                    lng: profile.coordinates[1],
                  }}
                  onClick={() => handleMarkerClick(profile)}
                  title={profile.name}
                >
                  <div
                    className={`friend-map-marker ${profile.avatarClass} ${
                      isSelected ? 'is-selected' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="friend-marker-pin">
                      <div className="friend-marker-avatar">
                        {profile.initials}
                        {profile.status.includes('online') && (
                          <span className="friend-marker-online" />
                        )}
                      </div>
                      <div className="friend-marker-label">
                        <strong>{profile.name.split(' ')[0]}</strong>
                        <small>{profile.distance}</small>
                      </div>
                    </div>
                  </div>
                </AdvancedMarker>
              )
            })}

            {/* Selected Friend InfoWindow */}
            {activeWindowProfile && (
              <InfoWindow
                position={{
                  lat: activeWindowProfile.coordinates[0],
                  lng: activeWindowProfile.coordinates[1],
                }}
                onCloseClick={() => setActiveWindowProfile(null)}
                maxWidth={280}
              >
                <div
                  className="friend-popup-card"
                  style={{
                    padding: '8px',
                    fontFamily: 'inherit',
                    color: '#654321',
                  }}
                >
                  <div
                    className="friend-popup-head"
                    style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}
                  >
                    <div
                      className={`friend-popup-avatar ${activeWindowProfile.avatarClass}`}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        color: '#ffffff',
                      }}
                    >
                      {activeWindowProfile.initials}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', color: '#654321' }}>
                        {activeWindowProfile.name}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#82664c' }}>
                        {activeWindowProfile.handle} · {activeWindowProfile.city}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#fcfaf7',
                      border: '1px solid #ebd9c8',
                      padding: '8px 10px',
                      marginBottom: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        color: '#82664c',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Prompt
                    </span>
                    <p style={{ margin: '3px 0 0', fontStyle: 'italic', color: '#654321' }}>
                      “{activeWindowProfile.prompt}”
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => navigateTo('/messages')}
                      style={{
                        flex: 1,
                        background: '#654321',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <MessageCircle size={13} />
                      <span>Say hello</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelect(activeWindowProfile)}
                      style={{
                        flex: 1,
                        background: '#ffffff',
                        color: '#654321',
                        border: '1px solid #C4A484',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Profile
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Radar wave overlay when scanning */}
        {isScanning && <div className="radar-sweep-overlay" />}
      </div>
    </div>
  )
}
