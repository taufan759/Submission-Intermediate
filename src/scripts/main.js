// main.js - FINAL FIXED VERSION
console.log('🚀 Loading PetaBicara App...');

// STEP 1: Import utilities first (no dependencies)
console.log('📁 Loading utilities...');
import './utils/router.js';
import './utils/camera-helper.js';
import './utils/indexeddb-helper.js';
import './utils/push-notification.js';
import './utils/service-worker-register.js';
import './utils/debug-tools.js';
import './utils/favorites-helper.js';
import './utils/notification-ui-helper.js';

// STEP 2: Import API service (no dependencies on other app classes)
console.log('📡 Loading API service...');
import './api/api-service.js';

// STEP 3: Import Models (depends on API service)
console.log('🗄️ Loading models...');
import './model/story-model.js';

// STEP 4: Import Components (no dependencies on views/presenters)
console.log('🧩 Loading components...');
import './view/components/footer.js';
import './view/components/navbar.js';
import './view/components/story-card.js';

// STEP 5: Import Views (depends on components)
console.log('📺 Loading views...');
import './view/pages/add-story-view.js';
import './view/pages/home-view.js';
import './view/pages/login-view.js';
import './view/pages/register-view.js';
import './view/pages/map-view.js';
import './view/pages/favorites-view.js';
import './view/pages/settings-view.js';
import './view/app-view.js';

// STEP 6: Import Presenters (depends on views and models)
console.log('🎭 Loading presenters...');
import './presenter/pages/home-presenter.js';
import './presenter/pages/add-story-presenter.js';
import './presenter/pages/login-presenter.js';
import './presenter/pages/register-presenter.js';
import './presenter/pages/map-presenter.js';
import './presenter/pages/favorites-presenter.js';
import './presenter/pages/settings-presenter.js';
import './presenter/app-presenter.js';

// STEP 7: Import main app last (depends on everything)
console.log('🏗️ Loading main app...');
import './app.js';

console.log('✅ All PetaBicara App dependencies loaded successfully!');

// VERIFICATION: Check if all required classes are loaded
setTimeout(() => {
  console.log('🔍 Verifying all classes are loaded...');
  
  const requiredClasses = [
    'Router', 'StoryModel', 'AppView', 'AppPresenter',
    'HomeView', 'HomePresenter',
    'AddStoryView', 'AddStoryPresenter', 
    'LoginView', 'LoginPresenter',
    'RegisterView', 'RegisterPresenter',
    'MapView', 'MapPresenter',
    'FavoritesView', 'FavoritesPresenter',
    'SettingsView', 'SettingsPresenter'
  ];
  
  const missing = requiredClasses.filter(cls => !window[cls]);
  
  if (missing.length > 0) {
    console.error('❌ Missing classes:', missing);
    console.error('🔧 Please ensure all files are properly exported to window object');
    
    // Show user-friendly error
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="
          text-align: center; 
          padding: 3rem; 
          background: #ffebee; 
          border-radius: 8px; 
          margin: 2rem;
          color: #d32f2f;
        ">
          <h2>🔧 Loading Error</h2>
          <p>Missing required classes: <strong>${missing.join(', ')}</strong></p>
          <p>Please check the browser console for more details.</p>
          <button onclick="window.location.reload()" style="
            background: #2196F3;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
          ">
            🔄 Reload Page
          </button>
        </div>
      `;
    }
  } else {
    console.log('✅ All required classes loaded successfully!');
    console.log('🎉 PetaBicara App ready!');
  }
}, 1000);