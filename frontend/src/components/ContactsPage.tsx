import { useState, useMemo } from 'react'
import './ContactsPage.css'

interface WhatsAppGroup {
  id: number
  name: string
  sector: string
  description: string
  link: string
}

export default function ContactsPage() {
  const contactDashboardUrl = "https://app.powerbi.com/view?r=eyJrIjoiYmNiYmMwN2ItYmMwMy00M2Y4LWEzODgtMDNkYjk3YWM0ZWJjIiwidCI6IjBmOWUzNWRiLTU0NGYtNGY2MC1iZGNjLTVlYTQxNmU2ZGM3MCIsImMiOjh9"
  const registerFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfDz9Z3Uvs6Am4yIH-ik3bJM6Lv9VEYu6zZjUjCdw6p55pnhA/viewform"

  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // WhatsApp groups data
  const whatsappGroups: WhatsAppGroup[] = [
    {
      id: 1,
      name: "IM Jamaica Coordination",
      sector: "Cross-Sector",
      description: "General coordination for information management across all sectors",
      link: "https://chat.whatsapp.com/example1"
    },
    {
      id: 2,
      name: "Shelter Cluster IM",
      sector: "Shelter",
      description: "Information management for shelter sector activities and data collection",
      link: "https://chat.whatsapp.com/example2"
    },
    {
      id: 3,
      name: "WASH Data Collection",
      sector: "WASH",
      description: "WASH sector data collection coordination and field updates",
      link: "https://chat.whatsapp.com/example3"
    },
    {
      id: 4,
      name: "Health Assessments",
      sector: "Health",
      description: "Coordination for health assessments and medical facility data",
      link: "https://chat.whatsapp.com/example4"
    },
    {
      id: 5,
      name: "Protection Monitoring",
      sector: "Protection",
      description: "Protection monitoring and GBV reporting coordination",
      link: "https://chat.whatsapp.com/example5"
    },
    {
      id: 6,
      name: "Education in Emergency",
      sector: "Education",
      description: "Education cluster data sharing and school assessment coordination",
      link: "https://chat.whatsapp.com/example6"
    },
    {
      id: 7,
      name: "Food Security Monitoring",
      sector: "Food Security",
      description: "Food security assessments and distribution tracking",
      link: "https://chat.whatsapp.com/example7"
    }
  ]

  // Get unique sectors for filter
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(whatsappGroups.map(g => g.sector)))
    return uniqueSectors.sort()
  }, [])

  // Filter groups
  const filteredGroups = useMemo(() => {
    let filtered = whatsappGroups

    // Apply sector filter
    if (sectorFilter !== 'all') {
      filtered = filtered.filter(g => g.sector === sectorFilter)
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(query) ||
        g.sector.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
      )
    }

    // Sort by sector, then by name
    return filtered.sort((a, b) => {
      if (a.sector !== b.sector) {
        return a.sector.localeCompare(b.sector)
      }
      return a.name.localeCompare(b.name)
    })
  }, [sectorFilter, searchQuery])

  return (
    <div className="contacts-page">
      <h2>Contact Directory</h2>
      <p className="description">Humanitarian contact information and focal points</p>
      
      <div className="info-box">
        <p>
          View the contact directory below. To register your organization's contact information,
          please fill out the registration form.
        </p>
        <a 
          href={registerFormUrl} 
          className="button-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Register Contact Information
        </a>
      </div>

      <div className="embed-container">
        <iframe
          title="Contact Directory Dashboard"
          src={contactDashboardUrl}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      {/* WhatsApp Groups Section */}
      <div className="whatsapp-section">
        <h2>WhatsApp Coordination Groups</h2>
        <p className="description">Join relevant WhatsApp groups for sector coordination and information sharing</p>

        <div className="controls">
          <div className="filters">
            <select 
              value={sectorFilter} 
              onChange={(e) => setSectorFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="view-toggle">
            <button
              onClick={() => setViewMode('cards')}
              className={`view-button ${viewMode === 'cards' ? 'active' : ''}`}
              aria-label="Card view"
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
              aria-label="Table view"
            >
              Table
            </button>
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div className="groups-grid">
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <div key={group.id} className="group-card">
                  <div className="group-header">
                    <h3>{group.name}</h3>
                    <span className="sector-tag">{group.sector}</span>
                  </div>
                  <p className="group-description">{group.description}</p>
                  <a 
                    href={group.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="join-button"
                  >
                    Join Group ↗
                  </a>
                </div>
              ))
            ) : (
              <div className="no-results">
                No groups found matching your criteria
              </div>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="groups-table">
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Sector</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length > 0 ? (
                  filteredGroups.map(group => (
                    <tr key={group.id}>
                      <td className="group-name">{group.name}</td>
                      <td>
                        <span className="sector-tag">{group.sector}</span>
                      </td>
                      <td className="group-description">{group.description}</td>
                      <td className="action-cell">
                        <a 
                          href={group.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="join-button"
                        >
                          Join Group ↗
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="no-results-table">
                      No groups found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="results-count">
          Showing {filteredGroups.length} of {whatsappGroups.length} groups
        </div>
      </div>
    </div>
  )
}
