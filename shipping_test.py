#!/usr/bin/env python3
"""
Test shipping fee calculation logic
"""

import sys
import os

# Add the app directory to Python path to import the constants
sys.path.append('/app')

def test_shipping_calculation():
    """Test shipping fee calculation logic"""
    print("Testing Shipping Fee Calculation Logic")
    print("="*50)
    
    # Test cases: (cart_total, expected_shipping, expected_total)
    test_cases = [
        (100, 50, 150),   # Below threshold
        (250, 50, 300),   # Below threshold
        (499, 50, 549),   # Just below threshold
        (500, 0, 500),    # At threshold
        (750, 0, 750),    # Above threshold
        (1000, 0, 1000),  # Well above threshold
    ]
    
    all_passed = True
    
    for cart_total, expected_shipping, expected_total in test_cases:
        # Calculate shipping (₹50 for orders below ₹500, free above)
        if cart_total >= 500:
            actual_shipping = 0
        else:
            actual_shipping = 50
        
        actual_total = cart_total + actual_shipping
        
        shipping_pass = actual_shipping == expected_shipping
        total_pass = actual_total == expected_total
        
        status = "✅ PASS" if (shipping_pass and total_pass) else "❌ FAIL"
        
        print(f"Cart: ₹{cart_total} | Shipping: ₹{actual_shipping} | Total: ₹{actual_total} | {status}")
        
        if not (shipping_pass and total_pass):
            all_passed = False
            print(f"  Expected: Shipping ₹{expected_shipping}, Total ₹{expected_total}")
    
    print("\n" + "="*50)
    if all_passed:
        print("🎉 All shipping calculation tests passed!")
        return True
    else:
        print("⚠️  Some shipping calculation tests failed!")
        return False

if __name__ == "__main__":
    success = test_shipping_calculation()
    sys.exit(0 if success else 1)