// API configuration
export const API_URL = import.meta.env.VITE_API_URL || ''

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`
}
