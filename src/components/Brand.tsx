import { cn } from '../lib/utils'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('brand-mark', compact && 'brand-mark-compact')} aria-label="Tiramisu home">
      <span className="brand-first">Tira</span>
      <span>misu</span>
    </div>
  )
}

export function Avatar({
  initials,
  avatarClass,
  size = 'md',
  online = false,
}: {
  initials: string
  avatarClass: string
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
}) {
  return (
    <span className={cn('avatar', avatarClass, `avatar-${size}`)}>
      {initials}
      {online && <span className="avatar-online" />}
    </span>
  )
}
