import Link from 'next/link'
import { ArrowUpRight, Mail, MapPin, ShieldCheck } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

export default function Footer() {
  return (
    <footer className="bg-[#172f28] text-[#fffaf1]">
      <div className="brand-container py-14 sm:py-18 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.65fr_0.65fr]">
          <div>
            <Link href="/" className="block w-[210px] overflow-hidden rounded-xl bg-[#fffaf1] px-3 py-2">
              <BrandLogo />
            </Link>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#cddbd4]">
              Science-led functional chocolate for calmer, clearer high-stakes moments. No pills. No powders. Just a better ritual.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10">
                <Mail className="h-4 w-4" /> Contact us
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-[#cddbd4]">
                <MapPin className="h-4 w-4" /> Jaipur, India
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#bfaed7]">Explore</p>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                ['/shop', 'Shop A-Bar'],
                ['/how-it-works', 'How it works'],
                ['/about', 'Our story'],
                ['/faq', 'Questions'],
                ['/contact', 'Contact']
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex items-center gap-1 text-[#dce6e1] transition-colors hover:text-white">
                    {label} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#bfaed7]">Customer care</p>
            <ul className="mt-5 space-y-3 text-sm text-[#dce6e1]">
              <li><Link href="/profile?tab=orders" className="hover:text-white">Track orders</Link></li>
              <li><Link href="/refund" className="hover:text-white">Refund policy</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms & conditions</Link></li>
            </ul>
            <p className="mt-7 inline-flex items-start gap-2 text-xs leading-5 text-[#aebfb7]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Secure checkout powered by Razorpay
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs leading-5 text-[#9eb1a8] sm:flex-row sm:items-end sm:justify-between">
          <p>© {new Date().getFullYear()} BeGood. All rights reserved.</p>
          <p className="max-w-2xl sm:text-right">
            A-Bar is a functional food and is not intended to diagnose, treat, cure or prevent any disease. Individual experiences may vary.
          </p>
        </div>
      </div>
    </footer>
  )
}
