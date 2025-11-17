from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import yaml
import os
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv
from pathlib import Path
import feedparser
import httpx
from typing import Optional
import frontmatter
import markdown
import re

load_dotenv()

app = FastAPI(title="IM Hub API")

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
@app.get("/")
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
    content = load_content_yaml()
    sectors = content.get("sectors", {})
    
    if sector_id not in sectors:
        raise HTTPException(status_code=404, detail="Sector not found")
    
    return sectors[sector_id]


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
    
    # Security: prevent directory traversal
    if not file_path.is_relative_to(files_dir):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


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


# Serve frontend static files in production
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes"""
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
