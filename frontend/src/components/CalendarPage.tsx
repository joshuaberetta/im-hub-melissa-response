import './CalendarPage.css'

export default function CalendarPage() {
  const teamupUrl = "https://teamup.com/kskhnc8sqobi5ofk21"

  return (
    <div className="calendar-page">
      <h2>Calendar</h2>
      <p className="description">Humanitarian response calendar and coordination schedule</p>
      
      <div className="embed-container">
        <iframe
          title="Teamup Calendar"
          src={teamupUrl}
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  )
}
