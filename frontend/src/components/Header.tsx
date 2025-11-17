import { useState, useEffect } from 'react'
import { getApiUrl } from '../config'
import './Header.css'

interface HeaderProps {
  onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  const [title, setTitle] = useState('IM Hub')
  const [tagline, setTagline] = useState('Information Management Dashboard')

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
        if (data.title) setTitle(data.title)
        if (data.tagline) setTagline(data.tagline)
      }
    } catch (err) {
      console.error('Failed to fetch header content', err)
    }
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="site-logo">
          <h1>{title}</h1>
          <p className="tagline">{tagline}</p>
        </div>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  )
}
