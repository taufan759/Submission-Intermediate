// src/scripts/utils/favorites-helper.js

class FavoritesHelper {
  constructor() {
    this.dbHelper = window.indexedDBHelper;
    this.isReady = false;
  }

  async init() {
    if (this.dbHelper) {
      await this.dbHelper.init();
      this.isReady = true;
      console.log('FavoritesHelper initialized');
    } else {
      console.error('IndexedDB helper not found');
    }
  }

  // Tambah story ke favorit
  async addToFavorites(story) {
    if (!this.isReady) await this.init();
    
    try {
      await this.dbHelper.addToFavorites(story);
      this.showToast('✅ Cerita ditambahkan ke favorit!');
      this.updateFavoriteButton(story.id, true);
      this.updateNavigationCount();
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      this.showToast('❌ Gagal menambahkan ke favorit');
      return false;
    }
  }

  // Hapus story dari favorit
  async removeFromFavorites(storyId) {
    if (!this.isReady) await this.init();
    
    try {
      await this.dbHelper.removeFromFavorites(storyId);
      this.showToast('🗑️ Cerita dihapus dari favorit');
      this.updateFavoriteButton(storyId, false);
      this.updateNavigationCount();
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      this.showToast('❌ Gagal menghapus dari favorit');
      return false;
    }
  }

  // Toggle status favorit
  async toggleFavorite(story) {
    const isFavorite = await this.isFavorite(story.id);
    
    if (isFavorite) {
      return await this.removeFromFavorites(story.id);
    } else {
      return await this.addToFavorites(story);
    }
  }

