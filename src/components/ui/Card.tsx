import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useReducedMotion } from '@/hooks'
import { hapticLight } from '@/utils/haptics'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isPressable?: boolean
  isHoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, isPressable, isHoverable, children, ...props }, ref) => {
    const reducedMotion = useReducedMotion()

    const cardContent = (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl bg-white border border-gray-100 shadow-soft',
          isHoverable && 'hover:shadow-soft-lg transition-shadow duration-300',
          isPressable && 'cursor-pointer active:scale-[0.98]',
          className
        )}
        onClick={(e) => {
          if (isPressable) {
            hapticLight()
          }
          props.onClick?.(e)
        }}
        {...props}
      >
        {children}
      </div>
    )

    if (!isHoverable || reducedMotion) {
      return cardContent
    }

    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {cardContent}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-bold text-lg leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
