import { useState, useEffect } from 'react'
import './AdminPage.css'

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
}

interface Resource {
  id: number
  title: string
  description?: string
  url: string
  category?: string
  sector?: string
  submitted_by?: string
  email?: string
  approved: boolean
  created_at?: string
}

interface ContactSubmission {
  id: number
  organization: string
  focal_point_name: string
  email: string
  phone?: string
  sector?: string
  role?: string
  location?: string
  additional_info?: string
  approved: boolean
  created_at?: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'groups' | 'resources' | 'contacts'>('groups')
  const [groups, setGroups] = useState<WhatsAppGroup[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    
    try {
      if (activeTab === 'groups') {
        const response = await fetch('/api/whatsapp-groups?approved_only=false&include_deleted=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setGroups(data)
        }
      } else if (activeTab === 'resources') {
        const response = await fetch('/api/resources-db?approved_only=false', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setResources(data)
        }
      } else if (activeTab === 'contacts') {
        const response = await fetch('/api/contact-submissions?approved_only=false', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setContacts(data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('error', 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const approveGroup = async (id: number) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/whatsapp-groups/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        showMessage('success', 'Group approved successfully')
        fetchData()
      } else {
        showMessage('error', 'Failed to approve group')
      }
    } catch (error) {
      showMessage('error', 'Network error')
    }
  }

  const deleteGroup = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this group? This cannot be undone.')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/whatsapp-groups/${id}/permanent`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        showMessage('success', 'Group permanently deleted')
        fetchData()
      } else {
        showMessage('error', 'Failed to delete group')
      }
    } catch (error) {
      showMessage('error', 'Network error')
    }
  }

