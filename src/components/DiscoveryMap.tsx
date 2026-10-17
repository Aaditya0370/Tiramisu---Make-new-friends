import { useState, useMemo, useEffect, useRef } from 'react'
import L from 'leaflet'
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
  MapPin,
  Sparkles,
  Layers,
  AlertCircle,
  RefreshCw,
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

/**
 * LeafletStreetMap: High-fidelity, real-world interactive street map
 * Centered on SoHo NYC with CartoDB Voyager tiles, interactive custom avatar pins,
 * pulsing user beacon, popups, and click-to-chat actions.
 * 100% reliable, zero API key constraints, zero rate-limiting.
 */
function LeafletStreetMap({
  profiles,
  selectedProfile,
  onSelect,
  onOpenChat,
}: {
  profiles: DemoProfile[]
  selectedProfile?: DemoProfile | null
  onSelect: (p: DemoProfile) => void
  onOpenChat: (p: DemoProfile) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean up if existing
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(containerRef.current, {
      center: [USER_POSITION.lat, USER_POSITION.lng],
      zoom: 14,
      zoomControl: false,
    })

    // CartoDB Voyager tiles (warm cream aesthetic matching Tiramisu)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // User location marker
    const userDiv = L.divIcon({
      className: 'leaflet-custom-user-marker',
      html: `
        <div class="user-location-marker" title="Your location (SoHo)">
          <div class="user-location-halo"></div>
          <div class="user-location-dot"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
    L.marker([USER_POSITION.lat, USER_POSITION.lng], { icon: userDiv }).addTo(map)

    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Update profile markers when profiles change
  useEffect(() => {
    const map = mapRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer) return

    markersLayer.clearLayers()

    profiles.forEach((profile) => {
      const isSelected = selectedProfile?.id === profile.id

      const icon = L.divIcon({
        className: 'leaflet-custom-profile-marker',
        html: `
          <div class="friend-map-marker ${profile.avatarClass} ${isSelected ? 'is-selected' : ''}">
            <div class="friend-marker-pin">
              <div class="friend-marker-avatar">
                ${profile.initials}
                ${profile.status.includes('online') ? '<span class="friend-marker-online"></span>' : ''}
              </div>
              <div class="friend-marker-label">
                <strong>${profile.name.split(' ')[0]}</strong>
                <small>${profile.distance}</small>
              </div>
            </div>
          </div>
        `,
        iconSize: [60, 48],
        iconAnchor: [30, 48],
      })

      const marker = L.marker([profile.coordinates[0], profile.coordinates[1]], { icon })

      const popupContent = document.createElement('div')
      popupContent.className = 'friend-popup-card'
      popupContent.style.padding = '4px'
      popupContent.style.fontFamily = 'inherit'
      popupContent.style.color = '#654321'
      popupContent.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <div class="friend-popup-avatar ${profile.avatarClass}" style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:#fff;">
            ${profile.initials}
          </div>
          <div>
            <strong style="display:block; font-size:13px; color:#654321;">${profile.name}</strong>
            <span style="font-size:11px; color:#82664c;">${profile.handle} · ${profile.city} (${profile.distance})</span>
          </div>
        </div>
        <div style="background:#fcfaf7; border:1px solid #ebd9c8; padding:6px 8px; margin-bottom:8px; font-size:11px; border-radius:6px; font-style:italic; color:#654321;">
          “${profile.prompt}”
        </div>
        <div style="display:flex; gap:6px;">
          <button id="leaflet-chat-${profile.id}" type="button" style="flex:1; background:#654321; color:#fff; border:none; padding:6px 8px; font-size:11px; font-weight:700; border-radius:6px; cursor:pointer;">
            Say hello
          </button>
          <button id="leaflet-view-${profile.id}" type="button" style="flex:1; background:#fff; color:#654321; border:1px solid #C4A484; padding:6px 8px; font-size:11px; font-weight:700; border-radius:6px; cursor:pointer;">
            Profile
          </button>
        </div>
      `

      marker.bindPopup(popupContent, { maxWidth: 260 })

      marker.on('popupopen', () => {
        onSelect(profile)
        const chatBtn = document.getElementById(`leaflet-chat-${profile.id}`)
        if (chatBtn) {
          chatBtn.onclick = () => onOpenChat(profile)
        }
        const viewBtn = document.getElementById(`leaflet-view-${profile.id}`)
        if (viewBtn) {
          viewBtn.onclick = () => onSelect(profile)
        }
      })

      marker.on('click', () => {
        onSelect(profile)
      })

      marker.addTo(markersLayer)
    })
  }, [profiles, selectedProfile, onSelect, onOpenChat])

  // Center on selected profile
  useEffect(() => {
    if (!mapRef.current || !selectedProfile) return
    mapRef.current.panTo([selectedProfile.coordinates[0], selectedProfile.coordinates[1]], {
      animate: true,
      duration: 0.8,
    })
  }, [selectedProfile])

  function handleRecenter() {
    if (!mapRef.current) return
    mapRef.current.setView([USER_POSITION.lat, USER_POSITION.lng], 14, { animate: true })
  }

  function handleZoomIn() {
    if (!mapRef.current) return
    mapRef.current.zoomIn()
  }

  function handleZoomOut() {
    if (!mapRef.current) return
    mapRef.current.zoomOut()
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '520px' }} />
      <div className="maplibre-floating-controls" style={{ zIndex: 1000 }}>
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
    </div>
  )
}

