import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getApiUrl } from '../config'
import './DashboardPage.css'

interface DashboardData {
  title: string
  description: string
  embedUrl: string
}

export default function DashboardPage() {
  const { dashboardId = '5w' } = useParams()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [dashboardId])

  const fetchDashboard = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/api/dashboard/${dashboardId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboard(data)
      } else {
        setError('Dashboard not found')
      }
    } catch (err) {
      setError('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (error || !dashboard) {
    return <div className="error">{error || 'Dashboard not available'}</div>
  }

  return (
    <div className="dashboard-page">
      <h2>{dashboard.title}</h2>
      <p className="description">{dashboard.description}</p>
      
      <div className="embed-container">
        {dashboard.embedUrl ? (
          <iframe
            title={dashboard.title}
            src={dashboard.embedUrl}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="embed-placeholder">
            <p>📊 {dashboard.title}</p>
            <p className="small-text">Configure the embed URL in content.yaml or .env</p>
          </div>
        )}
      </div>
    </div>
  )
}
