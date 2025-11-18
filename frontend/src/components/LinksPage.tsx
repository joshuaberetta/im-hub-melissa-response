import { useState, useMemo, useEffect } from 'react'
import './ContactsPage.css'
import PaginatedTable from './PaginatedTable'
import ActionsDropdown, { EditIcon, DeleteIcon } from './ActionsDropdown'
import { QRCodeCanvas } from 'qrcode.react'

interface Link {
  id: number
  title: string
  slug: string
  url: string
  description?: string
  created_by?: string
  deleted: boolean
  created_at?: string
  updated_at?: string
}

interface LinksPageProps {
  isAuthenticated: boolean
}

export default function LinksPage({ isAuthenticated }: LinksPageProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    url: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [qrModalLink, setQrModalLink] = useState<Link | null>(null)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/links', { headers })
      
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching links:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMessage(null)

    try {
      const token = localStorage.getItem('token')
      const url = editingId ? `/api/links/${editingId}` : '/api/links'
      const method = editingId ? 'PUT' : 'POST'

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: editingId ? 'Link updated successfully!' : 'Link created successfully!'
        })
        setFormData({
          title: '',
          slug: '',
          url: '',
          description: ''
        })
        setEditingId(null)
        setShowAddForm(false)
        fetchLinks()
        setTimeout(() => setSubmitMessage(null), 5000)
      } else {
        const error = await response.json()
        setSubmitMessage({
          type: 'error',
          text: error.detail || 'Failed to save link. Please try again.'
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

  const handleEdit = (link: Link) => {
    setFormData({
      title: link.title,
      slug: link.slug,
      url: link.url,
      description: link.description || ''
    })
    setEditingId(link.id)
    setShowAddForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'Link deleted successfully!'
        })
        fetchLinks()
        setTimeout(() => setSubmitMessage(null), 5000)
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Failed to delete link.'
      })
    }
  }

  const handleCancelEdit = () => {
    setFormData({
      title: '',
      slug: '',
      url: '',
      description: ''
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  const handleCopyShortLink = (slug: string) => {
    const shortUrl = `${window.location.origin}/link/${slug}`
    navigator.clipboard.writeText(shortUrl)
    setSubmitMessage({
      type: 'success',
      text: 'Short link copied to clipboard!'
    })
    setTimeout(() => setSubmitMessage(null), 3000)
  }

  const handleDownloadQR = (link: Link) => {
    // Find the canvas element in the modal
    const canvas = document.querySelector('.qr-modal canvas') as HTMLCanvasElement
    if (!canvas) return

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${link.slug}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  // Filter links based on search query
  const filteredLinks = useMemo(() => {
    let filtered = links

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(query) ||
        link.slug.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [links, searchQuery])

  // Define table columns
  const tableColumns = useMemo(() => [
    {
      key: 'title',
      header: 'Title',
      render: (link: Link) => (
        <span className="group-name">{link.title}</span>
      )
    },
    {
      key: 'slug',
      header: 'Short URL',
      render: (link: Link) => (
        <code className="slug-code">/link/{link.slug}</code>
      )
    },
    {
      key: 'url',
      header: 'Destination URL',
      render: (link: Link) => (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="destination-url"
          title={link.url}
        >
          {link.url.length > 50 ? link.url.substring(0, 50) + '...' : link.url} ↗
        </a>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '200px',
      render: (link: Link) => (
        <div className="table-actions">
          <button
            className="join-button table-join"
            onClick={() => handleCopyShortLink(link.slug)}
          >
            Copy Link
          </button>
          <button
            className="join-button table-join"
            onClick={() => setQrModalLink(link)}
          >
            QR Code
          </button>
          {isAuthenticated && (
            <ActionsDropdown
              actions={[
                {
                  label: 'Edit',
                  icon: <EditIcon />,
                  onClick: () => handleEdit(link)
                },
                {
                  label: 'Delete',
                  icon: <DeleteIcon />,
                  onClick: () => handleDelete(link.id),
                  variant: 'danger'
                }
              ]}
            />
          )}
        </div>
      )
    }
  ], [isAuthenticated])

  if (loading) {
    return <div className="loading">Loading links...</div>
  }

  return (
    <div className="contacts-page">
      <h2>URL Shortener</h2>
      <p className="description">Create and manage shortened URLs for easy sharing</p>

      <div className="tab-content">
        {submitMessage && (
          <div className={`message ${submitMessage.type}`}>
            {submitMessage.text}
          </div>
        )}

        <div className="section-header">
          <div>
            <h3>Shortened Links</h3>
            <p className="section-description">
              Create short, memorable URLs that redirect to any destination
            </p>
          </div>
          <button 
            className="add-group-button"
            onClick={() => {
              if (showAddForm && !editingId) {
                setShowAddForm(false)
              } else {
                handleCancelEdit()
                setShowAddForm(!showAddForm)
              }
            }}
          >
            {showAddForm ? 'Cancel' : '+ Create Link'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-group-form">
            <h3>{editingId ? 'Edit Link' : 'Create New Short Link'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Damage Assessment Form"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="slug">Short URL Slug *</label>
                  <input
                    id="slug"
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="e.g., damage-form"
                    pattern="[a-zA-Z0-9_-]+"
                    title="Only letters, numbers, hyphens, and underscores allowed"
                  />
                  <small className="form-hint">
                    Will create: /link/{formData.slug || 'your-slug'}
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="url">Destination URL *</label>
                <input
                  id="url"
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://example.com/long/url/here"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of what this link is for"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={submitting} className="submit-button">
                  {submitting ? 'Saving...' : (editingId ? 'Update Link' : 'Create Link')}
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
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
              }}
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
          <div className="loading">Loading links...</div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              <div className="groups-grid">
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((link) => (
                    <div key={link.id} className="group-card">
                      <div className="group-header">
                        <h3>{link.title}</h3>
                        {isAuthenticated && (
                          <ActionsDropdown
                            actions={[
                              {
                                label: 'Edit',
                                icon: <EditIcon />,
                                onClick: () => handleEdit(link)
                              },
                              {
                                label: 'Delete',
                                icon: <DeleteIcon />,
                                onClick: () => handleDelete(link.id),
                                variant: 'danger'
                              }
                            ]}
                          />
                        )}
                      </div>
                      
                      {link.description && (
                        <p className="group-description">{link.description}</p>
                      )}

                      <div className="link-details">
                        <div className="link-info-row">
                          <strong>Short URL:</strong>
                          <code className="slug-code">/link/{link.slug}</code>
                        </div>
                        <div className="link-info-row">
                          <strong>Destination:</strong>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="destination-url"
                            title={link.url}
                          >
                            {link.url.length > 50 ? link.url.substring(0, 50) + '...' : link.url}
                          </a>
                        </div>
                      </div>

                      <div className="group-actions">
                        <button
                          className="join-button"
                          onClick={() => handleCopyShortLink(link.slug)}
                        >
                          Copy Link
                        </button>
                        <button
                          className="join-button"
                          onClick={() => setQrModalLink(link)}
                        >
                          QR Code
                        </button>
                        {link.created_by && (
                          <span className="created-by-text">
                            by {link.created_by}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No links found. Create your first shortened link to get started!</p>
                  </div>
                )}
              </div>
            ) : (
              <PaginatedTable
                data={filteredLinks}
                columns={tableColumns}
                itemsPerPage={10}
                getItemKey={(link) => link.id}
                emptyMessage="No links found"
              />
            )}
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {qrModalLink && (
        <div className="modal-overlay" onClick={() => setQrModalLink(null)}>
          <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>QR Code for {qrModalLink.title}</h3>
              <button className="modal-close" onClick={() => setQrModalLink(null)}>✕</button>
            </div>
            <div className="qr-container">
              <QRCodeCanvas
                value={`${window.location.origin}/link/${qrModalLink.slug}`}
                size={300}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                      <text x="50" y="75" font-size="70" text-anchor="middle">🌀</text>
                    </svg>
                  `),
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <p className="qr-info">
                <code>/link/{qrModalLink.slug}</code>
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="submit-button"
                onClick={() => handleDownloadQR(qrModalLink)}
              >
                Download PNG
              </button>
              <button
                className="cancel-button"
                onClick={() => setQrModalLink(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
