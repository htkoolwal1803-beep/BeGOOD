#!/usr/bin/env python3
"""
Backend API Testing for BeGood E-commerce User Management APIs
Tests all user management endpoints according to the test sequence provided.
"""

import requests
import json
import sys
from urllib.parse import quote

# Base URL from environment
BASE_URL = "https://wellness-ecommerce.preview.emergentagent.com/api"

# Test data
TEST_PHONE = "+919876543210"
TEST_USER_DATA = {
    "phone": TEST_PHONE,
    "name": "Test User",
    "email": "test@email.com",
    "age": 25
}

UPDATED_USER_DATA = {
    "phone": TEST_PHONE,
    "name": "Updated Name",
    "email": "updated@email.com",
    "age": 30
}

TEST_ADDRESS = {
    "label": "Home",
    "fullAddress": "123 Test Street",
    "pincode": "400001",
    "city": "Mumbai",
    "state": "Maharashtra",
    "isDefault": True
}

UPDATED_ADDRESS = {
    "label": "Work",
    "fullAddress": "456 Office Road",
    "pincode": "400002",
    "city": "Mumbai",
    "state": "Maharashtra",
    "isDefault": False
}

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

def test_create_user():
    """Test 1: Create/Get User - POST /api/users"""
    print("\n" + "="*60)
    print("TEST 1: Create User - POST /api/users")
    print("="*60)
    
    status, response = make_request("POST", "/users", TEST_USER_DATA)
    
    if status == 200 and response.get("success"):
        user = response.get("user", {})
        is_new_user = response.get("isNewUser")
        
        if user.get("phone") == TEST_PHONE and user.get("name") == "Test User":
            print("✅ User creation successful")
            print(f"✅ User ID: {user.get('id')}")
            print(f"✅ Is new user: {is_new_user}")
            return True, user
        else:
            print("❌ User data mismatch")
            return False, None
    else:
        print(f"❌ User creation failed: {response}")
        return False, None

def test_get_user():
    """Test 2: Get User by Phone - GET /api/users/:phone"""
    print("\n" + "="*60)
    print("TEST 2: Get User by Phone - GET /api/users/:phone")
    print("="*60)
    
    # URL encode the phone number
    encoded_phone = quote(TEST_PHONE, safe='')
    status, response = make_request("GET", f"/users/{encoded_phone}")
    
    if status == 200 and response.get("success"):
        user = response.get("user", {})
        
        if user.get("phone") == TEST_PHONE:
            print("✅ User retrieval successful")
            print(f"✅ User found: {user.get('name')} ({user.get('email')})")
            return True, user
        else:
            print("❌ User data mismatch")
            return False, None
    else:
        print(f"❌ User retrieval failed: {response}")
        return False, None

def test_update_user():
    """Test 3: Update User Profile - POST /api/users/update"""
    print("\n" + "="*60)
    print("TEST 3: Update User Profile - POST /api/users/update")
    print("="*60)
    
    status, response = make_request("POST", "/users/update", UPDATED_USER_DATA)
    
    if status == 200 and response.get("success"):
        user = response.get("user", {})
        
        if (user.get("phone") == TEST_PHONE and 
            user.get("name") == "Updated Name" and 
            user.get("email") == "updated@email.com" and
            user.get("age") == 30):
            print("✅ User profile update successful")
            return True, user
        else:
            print("❌ User profile update data mismatch")
            return False, None
    else:
        print(f"❌ User profile update failed: {response}")
        return False, None

def test_add_address():
    """Test 4: Add Address - POST /api/users/addresses"""
    print("\n" + "="*60)
    print("TEST 4: Add Address - POST /api/users/addresses")
    print("="*60)
    
    address_data = {
        "phone": TEST_PHONE,
        "address": TEST_ADDRESS
    }
    
    status, response = make_request("POST", "/users/addresses", address_data)
    
    if status == 200 and response.get("success"):
        addresses = response.get("addresses", [])
        
        if addresses and len(addresses) > 0:
            added_address = addresses[-1]  # Get the last added address
            if (added_address.get("label") == "Home" and 
                added_address.get("fullAddress") == "123 Test Street" and
                added_address.get("pincode") == "400001"):
                print("✅ Address addition successful")
                print(f"✅ Address ID: {added_address.get('id')}")
                return True, added_address.get('id')
            else:
                print("❌ Address data mismatch")
                return False, None
        else:
            print("❌ No addresses returned")
            return False, None
    else:
        print(f"❌ Address addition failed: {response}")
        return False, None

