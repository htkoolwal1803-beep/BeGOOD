#!/usr/bin/env python3
"""
Focused test for User Profile Update API (Upsert) functionality
Tests the specific scenarios mentioned in the review request.
"""

import requests
import json
import sys
from urllib.parse import quote

# Base URL from environment
BASE_URL = "https://fulfillment.preview.emergentagent.com/api"

def make_request(method, endpoint, data=None):
    """Make HTTP request with proper error handling"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=30)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=30)
        elif method == "DELETE":
            response = requests.delete(url, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return None
        
        print(f"   {method} {endpoint} -> {response.status_code}")
        
        if response.status_code >= 400:
            print(f"   Error Response: {response.text}")
            return None
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {str(e)}")
        print(f"   Response text: {response.text}")
        return None

def test_upsert_functionality():
    """Test the specific upsert scenarios from the review request"""
    
    print("🧪 TESTING USER PROFILE UPDATE API (UPSERT FUNCTIONALITY)")
    print("=" * 60)
    print("Base URL:", BASE_URL)
    
    # Test phone number from review request
    test_phone = "+919999888877"
    encoded_phone = quote(test_phone, safe='')
    
    # Test 1: Create New User via Update (Upsert)
    print("\n1️⃣ TEST: Create New User via Update (Upsert)")
    print("-" * 50)
    
    create_data = {
        "phone": test_phone,
        "name": "Test User New",
        "email": "testnew@email.com",
        "age": 25
    }
    
    response = make_request("POST", "/users/update", create_data)
    if not response or not response.get('success'):
        print("❌ FAILED: Could not create user via update endpoint")
        return False
    
    user = response['user']
    print("✅ SUCCESS: User created/updated via update endpoint")
    print(f"   - User ID: {user.get('id')}")
    print(f"   - Name: {user.get('name')}")
    print(f"   - Email: {user.get('email')}")
    print(f"   - Age: {user.get('age')}")
    if 'isNewUser' in response:
        print(f"   - Is New User: {response['isNewUser']}")
    
    # Test 2: Update Existing User
    print("\n2️⃣ TEST: Update Existing User")
    print("-" * 50)
    
    update_data = {
        "phone": test_phone,
        "name": "Updated Name",
        "email": "updated@email.com",
        "age": 30
    }
    
    response = make_request("POST", "/users/update", update_data)
    if not response or not response.get('success'):
        print("❌ FAILED: Could not update existing user")
        return False
    
    user = response['user']
    print("✅ SUCCESS: User updated successfully")
    print(f"   - Name: {user.get('name')}")
    print(f"   - Email: {user.get('email')}")
    print(f"   - Age: {user.get('age')}")
    
    # Verify fields were updated correctly
    if (user.get('name') == "Updated Name" and 
        user.get('email') == "updated@email.com" and 
        user.get('age') == 30):
        print("✅ VERIFIED: All fields updated correctly")
    else:
        print("❌ FAILED: Fields not updated correctly")
        return False
    
    # Test 3: Get User to Verify
    print("\n3️⃣ TEST: Get User to Verify Updates")
    print("-" * 50)
    
    response = make_request("GET", f"/users/{encoded_phone}")
    if not response or not response.get('success'):
        print("❌ FAILED: Could not retrieve user")
        return False
    
    user = response['user']
    print("✅ SUCCESS: User retrieved successfully")
    print(f"   - Name: {user.get('name')}")
    print(f"   - Email: {user.get('email')}")
    print(f"   - Age: {user.get('age')}")
    
    # Verify the name is "Updated Name" as specified in review request
    if user.get('name') == "Updated Name":
        print("✅ VERIFIED: User has updated name 'Updated Name'")
    else:
        print(f"❌ FAILED: Expected name 'Updated Name', got '{user.get('name')}'")
        return False
    
    # Test 4: Test with Empty Phone (Should Fail)
    print("\n4️⃣ TEST: Empty Phone Number (Should Fail)")
    print("-" * 50)
    
    invalid_data = {"name": "No Phone User"}
    
    response = make_request("POST", "/users/update", invalid_data)
    if response is None:
        print("✅ SUCCESS: Correctly rejected request without phone number (400 status)")
        print("   - Expected error: 'Phone number is required'")
    else:
        print("❌ FAILED: Should have rejected request without phone number")
        return False
    
    print("\n🎉 ALL UPSERT TESTS PASSED!")
    print("✅ User Profile Update API (Upsert) is working correctly")
    return True

if __name__ == "__main__":
    print("🚀 STARTING USER PROFILE UPDATE (UPSERT) API TESTS")
    
    success = test_upsert_functionality()
    
    if success:
        print("\n🏆 TEST COMPLETED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\n❌ TESTS FAILED")
        sys.exit(1)