// src/scripts/view/pages/favorites-view.js
// Favorites View - mengikuti pola view yang sudah ada

class FavoritesView {
  constructor() {
    this.container = document.querySelector('#mainContent');
    this.presenter = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    console.log('FavoritesView render called');
    
    this.container.innerHTML = `
      <section class="favorites-page">
        <div class="container">
          <header class="page-header">
            <h1><i class="fas fa-heart"></i> Cerita Favorit Saya</h1>
            <p>Koleksi cerita-cerita yang telah Anda simpan</p>
          </header>

          <div class="favorites-stats" id="favoritesStats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-heart"></i>
              </div>
              <div class="stat-info">
                <span class="stat-number" id="favoritesCount">0</span>
                <span class="stat-label">Cerita Tersimpan</span>
              </div>
            </div>
          </div>

          <div class="favorites-actions">
            <button class="btn btn-secondary" id="exportBtn">
              <i class="fas fa-download"></i>
              Export Data
            </button>
            <button class="btn btn-danger" id="clearAllBtn">
              <i class="fas fa-trash"></i>
              Hapus Semua
            </button>
          </div>

          <div class="favorites-content">
            <div id="favoritesContainer" class="favorites-grid">
              <div class="loading-container" id="loadingIndicator">
                <div class="loading-spinner"></div>
                <p>Memuat favorit...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // Add styles
    this._addFavoritesStyles();
    
    // Setup event listeners
    this._setupEventListeners();
    
    // Show loading
    this.showLoading();
  }

  _addFavoritesStyles() {
    if (document.getElementById('favoritesPageStyles')) return;

    const style = document.createElement('style');
    style.id = 'favoritesPageStyles';
    style.textContent = `
      .favorites-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem 0;
      }

      .page-header {
        text-align: center;
        color: white;
        margin-bottom: 2rem;
      }

      .page-header h1 {
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
      }

      .page-header i {
        color: #ff6b6b;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      .page-header p {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }

      .favorites-stats {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 1.5rem 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        min-width: 200px;
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .stat-number {
        font-size: 2rem;
        font-weight: 700;
        color: #333;
        line-height: 1;
      }

      .stat-label {
        color: #666;
        font-size: 0.9rem;
        margin-top: 0.25rem;
      }

      .favorites-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .favorites-actions .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .btn-secondary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-danger {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
      }

      .btn-danger:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
      }

      .favorites-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        min-height: 400px;
      }

      .favorites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .favorite-story-card {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        position: relative;
      }

