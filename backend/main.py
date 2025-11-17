from fastapi import FastAPI, Depends, HTTPException, status
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
def login(login_data: LoginRequest):
    if login_data.username != ADMIN_USERNAME or login_data.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token = create_access_token(data={"sub": login_data.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/verify")
def verify(username: str = Depends(verify_token)):
    return {"username": username, "authenticated": True}


@app.get("/api/content")
def get_content(username: str = Depends(verify_token)):
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
def get_navigation(username: str = Depends(verify_token)):
    content = load_content_yaml()
    return {"navigation": content.get("navigation", [])}


@app.get("/api/dashboard/{dashboard_id}")
def get_dashboard(dashboard_id: str, username: str = Depends(verify_token)):
    content = load_content_yaml()
    dashboards = content.get("dashboards", {})
    
    if dashboard_id not in dashboards:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    return dashboards[dashboard_id]


@app.get("/api/form/{form_id}")
def get_form(form_id: str, username: str = Depends(verify_token)):
    content = load_content_yaml()
    forms = content.get("forms", {})
    
    if form_id not in forms:
        raise HTTPException(status_code=404, detail="Form not found")
    
    return forms[form_id]


@app.get("/api/sector/{sector_id}")
def get_sector(sector_id: str, username: str = Depends(verify_token)):
    """Get sector information from markdown files"""
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
def get_resources(username: str = Depends(verify_token)):
    content = load_content_yaml()
    resources = content.get("resources", {})
    return resources


@app.get("/api/files/{filename}")
def download_file(filename: str, username: str = Depends(verify_token)):
    """Download a file from the files directory"""
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
    username: str = Depends(verify_token)
):
    """Get all WhatsApp groups (optionally filter by approval status, deleted status, and sector)"""
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
    username: str = Depends(verify_token)
):
    """Register a new WhatsApp group (auto-approved)"""
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


@app.get("/api/mapaction-feed")
async def get_mapaction_feed(username: str = Depends(verify_token)):
    """Fetch and parse MapAction RSS feed"""
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
def get_announcements(username: str = Depends(verify_token), limit: Optional[int] = None):
    """Get announcements from markdown files"""
    announcements_dir = Path(__file__).parent / "announcements"
    
    if not announcements_dir.exists():
        return {"announcements": []}
    
    announcements = []
    
    # Read all markdown files
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
                
                # Extract summary (first paragraph)
                summary_match = re.search(r'<p>(.*?)</p>', html_content, re.DOTALL)
                summary = summary_match.group(1) if summary_match else ""
                
                announcement = {
                    "id": file_path.stem,
                    "title": post.get("title", file_path.stem),
                    "date": post.get("date", "").isoformat() if isinstance(post.get("date"), datetime) else str(post.get("date", "")),
                    "priority": post.get("priority", "normal"),
                    "author": post.get("author", ""),
                    "tags": post.get("tags", []),
                    "content": html_content,
                    "summary": summary,
                }
                
                announcements.append(announcement)
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue
    
    # Sort by date (newest first), then by priority
    priority_order = {"high": 0, "medium": 1, "normal": 2, "low": 3}
    announcements.sort(
        key=lambda x: (
            x.get("date", ""),
            priority_order.get(x.get("priority", "normal"), 2)
        ),
        reverse=True
    )
    
    # Apply limit if specified
    if limit:
        announcements = announcements[:limit]
    
    return {"announcements": announcements}


@app.get("/feeds/announcements.xml")
def get_announcements_rss():
    """Generate RSS feed for announcements - public endpoint"""
    announcements_dir = Path(__file__).parent / "announcements"
    content = load_content_yaml()
    
    # Site information
    site_title = content.get("title", "IM Hub")
    site_url = os.getenv("SITE_URL", "http://localhost:8000")
    
    if not announcements_dir.exists():
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
    
    announcements = []
    
    # Read all markdown files
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
                
                # Get date
                post_date = post.get("date")
                if isinstance(post_date, datetime):
                    pub_date = formatdate(time.mktime(post_date.timetuple()), usegmt=True)
                else:
                    try:
                        dt = datetime.fromisoformat(str(post_date))
                        pub_date = formatdate(time.mktime(dt.timetuple()), usegmt=True)
                    except:
                        pub_date = formatdate(usegmt=True)
                
                announcement = {
                    "title": post.get("title", file_path.stem),
                    "date": post.get("date", ""),
                    "pub_date": pub_date,
                    "priority": post.get("priority", "normal"),
                    "author": post.get("author", "IM Team"),
                    "tags": post.get("tags", []),
                    "content": html_content,
                    "id": file_path.stem,
                }
                
                announcements.append(announcement)
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue
    
    # Sort by date (newest first)
    announcements.sort(key=lambda x: x.get("date", ""), reverse=True)
    
    # Build RSS feed
    items_xml = ""
    for announcement in announcements[:20]:  # Limit to 20 most recent
        title = announcement["title"].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        author = announcement["author"].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        content = announcement["content"]
        
        # Add priority badge to content
        priority_emoji = {"high": "🔴", "medium": "🟠", "normal": "🔵", "low": "⚪"}
        priority_badge = priority_emoji.get(announcement["priority"], "🔵")
        
        categories = ""
        for tag in announcement["tags"]:
            tag_escaped = tag.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            categories += f"    <category>{tag_escaped}</category>\n"
        
        item_url = f"{site_url}/#announcement-{announcement['id']}"
        
        items_xml += f"""  <item>
    <title>{priority_badge} {title}</title>
    <link>{item_url}</link>
    <guid isPermaLink="false">{announcement['id']}</guid>
    <pubDate>{announcement['pub_date']}</pubDate>
    <author>{author}</author>
{categories}    <description><![CDATA[{content}]]></description>
  </item>
"""
    
    # Get latest update time
    latest_date = announcements[0]["pub_date"] if announcements else formatdate(usegmt=True)
    
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
        if full_path.startswith("api/") or full_path.startswith("feeds/"):
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
