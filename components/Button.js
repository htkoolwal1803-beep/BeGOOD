import { cn } from '@/lib/utils'

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const baseClasses = 'inline-flex min-h-11 items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1f4b3c]/25 focus:ring-offset-2 focus:ring-offset-[#fffaf1] disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'bg-[#1f4b3c] text-white shadow-[0_16px_30px_-18px_rgba(31,75,60,.9)] hover:-translate-y-0.5 hover:bg-[#173c30] hover:shadow-[0_20px_38px_-20px_rgba(31,75,60,.95)]',
    secondary: 'border border-[#2d2019]/12 bg-[#fffaf1] text-[#2d2019] hover:-translate-y-0.5 hover:bg-white',
    outline: 'border border-[#1f4b3c]/40 bg-transparent text-[#1f4b3c] hover:-translate-y-0.5 hover:border-[#1f4b3c] hover:bg-[#dce9e2]/55'
  }

  const sizes = {
    sm: 'rounded-full px-4 py-2 text-sm',
    md: 'rounded-full px-6 py-3 text-sm',
    lg: 'rounded-full px-7 py-3.5 text-base sm:px-8 sm:py-4'
  }

  return (
    <button className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
