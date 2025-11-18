import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { getApiUrl } from './config'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check if user has valid token
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token with backend
      fetch(getApiUrl('/api/auth/verify'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.ok) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('token')
            setIsAuthenticated(false)
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
          setIsAuthenticated(false)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <Login onLogin={handleLogin} />
        } 
      />
      <Route 
        path="/*" 
        element={
          <Dashboard 
            onLogout={handleLogout} 
            isAuthenticated={isAuthenticated}
          />
        } 
      />
    </Routes>
  )
}

export default App
