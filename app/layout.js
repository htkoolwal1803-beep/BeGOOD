import { SITE_URL } from '@/lib/seo'
import StructuredData from '@/components/StructuredData'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/lib/CartContext'
import { AuthProvider } from '@/lib/AuthContext'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'BeGood | A-Bar Functional Chocolate',
  description: 'Discover BeGood A-Bar functional chocolate with L-Theanine, magnesium glycinate and chicory root. Explore ingredients and shop bars and bundles.',
  verification: { google: 'H0iZwFX5FeTVI0TST6S9N6Ef-rUefSS9biYBMVhIwto' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="smooth-scroll">
      <head>
        {/* Google Analytics 4 */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `,
          }}
        />
        {/* Affiliate Tracking Script - Captures ref parameter site-wide */}
        <Script
          id="affiliate-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  const urlParams = new URLSearchParams(window.location.search);
                  const refCode = urlParams.get('ref');
                  
                  if (refCode) {
                    // Store affiliate code in localStorage
                    localStorage.setItem('affiliateCode', refCode.toUpperCase());
                    console.log('Affiliate code captured:', refCode.toUpperCase());
                    
                    // Track affiliate click
                    fetch('/api/affiliate/track', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code: refCode })
                    }).catch(err => console.error('Affiliate tracking error:', err));
                  }
                }
              })();
            `,
          }}
        />
        {/* Razorpay Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <StructuredData data={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', '@id': SITE_URL + '/#organization', name: 'BeGood', url: SITE_URL },
            { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: 'BeGood', url: SITE_URL, publisher: { '@id': SITE_URL + '/#organization' } },
          ],
        }} />
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            {/* Recaptcha Container for Firebase OTP */}
            <div id="recaptcha-container"></div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
