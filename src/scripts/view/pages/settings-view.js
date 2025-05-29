// Settings View - Manage app settings including push notifications
class SettingsView {
  render() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
      <div class="settings-container">
        <header class="page-header">
          <h2>
            <i class="fas fa-cog" aria-hidden="true"></i>
            Pengaturan
          </h2>
        </header>

        <div class="settings-content">
          <!-- Push Notification Settings -->
          <section class="settings-section">
            <h3>
              <i class="fas fa-bell" aria-hidden="true"></i>
              Notifikasi
            </h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Push Notifikasi</h4>
                <p>Terima notifikasi untuk cerita baru dan update</p>
              </div>
              <div class="setting-control">
                <label class="switch">
                  <input type="checkbox" id="pushToggle" aria-label="Toggle push notifications">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div id="notificationStatus" class="notification-status"></div>
            
            <button class="btn btn-secondary" id="testNotificationBtn" style="display: none;">
              <i class="fas fa-paper-plane"></i>
              Test Notifikasi
            </button>
          </section>

          <!-- PWA Settings -->
          <section class="settings-section">
            <h3>
              <i class="fas fa-mobile-alt" aria-hidden="true"></i>
              Aplikasi
            </h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Status Instalasi</h4>
                <p id="installStatus">Checking...</p>
              </div>
              <div class="setting-control">
                <button class="btn btn-primary" id="installAppBtn" style="display: none;">
                  <i class="fas fa-download"></i>
                  Install App
                </button>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Service Worker</h4>
                <p id="swStatus">Checking...</p>
              </div>
              <div class="setting-control">
                <button class="btn btn-secondary" id="updateAppBtn" style="display: none;">
                  <i class="fas fa-sync-alt"></i>
                  Update
                </button>
              </div>
            </div>
          </section>

          <!-- Data Management -->
          <section class="settings-section">
            <h3>
              <i class="fas fa-database" aria-hidden="true"></i>
              Data Lokal
            </h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Favorit</h4>
                <p><span id="favoritesCount">0</span> cerita tersimpan</p>
              </div>
              <div class="setting-control">
                <button class="btn btn-secondary" id="exportFavoritesBtn">
                  <i class="fas fa-file-export"></i>
                  Export
                </button>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>Offline Stories</h4>
                <p><span id="offlineCount">0</span> cerita menunggu sinkronisasi</p>
              </div>
              <div class="setting-control">
                <button class="btn btn-secondary" id="syncOfflineBtn" disabled>
                  <i class="fas fa-sync"></i>
                  Sync
                </button>
              </div>
            </div>
            
            <div class="danger-zone">
              <h4>Zona Berbahaya</h4>
              <button class="btn btn-danger" id="clearDataBtn">
                <i class="fas fa-trash-alt"></i>
                Hapus Semua Data
              </button>
            </div>
          </section>
        </div>
      </div>
    `;

    // Add settings styles
    this.addStyles();
  }

  addStyles() {
    if (document.getElementById('settingsStyles')) return;

    const style = document.createElement('style');
    style.id = 'settingsStyles';
    style.textContent = `
      .settings-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .settings-content {
        background: white;
        border-radius: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .settings-section {
        padding: 2rem;
        border-bottom: 1px solid #eee;
      }

      .settings-section:last-child {
        border-bottom: none;
      }

      .settings-section h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        color: #333;
      }

