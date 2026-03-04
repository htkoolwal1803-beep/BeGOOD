export const metadata = {
  title: 'Terms & Conditions - BeGood',
  description: 'BeGood Terms and Conditions'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="font-playfair text-5xl font-bold mb-8">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the BeGood website and purchasing our products, you accept and agree to be bound by 
              these Terms and Conditions. If you do not agree to these terms, please do not use our website or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">2. Product Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              BeGood A-Bar is a functional food product containing natural ingredients. Important disclaimers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>This product is not intended to diagnose, treat, cure, or prevent any disease</li>
              <li>Individual results may vary</li>
              <li>Consult with a healthcare provider before use if you have any medical conditions</li>
              <li>Not recommended for pregnant or nursing women without medical consultation</li>
              <li>Keep out of reach of children</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">3. Orders and Payment</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All orders are subject to acceptance and availability. We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Refuse or cancel any order for any reason</li>
              <li>Limit quantities purchased per person or household</li>
              <li>Require additional verification before processing orders</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Payment must be received in full before orders are dispatched. We accept major credit/debit cards and UPI payments.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">4. Pricing</h2>
            <p className="text-gray-700 leading-relaxed">
              All prices are listed in Indian Rupees (INR) and include applicable taxes. Prices are subject to change 
              without notice. We reserve the right to correct any pricing errors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">5. Shipping and Delivery</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We ship across India. Shipping terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Free shipping on all orders</li>
              <li>Estimated delivery: 5-7 business days</li>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>Risk of loss passes to you upon delivery to the shipping carrier</li>
              <li>We are not responsible for delays caused by the shipping carrier</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">6. Returns and Refunds</h2>
            <p className="text-gray-700 leading-relaxed">
              Please refer to our Refund Policy page for complete details on returns and refunds. In summary:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>7-day return policy for unopened products</li>
              <li>Products must be in original, sealed packaging</li>
              <li>Customer is responsible for return shipping costs unless product is defective</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property of BeGood 
              and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works 
              without our express written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, BeGood shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages arising from your use of our products or website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">9. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive 
              jurisdiction of the courts in [Your City], India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately 
              upon posting. Your continued use of the website constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">11. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms and Conditions, please contact us at:<br />
              Email: support@begood.com<br />
              Phone: +91 XXXXX XXXXX
            </p>
          </section>

          <div className="mt-12 p-6 bg-[#F5F0E8] rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>FSSAI Disclaimer:</strong> This product is a functional food and is not intended to diagnose, treat, 
              cure, or prevent any disease. FSSAI License No: XXXXXXXXXXX
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}