import { cn } from '@/lib/utils'

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-[#C8A97E] text-white hover:bg-[#B8956E] focus:ring-[#C8A97E]',
    secondary: 'bg-[#F5F0E8] text-gray-900 hover:bg-[#E5DFD7] focus:ring-[#C8A97E]',
    outline: 'border-2 border-[#C8A97E] text-[#C8A97E] hover:bg-[#C8A97E] hover:text-white focus:ring-[#C8A97E]'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg'
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