
class NotificationUIHelper {
  constructor() {
    this.pushHelper = null;
    this.isReady = false;
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  async init() {
    console.log('NotificationUIHelper: Initializing...');
    
    // Wait for push helper to be available
    await this.waitForPushHelper();
    
    if (this.pushHelper) {
      try {
        await this.pushHelper.init();
        this.isReady = true;
        console.log('NotificationUIHelper: Successfully initialized');
        return true;
      } catch (error) {
        console.error('NotificationUIHelper: Init error:', error);
        return false;
      }
    } else {
      console.warn('NotificationUIHelper: Push helper not available after retries');
      return false;
    }
  }

  async waitForPushHelper() {
    return new Promise((resolve) => {
      const checkHelper = () => {
        if (window.pushNotificationHelper) {
          this.pushHelper = window.pushNotificationHelper;
          console.log('NotificationUIHelper: Push helper found');
          resolve(true);
        } else if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          console.log(`NotificationUIHelper: Waiting for push helper (${this.retryCount}/${this.maxRetries})`);
          setTimeout(checkHelper, 1000);
        } else {
          console.warn('NotificationUIHelper: Push helper not found after retries');
          resolve(false);
        }
      };
      checkHelper();
    });
  }

  // Buat UI untuk pengaturan notifikasi
  createNotificationSettingsUI(container) {
    if (!container) {
      console.error('NotificationUIHelper: Container not provided');
      return;
    }

    console.log('NotificationUIHelper: Creating settings UI');

    const settingsHTML = `
      <div class="notification-settings-card">
        <div class="settings-header">
          <h3><i class="fas fa-bell"></i> Push Notifikasi</h3>
          <p>Dapatkan notifikasi untuk cerita baru dan update terbaru</p>
        </div>
        
        <div class="notification-status" id="notificationStatus">
          <div class="status-indicator info" id="statusIndicator">
            <i class="fas fa-circle"></i>
            <span id="statusText">Mengecek status...</span>
          </div>
        </div>
        
        <div class="notification-controls">
          <div class="control-group">
            <label class="toggle-switch">
              <input type="checkbox" id="notificationToggle" aria-label="Toggle push notifications">
              <span class="toggle-slider"></span>
            </label>
            <div class="control-info">
              <strong>Push Notifikasi</strong>
              <small>Terima notifikasi bahkan saat aplikasi ditutup</small>
            </div>
          </div>
        </div>
        
        <div class="notification-actions" id="notificationActions">
          <button class="btn btn-test" id="testNotificationBtn" style="display: none;">
            <i class="fas fa-vial"></i>
            Test Notifikasi
          </button>
          <button class="btn btn-info" id="permissionInfoBtn">
            <i class="fas fa-info-circle"></i>
            Info Izin
          </button>
          <button class="btn btn-secondary" id="debugBtn">
            <i class="fas fa-bug"></i>
            Debug
          </button>
        </div>
        
        <div class="notification-info" id="notificationInfo" style="display: none;">
          <div class="info-content">
            <i class="fas fa-lightbulb"></i>
            <div>
              <strong>Tips:</strong>
              <p>Notifikasi akan muncul bahkan ketika browser atau aplikasi ditutup. Pastikan izin notifikasi telah diberikan di pengaturan browser.</p>
            </div>
          </div>
        </div>

        <div class="debug-info" id="debugInfo" style="display: none;">
          <h4>Debug Information:</h4>
          <div id="debugContent">Loading...</div>
        </div>
      </div>
    `;

    container.innerHTML = settingsHTML;
    this.addNotificationStyles();
    this.setupNotificationEvents();
    this.updateNotificationStatus();
  }

