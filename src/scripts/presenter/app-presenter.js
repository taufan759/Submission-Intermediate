// src/scripts/presenter/app-presenter.js 

class AppPresenter {
  constructor({ view, storyModel, authModel, router }) {
    this.view = view;
    this.storyModel = storyModel;
    this.authModel = authModel;
    this.router = router;
    
    // Set this presenter as the view's presenter
    this.view.setPresenter(this);
    
    console.log('AppPresenter initialized');
  }
  
  _initRouter() {
    // Clear existing routes (if any)
    this.router.routes = [];
    
    this.router
      .addRoute('/', () => {
        console.log('Navigating to home page');
        this.navigateToHome();
      })
      
      .addRoute('/tambah', () => {
        console.log('Navigating to add story page');
        this.navigateToAddStory();
      }, { requiresAuth: true })
      
      .addRoute('/peta', () => {
        console.log('Navigating to map page');
        this.navigateToMap();
      })
      
      // ROUTE BARU - Favorit (memerlukan auth)
      .addRoute('/favorit', () => {
        console.log('Navigating to favorites page');
        this.navigateToFavorites();
      }, { requiresAuth: true })
      
      // ROUTE BARU - Pengaturan (memerlukan auth)
      .addRoute('/pengaturan', () => {
        console.log('Navigating to settings page');
        this.navigateToSettings();
      }, { requiresAuth: true })
      
      .addRoute('/masuk', () => {
        console.log('Rendering login page');
        this.navigateToLogin();
      }, { guestOnly: true })
      
      .addRoute('/daftar', () => {
        console.log('Rendering register page');
        this.navigateToRegister();
      }, { guestOnly: true })
      
      .setFallback(() => {
        console.error('Halaman tidak ditemukan');
        this.router.navigateTo('/');
      });
  }
  
  navigateToHome() {
    // Apply transition effect through the view
    this.view.applyViewTransition();
    
    // Let the view render the home page
    const homeView = this.view.renderHomePage();
    
    // Create the presenter for the home page
    const homePresenter = new window.HomePresenter({
      view: homeView,
      model: this.storyModel
    });
    
    homePresenter.init();
  }
  
  navigateToAddStory() {
    // Apply transition effect through the view
    this.view.applyViewTransition();
    
    // Let the view render the add story page
    const addStoryView = this.view.renderAddStoryPage();
    
    // Create the presenter for the add story page
    const addStoryPresenter = new window.AddStoryPresenter({
      view: addStoryView,
      model: this.storyModel
    });
    
    addStoryPresenter.init();
  }
  
  navigateToMap() {
    // Apply transition effect through the view
    this.view.applyViewTransition();
    
    // Let the view render the map page
    const mapView = this.view.renderMapPage();
    
    // Create the presenter for the map page
    const mapPresenter = new window.MapPresenter({
      view: mapView,
      model: this.storyModel
    });
    
    mapPresenter.init();
  }
  
  // METHOD BARU - Navigate to Favorites
  navigateToFavorites() {
    // Apply transition effect through the view
    this.view.applyViewTransition();
    
    // Let the view render the favorites page
    const favoritesView = this.view.renderFavoritesPage();
    
    // Create the presenter for the favorites page
    const favoritesPresenter = new window.FavoritesPresenter({
      view: favoritesView
    });
    
    favoritesPresenter.init();
  }
  
  // METHOD BARU - Navigate to Settings
  navigateToSettings() {
    // Apply transition effect through the view
    this.view.applyViewTransition();
    
    // Let the view render the settings page
    const settingsView = this.view.renderSettingsPage();
    
    // Create the presenter for the settings page
    const settingsPresenter = new window.SettingsPresenter({
      view: settingsView
    });
    
    settingsPresenter.init();
  }
  
  navigateToLogin() {
    // Apply transition effect through the view
    this.view.applyViewTransition();
    
    // Let the view render the login page
    const loginView = this.view.renderLoginPage();
    
    // Create the presenter for the login page
    const loginPresenter = new window.LoginPresenter({
      view: loginView,
      apiService: this.authModel,
      router: this.router
    });
    
    loginPresenter.init();
  }
  
  navigateToRegister() {
    // Apply transition effect through the view
    this.view.applyViewTransition();
    
    // Let the view render the register page
    const registerView = this.view.renderRegisterPage();
    
    // Create the presenter for the register page
    const registerPresenter = new window.RegisterPresenter({
      view: registerView,
      apiService: this.authModel,
      router: this.router
    });
    
    registerPresenter.init();
  }
  
