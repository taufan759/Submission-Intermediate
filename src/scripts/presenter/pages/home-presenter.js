// Updated home-presenter.js - No DOM manipulation, removed localStorage access

class HomePresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    
    // Set presenter reference in the view
    this.view.setPresenter(this);
    console.log('HomePresenter initialized with view and model');
  }
  
  init() {
    console.log('HomePresenter.init called');
    this.loadStories();
  }
  
  async loadStories() {
    console.log('HomePresenter.loadStories called');
    
    // Tell the view to show loading state
    this.view.showLoading();
    
    try {
      // Get stories from the model
      console.log('HomePresenter: Requesting stories from model');
      const stories = await this.model.getAllStories();
      console.log('HomePresenter: Stories loaded successfully, count:', stories ? stories.length : 0);
      
      // Check if stories array exists and has items
      if (stories && Array.isArray(stories)) {
        // Update the view with the loaded stories
        this.view.renderStories(stories);
      } else {
        console.warn('HomePresenter: No stories returned or invalid format');
        this.view.renderStories([]);
      }
    } catch (error) {
      console.error('HomePresenter: Error loading stories:', error);
      
      // Show error message in the view
      const errorMessage = error.message || 'Failed to load stories';
      this.view.renderError(errorMessage);
      
      // If the error is due to authentication, check token through model
      if (errorMessage.includes('token') || errorMessage.includes('authentication')) {
        console.log('HomePresenter: Authentication issue detected, checking token');
        this._checkAuth();
      }
    }
  }
  
  // Helper method to check authentication status
  _checkAuth() {
    // Check authentication through model instead of direct localStorage access
    const isAuthenticated = this.model.isAuthenticated();
    if (!isAuthenticated) {
      console.log('HomePresenter: No token found, redirecting to login');
      // Redirect to login page through view
      this.view.scheduleNavigation(() => {
        this.view.navigateToRoute('/masuk');
      }, 1500);
    }
  }
}
window.HomePresenter = HomePresenter;
console.log('HomePresenter exported to window');