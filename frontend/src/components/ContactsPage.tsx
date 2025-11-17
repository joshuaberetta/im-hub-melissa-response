import './ContactsPage.css'

export default function ContactsPage() {
  const contactDashboardUrl = "https://app.powerbi.com/view?r=eyJrIjoiYmNiYmMwN2ItYmMwMy00M2Y4LWEzODgtMDNkYjk3YWM0ZWJjIiwidCI6IjBmOWUzNWRiLTU0NGYtNGY2MC1iZGNjLTVlYTQxNmU2ZGM3MCIsImMiOjh9"
  const registerFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfDz9Z3Uvs6Am4yIH-ik3bJM6Lv9VEYu6zZjUjCdw6p55pnhA/viewform"

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
    </div>
  )
}
