// Fixed app-presenter.js - Removed direct DOM/BOM access

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
      }, { requiresAuth: true })
      
      .addRoute('/tambah', () => {
        console.log('Navigating to add story page');
        this.navigateToAddStory();
      }, { requiresAuth: true })
      
      .addRoute('/peta', () => {
        console.log('Navigating to map page');
        this.navigateToMap();
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
    const homePresenter = new HomePresenter({
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
    const addStoryPresenter = new AddStoryPresenter({
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
    const mapPresenter = new MapPresenter({
      view: mapView,
      model: this.storyModel
    });
    
    mapPresenter.init();
  }
  
  navigateToLogin() {
    // Apply transition effect through the view
    this.view.applyViewTransition();
    
    // Let the view render the login page
    const loginView = this.view.renderLoginPage();
    
    // Create the presenter for the login page
    const loginPresenter = new LoginPresenter({
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
    const registerPresenter = new RegisterPresenter({
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
    });
  }
  
  updateAuthNavigation() {
    const isLoggedIn = this.isAuthenticated();
    // Delegate to view for DOM manipulation
    this.view.updateAuthNavItem(isLoggedIn);
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
    
    // Initialize the router
    // Note: We won't call router.init() here since it's already initialized
    // We'll just trigger a route load to ensure the current route is loaded
    this.router._loadRoute();
  }
}