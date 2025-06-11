class HomeView {
  constructor() {
    this.container = document.querySelector('#mainContent');
    this.presenter = null;
    this.map = null;
    this.markers = [];
    this.storiesContainer = null;
    this.loadingIndicator = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
    console.log('HomeView: Presenter set successfully');
  }

  render() {
    console.log('HomeView render called');
    document.title = 'PetaBicara - Cerita Bermakna';
    
    // Clear any existing content
    this.container.innerHTML = '';
    
    this.container.innerHTML = `
      <section class="hero-section">
        <div class="container">
          <h2 class="main-title">Peta Bicara, Cerita Bermakna</h2>
          <p class="main-description">
            Dengarkan kisah-kisah yang lahir dari berbagai penjuru Indonesia dan negara lainnya. 
            Setiap titik di peta menyimpan sepotong harapan, kenangan, dan suara hati yang tak ingin dilupakan. 
            "Karena setiap tempat punya cerita dan setiap cerita layak untuk didengar."
          </p>
        </div>
      </section>

      <section class="stories-section">
        <div class="container">
          <h2 class="section-title">Cerita Terbaru</h2>
          <div class="stories-grid" id="storiesContainer">
            <div class="loading-indicator" id="loadingIndicator">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>Memuat cerita...</span>
            </div>
          </div>
        </div>
      </section>

      <section class="how-it-works">
        <div class="container">
          <h2 class="section-title">Cara Kerjanya</h2>
          <div class="steps-container">
            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-user-plus"></i>
              </div>
              <h3>1. Daftar Akun</h3>
              <p>Buat akun gratis untuk mulai berbagi cerita Anda</p>
            </div>
            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-map-pin"></i>
              </div>
              <h3>2. Pilih Lokasi</h3>
              <p>Tandai lokasi cerita Anda di peta interaktif</p>
            </div>
            <div class="step-card">
              <div class="step-icon">
                <i class="fas fa-book-open"></i>
              </div>
              <h3>3. Bagikan Cerita</h3>
              <p>Tulis dan unggah cerita Anda dengan foto</p>
            </div>
          </div>
        </div>
      </section>

      <section class="testimonials">
        <div class="container">
          <h2 class="section-title">Kata Pengguna</h2>
          <div class="testimonial-carousel">
            <div class="testimonial-card">
              <div class="testimonial-content">
                <p>"PetaBicara membantu saya menemukan tempat-tempat tersembunyi yang tidak pernah saya ketahui sebelumnya!"</p>
              </div>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="author-info">
                  <h4>Muhammad Taufan Akbar</h4>
                  <p>Petualang</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // Add styles for components
    this._addStyles();
    
    // Initialize elements
    this.storiesContainer = document.getElementById('storiesContainer');
    this.loadingIndicator = document.getElementById('loadingIndicator');
    
    // Ensure elements are found
    if (!this.storiesContainer) {
      console.error('storiesContainer element not found');
    }
    
    if (!this.loadingIndicator) {
      console.error('loadingIndicator element not found');
    }
    
    // Show loading state
    this.showLoading();
    
    // Request stories from presenter with a slight delay to ensure DOM is ready
    setTimeout(() => {
      if (this.presenter) {
        console.log('HomeView: Requesting stories from presenter');
        this.presenter.loadStories();
      } else {
        console.error('Presenter not set in HomeView');
        this.renderError('Error: Unable to load stories. Presenter not initialized.');
      }
    }, 100);
  }

  // Method to display loaded stories
  renderStories(stories) {
    console.log('HomeView.renderStories called with', stories ? stories.length : 0, 'stories');
    
    // Hide loading indicator
    this.hideLoading();
    
    // Check if stories exist
    if (!stories || stories.length === 0) {
      this.renderEmptyState();
      return;
    }
    
    // Clear container
    if (this.storiesContainer) {
      this.storiesContainer.innerHTML = '';
      
      // Render each story
      stories.forEach(story => {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card';
        storyCard.innerHTML = `
          <div class="story-image">
            <img src="${story.photoUrl}" alt="Cerita dari ${story.name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
          </div>
          <div class="story-content">
            <h3>${story.name}</h3>
            <p>${story.description ? story.description.substring(0, 80) + (story.description.length > 80 ? '...' : '') : 'Tidak ada deskripsi'}</p>
            <div class="story-meta">
              <div class="author">
                <i class="fas fa-user"></i> ${story.name}
              </div>
              <div class="date">
                <i class="fas fa-calendar"></i> ${this._formatDate(story.createdAt)}
              </div>
            </div>
          </div>
        `;
        this.storiesContainer.appendChild(storyCard);
      });
    } else {
      console.error('storiesContainer is not defined');
    }
  }
  
  // Method to display empty state when no stories exist
  renderEmptyState() {
    console.log('HomeView.renderEmptyState called');
    if (this.storiesContainer) {
      this.storiesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-book-open fa-3x" aria-hidden="true"></i>
          <h3>Belum ada cerita</h3>
          <p>Jadilah yang pertama berbagi cerita menarik!</p>
          <a href="#/tambah" class="btn btn-primary">
            <i class="fas fa-plus" aria-hidden="true"></i> Tambah Cerita
          </a>
        </div>
      `;
    }
  }
  
  // Method to render error message with retry button
  renderError(message) {
    console.log('HomeView.renderError called with message:', message);
    this.hideLoading();
    
    if (this.storiesContainer) {
      this.storiesContainer.innerHTML = `
        <div class="error-message">
          <p>Error: ${message || 'Unable to load stories'}</p>
          <button id="retryButton" class="btn btn-primary">Coba Lagi</button>
        </div>
      `;
      
      // Add retry button event listener
      const retryButton = document.getElementById('retryButton');
      if (retryButton) {
        retryButton.addEventListener('click', () => {
          console.log('Retry button clicked');
          this.showLoading();
          if (this.presenter) {
            this.presenter.loadStories();
          }
        });
      }
    }
  }

  _formatDate(dateString) {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  showLoading() {
    console.log('HomeView.showLoading called');
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'flex';
    }
    
    if (this.storiesContainer) {
      // Clear any previous error messages
      const errorMessage = this.storiesContainer.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.remove();
      }
    }
  }

  hideLoading() {
    console.log('HomeView.hideLoading called');
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
  }

  _addStyles() {
    if (!document.getElementById('homeViewStyles')) {
      const style = document.createElement('style');
      style.id = 'homeViewStyles';
      style.textContent = `
        /* Hero Section */
        .hero-section {
          padding: 3rem 0;
          text-align: center;
          background-color: #f8f9fa;
          border-radius: 10px;
          margin-bottom: 2rem;
        }
        
        .main-title {
          font-size: 2rem;
          color: var(--color-primary, #4299e1);
          margin-bottom: 1rem;
        }
        
        .main-description {
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
          color: #4a5568;
        }
        
        /* Stories Grid */
        .stories-section {
          margin-bottom: 3rem;
        }
        
        .stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .story-card {
          background-color: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .story-card:hover {
          transform: translateY(-5px);
        }
        
        .story-image {
          height: 200px;
          overflow: hidden;
        }
        
        .story-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .story-content {
          padding: 1.5rem;
        }
        
        .story-content h3 {
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }
        
        .story-content p {
          color: #4a5568;
          margin-bottom: 1rem;
        }
        
        .story-meta {
          display: flex;
          justify-content: space-between;
          color: #718096;
          font-size: 0.875rem;
        }
        
        /* How It Works */
        .how-it-works {
          padding: 3rem 0;
          background-color: #f8f9fa;
          margin-bottom: 3rem;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 2rem;
          color: var(--color-primary, #4299e1);
          position: relative;
          font-size: 1.75rem;
        }
        
        .section-title::after {
          content: '';
          display: block;
          width: 50px;
          height: 3px;
          background: var(--color-accent, #f56565);
          margin: 0.5rem auto 0;
        }
        
        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .step-card {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .step-card:hover {
          transform: translateY(-5px);
        }
        
        .step-icon {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(66, 153, 225, 0.1);
          color: var(--color-primary, #4299e1);
          border-radius: 50%;
          font-size: 1.5rem;
          margin: 0 auto 1rem;
        }
        
        /* Map Section */
        .map-section {
          margin-bottom: 3rem;
        }
        
        .story-map {
          height: 500px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        /* Testimonials */
        .testimonials {
          padding: 3rem 0;
          background-color: #f8f9fa;
          margin-bottom: 3rem;
        }
        
        .testimonial-carousel {
          max-width: 700px;
          margin: 0 auto;
        }
        
        .testimonial-card {
          background-color: white;
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .testimonial-content {
          font-style: italic;
          margin-bottom: 1.5rem;
          color: #4a5568;
        }
        
        .testimonial-author {
          display: flex;
          align-items: center;
        }
        
        .author-avatar {
          font-size: 2.5rem;
          color: #a0aec0;
          margin-right: 1rem;
        }
        
        .author-info h4 {
          margin: 0;
          color: #2d3748;
        }
        
        .author-info p {
          margin: 0;
          color: #718096;
          font-size: 0.875rem;
        }
        
        /* Loading Indicator */
        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          grid-column: 1 / -1;
        }
        
        .loading-indicator i {
          font-size: 2rem;
          color: var(--color-primary, #4299e1);
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          grid-column: 1 / -1;
        }
        
        /* Error Message */
        .error-message {
          text-align: center;
          padding: 2rem;
          background-color: #fff3f3;
          border-radius: 10px;
          border: 1px solid #ffcccc;
          margin: 1rem 0;
          grid-column: 1 / -1;
        }
        
        .error-message p {
          color: #e53e3e;
          margin-bottom: 1rem;
        }
        
        /* Map Popup */
        .map-popup {
          max-width: 250px;
        }
        
        .map-popup h3 {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .map-popup img {
          border-radius: 5px;
          margin-top: 0.5rem;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .main-title {
            font-size: 1.5rem;
          }
          
          .stories-grid {
            grid-template-columns: 1fr;
          }
          
          .story-map {
            height: 300px;
          }
          
          .step-icon {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

window.HomeView = HomeView;
console.log('HomeView exported to window');