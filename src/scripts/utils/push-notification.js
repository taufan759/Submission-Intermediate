// Push Notification 
class PushNotificationHelper {
  constructor() {
    // VAPID Keys (Public Key) - Replace with your actual VAPID keys
    this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI6DLldHta0mnPj1xhwMmpNg4HSHTnlZdHnPfU36tMEKRz72hT2RofJhkQ';
    
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
        // Send subscription to server if needed
        await this.sendSubscriptionToServer(this.subscription);
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
    
    // Check current permission status
    let permission = Notification.permission;
    
    if (permission === 'default') {
      // Request permission
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
      
      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      // Save subscription locally
      await this.saveSubscriptionLocally(this.subscription);
      
      // Show success notification via Service Worker (supports actions)
      await this.showServiceWorkerNotification(
        'Notifikasi Aktif!',
        'Kamu akan mendapat notifikasi untuk cerita baru dan update terbaru.'
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
        // Try to get existing subscription
        if (this.registration) {
          this.subscription = await this.registration.pushManager.getSubscription();
        }
      }
      
      if (this.subscription) {
        const success = await this.subscription.unsubscribe();
        
        if (success) {
          console.log('Push notification unsubscribed successfully');
          
          // Remove from server
          await this.removeSubscriptionFromServer(this.subscription);
          
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
  
  // Show notification via Service Worker (supports actions)
  async showServiceWorkerNotification(title, body, options = {}) {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return false;
    }
    
    try {
      const defaultOptions = {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: Math.random(),
          url: '/'
        },
        actions: [
          {
            action: 'open',
            title: 'Buka App',
            icon: '/favicon.ico'
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
  
  // Show basic notification (no actions) - FIXED VERSION
  showBasicNotification(title, body, icon = '/favicon.ico') {
    if (!this.isSupported) {
      console.warn('Notifications not supported');
      return false;
    }
    
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }
    
    try {
      // Basic notification WITHOUT actions (this fixes the error)
      const notification = new Notification(title, {
        body: body,
        icon: icon,
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: Math.random()
        },
        silent: false,
        tag: 'peta-bicara-basic'
        // NO ACTIONS HERE - this was causing the error
      });
      
      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
        // Navigate to relevant page
        if (window.router) {
          window.router.navigateTo('/');
        }
      });
      
      notification.addEventListener('error', (e) => {
        console.error('Notification error:', e);
      });
      
      // Auto close after 8 seconds
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
  
  // Alias for backward compatibility
  showLocalNotification(title, body, icon) {
    return this.showBasicNotification(title, body, icon);
  }
  
  // Send subscription to server (you'll need to implement server-side)
  async sendSubscriptionToServer(subscription) {
    try {
      console.log('Sending subscription to server...');
      
      // This is where you would send the subscription to your backend
      // For now, we'll just log it and save locally
      
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      console.log('Subscription data:', subscriptionData);
      
      // Here you would typically POST to your server:
      /*
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscriptionData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }
      */
      
      return subscriptionData;
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      // Don't throw error - local subscription still works for testing
    }
  }
  
  // Remove subscription from server
  async removeSubscriptionFromServer(subscription) {
    try {
      console.log('Removing subscription from server...');
      
      // This is where you would remove the subscription from your backend
      const subscriptionData = {
        endpoint: subscription.endpoint,
        timestamp: new Date().toISOString()
      };
      
      console.log('Removing subscription:', subscriptionData);
      
      // Here you would typically DELETE from your server:
      /*
      const response = await fetch('/api/push-subscriptions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(subscriptionData)
      });
      */
      
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }
  
  // Save subscription locally using IndexedDB
  async saveSubscriptionLocally(subscription) {
    try {
      if (window.indexedDBHelper) {
        await window.indexedDBHelper.saveSetting('pushSubscription', {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          },
          subscribedAt: new Date().toISOString()
        });
        console.log('Push subscription saved locally');
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
      }
    } catch (error) {
      console.error('Error removing subscription locally:', error);
    }
  }
  
  // Get subscription status and info
  async getSubscriptionInfo() {
    try {
      const isSubscribed = await this.isSubscribed();
      const localSubscription = window.indexedDBHelper ? 
        await window.indexedDBHelper.getSetting('pushSubscription') : null;
      
      return {
        isSubscribed,
        hasPermission: Notification.permission === 'granted',
        isSupported: this.isSupported,
        subscription: this.subscription,
        localSubscription
      };
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return {
        isSubscribed: false,
        hasPermission: false,
        isSupported: this.isSupported,
        subscription: null,
        localSubscription: null
      };
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
  
  // Test push notification - FIXED VERSION
  async testNotification() {
    try {
      console.log('Testing notification...');
      
      if (Notification.permission !== 'granted') {
        throw new Error('Izin notifikasi belum diberikan');
      }
      
      // Try Service Worker notification first (with actions)
      if (this.registration) {
        console.log('Showing test notification via Service Worker...');
        const swSuccess = await this.showServiceWorkerNotification(
          '🧪 Test Notifikasi',
          'Ini adalah test notifikasi dari Peta Bicara!\nNotifikasi melalui Service Worker berfungsi dengan baik!',
          {
            tag: 'test-notification',
            data: { test: true, url: '/' }
          }
        );
        
        if (swSuccess) {
          return true;
        }
      }
      
      // Fallback to basic notification (no actions)
      console.log('Showing test notification via basic notification...');
      const basicSuccess = this.showBasicNotification(
        '🧪 Test Notifikasi', 
        'Ini adalah test notifikasi dari Peta Bicara!\nNotifikasi dasar berfungsi dengan baik!'
      );
      
      return basicSuccess;
      
    } catch (error) {
      console.error('Error testing push notification:', error);
      return false;
    }
  }
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return window.btoa(binary);
}

// Create global instance
const pushNotificationHelper = new PushNotificationHelper();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing push notifications...');
  
  try {
    await pushNotificationHelper.init();
    
    // Auto-subscribe if user previously gave permission
    const hasStoredSubscription = window.indexedDBHelper ? 
      await window.indexedDBHelper.getSetting('pushSubscription') : null;
    
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