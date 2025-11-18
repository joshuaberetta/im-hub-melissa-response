# Adding Data to Seed (Workaround for Free Tier)

Since the free tier loses data on rebuild, you can add important data to the seed function so it's automatically recreated on each restart.

## Location

Edit: `backend/database.py`

Function: `seed_initial_data()`

## Adding Users

Add permanent admin users to the seed function:

```python
def seed_initial_data():
    """Add some initial WhatsApp groups and default admin user for testing"""
    import os
    db = SessionLocal()
    try:
        # Create default admin user if no users exist
        user_count = db.query(User).count()
        if user_count == 0:
            # Default admin from environment
            admin_username = os.getenv("ADMIN_USERNAME", "admin")
            admin_password = os.getenv("ADMIN_PASSWORD", "password")
            
            admin_user = User(
                username=admin_username,
                full_name="System Administrator",
                is_admin=True,
                is_active=True
            )
            admin_user.set_password(admin_password)
            db.add(admin_user)
            
            # ADD YOUR PERMANENT USERS HERE
            # Example: Add a specific user
            melissa_user = User(
                username="melissa",
                full_name="Melissa Response Coordinator",
                email="melissa@example.com",
                is_admin=True,
                is_active=True
            )
            melissa_user.set_password("your-secure-password-here")
            db.add(melissa_user)
            
            # Add another user
            viewer_user = User(
                username="viewer",
                full_name="Report Viewer",
                email="viewer@example.com",
                is_admin=False,
                is_active=True
            )
            viewer_user.set_password("viewer-password")
            db.add(viewer_user)
            
            db.commit()
            print(f"Created {db.query(User).count()} users")
```

## Adding Announcements

Add permanent announcements:

```python
def seed_initial_data():
    # ... existing user code ...
    
    # Add announcements
    announcement_count = db.query(Announcement).count()
    if announcement_count == 0:
        announcements = [
            Announcement(
                title="Welcome to IM Hub",
                content="<p>This is the Information Management Hub for Jamaica Hurricane Response 2025.</p>",
                date=datetime(2025, 11, 17),
                priority="high",
                author="IM Team",
                tags="welcome,important",
                approved=True
            ),
            Announcement(
                title="Data Collection Forms Available",
                content="<p>5W and assessment forms are now available in the Forms menu.</p>",
                date=datetime(2025, 11, 18),
                priority="normal",
                author="IM Team",
                tags="forms,5w",
                approved=True
            )
        ]
        db.add_all(announcements)
        db.commit()
        print(f"Created {len(announcements)} announcements")
```

## Adding Contacts

Add permanent contacts:

```python
def seed_initial_data():
    # ... existing code ...
    
    # Add contacts
    contact_count = db.query(Contact).count()
    if contact_count == 0:
        contacts = [
            Contact(
                name="John Smith",
                organization="UNICEF",
                position="IM Officer",
                email="john.smith@unicef.org",
                phone="+1-876-555-0100",
                sector="Cross-Sector",
                parish="Kingston",
                location_type="office",
                status="active",
                approved=True
            ),
            Contact(
                name="Jane Doe",
                organization="OCHA",
                position="Coordination Officer",
                email="jane.doe@un.org",
                sector="Coordination",
                parish="Kingston",
                location_type="office",
                status="active",
                approved=True
            )
        ]
        db.add_all(contacts)
        db.commit()
        print(f"Created {len(contacts)} contacts")
```

## Complete Example

Here's a complete `seed_initial_data()` function with multiple data types:

```python
def seed_initial_data():
    """Add initial data that will be recreated on each deployment"""
    import os
    from datetime import datetime
    
    db = SessionLocal()
    try:
        # ==================
        # USERS
        # ==================
        user_count = db.query(User).count()
        if user_count == 0:
            users = [
                # Admin from environment
                User(
                    username=os.getenv("ADMIN_USERNAME", "admin"),
                    full_name="System Administrator",
                    is_admin=True,
                    is_active=True
                ),
                # Add your permanent users
                User(
                    username="melissa",
                    full_name="Melissa Response Lead",
                    email="melissa@response.org",
                    is_admin=True,
                    is_active=True
                ),
                User(
                    username="coordinator",
                    full_name="Field Coordinator",
                    email="coordinator@response.org",
                    is_admin=False,
                    is_active=True
                )
            ]
            
            # Set passwords
            users[0].set_password(os.getenv("ADMIN_PASSWORD", "password"))
            users[1].set_password("melissa-secure-password")
            users[2].set_password("coordinator-password")
            
            db.add_all(users)
            db.commit()
            print(f"Created {len(users)} users")
        
        # ==================
        # ANNOUNCEMENTS
        # ==================
        announcement_count = db.query(Announcement).count()
        if announcement_count == 0:
            announcements = [
                Announcement(
                    title="Welcome to IM Hub",
                    content="<p>Central information management platform for Jamaica Hurricane Response.</p>",
                    date=datetime(2025, 11, 17),
                    priority="high",
                    author="IM Team",
                    tags="welcome",
                    approved=True
                )
            ]
            db.add_all(announcements)
            db.commit()
            print(f"Created {len(announcements)} announcements")
        
        # ==================
        # WHATSAPP GROUPS (existing code)
        # ==================
        existing_count = db.query(WhatsAppGroup).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} WhatsApp groups")
            return
        
        # Your existing WhatsApp groups...
        initial_groups = [
            # ... existing groups ...
        ]
        
        db.add_all(initial_groups)
        db.commit()
        print(f"Seeded {len(initial_groups)} WhatsApp groups")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()
```

## Important Notes

### Security Considerations

**DO NOT hardcode real passwords in seed data!**

Better approaches:

1. **Use environment variables:**
   ```python
   user.set_password(os.getenv("MELISSA_PASSWORD", "default-dev-password"))
   ```

2. **Only seed in development:**
   ```python
   if not os.getenv("RENDER"):  # Only seed locally
       # Add development users
   ```

3. **Create users through admin panel in production**
   - Even though they'll be lost on rebuild
   - This is why upgrading or using PostgreSQL is recommended

### When to Use Seed Data

**Good for:**
- Development/testing users
- Demo accounts
- Sample data for testing
- Default configuration

**NOT good for:**
- Production user accounts
- Real operational data
- Sensitive information
- Frequently changing data

## Better Solution

Instead of relying on seed data, **upgrade to PostgreSQL** or **paid Render plan** for persistent storage.

See `DATABASE_PERSISTENCE_ISSUE.md` for migration guide.

## Deployment Workflow

1. Update `seed_initial_data()` with permanent data
2. Push to GitHub
3. Render rebuilds automatically
4. Seed data is recreated on startup
5. Login with seeded credentials

Remember: This is a **workaround** for free tier limitations, not a production solution!
