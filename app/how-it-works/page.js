import { pageMetadata } from '@/lib/seo'
export const metadata = pageMetadata("A-Bar Ingredients & Formulation | BeGood", "Explore the ingredients in BeGood A-Bar, including L-Theanine, magnesium glycinate and chicory root, and learn about the formulation.", "/how-it-works")
import HowItWorksSection from '@/components/HowItWorksSection'



export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      <HowItWorksSection />
    </div>
  )
}

