"""
Database models and configuration for IM Hub
Using SQLAlchemy ORM with SQLite
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from pathlib import Path
import bcrypt
import os

# Database file location
# Use persistent disk on Render, local file in development
if os.getenv('RENDER'):
    # Production on Render: use persistent disk
    DB_PATH = Path('/var/data/imhub.db')
else:
    # Development: use local file
    DB_PATH = Path(__file__).parent / "imhub.db"

DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Models
class WhatsAppGroup(Base):
    """WhatsApp coordination groups"""
    __tablename__ = "whatsapp_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    sector = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    link = Column(String(500), nullable=False)
    contact_name = Column(String(200))  # Person who registered the group
    contact_email = Column(String(200))  # Contact email
    approved = Column(Boolean, default=False)  # For moderation
    deleted = Column(Boolean, default=False)  # Soft delete flag
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "sector": self.sector,
            "description": self.description,
            "link": self.link,
            "contact_name": self.contact_name,
            "contact_email": self.contact_email,
            "approved": self.approved,
            "deleted": self.deleted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Resource(Base):
    """User-submitted resources and links"""
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    url = Column(String(500), nullable=False)
    category = Column(String(100))  # e.g., "guideline", "tool", "template", "reference"
    sector = Column(String(100))  # Optional sector association
    submitted_by = Column(String(200))  # Name of person who submitted
    email = Column(String(200))  # Contact email
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "url": self.url,
            "category": self.category,
            "sector": self.sector,
            "submitted_by": self.submitted_by,
            "email": self.email,
            "approved": self.approved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ContactSubmission(Base):
    """Contact information submissions"""
    __tablename__ = "contact_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    organization = Column(String(200), nullable=False)
    focal_point_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    phone = Column(String(50))
    sector = Column(String(100))
    role = Column(String(200))
    location = Column(String(200))
    additional_info = Column(Text)
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "organization": self.organization,
            "focal_point_name": self.focal_point_name,
            "email": self.email,
            "phone": self.phone,
            "sector": self.sector,
            "role": self.role,
            "location": self.location,
            "additional_info": self.additional_info,
            "approved": self.approved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Contact(Base):
    """Contact directory with location mapping"""
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    organization = Column(String(200), nullable=False)
    position = Column(String(200))
    email = Column(String(200))
    phone = Column(String(50))
    sector = Column(String(100))
    
    # Location information
    parish = Column(String(100))  # Administrative level 1
    community = Column(String(200))  # Administrative level 2 or locality
    latitude = Column(String(50))  # Store as string to preserve precision
    longitude = Column(String(50))
    
    # Deployment status
    location_type = Column(String(50), default="field")  # "field", "remote", "office", "mobile"
    status = Column(String(50), default="active")  # "active", "inactive", "deployed"
    
    # Additional metadata
    notes = Column(Text)
    deleted = Column(Boolean, default=False)
    approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "organization": self.organization,
            "position": self.position,
            "email": self.email,
            "phone": self.phone,
            "sector": self.sector,
            "parish": self.parish,
            "community": self.community,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "location_type": self.location_type,
            "status": self.status,
            "notes": self.notes,
            "deleted": self.deleted,
            "approved": self.approved,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class User(Base):
    """User accounts for authentication"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200))
    email = Column(String(200))
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    def set_password(self, password: str):
        """Hash and set password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Verify password"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self, include_sensitive=False):
        """Convert to dictionary for API responses"""
        data = {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "email": self.email,
            "is_admin": self.is_admin,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
        return data


class Announcement(Base):
    """Announcements for the IM Hub"""
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)  # HTML or markdown content
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    priority = Column(String(20), default="normal")  # "high", "medium", "normal", "low"
    author = Column(String(200))
    tags = Column(Text)  # Comma-separated tags
    approved = Column(Boolean, default=True)  # Auto-approved for admins
    deleted = Column(Boolean, default=False)  # Soft delete
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        tags_list = [tag.strip() for tag in self.tags.split(',')] if self.tags else []
        
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "date": self.date.isoformat() if self.date else None,
            "priority": self.priority,
            "author": self.author,
            "tags": tags_list,
            "approved": self.approved,
            "deleted": self.deleted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Link(Base):
    """URL shortener links"""
    __tablename__ = "links"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)  # Short URL identifier
    url = Column(String(1000), nullable=False)  # Destination URL
    description = Column(Text)  # Optional description
    created_by = Column(String(200))  # Username who created it
    deleted = Column(Boolean, default=False)  # Soft delete flag
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "url": self.url,
            "description": self.description,
            "created_by": self.created_by,
            "deleted": self.deleted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# Database initialization
def init_db():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at {DB_PATH}")


# Dependency for getting DB session
def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Seed some initial data for testing
def seed_initial_data():
    """Add some initial WhatsApp groups, default admin user, and announcements for testing"""
    import os
    from pathlib import Path
    import frontmatter
    import markdown
    
    db = SessionLocal()
    try:
        # Create default admin user if no users exist
        user_count = db.query(User).count()
        if user_count == 0:
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
            db.commit()
            print(f"Created default admin user: {admin_username}")
        else:
            print(f"Database already has {user_count} users")
        
        # Import announcements from markdown files if none exist
        announcement_count = db.query(Announcement).count()
        if announcement_count == 0:
            announcements_dir = Path(__file__).parent / "announcements"
            if announcements_dir.exists():
                imported = 0
                for file_path in announcements_dir.glob("*.md"):
                    if file_path.name == "README.md":
                        continue
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            post = frontmatter.load(f)
                        
                        # Convert markdown content to HTML
                        html_content = markdown.markdown(
                            post.content,
                            extensions=['extra', 'codehilite', 'nl2br']
                        )
                        
                        # Parse date
                        post_date = post.get("date")
                        if isinstance(post_date, datetime):
                            announcement_date = post_date
                        else:
                            try:
                                announcement_date = datetime.fromisoformat(str(post_date))
                            except:
                                announcement_date = datetime.utcnow()
                        
                        # Get tags as comma-separated string
                        tags = post.get("tags", [])
                        tags_str = ','.join(tags) if isinstance(tags, list) else ''
                        
                        # Create announcement
                        announcement = Announcement(
                            title=post.get("title", file_path.stem),
                            content=html_content,
                            date=announcement_date,
                            priority=post.get("priority", "normal"),
                            author=post.get("author", "IM Team"),
                            tags=tags_str,
                            approved=True,
                            deleted=False
                        )
                        
                        db.add(announcement)
                        imported += 1
                        
                    except Exception as e:
                        print(f"Error importing announcement from {file_path.name}: {e}")
                        continue
                
                if imported > 0:
                    db.commit()
                    print(f"Imported {imported} announcements from markdown files")
            else:
                print("No announcements directory found")
        else:
            print(f"Database already has {announcement_count} announcements")
        
        # Check if we already have WhatsApp groups data
        existing_count = db.query(WhatsAppGroup).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} WhatsApp groups")
            return
        
        # Add initial groups
        initial_groups = [
            WhatsAppGroup(
                name="IM Jamaica Coordination",
                sector="Cross-Sector",
                description="General coordination for information management across all sectors",
                link="https://chat.whatsapp.com/example1",
                approved=True
            ),
            WhatsAppGroup(
                name="Shelter Cluster IM",
                sector="Shelter",
                description="Information management for shelter sector activities and data collection",
                link="https://chat.whatsapp.com/example2",
                approved=True
            ),
            WhatsAppGroup(
                name="WASH Data Collection",
                sector="WASH",
                description="WASH sector data collection coordination and field updates",
                link="https://chat.whatsapp.com/example3",
                approved=True
            ),
            WhatsAppGroup(
                name="Health Assessments",
                sector="Health",
                description="Coordination for health assessments and medical facility data",
                link="https://chat.whatsapp.com/example4",
                approved=True
            ),
            WhatsAppGroup(
                name="Protection Monitoring",
                sector="Protection",
                description="Protection monitoring and GBV reporting coordination",
                link="https://chat.whatsapp.com/example5",
                approved=True
            ),
            WhatsAppGroup(
                name="Education in Emergency",
                sector="Education",
                description="Education cluster data sharing and school assessment coordination",
                link="https://chat.whatsapp.com/example6",
                approved=True
            ),
            WhatsAppGroup(
                name="Food Security Monitoring",
                sector="Food Security",
                description="Food security assessments and distribution tracking",
                link="https://chat.whatsapp.com/example7",
                approved=True
            ),
        ]
        
        db.add_all(initial_groups)
        db.commit()
        print(f"Seeded {len(initial_groups)} WhatsApp groups")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # Initialize database and seed data when run directly
    init_db()
    seed_initial_data()
