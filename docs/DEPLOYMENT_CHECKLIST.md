# Contact Location Mapping - Deployment Checklist

## Pre-Deployment

### ✅ Code Changes
- [x] Added Contact model to database.py
- [x] Added contact API endpoints to main.py
- [x] Added GeoJSON serving endpoint
- [x] Created ContactMap.tsx component
- [x] Updated ContactsPage.tsx with map integration
- [x] Added CSS styling for map and contacts
- [x] Updated package.json with Leaflet dependencies
- [x] Created sample GeoJSON for Jamaica parishes
- [x] Created import script for bulk data

### ⚠️ Required Before Running
- [ ] Install npm dependencies: `cd frontend && npm install --legacy-peer-deps`
- [ ] Database will auto-initialize on first backend start

### 📋 Optional Setup
- [ ] Replace sample GeoJSON with official Jamaica boundaries
- [ ] Import existing contact data using import_contacts.py
- [ ] Add GPS coordinates to imported contacts
- [ ] Configure environment variables if needed

## Installation Steps

### 1. Frontend Dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

**Important:** Use `--legacy-peer-deps` flag due to React 19 compatibility.

This installs:
- leaflet@^1.9.4
- react-leaflet@^4.2.1
- @types/leaflet@^1.9.8

### 2. Database Initialization
Database will initialize automatically when backend starts, or run:
```bash
cd backend
python3.13 database.py
```

### 3. Start Application
```bash
# Terminal 1 - Backend
cd backend
python3.13 main.py

# Terminal 2 - Frontend (development)
cd frontend
npm run dev
```

### 4. Access the Feature
- Navigate to: http://localhost:5173 (or your dev URL)
- Login with credentials
- Go to Contact Directory → Contact Map tab

## Testing Checklist

### ✅ Basic Functionality
- [ ] Can access Contact Map tab
- [ ] Map displays correctly
- [ ] Can add new contact via form
- [ ] Contact appears in database
- [ ] Can edit existing contact
- [ ] Can delete contact
- [ ] Filters work correctly
- [ ] Search functions properly
- [ ] Can switch between Map/Cards/Table views

### ✅ Map Features
- [ ] Map loads OpenStreetMap tiles
- [ ] Parish boundaries display (if GeoJSON loaded)
- [ ] Markers appear for contacts with coordinates
- [ ] Markers have correct colors for location types
- [ ] Clicking marker shows popup with details
- [ ] Map auto-zooms to fit contacts
- [ ] Legend displays correctly
- [ ] Statistics show correct counts

### ✅ Data Management
- [ ] Can import sample contacts via script
- [ ] CSV import works correctly
- [ ] API endpoints respond properly
- [ ] Authentication required for all operations
- [ ] Soft delete preserves data
- [ ] Filters combine correctly

### ✅ Views
- [ ] Map view shows interactive map
- [ ] Cards view displays grid of contacts
- [ ] Table view shows paginated data
- [ ] Pagination works in table view
- [ ] View switching maintains filters

### ✅ Filters
- [ ] Sector filter works
- [ ] Parish filter works
- [ ] Location type filter works
- [ ] Status filter works
- [ ] Text search works across fields
- [ ] Filters can be combined
- [ ] Clearing filters shows all contacts

## Data Migration Steps

### 1. Export Existing Data
- [ ] Export contacts from PowerBI/current system
- [ ] Format as CSV with required columns
- [ ] Verify data quality

### 2. Prepare Import
- [ ] Review column mapping
- [ ] Add parish information
- [ ] Add location type (field/remote/office/mobile)
- [ ] Add status (active/inactive/deployed)
- [ ] Add coordinates if available

### 3. Import Process
```bash
cd backend
python import_contacts.py
# Choose option 3: Import from CSV
# Enter path to CSV file
```

### 4. Verify Import
- [ ] Check count of imported contacts
- [ ] Review for errors in terminal output
- [ ] View contacts in web interface
- [ ] Verify data accuracy
- [ ] Add missing coordinates

## Production Deployment

### 1. Frontend Build
```bash
cd frontend
npm run build
```

### 2. Update GeoJSON (Recommended)
- [ ] Obtain official Jamaica parish boundaries
- [ ] Replace backend/geojson/jamaica-parishes.geojson
- [ ] Verify GeoJSON format
- [ ] Test boundary display

### 3. Environment Configuration
- [ ] Set production SECRET_KEY
- [ ] Configure ADMIN credentials
- [ ] Set SITE_URL for RSS feeds
- [ ] Update CORS origins if needed

### 4. Database Backup
```bash
# Backup before deployment
cp backend/imhub.db backend/imhub.db.backup
```

### 5. Deploy Backend
- [ ] Deploy FastAPI backend (see DEPLOY.md)
- [ ] Verify database initialized
- [ ] Test API endpoints
- [ ] Check authentication