  // Tambah styles untuk notification UI
  addNotificationStyles() {
    if (document.getElementById('notificationUIStyles')) return;

    const style = document.createElement('style');
    style.id = 'notificationUIStyles';
    style.textContent = `
      .notification-settings-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 1rem;
        border: 1px solid #e0e0e0;
      }

      .settings-header h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.25rem;
      }

      .settings-header p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }

      .notification-status {
        margin: 1.5rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #6c757d;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }

      .status-indicator.success {
        color: #28a745;
      }

      .status-indicator.warning {
        color: #ffc107;
      }

      .status-indicator.error {
        color: #dc3545;
      }

      .status-indicator.info {
        color: #17a2b8;
      }

      .notification-status.success {
        border-left-color: #28a745;
        background: #f8fff9;
      }

      .notification-status.warning {
        border-left-color: #ffc107;
        background: #fffcf0;
      }

      .notification-status.error {
        border-left-color: #dc3545;
        background: #fff5f5;
      }

      .notification-status.info {
        border-left-color: #17a2b8;
        background: #f0faff;
      }

      .notification-controls {
        margin: 1.5rem 0;
      }

      .control-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 34px;
        flex-shrink: 0;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-slider {
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

      .toggle-slider:before {
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

      input:checked + .toggle-slider {
        background-color: #2196F3;
      }

      input:checked + .toggle-slider:before {
        transform: translateX(26px);
      }

      .control-info {
        flex-grow: 1;
      }

      .control-info strong {
        display: block;
        color: #333;
        margin-bottom: 0.25rem;
      }

      .control-info small {
        color: #666;
        font-size: 0.85rem;
      }

      .notification-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .notification-actions .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: 500;
      }

      .btn-test {
        background: #17a2b8;
        color: white;
      }

      .btn-test:hover {
        background: #138496;
      }

      .btn-info {
        background: #6c757d;
        color: white;
      }

      .btn-info:hover {
        background: #5a6268;
      }

      .btn-secondary {
        background: #fd7e14;
        color: white;
      }

      .btn-secondary:hover {
        background: #e76500;
      }

      .notification-info {
        margin-top: 1.5rem;
        padding: 1rem;
        background: #e3f2fd;
        border-radius: 8px;
        border-left: 4px solid #2196F3;
      }

      .info-content {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
      }

      .info-content i {
        color: #2196F3;
        font-size: 1.25rem;
        flex-shrink: 0;
        margin-top: 0.25rem;
      }

      .info-content strong {
        color: #1565c0;
        display: block;
        margin-bottom: 0.5rem;
      }

      .info-content p {
        margin: 0;
        color: #0d47a1;
        line-height: 1.5;
        font-size: 0.9rem;
      }

      .debug-info {
        margin-top: 1.5rem;
        padding: 1rem;
        background: #fff3cd;
        border-radius: 8px;
        border-left: 4px solid #ffc107;
      }

      .debug-info h4 {
        margin: 0 0 1rem 0;
        color: #856404;
      }

      #debugContent {
        font-family: monospace;
        font-size: 0.8rem;
        background: #fff;
        padding: 1rem;
        border-radius: 4px;
        white-space: pre-wrap;
        max-height: 200px;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .control-group {
          flex-direction: column;
          text-align: center;
          gap: 0.75rem;
        }

        .notification-actions {
          flex-direction: column;
        }

        .notification-actions .btn {
          width: 100%;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Setup event listeners untuk notification controls
  setupNotificationEvents() {
    console.log('NotificationUIHelper: Setting up events');
    
    const toggle = document.getElementById('notificationToggle');
    const testBtn = document.getElementById('testNotificationBtn');
    const infoBtn = document.getElementById('permissionInfoBtn');
    const debugBtn = document.getElementById('debugBtn');

    // Toggle event dengan error handling yang lebih baik
    if (toggle) {
      console.log('NotificationUIHelper: Toggle found, adding listener');
      
      toggle.addEventListener('change', async (e) => {
        console.log('NotificationUIHelper: Toggle changed to:', e.target.checked);
        
        const originalChecked = e.target.checked;
        toggle.disabled = true;
        
        try {
          this.updateStatusText('Memproses...', 'info');
          
          if (originalChecked) {
            console.log('NotificationUIHelper: Attempting to enable notifications');
            await this.enableNotifications();
          } else {
            console.log('NotificationUIHelper: Attempting to disable notifications');
            await this.disableNotifications();
          }
        } catch (error) {
          console.error('NotificationUIHelper: Toggle error:', error);
          // Revert toggle pada error
          e.target.checked = !originalChecked;
          this.showNotificationMessage(error.message, 'error');
        } finally {
          toggle.disabled = false;
        }
      });
    } else {
      console.error('NotificationUIHelper: Toggle not found!');
    }

    // Test button event
    if (testBtn) {
      testBtn.addEventListener('click', () => this.testNotification());
    }

    // Info button event
    if (infoBtn) {
      infoBtn.addEventListener('click', () => this.showPermissionInfo());
    }

    // Debug button event
    if (debugBtn) {
      debugBtn.addEventListener('click', () => this.toggleDebugInfo());
    }
  }

  // Enable push notifications
  async enableNotifications() {
    console.log('NotificationUIHelper: Enabling notifications');
    
    if (!this.isReady) {
      console.log('NotificationUIHelper: Not ready, initializing...');
      const initialized = await this.init();
      if (!initialized) {
        throw new Error('Tidak dapat menginisialisasi push notification service');
      }
    }
    
    try {
      this.updateStatusText('Meminta izin notifikasi...', 'info');
      
      // Check permission first
      if (Notification.permission === 'denied') {
        throw new Error('Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.');
      }
      
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Izin notifikasi tidak diberikan');
        }
      }
      
      this.updateStatusText('Mendaftarkan service worker...', 'info');
      
      const subscription = await this.pushHelper.subscribe();
      
      if (subscription) {
        this.showNotificationMessage('✅ Push notifikasi berhasil diaktifkan!', 'success');
        this.updateNotificationStatus();
      } else {
        throw new Error('Gagal membuat subscription');
      }
    } catch (error) {
      console.error('NotificationUIHelper: Enable error:', error);
      throw new Error('Gagal mengaktifkan notifikasi: ' + error.message);
    }
  }

  // Disable push notifications
  async disableNotifications() {
    console.log('NotificationUIHelper: Disabling notifications');
    
    if (!this.isReady) {
      await this.init();
    }
    
    try {
      this.updateStatusText('Menonaktifkan notifikasi...', 'info');
      
      const success = await this.pushHelper.unsubscribe();
      
      if (success) {
        this.showNotificationMessage('Push notifikasi berhasil dinonaktifkan', 'info');
        this.updateNotificationStatus();
      } else {
        throw new Error('Gagal membatalkan subscription');
      }
    } catch (error) {
      console.error('NotificationUIHelper: Disable error:', error);
      throw new Error('Gagal menonaktifkan notifikasi: ' + error.message);
    }
  }

  // Test notification
  async testNotification() {
    console.log('NotificationUIHelper: Testing notification');
    
    try {
      // Test basic notification first
      if (Notification.permission === 'granted') {
        new Notification('🧪 Test Notifikasi', {
          body: 'Ini adalah test notifikasi dari Peta Bicara!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png'
        });
        this.showNotificationMessage('🧪 Test notifikasi berhasil dikirim!', 'success');
      } else {
        throw new Error('Izin notifikasi belum diberikan');
      }
      
      // Also test via push helper if available
      if (this.pushHelper && this.isReady) {
        const success = await this.pushHelper.testNotification();
        if (!success) {
          console.warn('Push helper test failed, but basic notification worked');
        }
      }
    } catch (error) {
      console.error('NotificationUIHelper: Test error:', error);
      this.showNotificationMessage('Error: ' + error.message, 'error');
    }
  }

  // FIXED: Update status notifikasi with Story API check
  async updateNotificationStatus() {
    console.log('NotificationUIHelper: Updating status');
    
    const toggle = document.getElementById('notificationToggle');
    const testBtn = document.getElementById('testNotificationBtn');
    const notificationInfo = document.getElementById('notificationInfo');

    try {
      // Basic checks first
      if (!('Notification' in window)) {
        this.updateStatusText('Browser tidak mendukung notifikasi', 'error');
        if (toggle) toggle.disabled = true;
        return;
      }

      if (!('serviceWorker' in navigator)) {
        this.updateStatusText('Browser tidak mendukung service worker', 'error');
        if (toggle) toggle.disabled = true;
        return;
      }

      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        this.updateStatusText('HTTPS diperlukan untuk push notification', 'error');
        if (toggle) toggle.disabled = true;
        return;
      }

      // Check authentication for Story API
      const token = localStorage.getItem('token');
      if (!token) {
        this.updateStatusText('Login diperlukan untuk notifikasi', 'warning');
        if (toggle) toggle.disabled = true;
        return;
      }

      // Check permission
      const permission = Notification.permission;
      console.log('NotificationUIHelper: Permission status:', permission);

      if (permission === 'denied') {
        this.updateStatusText('Izin notifikasi ditolak', 'error');
        if (toggle) toggle.checked = false;
        if (testBtn) testBtn.style.display = 'none';
        return;
      }

      if (permission === 'default') {
        this.updateStatusText('Izin notifikasi belum diminta', 'warning');
        if (toggle) toggle.checked = false;
        if (testBtn) testBtn.style.display = 'none';
        return;
      }

      // Permission granted - check subscription
      if (this.pushHelper && this.isReady) {
        const info = await this.pushHelper.getSubscriptionInfo();
        console.log('NotificationUIHelper: Subscription info:', info);
        
        // FIXED: Check both local and Story API subscription
        if (info.isSubscribed && info.isSubscribedToStoryAPI) {
          this.updateStatusText('Notifikasi Story API aktif', 'success');
          if (toggle) toggle.checked = true;
          if (testBtn) testBtn.style.display = 'inline-flex';
          if (notificationInfo) notificationInfo.style.display = 'block';
        } else if (info.isSubscribed) {
          this.updateStatusText('Notifikasi lokal aktif, Story API belum terdaftar', 'warning');
          if (toggle) toggle.checked = false;
          if (testBtn) testBtn.style.display = 'inline-flex';
        } else {
          this.updateStatusText('Push notifikasi tidak aktif', 'warning');
          if (toggle) toggle.checked = false;
          if (testBtn) testBtn.style.display = 'none';
        }
      } else {
        this.updateStatusText('Push service tidak tersedia', 'warning');
        if (toggle) toggle.checked = false;
        if (testBtn) testBtn.style.display = 'none';
      }
      
    } catch (error) {
      console.error('NotificationUIHelper: Status check error:', error);
      this.updateStatusText('Gagal mengecek status notifikasi', 'error');
    }
  }

  // Update status text
  updateStatusText(text, type) {
    console.log(`NotificationUIHelper: Status - ${type}: ${text}`);
    
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const notificationStatus = document.getElementById('notificationStatus');
    
    if (statusText) statusText.textContent = text;
    if (statusIndicator) {
      statusIndicator.className = `status-indicator ${type}`;
    }
    
    // Update background color
    if (notificationStatus) {
      notificationStatus.className = `notification-status ${type}`;
    }
  }

  // Toggle debug info
  async toggleDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    const debugContent = document.getElementById('debugContent');
    
    if (debugInfo.style.display === 'none') {
      debugInfo.style.display = 'block';
      
      // Collect debug information
      const debug = {
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        notificationSupport: 'Notification' in window,
        serviceWorkerSupport: 'serviceWorker' in navigator,
        pushManagerSupport: 'PushManager' in window,
        notificationPermission: Notification.permission,
        pushHelperAvailable: !!this.pushHelper,
        pushHelperReady: this.isReady,
        serviceWorkerRegistered: null,
        pushSubscription: null
      };
      
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        debug.serviceWorkerRegistered = !!registration;
        
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          debug.pushSubscription = !!subscription;
        }
      } catch (error) {
        debug.error = error.message;
      }
      
      debugContent.textContent = JSON.stringify(debug, null, 2);
    } else {
      debugInfo.style.display = 'none';
    }
  }

  // Show permission info
  showPermissionInfo() {
    const isHTTPS = location.protocol === 'https:';
    const browserName = this.getBrowserName();
    
    let infoMessage = `
      <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 400px; margin: 20px auto;">
        <h4 style="margin: 0 0 1rem 0; color: #333;"><i class="fas fa-info-circle" style="color: #2196F3;"></i> Informasi Push Notifikasi</h4>
        
        <div style="margin-bottom: 1rem;">
          <strong>Status Saat Ini:</strong>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li>HTTPS: ${isHTTPS ? '✅ Aman' : '❌ Diperlukan'}</li>
            <li>Browser: ${browserName}</li>
            <li>Izin: ${Notification.permission}</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <strong>Cara Mengaktifkan:</strong>
          <ol style="margin: 0.5rem 0; padding-left: 1.5rem; font-size: 0.9rem;">
            <li>Klik toggle "Push Notifikasi"</li>
            <li>Izinkan notifikasi saat browser bertanya</li>
            <li>Test dengan tombol "Test Notifikasi"</li>
          </ol>
        </div>
        
        <button onclick="this.parentElement.parentElement.remove()" style="background: #2196F3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; width: 100%;">
          Tutup
        </button>
      </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    overlay.innerHTML = infoMessage;
    
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  // Get browser name
  getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Show notification message
  showNotificationMessage(message, type = 'info') {
    console.log(`NotificationUIHelper: Message - ${type}: ${message}`);
    
    // Remove existing message
    const existing = document.querySelector('.notification-message');
    if (existing) existing.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = 'notification-message';
    messageDiv.style.cssText = `
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
      max-width: 300px;
    `;
    
    // Set background based on type
    const backgrounds = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    messageDiv.style.background = backgrounds[type] || backgrounds.info;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    // Auto remove
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
      }
    }, 4000);
  }
}

// Initialize dan expose globally
const notificationUIHelper = new NotificationUIHelper();

// Setup saat DOM ready dengan delay yang cukup
document.addEventListener('DOMContentLoaded', () => {
  // Wait for other scripts to load first
  setTimeout(async () => {
    console.log('NotificationUIHelper: Starting initialization');
    await notificationUIHelper.init();
    console.log('NotificationUIHelper: Ready for use');
  }, 2000);
});

// Add slide animations
if (!document.getElementById('slideAnimations')) {
  const style = document.createElement('style');
  style.id = 'slideAnimations';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

window.notificationUIHelper = notificationUIHelper;