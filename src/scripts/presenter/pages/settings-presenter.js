// Settings Presenter - Handle settings page logic
class SettingsPresenter {
  constructor({ view }) {
    this.view = view;
  }

  async init() {
    // Bind event handlers
    this.view.bindEvents({
      onEnableNotifications: this.enableNotifications.bind(this),
      onDisableNotifications: this.disableNotifications.bind(this),
      onTestNotification: this.testNotification.bind(this),
      onInstallApp: this.installApp.bind(this),
      onUpdateApp: this.updateApp.bind(this),
      onExportFavorites: this.exportFavorites.bind(this),
      onSyncOffline: this.syncOfflineStories.bind(this),
      onClearData: this.clearAllData.bind(this)
    });

    // Load initial data
    await this.loadSettingsData();
  }

  async loadSettingsData() {
    try {
      // Check push notification status
      if (window.pushNotificationHelper) {
        const notificationInfo = await window.pushNotificationHelper.getSubscriptionInfo();
        await this.view.updateNotificationToggle(notificationInfo.isSubscribed);
        
        if (notificationInfo.isSubscribed) {
          this.view.showStatus('Push notifikasi aktif', 'success');
          document.getElementById('testNotificationBtn').style.display = 'inline-block';
        } else if (!notificationInfo.isSupported) {
          this.view.showStatus('Push notifikasi tidak didukung di browser ini', 'error');
        }
      }

      // Check PWA status
      if (window.swRegister) {
        const swStatus = await window.swRegister.getStatus();
        await this.view.updateInstallStatus(swStatus.isInstalled);
        await this.view.updateServiceWorkerStatus(swStatus);
      }

      // Check IndexedDB data
      if (window.indexedDBHelper) {
        const dbInfo = await window.indexedDBHelper.getDatabaseInfo();
        const stats = {
          favoritesCount: dbInfo.stores.favorites?.count || 0,
          offlineCount: dbInfo.stores.offlineStories?.count || 0
        };
        await this.view.updateDataStats(stats);
      }
    } catch (error) {
      console.error('Error loading settings data:', error);
      this.view.showStatus('Gagal memuat data pengaturan', 'error');
    }
  }

  async enableNotifications() {
    try {
      this.view.showStatus('Mengaktifkan push notifikasi...', 'info');
      
      const subscription = await window.pushNotificationHelper.subscribe();
      
      if (subscription) {
        this.view.showStatus('Push notifikasi berhasil diaktifkan!', 'success');
        document.getElementById('testNotificationBtn').style.display = 'inline-block';
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      throw new Error('Gagal mengaktifkan notifikasi: ' + error.message);
    }
  }

  async disableNotifications() {
    try {
      this.view.showStatus('Menonaktifkan push notifikasi...', 'info');
      
      const success = await window.pushNotificationHelper.unsubscribe();
      
      if (success) {
        this.view.showStatus('Push notifikasi berhasil dinonaktifkan', 'info');
        document.getElementById('testNotificationBtn').style.display = 'none';
      }
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      throw new Error('Gagal menonaktifkan notifikasi: ' + error.message);
    }
  }

  async testNotification() {
    try {
      const success = await window.pushNotificationHelper.testNotification();
      if (!success) {
        this.view.showStatus('Gagal mengirim test notifikasi', 'error');
      }
    } catch (error) {
      console.error('Failed to test notification:', error);
      this.view.showStatus('Error: ' + error.message, 'error');
    }
  }

  async installApp() {
    try {
      if (window.swRegister) {
        await window.swRegister.promptInstall();
      }
    } catch (error) {
      console.error('Failed to install app:', error);
      this.view.showStatus('Gagal menginstall aplikasi', 'error');
    }
  }

  async updateApp() {
    try {
      if (window.swRegister && window.swRegister.registration?.waiting) {
        window.swRegister.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Failed to update app:', error);
      this.view.showStatus('Gagal memperbarui aplikasi', 'error');
    }
  }

  async exportFavorites() {
    try {
      const exportData = await window.indexedDBHelper.exportFavorites();
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `peta-bicara-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.view.showStatus('Data favorit berhasil diekspor', 'success');
    } catch (error) {
      console.error('Failed to export favorites:', error);
      this.view.showStatus('Gagal mengekspor data favorit', 'error');
    }
  }

  async syncOfflineStories() {
    try {
      this.view.showStatus('Menyinkronkan cerita offline...', 'info');
      
      const offlineStories = await window.indexedDBHelper.getUnsyncedStories();
      let syncedCount = 0;
      
      for (const story of offlineStories) {
        try {
          // Create FormData for API
          const formData = new FormData();
          formData.append('description', story.description);
          formData.append('photo', story.photoBlob);
          if (story.lat && story.lon) {
            formData.append('lat', story.lat);
            formData.append('lon', story.lon);
          }
          
          // Send to API
          const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${story.token}`
            },
            body: formData
          });
          
          if (response.ok) {
            await window.indexedDBHelper.removeOfflineStory(story.id);
            syncedCount++;
          }
        } catch (error) {
          console.error(`Failed to sync story ${story.id}:`, error);
        }
      }
      
      this.view.showStatus(`${syncedCount} dari ${offlineStories.length} cerita berhasil disinkronkan`, 'success');
      
      // Refresh data stats
      await this.loadSettingsData();
    } catch (error) {
      console.error('Failed to sync offline stories:', error);
      this.view.showStatus('Gagal menyinkronkan cerita offline', 'error');
    }
  }

  async clearAllData() {
    try {
      this.view.showStatus('Menghapus semua data...', 'info');
      
      // Clear IndexedDB
      await window.indexedDBHelper.clearAllData();
      
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear localStorage (except auth token)
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      localStorage.clear();
      
      // Restore auth data if exists
      if (token) localStorage.setItem('token', token);
      if (username) localStorage.setItem('username', username);
      
      this.view.showStatus('Semua data lokal berhasil dihapus', 'success');
      
      // Refresh data stats
      await this.loadSettingsData();
    } catch (error) {
      console.error('Failed to clear data:', error);
      this.view.showStatus('Gagal menghapus data', 'error');
    }
  }
}