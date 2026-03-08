export const metadata = {
  title: 'Refund Policy - BeGood',
  description: 'BeGood Refund and Return Policy'
}

export default function RefundPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="font-playfair text-5xl font-bold mb-8">Refund & Return Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">1. Our Commitment</h2>
            <p className="text-gray-700 leading-relaxed">
              At BeGood, we stand behind the quality of our products. We want you to be completely satisfied with your 
              purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">2. No return Policy.</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">3. Non-Returnable Items</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Due to health and safety regulations, the following items cannot be returned:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Opened or partially consumed products</li>
              <li>Products with broken or damaged seals</li>
              <li>Products purchased during special sales or promotions (unless defective)</li>
              <li>Products past their expiry date at time of return request</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">5. Return Shipping</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Shipping costs:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Wrong Item Sent:</strong> We cover return shipping and send the correct item free of charge</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">6. Refund Process</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Once we receive and inspect your return:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>We'll send you an email to confirm receipt of your returned item</li>
              <li>If approved, your refund will be processed within 5-7 business days</li>
              <li>The refund will be credited to your original payment method</li>
              <li>Depending on your bank or card issuer, it may take an additional 5-10 business days for the refund to appear</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">7. Partial Refunds</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Partial refunds may be granted in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Products with obvious signs of use or consumption</li>
              <li>Products returned without original packaging</li>
              <li>Products damaged due to mishandling during return shipping</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">8. Damaged or Defective Products</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you receive a damaged or defective product:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Contact us immediately with photos of the damage</li>
              <li>We'll arrange for a replacement or full refund at no cost to you</li>
              <li>We cover all return shipping costs for defective items</li>
              <li>No need to return the defective product in most cases</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">9. Exchanges</h2>
            <p className="text-gray-700 leading-relaxed">
              We currently don't offer direct exchanges. If you need a different variant or size, please:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>Return the original product following our return process</li>
              <li>Place a new order for the desired variant</li>
              <li>We'll process your refund once we receive the returned item</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">10. Lost or Damaged in Transit</h2>
            <p className="text-gray-700 leading-relaxed">
              If your order is lost or damaged during shipping:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Contact us within 48 hours of the expected delivery date</li>
              <li>Provide your order number and tracking information</li>
              <li>We'll investigate with the shipping carrier</li>
              <li>We'll either ship a replacement or issue a full refund</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">11. Cancellations</h2>
            <p className="text-gray-700 leading-relaxed">
              You can cancel your order before it's shipped:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Contact us as soon as possible with your order number</li>
              <li>If the order hasn't been processed, we'll cancel it and issue a full refund</li>
              <li>If the order has already shipped, you'll need to follow our return process</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions about returns or refunds, please contact our customer support team:<br /><br />
              <strong>Email:</strong> support@begood.com<br />
              <strong>Phone:</strong> +91 XXXXX XXXXX<br />
              <strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST<br />
              <strong>Response Time:</strong> Within 24-48 hours
            </p>
          </section>

          <div className="mt-12 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
            <h3 className="font-bold text-lg mb-2 text-green-800">Our Promise</h3>
            <p className="text-gray-700">
              We're committed to your satisfaction. If you have any concerns about your order or our products, 
              please don't hesitate to reach out. We're here to help!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
