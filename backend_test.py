#!/usr/bin/env python3
"""
Final Backend Testing Script for Per-Product Feedback System
Tests the refactored feedback APIs with per-product questionnaire support
"""

import requests
import json
import sys
import time
from datetime import datetime
import uuid

# Configuration
BASE_URL = "https://laughing-bhaskara-6.preview.emergentagent.com"

def log_test(test_name, success, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"[{timestamp}] {status} {test_name}")
    if details:
        print(f"    {details}")
    print()

def run_comprehensive_tests():
    """Run comprehensive per-product feedback system tests"""
    print("🧪 COMPREHENSIVE PER-PRODUCT FEEDBACK SYSTEM TESTING")
    print("=" * 70)
    print()
    
    # Generate unique identifiers for this test run
    test_id = str(uuid.uuid4())[:8]
    product_a_id = f"test-product-a-{test_id}"
    product_b_id = f"test-product-b-{test_id}"
    user_phone = f"+91987654{test_id[:4]}"
    
    passed = 0
    failed = 0
    
    # Test 1: GET /api/feedback/questions without productId → 400
    print("=== TEST 1: GET questions without productId ===")
    try:
        response = requests.get(f"{BASE_URL}/api/feedback/questions")
        if response.status_code == 400 and response.json().get('message') == 'productId is required':
            log_test("GET questions without productId", True, "✅ Correctly returns 400")
            passed += 1
        else:
            log_test("GET questions without productId", False, f"❌ Expected 400, got {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("GET questions without productId", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 2: GET questions for unconfigured product → configured:false
    print("=== TEST 2: GET questions for unconfigured product ===")
    try:
        response = requests.get(f"{BASE_URL}/api/feedback/questions?productId={product_a_id}")
        if response.status_code == 200:
            data = response.json()
            if (data.get('success') == True and data.get('configured') == False and 
                data.get('productId') == product_a_id and data.get('questions') == []):
                log_test("GET unconfigured product", True, "✅ Returns configured:false with empty questions")
                passed += 1
            else:
                log_test("GET unconfigured product", False, f"❌ Unexpected response: {data}")
                failed += 1
        else:
            log_test("GET unconfigured product", False, f"❌ Expected 200, got {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("GET unconfigured product", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 3: POST admin questions without productId → 400
    print("=== TEST 3: POST admin questions without productId ===")
    try:
        payload = {"title": "Test", "questions": [{"type": "short_text", "question": "Test", "required": True}]}
        response = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=payload)
        if response.status_code == 400 and response.json().get('message') == 'productId is required':
            log_test("POST admin without productId", True, "✅ Correctly returns 400")
            passed += 1
        else:
            log_test("POST admin without productId", False, f"❌ Expected 400, got {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("POST admin without productId", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 4: Create questionnaire for Product A
    print("=== TEST 4: Create questionnaire for Product A ===")
    try:
        questions_a = [
            {"type": "star_rating", "question": "Rate Product A", "required": True, "maxRating": 5},
            {"type": "long_text", "question": "Comments on Product A", "required": False}
        ]
        payload = {
            "productId": product_a_id,
            "productName": "Product A Test",
            "title": "Product A Feedback",
            "questions": questions_a
        }
        response = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=payload)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') == True and data.get('form', {}).get('productId') == product_a_id:
                log_test("Create Product A questionnaire", True, f"✅ Created form for {product_a_id}")
                passed += 1
            else:
                log_test("Create Product A questionnaire", False, f"❌ Unexpected response: {data}")
                failed += 1
        else:
            log_test("Create Product A questionnaire", False, f"❌ Expected 200, got {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("Create Product A questionnaire", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 5: Create questionnaire for Product B
    print("=== TEST 5: Create questionnaire for Product B ===")
    try:
        questions_b = [
            {"type": "single_choice", "question": "Recommend Product B?", "required": True, "options": ["Yes", "No"]}
        ]
        payload = {
            "productId": product_b_id,
            "productName": "Product B Test",
            "title": "Product B Feedback",
            "questions": questions_b
        }
        response = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=payload)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') == True and data.get('form', {}).get('productId') == product_b_id:
                log_test("Create Product B questionnaire", True, f"✅ Created form for {product_b_id}")
                passed += 1
            else:
                log_test("Create Product B questionnaire", False, f"❌ Unexpected response: {data}")
                failed += 1
        else:
            log_test("Create Product B questionnaire", False, f"❌ Expected 200, got {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("Create Product B questionnaire", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 6: Verify both products are configured independently
    print("=== TEST 6: Verify independent product configurations ===")
    try:
        response_a = requests.get(f"{BASE_URL}/api/feedback/questions?productId={product_a_id}")
        response_b = requests.get(f"{BASE_URL}/api/feedback/questions?productId={product_b_id}")
        
        if (response_a.status_code == 200 and response_b.status_code == 200):
            data_a = response_a.json()
            data_b = response_b.json()
            if (data_a.get('configured') == True and len(data_a.get('questions', [])) == 2 and
                data_b.get('configured') == True and len(data_b.get('questions', [])) == 1):
                log_test("Independent product configurations", True, "✅ Both products configured correctly")
                passed += 1
            else:
                log_test("Independent product configurations", False, f"❌ Config mismatch: A={data_a.get('configured')}, B={data_b.get('configured')}")
                failed += 1
        else:
            log_test("Independent product configurations", False, f"❌ HTTP errors: A={response_a.status_code}, B={response_b.status_code}")
            failed += 1
    except Exception as e:
        log_test("Independent product configurations", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 7: GET /api/admin/feedback/questions/all
    print("=== TEST 7: GET all admin forms ===")
    try:
        response = requests.get(f"{BASE_URL}/api/admin/feedback/questions/all")
        if response.status_code == 200:
            data = response.json()
            forms = data.get('forms', [])
            product_ids = [form.get('productId') for form in forms]
            if product_a_id in product_ids and product_b_id in product_ids:
                log_test("GET all admin forms", True, f"✅ Found both test products in {len(forms)} total forms")
                passed += 1
            else:
                log_test("GET all admin forms", False, f"❌ Missing test products in: {product_ids}")
                failed += 1
        else:
            log_test("GET all admin forms", False, f"❌ Expected 200, got {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("GET all admin forms", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 8: Create test user
    print("=== TEST 8: Create test user ===")
    try:
        user_data = {"phone": user_phone, "name": "Test User Final", "email": f"user-{test_id}@test.com", "age": 25}
        response = requests.post(f"{BASE_URL}/api/users", json=user_data)
        
        if response.status_code == 200:
            log_test("Create test user", True, f"✅ Test user created: {user_phone}")
            passed += 1
            # Small delay to ensure user is persisted
            time.sleep(0.5)
        else:
            log_test("Create test user", False, f"❌ User creation failed: {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("Create test user", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 9: Submit feedback for configured product (should succeed)
    print("=== TEST 9: Submit feedback for configured product ===")
    try:
        # Get questions for Product A
        questions_response = requests.get(f"{BASE_URL}/api/feedback/questions?productId={product_a_id}")
        if questions_response.status_code != 200:
            log_test("Submit feedback for configured product", False, "❌ Failed to get questions")
            failed += 1
        else:
            questions_data = questions_response.json()
            questions = questions_data.get('questions', [])
            
            # Build answers for all required questions
            answers = []
            for q in questions:
                if q['type'] == 'star_rating':
                    answers.append({"questionId": q['id'], "question": q['question'], "type": q['type'], "answer": 5})
                elif q['type'] == 'long_text':
                    answers.append({"questionId": q['id'], "question": q['question'], "type": q['type'], "answer": "Great product!"})
            
            # Submit feedback
            feedback_data = {
                "userPhone": user_phone,
                "productId": product_a_id,
                "productName": "Product A Test",
                "answers": answers
            }
            
            response = requests.post(f"{BASE_URL}/api/feedback/submit", json=feedback_data)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    log_test("Submit feedback for configured product", True, "✅ Feedback submitted successfully")
                    passed += 1
                else:
                    log_test("Submit feedback for configured product", False, f"❌ Unexpected response: {data}")
                    failed += 1
            else:
                log_test("Submit feedback for configured product", False, f"❌ Expected 200, got {response.status_code}: {response.text}")
                failed += 1
    except Exception as e:
        log_test("Submit feedback for configured product", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 10: Submit feedback for unconfigured product (should fail)
    print("=== TEST 10: Submit feedback for unconfigured product ===")
    try:
        unconfigured_product_id = f"unconfigured-{test_id}"
        feedback_data = {
            "userPhone": user_phone,
            "productId": unconfigured_product_id,
            "productName": "Unconfigured Product",
            "answers": [{"questionId": "fake", "question": "Fake", "type": "short_text", "answer": "Fake"}]
        }
        
        response = requests.post(f"{BASE_URL}/api/feedback/submit", json=feedback_data)
        if response.status_code == 400:
            data = response.json()
            if data.get('message') == 'Feedback form is not configured for this product yet':
                log_test("Submit feedback for unconfigured product", True, "✅ Correctly rejected unconfigured product")
                passed += 1
            else:
                log_test("Submit feedback for unconfigured product", False, f"❌ Wrong error message: {data.get('message')}")
                failed += 1
        else:
            log_test("Submit feedback for unconfigured product", False, f"❌ Expected 400, got {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("Submit feedback for unconfigured product", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 11: Submit duplicate feedback (should fail)
    print("=== TEST 11: Submit duplicate feedback ===")
    try:
        # Try to submit feedback again for the same user+product combination
        questions_response = requests.get(f"{BASE_URL}/api/feedback/questions?productId={product_a_id}")
        if questions_response.status_code == 200:
            questions_data = questions_response.json()
            questions = questions_data.get('questions', [])
            
            answers = []
            for q in questions:
                if q['type'] == 'star_rating':
                    answers.append({"questionId": q['id'], "question": q['question'], "type": q['type'], "answer": 3})
                elif q['type'] == 'long_text':
                    answers.append({"questionId": q['id'], "question": q['question'], "type": q['type'], "answer": "Duplicate attempt"})
            
            feedback_data = {
                "userPhone": user_phone,  # Same user as Test 9
                "productId": product_a_id,   # Same product as Test 9
                "productName": "Product A Test",
                "answers": answers
            }
            
            response = requests.post(f"{BASE_URL}/api/feedback/submit", json=feedback_data)
            if response.status_code == 400:
                data = response.json()
                if 'already submitted' in data.get('message', '').lower():
                    log_test("Submit duplicate feedback", True, "✅ Correctly prevented duplicate submission")
                    passed += 1
                else:
                    log_test("Submit duplicate feedback", False, f"❌ Wrong error message: {data.get('message')}")
                    failed += 1
            else:
                log_test("Submit duplicate feedback", False, f"❌ Expected 400, got {response.status_code}")
                failed += 1
        else:
            log_test("Submit duplicate feedback", False, "❌ Failed to get questions for duplicate test")
            failed += 1
    except Exception as e:
        log_test("Submit duplicate feedback", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Test 12: Product-scoped deactivation
    print("=== TEST 12: Product-scoped deactivation ===")
    try:
        # Create new form for Product A (should deactivate old Product A form but not Product B)
        new_questions = [
            {"type": "short_text", "question": "New question for Product A", "required": True}
        ]
        payload = {
            "productId": product_a_id,
            "productName": "Product A Updated",
            "title": "Updated Product A Form",
            "questions": new_questions
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=payload)
        if response.status_code == 200:
            # Check Product A has new form (1 question)
            response_a = requests.get(f"{BASE_URL}/api/feedback/questions?productId={product_a_id}")
            # Check Product B still has original form (1 question)
            response_b = requests.get(f"{BASE_URL}/api/feedback/questions?productId={product_b_id}")
            
            if (response_a.status_code == 200 and response_b.status_code == 200):
                data_a = response_a.json()
                data_b = response_b.json()
                if (data_a.get('configured') == True and len(data_a.get('questions', [])) == 1 and
                    data_a.get('title') == 'Updated Product A Form' and
                    data_b.get('configured') == True and len(data_b.get('questions', [])) == 1 and
                    data_b.get('title') == 'Product B Feedback'):
                    log_test("Product-scoped deactivation", True, "✅ Product A updated, Product B unchanged")
                    passed += 1
                else:
                    log_test("Product-scoped deactivation", False, f"❌ Unexpected forms: A={data_a}, B={data_b}")
                    failed += 1
            else:
                log_test("Product-scoped deactivation", False, f"❌ Failed to get forms: A={response_a.status_code}, B={response_b.status_code}")
                failed += 1
        else:
            log_test("Product-scoped deactivation", False, f"❌ Failed to create new form: {response.status_code}")
            failed += 1
    except Exception as e:
        log_test("Product-scoped deactivation", False, f"❌ Exception: {str(e)}")
        failed += 1
    
    # Final Results
    print()
    print("=" * 70)
    print("🏆 FINAL TEST RESULTS")
    print("=" * 70)
    print(f"✅ PASSED: {passed}")
    print(f"❌ FAILED: {failed}")
    print(f"📊 SUCCESS RATE: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Per-product feedback system is working perfectly!")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please review the issues above.")
        return False

if __name__ == "__main__":
    success = run_comprehensive_tests()
    sys.exit(0 if success else 1)