      .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0;
        border-bottom: 1px solid #f5f5f5;
      }

      .setting-item:last-child {
        border-bottom: none;
      }

      .setting-info h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        color: #333;
      }

      .setting-info p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }

      .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: #2196F3;
      }

      input:checked + .slider:before {
        transform: translateX(26px);
      }

      .notification-status {
        margin: 1rem 0;
        padding: 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        display: none;
      }

      .notification-status.success {
        background: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #a5d6a7;
        display: block;
      }

      .notification-status.error {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
        display: block;
      }

      .notification-status.info {
        background: #e3f2fd;
        color: #1565c0;
        border: 1px solid #90caf9;
        display: block;
      }

      .danger-zone {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #ffebee;
      }

      .danger-zone h4 {
        color: #d32f2f;
        margin-bottom: 1rem;
      }

      .btn-danger {
        background: #f44336;
        color: white;
      }

      .btn-danger:hover {
        background: #d32f2f;
      }

      @media (max-width: 768px) {
        .settings-container {
          padding: 1rem;
        }

        .settings-section {
          padding: 1.5rem;
        }

        .setting-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .setting-control {
          width: 100%;
          display: flex;
          justify-content: flex-end;
        }
      }
    `;
    document.head.appendChild(style);
  }

  showStatus(message, type = 'info') {
    const statusEl = document.getElementById('notificationStatus');
    statusEl.textContent = message;
    statusEl.className = `notification-status ${type}`;
  }

  async updateNotificationToggle(isSubscribed) {
    const toggle = document.getElementById('pushToggle');
    if (toggle) {
      toggle.checked = isSubscribed;
    }
  }

  async updateInstallStatus(isInstalled) {
    const statusEl = document.getElementById('installStatus');
    const installBtn = document.getElementById('installAppBtn');
    
    if (isInstalled) {
      statusEl.textContent = 'Aplikasi sudah terpasang';
      installBtn.style.display = 'none';
    } else {
      statusEl.textContent = 'Aplikasi belum terpasang';
      if (window.swRegister && window.swRegister.deferredPrompt) {
        installBtn.style.display = 'block';
      }
    }
  }

  async updateServiceWorkerStatus(status) {
    const statusEl = document.getElementById('swStatus');
    const updateBtn = document.getElementById('updateAppBtn');
    
    if (status.isRegistered) {
      statusEl.textContent = 'Service Worker aktif';
      if (status.hasUpdate) {
        statusEl.textContent = 'Update tersedia';
        updateBtn.style.display = 'block';
      }
    } else {
      statusEl.textContent = 'Service Worker tidak aktif';
    }
  }

  async updateDataStats(stats) {
    document.getElementById('favoritesCount').textContent = stats.favoritesCount || 0;
    document.getElementById('offlineCount').textContent = stats.offlineCount || 0;
    
    const syncBtn = document.getElementById('syncOfflineBtn');
    syncBtn.disabled = !stats.offlineCount || stats.offlineCount === 0;
  }

  bindEvents(handlers) {
    // Push notification toggle
    document.getElementById('pushToggle').addEventListener('change', async (e) => {
      const toggle = e.target;
      toggle.disabled = true;
      
      try {
        if (toggle.checked) {
          await handlers.onEnableNotifications();
        } else {
          await handlers.onDisableNotifications();
        }
      } catch (error) {
        // Revert toggle on error
        toggle.checked = !toggle.checked;
        this.showStatus(error.message, 'error');
      } finally {
        toggle.disabled = false;
      }
    });

    // Test notification button
    const testBtn = document.getElementById('testNotificationBtn');
    if (testBtn) {
      testBtn.addEventListener('click', handlers.onTestNotification);
    }

    // Install app button
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
      installBtn.addEventListener('click', handlers.onInstallApp);
    }

    // Update app button
    const updateBtn = document.getElementById('updateAppBtn');
    if (updateBtn) {
      updateBtn.addEventListener('click', handlers.onUpdateApp);
    }

    // Export favorites button
    document.getElementById('exportFavoritesBtn').addEventListener('click', handlers.onExportFavorites);

    // Sync offline button
    document.getElementById('syncOfflineBtn').addEventListener('click', handlers.onSyncOffline);

    // Clear data button
    document.getElementById('clearDataBtn').addEventListener('click', () => {
      if (confirm('Apakah kamu yakin ingin menghapus semua data lokal? Tindakan ini tidak dapat dibatalkan.')) {
        handlers.onClearData();
      }
    });
  }
}