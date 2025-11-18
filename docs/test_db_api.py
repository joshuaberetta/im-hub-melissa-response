#!/usr/bin/env python3
"""
Quick test script for database API endpoints
Run with: python test_db_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"

# Test credentials (update these to match your .env)
USERNAME = "melissa"
PASSWORD = "your-password-here"  # Update this!

def test_api():
    print("🧪 Testing IM Hub Database API\n")
    
    # 1. Login
    print("1️⃣ Testing login...")
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": USERNAME, "password": PASSWORD}
    )
    
    if login_response.status_code != 200:
        print("❌ Login failed! Update USERNAME and PASSWORD in script.")
        print(f"   Response: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful\n")
    
    # 2. Get WhatsApp Groups
    print("2️⃣ Testing GET /api/whatsapp-groups...")
    groups_response = requests.get(
        f"{BASE_URL}/api/whatsapp-groups",
        headers=headers
    )
    
    if groups_response.status_code == 200:
        groups = groups_response.json()
        print(f"✅ Retrieved {len(groups)} WhatsApp groups")
        if groups:
            print(f"   First group: {groups[0]['name']} ({groups[0]['sector']})")
    else:
        print(f"❌ Failed: {groups_response.text}")
    print()
    
    # 3. Create a test WhatsApp Group
    print("3️⃣ Testing POST /api/whatsapp-groups...")
    new_group = {
        "name": "Test IM Coordination Group",
        "sector": "Cross-Sector",
        "description": "This is a test group created by the API test script",
        "link": "https://chat.whatsapp.com/test123",
        "contact_name": "Test User",
        "contact_email": "test@example.org"
    }
    
    create_response = requests.post(
        f"{BASE_URL}/api/whatsapp-groups",
        headers=headers,
        json=new_group
    )
    
    if create_response.status_code == 201:
        created_group = create_response.json()
        print(f"✅ Created group with ID: {created_group['id']}")
        print(f"   Approved: {created_group['approved']} (should be False)")
        test_group_id = created_group['id']
    else:
        print(f"❌ Failed: {create_response.text}")
        return
    print()
    
    # 4. Get unapproved groups
    print("4️⃣ Testing GET /api/whatsapp-groups?approved_only=false...")
    all_groups_response = requests.get(
        f"{BASE_URL}/api/whatsapp-groups?approved_only=false",
        headers=headers
    )
    
    if all_groups_response.status_code == 200:
        all_groups = all_groups_response.json()
        unapproved = [g for g in all_groups if not g['approved']]
        print(f"✅ Found {len(unapproved)} unapproved group(s)")
    else:
        print(f"❌ Failed: {all_groups_response.text}")
    print()
    
    # 5. Approve the test group
    print("5️⃣ Testing PATCH /api/whatsapp-groups/{id}/approve...")
    approve_response = requests.patch(
        f"{BASE_URL}/api/whatsapp-groups/{test_group_id}/approve",
        headers=headers
    )
    
    if approve_response.status_code == 200:
        print(f"✅ Approved group ID {test_group_id}")
    else:
        print(f"❌ Failed: {approve_response.text}")
    print()
    
    # 6. Delete the test group
    print("6️⃣ Testing DELETE /api/whatsapp-groups/{id}...")
    delete_response = requests.delete(
        f"{BASE_URL}/api/whatsapp-groups/{test_group_id}",
        headers=headers
    )
    
    if delete_response.status_code == 200:
        print(f"✅ Deleted group ID {test_group_id}")
    else:
        print(f"❌ Failed: {delete_response.text}")
    print()
    
    # 7. Test Resources endpoint
    print("7️⃣ Testing GET /api/resources-db...")
    resources_response = requests.get(
        f"{BASE_URL}/api/resources-db",
        headers=headers
    )
    
    if resources_response.status_code == 200:
        resources = resources_response.json()
        print(f"✅ Retrieved {len(resources)} resources")
    else:
        print(f"❌ Failed: {resources_response.text}")
    print()
    
    # 8. Test Contact Submissions endpoint
    print("8️⃣ Testing GET /api/contact-submissions...")
    contacts_response = requests.get(
        f"{BASE_URL}/api/contact-submissions",
        headers=headers
    )
    
    if contacts_response.status_code == 200:
        contacts = contacts_response.json()
        print(f"✅ Retrieved {len(contacts)} contact submissions")
    else:
        print(f"❌ Failed: {contacts_response.text}")
    print()
    
    print("✨ API testing complete!")

if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend!")
        print(f"   Make sure the backend is running at {BASE_URL}")
        print("   Start it with: cd backend && python main.py")
