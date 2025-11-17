import { useState, useEffect } from 'react'
import { getApiUrl } from '../config'
import './KoboForm.css'

export default function KoboForm() {
  const [koboUrl, setKoboUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchKoboUrl()
  }, [])

  const fetchKoboUrl = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/kobo-url'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setKoboUrl(data.url)
      }
    } catch (err) {
      console.error('Failed to fetch Kobo URL', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="form-section">
      <h2>Kobo Data Collection Form</h2>
      <div className="embed-container">
        {isLoading ? (
          <div className="embed-placeholder">
            <p>Loading...</p>
          </div>
        ) : koboUrl ? (
          <iframe
            title="Kobo Form"
            src={koboUrl}
            frameBorder="0"
          ></iframe>
        ) : (
          <div className="embed-placeholder">
            <p>📝 Kobo Form will be embedded here</p>
            <p className="small-text">Configure KOBO_URL in your .env file</p>
          </div>
        )}
      </div>
    </div>
  )
}
