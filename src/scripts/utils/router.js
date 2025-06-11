class Router {
  constructor() {
    this.routes = [];
    this.currentUrl = '';
    
    window.addEventListener('hashchange', () => {
      console.log('Hash changed to:', window.location.hash);
      this._loadRouteWithTransition();
    });
  }

  addRoute(url, callback, options = {}) {
    this.routes.push({
      url,
      callback,
      requiresAuth: options.requiresAuth || false,
      guestOnly: options.guestOnly || false
    });
    
    return this;
  }

  setFallback(callback) {
    this.fallbackCallback = callback;
    return this;
  }

  _loadRouteWithTransition() {
    // Check if the View Transitions API is supported
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this._loadRoute();
      });
    } else {
      // Fallback for browsers that don't support the API
      this._applyFallbackTransition();
      this._loadRoute();
    }
  }
  
  _applyFallbackTransition() {
    // Simple CSS-based fallback transition
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.style.opacity = '0';
      mainContent.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        mainContent.style.opacity = '1';
      }, 300);
    }
  }

  _loadRoute() {
    const hash = window.location.hash;
    const url = hash.slice(1) || '/';
    this.currentUrl = url;
    
    const isAuthenticated = localStorage.getItem('token') !== null;
    
    console.log('Loading route:', url, 'Auth:', isAuthenticated); 

    const route = this.routes.find((route) => {
      return route.url === url;
    });

    if (route) {
      // Prevent redirect loop
      if (route.requiresAuth && !isAuthenticated && url !== '/masuk') {
        console.log('Halaman memerlukan login. Mengalihkan ke halaman login...');
        this.navigateTo('/masuk');
        return;
      }
      
      if (route.guestOnly && isAuthenticated && url !== '/') {
        console.log('Halaman hanya untuk tamu. Mengalihkan ke beranda...');
        this.navigateTo('/');
        return;
      }
      
      try {
        route.callback();
      } catch (error) {
        console.error('Error in route callback:', error);
      }
    } else if (this.fallbackCallback) {
      console.log('Route tidak ditemukan, menggunakan fallback');
      this.fallbackCallback();
    }
  }

  navigateTo(url) {
    console.log('Navigating to:', url); 
    
    // Check if we're already on this URL to avoid unnecessary transitions
    const currentHash = window.location.hash.slice(1) || '/';
    if (currentHash === url) {
      console.log('Already on this URL, skipping navigation');
      return;
    }
    
    window.location.hash = url;
  }

  init() {
    console.log('Router initialized');
    this._loadRouteWithTransition();
    
    // Add view transition styles
    this._addViewTransitionStyles();
  }
  
  _addViewTransitionStyles() {
    // Add transition styles to the document
    if (!document.getElementById('viewTransitionStyles')) {
      const style = document.createElement('style');
      style.id = 'viewTransitionStyles';
      style.textContent = `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes slide-from-right {
          from { transform: translateX(90px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-to-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-90px); opacity: 0; }
        }
        
        ::view-transition-old(root) {
          animation: 300ms fade-out ease, 400ms slide-to-left ease;
        }
        
        ::view-transition-new(root) {
          animation: 300ms fade-in ease, 400ms slide-from-right ease;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// ✅ FIXED: Export to window IMMEDIATELY after class definition
window.Router = Router;

// Create global router instance
const router = new Router();

// Make router available globally  
window.router = router;

// Make sure navigation links work
document.addEventListener('DOMContentLoaded', () => {
  console.log('Setting up navigation link handlers');
  
  // Handle all navigation links
  document.body.addEventListener('click', (e) => {
    // Find closest anchor tag
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (href && href.startsWith('#/')) {
      e.preventDefault();
      console.log('Navigation link clicked:', href);
      const path = href.substring(1); // Remove the # character
      router.navigateTo(path);
    }
  });
});
