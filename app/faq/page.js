import { pageMetadata } from '@/lib/seo'
export const metadata = pageMetadata("A-Bar FAQs: Nutrition, Caffeine, Ingredients & Orders | BeGood", "Answers about BeGood A-Bar sugar, caffeine, calories, ingredients, research, allergies, daily use, delivery and orders.", "/faq")
import Link from 'next/link'
import { ArrowRight, ChevronDown, HelpCircle, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import Button from '@/components/Button'



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
        answer: 'A-Bar contains L-Theanine, vitamin E, walnuts, chicory powder, cocoa powder, pumpkin seeds, coffee, dark chocolate, rolled oats, almond butter, dates, cocoa butter, honey, pink salt, magnesium glycinate, soy lecithin, glycerin and vanilla extract. A-Bar is sweetened with dates and honey. Nutrition per 40 g bar is listed on the product page.'
      },
      {
        question: 'How is the formula intended to work?',
        answer: 'L-Theanine is studied for relaxed-alertness support, magnesium contributes to normal nervous-system and psychological function, and chicory root contributes fibre. These ingredient roles do not establish clinical effects of A-Bar. A-Bar is a functional food, not a medicine, and individual experiences vary.'
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
        answer: 'Enjoy one bar shortly before an exam, interview, presentation or another high-stakes moment. A specific onset time has not been established for A-Bar. Timing and experience vary between people.'
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
        answer: 'Keep A-Bar in a cool, dry place away from direct sunlight and heat. Cocoa-butter bloom can create a pale or marbled surface. If you are unsure about the condition of a bar, contact BeGood before eating it.'
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
        answer: 'If the order is incorrect, incomplete, or its packaging is torn or crushed in transit, contact BeGood within 24 hours with a photo. BeGood reviews exceptions under its published policy; a replacement may be offered at its discretion, and refunds are not guaranteed.'
      }
    ]
  }
]

