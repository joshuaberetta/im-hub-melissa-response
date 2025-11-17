# Sectors

This directory contains markdown files for each humanitarian sector. Each file includes frontmatter metadata and content that will be displayed on the sector pages.

## File Format

Each sector file should follow this format:

```markdown
---
title: Sector Name
description: Brief description of the sector
---

# Sector Name

Content here in markdown format.

## Resources

- [Resource 1](url)
- [Resource 2](url)
```

## Available Sectors

- `shelter.md` - Shelter and Non-Food Items
- `protection.md` - Protection
- `wash.md` - Water, Sanitation and Hygiene
- `health.md` - Health
- `education.md` - Education
- `food-security.md` - Food Security

## Adding a New Sector

1. Create a new `.md` file in this directory
2. Add frontmatter with `title` and `description`
3. Write the sector content in markdown
4. Update the navigation in `content.yaml` to include the new sector
