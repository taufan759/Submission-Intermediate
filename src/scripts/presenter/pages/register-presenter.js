class RegisterPresenter {
    constructor({ view, apiService, router }) {
        console.log('RegisterPresenter constructor called');
        this.view = view;
        this.apiService = apiService;
        this.router = router;
        
        // Set this presenter as the view's presenter
        this.view.setPresenter(this);
    }
    
    init() {
        console.log('RegisterPresenter initialized');
    }

    async onRegisterSubmit(name, email, password) {
        // Let the view validate the form first
        if (!this.view.validateForm(name, email, password)) {
            return;
        }
        
        try {
            console.log('Register submit handler called');
            this.view.showLoading(true);
            
            // Use API service to register the user
            const result = await this.apiService.register(name, email, password);
            console.log('Register success:', result);

            // Show success message in the view
            this.view.showSuccess('✅ Pendaftaran berhasil! Silakan login.');

            // Navigate to login page after a short delay through view
            this.view.scheduleNavigation(() => {
                this.navigateToLogin();
            }, 1000);

            return true;
        } catch (error) {
            console.error('Register error in presenter:', error);
            this.view.showAlert(error.message || 'Terjadi kesalahan saat mendaftar');
            this.view.showLoading(false);
            return false;
        }
    }

    navigateToLogin() {
        this.router.navigateTo('/masuk');
    }
}
window.RegisterPresenter = RegisterPresenter;
console.log('RegisterPresenter exported to window');
