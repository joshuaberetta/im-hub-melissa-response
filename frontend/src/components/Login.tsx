import { useState, useEffect } from 'react'
import { getApiUrl } from '../config'
import './Login.css'

interface LoginProps {
  onLogin: () => void
}

interface LoginContent {
  heading: string
  tagline: string
  title: string
  description: string
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState<LoginContent>({
    heading: 'IM Hub',
    tagline: 'Information Management Dashboard',
    title: 'Sign In',
    description: ''
  })

  useEffect(() => {
    fetchLoginContent()
  }, [])

  const fetchLoginContent = async () => {
    try {
      const response = await fetch(getApiUrl('/api/login-content'))
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      }
    } catch (err) {
      console.error('Failed to fetch login content', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        onLogin()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Invalid credentials')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>{content.heading}</h1>
          <p className="tagline">{content.tagline}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <h2>{content.title}</h2>
          {content.description && (
            <p className="login-description">{content.description}</p>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
