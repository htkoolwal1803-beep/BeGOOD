export const metadata = {
  title: 'Refund Policy - BeGood',
  description: 'BeGood No Return and No Refund Policy'
}

export default function RefundPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="font-playfair text-5xl font-bold mb-8">Refund & Return Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          {/* Important Notice */}
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
            <h2 className="font-bold text-2xl mb-4 text-red-700">Important: No Return / No Refund Policy</h2>
            <p className="text-red-700 font-semibold text-lg">
              ALL SALES ARE FINAL. WE DO NOT ACCEPT RETURNS OR PROVIDE REFUNDS.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">1. Our Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              Due to the nature of our functional food products and health & safety regulations, BeGood maintains a strict 
              <strong> No Return and No Refund policy</strong>. Please review your order carefully before completing your purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">2. What This Means</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Once an order is placed and confirmed, it <strong>cannot be cancelled</strong></li>
              <li>We <strong>do not accept returns</strong> for any reason</li>
              <li><strong>No refunds</strong> will be issued after purchase</li>
              <li>This policy applies to <strong>both online payments and Cash on Delivery (COD)</strong> orders</li>
              <li><strong>Subscription orders</strong> are non-cancellable and non-refundable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">3. Why We Have This Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              As a functional food company, we prioritize:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Food Safety:</strong> Once products leave our facility, we cannot guarantee they haven't been tampered with or improperly stored</li>
              <li><strong>Quality Assurance:</strong> We cannot resell returned food products to other customers</li>
              <li><strong>Health Regulations:</strong> Food products are subject to strict health and safety guidelines</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">4. Exceptions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may consider exceptions <strong>only</strong> in the following cases:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Damaged Product:</strong> If product is damaged during shipping (must be reported within 24 hours of delivery with photos)</li>
              <li><strong>Wrong Product:</strong> If you receive a different product than what you ordered (must be reported within 24 hours of delivery)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              In such exceptional cases, we will review the situation and may offer a replacement at our discretion. 
              <strong> Refunds are not guaranteed even in exceptional cases.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">5. How to Report Issues</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you receive a damaged or wrong product:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Contact us <strong>within 24 hours</strong> of delivery</li>
              <li>Provide your <strong>order number</strong></li>
              <li>Include <strong>clear photos</strong> of the issue</li>
              <li>Describe the problem in detail</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">6. Before You Order</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We encourage all customers to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Read product descriptions carefully</li>
              <li>Check ingredient lists for any allergies</li>
              <li>Verify shipping address before checkout</li>
              <li>Review your cart items and quantities</li>
              <li>Understand that all sales are final</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">7. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions about our policy or to report an issue, please contact our customer support team:<br /><br />
              <strong>Email:</strong> healhat25@gmail.com<br />
              <strong>Phone:</strong> +91 8209828412<br />
              <strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST<br />
              <strong>Response Time:</strong> Within 24-48 hours
            </p>
          </section>

          <div className="mt-12 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <h3 className="font-bold text-lg mb-2 text-amber-800">Please Note</h3>
            <p className="text-gray-700">
              By placing an order on our website, you acknowledge that you have read, understood, and agree to our 
              No Return / No Refund policy. If you have any concerns, please contact us <strong>before</strong> placing your order.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
