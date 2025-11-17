import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getApiUrl } from '../config'
import './FormPage.css'

interface FormData {
  title: string
  description: string
  embedUrl: string
}

export default function FormPage() {
  const { formId = '5w' } = useParams()
  const [form, setForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/api/form/${formId}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setForm(data)
      } else {
        setError('Form not found')
      }
    } catch (err) {
      setError('Failed to load form')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="loading">Loading form...</div>
  }

  if (error || !form) {
    return <div className="error">{error || 'Form not available'}</div>
  }

  return (
    <div className="form-page">
      <h2>{form.title}</h2>
      <p className="description">{form.description}</p>
      
      <div className="embed-container">
        {form.embedUrl ? (
          <iframe
            title={form.title}
            src={form.embedUrl}
            frameBorder="0"
          ></iframe>
        ) : (
          <div className="embed-placeholder">
            <p>📝 {form.title}</p>
            <p className="small-text">Configure the embed URL in content.yaml or .env</p>
          </div>
        )}
      </div>
    </div>
  )
}
