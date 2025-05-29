// IndexedDB Helper untuk Peta Bicara
class IndexedDBHelper {
  constructor() {
    this.dbName = 'PetaBicaraDB';
    this.dbVersion = 1;
    this.db = null;
    
    // Object stores
    this.stores = {
      favorites: 'favorites',
      offlineStories: 'offlineStories',
      settings: 'settings'
    };
  }
  
  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      console.log('Initializing IndexedDB...');
      
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('IndexedDB initialization failed:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('Upgrading IndexedDB schema...');
        const db = event.target.result;
        
        // Create favorites store
        if (!db.objectStoreNames.contains(this.stores.favorites)) {
          const favoritesStore = db.createObjectStore(this.stores.favorites, {
            keyPath: 'id'
          });
          favoritesStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Favorites store created');
        }
        
        // Create offline stories store
        if (!db.objectStoreNames.contains(this.stores.offlineStories)) {
          const offlineStore = db.createObjectStore(this.stores.offlineStories, {
            keyPath: 'id',
            autoIncrement: true
          });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('Offline stories store created');
        }
        
        // Create settings store
        if (!db.objectStoreNames.contains(this.stores.settings)) {
          const settingsStore = db.createObjectStore(this.stores.settings, {
            keyPath: 'key'
          });
          console.log('Settings store created');
        }
      };
    });
  }
  
  // Generic method to perform transactions
  async performTransaction(storeName, mode, operation) {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      
      transaction.oncomplete = () => {
        console.log(`Transaction completed for ${storeName}`);
      };
      
      transaction.onerror = () => {
        console.error(`Transaction failed for ${storeName}:`, transaction.error);
        reject(transaction.error);
      };
      
      try {
        const request = operation(store);
        
        if (request) {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        } else {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // === FAVORITES METHODS ===
  
  // Add story to favorites
  async addToFavorites(story) {
    console.log('Adding story to favorites:', story.id);
    
    const favoriteItem = {
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      lat: story.lat,
      lon: story.lon,
      addedToFavoritesAt: new Date().toISOString()
    };
    
    return this.performTransaction(
      this.stores.favorites,
      'readwrite',
      (store) => store.add(favoriteItem)
    );
  }
  
  // Remove story from favorites
  async removeFromFavorites(storyId) {
    console.log('Removing story from favorites:', storyId);
    
    return this.performTransaction(
      this.stores.favorites,
      'readwrite',
      (store) => store.delete(storyId)
    );
  }
  
  // Get all favorite stories
  async getAllFavorites() {
    console.log('Getting all favorite stories');
    
    return this.performTransaction(
      this.stores.favorites,
      'readonly',
      (store) => store.getAll()
    );
  }
  
  // Check if story is in favorites
  async isFavorite(storyId) {
    return this.performTransaction(
      this.stores.favorites,
      'readonly',
      (store) => store.get(storyId)
    ).then(result => !!result);
  }
  
  // Get favorite stories count
  async getFavoritesCount() {
    return this.performTransaction(
      this.stores.favorites,
      'readonly',
      (store) => store.count()
    );
  }
  
  // === OFFLINE STORIES METHODS ===
  
  // Save story for offline submission
  async saveOfflineStory(storyData) {
    console.log('Saving story for offline submission');
    
    const offlineStory = {
      description: storyData.description,
      photoBlob: storyData.photoBlob,
      lat: storyData.lat,
      lon: storyData.lon,
      token: localStorage.getItem('token'),
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    return this.performTransaction(
      this.stores.offlineStories,
      'readwrite',
      (store) => store.add(offlineStory)
    );
  }
  
  // Get all unsynced offline stories
  async getUnsyncedStories() {
    console.log('Getting unsynced offline stories');
    
    return this.performTransaction(
      this.stores.offlineStories,
      'readonly',
      (store) => store.getAll()
    ).then(stories => stories.filter(story => !story.synced));
  }
  
  // Mark offline story as synced
  async markStorySynced(storyId) {
    console.log('Marking story as synced:', storyId);
    
    return this.performTransaction(
      this.stores.offlineStories,
      'readwrite',
      async (store) => {
        const story = await new Promise((resolve, reject) => {
          const request = store.get(storyId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        if (story) {
          story.synced = true;
          return store.put(story);
        }
      }
    );
  }
  
  // Remove synced offline story
  async removeOfflineStory(storyId) {
    console.log('Removing offline story:', storyId);
    
    return this.performTransaction(
      this.stores.offlineStories,
      'readwrite',
      (store) => store.delete(storyId)
    );
  }
  
  // === SETTINGS METHODS ===
  
  // Save app setting
  async saveSetting(key, value) {
    console.log('Saving setting:', key);
    
    const setting = { key, value, updatedAt: new Date().toISOString() };
    
    return this.performTransaction(
      this.stores.settings,
      'readwrite',
      (store) => store.put(setting)
    );
  }
  
  // Get app setting
  async getSetting(key) {
    return this.performTransaction(
      this.stores.settings,
      'readonly',
      (store) => store.get(key)
    ).then(result => result ? result.value : null);
  }
  
  // === UTILITY METHODS ===
  
  // Clear all data
  async clearAllData() {
    console.log('Clearing all IndexedDB data');
    
    const stores = Object.values(this.stores);
    const promises = stores.map(storeName => 
      this.performTransaction(
        storeName,
        'readwrite',
        (store) => store.clear()
      )
    );
    
    return Promise.all(promises);
  }
  
  // Get database size info
  async getDatabaseInfo() {
    if (!this.db) {
      await this.init();
    }
    
    const info = {
      name: this.dbName,
      version: this.dbVersion,
      stores: {}
    };
    
    for (const [key, storeName] of Object.entries(this.stores)) {
      try {
        const count = await this.performTransaction(
          storeName,
          'readonly',
          (store) => store.count()
        );
        info.stores[key] = { name: storeName, count };
      } catch (error) {
        console.error(`Error getting info for store ${storeName}:`, error);
        info.stores[key] = { name: storeName, count: 0, error: error.message };
      }
    }
    
    return info;
  }
  
  // Export favorites data (for backup)
  async exportFavorites() {
    const favorites = await this.getAllFavorites();
    return {
      exportDate: new Date().toISOString(),
      version: this.dbVersion,
      favorites: favorites
    };
  }
  
  // Import favorites data (from backup)
  async importFavorites(data) {
    if (!data.favorites || !Array.isArray(data.favorites)) {
      throw new Error('Invalid favorites data format');
    }
    
    console.log(`Importing ${data.favorites.length} favorites`);
    
    const promises = data.favorites.map(favorite => 
      this.addToFavorites(favorite).catch(error => {
        console.warn(`Failed to import favorite ${favorite.id}:`, error);
      })
    );
    
    return Promise.allSettled(promises);
  }
}

// Create global instance
const indexedDBHelper = new IndexedDBHelper();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  indexedDBHelper.init().catch(error => {
    console.error('Failed to initialize IndexedDB:', error);
  });
});

// Make available globally
window.indexedDBHelper = indexedDBHelper;