  _setupEventListeners() {
    // Setup navigation through the view
    this.view.setupNavigation();
    
    // Setup skip link through the view
    this.view.setupSkipLink();
    
    // Update auth navigation based on authentication status
    this.updateAuthNavigation();
    
    // Listen for auth status changes through the view
    this.view.setupAuthChangeListener(() => {
      console.log('Auth status changed');
      this.updateAuthNavigation();
      this.updateFeaturesVisibility();
    });
  }
  
  updateAuthNavigation() {
    const isLoggedIn = this.isAuthenticated();
    // Delegate to view for DOM manipulation
    this.view.updateAuthNavItem(isLoggedIn);
  }
  
  // METHOD BARU - Update features visibility based on auth
  updateFeaturesVisibility() {
    // Update favorites navigation visibility
    if (window.favoritesHelper) {
      window.favoritesHelper.updateNavigationVisibility();
    }
    
    // Update notification features if available
    if (window.notificationUIHelper) {
      window.notificationUIHelper.updateNotificationStatus();
    }
  }
  
  isAuthenticated() {
    // Delegate localStorage access to authModel
    return this.authModel.isAuthenticated();
  }
  
  logout() {
    console.log('Logging out');
    // Delegate storage operations to authModel
    this.authModel.logout();
    // Notify view to dispatch auth change event
    this.view.dispatchAuthChange();
    this.router.navigateTo('/masuk');
  }
  
  reloadPage() {
    // Delegate page reload to view
    this.view.reloadPage();
  }
  
  start() {
    // Initialize router
    this._initRouter();
    
    // Setup event listeners
    this._setupEventListeners();
    
    // Initialize features
    this._initializeFeatures();
    
    // Initialize the router
    // Note: We won't call router.init() here since it's already initialized
    // We'll just trigger a route load to ensure the current route is loaded
    this.router._loadRoute();
  }
  
  // METHOD BARU - Initialize additional features
  _initializeFeatures() {
    // Initialize favorites helper
    if (window.favoritesHelper) {
      window.favoritesHelper.updateNavigationVisibility();
    }
    
    // Setup story card enhancements
    this._setupStoryCardEnhancements();
    
    console.log('Additional features initialized');
  }
  
  // METHOD BARU - Setup story card enhancements
  _setupStoryCardEnhancements() {
    // Setup mutation observer untuk menambah tombol favorit otomatis
    const observer = new MutationObserver((mutations) => {
      let hasNewStories = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList?.contains('story-card') || 
                node.querySelector?.('.story-card')) {
              hasNewStories = true;
            }
          }
        });
      });
      
      if (hasNewStories) {
        setTimeout(() => {
          this._enhanceStoryCards();
        }, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Enhance existing story cards
    setTimeout(() => {
      this._enhanceStoryCards();
    }, 1000);
  }
  
  // METHOD BARU - Enhance story cards dengan tombol favorit
  _enhanceStoryCards() {
    if (!window.favoritesHelper) return;
    
    const storyCards = document.querySelectorAll('.story-card:not([data-enhanced])');
    
    storyCards.forEach((card, index) => {
      try {
        // Extract story data dari card
        const story = this._extractStoryDataFromCard(card, index);
        
        if (story && story.id) {
          // Tambah tombol favorit
          window.favoritesHelper.addFavoriteButtonToStoryCard(card, story);
          
          // Mark sebagai enhanced
          card.setAttribute('data-enhanced', 'true');
          card.setAttribute('data-story-id', story.id);
        }
      } catch (error) {
        console.error('Error enhancing story card:', error);
      }
    });
  }
  
  // METHOD BARU - Extract story data from card
  _extractStoryDataFromCard(card, index) {
    const titleElement = card.querySelector('.story-title, h3');
    const descriptionElement = card.querySelector('.story-description, p');
    const imageElement = card.querySelector('.story-image, img');
    const authorElement = card.querySelector('.author-name, .story-author');
    const dateElement = card.querySelector('.story-date, time');
    
    const title = titleElement?.textContent?.trim() || `Cerita ${index + 1}`;
    const description = descriptionElement?.textContent?.trim() || '';
    const imageUrl = imageElement?.src || '';
    const author = authorElement?.textContent?.trim() || 'Anonim';
    const dateText = dateElement?.textContent?.trim() || new Date().toISOString();
    
    // Generate unique ID
    const storyId = this._generateStoryId(title, imageUrl, index);
    
    return {
      id: storyId,
      name: title,
      description: description,
      photoUrl: imageUrl,
      createdAt: dateText,
      author: author
    };
  }
  
  // METHOD BARU - Generate unique story ID
  _generateStoryId(title, imageUrl, index) {
    const baseString = `${title}-${imageUrl}-${index}`;
    let hash = 0;
    
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `story-${Math.abs(hash)}`;
  }
}

window.AppPresenter = AppPresenter;
console.log('AppPresenter exported to window');