import { useState, useEffect } from 'react'
import { getApiUrl } from '../config'
import mapActionLogo from '../assets/mapaction.svg'
import './MapActionFeed.css'

interface MapEntry {
  title: string
  summary: string
  link: string
  updated: string
  published: string
  id: string
  georss_box?: string
  package_url?: string
  package_type?: string
}

interface MapActionFeedData {
  feed_title: string
  feed_updated: string
  maps: MapEntry[]
}

interface MapActionFeedProps {
  limit?: number
  showTitle?: boolean
}

export default function MapActionFeed({ limit = 5, showTitle = true }: MapActionFeedProps) {
  const [feedData, setFeedData] = useState<MapActionFeedData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    fetchMapActionFeed()
  }, [])

  const fetchMapActionFeed = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(getApiUrl('/api/mapaction-feed'), { headers })

      if (response.ok) {
        const data = await response.json()
        setFeedData(data)
      } else {
        setError('Failed to load MapAction feed')
      }
    } catch (err) {
      setError('Error fetching MapAction maps')
      console.error('MapAction feed error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const extractMapCode = (title: string) => {
    // Try to extract map code like "MA030" from title
    const match = title.match(/MA\d+/i)
    return match ? match[0].toUpperCase() : null
  }

  if (isLoading) {
    return (
      <div className="mapaction-feed">
        {showTitle && (
          <div className="mapaction-header">
            <h2>Latest MapAction Maps</h2>
          </div>
        )}
        <div className="loading">Loading MapAction maps...</div>
      </div>
    )
  }

  if (error || !feedData) {
    return (
      <div className="mapaction-feed">
        {showTitle && (
          <div className="mapaction-header">
            <h2>Latest MapAction Maps</h2>
          </div>
        )}
        <div className="error-message">{error || 'Unable to load maps'}</div>
      </div>
    )
  }

  const displayMaps = showAll ? feedData.maps : feedData.maps.slice(0, limit)

  return (
    <div className="mapaction-feed">
      {showTitle && (
        <div className="mapaction-header">
          <div className="mapaction-title-wrapper">
            <h2>Latest MapAction Maps</h2>
            <img src={mapActionLogo} alt="MapAction" className="mapaction-logo" />
          </div>
          <p className="mapaction-subtitle">
            Crisis maps for Jamaica Hurricane Response 2025
          </p>
        </div>
      )}

      <div className="maps-list">
        {displayMaps.map((map, index) => {
          const mapCode = extractMapCode(map.title)
          
          return (
            <div key={map.id || index} className="map-card">
              <div className="map-header">
                {mapCode && <span className="map-code">{mapCode}</span>}
                <h3 className="map-title">{map.title}</h3>
              </div>
              
              {map.summary && (
                <p className="map-summary">{map.summary}</p>
              )}
              
              <div className="map-meta">
                {map.published && (
                  <span className="map-date">
                    {formatDate(map.published)}
                  </span>
                )}
              </div>
              
              <div className="map-actions">
                {map.link && (
                  <a
                    href={map.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link view-link"
                  >
                    View Map
                  </a>
                )}
                {map.package_url && (
                  <a
                    href={map.package_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link download-link"
                  >
                    Download Package
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {feedData.maps.length > limit && (
        <div className="show-more-container">
          <button
            className="show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${feedData.maps.length} Maps`}
          </button>
        </div>
      )}

      <div className="mapaction-footer">
        <p>
          Maps provided by{' '}
          <a
            href="https://maps.mapaction.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            MapAction
          </a>
        </p>
      </div>
    </div>
  )
}
