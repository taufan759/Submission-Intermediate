class Footer {
  constructor() {
    this.render();
  }

  // Update footer.js render method
render() {
  const footerElement = document.querySelector('footer');
  
  if (footerElement) {
    footerElement.innerHTML = `
      <div class="container">
        <div class="footer-content compact">
          <div class="footer-brand">
            <h2><i class="fas fa-map-marked-alt"></i> PetaBicara</h2>
            <p>Berbagi cerita berdasarkan lokasi di Indonesia</p>
          </div>
          
          <div class="footer-links-container">
            <div class="footer-links">
              <h3>Navigasi</h3>
              <ul>
                <li><a href="#/">Beranda</a></li>
                <li><a href="#/tambah">Tambah Cerita</a></li>
                <li><a href="#/peta">Peta Cerita</a></li>
              </ul>
            </div>
            
            <div class="footer-contact">
              <h3>Kontak</h3>
              <p><i class="fas fa-envelope"></i> taufan759@gmail.com</p>
              <p><i class="fas fa-map-pin"></i> Kota Tegal, Indonesia</p>
            </div>
          </div>
        </div>
        
        <div class="footer-copyright">
          <p>&copy; ${new Date().getFullYear()} PetaBicara - Berbagi cerita, berbagi lokasi</p>
        </div>
      </div>
    `;
    
    // Add compact footer styles
    if (!document.getElementById('compactFooterStyles')) {
      const style = document.createElement('style');
      style.id = 'compactFooterStyles';
      style.textContent = `
        .app-footer {
          background-color: #1e3a5f;
          padding: 2rem 0 1rem;  /* Reduced padding */
        }
        
        .footer-content.compact {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          margin-bottom: 1rem;  /* Reduced margin */
        }
        
        .footer-brand {
          flex: 1;
          min-width: 250px;
        }
        
        .footer-links-container {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }
        
        .footer-brand h2 {
          font-size: 1.25rem;  /* Smaller font */
          margin-bottom: 0.5rem;
        }
        
        .footer-brand p {
          font-size: 0.875rem;  /* Smaller font */
        }
        
        .footer-links h3, 
        .footer-contact h3 {
          font-size: 1rem;  /* Smaller font */
          margin-bottom: 0.75rem;
        }
        
        .footer-links ul {
          padding-left: 0;
        }
        
        .footer-links li {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;  /* Smaller font */
        }
        
        .footer-contact p {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;  /* Smaller font */
        }
        
        .footer-copyright {
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          font-size: 0.875rem;  /* Smaller font */
        }
      `;
      document.head.appendChild(style);
    }
  }
}
    }

const footer = new Footer();
window.Footer = Footer;