### 6. Deploy Frontend
- [ ] Deploy built frontend files
- [ ] Verify static assets load
- [ ] Check API connection
- [ ] Test all functionality

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Can login to application
- [ ] Contact Map tab loads
- [ ] Map displays correctly
- [ ] Can view existing contacts
- [ ] Can add new contacts
- [ ] Can edit contacts
- [ ] Can delete contacts
- [ ] Filters work
- [ ] Search works
- [ ] All views (Map/Cards/Table) work

### ✅ Performance Tests
- [ ] Map loads quickly (<3 seconds)
- [ ] Large datasets render smoothly
- [ ] Filtering is responsive
- [ ] No console errors
- [ ] Mobile responsive layout works

### ✅ Data Verification
- [ ] All imported contacts visible
- [ ] Coordinates display correctly on map
- [ ] Parish boundaries show properly
- [ ] Statistics are accurate
- [ ] Contact information complete

## User Training

### Training Topics
- [ ] How to access Contact Map
- [ ] Understanding the three view modes
- [ ] How to add a new contact
- [ ] How to edit contact information
- [ ] How to use filters effectively
- [ ] Understanding location types (field/remote/office/mobile)
- [ ] How to search for contacts
- [ ] Reading the map legend
- [ ] Understanding marker colors
- [ ] How to find GPS coordinates (if needed)

### Training Materials
- [ ] Share CONTACT_MAPPING_QUICKSTART.md
- [ ] Demo the interface
- [ ] Explain data entry standards
- [ ] Show filter combinations
- [ ] Demonstrate search capabilities

## Ongoing Maintenance

### Regular Tasks
- [ ] Update contact information as personnel change
- [ ] Add GPS coordinates for new field locations
- [ ] Update location types as deployments change
- [ ] Review and approve new contact submissions
- [ ] Clean up inactive contacts
- [ ] Update GeoJSON if boundaries change
- [ ] Backup database regularly

### Monitoring
- [ ] Check for API errors in logs
- [ ] Monitor database size
- [ ] Verify map loads correctly
- [ ] Ensure coordinates are accurate
- [ ] Review user feedback

### Data Quality
- [ ] Standardize organization names
- [ ] Ensure parish names match GeoJSON
- [ ] Validate email formats
- [ ] Check phone number formats
- [ ] Remove duplicate contacts
- [ ] Update outdated information

## Known Limitations

### Current
- Sample GeoJSON boundaries (approximate)
- Manual coordinate entry required
- No automatic geocoding
- No marker clustering (may be slow with 1000+ contacts)
- No heatmap visualization
- No offline support

### Planned Enhancements
- Integrate geocoding API
- Add marker clustering for performance
- Implement heatmap layer
- Create mobile data collection app
- Add CSV export functionality
- Implement advanced search
- Add contact details page
- Enable notifications

## Troubleshooting Guide

### Map Not Displaying
1. Check browser console for errors
2. Verify npm install --legacy-peer-deps completed
3. Ensure Leaflet CSS loaded
4. Check backend is running
5. Verify API responds

### Contacts Not on Map
1. Check if contacts have coordinates
2. Verify lat/lng are valid numbers
3. Check filters aren't hiding contacts
4. Try zooming out on map
5. Review browser console

### GeoJSON Not Loading
1. Verify file exists in backend/geojson/
2. Check API endpoint responds
3. Validate GeoJSON format at geojson.io
4. Check authentication token
5. Review network tab in browser

### Import Errors
1. Verify CSV format matches template
2. Check for required fields
3. Validate coordinate formats
4. Ensure authentication token is valid
5. Review script error messages

## Support Resources

### Documentation
- CONTACT_MAPPING_SUMMARY.md - Overview
- CONTACT_MAPPING_QUICKSTART.md - Quick start
- CONTACT_MAPPING_FEATURE.md - Detailed documentation
- CONTACT_MAPPING_ARCHITECTURE.md - Technical architecture

### Scripts
- backend/import_contacts.py - Data import utility
- backend/database.py - Database initialization

### API Documentation
See CONTACT_MAPPING_FEATURE.md for:
- API endpoint details
- Request/response formats
- Authentication requirements
- Example API calls

## Rollback Plan

If issues occur:

### 1. Database Rollback
```bash
# Restore from backup
cp backend/imhub.db.backup backend/imhub.db
```

### 2. Code Rollback
```bash
# Revert to previous ContactsPage
cd frontend/src/components
mv ContactsPage.tsx ContactsPage-new.tsx
mv ContactsPage-old.tsx ContactsPage.tsx
```

### 3. Remove New Dependencies
```bash
# Edit package.json to remove leaflet packages
# Run npm install --legacy-peer-deps
```

## Sign-Off

### Development Complete
- [x] All code implemented
- [x] Documentation complete
- [x] Import script created
- [x] Sample data prepared

### Ready for Testing
- [ ] Dependencies installed
- [ ] Database initialized
- [ ] Application running
- [ ] Basic tests passed

### Ready for Production
- [ ] All tests passed
- [ ] Data imported
- [ ] GeoJSON updated
- [ ] Users trained
- [ ] Backup created

### Production Deployed
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Functionality verified
- [ ] Users notified

---

**Last Updated**: November 17, 2025  
**Status**: Development complete, ready for dependency installation and testing
