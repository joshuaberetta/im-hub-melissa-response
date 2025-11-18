# GeoJSON Administrative Boundaries

This directory contains GeoJSON files for administrative boundaries in Jamaica.

## Files

- `jamaica-parishes.geojson` - Parish (administrative level 1) boundaries
- `jamaica-communities.geojson` - Community/locality boundaries (optional)

## Format

GeoJSON files should follow the standard GeoJSON format with properties including:
- `name` - Name of the administrative area
- `type` - Type of boundary (e.g., "parish", "community")
- Additional metadata as needed

## Usage

These files are served via the `/api/geojson/{filename}` endpoint and used by the contacts map to display administrative boundaries and associate contacts with specific areas.

## Data Sources

Add GeoJSON files from official sources or open data portals. Ensure proper attribution and licensing.
