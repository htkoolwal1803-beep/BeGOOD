#!/usr/bin/env python3
"""
Backend API Testing for BeGood E-commerce Website
Tests all the new backend APIs according to the review request:
1. Pincode Validation API
2. Coupon CRUD APIs (Admin)
3. Coupon Validation and Usage APIs
4. Contact Form API
5. Address API with Pincode Validation
"""

import requests
import json
import sys
from urllib.parse import quote
from datetime import datetime, timedelta

# Base URL - using localhost:3000 as specified in review request
BASE_URL = "http://localhost:3000/api"

def make_request(method, endpoint, data=None, params=None):
    """Make HTTP request with proper error handling"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    try:
        if method == "GET":
            response = requests.get(url, params=params, headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method == "DELETE":
            response = requests.delete(url, params=params, headers=headers, timeout=30)
        
        print(f"Request: {method} {url}")
        if data:
            print(f"Body: {json.dumps(data, indent=2)}")
        if params:
            print(f"Params: {params}")
        print(f"Status: {response.status_code}")
        
        try:
            response_data = response.json()
            print(f"Response: {json.dumps(response_data, indent=2)}")
            return response.status_code, response_data
        except:
            print(f"Response (text): {response.text}")
            return response.status_code, {"error": "Invalid JSON response", "text": response.text}
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {str(e)}")
        return 500, {"error": str(e)}

def test_pincode_validation():
    """Test Pincode Validation API as specified in review request"""
    print("\n" + "="*80)
    print("TEST 1: PINCODE VALIDATION API")
    print("="*80)
    
    test_cases = [
        {
            "name": "Valid Jaipur Pincode",
            "pincode": "302039",
            "expected_city": "Jaipur",
            "expected_state": "Rajasthan",
            "should_pass": True
        },
        {
            "name": "Valid New Delhi Pincode", 
            "pincode": "110001",
            "expected_city": "New Delhi",
            "expected_state": None,  # We'll check if it contains Delhi
            "should_pass": True
        },
        {
            "name": "Invalid Pincode",
            "pincode": "000000",
            "expected_city": None,
            "expected_state": None,
            "should_pass": False
        },
        {
            "name": "Invalid Format (Not 6 digits)",
            "pincode": "12345",
            "expected_city": None,
            "expected_state": None,
            "should_pass": False
        }
    ]
    
    all_passed = True
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: {test_case['name']} - {test_case['pincode']}")
        print("-" * 50)
        
        status, response = make_request("GET", f"/pincode/{test_case['pincode']}")
        
        if test_case['should_pass']:
            if status == 200 and response.get("success"):
                city = response.get("city")
                state = response.get("state")
                
                # Check expected city and state
                city_match = True
                state_match = True
                
                if test_case['expected_city']:
                    city_match = city and test_case['expected_city'].lower() in city.lower()
                    
                if test_case['expected_state']:
                    state_match = state and test_case['expected_state'].lower() in state.lower()
                elif test_case['pincode'] == "110001":  # Special case for Delhi
                    state_match = state and "delhi" in state.lower()
                
                if city_match and state_match:
                    print(f"✅ PASS: {test_case['name']}")
                    print(f"   City: {city}, State: {state}")
                else:
                    print(f"❌ FAIL: Expected city/state mismatch")
                    print(f"   Got City: {city}, State: {state}")
                    all_passed = False
            else:
                print(f"❌ FAIL: Expected success but got status {status}")
                all_passed = False
        else:
            if status != 200 or not response.get("success"):
                print(f"✅ PASS: {test_case['name']} correctly rejected")
            else:
                print(f"❌ FAIL: Should have been rejected but passed")
                all_passed = False
    
    return all_passed

def test_coupon_crud_apis():
    """Test Coupon CRUD APIs (Admin) as specified in review request"""
    print("\n" + "="*80)
    print("TEST 2: COUPON CRUD APIS (ADMIN)")
    print("="*80)
    
    # Test data from review request
    coupon_data = {
        "code": "TEST10",
        "discountType": "percentage", 
        "discountValue": 10,
        "maxUses": 100,
        "expiryDate": "2025-12-31"
    }
    
    created_coupon_id = None
    all_passed = True
    
    # 1. Create Coupon
    print("\n1. Testing: POST /api/admin/coupons - Create Coupon")
    print("-" * 50)
    
    status, response = make_request("POST", "/admin/coupons", coupon_data)
    
    if status == 200 and response.get("success"):
        coupon = response.get("coupon")
        created_coupon_id = coupon.get("id")
        
        if (coupon.get("code") == "TEST10" and 
            coupon.get("discountType") == "percentage" and
            coupon.get("discountValue") == 10):
            print("✅ PASS: Coupon created successfully")
            print(f"   Coupon ID: {created_coupon_id}")
        else:
            print("❌ FAIL: Coupon data mismatch")
            all_passed = False
    else:
        print(f"❌ FAIL: Coupon creation failed - Status {status}")
        all_passed = False
        return False
    
    # 2. Get All Coupons
    print("\n2. Testing: GET /api/admin/coupons - List Coupons")
    print("-" * 50)
    
    status, response = make_request("GET", "/admin/coupons")
    
    if status == 200 and response.get("success"):
        coupons = response.get("coupons", [])
        test_coupon_found = any(c.get("code") == "TEST10" for c in coupons)
        
        if test_coupon_found:
            print(f"✅ PASS: Coupons listed successfully ({len(coupons)} coupons)")
        else:
            print("❌ FAIL: Created coupon not found in list")
            all_passed = False
    else:
        print(f"❌ FAIL: Failed to list coupons - Status {status}")
        all_passed = False
    
    # 3. Update Coupon
    if created_coupon_id:
        print("\n3. Testing: PUT /api/admin/coupons/:id - Update Coupon")
        print("-" * 50)
        
        update_data = {
            "discountValue": 15,
            "maxUses": 50
        }
        
        status, response = make_request("PUT", f"/admin/coupons/{created_coupon_id}", update_data)
        
        if status == 200 and response.get("success"):
            updated_coupon = response.get("coupon")
            if updated_coupon.get("discountValue") == 15:
                print("✅ PASS: Coupon updated successfully")
            else:
                print("❌ FAIL: Coupon update data mismatch")
                all_passed = False
        else:
            print(f"❌ FAIL: Coupon update failed - Status {status}")
            all_passed = False
    
    # 4. Delete Coupon (we'll do this at the end)
    print("\n4. Testing: DELETE /api/admin/coupons/:id - Delete Coupon")
    print("-" * 50)
    
    if created_coupon_id:
        status, response = make_request("DELETE", f"/admin/coupons/{created_coupon_id}")
        
        if status == 200 and response.get("success"):
            print("✅ PASS: Coupon deleted successfully")
        else:
            print(f"❌ FAIL: Coupon deletion failed - Status {status}")
            all_passed = False
    
    return all_passed, created_coupon_id

def test_coupon_validation_apis():
    """Test Coupon Validation and Usage APIs as specified in review request"""
    print("\n" + "="*80)
    print("TEST 3: COUPON VALIDATION AND USAGE APIS")
    print("="*80)
    
    # First create a test coupon for validation
    coupon_data = {
        "code": "TESTVAL10",
        "discountType": "percentage",
        "discountValue": 10,
        "maxUses": 100,
        "expiryDate": "2025-12-31"
    }
    
    print("\n0. Creating test coupon for validation...")
    status, response = make_request("POST", "/admin/coupons", coupon_data)
    
    if status != 200 or not response.get("success"):
        print("❌ FAIL: Could not create test coupon for validation")
        return False
    
    test_coupon = response.get("coupon")
    coupon_id = test_coupon.get("id")
    print(f"✅ Test coupon created with ID: {coupon_id}")
    
    all_passed = True
    
    # 1. Validate Coupon
    print("\n1. Testing: POST /api/coupons/validate - Validate Coupon")
    print("-" * 50)
    
    validate_data = {
        "code": "TESTVAL10",
        "userId": "test-user-123",
        "userPhone": "+911234567890", 
        "orderTotal": 500
    }
    
    status, response = make_request("POST", "/coupons/validate", validate_data)
    
    if status == 200 and response.get("success"):
        coupon_info = response.get("coupon")
        discount_amount = coupon_info.get("discountAmount")
        
        # For 10% discount on 500, should be 50
        expected_discount = 50
        if discount_amount == expected_discount:
            print(f"✅ PASS: Coupon validation successful")
            print(f"   Discount Amount: ₹{discount_amount}")
        else:
            print(f"❌ FAIL: Expected discount {expected_discount}, got {discount_amount}")
            all_passed = False
    else:
        print(f"❌ FAIL: Coupon validation failed - Status {status}")
        all_passed = False
        return False
    
    # 2. Apply Coupon (Record Usage)
    print("\n2. Testing: POST /api/coupons/apply - Record Coupon Usage")
    print("-" * 50)
    
    apply_data = {
        "couponId": coupon_id,
        "couponCode": "TESTVAL10",
        "userId": "test-user-123",
        "userPhone": "+911234567890",
        "orderId": "order-123",
        "discountAmount": 50
    }
    
    status, response = make_request("POST", "/coupons/apply", apply_data)
    
    if status == 200 and response.get("success"):
        print("✅ PASS: Coupon usage recorded successfully")
    else:
        print(f"❌ FAIL: Coupon usage recording failed - Status {status}")
        all_passed = False
    
    # 3. Test validation after usage (should fail for same user)
    print("\n3. Testing: Validate same coupon again (should fail)")
    print("-" * 50)
    
    status, response = make_request("POST", "/coupons/validate", validate_data)
    
    if status != 200 or not response.get("success"):
        print("✅ PASS: Coupon correctly rejected after usage")
    else:
        print("❌ FAIL: Should have rejected used coupon")
        all_passed = False
    
    # Clean up - delete test coupon
    print("\n4. Cleaning up test coupon...")
    make_request("DELETE", f"/admin/coupons/{coupon_id}")
    
    return all_passed

def test_contact_form_api():
    """Test Contact Form API as specified in review request"""
    print("\n" + "="*80)
    print("TEST 4: CONTACT FORM API")
    print("="*80)
    
    # Test data from review request
    contact_data = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "1234567890", 
        "subject": "Test Subject",
        "message": "Test message"
    }
    
    print("\n1. Testing: POST /api/contact - Submit Contact Form")
    print("-" * 50)
    
    status, response = make_request("POST", "/contact", contact_data)
    
    if status == 200 and response.get("success"):
        message = response.get("message")
        if "received" in message.lower() or "success" in message.lower():
            print("✅ PASS: Contact form submitted successfully")
            return True
        else:
            print(f"❌ FAIL: Unexpected response message: {message}")
            return False
    else:
        print(f"❌ FAIL: Contact form submission failed - Status {status}")
        return False

def test_address_api_with_pincode_validation():
    """Test Address API with Pincode Validation"""
    print("\n" + "="*80)
    print("TEST 5: ADDRESS API WITH PINCODE VALIDATION")
    print("="*80)
    
    # First create a test user
    test_phone = "+917777888899"
    user_data = {
        "phone": test_phone,
        "name": "Address Test User",
        "email": "addresstest@example.com"
    }
    
    print("\n0. Creating test user for address operations...")
    status, response = make_request("POST", "/users", user_data)
    
    if status != 200 or not response.get("success"):
        print("❌ FAIL: Could not create test user for address testing")
        return False
    
    print("✅ Test user created")
    
    all_passed = True
    address_id = None
    
    # 1. Add Address with Valid Pincode
    print("\n1. Testing: POST /api/users/addresses - Add Address with Valid Pincode")
    print("-" * 50)
    
    address_data = {
        "phone": test_phone,
        "address": {
            "label": "Home",
            "fullAddress": "123 Test Street",
            "pincode": "302039",  # Valid Jaipur pincode
            "isDefault": True
        }
    }
    
    status, response = make_request("POST", "/users/addresses", address_data)
    
    if status == 200 and response.get("success"):
        addresses = response.get("addresses", [])
        if addresses:
            added_address = addresses[-1]
            address_id = added_address.get("id")
            city = added_address.get("city")
            state = added_address.get("state")
            
            if city and "jaipur" in city.lower() and state and "rajasthan" in state.lower():
                print("✅ PASS: Address added with auto-filled city/state")
                print(f"   City: {city}, State: {state}")
            else:
                print(f"❌ FAIL: City/state not auto-filled correctly")
                print(f"   Got City: {city}, State: {state}")
                all_passed = False
        else:
            print("❌ FAIL: No addresses returned")
            all_passed = False
    else:
        print(f"❌ FAIL: Address addition failed - Status {status}")
        all_passed = False
    
    # 2. Try to Add Address with Invalid Pincode
    print("\n2. Testing: POST /api/users/addresses - Add Address with Invalid Pincode")
    print("-" * 50)
    
    invalid_address_data = {
        "phone": test_phone,
        "address": {
            "label": "Office",
            "fullAddress": "456 Invalid Street",
            "pincode": "000000",  # Invalid pincode
            "isDefault": False
        }
    }
    
    status, response = make_request("POST", "/users/addresses", invalid_address_data)
    
    if status != 200 or not response.get("success"):
        print("✅ PASS: Invalid pincode correctly rejected")
    else:
        print("❌ FAIL: Should have rejected invalid pincode")
        all_passed = False
    
    # 3. Update Address with Valid Pincode
    if address_id:
        print("\n3. Testing: PUT /api/users/addresses/:id - Update Address with Valid Pincode")
        print("-" * 50)
        
        update_data = {
            "phone": test_phone,
            "address": {
                "label": "Home Updated",
                "fullAddress": "789 Updated Street",
                "pincode": "110001",  # Valid Delhi pincode
                "isDefault": True
            }
        }
        
        status, response = make_request("PUT", f"/users/addresses/{address_id}", update_data)
        
        if status == 200 and response.get("success"):
            addresses = response.get("addresses", [])
            updated_address = next((addr for addr in addresses if addr.get("id") == address_id), None)
            
            if updated_address:
                city = updated_address.get("city")
                state = updated_address.get("state")
                
                if city and state and "delhi" in state.lower():
                    print("✅ PASS: Address updated with auto-filled city/state")
                    print(f"   City: {city}, State: {state}")
                else:
                    print(f"❌ FAIL: City/state not updated correctly")
                    all_passed = False
            else:
                print("❌ FAIL: Updated address not found")
                all_passed = False
        else:
            print(f"❌ FAIL: Address update failed - Status {status}")
            all_passed = False
    
    return all_passed

def run_all_tests():
    """Run all backend API tests as specified in review request"""
    print("🚀 Starting BeGood E-commerce Backend API Tests")
    print(f"Base URL: {BASE_URL}")
    print("=" * 80)
    
    results = []
    
    # Test 1: Pincode Validation API
    try:
        success = test_pincode_validation()
        results.append(("Pincode Validation API", success))
    except Exception as e:
        print(f"❌ ERROR in Pincode Validation tests: {str(e)}")
        results.append(("Pincode Validation API", False))
    
    # Test 2: Coupon CRUD APIs 
    try:
        success, _ = test_coupon_crud_apis()
        results.append(("Coupon CRUD APIs", success))
    except Exception as e:
        print(f"❌ ERROR in Coupon CRUD tests: {str(e)}")
        results.append(("Coupon CRUD APIs", False))
    
    # Test 3: Coupon Validation and Usage APIs
    try:
        success = test_coupon_validation_apis()
        results.append(("Coupon Validation APIs", success))
    except Exception as e:
        print(f"❌ ERROR in Coupon Validation tests: {str(e)}")
        results.append(("Coupon Validation APIs", False))
    
    # Test 4: Contact Form API
    try:
        success = test_contact_form_api()
        results.append(("Contact Form API", success))
    except Exception as e:
        print(f"❌ ERROR in Contact Form tests: {str(e)}")
        results.append(("Contact Form API", False))
    
    # Test 5: Address API with Pincode Validation
    try:
        success = test_address_api_with_pincode_validation()
        results.append(("Address API with Pincode Validation", success))
    except Exception as e:
        print(f"❌ ERROR in Address API tests: {str(e)}")
        results.append(("Address API with Pincode Validation", False))
    
    # Print Final Summary
    print("\n" + "="*80)
    print("🏁 FINAL TEST SUMMARY")
    print("="*80)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name:<35} {status}")
        if success:
            passed += 1
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL BACKEND API TESTS PASSED!")
        return True
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)