  const restoreGroup = async (id: number) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/whatsapp-groups/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        showMessage('success', 'Group restored successfully')
        fetchData()
      } else {
        showMessage('error', 'Failed to restore group')
      }
    } catch (error) {
      showMessage('error', 'Network error')
    }
  }

  const approveResource = async (id: number) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/resources-db/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        showMessage('success', 'Resource approved successfully')
        fetchData()
      } else {
        showMessage('error', 'Failed to approve resource')
      }
    } catch (error) {
      showMessage('error', 'Network error')
    }
  }

  const deleteResource = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/resources-db/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        showMessage('success', 'Resource deleted successfully')
        fetchData()
      } else {
        showMessage('error', 'Failed to delete resource')
      }
    } catch (error) {
      showMessage('error', 'Network error')
    }
  }

  const approveContact = async (id: number) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/contact-submissions/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        showMessage('success', 'Contact approved successfully')
        fetchData()
      } else {
        showMessage('error', 'Failed to approve contact')
      }
    } catch (error) {
      showMessage('error', 'Network error')
    }
  }

  const deleteContact = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/contact-submissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        showMessage('success', 'Contact deleted successfully')
        fetchData()
      } else {
        showMessage('error', 'Failed to delete contact')
      }
    } catch (error) {
      showMessage('error', 'Network error')
    }
  }

  const pendingGroups = groups.filter(g => !g.approved && !g.deleted)
  const approvedGroups = groups.filter(g => g.approved && !g.deleted)
  const deletedGroups = groups.filter(g => g.deleted)
  const pendingResources = resources.filter(r => !r.approved)
  const approvedResources = resources.filter(r => r.approved)
  const pendingContacts = contacts.filter(c => !c.approved)
  const approvedContacts = contacts.filter(c => c.approved)

  return (
    <div className="admin-page">
      <h2>Admin Panel</h2>
      <p className="description">Manage user-submitted content and moderation</p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          WhatsApp Groups
          {pendingGroups.length > 0 && <span className="badge">{pendingGroups.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
          {pendingResources.length > 0 && <span className="badge">{pendingResources.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          Contact Submissions
          {pendingContacts.length > 0 && <span className="badge">{pendingContacts.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="tab-content">
          {activeTab === 'groups' && (
            <div className="groups-section">
              <h3>Pending Approval ({pendingGroups.length})</h3>
              {pendingGroups.length === 0 ? (
                <p className="no-items">No pending groups</p>
              ) : (
                <div className="items-list">
                  {pendingGroups.map(group => (
                    <div key={group.id} className="item-card pending">
                      <div className="item-header">
                        <h4>{group.name}</h4>
                        <span className="sector-tag">{group.sector}</span>
                      </div>
                      <p className="item-description">{group.description}</p>
                      <div className="item-details">
                        <p><strong>Link:</strong> <a href={group.link} target="_blank" rel="noopener noreferrer">{group.link}</a></p>
                        {group.contact_name && <p><strong>Contact:</strong> {group.contact_name}</p>}
                        {group.contact_email && <p><strong>Email:</strong> {group.contact_email}</p>}
                        {group.created_at && <p><strong>Submitted:</strong> {new Date(group.created_at).toLocaleString()}</p>}
                      </div>
                      <div className="item-actions">
                        <button className="approve-btn" onClick={() => approveGroup(group.id)}>✓ Approve</button>
                        <button className="delete-btn" onClick={() => deleteGroup(group.id)}>✗ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="approved-header">Approved ({approvedGroups.length})</h3>
              {approvedGroups.length === 0 ? (
                <p className="no-items">No approved groups</p>
              ) : (
                <div className="items-list">
                  {approvedGroups.map(group => (
                    <div key={group.id} className="item-card approved">
                      <div className="item-header">
                        <h4>{group.name}</h4>
                        <span className="sector-tag">{group.sector}</span>
                      </div>
                      <p className="item-description">{group.description}</p>
                      <div className="item-actions">
                        <button className="delete-btn" onClick={() => deleteGroup(group.id)}>✗ Permanent Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="deleted-header">Deleted - Pending Permanent Removal ({deletedGroups.length})</h3>
              {deletedGroups.length === 0 ? (
                <p className="no-items">No deleted groups pending removal</p>
              ) : (
                <div className="items-list">
                  {deletedGroups.map(group => (
                    <div key={group.id} className="item-card deleted">
                      <div className="item-header">
                        <h4>{group.name}</h4>
                        <span className="sector-tag">{group.sector}</span>
                      </div>
                      <p className="item-description">{group.description}</p>
                      <div className="item-details">
                        <p><strong>Link:</strong> <a href={group.link} target="_blank" rel="noopener noreferrer">{group.link}</a></p>
                        {group.contact_name && <p><strong>Contact:</strong> {group.contact_name}</p>}
                        {group.contact_email && <p><strong>Email:</strong> {group.contact_email}</p>}
                      </div>
                      <div className="item-actions">
                        <button className="restore-btn" onClick={() => restoreGroup(group.id)}>↺ Restore</button>
                        <button className="delete-btn" onClick={() => deleteGroup(group.id)}>✗ Permanent Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="resources-section">
              <h3>Pending Approval ({pendingResources.length})</h3>
              {pendingResources.length === 0 ? (
                <p className="no-items">No pending resources</p>
              ) : (
                <div className="items-list">
                  {pendingResources.map(resource => (
                    <div key={resource.id} className="item-card pending">
                      <div className="item-header">
                        <h4>{resource.title}</h4>
                        {resource.category && <span className="category-tag">{resource.category}</span>}
                      </div>
                      {resource.description && <p className="item-description">{resource.description}</p>}
                      <div className="item-details">
                        <p><strong>URL:</strong> <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a></p>
                        {resource.sector && <p><strong>Sector:</strong> {resource.sector}</p>}
                        {resource.submitted_by && <p><strong>Submitted by:</strong> {resource.submitted_by}</p>}
                        {resource.email && <p><strong>Email:</strong> {resource.email}</p>}
                        {resource.created_at && <p><strong>Submitted:</strong> {new Date(resource.created_at).toLocaleString()}</p>}
                      </div>
                      <div className="item-actions">
                        <button className="approve-btn" onClick={() => approveResource(resource.id)}>✓ Approve</button>
                        <button className="delete-btn" onClick={() => deleteResource(resource.id)}>✗ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="approved-header">Approved ({approvedResources.length})</h3>
              {approvedResources.length === 0 ? (
                <p className="no-items">No approved resources</p>
              ) : (
                <div className="items-list">
                  {approvedResources.map(resource => (
                    <div key={resource.id} className="item-card approved">
                      <div className="item-header">
                        <h4>{resource.title}</h4>
                        {resource.category && <span className="category-tag">{resource.category}</span>}
                      </div>
                      {resource.description && <p className="item-description">{resource.description}</p>}
                      <div className="item-actions">
                        <button className="delete-btn" onClick={() => deleteResource(resource.id)}>✗ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="contacts-section">
              <h3>Pending Approval ({pendingContacts.length})</h3>
              {pendingContacts.length === 0 ? (
                <p className="no-items">No pending contact submissions</p>
              ) : (
                <div className="items-list">
                  {pendingContacts.map(contact => (
                    <div key={contact.id} className="item-card pending">
                      <div className="item-header">
                        <h4>{contact.focal_point_name}</h4>
                        <span className="org-tag">{contact.organization}</span>
                      </div>
                      <div className="item-details">
                        <p><strong>Email:</strong> {contact.email}</p>
                        {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
                        {contact.sector && <p><strong>Sector:</strong> {contact.sector}</p>}
                        {contact.role && <p><strong>Role:</strong> {contact.role}</p>}
                        {contact.location && <p><strong>Location:</strong> {contact.location}</p>}
                        {contact.additional_info && <p><strong>Additional Info:</strong> {contact.additional_info}</p>}
                        {contact.created_at && <p><strong>Submitted:</strong> {new Date(contact.created_at).toLocaleString()}</p>}
                      </div>
                      <div className="item-actions">
                        <button className="approve-btn" onClick={() => approveContact(contact.id)}>✓ Approve</button>
                        <button className="delete-btn" onClick={() => deleteContact(contact.id)}>✗ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="approved-header">Approved ({approvedContacts.length})</h3>
              {approvedContacts.length === 0 ? (
                <p className="no-items">No approved contact submissions</p>
              ) : (
                <div className="items-list">
                  {approvedContacts.map(contact => (
                    <div key={contact.id} className="item-card approved">
                      <div className="item-header">
                        <h4>{contact.focal_point_name}</h4>
                        <span className="org-tag">{contact.organization}</span>
                      </div>
                      <div className="item-details">
                        <p><strong>Email:</strong> {contact.email}</p>
                        {contact.sector && <p><strong>Sector:</strong> {contact.sector}</p>}
                      </div>
                      <div className="item-actions">
                        <button className="delete-btn" onClick={() => deleteContact(contact.id)}>✗ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
