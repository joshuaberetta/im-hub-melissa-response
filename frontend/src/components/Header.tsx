import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiUrl } from '../config'
import './Header.css'

interface HeaderProps {
  onLogout: () => void
  isAuthenticated: boolean
}

export default function Header({ onLogout, isAuthenticated }: HeaderProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('IM Hub')
  const [tagline, setTagline] = useState('Information Management Dashboard')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(getApiUrl('/api/content'), { headers })

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
        {isAuthenticated ? (
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        ) : (
          <button onClick={() => navigate('/login')} className="logout-button">
            Login
          </button>
        )}
      </div>
    </header>
  )
}
