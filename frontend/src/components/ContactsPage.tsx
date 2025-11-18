import { useState, useMemo, useEffect } from 'react'
import './ContactsPage.css'
import PaginatedTable from './PaginatedTable'
import ActionsDropdown, { EditIcon, DeleteIcon } from './ActionsDropdown'
import ContactMap from './ContactMap'

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

interface Contact {
  id: number
  name: string
  organization: string
  position?: string
  email?: string
  phone?: string
  sector?: string
  parish?: string
  community?: string
  latitude?: string
  longitude?: string
  location_type: string
  status: string
  notes?: string
  deleted: boolean
  approved: boolean
  created_at?: string
  updated_at?: string
}

interface ContactFormData {
  name: string
  organization: string
  position: string
  email: string
  phone: string
  sector: string
  parish: string
  community: string
  latitude: string
  longitude: string
  location_type: string
  status: string
  notes: string
}

interface ContactsPageProps {
  isAuthenticated: boolean
}

export default function ContactsPage({ isAuthenticated }: ContactsPageProps) {
  const contactDashboardUrl = "https://app.powerbi.com/view?r=eyJrIjoiYmNiYmMwN2ItYmMwMy00M2Y4LWEzODgtMDNkYjk3YWM0ZWJjIiwidCI6IjBmOWUzNWRiLTU0NGYtNGY2MC1iZGNjLTVlYTQxNmU2ZGM3MCIsImMiOjh9"
  const registerFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfDz9Z3Uvs6Am4yIH-ik3bJM6Lv9VEYu6zZjUjCdw6p55pnhA/viewform"

  const [activeTab, setActiveTab] = useState<'directory' | 'contacts' | 'whatsapp'>('directory')
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>('all')
  const [parishFilter, setParishFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'map'>('map')
  const [whatsappGroups, setWhatsappGroups] = useState<WhatsAppGroup[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [parishGeojsonData, setParishGeojsonData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    description: '',
    link: '',
    contact_name: '',
    contact_email: ''
  })
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    name: '',
    organization: '',
    position: '',
    email: '',
    phone: '',
    sector: '',
    parish: '',
    community: '',
    latitude: '',
    longitude: '',
    location_type: 'field',
    status: 'active',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingContactId, setEditingContactId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch WhatsApp groups and contacts from API
  useEffect(() => {
    fetchGroups()
    fetchContacts()
    fetchParishGeoJSON()
  }, [])

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/whatsapp-groups', { headers })
      
      if (response.ok) {
        const data = await response.json()
        setWhatsappGroups(data)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp groups:', error)
    }
  }

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/contacts', { headers })
      
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      setLoading(false)
    }
  }

  const fetchParishGeoJSON = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/geojson/jamaica-parishes.geojson', {
        headers,
        cache: 'no-cache'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded parish GeoJSON:', data.features?.length, 'features')
        setParishGeojsonData(data)
      }
    } catch (error) {
      console.log('Error loading parish GeoJSON')
    }
  }

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMessage(null)

    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/whatsapp-groups', {
        method: 'POST',
        headers,
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

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMessage(null)

    try {
      const token = localStorage.getItem('token')
      const url = editingContactId 
        ? `/api/contacts/${editingContactId}`
        : '/api/contacts'
      const method = editingContactId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactFormData)
      })

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: editingContactId ? 'Contact updated successfully!' : 'Contact added successfully!'
        });
        setContactFormData({
          name: '',
          organization: '',
          position: '',
          email: '',
          phone: '',
          sector: '',
          parish: '',
          community: '',
          latitude: '',
          longitude: '',
          location_type: 'field',
          status: 'active',
          notes: ''
        })
        setShowContactForm(false)
        setEditingContactId(null)
        fetchContacts()
        setTimeout(() => setSubmitMessage(null), 5000)
      } else {
        const error = await response.json()
        setSubmitMessage({
          type: 'error',
          text: error.detail || 'Failed to save contact. Please try again.'
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
  }

  const handleEditContact = (contact: Contact) => {
    setContactFormData({
      name: contact.name,
      organization: contact.organization,
      position: contact.position || '',
      email: contact.email || '',
      phone: contact.phone || '',
      sector: contact.sector || '',
      parish: contact.parish || '',
      community: contact.community || '',
      latitude: contact.latitude || '',
      longitude: contact.longitude || '',
      location_type: contact.location_type,
      status: contact.status,
      notes: contact.notes || ''
    })
    setEditingContactId(contact.id)
    setShowContactForm(true)
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
    if (!confirm('Are you sure you want to delete this group?')) return
    
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
          text: 'Group deleted successfully.'
        })
        fetchGroups()
        setTimeout(() => setSubmitMessage(null), 5000)
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Failed to delete group.'
      })
    }
  }

  const handleDeleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          text: 'Contact deleted successfully.'
        })
        fetchContacts()
        setTimeout(() => setSubmitMessage(null), 5000)
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Failed to delete contact.'
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

  const handleCancelContactEdit = () => {
    setEditingContactId(null)
    setShowContactForm(false)
    setContactFormData({
      name: '',
      organization: '',
      position: '',
      email: '',
      phone: '',
      sector: '',
      parish: '',
      community: '',
      latitude: '',
      longitude: '',
      location_type: 'field',
      status: 'active',
      notes: ''
    })
  }

  // Get unique values for filters
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set([
      ...whatsappGroups.map(g => g.sector),
      ...contacts.map(c => c.sector).filter(s => s)
    ]))
    return uniqueSectors.sort()
  }, [whatsappGroups, contacts])

  const parishes = useMemo(() => {
    const uniqueParishes = Array.from(new Set(
      contacts.map(c => c.parish).filter(p => p)
    ))
    return uniqueParishes.sort()
  }, [contacts])

  // Filter groups
  const filteredGroups = useMemo(() => {
    let filtered = whatsappGroups

    if (sectorFilter !== 'all') {
      filtered = filtered.filter(g => g.sector === sectorFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(query) ||
        g.sector.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
      )
    }

    return filtered.sort((a, b) => {
      if (a.sector !== b.sector) {
        return a.sector.localeCompare(b.sector)
      }
      return a.name.localeCompare(b.name)
    })
  }, [whatsappGroups, sectorFilter, searchQuery])

  // Filter contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    if (sectorFilter !== 'all') {
      filtered = filtered.filter(c => c.sector === sectorFilter)
    }

    if (locationTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.location_type === locationTypeFilter)
    }

    if (parishFilter !== 'all') {
      filtered = filtered.filter(c => c.parish === parishFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.organization.toLowerCase().includes(query) ||
        (c.sector && c.sector.toLowerCase().includes(query)) ||
        (c.parish && c.parish.toLowerCase().includes(query)) ||
        (c.community && c.community.toLowerCase().includes(query))
      )
    }

    return filtered.sort((a, b) => a.organization.localeCompare(b.organization))
  }, [contacts, sectorFilter, locationTypeFilter, parishFilter, statusFilter, searchQuery])

  // Pagination
  // const totalPagesGroups = Math.ceil(filteredGroups.length / itemsPerPage)
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredGroups, currentPage, itemsPerPage])

  // const totalPagesContacts = Math.ceil(filteredContacts.length / itemsPerPage)
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredContacts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredContacts, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [sectorFilter, locationTypeFilter, parishFilter, statusFilter, searchQuery, activeTab])

  // Define table columns for groups
  const groupTableColumns = useMemo(() => [
    {
      key: 'name',
      header: 'Group Name',
      render: (group: WhatsAppGroup) => (
        <span className="group-name">{group.name}</span>
      )
    },
    {
      key: 'sector',
      header: 'Sector',
      render: (group: WhatsAppGroup) => (
        <span className="sector-tag">{group.sector}</span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (group: WhatsAppGroup) => (
        <span className="group-description">{group.description}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '200px',
      render: (group: WhatsAppGroup) => (
        <div className="table-actions">
          <a
            href={group.link}
            target="_blank"
            rel="noopener noreferrer"
            className="join-button table-join"
          >
            Join Group ↗
          </a>
          {isAuthenticated && (
            <ActionsDropdown
              actions={[
                {
                  label: 'Edit',
                  icon: <EditIcon />,
                  onClick: () => handleEditGroup(group)
                },
                {
                  label: 'Delete',
                  icon: <DeleteIcon />,
                  onClick: () => handleDeleteGroup(group.id),
                  variant: 'danger'
                }
              ]}
            />
          )}
        </div>
      )
    }
  ], [isAuthenticated])

  // Define table columns for contacts
  const contactTableColumns = useMemo(() => [
    {
      key: 'name',
      header: 'Name',
      render: (contact: Contact) => (
        <span className="contact-name">{contact.name}</span>
      )
    },
    {
      key: 'organization',
      header: 'Organization',
      render: (contact: Contact) => (
        <span className="contact-org">{contact.organization}</span>
      )
    },
    {
      key: 'sector',
      header: 'Sector',
      render: (contact: Contact) => (
        <span className="sector-tag">{contact.sector || 'N/A'}</span>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (contact: Contact) => (
        <span className="contact-location">
          {contact.parish || 'N/A'}
          {contact.community && ` - ${contact.community}`}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (contact: Contact) => (
        <span className={`status-badge ${contact.location_type}`}>
          {contact.location_type}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (contact: Contact) => (
        <span className={`status-badge ${contact.status}`}>
          {contact.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (contact: Contact) => (
        <ActionsDropdown
          actions={[
            {
              label: 'Edit',
              icon: <EditIcon />,
              onClick: () => handleEditContact(contact)
            },
            {
              label: 'Delete',
              icon: <DeleteIcon />,
              onClick: () => handleDeleteContact(contact.id),
              variant: 'danger'
            }
          ]}
        />
      )
    }
  ], [])

  return (
    <div className="contacts-page">
      <h2>Contact Directory</h2>
      <p className="description">Humanitarian contact information and coordination groups</p>
      
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          PowerBI Directory
        </button>
        <button
          className={`tab-button ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          Contact Map
        </button>
        <button
          className={`tab-button ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          WhatsApp Groups
        </button>
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="tab-content">
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
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="tab-content">
          {submitMessage && (
            <div className={`message ${submitMessage.type}`}>
              {submitMessage.text}
            </div>
          )}

          <div className="section-header">
            <div>
              <h3>Contact Directory & Map</h3>
              <p className="section-description">
                View and manage humanitarian contacts by location, sector, and deployment status
              </p>
            </div>
            <button 
              className="add-group-button"
              onClick={() => setShowContactForm(!showContactForm)}
            >
              {showContactForm ? 'Cancel' : '+ Add Contact'}
            </button>
          </div>

          {showContactForm && (
            <div className="add-group-form contact-form">
              <h3>{editingContactId ? 'Edit Contact' : 'Add New Contact'}</h3>
              <form onSubmit={handleSubmitContact}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-name">Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData({...contactFormData, name: e.target.value})}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-organization">Organization *</label>
                    <input
                      id="contact-organization"
                      type="text"
                      required
                      value={contactFormData.organization}
                      onChange={(e) => setContactFormData({...contactFormData, organization: e.target.value})}
                      placeholder="Organization name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-position">Position</label>
                    <input
                      id="contact-position"
                      type="text"
                      value={contactFormData.position}
                      onChange={(e) => setContactFormData({...contactFormData, position: e.target.value})}
                      placeholder="Job title"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-sector">Sector</label>
                    <select
                      id="contact-sector"
                      value={contactFormData.sector}
                      onChange={(e) => setContactFormData({...contactFormData, sector: e.target.value})}
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
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-email">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({...contactFormData, email: e.target.value})}
                      placeholder="email@example.org"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-phone">Phone</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={contactFormData.phone}
                      onChange={(e) => setContactFormData({...contactFormData, phone: e.target.value})}
                      placeholder="+1-876-xxx-xxxx"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-parish">Parish</label>
                    <select
                      id="contact-parish"
                      value={contactFormData.parish}
                      onChange={(e) => setContactFormData({...contactFormData, parish: e.target.value})}
                    >
                      <option value="">Select parish</option>
                      <option value="Kingston">Kingston</option>
                      <option value="St. Andrew">St. Andrew</option>
                      <option value="St. Catherine">St. Catherine</option>
                      <option value="Clarendon">Clarendon</option>
                      <option value="Manchester">Manchester</option>
                      <option value="St. Elizabeth">St. Elizabeth</option>
                      <option value="Westmoreland">Westmoreland</option>
                      <option value="Hanover">Hanover</option>
                      <option value="St. James">St. James</option>
                      <option value="Trelawny">Trelawny</option>
                      <option value="St. Ann">St. Ann</option>
                      <option value="St. Mary">St. Mary</option>
                      <option value="Portland">Portland</option>
                      <option value="St. Thomas">St. Thomas</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-community">Community</label>
                    <input
                      id="contact-community"
                      type="text"
                      value={contactFormData.community}
                      onChange={(e) => setContactFormData({...contactFormData, community: e.target.value})}
                      placeholder="Community or locality"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-latitude">Latitude</label>
                    <input
                      id="contact-latitude"
                      type="text"
                      value={contactFormData.latitude}
                      onChange={(e) => setContactFormData({...contactFormData, latitude: e.target.value})}
                      placeholder="18.xxxx"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-longitude">Longitude</label>
                    <input
                      id="contact-longitude"
                      type="text"
                      value={contactFormData.longitude}
                      onChange={(e) => setContactFormData({...contactFormData, longitude: e.target.value})}
                      placeholder="-77.xxxx"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-location-type">Location Type *</label>
                    <select
                      id="contact-location-type"
                      required
                      value={contactFormData.location_type}
                      onChange={(e) => setContactFormData({...contactFormData, location_type: e.target.value})}
                    >
                      <option value="field">Field</option>
                      <option value="remote">Remote</option>
                      <option value="office">Office</option>
                      <option value="mobile">Mobile</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-status">Status *</label>
                    <select
                      id="contact-status"
                      required
                      value={contactFormData.status}
                      onChange={(e) => setContactFormData({...contactFormData, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="deployed">Deployed</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-notes">Notes</label>
                  <textarea
                    id="contact-notes"
                    value={contactFormData.notes}
                    onChange={(e) => setContactFormData({...contactFormData, notes: e.target.value})}
                    placeholder="Additional information"
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={submitting} className="submit-button">
                    {submitting ? 'Saving...' : editingContactId ? 'Update Contact' : 'Add Contact'}
                  </button>
                  {editingContactId && (
                    <button type="button" onClick={handleCancelContactEdit} className="cancel-button">
                      Cancel
                    </button>
                  )}
                  <p className="form-note">* Required fields</p>
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

              <select 
                value={parishFilter} 
                onChange={(e) => setParishFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Parishes</option>
                {parishes.map(parish => (
                  <option key={parish} value={parish}>{parish}</option>
                ))}
              </select>

              <select 
                value={locationTypeFilter} 
                onChange={(e) => setLocationTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="field">Field</option>
                <option value="remote">Remote</option>
                <option value="office">Office</option>
                <option value="mobile">Mobile</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deployed">Deployed</option>
              </select>

              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="view-toggle">
              <button
                onClick={() => setViewMode('map')}
                className={`view-button ${viewMode === 'map' ? 'active' : ''}`}
                aria-label="Map view"
              >
                Map
              </button>
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
            <div className="loading">Loading contacts...</div>
          ) : (
            <>
              {viewMode === 'map' && (
                <ContactMap 
                  contacts={filteredContacts}
                  geojsonData={parishGeojsonData}
                  mapTitle="Parish Boundaries"
                />
              )}

              {viewMode === 'cards' && (
                <div className="contacts-grid">
                  {paginatedContacts.length > 0 ? (
                    paginatedContacts.map(contact => (
                      <div key={contact.id} className="contact-card">
                        <div className="contact-header">
                          <div>
                            <h4>{contact.name}</h4>
                            <p className="contact-org">{contact.organization}</p>
                            {contact.position && <p className="contact-position">{contact.position}</p>}
                          </div>
                          <ActionsDropdown
                            actions={[
                              {
                                label: 'Edit',
                                icon: <EditIcon />,
                                onClick: () => handleEditContact(contact)
                              },
                              {
                                label: 'Delete',
                                icon: <DeleteIcon />,
                                onClick: () => handleDeleteContact(contact.id),
                                variant: 'danger'
                              }
                            ]}
                          />
                        </div>
                        <div className="contact-details">
                          {contact.sector && <p><strong>Sector:</strong> {contact.sector}</p>}
                          {contact.parish && (
                            <p>
                              <strong>Location:</strong> {contact.parish}
                              {contact.community && ` - ${contact.community}`}
                            </p>
                          )}
                          {contact.email && <p>📧 {contact.email}</p>}
                          {contact.phone && <p>📱 {contact.phone}</p>}
                        </div>
                        <div className="status-badges">
                          <span className={`status-badge ${contact.location_type}`}>
                            {contact.location_type}
                          </span>
                          <span className={`status-badge ${contact.status}`}>
                            {contact.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      No contacts found matching your criteria
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'table' && (
                <PaginatedTable
                  data={filteredContacts}
                  columns={contactTableColumns}
                  itemsPerPage={itemsPerPage}
                  getItemKey={(contact) => contact.id}
                  emptyMessage="No contacts found matching your criteria"
                />
              )}

              <div className="results-count">
                Showing {paginatedContacts.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-{Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
              </div>
            </>
          )}
        </div>
      )}

      {/* WhatsApp Groups Tab - Existing implementation */}
      {activeTab === 'whatsapp' && (
        <div className="tab-content">
          {submitMessage && (
            <div className={`message ${submitMessage.type}`}>
              {submitMessage.text}
            </div>
          )}

          <div className="section-header">
            <div>
              <h3>WhatsApp Coordination Groups</h3>
              <p className="section-description">Join relevant WhatsApp groups for sector coordination and information sharing</p>
            </div>
            <button 
              className="add-group-button"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Group'}
            </button>
          </div>

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
                          {isAuthenticated && (
                            <ActionsDropdown
                              actions={[
                                {
                                  label: 'Edit',
                                  icon: <EditIcon />,
                                  onClick: () => handleEditGroup(group)
                                },
                                {
                                  label: 'Delete',
                                  icon: <DeleteIcon />,
                                  onClick: () => handleDeleteGroup(group.id),
                                  variant: 'danger'
                                }
                              ]}
                            />
                          )}
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
                <PaginatedTable
                  data={filteredGroups}
                  columns={groupTableColumns}
                  itemsPerPage={itemsPerPage}
                  getItemKey={(group) => group.id}
                  emptyMessage="No groups found matching your criteria"
                />
              )}

              <div className="results-count">
                Showing {paginatedGroups.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-{Math.min(currentPage * itemsPerPage, filteredGroups.length)} of {filteredGroups.length} groups
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
