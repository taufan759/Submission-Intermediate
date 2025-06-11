class MapView {
  constructor() {
    this._container = document.querySelector('#mainContent');
    this._map = null;
    this._markers = [];
    this._presenter = null;
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }

  render() {
    console.log('Rendering map page');
    
    // Clear existing content
    this._container.innerHTML = '';
    
    // Create map container
    this._container.innerHTML = `
      <section class="map-section view-transition" style="margin-top: 100px;">
        <div class="container">
          <h2 class="section-title">Peta Cerita</h2>
          <div id="storyMap" style="height: 500px;"></div>
        </div>
      </section>
    `;
    
    // Initialize map with a slight delay to ensure DOM is ready
    setTimeout(() => {
      this._initMap();
    }, 100);
  }
  
  _initMap() {
    console.log('Initializing map');
    try {
      this._map = L.map('storyMap').setView([-2.5489, 118.0149], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this._map);
      
      // Request stories from the presenter
      if (this._presenter) {
        this._presenter.loadStoriesForMap();
      } else {
        console.error('MapView: Presenter not set');
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }
  
  displayStories(stories) {
    console.log('MapView: Displaying stories on map');
    if (!this._map) {
      console.error('Map not initialized');
      return;
    }
    
    // Clear existing markers
    this._clearMarkers();
    
    // Add new markers
    stories.filter(story => story.lat && story.lon).forEach(story => {
      const marker = L.marker([story.lat, story.lon])
        .addTo(this._map)
        .bindPopup(`
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <img src="${story.photoUrl}" alt="${story.name}" style="width:100%;max-width:200px;">
        `);
      
      this._markers.push(marker);
    });
  }
  
  _clearMarkers() {
    this._markers.forEach(marker => {
      if (this._map) {
        this._map.removeLayer(marker);
      }
    });
    this._markers = [];
  }
  
  showError(message) {
    console.error('Map error:', message);
    
    const mapContainer = document.getElementById('storyMap');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="error-container">
          <p>Error: ${message}</p>
          <button id="retryMapBtn" class="btn btn-primary">Coba Lagi</button>
        </div>
      `;
      
      const retryButton = document.getElementById('retryMapBtn');
      if (retryButton && this._presenter) {
        retryButton.addEventListener('click', () => {
          this.render();
        });
      }
    }
  }
  
  destroy() {
    // Clean up map resources
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}
window.MapView = MapView;
console.log('MapView exported to window');