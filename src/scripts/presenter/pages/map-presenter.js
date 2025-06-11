class MapPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    
    // Set this presenter as the view's presenter
    this.view.setPresenter(this);
    
    console.log('MapPresenter created');
  }
  
  init() {
    console.log('MapPresenter initialized');
  }
  
  async loadStoriesForMap() {
    console.log('MapPresenter: Loading stories for map');
    
    try {
      // Get stories from the model
      const stories = await this.model.getAllStories();
      console.log(`MapPresenter: Successfully retrieved ${stories.length} stories`);
      
      // Update the view with the loaded stories
      this.view.displayStories(stories);
    } catch (error) {
      console.error('MapPresenter: Error loading stories:', error);
      this.view.showError(error.message || 'Failed to load stories');
    }
  }
}
window.MapPresenter = MapPresenter;
console.log('MapPresenter exported to window');