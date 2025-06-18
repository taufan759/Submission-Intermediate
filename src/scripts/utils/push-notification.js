// Push Notification Helper - FIXED WITH STORY API INTEGRATION
class PushNotificationHelper {
  constructor() {
    // FIXED: VAPID Keys dari Dicoding Story API
    this.vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    
    // FIXED: Story API Base URL
    this.apiBaseUrl = 'https://story-api.dicoding.dev/v1';
    
    this.basePath = '/Submission-Intermediate';
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.registration = null;
    this.subscription = null;
    
    console.log('Push notifications supported:', this.isSupported);
  }
  
  // Initialize push notifications
  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }
    
    try {
      // Wait for service worker to be ready
      this.registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready for push notifications');
      
      // Check existing subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('Existing push subscription found');
        // Send subscription to Story API
        await this.sendSubscriptionToStoryAPI(this.subscription);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }
  
  // Request permission for notifications
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }
    
    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    console.log('Notification permission:', permission);
    
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }
    
    return permission === 'granted';
  }
  
  // Subscribe to push notifications
  async subscribe() {
    try {
      // Request permission first
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Permission not granted');
      }
      
      // Initialize if not already done
      if (!this.registration) {
        const initialized = await this.init();
        if (!initialized) {
          throw new Error('Failed to initialize service worker');
        }
      }
      
      // Convert VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      
      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
      
      console.log('Push subscription successful:', this.subscription);
      
      // FIXED: Send subscription to Story API
      await this.sendSubscriptionToStoryAPI(this.subscription);
      
      // Save subscription locally
      await this.saveSubscriptionLocally(this.subscription);
      
      // Show success notification
      await this.showServiceWorkerNotification(
        'Notifikasi Aktif!',
        'Kamu akan mendapat notifikasi untuk cerita baru.'
      );
      
      return this.subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }
  
  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (!this.subscription) {
        if (this.registration) {
          this.subscription = await this.registration.pushManager.getSubscription();
        }
      }
      
      if (this.subscription) {
        // FIXED: Remove from Story API first
        await this.removeSubscriptionFromStoryAPI(this.subscription);
        
        const success = await this.subscription.unsubscribe();
        
        if (success) {
          console.log('Push notification unsubscribed successfully');
          
          // Remove from local storage
          await this.removeSubscriptionLocally();
          
          this.subscription = null;
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }
  
  // FIXED: Send subscription to Story API
  async sendSubscriptionToStoryAPI(subscription) {
    try {
      console.log('Sending subscription to Story API...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      };
      
      console.log('Subscription data to send:', subscriptionData);
      
      const response = await fetch(`${this.apiBaseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscriptionData)
      });
      
      const responseJson = await response.json();
      console.log('Story API subscription response:', responseJson);
      
      if (responseJson.error) {
        throw new Error(responseJson.message || 'Failed to subscribe to Story API');
      }
      
      // Save the subscription ID for later use
      if (responseJson.data && responseJson.data.id) {
        localStorage.setItem('story-api-subscription-id', responseJson.data.id);
      }
      
      return responseJson;
    } catch (error) {
      console.error('Error sending subscription to Story API:', error);
      // Don't throw error - local subscription still works
      throw error;
    }
  }
  
  // FIXED: Remove subscription from Story API
  async removeSubscriptionFromStoryAPI(subscription) {
    try {
      console.log('Removing subscription from Story API...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for unsubscribe');
        return;
      }
      
      const subscriptionData = {
        endpoint: subscription.endpoint
      };
      
      const response = await fetch(`${this.apiBaseUrl}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscriptionData)
      });
      
      const responseJson = await response.json();
      console.log('Story API unsubscribe response:', responseJson);
      
      if (responseJson.error) {
        console.warn('Failed to unsubscribe from Story API:', responseJson.message);
      } else {
        // Remove the stored subscription ID
        localStorage.removeItem('story-api-subscription-id');
      }
      
    } catch (error) {
      console.error('Error removing subscription from Story API:', error);
    }
  }
  
  // Show notification via Service Worker (supports actions)
  async showServiceWorkerNotification(title, body, options = {}) {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return false;
    }
    
    try {
      const defaultOptions = {
        body: body,
        icon: `${this.basePath}/icons/icon-192x192.png`,
        badge: `${this.basePath}/icons/icon-72x72.png`,
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: Math.random(),
          url: `${this.basePath}/`
        },
        actions: [
          {
            action: 'open',
            title: 'Buka App',
            icon: `${this.basePath}/icons/icon-72x72.png`
          },
          {
            action: 'close',
            title: 'Tutup'
          }
        ],
        requireInteraction: false,
        silent: false,
        tag: 'peta-bicara-notification'
      };
      
      const finalOptions = { ...defaultOptions, ...options };
      
      await this.registration.showNotification(title, finalOptions);
      console.log('Service Worker notification shown successfully');
      return true;
    } catch (error) {
      console.error('Error showing Service Worker notification:', error);
      return false;
    }
  }
  
  // Show basic notification (no actions)
  showBasicNotification(title, body, icon = null) {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return false;
    }
    
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }
    
    try {
      const iconPath = icon || `${this.basePath}/icons/icon-192x192.png`;
      
      const notification = new Notification(title, {
        body: body,
        icon: iconPath,
        badge: `${this.basePath}/icons/icon-72x72.png`,
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: Math.random(),
          url: `${this.basePath}/`
        },
        silent: false,
        tag: 'peta-bicara-basic'
      });
      
      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
        if (window.router) {
          window.router.navigateTo('/');
        } else {
          window.location.href = `${this.basePath}/`;
        }
      });
      
      notification.addEventListener('error', (e) => {
        console.error('Notification error:', e);
      });
      
      setTimeout(() => {
        notification.close();
      }, 8000);
      
      console.log('Basic notification shown successfully');
      return true;
    } catch (error) {
      console.error('Error showing basic notification:', error);
      return false;
    }
  }
  
  // Check if user is subscribed to Story API
  async isSubscribedToStoryAPI() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const subscriptionId = localStorage.getItem('story-api-subscription-id');
      return !!subscriptionId;
    } catch (error) {
      console.error('Error checking Story API subscription:', error);
      return false;
    }
  }
  
  // Save subscription locally using IndexedDB
  async saveSubscriptionLocally(subscription) {
    try {
      if (window.indexedDBHelper) {
        await window.indexedDBHelper.saveSetting('pushSubscription', {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: this.arrayBufferToBase64(subscription.getKey('auth'))
          },
          subscribedAt: new Date().toISOString(),
          basePath: this.basePath,
          storyApiSubscriptionId: localStorage.getItem('story-api-subscription-id')
        });
        console.log('Push subscription saved locally');
      } else {
        console.warn('IndexedDB helper not available, using localStorage fallback');
        localStorage.setItem('pwa-push-subscription', JSON.stringify({
          endpoint: subscription.endpoint,
          subscribedAt: new Date().toISOString(),
          basePath: this.basePath
        }));
      }
    } catch (error) {
      console.error('Error saving subscription locally:', error);
    }
  }
  
  // Remove subscription locally
  async removeSubscriptionLocally() {
    try {
      if (window.indexedDBHelper) {
        await window.indexedDBHelper.saveSetting('pushSubscription', null);
        console.log('Push subscription removed locally');
      } else {
        localStorage.removeItem('pwa-push-subscription');
      }
      localStorage.removeItem('story-api-subscription-id');
    } catch (error) {
      console.error('Error removing subscription locally:', error);
    }
  }
  
  // Get subscription status and info
  async getSubscriptionInfo() {
    try {
      const isSubscribed = await this.isSubscribed();
      const isSubscribedToStoryAPI = await this.isSubscribedToStoryAPI();
      const localSubscription = window.indexedDBHelper ? 
        await window.indexedDBHelper.getSetting('pushSubscription') : 
        JSON.parse(localStorage.getItem('pwa-push-subscription') || 'null');
      
      return {
        isSubscribed,
        isSubscribedToStoryAPI,
        hasPermission: Notification.permission === 'granted',
        isSupported: this.isSupported,
        subscription: this.subscription,
        localSubscription,
        basePath: this.basePath,
        storyApiSubscriptionId: localStorage.getItem('story-api-subscription-id')
      };
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return {
        isSubscribed: false,
        isSubscribedToStoryAPI: false,
        hasPermission: false,
        isSupported: this.isSupported,
        subscription: null,
        localSubscription: null,
        basePath: this.basePath
      };
    }
  }
  
  // Check if user is subscribed
  async isSubscribed() {
    try {
      if (!this.registration) {
        await this.init();
      }
      
      this.subscription = await this.registration.pushManager.getSubscription();
      return !!this.subscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
  
  // Convert VAPID key to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
  
  // Helper function to convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return window.btoa(binary);
  }
  
  // Test push notification
  async testNotification() {
    try {
      console.log('Testing notification...');
      
      if (Notification.permission !== 'granted') {
        throw new Error('Izin notifikasi belum diberikan');
      }
      
      // Try Service Worker notification first
      if (this.registration) {
        console.log('Showing test notification via Service Worker...');
        const swSuccess = await this.showServiceWorkerNotification(
          '🧪 Test Notifikasi',
          'Ini adalah test notifikasi dari Peta Bicara! Notifikasi melalui Service Worker berfungsi dengan baik!',
          {
            tag: 'test-notification',
            data: { 
              test: true, 
              url: `${this.basePath}/` 
            }
          }
        );
        
        if (swSuccess) {
          return true;
        }
      }
      
      // Fallback to basic notification
      console.log('Showing test notification via basic notification...');
      const basicSuccess = this.showBasicNotification(
        '🧪 Test Notifikasi', 
        'Ini adalah test notifikasi dari Peta Bicara! Notifikasi dasar berfungsi dengan baik!'
      );
      
      return basicSuccess;
      
    } catch (error) {
      console.error('Error testing push notification:', error);
      return false;
    }
  }
}

// Create global instance
const pushNotificationHelper = new PushNotificationHelper();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing push notifications with Story API...');
  
  try {
    await pushNotificationHelper.init();
    
    // Auto-subscribe if user previously gave permission
    const hasStoredSubscription = window.indexedDBHelper ? 
      await window.indexedDBHelper.getSetting('pushSubscription') : 
      JSON.parse(localStorage.getItem('pwa-push-subscription') || 'null');
    
    if (hasStoredSubscription && Notification.permission === 'granted') {
      const isCurrentlySubscribed = await pushNotificationHelper.isSubscribed();
      if (!isCurrentlySubscribed) {
        console.log('Re-subscribing to push notifications...');
        await pushNotificationHelper.subscribe();
      }
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
});

// Make available globally
window.pushNotificationHelper = pushNotificationHelper;