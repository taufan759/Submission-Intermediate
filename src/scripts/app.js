// app.js - Simple version that works

document.addEventListener('DOMContentLoaded', () => {
  const app = {
    async init() {
      console.log('App initializing...');
      
      // Create models
      const storyModel = new StoryModel(apiService);
      const authModel = apiService;
      
      // Create main view
      const appView = new AppView();
      
      // Initialize global router if not already initialized
      if (!window.router) {
        window.router = new Router();
      }
      
      // Create app presenter with dependencies
      const appPresenter = new AppPresenter({
        view: appView,
        storyModel: storyModel,
        authModel: authModel,
        router: window.router
      });
      
      // Setup global camera cleanup on navigation
      window.addEventListener('hashchange', () => {
        console.log('Page navigation detected, checking if camera needs to be stopped');
        
        if (window.cameraHelper && window.cameraHelper.stream) {
          console.log('Active camera stream detected during navigation, stopping it');
          window.cameraHelper.stopCamera();
        }
      });
      
      // Start the application - this will setup routes and initialize view
      appPresenter.start();
      
      console.log('App initialization complete');
    }
  };
  
  console.log('Starting app...');
  app.init();
});