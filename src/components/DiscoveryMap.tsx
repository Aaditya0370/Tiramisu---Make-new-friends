import { useState, useMemo, useEffect, useRef } from 'react'
import L from 'leaflet'
import {
  Compass,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
} from 'lucide-react'
import type { DemoProfile } from '../data/demo'
import { navigateTo } from '../lib/utils'

interface DiscoveryMapProps {
  profiles: DemoProfile[]
  selectedProfile?: DemoProfile | null
  onSelect: (profile: DemoProfile) => void
}

const USER_POSITION = { lat: 40.724, lng: -73.992 }

type TileStyle = 'voyager' | 'osm' | 'positron'

const TILE_LAYERS: Record<TileStyle, { url: string; attribution: string; name: string }> = {
  voyager: {
    name: 'Voyager (Warm)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  positron: {
    name: 'Positron (Light)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

export function DiscoveryMap({ profiles, selectedProfile, onSelect }: DiscoveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  const [tileStyle, setTileStyle] = useState<TileStyle>('voyager')
  const [maxDistance, setMaxDistance] = useState<'all' | '1mi' | '2mi'>('all')
  const [isScanning, setIsScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState<string | null>(null)

  // Filter profiles based on distance tab
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const distMatch = p.distance.match(/([\d.]+)\s*mi/)
      const dist = distMatch ? parseFloat(distMatch[1]) : 1.0
      if (maxDistance === '1mi') return dist <= 1.0
      if (maxDistance === '2mi') return dist <= 2.0
      return true
    })
  }, [profiles, maxDistance])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(containerRef.current, {
      center: [USER_POSITION.lat, USER_POSITION.lng],
      zoom: 14,
      zoomControl: false,
    })

    const initialTiles = TILE_LAYERS[tileStyle]
    const tileLayer = L.tileLayer(initialTiles.url, {
      attribution: initialTiles.attribution,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)
    tileLayerRef.current = tileLayer

    // User location pulsing beacon
    const userDiv = L.divIcon({
      className: 'leaflet-custom-user-marker',
      html: `
        <div class="user-location-marker" title="Your location (SoHo, NYC)">
          <div class="user-location-halo"></div>
          <div class="user-location-dot"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })
    L.marker([USER_POSITION.lat, USER_POSITION.lng], { icon: userDiv })
      .bindTooltip('You are here (SoHo)', { direction: 'top', offset: [0, -10] })
      .addTo(map)

    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer
    mapRef.current = map

    // Fix map container size on render
    const timeout = setTimeout(() => {
      map.invalidateSize()
    }, 200)

    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', onResize)
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Switch tile style dynamically
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current)
    }

    const currentConfig = TILE_LAYERS[tileStyle]
    const newTileLayer = L.tileLayer(currentConfig.url, {
      attribution: currentConfig.attribution,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)
    tileLayerRef.current = newTileLayer
  }, [tileStyle])

  // Update profile markers when list or selection changes
  useEffect(() => {
    const map = mapRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer) return

    markersLayer.clearLayers()

    filteredProfiles.forEach((profile) => {
      const isSelected = selectedProfile?.id === profile.id

      const icon = L.divIcon({
        className: 'leaflet-custom-profile-marker',
        html: `
          <div class="friend-map-marker ${profile.avatarClass} ${isSelected ? 'is-selected' : ''}" style="cursor:pointer;">
            <div class="friend-marker-pin">
              <div class="friend-marker-avatar">
                ${profile.initials}
                ${profile.status.includes('online') || profile.status.includes('Active') ? '<span class="friend-marker-online"></span>' : ''}
              </div>
              <div class="friend-marker-label">
                <strong>${profile.name.split(' ')[0]}</strong>
                <small>${profile.distance}</small>
              </div>
            </div>
          </div>
        `,
        iconSize: [64, 52],
        iconAnchor: [32, 50],
      })

      const marker = L.marker([profile.coordinates[0], profile.coordinates[1]], { icon })

      const popupContent = document.createElement('div')
      popupContent.className = 'friend-popup-card'
      popupContent.style.padding = '6px'
      popupContent.style.fontFamily = 'inherit'
      popupContent.style.color = '#382015'
      popupContent.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <div class="friend-popup-avatar ${profile.avatarClass}" style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;color:#fff;flex-shrink:0;">
            ${profile.initials}
          </div>
          <div>
            <strong style="display:block; font-size:13px; color:#382015; font-weight:700;">${profile.name}</strong>
            <span style="font-size:11px; color:#82664c;">${profile.handle} · ${profile.city} (${profile.distance})</span>
          </div>
        </div>
        <div style="background:#fcfaf7; border:1px solid #ebd9c8; padding:8px 10px; margin-bottom:10px; font-size:11.5px; border-radius:6px; font-style:italic; color:#4a2b1c; line-height:1.4;">
          “${profile.prompt}”
        </div>
        <div style="display:flex; gap:6px;">
          <button id="leaflet-chat-${profile.id}" type="button" style="flex:1; background:#382015; color:#fff; border:none; padding:7px 10px; font-size:11.5px; font-weight:700; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px;">
            💬 Say hello
          </button>
          <button id="leaflet-view-${profile.id}" type="button" style="flex:1; background:#fff; color:#382015; border:1px solid #C4A484; padding:7px 10px; font-size:11.5px; font-weight:700; border-radius:6px; cursor:pointer;">
            View Profile
          </button>
        </div>
      `

      marker.bindPopup(popupContent, { maxWidth: 280, className: 'tiramisu-leaflet-popup' })

      marker.on('popupopen', () => {
        onSelect(profile)
        const chatBtn = document.getElementById(`leaflet-chat-${profile.id}`)
        if (chatBtn) {
          chatBtn.onclick = () => {
            sessionStorage.setItem('tiramisu_target_contact', profile.id)
            navigateTo('/messages')
          }
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
  }, [filteredProfiles, selectedProfile, onSelect])

  // Center on selected profile when requested externally
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

  function handleScanNearby() {
    setIsScanning(true)
    setScanMessage('Scanning 1.5 miles around SoHo for active friends…')
    setTimeout(() => {
      setIsScanning(false)
      setScanMessage(`Found ${filteredProfiles.length} active people nearby ready to hang!`)
      setTimeout(() => setScanMessage(null), 3500)
    }, 1200)
  }

  return (
    <div className="discovery-map-container" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '540px' }}>
      {/* Top Map Header Bar */}
      <div className="map-header">
        <div className="map-title-wrap">
          <span className="live-pulse" />
          <h2 className="map-title">Neighborhood Radar</h2>
          <span className="map-subtitle">SoHo & Greenwich Village · NYC</span>
        </div>

        <div className="map-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Tile Layer Selector */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f4ede4',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid #ebd9c8',
            }}
          >
            {(['voyager', 'osm', 'positron'] as TileStyle[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setTileStyle(st)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: tileStyle === st ? '#382015' : 'transparent',
                  color: tileStyle === st ? '#ffffff' : '#4a2b1c',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {st === 'voyager' ? 'Voyager' : st === 'osm' ? 'OSM' : 'Clean'}
              </button>
            ))}
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
          <div className="map-scan-banner" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
            <Sparkles size={13} />
            <span>{scanMessage}</span>
          </div>
        )}
      </div>

      {/* Leaflet Map Canvas */}
      <div
        className="map-wrap"
        style={{
          position: 'relative',
          width: '100%',
          height: '540px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #ebd9c8',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '540px' }} />

        {/* Floating Zoom & Recenter Controls */}
        <div
          className="maplibre-floating-controls"
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 1000,
          }}
        >
          <button
            type="button"
            className="map-control-btn"
            onClick={handleRecenter}
            title="Center on your location (SoHo)"
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

        {/* Radar wave overlay when scanning */}
        {isScanning && <div className="radar-sweep-overlay" />}
      </div>
    </div>
  )
}
