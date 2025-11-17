import { useState, useEffect } from 'react'
import { getApiUrl } from '../config'
import MapActionFeed from './MapActionFeed'
import './ResourcesPage.css'

interface Resource {
  name: string
  description?: string
  url?: string
  type: 'download' | 'external'
  category?: string
  fileType?: string
}

interface ResourceCategory {
  title: string
  resources: Resource[]
}

export default function ResourcesPage() {
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/resources'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('Failed to fetch resources', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResourceClick = (resource: Resource) => {
    if (resource.type === 'download' && resource.url) {
      // Trigger download
      const link = document.createElement('a')
      link.href = getApiUrl(resource.url)
      link.download = resource.name
      link.click()
    } else if (resource.type === 'external' && resource.url) {
      // Open external link
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    }
  }

  const getFileIcon = (fileType?: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return '📄'
      case 'xlsx':
      case 'xls':
      case 'excel':
        return '📊'
      case 'docx':
      case 'doc':
      case 'word':
        return '📝'
      case 'pptx':
      case 'ppt':
        return '📽️'
      case 'zip':
        return '🗜️'
      default:
        return '📎'
    }
  }

  if (isLoading) {
    return <div className="loading">Loading resources...</div>
  }

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>Resources</h1>
        <p>Download templates, guidelines, and access external resources</p>
      </div>

      {/* MapAction Maps Feed */}
      <MapActionFeed />

      <div className="resources-content">
        {categories.length === 0 ? (
          <div className="no-resources">
            <p>No resources available at this time.</p>
          </div>
        ) : (
          categories.map((category, index) => (
            <div key={index} className="resource-category">
              <h2 className="category-title">{category.title}</h2>
              <div className="resource-grid">
                {category.resources.map((resource, resIndex) => (
                  <div
                    key={resIndex}
                    className="resource-card"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <div className="resource-icon">
                      {resource.type === 'external' ? '🔗' : getFileIcon(resource.fileType)}
                    </div>
                    <div className="resource-info">
                      <h3 className="resource-name">{resource.name}</h3>
                      {resource.description && (
                        <p className="resource-description">{resource.description}</p>
                      )}
                      <span className="resource-type">
                        {resource.type === 'external' ? 'External Link' : `Download ${resource.fileType?.toUpperCase() || 'File'}`}
                      </span>
                    </div>
                    <div className="resource-action">
                      {resource.type === 'external' ? '↗' : '⬇'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
