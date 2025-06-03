// src/scripts/utils/notification-ui-helper.js

class NotificationUIHelper {
  constructor() {
    this.pushHelper = window.pushNotificationHelper;
    this.isReady = false;
  }

  async init() {
    if (this.pushHelper) {
      await this.pushHelper.init();
      this.isReady = true;
      console.log('NotificationUIHelper initialized');
    } else {
      console.warn('Push notification helper not found');
    }
  }

  // Buat UI untuk pengaturan notifikasi
  createNotificationSettingsUI(container) {
    if (!container) {
      console.error('Container not provided for notification settings');
      return;
    }

    const settingsHTML = `
      <div class="notification-settings-card">
        <div class="settings-header">
          <h3><i class="fas fa-bell"></i> Push Notifikasi</h3>
          <p>Dapatkan notifikasi untuk cerita baru dan update terbaru</p>
        </div>
        
        <div class="notification-status" id="notificationStatus">
          <div class="status-indicator" id="statusIndicator">
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

      .status-indicator.success + .notification-status {
        border-left-color: #28a745;
        background: #f8fff9;
      }

      .status-indicator.warning + .notification-status {
        border-left-color: #ffc107;
        background: #fffcf0;
      }

      .status-indicator.error + .notification-status {
        border-left-color: #dc3545;
        background: #fff5f5;
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
    const toggle = document.getElementById('notificationToggle');
    const testBtn = document.getElementById('testNotificationBtn');
    const infoBtn = document.getElementById('permissionInfoBtn');

    // Toggle event
    if (toggle) {
      toggle.addEventListener('change', async (e) => {
        toggle.disabled = true;
        
        try {
          if (e.target.checked) {
            await this.enableNotifications();
          } else {
            await this.disableNotifications();
          }
        } catch (error) {
          // Revert toggle pada error
          e.target.checked = !e.target.checked;
          this.showNotificationMessage(error.message, 'error');
        } finally {
          toggle.disabled = false;
        }
      });
    }

    // Test button event
    if (testBtn) {
      testBtn.addEventListener('click', () => this.testNotification());
    }

    // Info button event
    if (infoBtn) {
      infoBtn.addEventListener('click', () => this.showPermissionInfo());
    }
  }

  // Enable push notifications
  async enableNotifications() {
    if (!this.isReady) await this.init();
    
    try {
      this.updateStatusText('Mengaktifkan notifikasi...', 'info');
      
      const subscription = await this.pushHelper.subscribe();
      
      if (subscription) {
        this.showNotificationMessage('✅ Push notifikasi berhasil diaktifkan!', 'success');
        this.updateNotificationStatus();
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      throw new Error('Gagal mengaktifkan notifikasi: ' + error.message);
    }
  }

  // Disable push notifications
  async disableNotifications() {
    if (!this.isReady) await this.init();
    
    try {
      this.updateStatusText('Menonaktifkan notifikasi...', 'info');
      
      const success = await this.pushHelper.unsubscribe();
      
      if (success) {
        this.showNotificationMessage('Push notifikasi berhasil dinonaktifkan', 'info');
        this.updateNotificationStatus();
      }
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      throw new Error('Gagal menonaktifkan notifikasi: ' + error.message);
    }
  }

  // Test notification
  async testNotification() {
    try {
      const success = await this.pushHelper.testNotification();
      if (success) {
        this.showNotificationMessage('🧪 Test notifikasi berhasil dikirim!', 'success');
      } else {
        this.showNotificationMessage('❌ Gagal mengirim test notifikasi', 'error');
      }
    } catch (error) {
      console.error('Failed to test notification:', error);
      this.showNotificationMessage('Error: ' + error.message, 'error');
    }
  }

  // Update status notifikasi
  async updateNotificationStatus() {
    if (!this.isReady) await this.init();
    
    const toggle = document.getElementById('notificationToggle');
    const testBtn = document.getElementById('testNotificationBtn');
    const notificationInfo = document.getElementById('notificationInfo');

    try {
      if (!this.pushHelper) {
        this.updateStatusText('Push notifikasi tidak didukung', 'error');
        if (toggle) toggle.disabled = true;
        return;
      }

      const info = await this.pushHelper.getSubscriptionInfo();
      
      if (!info.isSupported) {
        this.updateStatusText('Browser tidak mendukung push notifikasi', 'error');
        if (toggle) toggle.disabled = true;
      } else if (!info.hasPermission) {
        this.updateStatusText('Izin notifikasi belum diberikan', 'warning');
        if (toggle) toggle.checked = false;
        if (testBtn) testBtn.style.display = 'none';
      } else if (!info.isSubscribed) {
        this.updateStatusText('Push notifikasi tidak aktif', 'warning');
        if (toggle) toggle.checked = false;
        if (testBtn) testBtn.style.display = 'none';
      } else {
        this.updateStatusText('Push notifikasi aktif dan siap', 'success');
        if (toggle) toggle.checked = true;
        if (testBtn) testBtn.style.display = 'inline-flex';
        if (notificationInfo) notificationInfo.style.display = 'block';
      }
      
    } catch (error) {
      console.error('Error checking notification status:', error);
      this.updateStatusText('Gagal mengecek status notifikasi', 'error');
    }
  }

  // Update status text
  updateStatusText(text, type) {
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

// Setup saat DOM ready
document.addEventListener('DOMContentLoaded', () => {
  notificationUIHelper.init();
  console.log('NotificationUIHelper ready');
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