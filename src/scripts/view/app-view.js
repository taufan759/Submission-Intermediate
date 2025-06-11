// src/scripts/view/app-view.js
class AppView {
  constructor() {
    this.mainContent = document.getElementById('mainContent');
    this.presenter = null;
  }
  
  setPresenter(presenter) {
    this.presenter = presenter;
  }
  
  renderHomePage() {
    this.clearContent();
    
    const homeView = new window.HomeView();
    homeView.render();
    return homeView;
  }
  
  renderAddStoryPage() {
    this.clearContent();
    
    const addStoryView = new window.AddStoryView();
    addStoryView.render();
    return addStoryView;
  }
  
  renderMapPage() {
    this.clearContent();
    
    // Create and render map view
    const mapView = new window.MapView();
    mapView.render();
    return mapView;
  }
  
  renderLoginPage() {
    this.clearContent();
    
    const loginView = new window.LoginView();
    loginView.render();
    return loginView;
  }
  
  renderRegisterPage() {
    this.clearContent();
    
    const registerView = new window.RegisterView();
    registerView.render();
    return registerView;
  }
  
  // METHOD BARU - Render Favorites Page
  renderFavoritesPage() {
    this.clearContent();
    
    const favoritesView = new window.FavoritesView();
    favoritesView.render();
    return favoritesView;
  }
  
  // METHOD BARU - Render Settings Page
  renderSettingsPage() {
    this.clearContent();
    
    const settingsView = new window.SettingsView();
    settingsView.render();
    return settingsView;
  }
  
  clearContent() {
    // Clear main content
    this.mainContent.innerHTML = '';
  }
  
  showLoading() {
    this.mainContent.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner" aria-label="Memuat konten"></div>
        <p>Memuat...</p>
      </div>
    `;
  }
  
  showError(message) {
    this.mainContent.innerHTML = `
      <div class="error-container">
        <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
        <h2>Terjadi Kesalahan</h2>
        <p>${message}</p>
        <button class="btn btn-primary" id="retryButton">
          <i class="fas fa-redo" aria-hidden="true"></i>
          Coba Lagi
        </button>
      </div>
    `;
    
    document.getElementById('retryButton').addEventListener('click', () => {
      if (this.presenter) {
        this.presenter.reloadPage();
      } else {
        window.location.reload();
      }
    });
  }
  
  setupNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !expanded);
        navMenu.classList.toggle('active');
      });
    }
    
    // Add click event listeners to all navigation links
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
  }
  
  updateAuthNavItem(isLoggedIn) {
    const authNavItem = document.getElementById('authNavItem');
    
    if (authNavItem) {
      if (isLoggedIn) {
        authNavItem.innerHTML = `<a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt" aria-hidden="true"></i> Keluar</a>`;
        
        // Add logout functionality
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
          e.preventDefault();
          if (this.presenter) {
            this.presenter.logout();
          }
        });
      } else {
        authNavItem.innerHTML = `<a href="#/masuk"><i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk</a>`;
      }
    }
    
    // UPDATE: Tambah/update navigasi pengaturan
    this._updateSettingsNavigation(isLoggedIn);
  }
  
  // METHOD BARU - Update settings navigation
  _updateSettingsNavigation(isLoggedIn) {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    // Cari atau buat link pengaturan
    let settingsLink = navMenu.querySelector('a[href="#/pengaturan"]');
    
    if (isLoggedIn && !settingsLink) {
      // Tambah link pengaturan jika belum ada
      const authNavItem = document.getElementById('authNavItem');
      if (authNavItem) {
        const settingsLi = document.createElement('li');
        settingsLi.className = 'auth-required-nav';
        settingsLi.innerHTML = `
          <a href="#/pengaturan">
            <i class="fas fa-cog" aria-hidden="true"></i> 
            Pengaturan
          </a>
        `;
        authNavItem.parentNode.insertBefore(settingsLi, authNavItem);
      }
    } else if (!isLoggedIn && settingsLink) {
      // Hapus link pengaturan jika tidak login
      const settingsNavItem = settingsLink.closest('.auth-required-nav');
      if (settingsNavItem) {
        settingsNavItem.remove();
      }
    }
  }
  
  setupSkipLink() {
    const mainContent = document.querySelector('#mainContent');
    const skipLink = document.querySelector('.skip-link');
    
    if (mainContent && skipLink) {
      skipLink.addEventListener('click', function (event) {
        event.preventDefault();
        skipLink.blur();
        mainContent.focus();
        mainContent.scrollIntoView();
      });
    }
  }
  
  // Add missing methods
  setupAuthChangeListener(callback) {
    // Listen for storage events (when auth status changes)
    window.addEventListener('storage', (e) => {
      if (e.key === 'token' || e.key === 'user') {
        callback();
      }
    });
    
    // Custom event for auth changes
    window.addEventListener('authChanged', callback);
  }
  
  dispatchAuthChange() {
    // Dispatch custom event when auth status changes
    window.dispatchEvent(new Event('authChanged'));
  }
  
  reloadPage() {
    window.location.reload();
  }
  
  // View transition method - handles UI transitions
  applyViewTransition() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    // Check if browser supports View Transitions API
    if (document.startViewTransition) {
      // Add view-transition class to main content
      mainContent.classList.add('view-transition');
      
      // Use View Transitions API
      document.startViewTransition(() => {
        console.log('View transition started');
      });
    } else {
      // Fallback for browsers that don't support View Transitions API
      mainContent.classList.add('page-transitioning');
      
      // Remove the transitioning class after animation completes
      setTimeout(() => {
        mainContent.classList.remove('page-transitioning');
      }, 300);
    }
  }
}

window.AppView = AppView;
console.log('AppView exported to window');