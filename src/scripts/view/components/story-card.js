class StoryCard extends HTMLElement {
  constructor() {
    super();
  }

  set story(story) {
    this._story = story;
    this.render();
  }

  formatDate(dateString) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  render() {
    const { name, photoUrl, description, createdAt, lat, lon } = this._story;
    
    this.innerHTML = `
      <article class="story-card fadeIn">
        <img 
          src="${photoUrl}" 
          alt="Cerita dari ${name}" 
          class="story-image"
          loading="lazy"
        >
        <div class="story-content">
          <h3 class="story-title">${name}</h3>
          <p class="story-description">${description}</p>
          <div class="story-info">
            <div class="story-date">
              <i class="fas fa-calendar-alt" aria-hidden="true"></i>
              <time datetime="${new Date(createdAt).toISOString()}">${this.formatDate(createdAt)}</time>
            </div>
            ${lat && lon ? `
              <div class="story-location" data-lat="${lat}" data-lon="${lon}">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span>Lihat di peta</span>
              </div>
            ` : ''}
          </div>
        </div>
      </article>
    `;

    // Add event listener to location button if present
    const locationBtn = this.querySelector('.story-location');
    if (locationBtn) {
      locationBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const lat = parseFloat(locationBtn.dataset.lat);
        const lon = parseFloat(locationBtn.dataset.lon);
        
        // Dispatch custom event with location data
        const locationEvent = new CustomEvent('story-location-click', {
          detail: { lat, lon, name, description },
          bubbles: true
        });
        
        this.dispatchEvent(locationEvent);
      });
    }
  }
}

// Define the custom element
customElements.define('story-card', StoryCard);

window.StoryCard = StoryCard;