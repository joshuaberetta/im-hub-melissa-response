from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
import yaml
import os
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv
from pathlib import Path
import feedparser
import httpx
from typing import Optional, List
import frontmatter
import markdown
import re
from email.utils import formatdate
import time

# Import database
from database import (
    init_db, 
    get_db, 
    WhatsAppGroup as DBWhatsAppGroup,
    Resource as DBResource,
    ContactSubmission as DBContactSubmission,
    Contact as DBContact,
    User as DBUser,
    Announcement as DBAnnouncement,
    Link as DBLink,
    seed_initial_data
)

load_dotenv()

app = FastAPI(title="IM Hub API")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    seed_initial_data()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password")

security = HTTPBearer()


# Models
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ContentData(BaseModel):
    sections: list


# Database models for API
class WhatsAppGroupCreate(BaseModel):
    name: str
    sector: str
    description: str
    link: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None


class WhatsAppGroupUpdate(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None


class WhatsAppGroupResponse(BaseModel):
    id: int
    name: str
    sector: str
    description: str
    link: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    approved: bool
    deleted: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    category: Optional[str] = None
    sector: Optional[str] = None
    submitted_by: Optional[str] = None
    email: Optional[str] = None


class ResourceResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    url: str
    category: Optional[str] = None
    sector: Optional[str] = None
    submitted_by: Optional[str] = None
    email: Optional[str] = None
    approved: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ContactSubmissionCreate(BaseModel):
    organization: str
    focal_point_name: str
    email: str
    phone: Optional[str] = None
    sector: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    additional_info: Optional[str] = None


class ContactSubmissionResponse(BaseModel):
    id: int
    organization: str
    focal_point_name: str
    email: str
    phone: Optional[str] = None
    sector: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    additional_info: Optional[str] = None
    approved: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ContactCreate(BaseModel):
    name: str
    organization: str
    position: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    parish: Optional[str] = None
    community: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    location_type: str = "field"  # "field", "remote", "office", "mobile"
    status: str = "active"  # "active", "inactive", "deployed"
    notes: Optional[str] = None


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    position: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    parish: Optional[str] = None
    community: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    location_type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ContactResponse(BaseModel):
    id: int
    name: str
    organization: str
    position: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    parish: Optional[str] = None
    community: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    location_type: str
    status: str
    notes: Optional[str] = None
    deleted: bool
    approved: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_admin: bool = False


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_admin: bool
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_login: Optional[str] = None

    class Config:
        from_attributes = True


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    date: Optional[str] = None  # ISO format date string
    priority: str = "normal"  # "high", "medium", "normal", "low"
    author: Optional[str] = None
    tags: Optional[List[str]] = None


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    date: Optional[str] = None
    priority: Optional[str] = None
    author: Optional[str] = None
    tags: Optional[List[str]] = None


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    date: str
    priority: str
    author: Optional[str] = None
    tags: List[str]
    approved: bool
    deleted: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class LinkCreate(BaseModel):
    title: str
    slug: str
    url: str
    description: Optional[str] = None


class LinkUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None


class LinkResponse(BaseModel):
    id: int
    title: str
    slug: str
    url: str
    description: Optional[str] = None
    created_by: Optional[str] = None
    deleted: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


def verify_token_optional(authorization: Optional[str] = Header(None)):
    """
    Optional token verification - returns username if valid token provided, None otherwise.
    Does not raise exception if no token or invalid token.
    """
    if not authorization:
        return None
    
    if not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        return username
    except (jwt.ExpiredSignatureError, jwt.JWTError):
        return None


def load_content_yaml():
    yaml_path = Path(__file__).parent / "content.yaml"
    try:
        with open(yaml_path, "r") as file:
            return yaml.safe_load(file)
    except FileNotFoundError:
        return {
            "title": "IM Hub",
            "tagline": "Information Management Dashboard",
            "sections": []
        }


# Routes
@app.get("/api")
def read_root():
    return {"message": "IM Hub API", "status": "running"}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # Try database authentication first
    user = db.query(DBUser).filter(DBUser.username == login_data.username).first()
    
    if user and user.is_active and user.check_password(login_data.password):
        # Update last login time
        user.last_login = datetime.utcnow()
        db.commit()
        
        access_token = create_access_token(data={"sub": login_data.username, "is_admin": user.is_admin})
        return {"access_token": access_token, "token_type": "bearer"}
    
    # Fallback to environment variable authentication for backwards compatibility
    if login_data.username == ADMIN_USERNAME and login_data.password == ADMIN_PASSWORD:
        access_token = create_access_token(data={"sub": login_data.username, "is_admin": True})
        return {"access_token": access_token, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
    )


@app.get("/api/auth/verify")
def verify(username: str = Depends(verify_token)):
    return {"username": username, "authenticated": True}


@app.get("/api/content")
def get_content():
    """Public endpoint for site content - no auth required"""
    content = load_content_yaml()
    return content


@app.get("/api/login-content")
def get_login_content():
    """Public endpoint for login page content - no auth required"""
    content = load_content_yaml()
    return {
        "heading": content.get("login", {}).get("heading", "IM Hub"),
        "tagline": content.get("login", {}).get("tagline", "Information Management Dashboard"),
        "title": content.get("login", {}).get("title", "Sign In"),
        "description": content.get("login", {}).get("description", "")
    }


@app.get("/api/navigation")
def get_navigation():
    """Public endpoint for navigation - no auth required"""
    content = load_content_yaml()
    return {"navigation": content.get("navigation", [])}


@app.get("/api/dashboard/{dashboard_id}")
def get_dashboard(dashboard_id: str):
    """Public endpoint for dashboard config - no auth required"""
    content = load_content_yaml()
    dashboards = content.get("dashboards", {})
    
    if dashboard_id not in dashboards:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    return dashboards[dashboard_id]


@app.get("/api/form/{form_id}")
def get_form(form_id: str):
    """Public endpoint for form config - no auth required"""
    content = load_content_yaml()
    forms = content.get("forms", {})
    
    if form_id not in forms:
        raise HTTPException(status_code=404, detail="Form not found")
    
    return forms[form_id]


@app.get("/api/sector/{sector_id}")
def get_sector(sector_id: str):
    """Get sector information from markdown files - public endpoint"""
    sectors_dir = Path(__file__).parent / "sectors"
    sector_file = sectors_dir / f"{sector_id}.md"
    
    if not sector_file.exists():
        raise HTTPException(status_code=404, detail="Sector not found")
    
    try:
        with open(sector_file, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
            
            # Convert markdown content to HTML
            html_content = markdown.markdown(
                post.content,
                extensions=['extra', 'codehilite', 'nl2br']
            )
            
            # Extract links from the markdown content
            # Look for markdown links: [text](url)
            link_pattern = r'\[([^\]]+)\]\(([^\)]+)\)'
            links = re.findall(link_pattern, post.content)
            
            resources = [{"name": name, "url": url} for name, url in links]
            
            return {
                "title": post.get("title", sector_id.replace("-", " ").title()),
                "description": post.get("description", ""),
                "content": html_content,
                "resources": resources
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing sector file: {str(e)}")


@app.get("/api/resources")
def get_resources():
    """Public endpoint for resources - no auth required"""
    content = load_content_yaml()
    resources = content.get("resources", {})
    return resources


@app.get("/api/files/{filename}")
def download_file(filename: str):
    """Download a file from the files directory - public endpoint"""
    files_dir = Path(__file__).parent / "files"
    file_path = files_dir / filename
    
    # Security: prevent directory traversal - check for .. in filename
    if ".." in filename or filename.startswith("/") or filename.startswith("\\"):
        raise HTTPException(status_code=403, detail="Invalid filename")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Not a file")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@app.get("/api/geojson/{filename}")
def get_geojson(filename: str):
    """Get GeoJSON administrative boundaries - public endpoint"""
    geojson_dir = Path(__file__).parent / "geojson"
    file_path = geojson_dir / filename
    
    # Security: prevent directory traversal
    if ".." in filename or filename.startswith("/") or filename.startswith("\\"):
        raise HTTPException(status_code=403, detail="Invalid filename")
    
    # Only allow .geojson and .json files
    if not filename.endswith(('.geojson', '.json')):
        raise HTTPException(status_code=403, detail="Only GeoJSON files are allowed")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="GeoJSON file not found")
        
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Not a file")
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/geo+json"
    )


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# WhatsApp Groups endpoints
@app.get("/api/whatsapp-groups/deleted", response_model=List[WhatsAppGroupResponse])
def get_deleted_whatsapp_groups(
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Get all soft-deleted WhatsApp groups (admin only)"""
    groups = db.query(DBWhatsAppGroup).filter(DBWhatsAppGroup.deleted == True).order_by(DBWhatsAppGroup.updated_at.desc()).all()
    return [group.to_dict() for group in groups]


@app.get("/api/whatsapp-groups", response_model=List[WhatsAppGroupResponse])
def get_whatsapp_groups(
    approved_only: bool = True,
    include_deleted: bool = False,
    sector: Optional[str] = None,
    db: Session = Depends(get_db),
    username: Optional[str] = Depends(verify_token_optional)
):
    """Get all WhatsApp groups - public endpoint for viewing"""
    query = db.query(DBWhatsAppGroup)
    
    # Filter out deleted groups unless specifically requested (for admin panel)
    if not include_deleted:
        query = query.filter(DBWhatsAppGroup.deleted == False)
    
    if approved_only:
        query = query.filter(DBWhatsAppGroup.approved == True)
    
    if sector:
        query = query.filter(DBWhatsAppGroup.sector == sector)
    
    groups = query.order_by(DBWhatsAppGroup.sector, DBWhatsAppGroup.name).all()
    return [group.to_dict() for group in groups]


@app.post("/api/whatsapp-groups", response_model=WhatsAppGroupResponse, status_code=status.HTTP_201_CREATED)
def create_whatsapp_group(
    group: WhatsAppGroupCreate,
    db: Session = Depends(get_db),
    username: Optional[str] = Depends(verify_token_optional)
):
    """Register a new WhatsApp group (auto-approved, no auth required)"""""
    db_group = DBWhatsAppGroup(
        name=group.name,
        sector=group.sector,
        description=group.description,
        link=group.link,
        contact_name=group.contact_name,
        contact_email=group.contact_email,
        approved=True  # Auto-approved
    )
    
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    return db_group.to_dict()


@app.put("/api/whatsapp-groups/{group_id}", response_model=WhatsAppGroupResponse)
def update_whatsapp_group(
    group_id: int,
    group_update: WhatsAppGroupUpdate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Update a WhatsApp group"""
    group = db.query(DBWhatsAppGroup).filter(DBWhatsAppGroup.id == group_id).first()
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Update only provided fields
    if group_update.name is not None:
        group.name = group_update.name
    if group_update.sector is not None:
        group.sector = group_update.sector
    if group_update.description is not None:
        group.description = group_update.description
    if group_update.link is not None:
        group.link = group_update.link
    if group_update.contact_name is not None:
        group.contact_name = group_update.contact_name
    if group_update.contact_email is not None:
        group.contact_email = group_update.contact_email
    
    group.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(group)
    
    return group.to_dict()


@app.patch("/api/whatsapp-groups/{group_id}/approve")
def approve_whatsapp_group(
    group_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Approve a WhatsApp group (admin only)"""
    group = db.query(DBWhatsAppGroup).filter(DBWhatsAppGroup.id == group_id).first()
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group.approved = True
    group.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Group approved", "id": group_id}


@app.delete("/api/whatsapp-groups/{group_id}")
def delete_whatsapp_group(
    group_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Soft delete a WhatsApp group (hides from view, requires admin to permanently delete)"""
    group = db.query(DBWhatsAppGroup).filter(DBWhatsAppGroup.id == group_id).first()
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group.deleted = True
    group.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Group marked for deletion", "id": group_id}


@app.delete("/api/whatsapp-groups/{group_id}/permanent")
def permanently_delete_whatsapp_group(
    group_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Permanently delete a WhatsApp group (admin only)"""
    group = db.query(DBWhatsAppGroup).filter(DBWhatsAppGroup.id == group_id).first()
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    db.delete(group)
    db.commit()
    
    return {"message": "Group permanently deleted", "id": group_id}


@app.patch("/api/whatsapp-groups/{group_id}/restore")
def restore_whatsapp_group(
    group_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Restore a soft-deleted WhatsApp group (admin only)"""
    group = db.query(DBWhatsAppGroup).filter(DBWhatsAppGroup.id == group_id).first()
    
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group.deleted = False
    group.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Group restored", "id": group_id}


# Resources endpoints
@app.get("/api/resources-db", response_model=List[ResourceResponse])
def get_resources_db(
    approved_only: bool = True,
    category: Optional[str] = None,
    sector: Optional[str] = None,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Get all user-submitted resources"""
    query = db.query(DBResource)
    
    if approved_only:
        query = query.filter(DBResource.approved == True)
    
    if category:
        query = query.filter(DBResource.category == category)
    
    if sector:
        query = query.filter(DBResource.sector == sector)
    
    resources = query.order_by(DBResource.created_at.desc()).all()
    return [resource.to_dict() for resource in resources]


@app.post("/api/resources-db", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Submit a new resource (requires moderation approval)"""
    db_resource = DBResource(
        title=resource.title,
        description=resource.description,
        url=resource.url,
        category=resource.category,
        sector=resource.sector,
        submitted_by=resource.submitted_by,
        email=resource.email,
        approved=False
    )
    
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    
    return db_resource.to_dict()


@app.patch("/api/resources-db/{resource_id}/approve")
def approve_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Approve a resource (admin only)"""
    resource = db.query(DBResource).filter(DBResource.id == resource_id).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    resource.approved = True
    resource.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Resource approved", "id": resource_id}


@app.delete("/api/resources-db/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Delete a resource (admin only)"""
    resource = db.query(DBResource).filter(DBResource.id == resource_id).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(resource)
    db.commit()
    
    return {"message": "Resource deleted", "id": resource_id}


# Contact submissions endpoints
@app.get("/api/contact-submissions", response_model=List[ContactSubmissionResponse])
def get_contact_submissions(
    approved_only: bool = True,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Get all contact submissions"""
    query = db.query(DBContactSubmission)
    
    if approved_only:
        query = query.filter(DBContactSubmission.approved == True)
    
    submissions = query.order_by(DBContactSubmission.created_at.desc()).all()
    return [sub.to_dict() for sub in submissions]


@app.post("/api/contact-submissions", response_model=ContactSubmissionResponse, status_code=status.HTTP_201_CREATED)
def create_contact_submission(
    submission: ContactSubmissionCreate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Submit contact information (requires moderation approval)"""
    db_submission = DBContactSubmission(
        organization=submission.organization,
        focal_point_name=submission.focal_point_name,
        email=submission.email,
        phone=submission.phone,
        sector=submission.sector,
        role=submission.role,
        location=submission.location,
        additional_info=submission.additional_info,
        approved=False
    )
    
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    return db_submission.to_dict()


@app.patch("/api/contact-submissions/{submission_id}/approve")
def approve_contact_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Approve a contact submission (admin only)"""
    submission = db.query(DBContactSubmission).filter(DBContactSubmission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    submission.approved = True
    submission.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Contact submission approved", "id": submission_id}


@app.delete("/api/contact-submissions/{submission_id}")
def delete_contact_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Delete a contact submission (admin only)"""
    submission = db.query(DBContactSubmission).filter(DBContactSubmission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    db.delete(submission)
    db.commit()
    
    return {"message": "Contact submission deleted", "id": submission_id}


# User management endpoints
@app.get("/api/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Get all users (admin only)"""
    users = db.query(DBUser).order_by(DBUser.username).all()
    return [user.to_dict() for user in users]


@app.post("/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Create a new user (admin only)"""
    # Check if username already exists
    existing_user = db.query(DBUser).filter(DBUser.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create new user
    new_user = DBUser(
        username=user_data.username,
        full_name=user_data.full_name,
        email=user_data.email,
        is_admin=user_data.is_admin,
        is_active=True
    )
    new_user.set_password(user_data.password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user.to_dict()


@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Update a user (admin only)"""
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.email is not None:
        user.email = user_data.email
    if user_data.is_admin is not None:
        user.is_admin = user_data.is_admin
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    if user_data.password is not None:
        user.set_password(user_data.password)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user.to_dict()


@app.delete("/api/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Delete a user (admin only)"""
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    current_user = db.query(DBUser).filter(DBUser.username == username).first()
    if current_user and current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted", "id": user_id}


# Contacts endpoints
@app.get("/api/contacts", response_model=List[ContactResponse])
def get_contacts(
    include_deleted: bool = False,
    location_type: Optional[str] = None,
    parish: Optional[str] = None,
    sector: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    username: Optional[str] = Depends(verify_token_optional)
):
    """Get all contacts with optional filters - public endpoint"""
    query = db.query(DBContact)
    
    # Filter out deleted contacts unless specifically requested
    if not include_deleted:
        query = query.filter(DBContact.deleted == False)
    
    # Apply filters
    if location_type:
        query = query.filter(DBContact.location_type == location_type)
    
    if parish:
        query = query.filter(DBContact.parish == parish)
    
    if sector:
        query = query.filter(DBContact.sector == sector)
    
    if status:
        query = query.filter(DBContact.status == status)
    
    contacts = query.order_by(DBContact.organization, DBContact.name).all()
    return [contact.to_dict() for contact in contacts]


@app.post("/api/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact: ContactCreate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Create a new contact"""
    db_contact = DBContact(
        name=contact.name,
        organization=contact.organization,
        position=contact.position,
        email=contact.email,
        phone=contact.phone,
        sector=contact.sector,
        parish=contact.parish,
        community=contact.community,
        latitude=contact.latitude,
        longitude=contact.longitude,
        location_type=contact.location_type,
        status=contact.status,
        notes=contact.notes,
        approved=True
    )
    
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    return db_contact.to_dict()


@app.put("/api/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    contact_update: ContactUpdate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Update a contact"""
    contact = db.query(DBContact).filter(DBContact.id == contact_id).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    # Update only provided fields
    update_data = contact_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)
    
    contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contact)
    
    return contact.to_dict()


@app.delete("/api/contacts/{contact_id}")
def delete_contact(
    contact_id: int,
    permanent: bool = False,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Soft delete or permanently delete a contact"""
    contact = db.query(DBContact).filter(DBContact.id == contact_id).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    if permanent:
        db.delete(contact)
        db.commit()
        return {"message": "Contact permanently deleted", "id": contact_id}
    else:
        contact.deleted = True
        contact.updated_at = datetime.utcnow()
        db.commit()
        return {"message": "Contact marked as deleted", "id": contact_id}


@app.patch("/api/contacts/{contact_id}/restore")
def restore_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Restore a soft-deleted contact"""
    contact = db.query(DBContact).filter(DBContact.id == contact_id).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    contact.deleted = False
    contact.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Contact restored", "id": contact_id}


@app.get("/api/mapaction-feed")
async def get_mapaction_feed():
    """Fetch and parse MapAction RSS feed - public endpoint"""
    feed_url = "https://maps.mapaction.org/feeds/custom.atom?groups=2025-jam-001"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(feed_url)
            response.raise_for_status()
            
        # Parse the RSS/Atom feed
        feed = feedparser.parse(response.text)
        
        # Extract relevant information from feed entries
        maps = []
        for entry in feed.entries[:20]:  # Limit to 20 most recent entries
            map_data = {
                "title": entry.get("title", ""),
                "summary": entry.get("summary", ""),
                "link": entry.get("link", ""),
                "updated": entry.get("updated", ""),
                "published": entry.get("published", ""),
                "id": entry.get("id", ""),
            }
            
            # Extract georss box if available
            if hasattr(entry, 'georss_box'):
                map_data["georss_box"] = entry.georss_box
            
            # Extract enclosure link (package download)
            if hasattr(entry, 'links'):
                for link in entry.links:
                    if link.get('rel') == 'enclosure':
                        map_data["package_url"] = link.get('href', '')
                        map_data["package_type"] = link.get('type', '')
                        break
            
            maps.append(map_data)
        
        return {
            "feed_title": feed.feed.get("title", "MapAction Maps"),
            "feed_updated": feed.feed.get("updated", ""),
            "maps": maps
        }
        
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch MapAction feed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing feed: {str(e)}")


@app.get("/api/announcements")
def get_announcements(
    include_deleted: bool = False,
    limit: Optional[int] = None,
    db: Session = Depends(get_db),
    username: Optional[str] = Depends(verify_token_optional)
):
    """Get announcements from database - public endpoint"""
    query = db.query(DBAnnouncement)
    
    # Filter out deleted announcements unless specifically requested
    if not include_deleted:
        query = query.filter(DBAnnouncement.deleted == False)
    
    # Only show approved announcements
    query = query.filter(DBAnnouncement.approved == True)
    
    # Order by date descending (newest first), then by priority
    query = query.order_by(DBAnnouncement.date.desc())
    
    # Apply limit if specified
    if limit:
        query = query.limit(limit)
    
    announcements = query.all()
    
    # Convert to dict and add summary field
    result = []
    for announcement in announcements:
        data = announcement.to_dict()
        
        # Extract summary (first paragraph) from content
        summary_match = re.search(r'<p>(.*?)</p>', data['content'], re.DOTALL)
        data['summary'] = summary_match.group(1) if summary_match else ""
        
        result.append(data)
    
    return {"announcements": result}


@app.post("/api/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    announcement: AnnouncementCreate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Create a new announcement (admin only)"""
    # Parse date if provided
    announcement_date = datetime.utcnow()
    if announcement.date:
        try:
            announcement_date = datetime.fromisoformat(announcement.date.replace('Z', '+00:00'))
        except:
            pass
    
    # Convert tags list to comma-separated string
    tags_str = ','.join(announcement.tags) if announcement.tags else ''
    
    db_announcement = DBAnnouncement(
        title=announcement.title,
        content=announcement.content,
        date=announcement_date,
        priority=announcement.priority,
        author=announcement.author or username,
        tags=tags_str,
        approved=True  # Auto-approved for admins
    )
    
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    
    return db_announcement.to_dict()


@app.put("/api/announcements/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: int,
    announcement_update: AnnouncementUpdate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Update an announcement (admin only)"""
    announcement = db.query(DBAnnouncement).filter(DBAnnouncement.id == announcement_id).first()
    
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Update fields
    if announcement_update.title is not None:
        announcement.title = announcement_update.title
    if announcement_update.content is not None:
        announcement.content = announcement_update.content
    if announcement_update.date is not None:
        try:
            announcement.date = datetime.fromisoformat(announcement_update.date.replace('Z', '+00:00'))
        except:
            pass
    if announcement_update.priority is not None:
        announcement.priority = announcement_update.priority
    if announcement_update.author is not None:
        announcement.author = announcement_update.author
    if announcement_update.tags is not None:
        announcement.tags = ','.join(announcement_update.tags)
    
    announcement.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(announcement)
    
    return announcement.to_dict()


@app.delete("/api/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    permanent: bool = False,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Soft delete or permanently delete an announcement (admin only)"""
    announcement = db.query(DBAnnouncement).filter(DBAnnouncement.id == announcement_id).first()
    
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    if permanent:
        db.delete(announcement)
        db.commit()
        return {"message": "Announcement permanently deleted", "id": announcement_id}
    else:
        announcement.deleted = True
        announcement.updated_at = datetime.utcnow()
        db.commit()
        return {"message": "Announcement marked as deleted", "id": announcement_id}


@app.patch("/api/announcements/{announcement_id}/restore")
def restore_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Restore a soft-deleted announcement (admin only)"""
    announcement = db.query(DBAnnouncement).filter(DBAnnouncement.id == announcement_id).first()
    
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    announcement.deleted = False
    announcement.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Announcement restored", "id": announcement_id}


@app.get("/feeds/announcements.xml")
def get_announcements_rss(db: Session = Depends(get_db)):
    """Generate RSS feed for announcements from database - public endpoint"""
    content = load_content_yaml()
    
    # Site information
    site_title = content.get("title", "IM Hub")
    site_url = os.getenv("SITE_URL", "http://localhost:8000")
    
    # Get announcements from database
    announcements = db.query(DBAnnouncement).filter(
        DBAnnouncement.deleted == False,
        DBAnnouncement.approved == True
    ).order_by(DBAnnouncement.date.desc()).limit(20).all()
    
    if not announcements:
        # Return empty feed
        rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{site_title} - Announcements</title>
    <link>{site_url}</link>
    <description>Latest announcements from {site_title}</description>
    <atom:link href="{site_url}/feeds/announcements.xml" rel="self" type="application/rss+xml" />
  </channel>
</rss>"""
        return Response(content=rss, media_type="application/xml")
    
    # Build RSS feed
    items_xml = ""
    for announcement in announcements:
        data = announcement.to_dict()
        
        title = data["title"].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        author = (data.get("author") or "IM Team").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        content = data["content"]
        
        # Get publication date
        pub_date = formatdate(time.mktime(announcement.date.timetuple()), usegmt=True)
        
        # Add priority badge to content
        priority_emoji = {"high": "🔴", "medium": "🟠", "normal": "🔵", "low": "⚪"}
        priority_badge = priority_emoji.get(data["priority"], "🔵")
        
        categories = ""
        for tag in data["tags"]:
            tag_escaped = tag.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            categories += f"    <category>{tag_escaped}</category>\n"
        
        item_url = f"{site_url}/#announcement-{data['id']}"
        
        items_xml += f"""  <item>
    <title>{priority_badge} {title}</title>
    <link>{item_url}</link>
    <guid isPermaLink="false">announcement-{data['id']}</guid>
    <pubDate>{pub_date}</pubDate>
    <author>{author}</author>
{categories}    <description><![CDATA[{content}]]></description>
  </item>
"""
    
    # Get latest update time
    latest_date = formatdate(time.mktime(announcements[0].date.timetuple()), usegmt=True) if announcements else formatdate(usegmt=True)
    
    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{site_title} - Announcements</title>
    <link>{site_url}</link>
    <description>Latest announcements and updates from {site_title}</description>
    <language>en-us</language>
    <lastBuildDate>{latest_date}</lastBuildDate>
    <atom:link href="{site_url}/feeds/announcements.xml" rel="self" type="application/rss+xml" />
{items_xml}  </channel>
</rss>"""
    
    return Response(content=rss, media_type="application/xml")


# Links endpoints
@app.get("/api/links", response_model=List[LinkResponse])
def get_links(
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    username: Optional[str] = Depends(verify_token_optional)
):
    """Get all links (optionally include deleted) - no auth required for viewing"""""
    query = db.query(DBLink)
    
    # Filter out deleted links unless specifically requested
    if not include_deleted:
        query = query.filter(DBLink.deleted == False)
    
    links = query.order_by(DBLink.created_at.desc()).all()
    return [link.to_dict() for link in links]


@app.post("/api/links", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
def create_link(
    link: LinkCreate,
    db: Session = Depends(get_db),
    username: Optional[str] = Depends(verify_token_optional)
):
    """Create a new shortened link (no auth required)"""
    # Check if slug already exists
    existing_link = db.query(DBLink).filter(DBLink.slug == link.slug).first()
    if existing_link:
        raise HTTPException(status_code=400, detail="Slug already exists. Please choose a different slug.")
    
    # Validate slug format (alphanumeric, hyphens, underscores only)
    import re
    if not re.match(r'^[a-zA-Z0-9_-]+$', link.slug):
        raise HTTPException(status_code=400, detail="Slug can only contain letters, numbers, hyphens, and underscores.")
    
    db_link = DBLink(
        title=link.title,
        slug=link.slug,
        url=link.url,
        description=link.description,
        created_by=username
    )
    
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    
    return db_link.to_dict()


@app.put("/api/links/{link_id}", response_model=LinkResponse)
def update_link(
    link_id: int,
    link_update: LinkUpdate,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Update a link"""
    link = db.query(DBLink).filter(DBLink.id == link_id).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Check if slug is being changed and if it's already taken
    if link_update.slug is not None and link_update.slug != link.slug:
        existing_link = db.query(DBLink).filter(DBLink.slug == link_update.slug).first()
        if existing_link:
            raise HTTPException(status_code=400, detail="Slug already exists. Please choose a different slug.")
        
        # Validate slug format
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', link_update.slug):
            raise HTTPException(status_code=400, detail="Slug can only contain letters, numbers, hyphens, and underscores.")
    
    # Update only provided fields
    if link_update.title is not None:
        link.title = link_update.title
    if link_update.slug is not None:
        link.slug = link_update.slug
    if link_update.url is not None:
        link.url = link_update.url
    if link_update.description is not None:
        link.description = link_update.description
    
    link.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(link)
    
    return link.to_dict()


@app.delete("/api/links/{link_id}")
def delete_link(
    link_id: int,
    permanent: bool = False,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Soft delete or permanently delete a link"""
    link = db.query(DBLink).filter(DBLink.id == link_id).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    if permanent:
        db.delete(link)
        db.commit()
        return {"message": "Link permanently deleted", "id": link_id}
    else:
        link.deleted = True
        link.updated_at = datetime.utcnow()
        db.commit()
        return {"message": "Link marked as deleted", "id": link_id}


@app.patch("/api/links/{link_id}/restore")
def restore_link(
    link_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """Restore a soft-deleted link"""
    link = db.query(DBLink).filter(DBLink.id == link_id).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    link.deleted = False
    link.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Link restored", "id": link_id}


@app.get("/link/{slug}")
def redirect_link(slug: str, db: Session = Depends(get_db)):
    """Public endpoint to redirect from short URL to destination - no auth required"""
    link = db.query(DBLink).filter(
        DBLink.slug == slug,
        DBLink.deleted == False
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Redirect to the destination URL
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=link.url, status_code=302)


# Serve frontend static files in production
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
print(f"Looking for frontend at: {frontend_dist}")
print(f"Frontend dist exists: {frontend_dist.exists()}")
if frontend_dist.exists():
    print(f"Frontend dist contents: {list(frontend_dist.iterdir())}")
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    @app.get("/")
    async def serve_root():
        """Serve frontend index.html at root"""
        index_path = frontend_dist / "index.html"
        print(f"Serving index.html from: {index_path}, exists: {index_path.exists()}")
        return FileResponse(index_path)
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes"""
        if full_path.startswith("api/") or full_path.startswith("feeds/") or full_path.startswith("link/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    print(f"WARNING: Frontend dist directory not found at {frontend_dist}")
    print(f"Current working directory: {Path.cwd()}")
    print(f"__file__ location: {Path(__file__).resolve()}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
