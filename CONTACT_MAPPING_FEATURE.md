# Contact Location Mapping Feature

## Overview

This feature adds the ability to map contact locations by parish and community based on GeoJSON administrative boundaries. It includes a complete contact management system with location visualization and filtering capabilities.

## Features Implemented

### 1. Database Schema
- **New `contacts` table** in the database with fields:
  - `name`, `organization`, `position` - Basic contact information
  - `email`, `phone` - Contact details
  - `sector` - Humanitarian sector association
  - `parish`, `community` - Administrative location (Jamaica parishes)
  - `latitude`, `longitude` - GPS coordinates for mapping
  - `location_type` - Field/Remote/Office/Mobile deployment status
  - `status` - Active/Inactive/Deployed status
  - `notes` - Additional information
  - Soft delete and approval flags for moderation

### 2. Backend API Endpoints

New RESTful API endpoints in `main.py`:

- `GET /api/contacts` - List all contacts with optional filters:
  - `location_type` - Filter by field/remote/office/mobile
  - `parish` - Filter by parish
  - `sector` - Filter by sector
  - `status` - Filter by active/inactive/deployed
  - `include_deleted` - Include soft-deleted contacts (admin)

- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{id}` - Update existing contact
- `DELETE /api/contacts/{id}` - Soft delete contact (or permanent with `?permanent=true`)
- `PATCH /api/contacts/{id}/restore` - Restore soft-deleted contact
- `GET /api/geojson/{filename}` - Serve GeoJSON boundary files

### 3. GeoJSON Administrative Boundaries

- Created `/backend/geojson/` directory for storing GeoJSON files
- Included sample `jamaica-parishes.geojson` with all 14 parishes
- GeoJSON files are served via API endpoint with proper authentication
- Boundaries displayed on map as semi-transparent overlays

### 4. Interactive Map Component

**New `ContactMap.tsx` component** featuring:
- **Leaflet-based interactive map** with OpenStreetMap tiles
- **Custom markers** with icons for different location types:
  - 📍 Green pin - Field personnel
  - 💻 Blue pin - Remote workers
  - 🏢 Red pin - Office-based
  - 📍 Orange pin - Mobile teams
- **GeoJSON overlay** showing parish boundaries
- **Interactive popups** with full contact details on marker click
- **Auto-zoom** to fit all contacts in view
- **Legend** showing marker types
- **Statistics** showing mapped vs unmapped contacts

### 5. Enhanced ContactsPage

Updated `ContactsPage.tsx` with three tabs:
1. **PowerBI Directory** - Existing PowerBI dashboard embed
2. **Contact Map** - NEW interactive map with contact management
3. **WhatsApp Groups** - Existing WhatsApp groups functionality

#### Contact Map Features:
- **Three view modes**: Map, Cards, Table
- **Advanced filtering**:
  - By sector (Cross-Sector, Shelter, WASH, Health, Protection, Education, Food Security)
  - By parish (all 14 Jamaica parishes)
  - By location type (Field, Remote, Office, Mobile)
  - By status (Active, Inactive, Deployed)
  - Text search across name, organization, sector, location
- **Contact form** for adding/editing contacts with all fields
- **Card view** displaying contacts in grid layout
- **Table view** using existing PaginatedTable component
- **CRUD operations** with edit and delete actions

### 6. Styling

- New `ContactMap.css` with:
  - Custom marker pin shapes with rotation
  - Popup styling for contact information
  - Status badges with color coding
  - Legend and stats panels
  - Responsive design for mobile
- Enhanced `ContactsPage.css` with:
  - Contact card layouts
  - Grid responsive design
  - Form styling for contact creation

## Installation & Setup

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

**Important:** The `--legacy-peer-deps` flag is required because this project uses React 19, but react-leaflet currently expects React 18. This is safe and the packages work correctly together.

This will install:
- `leaflet@^1.9.4` - Mapping library
- `react-leaflet@^4.2.1` - React bindings for Leaflet
- `@types/leaflet@^1.9.8` - TypeScript types

### 2. Initialize Database

The database will auto-initialize on first run, or manually run:

```bash
cd backend
python3.13 database.py
```

This creates the new `contacts` table alongside existing tables.

### 3. Add GeoJSON Boundaries (Optional)

For production use, replace the sample GeoJSON file with accurate data:

1. Obtain official Jamaica parish boundaries from:
   - OpenStreetMap exports
   - Government GIS portals
   - Humanitarian Data Exchange (HDX)

2. Place GeoJSON files in `/backend/geojson/`
3. Ensure proper format with `name` and `type` properties
4. The map will automatically load `jamaica-parishes.geojson`

### 4. Import Existing Contact Data

To migrate data from PowerBI dashboard:

1. Export contact data from PowerBI/source system
2. Create a migration script or use API:

```python
import requests

contacts = [
    {
        "name": "John Doe",
        "organization": "UNICEF",
        "position": "IM Officer",
        "email": "john@unicef.org",
        "sector": "Education",
        "parish": "Kingston",
        "latitude": "17.9714",
        "longitude": "-76.7931",
        "location_type": "field",
        "status": "active"
    },
    # ... more contacts
]

token = "YOUR_AUTH_TOKEN"
for contact in contacts:
    requests.post(
        "http://localhost:8000/api/contacts",
        json=contact,
        headers={"Authorization": f"Bearer {token}"}
    )
