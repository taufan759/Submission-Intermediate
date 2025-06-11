// app.js - FINAL FIXED VERSION
console.log('🏗️ Initializing PetaBicara App...');

document.addEventListener('DOMContentLoaded', async () => {
  console.log('📄 DOM loaded, starting app initialization...');
  
  // Wait for all dependencies to load with longer timeout
  await waitForDependencies();
  
  const app = {
    async init() {
      console.log('🚀 App initializing...');
      
      try {
        // Check if all required classes are available
        const requiredClasses = [
          'StoryModel', 'AppView', 'AppPresenter', 'Router', 'apiService'
        ];
        
        for (const className of requiredClasses) {
          if (!window[className]) {
            throw new Error(`${className} not loaded`);
          }
        }
        
        console.log('✅ All core dependencies verified');
        
        // Create models
        const storyModel = new window.StoryModel(window.apiService);
        const authModel = window.apiService;
        
        // Create main view
        const appView = new window.AppView();
        
        // Initialize global router if not already initialized
        if (!window.router) {
          window.router = new window.Router();
        }
        
        // Create app presenter with dependencies
        const appPresenter = new window.AppPresenter({
          view: appView,
          storyModel: storyModel,
          authModel: authModel,
          router: window.router
        });
        
        // Setup global camera cleanup on navigation
        window.addEventListener('hashchange', () => {
          console.log('🧭 Page navigation detected, checking camera...');
          
          if (window.cameraHelper && window.cameraHelper.stream) {
            console.log('📹 Stopping active camera stream');
            window.cameraHelper.stopCamera();
          }
        });
        
        // Register service worker
        if (window.swRegister) {
          window.swRegister.register().then(registration => {
            if (registration) {
              console.log('✅ Service Worker registered successfully');
            }
          });
        }
        
        // Initialize IndexedDB
        if (window.indexedDBHelper) {
          try {
            await window.indexedDBHelper.init();
            console.log('✅ IndexedDB initialized successfully');
          } catch (error) {
            console.warn('⚠️ IndexedDB initialization failed:', error);
          }
        }
        
        // Start the application
        console.log('🎯 Starting app presenter...');
        appPresenter.start();
        
        console.log('🎉 App initialization complete!');
        
        // Hide initial loading indicator
        const loadingContainer = document.querySelector('.loading-container');
        if (loadingContainer) {
          loadingContainer.style.display = 'none';
        }
        
      } catch (error) {
        console.error('💥 Failed to initialize app:', error);
        showErrorMessage(`Gagal memulai aplikasi: ${error.message}`);
      }
    }
  };
  
  console.log('🎬 Starting app initialization...');
  await app.init();
});

// Function to wait for dependencies to load with retry mechanism
function waitForDependencies() {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkDependencies = () => {
      attempts++;
      
      const requiredClasses = [
        'AppView', 
        'AppPresenter', 
        'StoryModel', 
        'Router',
        'HomeView',
        'AddStoryView',
        'LoginView',
        'RegisterView',
        'MapView',
        'FavoritesView',
        'SettingsView'
      ];
      
      const missingClasses = requiredClasses.filter(className => !window[className]);
      
      if (missingClasses.length === 0 && window.apiService) {
        console.log('✅ All dependencies loaded successfully');
        resolve();
      } else if (attempts >= maxAttempts) {
        console.error('⏰ Timeout waiting for dependencies. Missing:', missingClasses);
        console.error('🔧 This usually means files are not properly exported to window object');
        
        // Show helpful error message
        showErrorMessage(`
          Timeout loading required modules. Missing: ${missingClasses.join(', ')}.
          <br><br>
          <strong>Troubleshooting:</strong>
          <ul style="text-align: left; margin: 1rem 0;">
            <li>Ensure all class files export to window object</li>
            <li>Check browser console for import errors</li>
            <li>Verify all files exist in correct paths</li>
          </ul>
        `);
        resolve(); // Resolve anyway to prevent hanging
      } else {
        console.log(`⏳ Waiting for dependencies... (${attempts}/${maxAttempts})`);
        console.log('🔍 Missing classes:', missingClasses);
        setTimeout(checkDependencies, 100);
      }
    };
    
    checkDependencies();
  });
}

// Enhanced error message function
function showErrorMessage(message) {
  const mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="error-container" style="
        text-align: center; 
        padding: 2rem; 
        color: #d32f2f;
        background: #ffebee;
        border-radius: 8px;
        margin: 2rem;
        border: 1px solid #ffcdd2;
      ">
        <i class="fas fa-exclamation-triangle" style="
          font-size: 3rem; 
          margin-bottom: 1rem;
          color: #f44336;
        "></i>
        <h2 style="margin: 0 0 1rem 0; color: #d32f2f;">Terjadi Kesalahan</h2>
        <div style="margin-bottom: 2rem; line-height: 1.6;">${message}</div>
        
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.location.reload()" style="
            background: #2196F3;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            <i class="fas fa-redo"></i> Muat Ulang Halaman
          </button>
          
          <button onclick="console.clear(); window.location.hash = ''" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          ">
            <i class="fas fa-home"></i> Reset ke Beranda
          </button>
        </div>
        
        <details style="margin-top: 2rem; text-align: left;">
          <summary style="cursor: pointer; font-weight: bold;">🔧 Detail Teknis</summary>
          <div style="
            background: #f5f5f5; 
            padding: 1rem; 
            border-radius: 4px; 
            margin-top: 1rem;
            font-family: monospace;
            font-size: 0.9rem;
          ">
            <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
            <p><strong>URL:</strong> ${window.location.href}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        </details>
      </div>
    `;
  }
}

console.log('📝 App.js loaded and ready');