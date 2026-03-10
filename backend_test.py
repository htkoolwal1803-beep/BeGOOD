#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for BeGood E-commerce Platform
Tests all the newly implemented APIs including:
- Pincode Validation API
- Coupon CRUD APIs
- Coupon Validation and Apply APIs 
- Contact Form API
- Address API with Pincode Validation
"""

import requests
import json
import sys
import uuid
from datetime import datetime, timedelta

# Base URL - From review request specifications
BASE_URL = "http://localhost:3000"

# Test data
TEST_USER_PHONE = "+919876543210"
TEST_USER_DATA = {
    "name": "John Doe",
    "email": "john.doe@example.com", 
    "age": 30
}

def print_test_result(test_name, success, message=""):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name}")
    if message:
        print(f"    {message}")
    print()

def test_pincode_validation_api():
    """Test GET /api/pincode/:pincode endpoints"""
    print("🧪 TESTING PINCODE VALIDATION API")
    print("="*50)
    
    # Test Case 1: Valid pincode 302039 (Jaipur, Rajasthan)
    try:
        response = requests.get(f"{BASE_URL}/api/pincode/302039")
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('city') and data.get('state'):
                print_test_result(
                    "GET /api/pincode/302039 (Valid pincode)", 
                    True, 
                    f"City: {data.get('city')}, State: {data.get('state')}"
                )
            else:
                print_test_result("GET /api/pincode/302039 (Valid pincode)", False, f"Unexpected response: {data}")
        else:
            print_test_result("GET /api/pincode/302039 (Valid pincode)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("GET /api/pincode/302039 (Valid pincode)", False, f"Exception: {str(e)}")
    
    # Test Case 2: Valid pincode 110001 (Delhi)  
    try:
        response = requests.get(f"{BASE_URL}/api/pincode/110001")
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('city') and data.get('state'):
                print_test_result(
                    "GET /api/pincode/110001 (Valid pincode)", 
                    True, 
                    f"City: {data.get('city')}, State: {data.get('state')}"
                )
            else:
                print_test_result("GET /api/pincode/110001 (Valid pincode)", False, f"Unexpected response: {data}")
        else:
            print_test_result("GET /api/pincode/110001 (Valid pincode)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("GET /api/pincode/110001 (Valid pincode)", False, f"Exception: {str(e)}")
    
    # Test Case 3: Invalid pincode 000000
    try:
        response = requests.get(f"{BASE_URL}/api/pincode/000000")
        if response.status_code == 400:
            data = response.json()
            if not data.get('success'):
                print_test_result("GET /api/pincode/000000 (Invalid pincode)", True, "Correctly rejected invalid pincode")
            else:
                print_test_result("GET /api/pincode/000000 (Invalid pincode)", False, "Should have rejected invalid pincode")
        else:
            print_test_result("GET /api/pincode/000000 (Invalid pincode)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("GET /api/pincode/000000 (Invalid pincode)", False, f"Exception: {str(e)}")
    
    # Test Case 4: Invalid format 12345 (not 6 digits)
    try:
        response = requests.get(f"{BASE_URL}/api/pincode/12345")
        if response.status_code == 400:
            data = response.json()
            if not data.get('success') and 'must be 6 digits' in data.get('message', ''):
                print_test_result("GET /api/pincode/12345 (Invalid format)", True, "Correctly rejected non-6-digit format")
            else:
                print_test_result("GET /api/pincode/12345 (Invalid format)", False, "Should have rejected non-6-digit format")
        else:
            print_test_result("GET /api/pincode/12345 (Invalid format)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("GET /api/pincode/12345 (Invalid format)", False, f"Exception: {str(e)}")

def test_coupon_crud_apis():
    """Test Coupon CRUD operations"""
    print("🧪 TESTING COUPON CRUD APIS")
    print("="*50)
    
    created_coupon_id = None
    
    # Test Case 1: GET /api/admin/coupons - List existing coupons
    try:
        response = requests.get(f"{BASE_URL}/api/admin/coupons")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                coupons = data.get('coupons', [])
                print_test_result("GET /api/admin/coupons (List coupons)", True, f"Found {len(coupons)} coupons")
                
                # Check if TEST10 exists
                test10_exists = any(c.get('code') == 'TEST10' for c in coupons)
                if test10_exists:
                    print("    📝 Note: TEST10 coupon exists as expected")
            else:
                print_test_result("GET /api/admin/coupons (List coupons)", False, f"API returned error: {data}")
        else:
            print_test_result("GET /api/admin/coupons (List coupons)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("GET /api/admin/coupons (List coupons)", False, f"Exception: {str(e)}")
    
    # Test Case 2: POST /api/admin/coupons - Create new coupon FLAT50
    try:
        coupon_data = {
            "code": "FLAT50",
            "discountType": "fixed",
            "discountValue": 50,
            "maxUses": 100,
            "expiryDate": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/coupons", json=coupon_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('coupon'):
                created_coupon_id = data['coupon'].get('id')
                print_test_result("POST /api/admin/coupons (Create FLAT50)", True, f"Created coupon with ID: {created_coupon_id}")
            else:
                print_test_result("POST /api/admin/coupons (Create FLAT50)", False, f"API returned error: {data}")
        else:
            print_test_result("POST /api/admin/coupons (Create FLAT50)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("POST /api/admin/coupons (Create FLAT50)", False, f"Exception: {str(e)}")
    
    # Test Case 3: PUT /api/admin/coupons/:id - Update coupon (if we created one)
    if created_coupon_id:
        try:
            update_data = {
                "maxUses": 200  # Change max uses from 100 to 200
            }
            
            response = requests.put(f"{BASE_URL}/api/admin/coupons/{created_coupon_id}", json=update_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('coupon'):
                    new_max_uses = data['coupon'].get('maxUses')
                    if new_max_uses == 200:
                        print_test_result("PUT /api/admin/coupons/:id (Update)", True, f"Updated maxUses to {new_max_uses}")
                    else:
                        print_test_result("PUT /api/admin/coupons/:id (Update)", False, f"maxUses not updated correctly: {new_max_uses}")
                else:
                    print_test_result("PUT /api/admin/coupons/:id (Update)", False, f"API returned error: {data}")
            else:
                print_test_result("PUT /api/admin/coupons/:id (Update)", False, f"Status: {response.status_code}")
        except Exception as e:
            print_test_result("PUT /api/admin/coupons/:id (Update)", False, f"Exception: {str(e)}")
    
    # Test Case 4: DELETE /api/admin/coupons/:id - Delete coupon (if we created one)
    if created_coupon_id:
        try:
            response = requests.delete(f"{BASE_URL}/api/admin/coupons/{created_coupon_id}")
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print_test_result("DELETE /api/admin/coupons/:id (Delete)", True, "Coupon deleted successfully")
                else:
                    print_test_result("DELETE /api/admin/coupons/:id (Delete)", False, f"API returned error: {data}")
            else:
                print_test_result("DELETE /api/admin/coupons/:id (Delete)", False, f"Status: {response.status_code}")
        except Exception as e:
            print_test_result("DELETE /api/admin/coupons/:id (Delete)", False, f"Exception: {str(e)}")

def test_coupon_validation_api():
    """Test coupon validation endpoint"""
    print("🧪 TESTING COUPON VALIDATION API")
    print("="*50)
    
    # First, ensure TEST10 coupon exists by creating it if needed
    try:
        # Try to get existing coupons first
        response = requests.get(f"{BASE_URL}/api/admin/coupons")
        if response.status_code == 200:
            data = response.json()
            coupons = data.get('coupons', [])
            test10_exists = any(c.get('code') == 'TEST10' for c in coupons)
            
            if not test10_exists:
                # Create TEST10 coupon
                test10_data = {
                    "code": "TEST10",
                    "discountType": "percentage", 
                    "discountValue": 10,
                    "maxUses": 50,
                    "expiryDate": (datetime.now() + timedelta(days=30)).isoformat()
                }
                create_response = requests.post(f"{BASE_URL}/api/admin/coupons", json=test10_data)
                if create_response.status_code == 200:
                    print("    📝 Created TEST10 coupon for testing")
                else:
                    print("    ⚠️  Failed to create TEST10 coupon")
    except Exception as e:
        print(f"    ⚠️  Error setting up TEST10 coupon: {str(e)}")
    
    # Test Case: Validate TEST10 coupon
    try:
        validation_data = {
            "code": "TEST10",
            "userId": "test-user-123",
            "userPhone": TEST_USER_PHONE,
            "orderTotal": 500
        }
        
        response = requests.post(f"{BASE_URL}/api/coupons/validate", json=validation_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('coupon'):
                coupon_info = data['coupon']
                discount_amount = coupon_info.get('discountAmount')
                expected_discount = 50  # 10% of 500
                
                if discount_amount == expected_discount:
                    print_test_result(
                        "POST /api/coupons/validate (TEST10)", 
                        True, 
                        f"Calculated discount: ₹{discount_amount} (10% of ₹500)"
                    )
                    return coupon_info  # Return for use in apply test
                else:
                    print_test_result(
                        "POST /api/coupons/validate (TEST10)", 
                        False, 
                        f"Expected ₹{expected_discount}, got ₹{discount_amount}"
                    )
            else:
                print_test_result("POST /api/coupons/validate (TEST10)", False, f"API returned error: {data}")
        else:
            print_test_result("POST /api/coupons/validate (TEST10)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("POST /api/coupons/validate (TEST10)", False, f"Exception: {str(e)}")
    
    return None

def test_coupon_apply_api(coupon_info=None):
    """Test coupon apply endpoint"""
    print("🧪 TESTING COUPON APPLY API")
    print("="*50)
    
    if not coupon_info:
        print_test_result("POST /api/coupons/apply", False, "No coupon info available from validation test")
        return
    
    try:
        apply_data = {
            "couponId": coupon_info.get('id'),
            "couponCode": coupon_info.get('code'),
            "userId": "test-user-123",
            "userPhone": TEST_USER_PHONE,
            "orderId": str(uuid.uuid4()),
            "discountAmount": coupon_info.get('discountAmount')
        }
        
        response = requests.post(f"{BASE_URL}/api/coupons/apply", json=apply_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_test_result("POST /api/coupons/apply", True, "Coupon usage recorded successfully")
            else:
                print_test_result("POST /api/coupons/apply", False, f"API returned error: {data}")
        else:
            print_test_result("POST /api/coupons/apply", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("POST /api/coupons/apply", False, f"Exception: {str(e)}")

def test_coupon_usage_api():
    """Test coupon usage tracking endpoint"""
    print("🧪 TESTING COUPON USAGE API")  
    print("="*50)
    
    # Get TEST10 coupon ID first
    try:
        response = requests.get(f"{BASE_URL}/api/admin/coupons")
        if response.status_code == 200:
            data = response.json()
            coupons = data.get('coupons', [])
            test10_coupon = next((c for c in coupons if c.get('code') == 'TEST10'), None)
            
            if test10_coupon:
                coupon_id = test10_coupon.get('id')
                
                # Test usage endpoint
                usage_response = requests.get(f"{BASE_URL}/api/admin/coupons/{coupon_id}/usage")
                if usage_response.status_code == 200:
                    usage_data = usage_response.json()
                    if usage_data.get('success'):
                        usage_records = usage_data.get('usage', [])
                        print_test_result(
                            "GET /api/admin/coupons/:id/usage", 
                            True, 
                            f"Retrieved {len(usage_records)} usage records"
                        )
                    else:
                        print_test_result("GET /api/admin/coupons/:id/usage", False, f"API returned error: {usage_data}")
                else:
                    print_test_result("GET /api/admin/coupons/:id/usage", False, f"Status: {usage_response.status_code}")
            else:
                print_test_result("GET /api/admin/coupons/:id/usage", False, "TEST10 coupon not found")
        else:
            print_test_result("GET /api/admin/coupons/:id/usage", False, f"Failed to get coupons: {response.status_code}")
    except Exception as e:
        print_test_result("GET /api/admin/coupons/:id/usage", False, f"Exception: {str(e)}")

def test_contact_form_api():
    """Test contact form submission"""
    print("🧪 TESTING CONTACT FORM API")
    print("="*50)
    
    try:
        contact_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+919876543210",
            "subject": "Product Inquiry",
            "message": "I would like to know more about the P-Bar product and its availability in my area."
        }
        
        response = requests.post(f"{BASE_URL}/api/contact", json=contact_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_test_result("POST /api/contact", True, "Contact form submitted successfully")
            else:
                print_test_result("POST /api/contact", False, f"API returned error: {data}")
        else:
            print_test_result("POST /api/contact", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("POST /api/contact", False, f"Exception: {str(e)}")

def test_user_and_address_apis():
    """Test user creation and address APIs with pincode validation"""
    print("🧪 TESTING USER & ADDRESS APIS WITH PINCODE VALIDATION")
    print("="*60)
    
    # Test Case 1: Create test user
    try:
        user_data = {
            "phone": TEST_USER_PHONE,
            **TEST_USER_DATA
        }
        
        response = requests.post(f"{BASE_URL}/api/users", json=user_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('user'):
                print_test_result("POST /api/users (Create test user)", True, f"User created/updated: {data['user']['name']}")
            else:
                print_test_result("POST /api/users (Create test user)", False, f"API returned error: {data}")
        else:
            print_test_result("POST /api/users (Create test user)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("POST /api/users (Create test user)", False, f"Exception: {str(e)}")
    
    # Test Case 2: Add address with valid pincode (302039)
    try:
        address_data = {
            "phone": TEST_USER_PHONE,
            "address": {
                "label": "Home",
                "fullAddress": "123 Test Street, Vaishali Nagar",
                "pincode": "302039",
                "isDefault": True
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/users/addresses", json=address_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('addresses'):
                added_address = data['addresses'][-1]  # Get last address
                if added_address.get('city') and added_address.get('state'):
                    print_test_result(
                        "POST /api/users/addresses (Valid pincode 302039)", 
                        True, 
                        f"Address added with auto-filled city: {added_address['city']}, state: {added_address['state']}"
                    )
                else:
                    print_test_result("POST /api/users/addresses (Valid pincode 302039)", False, "City/State not auto-filled")
            else:
                print_test_result("POST /api/users/addresses (Valid pincode 302039)", False, f"API returned error: {data}")
        else:
            print_test_result("POST /api/users/addresses (Valid pincode 302039)", False, f"Status: {response.status_code}")
    except Exception as e:
        print_test_result("POST /api/users/addresses (Valid pincode 302039)", False, f"Exception: {str(e)}")
    
    # Test Case 3: Try to add address with invalid pincode (000000) - should fail
    try:
        invalid_address_data = {
            "phone": TEST_USER_PHONE,
            "address": {
                "label": "Office", 
                "fullAddress": "456 Invalid Street",
                "pincode": "000000",
                "isDefault": False
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/users/addresses", json=invalid_address_data)
        if response.status_code == 400:
            data = response.json()
            if not data.get('success') and 'Invalid pincode' in data.get('message', ''):
                print_test_result("POST /api/users/addresses (Invalid pincode 000000)", True, "Correctly rejected invalid pincode")
            else:
                print_test_result("POST /api/users/addresses (Invalid pincode 000000)", False, "Should have rejected invalid pincode")
        else:
            print_test_result("POST /api/users/addresses (Invalid pincode 000000)", False, f"Status: {response.status_code} (expected 400)")
    except Exception as e:
        print_test_result("POST /api/users/addresses (Invalid pincode 000000)", False, f"Exception: {str(e)}")

def main():
    """Run all backend API tests"""
    print("🚀 BEGOOD E-COMMERCE BACKEND API TESTING")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Test User Phone: {TEST_USER_PHONE}")
    print("="*60)
    print()
    
    try:
        # Test all API groups
        test_pincode_validation_api()
        test_coupon_crud_apis()
        coupon_info = test_coupon_validation_api()
        test_coupon_apply_api(coupon_info)
        test_coupon_usage_api()
        test_contact_form_api()
        test_user_and_address_apis()
        
        print("🏁 BACKEND API TESTING COMPLETED")
        print("="*60)
        print("Check individual test results above for detailed status.")
        
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
    except Exception as e:
        print(f"\n❌ Critical testing error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())