// Updated login-presenter.js - No DOM manipulation, removed direct document/window access

class LoginPresenter {
    constructor({ view, apiService, router }) {
        console.log('LoginPresenter constructor called');
        this.view = view;
        this.apiService = apiService;
        this.router = router;
        
        // Set this presenter as the view's presenter
        this.view.setPresenter(this);
    }
    
    init() {
        console.log('LoginPresenter initialized');
    }
    async handleLogin(email, password) {
  try {
    // Show loading state
    this.view.showLoading();
    
    // Attempt login
    const result = await this.apiService.login(email, password);
    
    if (result && !result.error) {
      // Login successful
      console.log('Login successful');
      
      // Dispatch auth change event
      if (window.appView) {
        window.appView.dispatchAuthChange();
      } else {
        // Fallback: dispatch event directly
        window.dispatchEvent(new Event('authChanged'));
      }
      
      // Navigate to home
      this.router.navigateTo('/');
    }
  } catch (error) {
    console.error('Login error:', error);
    this.view.showError(error.message);
  }
}

    async onLoginSubmit(email, password) {
        // Let the view validate the form first
        if (!this.view.validateForm(email, password)) {
            return false;
        }
        
        try {
            // Tell the view to show loading state
            this.view.showLoading(true);
            
            // Use API service to login the user
            console.log('Attempting login with:', email);
            const result = await this.apiService.login(email, password);
            console.log('Login successful:', result);

            // Dispatch event for other components through view
            this.view.dispatchAuthChange();

            // Show success message in the view
            this.view.showSuccess('✅ Berhasil login');

            // Navigate to home page after a short delay through view
            this.view.scheduleNavigation(() => {
                this.navigateToHome();
            }, 1000);

            return true;
        } catch (error) {
            console.error('Login error:', error);
            this.view.showAlert(error.message || 'Terjadi kesalahan saat login');
            this.view.showLoading(false);
            return false;
        }
    }

    navigateToHome() {
        this.router.navigateTo('/');
    }

    navigateToRegister() {
        this.router.navigateTo('/daftar');
    }
}
window.LoginPresenter = LoginPresenter;
console.log('LoginPresenter exported to window');