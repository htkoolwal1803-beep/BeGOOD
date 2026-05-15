import { cn } from '@/lib/utils'

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6f8a74]/30 focus:ring-offset-2 focus:ring-offset-[#fbf7ed] disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-[#6f8a74] text-[#fbf7ed] shadow-[0_14px_28px_-18px_rgba(31,34,41,0.9)] hover:bg-[#536a58]',
    secondary: 'bg-[#f4ecdd] text-[#1f2229] border border-[#d9cbb5] hover:bg-[#e8ddc9]',
    outline: 'border border-[#6f8a74] text-[#536a58] bg-transparent hover:bg-[#6f8a74] hover:text-[#fbf7ed]'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-full',
    md: 'px-6 py-3 text-base rounded-full',
    lg: 'px-8 py-4 text-lg rounded-full'
  }
  
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
