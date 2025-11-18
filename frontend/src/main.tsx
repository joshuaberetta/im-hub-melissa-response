// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.tsx'

// Note: StrictMode temporarily disabled due to known compatibility issue with Leaflet
// React 19's StrictMode double-mounts components, causing "Map container already initialized" error
// See: https://github.com/PaulLeCam/react-leaflet/issues/1052
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
