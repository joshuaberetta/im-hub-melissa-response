import { useState, useMemo, useEffect, useRef } from 'react'
import './ContactsPage.css'

interface WhatsAppGroup {
  id: number
  name: string
  sector: string
  description: string
  link: string
  contact_name?: string
  contact_email?: string
  approved: boolean
  deleted: boolean
  created_at?: string
  updated_at?: string
}

export default function ContactsPage() {
  const contactDashboardUrl = "https://app.powerbi.com/view?r=eyJrIjoiYmNiYmMwN2ItYmMwMy00M2Y4LWEzODgtMDNkYjk3YWM0ZWJjIiwidCI6IjBmOWUzNWRiLTU0NGYtNGY2MC1iZGNjLTVlYTQxNmU2ZGM3MCIsImMiOjh9"
  const registerFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfDz9Z3Uvs6Am4yIH-ik3bJM6Lv9VEYu6zZjUjCdw6p55pnhA/viewform"

  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    description: '',
    link: '',
    contact_name: '',
    contact_email: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch WhatsApp groups from API
  useEffect(() => {
    fetchGroups()
  }, [])

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Fetching groups with token:', token ? 'exists' : 'missing')
      const response = await fetch('/api/whatsapp-groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Response status:', response.status, response.ok)
      if (response.ok) {
        const data = await response.json()
        console.log('Groups fetched:', data.length, 'groups')
        setWhatsappGroups(data)
        setLoading(false)
      } else {
        console.error('Failed to fetch WhatsApp groups, status:', response.status)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp groups:', error)
      setLoading(false)
    }
  }

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMessage(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/whatsapp-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'WhatsApp group added successfully!'
        });
        setFormData({
          name: '',
          sector: '',
          description: '',
          link: '',
          contact_name: '',
          contact_email: ''
        })
        setShowAddForm(false)
        // Refresh the list to show the new group
        fetchGroups()
        setTimeout(() => setSubmitMessage(null), 5000)
      } else {
        const error = await response.json()
        setSubmitMessage({
          type: 'error',
          text: error.detail || 'Failed to submit group. Please try again.'
        })
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditGroup = (group: WhatsAppGroup) => {
    setFormData({
      name: group.name,
      sector: group.sector,
      description: group.description,
      link: group.link,
      contact_name: group.contact_name || '',
      contact_email: group.contact_email || ''
    })
    setEditingId(group.id)
    setShowAddForm(true)
    setActiveDropdown(null)
  }

  const toggleDropdown = (groupId: number) => {
    setActiveDropdown(activeDropdown === groupId ? null : groupId)
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    
    setSubmitting(true)
    setSubmitMessage(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/whatsapp-groups/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'WhatsApp group updated successfully!'
        });
        setFormData({
          name: '',
          sector: '',
          description: '',
          link: '',
          contact_name: '',
          contact_email: ''
        })
        setShowAddForm(false)
        setEditingId(null)
        fetchGroups()
        setTimeout(() => setSubmitMessage(null), 5000)
      } else {
        const error = await response.json()
        setSubmitMessage({
          type: 'error',
          text: error.detail || 'Failed to update group. Please try again.'
        })
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteGroup = async (id: number) => {
    setActiveDropdown(null)
    if (!confirm('Are you sure you want to delete this group? It will be hidden and require admin approval for permanent deletion.')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/whatsapp-groups/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'Group marked for deletion. Admin will review.'
        })
        fetchGroups()
        setTimeout(() => setSubmitMessage(null), 5000)
      } else {
        setSubmitMessage({
          type: 'error',
          text: 'Failed to delete group. Please try again.'
        })
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Network error. Please try again.'
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setShowAddForm(false)
    setFormData({
      name: '',
      sector: '',
      description: '',
      link: '',
      contact_name: '',
      contact_email: ''
    })
  }

  // Get unique sectors for filter
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(whatsappGroups.map(g => g.sector)))
    return uniqueSectors.sort()
  }, [whatsappGroups])

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
  }, [whatsappGroups, sectorFilter, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage)
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredGroups, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
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
        <div className="section-header">
          <div>
            <h2>WhatsApp Coordination Groups</h2>
            <p className="description">Join relevant WhatsApp groups for sector coordination and information sharing</p>
          </div>
          <button 
            className="add-group-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Group'}
          </button>
        </div>

        {submitMessage && (
          <div className={`message ${submitMessage.type}`}>
            {submitMessage.text}
          </div>
        )}

        {showAddForm && (
          <div className="add-group-form">
            <h3>{editingId ? 'Edit WhatsApp Group' : 'Register a WhatsApp Group'}</h3>
            <form onSubmit={editingId ? handleUpdateGroup : handleSubmitGroup}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="group-name">Group Name *</label>
                  <input
                    id="group-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Health Cluster IM"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="group-sector">Sector *</label>
                  <select
                    id="group-sector"
                    required
                    value={formData.sector}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  >
                    <option value="">Select a sector</option>
                    <option value="Cross-Sector">Cross-Sector</option>
                    <option value="Shelter">Shelter</option>
                    <option value="WASH">WASH</option>
                    <option value="Health">Health</option>
                    <option value="Protection">Protection</option>
                    <option value="Education">Education</option>
                    <option value="Food Security">Food Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="group-description">Description *</label>
                <textarea
                  id="group-description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the group's purpose"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="group-link">WhatsApp Group Link *</label>
                <input
                  id="group-link"
                  type="url"
                  required
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-name">Your Name (optional)</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    placeholder="Group administrator name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Your Email (optional)</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    placeholder="your.email@example.org"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={submitting} className="submit-button">
                  {submitting ? 'Saving...' : editingId ? 'Update Group' : 'Add Group'}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="cancel-button">
                    Cancel
                  </button>
                )}
                <p className="form-note">
                  * Required fields
                </p>
              </div>
            </form>
          </div>
        )}

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

        {loading ? (
          <div className="loading">Loading groups...</div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <div className="groups-grid">
                {paginatedGroups.length > 0 ? (
                  paginatedGroups.map(group => (
                    <div key={group.id} className="group-card">
                      <div className="group-header">
                        <h3>{group.name}</h3>
                        <span className="sector-tag">{group.sector}</span>
                      </div>
                      <p className="group-description">{group.description}</p>
                      <div className="group-actions">
                        <a 
                          href={group.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="join-button"
                        >
                          Join Group ↗
                        </a>
                        <div className="actions-dropdown" ref={activeDropdown === group.id ? dropdownRef : null}>
                          <button 
                            className="actions-button"
                            onClick={() => toggleDropdown(group.id)}
                            aria-label="Actions"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 3.5 10 3.5s1.5.67 1.5 1.5S10.83 6.5 10 6.5zm0 1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm0 5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
                            </svg>
                          </button>
                          {activeDropdown === group.id && (
                            <div className="dropdown-menu">
                              <button onClick={() => handleEditGroup(group)} className="dropdown-item">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
                                </svg>
                                Edit
                              </button>
                              <button onClick={() => handleDeleteGroup(group.id)} className="dropdown-item delete">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedGroups.length > 0 ? (
                      paginatedGroups.map(group => (
                        <tr key={group.id}>
                          <td className="group-name">{group.name}</td>
                          <td>
                            <span className="sector-tag">{group.sector}</span>
                          </td>
                          <td className="group-description">{group.description}</td>
                          <td className="action-cell">
                            <div className="table-actions">
                              <a 
                                href={group.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="join-button table-join"
                              >
                                Join Group ↗
                              </a>
                              <div className="actions-dropdown" ref={activeDropdown === group.id ? dropdownRef : null}>
                                <button 
                                  className="actions-button"
                                  onClick={() => toggleDropdown(group.id)}
                                  aria-label="Actions"
                                >
                                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 3.5 10 3.5s1.5.67 1.5 1.5S10.83 6.5 10 6.5zm0 1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm0 5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/>
                                  </svg>
                                </button>
                                {activeDropdown === group.id && (
                                  <div className="dropdown-menu">
                                    <button onClick={() => handleEditGroup(group)} className="dropdown-item">
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"/>
                                      </svg>
                                      Edit
                                    </button>
                                    <button onClick={() => handleDeleteGroup(group.id)} className="dropdown-item delete">
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/>
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
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

            {filteredGroups.length > 0 && totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <div className="pagination-info">
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  className="pagination-button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}

            <div className="results-count">
              Showing {paginatedGroups.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-{Math.min(currentPage * itemsPerPage, filteredGroups.length)} of {filteredGroups.length} groups
            </div>
          </>
        )}
      </div>
    </div>
  )
}
