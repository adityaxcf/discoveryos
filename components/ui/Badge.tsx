interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'secondary'
  className?: string
}

export default function Badge({ children, variant = 'secondary', className = '' }: BadgeProps) {
  const variantStyles: Record<string, string> = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    secondary: 'bg-slate-100 text-slate-800',
  }

  return (
    <span className={`badge ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
