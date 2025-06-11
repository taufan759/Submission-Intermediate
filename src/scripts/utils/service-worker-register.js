// Service Worker Registration & PWA Installation Handler
class ServiceWorkerRegister {
  constructor() {
    this.swPath = '/sw.js';
    this.registration = null;
    this.deferredPrompt = null;
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  }

  async init() {
    if (!this.isServiceWorkerSupported()) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      // Register service worker
      await this.register();
      
      // Setup installation prompt
      this.setupInstallPrompt();
      
      // Check for updates periodically
      this.setupUpdateCheck();
      
      // Handle app installed event
      this.handleAppInstalled();
      
      console.log('Service Worker registration complete');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  isServiceWorkerSupported() {
    return 'serviceWorker' in navigator;
  }

  async register() {
    try {
      this.registration = await navigator.serviceWorker.register(this.swPath, {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);

      // Check if there's an update available
      this.registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        const newWorker = this.registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker installed, show update notification
            this.showUpdateNotification();
          }
        });
      });

      // Handle controller change (when SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        // Reload the page when controller changes
        window.location.reload();
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration error:', error);
      throw error;
    }
  }

  setupInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      
      // Show install button/banner
      this.showInstallPromotion();
      
      // Log the platforms
      console.log('Install prompt platforms:', e.platforms);
    });
  }

  showInstallPromotion() {
    // Check if user has dismissed install prompt before
    const installDismissed = localStorage.getItem('pwa-install-dismissed');
    const lastDismissed = installDismissed ? new Date(installDismissed) : null;
    const daysSinceDismissed = lastDismissed ? 
      (new Date() - lastDismissed) / (1000 * 60 * 60 * 24) : Infinity;
    
    // Don't show if dismissed less than 7 days ago
    if (daysSinceDismissed < 7) {
      console.log('Install prompt recently dismissed');
      return;
    }

    // Create install banner
    const banner = document.createElement('div');
    banner.id = 'installBanner';
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="install-banner-content">
        <div class="install-banner-icon">
          <i class="fas fa-download"></i>
        </div>
        <div class="install-banner-text">
          <h3>Install Peta Bicara</h3>
          <p>Pasang aplikasi untuk pengalaman terbaik!</p>
        </div>
        <div class="install-banner-actions">
          <button class="btn btn-primary" id="installBtn">
            <i class="fas fa-plus-circle"></i> Install
          </button>
          <button class="btn btn-secondary" id="dismissBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .install-banner {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        max-width: 90%;
        width: 400px;
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from { 
          transform: translateX(-50%) translateY(100%);
          opacity: 0;
        }
        to { 
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }

      .install-banner-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .install-banner-icon {
        font-size: 2rem;
        color: #2196F3;
      }

      .install-banner-text h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        color: #333;
      }

      .install-banner-text p {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
      }

      .install-banner-actions {
        display: flex;
        gap: 0.5rem;
        margin-left: auto;
      }

      .install-banner .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
      }

      .install-banner .btn-primary {
        background: #2196F3;
        color: white;
      }

      .install-banner .btn-primary:hover {
        background: #1976D2;
        transform: scale(1.05);
      }

      .install-banner .btn-secondary {
        background: #f0f0f0;
        color: #666;
        padding: 0.5rem 0.75rem;
      }

      .install-banner .btn-secondary:hover {
        background: #e0e0e0;
      }

      @media (max-width: 480px) {
        .install-banner {
          width: calc(100% - 40px);
          bottom: 10px;
        }
        
        .install-banner-content {
          flex-wrap: wrap;
        }
        
        .install-banner-actions {
          width: 100%;
          justify-content: space-between;
          margin-top: 1rem;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Handle install button click
    document.getElementById('installBtn').addEventListener('click', () => {
      this.promptInstall();
    });

    // Handle dismiss button click
    document.getElementById('dismissBtn').addEventListener('click', () => {
      this.dismissInstallBanner();
    });

    // Auto dismiss after 10 seconds
    setTimeout(() => {
      if (document.getElementById('installBanner')) {
        this.dismissInstallBanner(false);
      }
    }, 10000);
  }

  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // Track installation choice
    if (window.gtag) {
      window.gtag('event', 'pwa_install_prompt', {
        'event_category': 'PWA',
        'event_label': outcome
      });
    }

    // Clear the deferred prompt
    this.deferredPrompt = null;

    // Remove install banner
    const banner = document.getElementById('installBanner');
    if (banner) {
      banner.remove();
    }
  }

  dismissInstallBanner(savePreference = true) {
    const banner = document.getElementById('installBanner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease';
      setTimeout(() => banner.remove(), 300);
    }

    if (savePreference) {
      localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    }
  }

  handleAppInstalled() {
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      
      // Track successful installation
      if (window.gtag) {
        window.gtag('event', 'pwa_installed', {
          'event_category': 'PWA',
          'event_label': 'success'
        });
      }

      // Clear install dismissed flag
      localStorage.removeItem('pwa-install-dismissed');

      // Show success notification
      if (window.pushNotificationHelper) {
        window.pushNotificationHelper.showLocalNotification(
          'Peta Bicara Terpasang!',
          'Aplikasi berhasil dipasang. Kamu bisa membukanya dari homescreen.',
          '/icons/icon-192x192.png'
        );
      }
    });
  }

  setupUpdateCheck() {
    // Check for updates every hour
    setInterval(() => {
      if (this.registration) {
        this.registration.update();
      }
    }, 60 * 60 * 1000);

    // Also check when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.registration) {
        this.registration.update();
      }
    });
  }

  showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-notification';
    updateBanner.innerHTML = `
      <div class="update-content">
        <i class="fas fa-sync-alt"></i>
        <span>Update tersedia! Klik untuk memperbarui.</span>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .update-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        cursor: pointer;
        z-index: 1001;
        animation: slideDown 0.3s ease;
      }

      @keyframes slideDown {
        from { 
          transform: translateX(-50%) translateY(-100%);
          opacity: 0;
        }
        to { 
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }

      .update-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .update-notification:hover {
        background: #45a049;
        transform: translateX(-50%) scale(1.05);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(updateBanner);

    updateBanner.addEventListener('click', () => {
      if (this.registration && this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      updateBanner.remove();
    });

    // Auto remove after 10 seconds
    setTimeout(() => {
      if (updateBanner.parentNode) {
        updateBanner.remove();
      }
    }, 10000);
  }

  // Check if app is installed
  isAppInstalled() {
    return this.isStandalone || 
           window.navigator.standalone || 
           document.referrer.includes('android-app://');
  }

  // Get registration status
  async getStatus() {
    const registration = await navigator.serviceWorker.getRegistration();
    
    return {
      isSupported: this.isServiceWorkerSupported(),
      isRegistered: !!registration,
      isInstalled: this.isAppInstalled(),
      hasUpdate: registration?.waiting != null,
      registration: registration
    };
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const swRegister = new ServiceWorkerRegister();
  swRegister.init();
  
  // Make available globally
  window.swRegister = swRegister;
});