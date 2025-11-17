# Resource Files Directory

This directory contains downloadable files that are made available through the Resources page.

## Adding Files

1. Place your files (Excel templates, PDFs, Word documents, etc.) in this directory
2. Update `content.yaml` in the parent directory to include references to your files
3. Use the filename in the `url` field: `/api/files/your-filename.xlsx`

## Example Files to Add

- `5w-template.xlsx` - 5W reporting template
- `contact-template.xlsx` - Contact list template
- `sitrep-template.docx` - Situation report template
- `im-training.pdf` - IM training materials
- `data-protection.pdf` - Data protection guidelines

## Security

Files in this directory require authentication to download. Users must be logged in to access them.
