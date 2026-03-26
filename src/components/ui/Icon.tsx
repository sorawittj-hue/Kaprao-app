import { LucideProps } from 'lucide-react'
import * as Icons from 'lucide-react'
import { cn } from '@/utils/cn'
import React from 'react'

export type IconName = keyof typeof Icons

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName
  size?: number | string
  className?: string
}

/**
 * Unified Icon Component
 * ใช้ Lucide Icons เป็นหลักเพื่อความสม่ำเสมอ
 */
export function Icon({ name, size = 24, className, ...props }: IconProps) {
  const LucideIcon = Icons[name]

  if (!LucideIcon || typeof LucideIcon !== 'function') {
    console.warn(`Icon "${name}" not found in lucide-react`)
    return null
  }

  const IconComponent = LucideIcon as React.ComponentType<LucideProps>

  return (
    <IconComponent
      width={size}
      height={size}
      className={cn('text-current', className)}
      {...props}
    />
  )
}

/**
 * Pre-defined icon components for common use cases
 */

/**
 * Icon Button Component
 * ปุ่มไอคอนพร้อม accessibility
 */
interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  icon: IconName
  size?: number
  variant?: 'default' | 'ghost' | 'outline' | 'filled'
  'aria-label': string
}

export function IconButton({
  icon,
  size = 24,
  variant = 'ghost',
  className,
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) {
  const variants = {
    default: 'bg-brand-500 text-white hover:bg-brand-600',
    ghost: 'hover:bg-gray-100 text-gray-600',
    outline: 'border-2 border-gray-200 hover:bg-gray-50 text-gray-600',
    filled: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        variants[variant],
        className
      )}
      aria-label={ariaLabel}
      {...props}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}

export default Icon
