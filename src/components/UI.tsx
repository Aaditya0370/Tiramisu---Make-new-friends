import { ArrowUpRight, Check, LoaderCircle, MapPin } from 'lucide-react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { cn } from '../lib/utils'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-header-action">{action}</div>}</header>
}

export function InterestPill({ children, selected = false, onClick }: { children: React.ReactNode; selected?: boolean; onClick?: () => void }) {
  const content = <><span className="pill-dot" />{children}</>
  return onClick ? <button className={cn('interest-pill', selected && 'is-selected')} onClick={onClick}>{content}</button> : <span className="interest-pill">{content}</span>
}

export function DemoBadge({ children = 'Demo profile' }: { children?: React.ReactNode }) {
  return <span className="demo-badge"><span className="demo-badge-dot" />{children}</span>
}

export function LocationLabel({ children }: { children: React.ReactNode }) {
  return <span className="location-label"><MapPin size={13} />{children}</span>
}

export function PrimaryButton({ children, onClick, type = 'button', disabled = false, loading = false, variant = 'primary', className = '' }: { children: React.ReactNode; onClick?: (event: ReactMouseEvent<HTMLButtonElement>) => void; type?: 'button' | 'submit'; disabled?: boolean; loading?: boolean; variant?: 'primary' | 'secondary' | 'ghost'; className?: string }) {
  return <button type={type} className={cn('button', `button-${variant}`, className)} onClick={onClick} disabled={disabled || loading}>{loading ? <LoaderCircle className="spin" size={16} /> : children}{!loading && variant === 'primary' && <ArrowUpRight size={16} />}</button>
}

export function SavedNotice({ children }: { children: React.ReactNode }) {
  return <div className="saved-notice"><Check size={15} />{children}</div>
}