groups.push(...[
  {
    "title": "Nutrition & dietary needs",
    "questions": [
      {
        "question": "Is A-Bar sugar-free or sweetened naturally?",
        "answer": "A-Bar is not sugar-free. It is sweetened with dates and honey. The tested formulation contains approximately 8.02 g total sugars per 40 g bar. Dates and honey still contribute sugars.",
        "href": "/research"
      },
      {
        "question": "How many calories and how much protein are in one A-Bar?",
        "answer": "One 40 g A-Bar provides approximately 175.92 kcal, 4.69 g protein and 4.50 g dietary fibre, calculated from the June 2026 laboratory sample results. Bundle nutrition is stated per bar, not per whole pack.",
        "href": "/research"
      },
      {
        "question": "Does A-Bar contain caffeine?",
        "answer": "The ingredient list includes coffee, cocoa and dark chocolate, so A-Bar should not be treated as caffeine-free. The supplied nutrition report does not measure caffeine, and a verified amount per bar is not available here. Contact BeGood before choosing it if you need to limit caffeine.",
        "href": "/contact"
      },
      {
        "question": "How much magnesium and L-theanine are in A-Bar?",
        "answer": "The lab measured total magnesium as Mg at 117.34 mg per 100 g, equivalent to approximately 46.94 mg per 40 g bar. This is total magnesium, not the weight of magnesium glycinate added. The report does not measure L-theanine; contact BeGood for current label information.",
        "href": "/research"
      },
      {
        "question": "Does A-Bar contain nuts, soy or gluten?",
        "answer": "A-Bar contains walnuts, almonds, soy and rolled oats. It should not be assumed to be gluten-free; gluten testing or certification is not established by the supplied report. Check the current pack and contact BeGood about allergy suitability before ordering.",
        "href": "/contact"
      },
      {
        "question": "Is A-Bar suitable for someone with diabetes?",
        "answer": "A-Bar contains carbohydrate and sugars, including dates and honey. It is not presented as a diabetes-specific food. A healthcare professional can help assess the nutrition information against your individual dietary needs.",
        "href": "/research"
      }
    ]
  },
  {
    "title": "Evidence & suitability",
    "questions": [
      {
        "question": "Does A-Bar relieve stress or treat anxiety?",
        "answer": "A-Bar is a functional chocolate food. Ingredient studies do not prove that the finished bar relieves stress or treats anxiety. No human clinical trial of A-Bar is included in the evidence reviewed for this site. It is not a substitute for mental-health care.",
        "href": "/research"
      },
      {
        "question": "How long does A-Bar take to work?",
        "answer": "A predictable onset time has not been established for A-Bar. Customer experiences and ingredient studies do not demonstrate that every bar works within 20 minutes.",
        "href": "/research"
      },
      {
        "question": "Is A-Bar clinically tested or university-approved?",
        "answer": "The supplied laboratory report tests nutritional composition, not clinical effectiveness. The academic opinion letter reviews ingredient literature and the formulation concept; it expressly does not certify efficacy, approve the product or endorse its commercial claims.",
        "href": "/research"
      },
      {
        "question": "Can children, pregnant or breastfeeding people eat A-Bar?",
        "answer": "The supplied evidence does not establish A-Bar suitability for children, pregnancy or breastfeeding. Review the full ingredient list with a qualified healthcare professional before use; do not infer suitability from the fact that it is chocolate.",
        "href": "/contact"
      },
      {
        "question": "Can I eat A-Bar while taking medicines or supplements?",
        "answer": "Ask your doctor or pharmacist to review the full ingredient list alongside your medicines and supplements. Do not replace prescribed treatment with A-Bar or assume that a food containing functional ingredients is suitable for everyone.",
        "href": "/research"
      }
    ]
  },
  {
    "title": "Buying A-Bar",
    "questions": [
      {
        "question": "Where can I buy BeGood A-Bar and which packs are available?",
        "answer": "Order through the BeGood shop at begoodshop.in. The catalogue includes a single 40 g A-Bar, a two-bar pack and a five-bar pack. Check the product page and checkout for current prices, availability and delivery charges.",
        "href": "/shop"
      },
      {
        "question": "Can I send someone a link with A-Bar already in their cart?",
        "answer": "Yes. Use the link below to open the cart with at least one single A-Bar. The customer can review the quantity, add their delivery details and choose an available payment method before placing the order.",
        "href": "/cart?product=begood-abar-001&quantity=1"
      },
      {
        "question": "What is the shelf life of A-Bar?",
        "answer": "Use the best-before or expiry date printed on your pack and follow its storage instructions. The submitted laboratory report does not establish a shelf life for every batch.",
        "href": "/contact"
      },
      {
        "question": "How do I contact BeGood about an order?",
        "answer": "Use the contact page and include your order number and a description of the issue. For wrong, missing or transit-damaged items, the published policy asks you to report the issue within 24 hours of delivery with clear photos.",
        "href": "/contact"
      }
    ]
  }
])

export default function FAQPage() {
  return (
    <div className="brand-page min-h-screen pb-20">
      <section className="relative overflow-hidden border-b border-[#e4d8c7] py-16 sm:py-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#d8c9e8]/40 blur-3xl" />
        <div className="brand-container relative text-center">
          <span className="brand-pill"><HelpCircle className="h-4 w-4" /> Clear answers, no fine print</span>
          <h1 className="mx-auto mt-6 max-w-4xl font-playfair text-5xl font-bold leading-tight text-[#2d2019] sm:text-6xl">Everything you may want to know before your first bite.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#59615b]">Common questions about A-Bar ingredients, sugar, caffeine, nutrition, research and ordering—answered with product information and clearly stated evidence limits.</p>
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
                    <div className="border-t border-[#e9dfcf] px-5 py-5 leading-7 text-[#59615b] sm:px-6">{faq.answer}{faq.href && <Link href={faq.href} className="mt-3 block font-semibold underline text-[#1f4b3c]">{faq.href.startsWith('/cart?') ? 'Open the A-Bar cart link' : faq.href === '/research' ? 'Read nutrition and evidence' : faq.href === '/shop' ? 'Browse A-Bar packs' : 'Contact BeGood'}</Link>}</div>
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


