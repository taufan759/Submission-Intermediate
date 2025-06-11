class RegisterView {
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
                    <h2 class="auth-title">Daftar Akun Baru</h2>
                    <p class="auth-subtitle">Bagikan cerita dan jelajahi peta interaktif</p>
                    </div>

                        <form id="registerForm">
                            <div class="form-group">
                                <label for="name">Nama</label>
                                <div class="input-icon-wrapper">
                                <i class="fas fa-user input-icon"></i>
                                <input type="text" id="name" name="name" required placeholder="Masukkan nama Anda">
                            </div>
                            </div>

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
                                <input type="password" id="password" name="password" required minlength="6" placeholder="Minimal 8 karakter">
                            </div>
                            </div>
                            <div class="form-actions">
                                <button type="submit" id="registerButton" class="btn btn-primary">
                                    <span class="button-text">Daftar</span>
                                    <div class="loader-container">
                                        <div class="loader"></div>
                                    </div>
                                </button>
                            </div>
                        </form>
                        <div class="auth-footer">
                            <p>Sudah punya akun? <a href="#/masuk" data-link>Masuk di Sini</a></p>
                        </div>
                    </div>
                </div>
            </section>
            <div id="alertContainer"></div>
        `;

        if (!document.getElementById('loaderStyles')) {
            this._addLoaderStyles();
        }

        this._initListeners();
    }

    _addLoaderStyles() {
        const style = document.createElement('style');
        style.id = 'loaderStyles';
        style.textContent = `
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
        const registerForm = document.querySelector('#registerForm');
        if (registerForm) {
            console.log('Found register form, attaching event listener');
            // Remove any existing event listeners to prevent duplicates
            const newRegisterForm = registerForm.cloneNode(true);
            registerForm.parentNode.replaceChild(newRegisterForm, registerForm);
            
            newRegisterForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                console.log('Register form submitted');
                
                if (this.presenter) {
                    // Get form values
                    const name = document.querySelector('#name').value;
                    const email = document.querySelector('#email').value;
                    const password = document.querySelector('#password').value;
                    
                    // Let the presenter handle validation and submission
                    this.presenter.onRegisterSubmit(name, email, password);
                } else {
                    console.error('Register presenter not set');
                    this.showAlert('Terjadi kesalahan sistem');
                }
            });
        } else {
            console.error('Register form tidak ditemukan');
        }
    
        // Attach login link click event
        setTimeout(() => {
            const loginLink = document.querySelector('a[href="#/masuk"]');
            if (loginLink) {
                loginLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (this.presenter) {
                        this.presenter.navigateToLogin();
                    }
                });
            }
        }, 100);
    }

    validateForm(name, email, password) {
        if (!name || !email || !password) {
            this.showAlert('Semua field wajib diisi!');
            return false;
        }

        if (password.length < 6) {
            this.showAlert('Password minimal 6 karakter!');
            return false;
        }
        
        return true;
    }

    showLoading(isLoading) {
        const button = document.getElementById('registerButton');
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
    
    // Add missing method
    scheduleNavigation(callback, delay = 1000) {
        setTimeout(callback, delay);
    }
}
window.RegisterView = RegisterView;
console.log('RegisterView exported to window');