def test_update_address(address_id):
    """Test 5: Update Address - PUT /api/users/addresses/:addressId"""
    print("\n" + "="*60)
    print("TEST 5: Update Address - PUT /api/users/addresses/:addressId")
    print("="*60)
    
    if not address_id:
        print("❌ No address ID provided for update")
        return False
    
    update_data = {
        "phone": TEST_PHONE,
        "address": UPDATED_ADDRESS
    }
    
    status, response = make_request("PUT", f"/users/addresses/{address_id}", update_data)
    
    if status == 200 and response.get("success"):
        addresses = response.get("addresses", [])
        
        # Find the updated address
        updated_address = None
        for addr in addresses:
            if addr.get("id") == address_id:
                updated_address = addr
                break
        
        if (updated_address and 
            updated_address.get("label") == "Work" and 
            updated_address.get("fullAddress") == "456 Office Road" and
            updated_address.get("pincode") == "400002"):
            print("✅ Address update successful")
            return True
        else:
            print("❌ Address update data mismatch")
            return False
    else:
        print(f"❌ Address update failed: {response}")
        return False

def test_get_user_orders():
    """Test 6: Get User Orders - GET /api/users/:phone/orders"""
    print("\n" + "="*60)
    print("TEST 6: Get User Orders - GET /api/users/:phone/orders")
    print("="*60)
    
    # URL encode the phone number
    encoded_phone = quote(TEST_PHONE, safe='')
    status, response = make_request("GET", f"/users/{encoded_phone}/orders")
    
    if status == 200 and response.get("success"):
        orders = response.get("orders", [])
        print(f"✅ User orders retrieval successful")
        print(f"✅ Orders count: {len(orders)} (expected: 0 for new user)")
        return True
    else:
        print(f"❌ User orders retrieval failed: {response}")
        return False

def test_delete_address(address_id):
    """Test 7: Delete Address - DELETE /api/users/addresses/:addressId"""
    print("\n" + "="*60)
    print("TEST 7: Delete Address - DELETE /api/users/addresses/:addressId")
    print("="*60)
    
    if not address_id:
        print("❌ No address ID provided for deletion")
        return False
    
    # URL encode the phone number for query parameter
    encoded_phone = quote(TEST_PHONE, safe='')
    params = {"phone": encoded_phone}
    
    status, response = make_request("DELETE", f"/users/addresses/{address_id}", params=params)
    
    if status == 200 and response.get("success"):
        addresses = response.get("addresses", [])
        
        # Check that the address is no longer in the list
        address_exists = any(addr.get("id") == address_id for addr in addresses)
        
        if not address_exists:
            print("✅ Address deletion successful")
            print(f"✅ Remaining addresses: {len(addresses)}")
            return True
        else:
            print("❌ Address still exists after deletion")
            return False
    else:
        print(f"❌ Address deletion failed: {response}")
        return False

def run_all_tests():
    """Run all user management API tests in sequence"""
    print("Starting BeGood E-commerce User Management API Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Phone: {TEST_PHONE}")
    
    results = []
    address_id = None
    
    # Test 1: Create User
    success, user = test_create_user()
    results.append(("Create User", success))
    
    # Test 2: Get User
    success, user = test_get_user()
    results.append(("Get User", success))
    
    # Test 3: Update User Profile
    success, user = test_update_user()
    results.append(("Update User Profile", success))
    
    # Test 4: Add Address
    success, address_id = test_add_address()
    results.append(("Add Address", success))
    
    # Test 5: Update Address (only if we have an address ID)
    if address_id:
        success = test_update_address(address_id)
        results.append(("Update Address", success))
    else:
        results.append(("Update Address", False))
    
    # Test 6: Get User Orders
    success = test_get_user_orders()
    results.append(("Get User Orders", success))
    
    # Test 7: Delete Address (only if we have an address ID)
    if address_id:
        success = test_delete_address(address_id)
        results.append(("Delete Address", success))
    else:
        results.append(("Delete Address", False))
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name:<25} {status}")
        if success:
            passed += 1
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All user management API tests passed!")
        return True
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)