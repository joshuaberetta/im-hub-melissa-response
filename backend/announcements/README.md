# Announcements Directory

This directory contains announcement markdown files that are displayed on the IM Hub home page.

## File Format

Each announcement file should be a markdown file with YAML frontmatter:

```markdown
---
title: Announcement Title
date: YYYY-MM-DD
priority: high|medium|normal|low
author: Author Name
tags: [tag1, tag2, tag3]
---

# Announcement Title

Your announcement content in markdown format...
```

## Frontmatter Fields

- **title** (required): The announcement title
- **date** (required): Publication date in YYYY-MM-DD format
- **priority** (optional): Priority level - `high`, `medium`, `normal`, or `low` (default: normal)
- **author** (optional): Author name
- **tags** (optional): Array of tags for categorization

## Priority Levels

- **high**: Urgent announcements (red indicator)
- **medium**: Important announcements (orange indicator)
- **normal**: Standard announcements (blue indicator)
- **low**: Informational announcements (gray indicator)

## File Naming

Files should be named with the date prefix for easy sorting:
`YYYY-MM-DD-short-description.md`

Example: `2025-11-17-new-feature.md`
