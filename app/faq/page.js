import Link from 'next/link'
import { ArrowRight, ChevronDown, HelpCircle, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import Button from '@/components/Button'

export const metadata = {
  title: 'FAQ | BeGood A-Bar',
  description: 'Clear answers about A-Bar ingredients, timing, use, delivery, storage and checkout.'
}

const groups = [
  {
    title: 'Product & formula',
    questions: [
      {
        question: 'What is BeGood A-Bar?',
        answer: 'A-Bar is a 40 g functional chocolate bar made for calmer, clearer high-stakes moments. Its three key ingredients are L-Theanine, magnesium glycinate and chicory root extract.'
      },
      {
        question: 'What are the full ingredients?',
        answer: 'A-Bar contains L-Theanine, vitamin E, walnuts, chicory powder, cocoa powder, pumpkin seeds, coffee, dark chocolate, rolled oats, almond butter, dates, cocoa butter, honey, pink salt, magnesium glycinate, soy lecithin, glycerin and vanilla extract. Exact per-bar quantities are listed on the A-Bar product page.'
      },
      {
        question: 'How is the formula intended to work?',
        answer: 'L-Theanine is studied for relaxed-alertness support, magnesium contributes to normal nervous-system and psychological function, and chicory root is included to help support the formula’s magnesium-absorption strategy. A-Bar is a functional food, not a medicine, and individual experiences vary.'
      },
      {
        question: 'Is A-Bar vegetarian or vegan?',
        answer: 'A-Bar is vegetarian. It contains honey, so it is not vegan. It also contains walnuts, almonds and soy; check the pack carefully if you have food allergies or sensitivities.'
      }
    ]
  },
  {
    title: 'Use & experience',
    questions: [
      {
        question: 'When should I eat it?',
        answer: 'Enjoy one bar shortly before an exam, interview, presentation or another high-stakes moment. A-Bar is designed to act in less than 20 minutes. Timing and experience vary between people.'
      },
      {
        question: 'Will it make me drowsy?',
        answer: 'The formula is designed for calm focus rather than sedation. L-Theanine is studied for supporting relaxed alertness, but everyone responds differently.'
      },
      {
        question: 'Can I have it every day?',
        answer: 'A-Bar is a food product, but suitability depends on your diet, age, allergies, health conditions and medicines. Check the label and speak with a qualified healthcare professional if you are pregnant, nursing, managing a health condition or taking medication.'
      },
      {
        question: 'Is A-Bar a treatment for anxiety or stress?',
        answer: 'No. A-Bar is not intended to diagnose, treat, cure or prevent any disease or mental-health condition. If stress or anxiety is persistent or affecting daily life, please seek qualified professional support.'
      }
    ]
  },
  {
    title: 'Orders & care',
    questions: [
      {
        question: 'How should I store the bars?',
        answer: 'Keep A-Bar in a cool, dry place away from direct sunlight and heat. Natural cocoa-butter separation can create a pale or marbled surface in warm weather; this is not spoilage.'
      },
      {
        question: 'Where do you deliver?',
        answer: 'Delivery options and fees are shown clearly in the cart and checkout. Your local delivery band is estimated from the pincode you enter, and self-pickup is available in Jaipur.'
      },
      {
        question: 'Which payment methods are available?',
        answer: 'Online payment is securely handled by Razorpay and can include UPI, cards and netbanking. Cash on delivery is available for eligible products; hampers are prepaid only.'
      },
      {
        question: 'What if my order arrives damaged or incorrect?',
        answer: 'If the order is incorrect, incomplete, or its packaging is torn or crushed in transit, contact BeGood within 24 hours with a photo. Eligible cases can be replaced or refunded under the published policy.'
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="brand-page min-h-screen pb-20">
      <section className="relative overflow-hidden border-b border-[#e4d8c7] py-16 sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#d8c9e8]/40 blur-3xl" />
        <div className="brand-container relative text-center">
          <span className="brand-pill"><HelpCircle className="h-4 w-4" /> Clear answers, no fine print</span>
          <h1 className="mx-auto mt-6 max-w-4xl font-playfair text-5xl font-bold leading-tight text-[#2d2019] sm:text-6xl">Everything you may want to know before your first bite.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#59615b]">Formula, timing, safety, delivery and checkout—organized so the right answer is easy to find on any screen.</p>
        </div>
      </section>

      <section className="brand-container py-16 sm:py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          {groups.map((group, groupIndex) => (
            <div key={group.title} className="grid gap-5 lg:grid-cols-[0.32fr_0.68fr]">
              <div>
                <span className="font-playfair text-5xl font-bold text-[#ded4c5]">0{groupIndex + 1}</span>
                <h2 className="mt-2 text-xl font-bold text-[#2d2019]">{group.title}</h2>
              </div>
              <div className="space-y-3">
                {group.questions.map((faq) => (
                  <details key={faq.question} className="brand-card group overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 transition-colors hover:bg-[#f4efe6] sm:p-6">
                      <h3 className="font-bold leading-6 text-[#2d2019]">{faq.question}</h3>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef3ea]"><ChevronDown className="h-4 w-4 text-[#1f4b3c] transition-transform group-open:rotate-180" /></span>
                    </summary>
                    <div className="border-t border-[#e9dfcf] px-5 py-5 leading-7 text-[#59615b] sm:px-6">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-container">
        <div className="grid gap-6 rounded-[2rem] bg-[#172f28] p-7 text-[#fffaf1] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
          <div className="flex gap-5"><span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 sm:grid"><MessageCircle className="h-7 w-7 text-[#bfaed7]" /></span><div><p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#bfaed7]">Still deciding?</p><h2 className="mt-2 font-playfair text-3xl font-bold sm:text-4xl">Ask us directly.</h2><p className="mt-3 max-w-2xl leading-7 text-[#cddbd4]">We can help with ingredients, allergies, an order or the right bundle for your routine.</p></div></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link href="/contact"><Button variant="secondary" size="lg">Contact BeGood <ArrowRight className="ml-2 h-5 w-5" /></Button></Link><Link href="/product/begood-abar-001" className="inline-flex items-center justify-center gap-2 py-2 font-bold text-white">View A-Bar <Sparkles className="h-4 w-4" /></Link></div>
        </div>
        <p className="mx-auto mt-6 flex max-w-3xl items-start justify-center gap-2 text-center text-xs leading-5 text-[#6b736d]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Product information is educational and not medical advice. Always check the pack for the latest ingredient and allergen information.</p>
      </section>
    </div>
  )
}
