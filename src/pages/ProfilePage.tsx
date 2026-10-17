import { useState, useEffect } from 'react'
import {
  MapPin,
  Clock,
  LogOut,
  Pencil,
  Check,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { navigateTo } from '../lib/utils'

export function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth()

  // State for user details
  const [name, setName] = useState(
    profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Adi Gamerz'
  )
  const [location, setLocation] = useState(profile?.location || 'New York, NY')
  const [bio, setBio] = useState(
    profile?.bio ||
      'Collecting quiet joys, design experiments, and thoughtful people who make ordinary plans feel worth showing up for.'
  )
  const [isEditing, setIsEditing] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  // Social links state
  const [socials, setSocials] = useState({
    linkedin: profile?.linkedin || 'linkedin.com/in/adigamerz',
    instagram: profile?.instagram || '@adi.creatives',
    facebook: profile?.facebook || 'facebook.com/adigamerz',
    x: profile?.x || '@adigamerz',
  })

  useEffect(() => {
    if (profile) {
      if (profile.displayName) setName(profile.displayName)
      if (profile.location) setLocation(profile.location)
      if (profile.bio) setBio(profile.bio)
      setSocials({
        linkedin: profile.linkedin || 'linkedin.com/in/adigamerz',
        instagram: profile.instagram || '@adi.creatives',
        facebook: profile.facebook || 'facebook.com/adigamerz',
        x: profile.x || '@adigamerz',
      })
    }
  }, [profile])

  // Real-time clock hook (updates every second)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')

  useEffect(() => {
    function updateLiveTime() {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
      setCurrentDate(
        now.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      )
    }

    updateLiveTime()
    const timer = setInterval(updateLiveTime, 1000)
    return () => clearInterval(timer)
  }, [])

  async function handleToggleEdit() {
    if (isEditing) {
      const trimmedName = name.trim() || 'Adi Gamerz'
      const trimmedLocation = location.trim() || 'New York, NY'
      const trimmedBio = bio.trim()
      try {
        await updateProfile({
          displayName: trimmedName,
          location: trimmedLocation,
          bio: trimmedBio,
          linkedin: socials.linkedin.trim(),
          instagram: socials.instagram.trim(),
          facebook: socials.facebook.trim(),
          x: socials.x.trim(),
        })
        setSavedMessage('Profile changes sustained & saved!')
        setTimeout(() => setSavedMessage(null), 3000)
      } catch (err) {
        console.error('Failed to save profile to Firestore:', err)
      }
    }
    setIsEditing(!isEditing)
  }

  async function handleLogout() {
    try {
      await signOut()
    } catch {
      // Continue to login
    }
    navigateTo('/login')
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  return (
    <div
      className="profile-page-clean"
      style={{
        background: '#ffffff',
        minHeight: '100%',
        padding: '36px 32px 64px',
        maxWidth: '860px',
        margin: '0 auto',
      }}
    >
      {/* 1. Just a text saying: Your Profile */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h1
          style={{
            fontSize: '15px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#82664c',
            margin: 0,
          }}
        >
          Your Profile
        </h1>
        {savedMessage && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '99px',
              color: '#065f46',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.12)',
              animation: 'fade-in 0.2s ease-out',
            }}
          >
            <Check size={14} />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      {/* Main Profile Card Container */}
      <div
        style={{
          border: '1px solid #C4A484',
          borderRadius: 0,
          background: '#ffffff',
          padding: '36px 32px',
          boxShadow: '0 4px 16px rgba(101, 67, 33, 0.04)',
        }}
      >
        {/* Top Header: Avatar + Big Name + Location + Real Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '28px',
            flexWrap: 'wrap',
            paddingBottom: '28px',
            borderBottom: '1px solid #f2e7dc',
          }}
        >
          {/* Profile Picture */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C4A484 0%, #654321 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                boxShadow: '0 4px 14px rgba(101, 67, 33, 0.2)',
                border: '3px solid #ffffff',
                outline: '2px solid #C4A484',
              }}
            >
              {initials}
            </div>

            {/* Live Online Real-Time Pulse Beacon */}
            <div
              title="Real-time connected"
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '2px solid #ffffff',
                boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)',
              }}
            />
          </div>

          {/* Big Name & Info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#654321',
                    border: '1px solid #C4A484',
                    padding: '4px 8px',
                    borderRadius: 0,
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <h2
                  style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#654321',
                    letterSpacing: '-0.03em',
                    margin: '0 0 6px',
                    lineHeight: 1.1,
                  }}
                >
                  {name}
                </h2>
              )}

              <button
                onClick={handleToggleEdit}
                style={{
                  background: isEditing ? '#654321' : '#ffffff',
                  color: isEditing ? '#ffffff' : '#654321',
                  border: '1px solid #C4A484',
                  borderRadius: 0,
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {isEditing ? <Check size={14} /> : <Pencil size={14} />}
                <span>{isEditing ? 'Done' : 'Edit profile'}</span>
              </button>
            </div>

            {/* Location */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#654321',
                fontSize: '14px',
                fontWeight: 600,
                marginTop: '4px',
                marginBottom: '12px',
              }}
            >
              <MapPin size={16} style={{ color: '#C4A484' }} />
              {isEditing ? (
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    fontSize: '14px',
                    color: '#654321',
                    border: '1px solid #C4A484',
                    padding: '2px 6px',
                    borderRadius: 0,
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <span>{location}</span>
              )}
            </div>

            {/* Real-Time Live Clock Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fcfaf7',
                border: '1px solid #C4A484',
                padding: '6px 12px',
                borderRadius: 0,
                color: '#654321',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <Clock size={14} style={{ color: '#654321' }} />
              <span>Real-time: {currentTime || 'Loading…'}</span>
              <span style={{ color: '#82664c', fontWeight: 500 }}>· {currentDate}</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div style={{ padding: '24px 0', borderBottom: '1px solid #f2e7dc' }}>
          <h3
            style={{
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#82664c',
              margin: '0 0 10px',
            }}
          >
            Bio
          </h3>

          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#654321',
                border: '1px solid #C4A484',
                padding: '8px 12px',
                borderRadius: 0,
                outline: 'none',
                fontFamily: 'inherit',
                background: '#ffffff',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: 1.65,
                color: '#654321',
              }}
            >
              {bio}
            </p>
          )}
        </div>

        {/* Social Links Section: LinkedIn, Insta, Facebook, X, etc. */}
        <div style={{ padding: '24px 0', borderBottom: '1px solid #f2e7dc' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <h3
              style={{
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#82664c',
                margin: 0,
              }}
            >
              Socials & Links
            </h3>
            <span style={{ fontSize: '11px', color: '#82664c' }}>
              LinkedIn · Instagram · Facebook · X
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {/* LinkedIn */}
            <div
              style={{
                border: '1px solid #C4A484',
                borderRadius: 0,
                padding: '12px 14px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#82664c' }}>LinkedIn</span>
              {isEditing ? (
                <input
                  type="text"
                  value={socials.linkedin}
                  onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                  style={{
                    fontSize: '13px',
                    color: '#654321',
                    border: '1px solid #C4A484',
                    padding: '2px 6px',
                    borderRadius: 0,
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <a
                  href={`https://${socials.linkedin.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#654321',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{socials.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink size={12} style={{ color: '#C4A484' }} />
                </a>
              )}
            </div>

            {/* Instagram */}
            <div
              style={{
                border: '1px solid #C4A484',
                borderRadius: 0,
                padding: '12px 14px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#82664c' }}>Instagram</span>
              {isEditing ? (
                <input
                  type="text"
                  value={socials.instagram}
                  onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                  style={{
                    fontSize: '13px',
                    color: '#654321',
                    border: '1px solid #C4A484',
                    padding: '2px 6px',
                    borderRadius: 0,
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <a
                  href={`https://instagram.com/${socials.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#654321',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{socials.instagram}</span>
                  <ExternalLink size={12} style={{ color: '#C4A484' }} />
                </a>
              )}
            </div>

            {/* Facebook */}
            <div
              style={{
                border: '1px solid #C4A484',
                borderRadius: 0,
                padding: '12px 14px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#82664c' }}>Facebook</span>
              {isEditing ? (
                <input
                  type="text"
                  value={socials.facebook}
                  onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                  style={{
                    fontSize: '13px',
                    color: '#654321',
                    border: '1px solid #C4A484',
                    padding: '2px 6px',
                    borderRadius: 0,
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <a
                  href={`https://${socials.facebook.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#654321',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{socials.facebook.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <ExternalLink size={12} style={{ color: '#C4A484' }} />
                </a>
              )}
            </div>

            {/* X / Twitter */}
            <div
              style={{
                border: '1px solid #C4A484',
                borderRadius: 0,
                padding: '12px 14px',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#82664c' }}>X (Twitter)</span>
              {isEditing ? (
                <input
                  type="text"
                  value={socials.x}
                  onChange={(e) => setSocials({ ...socials, x: e.target.value })}
                  style={{
                    fontSize: '13px',
                    color: '#654321',
                    border: '1px solid #C4A484',
                    padding: '2px 6px',
                    borderRadius: 0,
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <a
                  href={`https://x.com/${socials.x.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#654321',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{socials.x}</span>
                  <ExternalLink size={12} style={{ color: '#C4A484' }} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Log out button */}
        <div
          style={{
            marginTop: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '12px', color: '#82664c' }}>
            Logged in as <strong>{user?.email || 'adigamerz1277@gmail.com'}</strong>
          </span>

          <button
            onClick={handleLogout}
            style={{
              background: '#654321',
              color: '#ffffff',
              border: '1px solid #654321',
              borderRadius: 0, // non-curved
              padding: '10px 22px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4e3215'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#654321'
            }}
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
