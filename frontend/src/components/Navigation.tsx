import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Navigation.css'

interface NavItem {
  label: string
  path: string
  type: 'link' | 'dropdown' | 'external'
  items?: { label: string; path: string; externalUrl?: string }[]
  embedUrl?: string
  externalUrl?: string
  default?: string
}

interface NavigationProps {
  navigation: NavItem[]
}

export default function Navigation({ navigation }: NavigationProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleNavClick = (item: NavItem) => {
    if (item.type === 'dropdown') {
      setOpenDropdown(openDropdown === item.label ? null : item.label)
    } else if (item.type === 'external' && item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer')
      setOpenDropdown(null)
    } else {
      navigate(item.path)
      setOpenDropdown(null)
    }
  }

  const handleDropdownItemClick = (path: string, externalUrl?: string) => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
    } else {
      navigate(path)
    }
    setOpenDropdown(null)
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <ul className="nav-tabs">
          {navigation.map((item, index) => (
            <li key={index} className="nav-item">
              <button
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                <span>{item.label}</span>
                {item.type === 'dropdown' && (
                  <span className="dropdown-icon">{openDropdown === item.label ? '▼' : '▶'}</span>
                )}
              </button>
              
              {item.type === 'dropdown' && openDropdown === item.label && item.items && (
                <ul className="dropdown-menu">
                  {item.items.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <button
                        className={`dropdown-item ${location.pathname === subItem.path ? 'active' : ''}`}
                        onClick={() => handleDropdownItemClick(subItem.path, subItem.externalUrl)}
                      >
                        {subItem.label}
                        {subItem.externalUrl && <span className="external-icon"> ↗</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
