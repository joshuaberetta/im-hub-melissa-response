"""
Sample script to import contacts into the IM Hub database
This demonstrates how to migrate data from existing sources (e.g., PowerBI export, CSV)
"""

import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000"
# Get your token by logging in via the web interface and checking localStorage
AUTH_TOKEN = "YOUR_AUTH_TOKEN_HERE"

# Sample contacts data
# In practice, you would load this from a CSV, Excel, or database export
sample_contacts = [
    {
        "name": "Maria Garcia",
        "organization": "UNICEF",
        "position": "Education Officer",
        "email": "maria.garcia@unicef.org",
        "phone": "+1-876-555-0101",
        "sector": "Education",
        "parish": "Kingston",
        "community": "Downtown Kingston",
        "latitude": "17.9714",
        "longitude": "-76.7931",
        "location_type": "office",
        "status": "active",
        "notes": "Leads education cluster coordination"
    },
    {
        "name": "James Brown",
        "organization": "UNHCR",
        "position": "Protection Officer",
        "email": "brown@unhcr.org",
        "phone": "+1-876-555-0102",
        "sector": "Protection",
        "parish": "St. Andrew",
        "community": "Half Way Tree",
        "latitude": "18.0179",
        "longitude": "-76.7931",
        "location_type": "field",
        "status": "deployed",
        "notes": "GBV focal point"
    },
    {
        "name": "Sarah Johnson",
        "organization": "WFP",
        "position": "Food Security Specialist",
        "email": "sarah.johnson@wfp.org",
        "phone": "+1-876-555-0103",
        "sector": "Food Security",
        "parish": "Clarendon",
        "community": "May Pen",
        "latitude": "17.9647",
        "longitude": "-77.2453",
        "location_type": "field",
        "status": "active",
        "notes": "Coordinates food distributions"
    },
    {
        "name": "David Chen",
        "organization": "IFRC",
        "position": "Shelter Coordinator",
        "email": "d.chen@ifrc.org",
        "phone": "+1-876-555-0104",
        "sector": "Shelter",
        "parish": "St. James",
        "community": "Montego Bay",
        "latitude": "18.4762",
        "longitude": "-77.8939",
        "location_type": "field",
        "status": "active",
        "notes": "Manages shelter assessments"
    },
    {
        "name": "Emily White",
        "organization": "WHO",
        "position": "Health Officer",
        "email": "e.white@who.int",
        "phone": "+1-876-555-0105",
        "sector": "Health",
        "parish": "St. Catherine",
        "community": "Spanish Town",
        "latitude": "17.9911",
        "longitude": "-76.9572",
        "location_type": "mobile",
        "status": "active",
        "notes": "Mobile clinic coordinator"
    },
    {
        "name": "Robert Taylor",
        "organization": "Oxfam",
        "position": "WASH Specialist",
        "email": "r.taylor@oxfam.org",
        "sector": "WASH",
        "parish": "Manchester",
        "community": "Mandeville",
        "latitude": "18.0426",
        "longitude": "-77.5019",
        "location_type": "field",
        "status": "active",
        "notes": "Water system assessments"
    },
    {
        "name": "Linda Martinez",
        "organization": "Save the Children",
        "position": "Child Protection Officer",
        "email": "l.martinez@savethechildren.org",
        "sector": "Protection",
        "parish": "Portland",
        "community": "Port Antonio",
        "latitude": "18.1753",
        "longitude": "-76.4532",
        "location_type": "field",
        "status": "active",
        "notes": "Child-friendly spaces coordinator"
    },
    {
        "name": "Michael Anderson",
        "organization": "IOM",
        "position": "Data Analyst",
        "email": "manderson@iom.int",
        "sector": "Cross-Sector",
        "parish": None,
        "community": None,
        "latitude": None,
        "longitude": None,
        "location_type": "remote",
        "status": "active",
        "notes": "Working remotely from regional office"
    },
    {
        "name": "Jennifer Lee",
        "organization": "OCHA",
        "position": "Information Management Officer",
        "email": "lee@un.org",
        "phone": "+1-876-555-0108",
        "sector": "Cross-Sector",
        "parish": "Kingston",
        "community": "New Kingston",
        "latitude": "18.0059",
        "longitude": "-76.7837",
        "location_type": "office",
        "status": "active",
        "notes": "Coordinates 5W and situation reports"
    },
    {
        "name": "Carlos Rodriguez",
        "organization": "Red Cross",
        "position": "Emergency Response Officer",
        "email": "c.rodriguez@redcross.org",
        "phone": "+1-876-555-0109",
        "sector": "Cross-Sector",
        "parish": "St. Elizabeth",
        "community": "Black River",
        "latitude": "18.0267",
        "longitude": "-77.8497",
        "location_type": "field",
        "status": "deployed",
        "notes": "First responder team lead"
    }
]


