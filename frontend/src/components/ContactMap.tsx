import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import './ContactMap.css'

// Fix for default marker icons in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

// Custom icons for different location types
const createCustomIcon = (locationType: string, color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-pin" style="background-color: ${color}">
      <span class="marker-icon">${locationType === 'field' ? '📍' : locationType === 'remote' ? '💻' : '🏢'}</span>
    </div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  })
}

interface Contact {
  id: number
  name: string
  organization: string
  position?: string
  email?: string
  phone?: string
  sector?: string
  parish?: string
  community?: string
  latitude?: string
  longitude?: string
  location_type: string
  status: string
  notes?: string
}

interface ContactMapProps {
  contacts: Contact[]
  geojsonData?: any
  mapTitle?: string
}

// Component to fit map bounds to markers
function FitBounds({ contacts }: { contacts: Contact[] }) {
  const map = useMap()
  
  useEffect(() => {
    const validContacts = contacts.filter(c => c.latitude && c.longitude)
    
    if (validContacts.length === 0) return
    
    const bounds = L.latLngBounds(
      validContacts.map(c => [parseFloat(c.latitude!), parseFloat(c.longitude!)])
    )
    
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
  }, [contacts, map])
  
  return null
}

// Component to handle GeoJSON layer updates
function GeoJSONLayer({ data, style, onEachFeature }: { data: any, style: any, onEachFeature: any }) {
  const map = useMap()
  
  useEffect(() => {
    if (!data) return
    
    console.log('GeoJSONLayer: Creating new layer with', data.features?.length, 'features')
    
    // Create the GeoJSON layer
    const geoJsonLayer = L.geoJSON(data, {
      style,
      onEachFeature
    })
    
    // Add to map
    geoJsonLayer.addTo(map)
    
    // Cleanup: remove layer when component unmounts or data changes
    return () => {
      console.log('GeoJSONLayer: Removing old layer')
      map.removeLayer(geoJsonLayer)
    }
  }, [data, map, style, onEachFeature])
  
  return null
}

export default function ContactMap({ contacts, geojsonData, mapTitle = 'Map' }: ContactMapProps) {
  // Jamaica center coordinates
  const center: [number, number] = [18.1096, -77.2975]
  const defaultZoom = 9
  
  // Debug: Log when geojsonData changes
  useEffect(() => {
    console.log('ContactMap - mapTitle:', mapTitle)
    console.log('ContactMap - geojsonData features:', geojsonData?.features?.length || 0)
  }, [mapTitle, geojsonData])
  
  // Filter contacts with valid coordinates
  const mappableContacts = contacts.filter(c => c.latitude && c.longitude)
  
  // Get icon color based on location type
  const getIconColor = (locationType: string) => {
    switch (locationType) {
      case 'field': return '#2ecc71'
      case 'remote': return '#3498db'
      case 'office': return '#e74c3c'
      case 'mobile': return '#f39c12'
      default: return '#95a5a6'
    }
  }
  
  // Style for GeoJSON boundaries
  const geoJsonStyle = {
    fillColor: '#3498db',
    fillOpacity: 0.1,
    color: '#2980b9',
    weight: 2
  }
  
  const onEachFeature = (feature: any, layer: any) => {
    // Handle both parish names and community names
    const name = feature.properties?.name || feature.properties?.ADM2_EN || 'Unknown'
    const parish = feature.properties?.ADM1_EN
    const population = feature.properties?.population || feature.properties?.POPN
    
    let popupContent = `<strong>${name}</strong>`
    if (parish && parish !== name) {
      popupContent += `<br/>Parish: ${parish}`
    }
    if (population) {
      popupContent += `<br/>Population: ${population.toLocaleString()}`
    }
    
    layer.bindPopup(popupContent)
  }
  
  return (
    <div className="contact-map-container">
      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-marker" style={{ backgroundColor: '#2ecc71' }}>📍</span>
            <span>Field</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ backgroundColor: '#3498db' }}>💻</span>
            <span>Remote</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ backgroundColor: '#e74c3c' }}>🏢</span>
            <span>Office</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ backgroundColor: '#f39c12' }}>📍</span>
            <span>Mobile</span>
          </div>
        </div>
      </div>
      
      <MapContainer 
        key="contact-map"
        center={center} 
        zoom={defaultZoom} 
        scrollWheelZoom={true}
        className="contact-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Add GeoJSON administrative boundaries */}
        {geojsonData && (
          <GeoJSONLayer 
            data={geojsonData}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}
        
        {/* Add contact markers */}
        {mappableContacts.map(contact => (
          <Marker
            key={contact.id}
            position={[parseFloat(contact.latitude!), parseFloat(contact.longitude!)]}
            icon={createCustomIcon(contact.location_type, getIconColor(contact.location_type))}
          >
            <Popup>
              <div className="contact-popup">
                <h4>{contact.name}</h4>
                <p className="organization">{contact.organization}</p>
                {contact.position && <p className="position">{contact.position}</p>}
                {contact.sector && <p className="sector">Sector: {contact.sector}</p>}
                {contact.parish && <p className="location">Parish: {contact.parish}</p>}
                {contact.community && <p className="location">Community: {contact.community}</p>}
                <div className="status-badges">
                  <span className={`status-badge ${contact.location_type}`}>
                    {contact.location_type}
                  </span>
                  <span className={`status-badge ${contact.status}`}>
                    {contact.status}
                  </span>
                </div>
                {contact.email && <p className="contact-info">📧 {contact.email}</p>}
                {contact.phone && <p className="contact-info">📱 {contact.phone}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {mappableContacts.length > 0 && <FitBounds contacts={mappableContacts} />}
      </MapContainer>
      
      <div className="map-stats">
        <p>{mappableContacts.length} contacts on map</p>
        {contacts.length > mappableContacts.length && (
          <p className="unmapped-warning">
            {contacts.length - mappableContacts.length} contacts without coordinates
          </p>
        )}
      </div>
    </div>
  )
}
