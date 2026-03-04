import { ChevronDown } from 'lucide-react'

export const metadata = {
  title: 'FAQ - BeGood | Frequently Asked Questions',
  description: 'Find answers to common questions about BeGood functional chocolate'
}

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is BeGood A-Bar?',
      answer: 'BeGood A-Bar is a premium functional chocolate bar infused with science-backed ingredients like Ashwagandha, L-Theanine, Dark Cocoa, and Magnesium. It\'s designed to help reduce anxiety and promote calm focus during high-stakes moments.'
    },
    {
      question: 'How does it work?',
      answer: 'The combination of Ashwagandha and L-Theanine works synergistically to reduce cortisol levels and promote alpha brain waves associated with relaxation and focus. Magnesium supports your nervous system, while dark cocoa provides natural mood enhancement.'
    },
    {
      question: 'When should I consume it?',
      answer: 'For best results, consume one bar 30-45 minutes before a high-stakes situation like an exam, interview, presentation, or any stressful event. It can also be enjoyed daily as part of your wellness routine.'
    },
    {
      question: 'Will it make me drowsy?',
      answer: 'No! BeGood A-Bar promotes calm focus without causing drowsiness. L-Theanine is specifically known for creating relaxed alertness, allowing you to stay sharp while feeling calm.'
    },
    {
      question: 'How long does the effect last?',
      answer: 'The calming effects typically begin within 30-45 minutes and can last for 4-6 hours, though individual results may vary based on factors like body weight, metabolism, and stress levels.'
    },
    {
      question: 'Is it safe for daily consumption?',
      answer: 'Yes, BeGood A-Bar is made with natural ingredients and is safe for daily consumption. However, we recommend consulting with a healthcare provider if you have any specific health conditions or are taking medications.'
    },
    {
      question: 'Are there any side effects?',
      answer: 'BeGood A-Bar is made with natural ingredients and is generally well-tolerated. Some people may experience mild digestive discomfort if consumed on an empty stomach. If you have any concerns, consult your healthcare provider.'
    },
    {
      question: 'What sizes and flavors are available?',
      answer: 'We currently offer BeGood A-Bar in two sizes (50g and 100g) and two flavors (Dark Chocolate and Mint Dark Chocolate). Both flavors contain the same functional ingredients.'
    },
    {
      question: 'How should I store the bars?',
      answer: 'Store BeGood A-Bar in a cool, dry place away from direct sunlight. Avoid exposure to high temperatures to maintain optimal quality and taste.'
    },
    {
      question: 'Do you ship nationwide?',
      answer: 'Yes, we ship across India. Orders typically arrive within 5-7 business days. Shipping is free on all orders.'
    },
    {
      question: 'What is your return/refund policy?',
      answer: 'We offer a 7-day return policy for unopened products. If you\'re not satisfied with your purchase, please contact us within 7 days of delivery. See our Refund Policy page for complete details.'
    },
    {
      question: 'Is this product vegetarian/vegan?',
      answer: 'BeGood A-Bar is vegetarian. For detailed ingredient information, please check the product page or contact our customer support.'
    }
  ]

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about BeGood
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 bg-[#F5F0E8] rounded-xl p-8 text-center">
            <h2 className="font-playfair text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-700 mb-6">
              We're here to help! Reach out to our customer support team.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#C8A97E] text-white hover:bg-[#B8956E] focus:ring-[#C8A97E] px-8 py-4 text-lg rounded-lg"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}