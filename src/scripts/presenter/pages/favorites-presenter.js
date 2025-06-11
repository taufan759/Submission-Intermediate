// src/scripts/presenter/pages/favorites-presenter.js

class FavoritesPresenter {
  constructor({ view }) {
    this.view = view;
    this.favoritesHelper = window.favoritesHelper;
    
    // Set presenter reference in view
    this.view.setPresenter(this);
    
    console.log('FavoritesPresenter initialized');
  }

  async init() {
    console.log('FavoritesPresenter.init called');
    
    // Pastikan favorites helper ready
    if (!this.favoritesHelper) {
      console.error('FavoritesHelper not found');
      this.view.showError('Fitur favorit tidak tersedia');
      return;
    }

    // Load favorites data
    await this.loadFavorites();
  }

  async loadFavorites() {
    console.log('FavoritesPresenter: Loading favorites');
    
    try {
      // Show loading state
      this.view.showLoading();
      
      // Get favorites from helper
      const favorites = await this.favoritesHelper.getAllFavorites();
      console.log(`FavoritesPresenter: Loaded ${favorites.length} favorites`);
      
      // Sort by addedToFavoritesAt (newest first)
      if (favorites.length > 0) {
        favorites.sort((a, b) => {
          const dateA = new Date(a.addedToFavoritesAt || a.createdAt);
          const dateB = new Date(b.addedToFavoritesAt || b.createdAt);
          return dateB - dateA;
        });
      }
      
      // Update view
      this.view.renderFavorites(favorites);
      
    } catch (error) {
      console.error('FavoritesPresenter: Error loading favorites:', error);
      this.view.showError('Gagal memuat daftar favorit: ' + error.message);
    }
  }

  async removeFavorite(storyId) {
    console.log('FavoritesPresenter: Removing favorite', storyId);
    
    try {
      const success = await this.favoritesHelper.removeFromFavorites(storyId);
      
      if (success) {
        this.view.showSuccess('Cerita berhasil dihapus dari favorit');
        
        // Remove card from view immediately
        const card = document.querySelector(`.favorite-story-card[data-story-id="${storyId}"]`);
        if (card) {
          card.style.animation = 'fadeOut 0.3s ease';
          setTimeout(() => {
            card.remove();
            // Update count
            this.updateFavoritesCount();
          }, 300);
        }
        
        // Check if no more favorites
        const remainingCards = document.querySelectorAll('.favorite-story-card');
        if (remainingCards.length <= 1) { // <= 1 because we haven't removed the card yet
          setTimeout(() => {
            this.loadFavorites(); // Reload to show empty state
          }, 400);
        }
      }
    } catch (error) {
      console.error('FavoritesPresenter: Error removing favorite:', error);
      this.view.showError('Gagal menghapus favorit: ' + error.message);
    }
  }

  async exportFavorites() {
    console.log('FavoritesPresenter: Exporting favorites');
    
    try {
      const success = await this.favoritesHelper.exportFavorites();
      if (success !== false) {
        this.view.showSuccess('Data favorit berhasil di-export!');
      }
    } catch (error) {
      console.error('FavoritesPresenter: Error exporting favorites:', error);
      this.view.showError('Gagal export favorit: ' + error.message);
    }
  }

  async clearAllFavorites() {
    console.log('FavoritesPresenter: Clearing all favorites');
    
    try {
      const favorites = await this.favoritesHelper.getAllFavorites();
      
      if (favorites.length === 0) {
        this.view.showSuccess('Tidak ada favorit untuk dihapus');
        return;
      }

      if (!confirm(`Apakah Anda yakin ingin menghapus semua ${favorites.length} favorit? Tindakan ini tidak dapat dibatalkan.`)) {
        return;
      }

      const success = await this.favoritesHelper.clearAllFavorites();
      
      if (success) {
        this.view.showSuccess(`${favorites.length} favorit berhasil dihapus`);
        // Reload to show empty state
        await this.loadFavorites();
      }
    } catch (error) {
      console.error('FavoritesPresenter: Error clearing favorites:', error);
      this.view.showError('Gagal menghapus semua favorit: ' + error.message);
    }
  }

  async updateFavoritesCount() {
    try {
      const favorites = await this.favoritesHelper.getAllFavorites();
      this.view.updateFavoritesCount(favorites.length);
    } catch (error) {
      console.error('Error updating favorites count:', error);
    }
  }

  // Helper method untuk navigasi
  navigateToHome() {
    if (window.router) {
      window.router.navigateTo('/');
    }
  }

  navigateToMap(lat, lon) {
    if (window.router && lat && lon) {
      window.router.navigateTo(`/peta?lat=${lat}&lon=${lon}`);
    }
  }
}
window.FavoritesPresenter = FavoritesPresenter;
console.log('FavoritesPresenter exported to window');