function GoogleMapControls({
  selectedProfile,
}: {
  selectedProfile?: DemoProfile | null
}) {
  const map = useMap()

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

  useEffect(() => {
    if (!map || !selectedProfile) return
    map.panTo({
      lat: selectedProfile.coordinates[0],
      lng: selectedProfile.coordinates[1],
    })
    map.setZoom(15)
  }, [map, selectedProfile])

  return (
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
  )
}

/**
 * RadarCanvasMap: High-precision interactive neighborhood radar fallback
 * Renders street grids, landmarks, user coordinates, live radar pulse, and draggable pins
 */
function RadarCanvasMap({
  profiles,
  selectedProfile,
  onSelect,
  onOpenChat,
}: {
  profiles: DemoProfile[]
  selectedProfile?: DemoProfile | null
  onSelect: (p: DemoProfile) => void
  onOpenChat: (p: DemoProfile) => void
}) {
  const [zoom, setZoom] = useState(1.0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [activePin, setActivePin] = useState<DemoProfile | null>(selectedProfile || null)

  const centerLat = USER_POSITION.lat
  const centerLng = USER_POSITION.lng

  // Convert lat/lng to canvas pixel coordinates
  const getCoords = (lat: number, lng: number) => {
    const scale = 14000 * zoom
    const x = 320 + (lng - centerLng) * scale + offset.x
    const y = 260 - (lat - centerLat) * scale + offset.y
    return { x, y }
  }

  const userCoords = getCoords(centerLat, centerLng)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  const resetView = () => {
    setZoom(1.0)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <div
      className="radar-map-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#fcf8f3',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG Canvas Map Background with Streets and Landmarks */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <pattern id="street-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="rgba(196, 164, 132, 0.22)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="radar-pulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(196, 164, 132, 0.35)" />
            <stop offset="60%" stopColor="rgba(101, 67, 33, 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#street-grid)" />

        {/* Neighborhood Street representations */}
        <g stroke="rgba(196, 164, 132, 0.45)" strokeWidth="3" strokeLinecap="round">
          {/* Broadway */}
          <line
            x1={userCoords.x - 380}
            y1={userCoords.y - 280}
            x2={userCoords.x + 360}
            y2={userCoords.y + 300}
            strokeWidth="5"
            stroke="rgba(101, 67, 33, 0.22)"
          />
          {/* Houston St */}
          <line
            x1={userCoords.x - 450}
            y1={userCoords.y - 90}
            x2={userCoords.x + 450}
            y2={userCoords.y - 90}
            strokeWidth="4"
          />
          {/* Prince St */}
          <line
            x1={userCoords.x - 450}
            y1={userCoords.y - 15}
            x2={userCoords.x + 450}
            y2={userCoords.y - 15}
          />
          {/* Spring St */}
          <line
            x1={userCoords.x - 450}
            y1={userCoords.y + 65}
            x2={userCoords.x + 450}
            y2={userCoords.y + 65}
          />
          {/* Broome St */}
          <line
            x1={userCoords.x - 450}
            y1={userCoords.y + 145}
            x2={userCoords.x + 450}
            y2={userCoords.y + 145}
          />
          {/* Mercer St */}
          <line
            x1={userCoords.x - 90}
            y1={userCoords.y - 350}
            x2={userCoords.x - 90}
            y2={userCoords.y + 350}
          />
          {/* Lafayette St */}
          <line
            x1={userCoords.x + 110}
            y1={userCoords.y - 350}
            x2={userCoords.x + 110}
            y2={userCoords.y + 350}
          />
          {/* Bowery */}
          <line
            x1={userCoords.x + 230}
            y1={userCoords.y - 350}
            x2={userCoords.x + 230}
            y2={userCoords.y + 350}
            strokeWidth="4"
          />
        </g>

        {/* Street labels */}
        <g fill="#82664c" fontSize="10" fontWeight="600" opacity="0.75">
          <text x={userCoords.x - 220} y={userCoords.y - 96}>
            W Houston St
          </text>
          <text x={userCoords.x - 220} y={userCoords.y - 22}>
            Prince St
          </text>
          <text x={userCoords.x - 220} y={userCoords.y + 58}>
            Spring St
          </text>
          <text x={userCoords.x - 220} y={userCoords.y + 138}>
            Broome St
          </text>
          <text
            x={userCoords.x - 98}
            y={userCoords.y - 180}
            transform={`rotate(-90, ${userCoords.x - 98}, ${userCoords.y - 180})`}
          >
            Mercer St
          </text>
          <text
            x={userCoords.x + 102}
            y={userCoords.y - 180}
            transform={`rotate(-90, ${userCoords.x + 102}, ${userCoords.y - 180})`}
          >
            Lafayette St
          </text>
          <text
            x={userCoords.x - 40}
            y={userCoords.y - 40}
            transform={`rotate(38, ${userCoords.x - 40}, ${userCoords.y - 40})`}
            fill="#654321"
            fontWeight="700"
          >
            Broadway
          </text>
        </g>

        {/* Distance Range rings around user */}
        <circle
          cx={userCoords.x}
          cy={userCoords.y}
          r={70 * zoom}
          fill="none"
          stroke="rgba(101, 67, 33, 0.15)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <circle
          cx={userCoords.x}
          cy={userCoords.y}
          r={140 * zoom}
          fill="none"
          stroke="rgba(101, 67, 33, 0.1)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <text
          x={userCoords.x + 72 * zoom}
          y={userCoords.y - 4}
          fontSize="9"
          fill="#82664c"
          fontWeight="600"
        >
          0.5 mi
        </text>
        <text
          x={userCoords.x + 142 * zoom}
          y={userCoords.y - 4}
          fontSize="9"
          fill="#82664c"
          fontWeight="600"
        >
          1.0 mi
        </text>

        {/* Live Radar sweep radiating from user position */}
        <circle
          cx={userCoords.x}
          cy={userCoords.y}
          r={180 * zoom}
          fill="url(#radar-pulse)"
          className="radar-wave-anim"
        />
      </svg>

      {/* Floating Canvas Controls */}
      <div className="maplibre-floating-controls" style={{ zIndex: 15 }}>
        <button
          type="button"
          className="map-control-btn"
          onClick={resetView}
          title="Center on your location"
          aria-label="Center on your location"
        >
          <LocateFixed size={16} />
        </button>
        <button
          type="button"
          className="map-control-btn"
          onClick={() => setZoom((z) => Math.min(2.2, z + 0.25))}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          className="map-control-btn"
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.25))}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* User Location Center Pin */}
      <div
        style={{
          position: 'absolute',
          left: userCoords.x,
          top: userCoords.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div className="user-location-marker" aria-label="Your location">
          <div className="user-location-halo" />
          <div className="user-location-dot" />
        </div>
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(101, 67, 33, 0.9)',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          You (SoHo)
        </div>
      </div>

      {/* Friend Markers */}
      {profiles.map((profile) => {
        const coords = getCoords(profile.coordinates[0], profile.coordinates[1])
        const isSelected = activePin?.id === profile.id

        return (
          <div
            key={profile.id}
            style={{
              position: 'absolute',
              left: coords.x,
              top: coords.y,
              transform: 'translate(-50%, -100%)',
              zIndex: isSelected ? 25 : 12,
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation()
              setActivePin(profile)
              onSelect(profile)
            }}
          >
            <div
              className={`friend-map-marker ${profile.avatarClass} ${
                isSelected ? 'is-selected' : ''
              }`}
            >
              <div className="friend-marker-pin">
                <div className="friend-marker-avatar">
                  {profile.initials}
                  {profile.status.includes('online') && <span className="friend-marker-online" />}
                </div>
                <div className="friend-marker-label">
                  <strong>{profile.name.split(' ')[0]}</strong>
                  <small>{profile.distance}</small>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Selected Pin Info Card Popover */}
      {activePin && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            background: '#ffffff',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 10px 30px rgba(101, 67, 33, 0.22)',
            border: '1px solid #e6dacd',
            width: '90%',
            maxWidth: '360px',
            animation: 'pop-in 0.2s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              className={`friend-popup-avatar ${activePin.avatarClass}`}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                color: '#ffffff',
              }}
            >
              {activePin.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '15px', color: '#654321' }}>{activePin.name}</strong>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '99px',
                    background: '#f4ede4',
                    color: '#82664c',
                    fontWeight: 700,
                  }}
                >
                  {activePin.distance}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#82664c' }}>
                {activePin.handle} · {activePin.city}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActivePin(null)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#82664c',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '2px',
              }}
              title="Close"
            >
              ×
            </button>
          </div>

          <p
            style={{
              margin: '0 0 10px',
              fontSize: '12px',
              color: '#654321',
              lineHeight: 1.4,
              fontStyle: 'italic',
              background: '#fcfaf7',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #f0e6dc',
            }}
          >
            “{activePin.prompt}”
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onOpenChat(activePin)}
              style={{
                flex: 1,
                background: '#654321',
                color: '#ffffff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <MessageCircle size={14} />
              <span>Say hello</span>
            </button>
            <button
              type="button"
              onClick={() => onSelect(activePin)}
              style={{
                background: '#ffffff',
                color: '#654321',
                border: '1px solid #C4A484',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View profile
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DiscoveryMap({ profiles, selectedProfile, onSelect }: DiscoveryMapProps) {
  const [maxDistance, setMaxDistance] = useState<'all' | '1mi' | '2mi'>('all')
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState<string | null>(null)
  const [activeWindowProfile, setActiveWindowProfile] = useState<DemoProfile | null>(null)
  const [mapEngine, setMapEngine] = useState<'street' | 'radar' | 'google'>('street')
  const [googleMapsError, setGoogleMapsError] = useState(false)

  // Listen for global Google Maps auth or quota failures
  useEffect(() => {
    const handleQuota = () => {
      setGoogleMapsError(true)
      setMapEngine('street')
    }
    window.addEventListener('gmp-quota-exceeded', handleQuota)
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota)
  }, [])

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
    }, 1500)
  }

  function handleMarkerClick(profile: DemoProfile) {
    setActiveWindowProfile(profile)
    onSelect(profile)
  }

  function handleOpenChat(profile: DemoProfile) {
    sessionStorage.setItem('tiramisu_target_contact', profile.id)
    navigateTo('/messages?contact=' + encodeURIComponent(profile.id))
  }

  return (
    <div className="map-card discovery-maplibre-card">
      {/* Top Header */}
      <div className="map-card-top">
        <div className="map-label">
          <Radio size={14} className={isScanning ? 'radar-spin' : ''} />
          <span>Discovery Map</span>
          <span className="map-style-badge">
            {mapEngine === 'street'
              ? 'Live Street Map'
              : mapEngine === 'google' && !googleMapsError
              ? 'Google Maps'
              : 'Neighborhood Radar'}
          </span>
        </div>

        <div className="map-top-actions">
          {/* Engine toggle */}
          <div
            style={{
              display: 'inline-flex',
              background: '#f4ede4',
              borderRadius: '8px',
              padding: '2px',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setMapEngine('street')}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                background: mapEngine === 'street' ? '#654321' : 'transparent',
                color: mapEngine === 'street' ? '#ffffff' : '#654321',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Street Map
            </button>
            <button
              type="button"
              onClick={() => {
                setGoogleMapsError(false)
                setMapEngine('google')
              }}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                background: mapEngine === 'google' ? '#654321' : 'transparent',
                color: mapEngine === 'google' ? '#ffffff' : '#654321',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Google Maps
            </button>
            <button
              type="button"
              onClick={() => setMapEngine('radar')}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                background: mapEngine === 'radar' ? '#654321' : 'transparent',
                color: mapEngine === 'radar' ? '#ffffff' : '#654321',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Radar View
            </button>
          </div>

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

      {/* Map Container */}
      <div
        className="map-wrap maplibre-wrap"
        style={{ position: 'relative', width: '100%', height: '540px' }}
      >
        {mapEngine === 'street' ? (
          <LeafletStreetMap
            profiles={filteredProfiles}
            selectedProfile={selectedProfile}
            onSelect={onSelect}
            onOpenChat={handleOpenChat}
          />
        ) : mapEngine === 'google' && !googleMapsError ? (
          <APIProvider
            apiKey={GOOGLE_MAPS_KEY}
            libraries={['marker']}
            onError={() => {
              setGoogleMapsError(true)
              setMapEngine('street')
            }}
          >
            <Map
              mapId="bf51a910020fa25a"
              defaultCenter={USER_POSITION}
              defaultZoom={14}
              gestureHandling="greedy"
              disableDefaultUI={true}
              internalUsageAttributionIds={['gmp_git_agentskills_v1']}
              style={{ width: '100%', height: '100%' }}
            >
              <GoogleMapControls selectedProfile={selectedProfile} />

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
                      style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
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
                        onClick={() => handleOpenChat(activeWindowProfile)}
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
        ) : (
          <RadarCanvasMap
            profiles={filteredProfiles}
            selectedProfile={selectedProfile}
            onSelect={onSelect}
            onOpenChat={handleOpenChat}
          />
        )}

        {/* Radar wave overlay when scanning */}
        {isScanning && <div className="radar-sweep-overlay" />}
      </div>
    </div>
  )
}
