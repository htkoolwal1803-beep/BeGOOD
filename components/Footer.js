import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#F5F0E8] border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-playfair text-2xl font-bold mb-4">BeGood</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              Premium functional chocolate that reduces stress, short-term and nervousness and induces calm and focus. 
              Science-backed wellness for your high-stakes moments.
              Disclaimer: We do not claim to treat or diagnose any medical condition.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-[#C8A97E] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-[#C8A97E] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-[#C8A97E] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-[#C8A97E] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-gray-600 hover:text-[#C8A97E] transition-colors">Shop</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-[#C8A97E] transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-[#C8A97E] transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-[#C8A97E] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-600 hover:text-[#C8A97E] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-[#C8A97E] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/refund" className="text-gray-600 hover:text-[#C8A97E] transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} BeGood. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 max-w-2xl text-center md:text-right">
              This product is a functional food and is not intended to diagnose, treat, cure, or prevent any disease. 
              FSSAI Registration: 22226067001389
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
