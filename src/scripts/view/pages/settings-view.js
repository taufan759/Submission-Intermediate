// src/scripts/view/pages/settings-view.js - Simple settings view

class SettingsView {
  constructor() {
    this.container = document.querySelector('#mainContent');
    this.presenter = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    console.log('SettingsView render called');
    
    this.container.innerHTML = `
      <section class="settings-page">
        <div class="container">
          <header class="page-header">
            <h1><i class="fas fa-cog"></i> Pengaturan</h1>
            <p>Kelola preferensi dan notifikasi aplikasi</p>
          </header>

          <div class="settings-content">
            <!-- Push Notification Section -->
            <div class="settings-section">
              <h2><i class="fas fa-bell"></i> Push Notifikasi</h2>
              <div id="notificationSettings">
                <!-- Will be populated by notification UI helper -->
              </div>
            </div>

            <!-- Data Management Section -->
            <div class="settings-section">
              <h2><i class="fas fa-database"></i> Data Lokal</h2>
              <div class="data-management">
                <div class="data-stats" id="dataStats">
                  <div class="loading-spinner"></div>
                  <span>Memuat data statistik...</span>
                </div>
                
                <div class="data-actions">
                  <button class="btn btn-secondary" id="exportFavoritesBtn">
                    <i class="fas fa-download"></i>
                    Export Favorit
                  </button>
                  <button class="btn btn-danger" id="clearDataBtn">
                    <i class="fas fa-trash"></i>
                    Hapus Semua Data
                  </button>
                </div>
              </div>
            </div>

            <!-- App Info Section -->
            <div class="settings-section">
              <h2><i class="fas fa-info-circle"></i> Informasi Aplikasi</h2>
              <div class="app-info">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Versi:</span>
                    <span class="value">1.2.0</span>
                  </div>
                  <div class="info-item">
                    <span class="label">PWA Status:</span>
                    <span class="value" id="pwaStatus">Checking...</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Service Worker:</span>
                    <span class="value" id="swStatus">Checking...</span>
                  </div>
                  <div class="info-item">
                    <span class="label">IndexedDB:</span>
                    <span class="value" id="dbStatus">Checking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // Add styles
    this._addSettingsStyles();
    
    // Setup events
    this._setupEvents();
    
    // Initialize features
    this._initializeFeatures();
  }

  _addSettingsStyles() {
    if (document.getElementById('settingsPageStyles')) return;

    const style = document.createElement('style');
    style.id = 'settingsPageStyles';
    style.textContent = `
      .settings-page {
        min-height: 100vh;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 2rem 0;
      }

      .settings-page .page-header {
        text-align: center;
        color: white;
        margin-bottom: 2rem;
      }

      .settings-page .page-header h1 {
        font-size: 2.5rem;
        margin: 0 0 0.5rem 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
      }

      .settings-page .page-header p {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }

      .settings-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .settings-section {
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #eee;
      }

      .settings-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .settings-section h2 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0 0 1.5rem 0;
        color: #333;
        font-size: 1.5rem;
      }

      .settings-section h2 i {
        color: #f5576c;
      }

      .data-management {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .data-stats {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 12px;
        text-align: center;
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 0.5rem;
      }

      .data-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .data-actions .btn {
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

      .app-info {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 12px;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: white;
        border-radius: 8px;
        border-left: 4px solid #f5576c;
      }

      .info-item .label {
        font-weight: 500;
        color: #333;
      }

      .info-item .value {
        color: #666;
        font-family: monospace;
      }

      .loading-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #f5576c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @media (max-width: 768px) {
        .settings-page {
          padding: 1rem 0;
        }

        .settings-page .page-header h1 {
          font-size: 2rem;
          flex-direction: column;
          gap: 0.5rem;
        }

        .settings-content {
          padding: 1.5rem;
        }

        .data-actions {
          flex-direction: column;
          align-items: center;
        }

        .data-actions .btn {
          width: 100%;
          max-width: 250px;
          justify-content: center;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  _setupEvents() {
    const exportBtn = document.getElementById('exportFavoritesBtn');
    const clearBtn = document.getElementById('clearDataBtn');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (this.presenter) {
          this.presenter.exportFavorites();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.presenter) {
          this.presenter.clearAllData();
        }
      });
    }
  }

  _initializeFeatures() {
    // Initialize notification settings UI
    this._initNotificationSettings();
    
    // Load data stats
    this._loadDataStats();
    
    // Load app status
    this._loadAppStatus();
  }

  _initNotificationSettings() {
    const container = document.getElementById('notificationSettings');
    if (container && window.notificationUIHelper) {
      window.notificationUIHelper.createNotificationSettingsUI(container);
    } else {
      container.innerHTML = `
        <div class="notification-placeholder">
          <p><i class="fas fa-info-circle"></i> Push notification features sedang dimuat...</p>
        </div>
      `;
    }
  }

  async _loadDataStats() {
    const statsContainer = document.getElementById('dataStats');
    
    try {
      if (window.indexedDBHelper) {
        const dbInfo = await window.indexedDBHelper.getDatabaseInfo();
        
        statsContainer.innerHTML = `
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Favorit:</span>
              <span class="stat-value">${dbInfo.stores.favorites?.count || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Offline Stories:</span>
              <span class="stat-value">${dbInfo.stores.offlineStories?.count || 0}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Settings:</span>
              <span class="stat-value">${dbInfo.stores.settings?.count || 0}</span>
            </div>
          </div>
        `;
      } else {
        throw new Error('IndexedDB helper not available');
      }
    } catch (error) {
      console.error('Error loading data stats:', error);
      statsContainer.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <span>Gagal memuat statistik data</span>
        </div>
      `;
    }
  }

  async _loadAppStatus() {
    // PWA Status
    const pwaStatus = document.getElementById('pwaStatus');
    if (window.swRegister) {
      const status = await window.swRegister.getStatus();
      pwaStatus.textContent = status.isInstalled ? 'Installed' : 'Not Installed';
    } else {
      pwaStatus.textContent = 'Unknown';
    }

    // Service Worker Status
    const swStatus = document.getElementById('swStatus');
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      swStatus.textContent = registration ? 'Active' : 'Inactive';
    } else {
      swStatus.textContent = 'Not Supported';
    }

    // IndexedDB Status
    const dbStatus = document.getElementById('dbStatus');
    if (window.indexedDBHelper) {
      dbStatus.textContent = 'Connected';
    } else {
      dbStatus.textContent = 'Not Available';
    }
  }

  showSuccess(message) {
    this._showToast(message, 'success');
  }

  showError(message) {
    this._showToast(message, 'error');
  }

  _showToast(message, type = 'info') {
    const existing = document.querySelector('.settings-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'settings-toast';
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
}
window.SettingsView = SettingsView;
console.log('SettingsView exported to window');