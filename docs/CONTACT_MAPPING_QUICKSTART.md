# Contact Location Mapping - Quick Start

## What's New

✅ **Contact database table** - Store contact information with location data  
✅ **Interactive map** - View contacts on a map with parish boundaries  
✅ **Location tracking** - Track who is in the field vs remote  
✅ **Advanced filtering** - Filter by sector, parish, location type, status  
✅ **Three view modes** - Map, Cards, and Table views  
✅ **CRUD operations** - Add, edit, delete contacts via web interface  
✅ **GeoJSON support** - Display administrative boundaries on map  

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

This installs Leaflet mapping libraries.

**Note:** The `--legacy-peer-deps` flag is needed due to React 19 compatibility with react-leaflet (which expects React 18).

### 2. Run the Application

**Backend:**
```bash
cd backend
python3.13 main.py
```

**Frontend (development):**
```bash
cd frontend
npm run dev
```

### 3. Access the Feature

1. Login to the IM Hub
2. Navigate to **Contact Directory**
3. Click on **Contact Map** tab
4. You'll see:
   - Interactive map (center view)
   - Add Contact button (top right)
   - Filters (sector, parish, type, status)
   - View toggles (Map/Cards/Table)

### 4. Add Your First Contact

1. Click **+ Add Contact**
2. Fill in the form (minimum: name, organization)
3. Optional but recommended for mapping:
   - Parish (select from dropdown)
   - Latitude/Longitude (for exact positioning)
   - Location Type (field/remote/office/mobile)
   - Status (active/inactive/deployed)
4. Click **Add Contact**

### 5. Import Existing Contacts

Use the import script to bulk load contacts:

```bash
cd backend
python import_contacts.py
```

Options:
- Import sample data (10 example contacts)
- Generate CSV template
- Import from your own CSV file

## Key Features

### Map View
- See all contacts on an interactive map
- Click markers to view contact details
- Parish boundaries shown as overlays
- Color-coded markers by location type:
  - 🟢 Green = Field personnel
  - 🔵 Blue = Remote workers
  - 🔴 Red = Office-based
  - 🟠 Orange = Mobile teams

### Filtering
Find specific contacts quickly:
- **By Sector**: Health, WASH, Protection, etc.
- **By Parish**: All 14 Jamaica parishes
- **By Type**: Field, Remote, Office, Mobile
- **By Status**: Active, Inactive, Deployed
- **Search**: Text search across names, organizations, locations

### View Modes
- **Map**: Visual representation with boundaries
- **Cards**: Grid layout with contact cards
- **Table**: Detailed tabular view with sorting

## Data Migration

To import contacts from PowerBI or other sources:

1. Export your existing contact data to CSV
2. Format CSV with these columns:
   - name, organization, position, email, phone
   - sector, parish, community
   - latitude, longitude
   - location_type, status, notes

3. Run the import script:
   ```bash
   python backend/import_contacts.py
   ```

4. Choose option 3 (Import from CSV)
5. Enter the path to your CSV file

## GeoJSON Boundaries

The system includes sample parish boundaries. For accurate mapping:

1. Obtain official Jamaica GeoJSON data from:
   - [Humanitarian Data Exchange (HDX)](https://data.humdata.org/)
   - OpenStreetMap exports
   - Jamaica government GIS portals

2. Replace `/backend/geojson/jamaica-parishes.geojson`

3. Ensure GeoJSON has these properties:
   ```json
   {
     "properties": {
       "name": "Parish Name",
       "type": "parish"
     }
   }
   ```

## API Endpoints

All endpoints require authentication (Bearer token).

**Get contacts:**
```bash
GET /api/contacts
GET /api/contacts?parish=Kingston&location_type=field
GET /api/contacts?sector=Health&status=active
```

**Create contact:**
```bash
POST /api/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "organization": "UNICEF",
  "sector": "Education",
  "parish": "Kingston",
  "location_type": "field",
  "status": "active"
}
```

**Update contact:**
```bash
PUT /api/contacts/{id}
```

**Delete contact:**
```bash
DELETE /api/contacts/{id}
```

**Get GeoJSON:**
```bash
GET /api/geojson/jamaica-parishes.geojson
```

## Tracking Field vs Remote

Use the **location_type** field to track deployment:

- `field` - Personnel physically in affected areas
- `remote` - Working remotely/internationally  
- `office` - Based in coordination office
- `mobile` - Moving between multiple locations

Use the **status** field to track availability:

- `active` - Currently working on response
- `inactive` - Temporarily unavailable
- `deployed` - Actively deployed to field

**Example queries:**

"Show me all field personnel in Kingston:"
- Filter: Parish = Kingston, Type = Field

"Who is supporting remotely?"
- Filter: Type = Remote

"All active health sector contacts:"
- Filter: Sector = Health, Status = Active

## Troubleshooting

**Map not showing?**
- Run `npm install --legacy-peer-deps` in frontend directory
- Check browser console for errors
- Verify backend is running on port 8000

**No boundaries on map?**
- Check if `/backend/geojson/jamaica-parishes.geojson` exists
- Validate GeoJSON format at geojson.io

**Contacts not appearing?**
- Ensure contacts have latitude/longitude set
- Check if filters are hiding contacts
- Try zooming out on the map

**Can't add contacts?**
- Verify you're logged in
- Check authentication token hasn't expired
- Review browser network tab for API errors

## Next Steps

1. ✅ Import your existing contact data
2. ✅ Add GPS coordinates for mapping
3. ✅ Update location types (field/remote)
4. ✅ Add accurate GeoJSON boundaries
5. ✅ Train users on the new features

## Need Help?

See the full documentation in `CONTACT_MAPPING_FEATURE.md` for:
- Detailed API documentation
- Database schema details
- Advanced configuration
- Future enhancement ideas
- Complete file structure

---

**Version**: 1.0  
**Last Updated**: November 17, 2025
