import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import Home from './Home'
import DashboardPage from './DashboardPage'
import FormPage from './FormPage'
import SectorPage from './SectorPage'
import CalendarPage from './CalendarPage'
import ContactsPage from './ContactsPage'
import ResourcesPage from './ResourcesPage'
import { getApiUrl } from '../config'
import './Dashboard.css'

interface DashboardProps {
  onLogout: () => void
}

interface NavItem {
  label: string
  path: string
  type: 'link' | 'dropdown'
  items?: { label: string; path: string }[]
  embedUrl?: string
  default?: string
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [navigation, setNavigation] = useState<NavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNavigation()
  }, [])

  const fetchNavigation = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/navigation'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNavigation(data.navigation || [])
      }
    } catch (err) {
      console.error('Failed to fetch navigation', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard">
      <Header onLogout={onLogout} />
      <Navigation navigation={navigation} />
      <main className="main-content">
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboards" element={<DashboardPage />} />
            <Route path="/dashboards/:dashboardId" element={<DashboardPage />} />
            <Route path="/forms" element={<FormPage />} />
            <Route path="/forms/:formId" element={<FormPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/sectors/:sectorId" element={<SectorPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
          </Routes>
        </div>
      </main>
      <footer className="site-footer">
        <div className="footer-container">
          <p>&copy; 2025 IM Hub. All rights reserved.</p>
          <p className="footer-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a> | 
            <a href="#" onClick={(e) => e.preventDefault()}>Terms of Use</a> | 
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