      .favorite-story-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      }

      .story-image-container {
        position: relative;
        height: 200px;
        overflow: hidden;
      }

      .story-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .favorite-story-card:hover .story-image {
        transform: scale(1.05);
      }

      .favorite-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        z-index: 2;
        box-shadow: 0 2px 10px rgba(255, 107, 107, 0.3);
      }

      .story-content {
        padding: 1.5rem;
      }

      .story-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
        margin: 0 0 0.5rem 0;
        line-height: 1.3;
      }

      .story-description {
        color: #666;
        line-height: 1.5;
        margin: 0 0 1rem 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .story-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        color: #999;
        margin-bottom: 1rem;
      }

      .story-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: space-between;
      }

      .story-actions .btn {
        flex: 1;
        padding: 0.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
      }

      .btn-view-map {
        background: #28a745;
        color: white;
      }

      .btn-view-map:hover {
        background: #218838;
      }

      .btn-remove {
        background: #dc3545;
        color: white;
      }

      .btn-remove:hover {
        background: #c82333;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
        grid-column: 1 / -1;
      }

      .empty-state i {
        font-size: 4rem;
        color: #ddd;
        margin-bottom: 1rem;
        display: block;
      }

      .empty-state h3 {
        margin: 0 0 1rem 0;
        color: #333;
        font-size: 1.5rem;
      }

      .empty-state p {
        margin-bottom: 2rem;
        font-size: 1.1rem;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.6;
      }

      .empty-state .btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 25px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .empty-state .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        grid-column: 1 / -1;
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .favorites-page {
          padding: 1rem 0;
        }

        .page-header h1 {
          font-size: 2rem;
          flex-direction: column;
          gap: 0.5rem;
        }

        .favorites-actions {
          flex-direction: column;
          align-items: center;
        }

        .favorites-actions .btn {
          width: 100%;
          max-width: 200px;
        }

        .favorites-content {
          padding: 1rem;
        }

        .favorites-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .story-actions {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }

  _setupEventListeners() {
    const exportBtn = document.getElementById('exportBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (this.presenter) {
          this.presenter.exportFavorites();
        }
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (this.presenter) {
          this.presenter.clearAllFavorites();
        }
      });
    }
  }

  // Render daftar favorit
  renderFavorites(favorites) {
    console.log('FavoritesView: Rendering favorites', favorites.length);
    
    this.hideLoading();
    this.updateFavoritesCount(favorites.length);

    const container = document.getElementById('favoritesContainer');
    
    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-heart-broken"></i>
          <h3>Belum Ada Favorit</h3>
          <p>Mulai menambahkan cerita ke favorit dengan menekan tombol hati pada cerita yang Anda sukai.</p>
          <a href="#/" class="btn">
            <i class="fas fa-home"></i>
            Jelajahi Cerita
          </a>
        </div>
      `;
      return;
    }

    // Render favorite cards
    container.innerHTML = favorites.map(story => this._createFavoriteCard(story)).join('');
    
    // Setup card event listeners
    this._setupCardEventListeners();
  }

  _createFavoriteCard(story) {
    const formattedDate = this._formatDate(story.createdAt);
    const addedDate = this._formatDate(story.addedToFavoritesAt);
    
    return `
      <article class="favorite-story-card" data-story-id="${story.id}">
        <div class="story-image-container">
          <img class="story-image" src="${story.photoUrl}" alt="${story.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
          <div class="favorite-badge">
            <i class="fas fa-heart"></i>
          </div>
        </div>
        <div class="story-content">
          <h3 class="story-title">${story.name}</h3>
          <div class="story-description">${story.description}</div>
          <div class="story-meta">
            <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
            <span><i class="fas fa-heart"></i> ${addedDate}</span>
          </div>
          <div class="story-actions">
            ${story.lat && story.lon ? `
              <button class="btn btn-view-map" data-lat="${story.lat}" data-lon="${story.lon}">
                <i class="fas fa-map-pin"></i>
                Lihat di Peta
              </button>
            ` : ''}
            <button class="btn btn-remove" data-story-id="${story.id}">
              <i class="fas fa-trash"></i>
              Hapus
            </button>
          </div>
        </div>
      </article>
    `;
  }

  _setupCardEventListeners() {
    // Remove buttons
    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const storyId = e.target.closest('.btn-remove').getAttribute('data-story-id');
        if (this.presenter && confirm('Apakah Anda yakin ingin menghapus cerita ini dari favorit?')) {
          this.presenter.removeFavorite(storyId);
        }
      });
    });

    // View on map buttons
    document.querySelectorAll('.btn-view-map').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lat = e.target.closest('.btn-view-map').getAttribute('data-lat');
        const lon = e.target.closest('.btn-view-map').getAttribute('data-lon');
        if (window.router && lat && lon) {
          window.router.navigateTo(`/peta?lat=${lat}&lon=${lon}`);
        }
      });
    });
  }

  updateFavoritesCount(count) {
    const countElement = document.getElementById('favoritesCount');
    if (countElement) {
      countElement.textContent = count;
    }
  }

  showLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }
  }

  hideLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  }

  showError(message) {
    this.hideLoading();
    const container = document.getElementById('favoritesContainer');
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Terjadi Kesalahan</h3>
        <p>${message}</p>
        <button class="btn" onclick="window.location.reload()">
          <i class="fas fa-redo"></i>
          Coba Lagi
        </button>
      </div>
    `;
  }

  showSuccess(message) {
    this._showToast(message, 'success');
  }

  _showToast(message, type = 'info') {
    const existing = document.querySelector('.favorites-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'favorites-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease;
    `;
    
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8'
    };
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  }

  _formatDate(dateString) {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Method untuk reload data
  reloadFavorites() {
    this.showLoading();
    if (this.presenter) {
      this.presenter.loadFavorites();
    }
  }
}
window.FavoritesView = FavoritesView;
console.log('FavoritesView exported to window');