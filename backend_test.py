#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Feedback System APIs
Tests all feedback-related endpoints with end-to-end scenarios
"""

import requests
import json
import time
from urllib.parse import quote

# Configuration
BASE_URL = "http://localhost:3000"
ADMIN_PASSWORD = "admin123"
TEST_USER_PHONE = "+919999000001"

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_admin_feedback_questions_post():
    """Test POST /api/admin/feedback/questions - Admin saves feedback questionnaire"""
    print("🧪 Testing POST /api/admin/feedback/questions...")
    
    # Test 1: Create comprehensive questionnaire with all supported types
    questionnaire = {
        "title": "Product Feedback Survey",
        "description": "Please share your experience with our product",
        "questions": [
            {
                "type": "short_text",
                "question": "What is your name?",
                "required": True
            },
            {
                "type": "long_text", 
                "question": "Please describe your overall experience",
                "required": True
            },
            {
                "type": "single_choice",
                "question": "How would you rate this product?",
                "required": True,
                "options": ["Excellent", "Good", "Average", "Poor"]
            },
            {
                "type": "multiple_choice",
                "question": "Which features did you like? (Select all that apply)",
                "required": False,
                "options": ["Design", "Quality", "Price", "Functionality", "Customer Service"]
            },
            {
                "type": "dropdown",
                "question": "How did you hear about us?",
                "required": True,
                "options": ["Social Media", "Friend Referral", "Online Search", "Advertisement", "Other"]
            },
            {
                "type": "linear_scale",
                "question": "Rate your satisfaction level",
                "required": True,
                "scale": {
                    "min": 1,
                    "max": 10,
                    "minLabel": "Very Dissatisfied",
                    "maxLabel": "Very Satisfied"
                }
            },
            {
                "type": "star_rating",
                "question": "Overall star rating",
                "required": True,
                "maxRating": 5
            },
            {
                "type": "email",
                "question": "Your email address",
                "required": False
            },
            {
                "type": "number",
                "question": "How many times have you purchased from us?",
                "required": False
            },
            {
                "type": "date",
                "question": "When did you first purchase from us?",
                "required": False
            },
            {
                "type": "time",
                "question": "What time do you usually shop?",
                "required": False
            }
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=questionnaire)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'form' in data:
                form = data['form']
                print_test_result("Create comprehensive questionnaire", True, 
                                f"Created form with {len(form['questions'])} questions")
                return form['id']
            else:
                print_test_result("Create comprehensive questionnaire", False, 
                                f"Unexpected response: {data}")
                return None
        else:
            print_test_result("Create comprehensive questionnaire", False, 
                            f"Status {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print_test_result("Create comprehensive questionnaire", False, f"Exception: {str(e)}")
        return None

def test_admin_feedback_questions_validation():
    """Test validation rules for POST /api/admin/feedback/questions"""
    print("🧪 Testing validation rules for feedback questions...")
    
    # Test 1: Invalid question type
    try:
        invalid_type = {
            "questions": [{"type": "invalid_type", "question": "Test question"}]
        }
        response = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=invalid_type)
        success = response.status_code == 500 and "Invalid question type" in response.text
        print_test_result("Reject invalid question type", success, 
                        f"Status {response.status_code}")
    except Exception as e:
        print_test_result("Reject invalid question type", False, f"Exception: {str(e)}")
    
    # Test 2: Empty question text
    try:
        empty_question = {
            "questions": [{"type": "short_text", "question": ""}]
        }
        response = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=empty_question)
        success = response.status_code == 500 and "must have text" in response.text
        print_test_result("Reject empty question text", success, 
                        f"Status {response.status_code}")
    except Exception as e:
        print_test_result("Reject empty question text", False, f"Exception: {str(e)}")
    
    # Test 3: Choice question without options
    try:
        no_options = {
            "questions": [{"type": "single_choice", "question": "Choose one", "options": []}]
        }
        response = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=no_options)
        success = response.status_code == 500 and "must have at least one option" in response.text
        print_test_result("Reject choice question without options", success, 
                        f"Status {response.status_code}")
    except Exception as e:
        print_test_result("Reject choice question without options", False, f"Exception: {str(e)}")

def test_feedback_questions_get():
    """Test GET /api/feedback/questions - Returns active questionnaire"""
    print("🧪 Testing GET /api/feedback/questions...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/feedback/questions")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                questions = data.get('questions', [])
                title = data.get('title', '')
                description = data.get('description', '')
                updated_at = data.get('updatedAt')
                
                print_test_result("Get active questionnaire", True, 
                                f"Retrieved {len(questions)} questions, title: '{title}'")
                return data
            else:
                print_test_result("Get active questionnaire", False, 
                                f"Success=False: {data}")
                return None
        else:
            print_test_result("Get active questionnaire", False, 
                            f"Status {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print_test_result("Get active questionnaire", False, f"Exception: {str(e)}")
        return None

def create_test_user():
    """Create a test user for feedback submission"""
    print("🧪 Creating test user...")
    
    test_user = {
        "phone": TEST_USER_PHONE,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "age": 30
    }
    
    try:
        # First create the user
        response = requests.post(f"{BASE_URL}/api/users", json=test_user)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                # Now get the user details
                encoded_phone = quote(TEST_USER_PHONE, safe='')
                get_response = requests.get(f"{BASE_URL}/api/users/{encoded_phone}")
                
                if get_response.status_code == 200:
                    get_data = get_response.json()
                    if get_data.get('success') and 'user' in get_data:
                        user = get_data['user']
                        print_test_result("Create test user", True, 
                                        f"User created/retrieved: {user.get('name')}")
                        return user
                
                print_test_result("Create test user", True, "User created but details not retrieved")
                return {"phone": TEST_USER_PHONE, "name": "John Doe"}
            else:
                print_test_result("Create test user", False, f"Response: {data}")
                return None
        else:
            print_test_result("Create test user", False, 
                            f"Status {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print_test_result("Create test user", False, f"Exception: {str(e)}")
        return None

def test_feedback_submit():
    """Test POST /api/feedback/submit - Submit feedback for a product"""
    print("🧪 Testing POST /api/feedback/submit...")
    
    # First ensure we have an active questionnaire
    active_form = test_feedback_questions_get()
    if not active_form or not active_form.get('questions'):
        print("❌ No active questionnaire found, cannot test feedback submission")
        return None
    
    # Create test user
    user = create_test_user()
    if not user:
        print("❌ Failed to create test user, cannot test feedback submission")
        return None
    
    # Prepare answers based on active questionnaire
    questions = active_form['questions']
    answers = []
    
    for question in questions:
        answer_data = {
            "questionId": question['id'],
            "question": question['question'],
            "type": question['type']
        }
        
        # Provide appropriate answers based on question type
        if question['type'] == 'short_text':
            answer_data['answer'] = "John Doe"
        elif question['type'] == 'long_text':
            answer_data['answer'] = "This product exceeded my expectations. The quality is excellent and the customer service was outstanding."
        elif question['type'] == 'single_choice':
            answer_data['answer'] = question.get('options', ['Good'])[0]
        elif question['type'] == 'multiple_choice':
            answer_data['answer'] = question.get('options', ['Design'])[:2]  # Select first 2 options
        elif question['type'] == 'dropdown':
            answer_data['answer'] = question.get('options', ['Online Search'])[0]
        elif question['type'] == 'linear_scale':
            answer_data['answer'] = 8
        elif question['type'] == 'star_rating':
            answer_data['answer'] = 5
        elif question['type'] == 'email':
            answer_data['answer'] = "john.doe@example.com"
        elif question['type'] == 'number':
            answer_data['answer'] = 3
        elif question['type'] == 'date':
            answer_data['answer'] = "2024-01-15"
        elif question['type'] == 'time':
            answer_data['answer'] = "14:30"
        else:
            answer_data['answer'] = "Test answer"
        
        answers.append(answer_data)
    
    # Test 1: Valid feedback submission
    feedback_data = {
        "userPhone": TEST_USER_PHONE,
        "productId": "PROD123",
        "productName": "Test Product",
        "answers": answers
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/feedback/submit", json=feedback_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'feedback' in data:
                print_test_result("Submit valid feedback", True, 
                                f"Feedback submitted with {len(data['feedback']['answers'])} answers")
                feedback_id = data['feedback']['id']
            else:
                print_test_result("Submit valid feedback", False, f"Response: {data}")
                return None
        else:
            print_test_result("Submit valid feedback", False, 
                            f"Status {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print_test_result("Submit valid feedback", False, f"Exception: {str(e)}")
        return None
    
    # Test 2: Duplicate submission (should be rejected)
    try:
        response = requests.post(f"{BASE_URL}/api/feedback/submit", json=feedback_data)
        
        if response.status_code == 400:
            data = response.json()
            success = not data.get('success') and "already submitted feedback" in data.get('message', '')
            print_test_result("Reject duplicate submission", success, 
                            f"Message: {data.get('message')}")
        else:
            print_test_result("Reject duplicate submission", False, 
                            f"Expected 400, got {response.status_code}")
            
    except Exception as e:
        print_test_result("Reject duplicate submission", False, f"Exception: {str(e)}")
    
    # Test 3: Missing required field
    if any(q.get('required') for q in questions):
        incomplete_answers = [a for a in answers if not questions[answers.index(a)].get('required')][:1]  # Only non-required answers
        
        incomplete_data = {
            "userPhone": TEST_USER_PHONE,
            "productId": "PROD456",  # Different product
            "productName": "Another Test Product",
            "answers": incomplete_answers
        }
        
        try:
            response = requests.post(f"{BASE_URL}/api/feedback/submit", json=incomplete_data)
            
            if response.status_code == 400:
                data = response.json()
                success = not data.get('success') and "required questions" in data.get('message', '')
                print_test_result("Reject missing required field", success, 
                                f"Message: {data.get('message')}")
            else:
                print_test_result("Reject missing required field", False, 
                                f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            print_test_result("Reject missing required field", False, f"Exception: {str(e)}")
    
    # Test 4: Non-existent user
    nonexistent_data = {
        "userPhone": "+919999999999",  # Non-existent user
        "productId": "PROD789",
        "productName": "Test Product",
        "answers": answers
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/feedback/submit", json=nonexistent_data)
        
        if response.status_code == 404:
            data = response.json()
            success = not data.get('success') and "User not found" in data.get('message', '')
            print_test_result("Reject non-existent user", success, 
                            f"Message: {data.get('message')}")
        else:
            print_test_result("Reject non-existent user", False, 
                            f"Expected 404, got {response.status_code}")
            
    except Exception as e:
        print_test_result("Reject non-existent user", False, f"Exception: {str(e)}")
    
    return feedback_id

def test_feedback_retrieval_apis():
    """Test all feedback retrieval APIs"""
    print("🧪 Testing feedback retrieval APIs...")
    
    # Test 1: GET /api/feedback/product/:productId
    try:
        response = requests.get(f"{BASE_URL}/api/feedback/product/PROD123")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                feedbacks = data.get('feedbacks', [])
                total = data.get('total', 0)
                print_test_result("Get product feedback", True, 
                                f"Retrieved {len(feedbacks)} feedbacks, total: {total}")
            else:
                print_test_result("Get product feedback", False, f"Response: {data}")
        else:
            print_test_result("Get product feedback", False, 
                            f"Status {response.status_code}: {response.text}")
            
    except Exception as e:
        print_test_result("Get product feedback", False, f"Exception: {str(e)}")
    
    # Test 2: GET /api/feedback/product/:productId with limit
    try:
        response = requests.get(f"{BASE_URL}/api/feedback/product/PROD123?limit=1")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                feedbacks = data.get('feedbacks', [])
                print_test_result("Get product feedback with limit", True, 
                                f"Retrieved {len(feedbacks)} feedbacks (limit=1)")
            else:
                print_test_result("Get product feedback with limit", False, f"Response: {data}")
        else:
            print_test_result("Get product feedback with limit", False, 
                            f"Status {response.status_code}: {response.text}")
            
    except Exception as e:
        print_test_result("Get product feedback with limit", False, f"Exception: {str(e)}")
    
    # Test 3: GET /api/users/:phone/feedback
    encoded_phone = quote(TEST_USER_PHONE, safe='')
    try:
        response = requests.get(f"{BASE_URL}/api/users/{encoded_phone}/feedback")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                feedbacks = data.get('feedbacks', [])
                print_test_result("Get user feedback", True, 
                                f"Retrieved {len(feedbacks)} feedbacks for user")
            else:
                print_test_result("Get user feedback", False, f"Response: {data}")
        else:
            print_test_result("Get user feedback", False, 
                            f"Status {response.status_code}: {response.text}")
            
    except Exception as e:
        print_test_result("Get user feedback", False, f"Exception: {str(e)}")
    
    # Test 4: GET /api/admin/feedback
    try:
        response = requests.get(f"{BASE_URL}/api/admin/feedback")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                feedbacks = data.get('feedbacks', [])
                print_test_result("Get all feedback (admin)", True, 
                                f"Retrieved {len(feedbacks)} total feedbacks")
            else:
                print_test_result("Get all feedback (admin)", False, f"Response: {data}")
        else:
            print_test_result("Get all feedback (admin)", False, 
                            f"Status {response.status_code}: {response.text}")
            
    except Exception as e:
        print_test_result("Get all feedback (admin)", False, f"Exception: {str(e)}")

def test_question_deactivation():
    """Test that saving new questionnaire deactivates previous ones"""
    print("🧪 Testing question deactivation...")
    
    # Create first questionnaire
    first_questionnaire = {
        "title": "First Survey",
        "questions": [
            {"type": "short_text", "question": "First question", "required": True}
        ]
    }
    
    try:
        response1 = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=first_questionnaire)
        if response1.status_code != 200:
            print_test_result("Question deactivation test", False, "Failed to create first questionnaire")
            return
        
        # Verify first is active
        response_check1 = requests.get(f"{BASE_URL}/api/feedback/questions")
        if response_check1.status_code == 200:
            data1 = response_check1.json()
            if data1.get('title') != 'First Survey':
                print_test_result("Question deactivation test", False, "First questionnaire not active")
                return
        
        # Create second questionnaire
        second_questionnaire = {
            "title": "Second Survey",
            "questions": [
                {"type": "short_text", "question": "Second question", "required": True}
            ]
        }
        
        response2 = requests.post(f"{BASE_URL}/api/admin/feedback/questions", json=second_questionnaire)
        if response2.status_code != 200:
            print_test_result("Question deactivation test", False, "Failed to create second questionnaire")
            return
        
        # Verify second is now active (and first is deactivated)
        response_check2 = requests.get(f"{BASE_URL}/api/feedback/questions")
        if response_check2.status_code == 200:
            data2 = response_check2.json()
            if data2.get('title') == 'Second Survey':
                print_test_result("Question deactivation test", True, 
                                "New questionnaire activated, previous deactivated")
            else:
                print_test_result("Question deactivation test", False, 
                                f"Expected 'Second Survey', got '{data2.get('title')}'")
        else:
            print_test_result("Question deactivation test", False, "Failed to check active questionnaire")
            
    except Exception as e:
        print_test_result("Question deactivation test", False, f"Exception: {str(e)}")

def run_comprehensive_feedback_tests():
    """Run complete end-to-end feedback system tests"""
    print("🚀 Starting Comprehensive Feedback System Backend Tests")
    print("=" * 60)
    
    # Test sequence
    print("📋 Phase 1: Admin Question Management")
    form_id = test_admin_feedback_questions_post()
    test_admin_feedback_questions_validation()
    
    print("\n📋 Phase 2: Question Retrieval")
    active_form = test_feedback_questions_get()
    
    print("\n📋 Phase 3: Feedback Submission")
    feedback_id = test_feedback_submit()
    
    print("\n📋 Phase 4: Feedback Retrieval")
    test_feedback_retrieval_apis()
    
    print("\n📋 Phase 5: Question Deactivation")
    test_question_deactivation()
    
    print("\n" + "=" * 60)
    print("🏁 Feedback System Backend Testing Complete!")

if __name__ == "__main__":
    run_comprehensive_feedback_tests()