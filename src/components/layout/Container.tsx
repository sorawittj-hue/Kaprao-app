import * as React from 'react'
import { cn } from '@/utils/cn'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  center?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'md', center = false, children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-xl',
      xl: 'max-w-2xl',
      full: 'max-w-none',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full mx-auto px-4',
          sizes[size],
          center && 'flex flex-col items-center justify-center',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = 'Container'

export { Container }