  // Cek apakah story adalah favorit
  async isFavorite(storyId) {
    if (!this.isReady) await this.init();
    
    try {
      return await this.dbHelper.isFavorite(storyId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Ambil semua favorit
  async getAllFavorites() {
    if (!this.isReady) await this.init();
    
    try {
      return await this.dbHelper.getAllFavorites();
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  // Tambah tombol favorit ke story card
  addFavoriteButtonToStoryCard(storyCard, story) {
    // Cek apakah tombol sudah ada
    if (storyCard.querySelector('.favorite-btn')) {
      return;
    }

    // Buat tombol favorit
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.setAttribute('data-story-id', story.id);
    favoriteBtn.setAttribute('aria-label', 'Tambah ke favorit');
    favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';

    // Tambahkan ke footer story card
    const storyFooter = storyCard.querySelector('.story-footer');
    if (storyFooter) {
      storyFooter.appendChild(favoriteBtn);
    } else {
      // Jika tidak ada footer, buat footer baru
      const footer = document.createElement('div');
      footer.className = 'story-footer';
      footer.appendChild(favoriteBtn);
      storyCard.appendChild(footer);
    }

    // Event listener untuk toggle favorit
    favoriteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      favoriteBtn.disabled = true;
      const originalHTML = favoriteBtn.innerHTML;
      favoriteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      await this.toggleFavorite(story);
      
      favoriteBtn.disabled = false;
    });

    // Update status awal tombol
    this.updateFavoriteButtonStatus(favoriteBtn, story.id);
  }

  // Update status tombol favorit
  async updateFavoriteButtonStatus(button, storyId) {
    const isFav = await this.isFavorite(storyId);
    this.updateFavoriteButton(storyId, isFav);
  }

  // Update tampilan tombol favorit
  updateFavoriteButton(storyId, isFavorite) {
    const button = document.querySelector(`.favorite-btn[data-story-id="${storyId}"]`);
    if (!button) return;

    if (isFavorite) {
      button.innerHTML = '<i class="fas fa-heart"></i>';
      button.classList.add('favorited');
      button.setAttribute('aria-label', 'Hapus dari favorit');
      button.style.color = '#e91e63';
    } else {
      button.innerHTML = '<i class="far fa-heart"></i>';
      button.classList.remove('favorited');
      button.setAttribute('aria-label', 'Tambah ke favorit');
      button.style.color = '#999';
    }
  }

  // Update jumlah favorit di navigasi
  async updateNavigationCount() {
    try {
      const count = await this.dbHelper.getFavoritesCount();
      const countElement = document.getElementById('navFavoritesCount');
      
      if (countElement) {
        countElement.textContent = count;
        countElement.style.display = count > 0 ? 'inline' : 'none';
      }
    } catch (error) {
      console.error('Error updating navigation count:', error);
    }
  }

  // Tambah link favorit ke navigasi
  addFavoritesToNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    // Cek apakah link sudah ada
    if (navMenu.querySelector('a[href="#/favorit"]')) {
      return;
    }

    // Cari auth nav item untuk posisi
    const authNavItem = document.getElementById('authNavItem');
    if (!authNavItem) return;

    // Buat elemen favorit
    const favoritesLi = document.createElement('li');
    favoritesLi.className = 'auth-required-nav';
    favoritesLi.style.display = 'none'; // Disembunyikan sampai login
    favoritesLi.innerHTML = `
      <a href="#/favorit">
        <i class="fas fa-heart" aria-hidden="true"></i> 
        Favorit
        <span class="favorites-count" id="navFavoritesCount" style="background: #e91e63; color: white; border-radius: 10px; padding: 2px 6px; font-size: 0.75rem; margin-left: 0.5rem; display: none;">0</span>
      </a>
    `;

    // Masukkan sebelum auth nav item
    authNavItem.parentNode.insertBefore(favoritesLi, authNavItem);

    console.log('Favorites navigation added');
  }

  // Show/hide navigasi berdasarkan auth status
  updateNavigationVisibility() {
    const isLoggedIn = localStorage.getItem('token') !== null;
    const authRequiredNavs = document.querySelectorAll('.auth-required-nav');
    
    authRequiredNavs.forEach(nav => {
      nav.style.display = isLoggedIn ? 'block' : 'none';
    });

    if (isLoggedIn) {
      this.updateNavigationCount();
    }
  }

  // Tampilkan toast notification
  showToast(message, duration = 3000) {
    // Hapus toast yang ada
    const existingToast = document.querySelector('.favorites-toast');
    if (existingToast) {
      existingToast.remove();
    }

    // Buat toast baru
    const toast = document.createElement('div');
    toast.className = 'favorites-toast';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    // Tambah CSS animation jika belum ada
    if (!document.getElementById('toastAnimation')) {
      const style = document.createElement('style');
      style.id = 'toastAnimation';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .favorites-toast {
          animation: slideIn 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  // Export data favorit
  async exportFavorites() {
    try {
      const favorites = await this.getAllFavorites();
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalFavorites: favorites.length,
        favorites: favorites
      };

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
      
      this.showToast(`📦 ${favorites.length} favorit berhasil di-export!`);
      
    } catch (error) {
      console.error('Error exporting favorites:', error);
      this.showToast('❌ Gagal export favorit');
    }
  }

  // Clear semua favorit
  async clearAllFavorites() {
    if (!confirm('Apakah Anda yakin ingin menghapus semua favorit? Tindakan ini tidak dapat dibatalkan.')) {
      return false;
    }

    try {
      const favorites = await this.getAllFavorites();
      
      for (const story of favorites) {
        await this.dbHelper.removeFromFavorites(story.id);
      }
      
      this.showToast(`🗑️ ${favorites.length} favorit berhasil dihapus`);
      this.updateNavigationCount();
      
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      this.showToast('❌ Gagal menghapus favorit');
      return false;
    }
  }
}

// Inisialisasi dan buat instance global
const favoritesHelper = new FavoritesHelper();

// Setup event listeners saat DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Tambah navigasi favorit
  favoritesHelper.addFavoritesToNavigation();
  
  // Listen untuk perubahan auth status
  window.addEventListener('authChanged', () => {
    favoritesHelper.updateNavigationVisibility();
  });
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'token') {
      favoritesHelper.updateNavigationVisibility();
    }
  });
  
  // Update visibility awal
  favoritesHelper.updateNavigationVisibility();
  
  console.log('FavoritesHelper ready');
});

// Expose global
window.favoritesHelper = favoritesHelper;