```

## Usage

### Adding Contacts

1. Navigate to **Contact Map** tab
2. Click **+ Add Contact** button
3. Fill in the form:
   - **Required**: Name, Organization, Location Type, Status
   - **Optional**: Position, email, phone, sector, parish, community, coordinates, notes
4. Click **Add Contact**

### Mapping Contacts

For contacts to appear on the map, they need coordinates:

- **Manual entry**: Enter latitude/longitude in the form
- **Geocoding** (future enhancement): Auto-geocode from parish/community
- **GPS coordinates**: Field teams can provide exact locations

### Viewing Contacts

**Map View**:
- See all contacts on interactive map
- Click markers for popup with details
- Boundaries show parish areas
- Legend shows location types

**Card View**:
- Grid of contact cards
- Quick overview of each contact
- Edit/delete actions

**Table View**:
- Detailed tabular data
- Sortable and paginated
- Good for data entry review

### Filtering

Use the filter dropdowns to find specific contacts:
- **Sector** - Filter by humanitarian sector
- **Parish** - Filter by administrative area
- **Type** - Show only field/remote/office/mobile
- **Status** - Show active/inactive/deployed
- **Search** - Text search across multiple fields

### Managing Remote vs Field Personnel

Track deployment status using:

1. **Location Type**:
   - `field` - Personnel deployed in affected areas
   - `remote` - Working remotely/internationally
   - `office` - Based in coordination office
   - `mobile` - Moving between locations

2. **Status**:
   - `active` - Currently working
   - `inactive` - Temporarily unavailable
   - `deployed` - Actively deployed to response

Filter by these to see:
- Who is in the field vs remote
- Deployment status across parishes
- Sector-specific presence

## Future Enhancements

### Suggested Improvements:

1. **Geocoding Integration**
   - Auto-convert parish/community to coordinates
   - Google Maps/Nominatim API integration

2. **Clustering**
   - Marker clustering for dense areas
   - Improves performance with many contacts

3. **Heatmap Layer**
   - Visualize concentration of personnel
   - By sector or organization

4. **Import/Export**
   - CSV import for bulk contact addition
   - Excel export of contact list

5. **Advanced Search**
   - Multi-select filters
   - Saved filter presets
   - Organization-specific views

6. **Contact Details Page**
   - Dedicated page per contact
   - Edit history
   - Associated activities

7. **Notifications**
   - Alert when contacts change status
   - Deployment notifications

8. **Integration**
   - Sync with existing contact systems
   - API webhooks for updates

## API Documentation

### Contact Object Schema

```json
{
  "id": 1,
  "name": "Jane Smith",
  "organization": "UNHCR",
  "position": "Protection Officer",
  "email": "jane@unhcr.org",
  "phone": "+1-876-555-0123",
  "sector": "Protection",
  "parish": "St. Andrew",
  "community": "Half Way Tree",
  "latitude": "18.0179",
  "longitude": "-76.7931",
  "location_type": "field",
  "status": "active",
  "notes": "Focal point for GBV",
  "deleted": false,
  "approved": true,
  "created_at": "2025-11-17T10:30:00",
  "updated_at": "2025-11-17T10:30:00"
}
```

### Example API Calls

**Get all field personnel in Kingston:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/contacts?parish=Kingston&location_type=field"
```

**Get active contacts in Health sector:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/contacts?sector=Health&status=active"
```

**Create a new contact:**
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "organization": "WFP",
    "sector": "Food Security",
    "parish": "Clarendon",
    "location_type": "field",
    "status": "active"
  }' \
  http://localhost:8000/api/contacts
```

## Troubleshooting

### Map Not Displaying

1. **Check console for errors** - Leaflet CSS may not be loaded
2. **Verify package installation** - Run `npm install --legacy-peer-deps` in frontend
3. **Check API endpoint** - Ensure `/api/contacts` returns data

### GeoJSON Not Showing

1. **Check file exists** - Verify `/backend/geojson/jamaica-parishes.geojson`
2. **Check API endpoint** - Visit `/api/geojson/jamaica-parishes.geojson`
3. **Check format** - Validate GeoJSON at geojson.io

### Contacts Not Appearing on Map

1. **Check coordinates** - Contacts need valid lat/lng
2. **Check filters** - Filters may be hiding contacts
3. **Check zoom level** - Try zooming out

### Permission Errors

1. **Authentication** - Ensure user is logged in
2. **Token validity** - Check token hasn't expired
3. **API endpoint** - Verify correct backend URL

## File Structure

```
im-hub/
├── backend/
│   ├── database.py           # Updated with Contact model
│   ├── main.py              # New contact API endpoints
│   ├── geojson/
│   │   ├── README.md
│   │   └── jamaica-parishes.geojson
│   └── imhub.db             # SQLite database
└── frontend/
    ├── package.json         # Updated with leaflet deps
    └── src/
        └── components/
            ├── ContactMap.tsx       # NEW map component
            ├── ContactMap.css       # Map styling
            ├── ContactsPage.tsx     # Updated with map integration
            └── ContactsPage.css     # Enhanced styling
```

## Credits

- **Mapping**: OpenStreetMap, Leaflet
- **GeoJSON**: Sample data (replace with official boundaries)
- **Icons**: Emoji-based markers for simplicity

---

**Date Created**: November 17, 2025  
**Version**: 1.0  
**Author**: IM Hub Development Team
