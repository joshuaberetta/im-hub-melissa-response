import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getApiUrl } from '../config'
import './SectorPage.css'

interface Resource {
  name: string
  url: string
}

interface SectorData {
  title: string
  description: string
  resources: Resource[]
}

export default function SectorPage() {
  const { sectorId } = useParams()
  const [sector, setSector] = useState<SectorData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sectorId) {
      fetchSector()
    }
  }, [sectorId])

  const fetchSector = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/api/sector/${sectorId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSector(data)
      } else {
        setError('Sector not found')
      }
    } catch (err) {
      setError('Failed to load sector')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="loading">Loading sector...</div>
  }

  if (error || !sector) {
    return <div className="error">{error || 'Sector not available'}</div>
  }

  return (
    <div className="sector-page">
      <h2>{sector.title}</h2>
      <p className="description">{sector.description}</p>
      
      <div className="resources-section">
        <h3>Resources</h3>
        <ul className="resource-list">
          {sector.resources.map((resource, index) => (
            <li key={index}>
              <a 
                href={resource.url} 
                target={resource.url.startsWith('http') ? '_blank' : undefined}
                rel={resource.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {resource.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
