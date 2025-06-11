// src/scripts/presenter/pages/settings-presenter.js - Simple settings presenter

class SettingsPresenter {
  constructor({ view }) {
    this.view = view;
    this.favoritesHelper = window.favoritesHelper;
    this.indexedDBHelper = window.indexedDBHelper;
    
    // Set presenter reference in view
    this.view.setPresenter(this);
    
    console.log('SettingsPresenter initialized');
  }

  async init() {
    console.log('SettingsPresenter.init called');
    
    // No specific initialization needed
    // View will handle its own initialization
  }

  async exportFavorites() {
    console.log('SettingsPresenter: Exporting favorites');
    
    try {
      if (this.favoritesHelper) {
        await this.favoritesHelper.exportFavorites();
        this.view.showSuccess('Data favorit berhasil di-export!');
      } else {
        throw new Error('Favorites helper not available');
      }
    } catch (error) {
      console.error('SettingsPresenter: Error exporting favorites:', error);
      this.view.showError('Gagal export favorit: ' + error.message);
    }
  }

  async clearAllData() {
    console.log('SettingsPresenter: Clearing all data');
    
    if (!confirm('Apakah Anda yakin ingin menghapus semua data lokal? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      // Clear IndexedDB data
      if (this.indexedDBHelper) {
        await this.indexedDBHelper.clearAllData();
      }
      
      // Clear other local storage (except auth data)
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      // Clear all localStorage
      localStorage.clear();
      
      // Restore auth data if exists
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', user);
      
      // Clear caches if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      this.view.showSuccess('Semua data lokal berhasil dihapus!');
      
      // Reload stats
      setTimeout(() => {
        this.view._loadDataStats();
      }, 1000);
      
    } catch (error) {
      console.error('SettingsPresenter: Error clearing data:', error);
      this.view.showError('Gagal menghapus data: ' + error.message);
    }
  }

  // Helper method untuk navigasi
  navigateToHome() {
    if (window.router) {
      window.router.navigateTo('/');
    }
  }

  navigateToFavorites() {
    if (window.router) {
      window.router.navigateTo('/favorit');
    }
  }
}
window.SettingsPresenter = SettingsPresenter;
console.log('SettingsPresenter exported to window');