import { useState, useEffect } from 'react'
import { getApiUrl } from '../config'
import './PowerBI.css'

export default function PowerBI() {
  const [powerbiUrl, setPowerbiUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPowerBIUrl()
  }, [])

  const fetchPowerBIUrl = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/powerbi-url'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPowerbiUrl(data.url)
      }
    } catch (err) {
      console.error('Failed to fetch Power BI URL', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="dashboard-section">
      <h2>Power BI Dashboard</h2>
      <div className="embed-container">
        {isLoading ? (
          <div className="embed-placeholder">
            <p>Loading...</p>
          </div>
        ) : powerbiUrl ? (
          <iframe
            title="Power BI Dashboard"
            src={powerbiUrl}
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="embed-placeholder">
            <p>📊 Power BI Dashboard will be embedded here</p>
            <p className="small-text">Configure POWERBI_URL in your .env file</p>
          </div>
        )}
      </div>
    </div>
  )
}
