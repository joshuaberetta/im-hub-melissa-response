import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiUrl } from '../config'
import Announcements from './Announcements'
import MapActionFeed from './MapActionFeed'
import './Home.css'

interface Link {
  name: string
  url: string
  internal: boolean
}

interface Section {
  title: string
  links: Link[]
}

interface ContentData {
  title?: string
  intro?: string
  welcome?: {
    heading: string
    intro: string
  }
  sections: Section[]
  about?: {
    title?: string
    heading?: string
    content: string
  }
}

export default function Home() {
  const navigate = useNavigate()
  const [content, setContent] = useState<ContentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/content'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        setError('Failed to load content')
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkClick = (link: Link, e: React.MouseEvent) => {
    if (link.internal) {
      e.preventDefault()
      navigate(link.url)
    }
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!content) {
    return <div className="error">No content available</div>
  }

  return (
    <div className="home-section">
      <h2>{content.welcome?.heading || content.title || 'Welcome'}</h2>
      <p className="intro-text">{content.welcome?.intro || content.intro || ''}</p>

      <div className="home-three-column-grid">
        {/* Column 1: Quick Links */}
        <div className="home-column quick-links-column">
          <div className="column-header">
            <h3>🔗 Quick Links</h3>
          </div>
          <div className="links-grid">
            {content.sections.map((section, index) => (
              <div key={index} className="link-card">
                <h4>{section.title}</h4>
                <ul className="resource-list">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.url}
                        onClick={(e) => handleLinkClick(link, e)}
                        target={link.internal ? undefined : '_blank'}
                        rel={link.internal ? undefined : 'noopener noreferrer'}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: MapAction Feed */}
        <div className="home-column maps-column">
          <MapActionFeed limit={5} showTitle={true} />
        </div>

        {/* Column 3: Announcements */}
        <div className="home-column announcements-column">
          <Announcements limit={5} />
        </div>
      </div>

      {content.about && (
        <div className="info-section">
          <h3>{content.about.heading || content.about.title || 'About'}</h3>
          <p>{content.about.content}</p>
        </div>
      )}
    </div>
  )
}
