import { ChevronDown } from 'lucide-react'

export const metadata = {
  title: 'FAQ - BeGood | Frequently Asked Questions',
  description: 'Find answers to common questions about BeGood functional chocolate'
}

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is BeGood A-Bar?',
      answer: 'BeGood A-Bar is a premium functional chocolate bar made with walnuts, pumpkin seeds, cocoa butter, and L-Theanine. It\'s designed to help reduce anxiety and promote calm focus during high-stakes moments.'
    },
    {
      question: 'How does it work?',
      answer: 'A-Bar combines nourishing ingredients with L-Theanine to support calm focus. Walnuts and pumpkin seeds add plant-based goodness, cocoa butter creates the smooth chocolate experience, and L-Theanine supports relaxed alertness.'
    },
    {
      question: 'When should I consume it?',
      answer: 'For best results, consume one whole bar 15-20 minutes before a high-stakes situation like an exam, interview, presentation, or any stressful event. People also consume it when they feel short-term fear or stressed.'
    },
    {
      question: 'Will it make me drowsy?',
      answer: 'No! BeGood A-Bar promotes calm focus without causing drowsiness. L-Theanine is specifically known for creating relaxed alertness, allowing you to stay sharp while feeling calm.'
    },
    {
      question: 'How long does the effect last?',
      answer: 'The calming effects typically begin within 15-20 minutes and can last for 4-6 hours, though individual results may vary based on factors like body weight, metabolism, and stress levels.'
    },
    {
      question: 'Is it safe for daily consumption?',
      answer: 'Yes, BeGood A-Bar is made with natural ingredients and is safe for daily consumption. However, we recommend consulting with a healthcare provider if you have any specific health conditions or are taking medications.'
    },
    {
      question: 'Are there any side effects?',
      answer: 'BeGood A-Bar is made with natural ingredients and is generally well-tolerated. Some people may experience mild digestive discomfort. If you have any concerns, consult your healthcare provider.'
    },
    {
      question: 'What sizes and flavors are available?',
      answer: 'We currently offer BeGood A-Bar in a single 40g bar. No options for flavors are available.'
    },
    {
      question: 'How should I store the bars?',
      answer: 'Store BeGood A-Bar in a cool, dry place away from direct sunlight. Avoid exposure to high temperatures to maintain optimal quality and taste.'
    },
    {
      question: 'Do you ship nationwide?',
      answer: 'Yes, we ship across India. Orders typically arrive within 5-7 business days. Shipping is FREE on orders of ₹600 and above. For orders below ₹600, a shipping fee of ₹60 applies.'
    },
    {
      question: 'What is your return/refund policy?',
      answer: 'We have a strict No Return / No Refund policy. All sales are final. Due to the nature of our functional food products and health & safety regulations, we cannot accept returns or provide refunds. Please review your order carefully before purchase. Exceptions may be considered only for damaged or wrong products reported within 24 hours of delivery with photos.'
    },
    {
      question: 'Is this product vegetarian/vegan?',
      answer: 'BeGood A-Bar is vegetarian. For detailed ingredient information, please check the product page or contact our customer support.'
    }
  ]

  return (
    <div className="brand-page min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-[#59615b]">
              Everything you need to know about BeGood
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="brand-card overflow-hidden group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#eef3ea] transition-colors">
                  <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                  <ChevronDown className="w-5 h-5 text-[#8b938b] flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-[#464c49] leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 brand-panel p-8 text-center">
            <h2 className="font-playfair text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-[#464c49] mb-6">
              We're here to help! Reach out to our customer support team.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#6f8a74] text-white hover:bg-[#536a58] focus:ring-[#6f8a74] px-8 py-4 text-lg rounded-lg"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
