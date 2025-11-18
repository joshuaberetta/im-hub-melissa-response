#!/usr/bin/env python3
"""
Migration script to import existing markdown announcements into the database
Run this once to migrate from file-based to database-based announcements
"""

import frontmatter
import markdown
from pathlib import Path
from datetime import datetime
from database import SessionLocal, Announcement, init_db

def migrate_announcements():
    """Import markdown announcements into database"""
    
    # Initialize database
    init_db()
    db = SessionLocal()
    
    try:
        # Check if announcements already exist in database
        existing_count = db.query(Announcement).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} announcements.")
            response = input("Do you want to proceed anyway? This may create duplicates. (y/N): ")
            if response.lower() != 'y':
                print("Migration cancelled.")
                return
        
        announcements_dir = Path(__file__).parent / "announcements"
        
        if not announcements_dir.exists():
            print(f"Announcements directory not found: {announcements_dir}")
            return
        
        migrated = 0
        skipped = 0
        
        # Read all markdown files
        for file_path in announcements_dir.glob("*.md"):
            if file_path.name == "README.md":
                continue
            
            try:
                print(f"\nProcessing: {file_path.name}")
                
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
                        print(f"  Warning: Could not parse date '{post_date}', using current time")
                
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
                
                print(f"  ✓ Title: {announcement.title}")
                print(f"  ✓ Date: {announcement.date}")
                print(f"  ✓ Priority: {announcement.priority}")
                print(f"  ✓ Tags: {tags_str}")
                
                migrated += 1
                
            except Exception as e:
                print(f"  ✗ Error processing {file_path.name}: {e}")
                skipped += 1
                continue
        
        # Commit all changes
        db.commit()
        
        print(f"\n{'='*60}")
        print(f"Migration complete!")
        print(f"  Migrated: {migrated} announcements")
        print(f"  Skipped: {skipped} files")
        print(f"  Total in database: {db.query(Announcement).count()} announcements")
        print(f"{'='*60}")
        
    except Exception as e:
        print(f"\nError during migration: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("="*60)
    print("Announcement Migration Script")
    print("="*60)
    print("\nThis script will import markdown announcements from the")
    print("'announcements' folder into the database.\n")
    
    migrate_announcements()
