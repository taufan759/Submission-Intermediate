class LoginView {
    constructor() {
        this.container = document.querySelector('#mainContent');
        this.presenter = null;
    }

    setPresenter(presenter) {
        this.presenter = presenter;
    }

    render() {
        this.container.innerHTML = `
          <section class="auth-section">
            <div class="container">
              <div class="auth-card improved">
                <div class="auth-header">
                  <h2 class="auth-title">Masuk ke Akun Anda</h2>
                  <p class="auth-subtitle">Bagikan cerita dan jelajahi peta interaktif</p>
                </div>
                
                <form id="loginForm">
                  <div class="form-group">
                    <label for="email">Email</label>
                    <div class="input-icon-wrapper">
                      <i class="fas fa-envelope input-icon"></i>
                      <input type="email" id="email" name="email" required placeholder="Masukkan email Anda">
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-icon-wrapper">
                      <i class="fas fa-lock input-icon"></i>
                      <input type="password" id="password" name="password" required placeholder="Masukkan password Anda">
                    </div>
                  </div>
                  
                  <div class="form-actions">
                    <button type="submit" id="loginButton" class="btn btn-primary btn-block">
                      <span class="button-text">Masuk</span>
                      <div class="loader-container">
                        <div class="loader"></div>
                      </div>
                    </button>
                  </div>
                </form>
                
                <div class="auth-footer">
                  <p>Belum punya akun? <a href="#/daftar" class="auth-link">Daftar Sekarang</a></p>
                </div>
              </div>
            </div>
          </section>
          <div id="alertContainer"></div>
        `;
        
        // Add improved login styles
        if (!document.getElementById('improvedAuthStyles')) {
          this._addAuthStyles();
        }
        
        this._initListeners();
    }

    _addAuthStyles() {
        const style = document.createElement('style');
        style.id = 'improvedAuthStyles';
        style.textContent = `
            .auth-section {
              padding: 3rem 1rem;
            }
            
            .auth-card.improved {
              max-width: 450px;
              margin: 0 auto;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              padding: 2rem;
            }
            
            .auth-header {
              text-align: center;
              margin-bottom: 2rem;
            }
            
            .auth-title {
              font-size: 1.75rem;
              color: var(--color-primary);
              margin-bottom: 0.5rem;
            }
            
            .auth-subtitle {
              color: #6c757d;
            }
            
            .input-icon-wrapper {
              position: relative;
            }
            
            .input-icon {
              position: absolute;
              left: 1rem;
              top: 50%;
              transform: translateY(-50%);
              color: #adb5bd;
            }
            
            .input-icon-wrapper input {
              padding-left: 2.5rem;
            }
            
            .btn-block {
              display: block;
              width: 100%;
              padding: 0.75rem;
              font-size: 1rem;
              font-weight: 500;
            }
            
            .auth-link {
              color: var(--color-primary);
              font-weight: 500;
              text-decoration: none;
            }
            
            .auth-link:hover {
              text-decoration: underline;
            }
            
            .alert {
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 1000;
              border-radius: 4px;
              padding: 0.75rem 1.25rem;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              animation: slideIn 0.3s ease-out;
            }
            
            .alert-success {
              background-color: #28a745;
              color: white;
            }
            
            .alert-danger {
              background-color: #dc3545;
              color: white;
            }
            
            @keyframes slideIn {
              0% { transform: translate(-50%, -20px); opacity: 0; }
              100% { transform: translate(-50%, 0); opacity: 1; }
            }
            
            .loader-container {
                display: none;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .loader {
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid #ffffff;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .btn-loading .button-text {
                visibility: hidden;
            }
            
            .btn-loading .loader-container {
                display: block;
            }
            
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }

    _initListeners() {
        const loginForm = document.querySelector('#loginForm');
        if (loginForm) {
            console.log('Found login form, attaching event listener');
            // Remove any existing event listeners to prevent duplicates
            const newLoginForm = loginForm.cloneNode(true);
            loginForm.parentNode.replaceChild(newLoginForm, loginForm);
            
            newLoginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                console.log('Login form submitted');
                
                if (this.presenter) {
                    // Get form values
                    const email = document.querySelector('#email').value;
                    const password = document.querySelector('#password').value;
                    
                    // Let the presenter handle validation and submission
                    this.presenter.onLoginSubmit(email, password);
                } else {
                    console.error('Login presenter not set');
                    this.showAlert('Terjadi kesalahan sistem');
                }
            });
        } else {
            console.error('Login form tidak ditemukan');
        }
        
        // Attach register link click event
        setTimeout(() => {
            const registerLink = document.querySelector('a[href="#/daftar"]');
            if (registerLink) {
                registerLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (this.presenter) {
                        this.presenter.navigateToRegister();
                    }
                });
            }
        }, 100);
    }
    
    validateForm(email, password) {
        if (!email || !password) {
            this.showAlert('Email dan password wajib diisi!');
            return false;
        }
        
        return true;
    }

    showLoading(isLoading) {
        const button = document.getElementById('loginButton');
        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    showAlert(message) {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;
        
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-danger';
        alertElement.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background-color: #f44336; color: white; padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 1050; max-width: 90%;';
        alertElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        alertContainer.appendChild(alertElement);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            alertElement.style.opacity = '0';
            alertElement.style.transition = 'opacity 0.5s ease';
            setTimeout(() => alertElement.remove(), 500);
        }, 3000);
    }
    
    showSuccess(message) {
        this.showLoading(false);
        
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;
        
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alertElement = document.createElement('div');
        alertElement.className = 'alert alert-success';
        alertElement.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background-color: #4CAF50; color: white; padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 1050; max-width: 90%;';
        alertElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        alertContainer.appendChild(alertElement);
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            alertElement.style.opacity = '0';
            alertElement.style.transition = 'opacity 0.5s ease';
            setTimeout(() => alertElement.remove(), 500);
        }, 2000);
    }
    
    // Add missing methods
    scheduleNavigation(callback, delay = 1000) {
        setTimeout(callback, delay);
    }
    
    dispatchAuthChange() {
        // Dispatch auth change event
        window.dispatchEvent(new Event('authChanged'));
    }
}
window.LoginView = LoginView;
console.log('LoginView exported to window');