def import_contacts(contacts_data, auth_token):
    """
    Import a list of contacts via the API
    
    Args:
        contacts_data: List of contact dictionaries
        auth_token: Authentication token for API
    
    Returns:
        Tuple of (success_count, error_count, errors)
    """
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    success_count = 0
    error_count = 0
    errors = []
    
    for i, contact in enumerate(contacts_data, 1):
        try:
            response = requests.post(
                f"{API_BASE_URL}/api/contacts",
                json=contact,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                success_count += 1
                print(f"✓ [{i}/{len(contacts_data)}] Imported: {contact['name']} ({contact['organization']})")
            else:
                error_count += 1
                error_msg = f"Failed: {contact['name']} - {response.status_code}: {response.text}"
                errors.append(error_msg)
                print(f"✗ [{i}/{len(contacts_data)}] {error_msg}")
                
        except requests.exceptions.RequestException as e:
            error_count += 1
            error_msg = f"Network error for {contact['name']}: {str(e)}"
            errors.append(error_msg)
            print(f"✗ [{i}/{len(contacts_data)}] {error_msg}")
    
    return success_count, error_count, errors


def import_from_csv(csv_file_path, auth_token):
    """
    Import contacts from a CSV file
    
    CSV should have columns: name, organization, position, email, phone, sector,
                             parish, community, latitude, longitude, location_type, status, notes
    """
    import csv
    
    contacts = []
    
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert empty strings to None for optional fields
            contact = {
                "name": row['name'],
                "organization": row['organization'],
                "position": row.get('position') or None,
                "email": row.get('email') or None,
                "phone": row.get('phone') or None,
                "sector": row.get('sector') or None,
                "parish": row.get('parish') or None,
                "community": row.get('community') or None,
                "latitude": row.get('latitude') or None,
                "longitude": row.get('longitude') or None,
                "location_type": row.get('location_type', 'field'),
                "status": row.get('status', 'active'),
                "notes": row.get('notes') or None,
            }
            contacts.append(contact)
    
    return import_contacts(contacts, auth_token)


def export_template_csv(output_path='contacts_template.csv'):
    """
    Generate a CSV template for importing contacts
    """
    import csv
    
    fieldnames = [
        'name', 'organization', 'position', 'email', 'phone', 'sector',
        'parish', 'community', 'latitude', 'longitude', 'location_type', 'status', 'notes'
    ]
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        # Add a sample row
        writer.writerow({
            'name': 'John Doe',
            'organization': 'Example Org',
            'position': 'Program Officer',
            'email': 'john@example.org',
            'phone': '+1-876-555-0100',
            'sector': 'Health',
            'parish': 'Kingston',
            'community': 'Downtown',
            'latitude': '17.9714',
            'longitude': '-76.7931',
            'location_type': 'field',
            'status': 'active',
            'notes': 'Sample contact'
        })
    
    print(f"✓ Template CSV created at: {output_path}")


if __name__ == "__main__":
    import sys
    
    print("IM Hub Contact Importer")
    print("=" * 50)
    
    if AUTH_TOKEN == "YOUR_AUTH_TOKEN_HERE":
        print("\n⚠ WARNING: You need to set your AUTH_TOKEN first!")
        print("\nTo get your auth token:")
        print("1. Login to the IM Hub web interface")
        print("2. Open browser developer tools (F12)")
        print("3. Go to Application > Local Storage")
        print("4. Copy the 'token' value")
        print("5. Set AUTH_TOKEN in this script\n")
        sys.exit(1)
    
    print(f"\nAPI: {API_BASE_URL}")
    print(f"Contacts to import: {len(sample_contacts)}\n")
    
    choice = input("Choose an option:\n1. Import sample contacts\n2. Generate CSV template\n3. Import from CSV\n\nEnter choice (1-3): ")
    
    if choice == "1":
        print("\nImporting sample contacts...\n")
        success, errors, error_list = import_contacts(sample_contacts, AUTH_TOKEN)
        print(f"\n{'='*50}")
        print(f"Import complete!")
        print(f"✓ Success: {success}")
        print(f"✗ Errors: {errors}")
        if error_list:
            print("\nError details:")
            for error in error_list:
                print(f"  - {error}")
    
    elif choice == "2":
        output_file = input("\nOutput file name (default: contacts_template.csv): ").strip()
        if not output_file:
            output_file = "contacts_template.csv"
        export_template_csv(output_file)
    
    elif choice == "3":
        csv_file = input("\nCSV file path: ").strip()
        print(f"\nImporting from {csv_file}...\n")
        try:
            success, errors, error_list = import_from_csv(csv_file, AUTH_TOKEN)
            print(f"\n{'='*50}")
            print(f"Import complete!")
            print(f"✓ Success: {success}")
            print(f"✗ Errors: {errors}")
            if error_list:
                print("\nError details:")
                for error in error_list:
                    print(f"  - {error}")
        except FileNotFoundError:
            print(f"✗ Error: File '{csv_file}' not found")
        except Exception as e:
            print(f"✗ Error: {str(e)}")
    
    else:
        print("Invalid choice")
