import { Compass, Gamepad2, Sparkles, UserRound } from 'lucide-react'
import { BrandMark, Avatar } from './Brand'
import { cn, navigateTo } from '../lib/utils'

type NavItem = { path: string; label: string; icon: typeof Compass; badge?: string }

const items: NavItem[] = [
  { path: '/messages', label: 'AI Chat', icon: Sparkles, badge: 'AI' },
  { path: '/joy', label: 'Joy Room', icon: Gamepad2 },
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/profile', label: 'Profile', icon: UserRound },
]

export function Navigation({ path, userEmail, userName }: { path: string; userEmail?: string; userName?: string }) {
  const current = path === '/' ? '/discover' : path
  const displayName = userName || userEmail?.split('@')[0] || 'Your profile'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

  return (
    <>
      <aside className="sidebar">
        <button
          type="button"
          className="brand-button"
          onClick={() => navigateTo('/discover')}
          aria-label="Go to Discover"
        >
          <BrandMark />
        </button>

        <div className="sidebar-kicker">Your social orbit</div>

        <nav className="nav-list" aria-label="Primary navigation">
          {items.map(({ path: itemPath, label, icon: Icon, badge }) => (
            <button
              key={itemPath}
              type="button"
              className={cn('nav-item', current === itemPath && 'is-active')}
              onClick={() => navigateTo(itemPath)}
            >
              <Icon size={18} strokeWidth={current === itemPath ? 2.4 : 1.8} />
              <span>{label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className={cn('sidebar-profile', current === '/profile' && 'is-active')}
            onClick={() => navigateTo('/profile')}
            aria-label="Open your profile"
            style={{
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'left',
              padding: '10px 8px',
              borderRadius: '8px',
            }}
          >
            <Avatar
              initials={initials}
              avatarClass="avatar-violet"
              size="sm"
              online
            />
            <div>
              <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {displayName}
              </strong>
              <span>Open profile</span>
            </div>
          </button>
        </div>
      </aside>

      <nav className="mobile-dock" aria-label="Mobile navigation">
        {items.map(({ path: itemPath, label, icon: Icon, badge }) => (
          <button
            key={itemPath}
            type="button"
            className={cn('dock-item', current === itemPath && 'is-active')}
            onClick={() => navigateTo(itemPath)}
          >
            <span className="dock-icon">
              <Icon size={19} />
              {badge && <span className="dock-badge">{badge}</span>}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
