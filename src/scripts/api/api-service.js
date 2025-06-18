class ApiService {
  constructor() {
    this.baseUrl = 'https://story-api.dicoding.dev/v1';
    this.isOnline = navigator.onLine;
    this.requestQueue = [];
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Network back online');
      this.isOnline = true;
      this.processRequestQueue();
    });
    
    window.addEventListener('offline', () => {
      console.log('Network went offline');
      this.isOnline = false;
    });
  }

  // FIXED: Enhanced fetch with timeout and retry logic
  async fetchWithTimeout(url, options = {}, timeout = 8000) {
    // Check if we're offline first
    if (!this.isOnline && !navigator.onLine) {
      throw new Error('No internet connection');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // FIXED: Enhanced retry logic
  async fetchWithRetry(url, options = {}, maxRetries = 2) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`API request attempt ${attempt + 1}/${maxRetries + 1}: ${url}`);
        
        const response = await this.fetchWithTimeout(url, options);
        
        // If we get here, the request succeeded
        return response;
      } catch (error) {
        lastError = error;
        console.warn(`API request attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on certain errors
        if (error.message.includes('No internet connection') || 
            error.message.includes('401') || 
            error.message.includes('403')) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  async register(name, email, password) {
    try {
      console.log('Registering user:', name, email);
      
      if (!this.isOnline) {
        throw new Error('Tidak dapat mendaftar saat offline. Silakan coba lagi saat online.');
      }
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();
      console.log('Register response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific offline errors
      if (error.message.includes('No internet connection') || 
          error.message.includes('timeout')) {
        throw new Error('Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.');
      }
      
      throw new Error(`Gagal mendaftar: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      console.log('Login attempt for:', email);
      
      if (!this.isOnline) {
        throw new Error('Tidak dapat login saat offline. Silakan coba lagi saat online.');
      }
      
      const response = await this.fetchWithRetry(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();
      console.log('Login response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      // Simpan token dengan benar
      localStorage.setItem('token', responseJson.loginResult.token);
      localStorage.setItem('user', JSON.stringify(responseJson.loginResult));
      
      return responseJson;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific offline errors
      if (error.message.includes('No internet connection') || 
          error.message.includes('timeout')) {
        throw new Error('Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi.');
      }
      
      throw new Error(`Gagal login: ${error.message}`);
    }
  }

  async getAllStories() {
    try {
      const token = localStorage.getItem('token');
      console.log('Getting stories with token:', token ? 'Token exists' : 'No token');
      
      if (!token) throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');

      // FIXED: Check if offline and return cached data
      if (!this.isOnline) {
        console.log('Offline - trying to get cached stories');
        const cachedStories = await this.getCachedStories();
        if (cachedStories && cachedStories.length > 0) {
          console.log('Returning cached stories:', cachedStories.length);
          return cachedStories;
        } else {
          throw new Error('Tidak ada koneksi internet dan tidak ada data tersimpan');
        }
      }

      const response = await this.fetchWithRetry(`${this.baseUrl}/stories?location=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseJson = await response.json();
      console.log('Stories response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      // FIXED: Cache stories for offline use
      await this.cacheStories(responseJson.listStory);

      return responseJson.listStory;
    } catch (error) {
      console.error('Error fetching stories:', error);
      
      // Handle specific errors
      if (error.message.includes('Token tidak ditemukan')) {
        if (window.router) {
          window.router.navigateTo('/masuk');
        }
        return [];
      }
      
      // If online request fails, try cached data
      if (this.isOnline) {
        console.log('Online request failed, trying cached stories');
        const cachedStories = await this.getCachedStories();
        if (cachedStories && cachedStories.length > 0) {
          console.log('Returning cached stories as fallback');
          return cachedStories;
        }
      }
      
      // Return empty array to prevent app crashes
      return [];
    }
  }

  // FIXED: Enhanced addNewStory with offline queue
  async addNewStory(description, photoBlob, lat, lon) {
    try {
      const token = localStorage.getItem('token');
      console.log('Adding new story with token:', token ? 'Token exists' : 'No token');
      
      if (!token) throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');

      // Create form data
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photoBlob, 'photo.jpg');
      
      // Only add lat/lon if they exist
      if (lat !== null && lon !== null) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      // FIXED: Handle offline case
      if (!this.isOnline) {
        console.log('Offline - queueing story for later upload');
        await this.queueOfflineStory({ description, photoBlob, lat, lon, token });
        
        // Return a mock success response
        return {
          error: false,
          message: 'Cerita disimpan offline dan akan diunggah saat online'
        };
      }

      console.log('Sending request to add story');
      const response = await this.fetchWithRetry(`${this.baseUrl}/stories`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const responseJson = await response.json();
      console.log('Add story response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson;
    } catch (error) {
      console.error('Error adding story:', error);
      
      // Handle offline case
      if (error.message.includes('No internet connection') || 
          error.message.includes('timeout')) {
        console.log('Network error - queueing story for later upload');
        const token = localStorage.getItem('token');
        await this.queueOfflineStory({ description, photoBlob, lat, lon, token });
        
        return {
          error: false,
          message: 'Cerita disimpan offline dan akan diunggah saat online'
        };
      }
      
      throw new Error(`Gagal menambah cerita: ${error.message}`);
    }
  }

  // FIXED: Cache stories in IndexedDB or localStorage
  async cacheStories(stories) {
    try {
      if (window.indexedDBHelper) {
        await window.indexedDBHelper.saveOfflineStories(stories);
        console.log('Stories cached in IndexedDB');
      } else {
        // Fallback to localStorage with size limit
        const storiesData = JSON.stringify(stories);
        if (storiesData.length < 2000000) { // ~2MB limit
          localStorage.setItem('cached_stories', storiesData);
          localStorage.setItem('cached_stories_timestamp', Date.now().toString());
          console.log('Stories cached in localStorage');
        }
      }
    } catch (error) {
      console.warn('Failed to cache stories:', error);
    }
  }

  // FIXED: Get cached stories
  async getCachedStories() {
    try {
      if (window.indexedDBHelper) {
        const cachedStories = await window.indexedDBHelper.getOfflineStories();
        return cachedStories || [];
      } else {
        const cachedData = localStorage.getItem('cached_stories');
        const timestamp = localStorage.getItem('cached_stories_timestamp');
        
        if (cachedData && timestamp) {
          const age = Date.now() - parseInt(timestamp);
          // Return cached data if less than 24 hours old
          if (age < 24 * 60 * 60 * 1000) {
            return JSON.parse(cachedData);
          }
        }
        return [];
      }
    } catch (error) {
      console.warn('Failed to get cached stories:', error);
      return [];
    }
  }

  // FIXED: Queue story for offline upload
  async queueOfflineStory(storyData) {
    try {
      const offlineStory = {
        id: Date.now().toString(),
        ...storyData,
        timestamp: Date.now()
      };

      if (window.indexedDBHelper) {
        await window.indexedDBHelper.saveOfflineStory(offlineStory);
        console.log('Story queued in IndexedDB');
      } else {
        const queue = JSON.parse(localStorage.getItem('offline_story_queue') || '[]');
        queue.push(offlineStory);
        localStorage.setItem('offline_story_queue', JSON.stringify(queue));
        console.log('Story queued in localStorage');
      }

      // Register background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('background-sync-story');
          console.log('Background sync registered');
        } catch (error) {
          console.warn('Background sync registration failed:', error);
        }
      }
    } catch (error) {
      console.error('Failed to queue offline story:', error);
      throw error;
    }
  }

  // FIXED: Process queued offline requests
  async processRequestQueue() {
    if (!this.isOnline) return;

    try {
      console.log('Processing offline story queue...');
      
      let queue = [];
      if (window.indexedDBHelper) {
        queue = await window.indexedDBHelper.getOfflineStoryQueue() || [];
      } else {
        queue = JSON.parse(localStorage.getItem('offline_story_queue') || '[]');
      }

      if (queue.length === 0) {
        console.log('No offline stories to process');
        return;
      }

      console.log(`Processing ${queue.length} offline stories`);

      for (const story of queue) {
        try {
          const formData = new FormData();
          formData.append('description', story.description);
          formData.append('photo', story.photoBlob, 'photo.jpg');
          
          if (story.lat !== null && story.lon !== null) {
            formData.append('lat', story.lat);
            formData.append('lon', story.lon);
          }

          const response = await this.fetchWithTimeout(`${this.baseUrl}/stories`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${story.token}`
            },
            body: formData,
          });

          if (response.ok) {
            console.log('Offline story uploaded successfully:', story.id);
            
            // Remove from queue
            if (window.indexedDBHelper) {
              await window.indexedDBHelper.removeOfflineStory(story.id);
            } else {
              const newQueue = queue.filter(q => q.id !== story.id);
              localStorage.setItem('offline_story_queue', JSON.stringify(newQueue));
            }

            // Show notification
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('Cerita Diunggah', {
                  body: 'Cerita offline berhasil diunggah!',
                  icon: '/Submission-Intermediate/icons/icon-192x192.png'
                });
              });
            }
          }
        } catch (error) {
          console.error('Failed to upload offline story:', story.id, error);
        }
      }
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  }
  
  // Add authentication helper methods
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // FIXED: Get network status
  getNetworkStatus() {
    return {
      isOnline: this.isOnline && navigator.onLine,
      lastCheck: Date.now()
    };
  }
}

// Create global apiService instance
const apiService = new ApiService();

// Make apiService available globally
window.apiService = apiService;