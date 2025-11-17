import { useState, useEffect } from 'react'
import { getApiUrl } from '../config'
import './Announcements.css'

interface Announcement {
  id: string
  title: string
  date: string
  priority: 'high' | 'medium' | 'normal' | 'low'
  author: string
  tags: string[]
  content: string
  summary: string
}

interface AnnouncementsProps {
  limit?: number
}

export default function Announcements({ limit }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [limit])

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = limit 
        ? getApiUrl(`/api/announcements?limit=${limit}`)
        : getApiUrl('/api/announcements')
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      } else {
        setError('Failed to load announcements')
      }
    } catch (err) {
      setError('Error fetching announcements')
      console.error('Announcements error:', err)
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
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟠'
      case 'low':
        return '⚪'
      default:
        return '🔵'
    }
  }

  const getPriorityClass = (priority: string) => {
    return `priority-${priority}`
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (isLoading) {
    return (
      <div className="announcements-section">
        <h2>📢 Announcements</h2>
        <div className="loading">Loading announcements...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="announcements-section">
        <h2>📢 Announcements</h2>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return null // Don't show section if no announcements
  }

  return (
    <div className="announcements-section">
      <h2>📢 Announcements</h2>
      
      <div className="announcements-list">
        {announcements.map((announcement) => {
          const isExpanded = expandedId === announcement.id
          
          return (
            <div 
              key={announcement.id} 
              className={`announcement-card ${getPriorityClass(announcement.priority)}`}
            >
              <div className="announcement-header">
                <div className="announcement-priority">
                  {getPriorityIcon(announcement.priority)}
                </div>
                <div className="announcement-title-section">
                  <h3>{announcement.title}</h3>
                  <div className="announcement-meta">
                    <span className="announcement-date">
                      📅 {formatDate(announcement.date)}
                    </span>
                    {announcement.author && (
                      <span className="announcement-author">
                        👤 {announcement.author}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {announcement.tags && announcement.tags.length > 0 && (
                <div className="announcement-tags">
                  {announcement.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="announcement-content">
                {isExpanded ? (
                  <div 
                    className="announcement-full-content"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                ) : (
                  <div 
                    className="announcement-summary"
                    dangerouslySetInnerHTML={{ __html: announcement.summary }}
                  />
                )}
              </div>

              <button
                className="announcement-toggle"
                onClick={() => toggleExpanded(announcement.id)}
              >
                {isExpanded ? 'Show Less ▲' : 'Read More ▼'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
