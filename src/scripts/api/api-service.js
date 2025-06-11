class ApiService {
  constructor() {
    this.baseUrl = 'https://story-api.dicoding.dev/v1';
  }

  async register(name, email, password) {
    try {
      console.log('Registering user:', name, email);
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();
      console.log('Register response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(`Failed to register: ${error.message}`);
    }
  }

  async login(email, password) {
    try {
      console.log('Login attempt for:', email);
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();
      console.log('Login response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      // Simpan token dengan benar
      localStorage.setItem('token', responseJson.loginResult.token);
      // Simpan juga data user untuk referensi
      localStorage.setItem('user', JSON.stringify(responseJson.loginResult));
      
      return responseJson;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(`Failed to login: ${error.message}`);
    }
  }

  async getAllStories() {
    try {
      const token = localStorage.getItem('token');
      console.log('Getting stories with token:', token ? 'Token exists' : 'No token');
      
      if (!token) throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');

      const response = await fetch(`${this.baseUrl}/stories?location=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseJson = await response.json();
      console.log('Stories response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson.listStory;
    } catch (error) {
      console.error('Error fetching stories:', error);
      if (error.message.includes('Token tidak ditemukan')) {
        // Use global router for redirect
        if (window.router) {
          window.router.navigateTo('/masuk');
        }
      }
      return [];
    }
  }

  // Inside apiService.addNewStory method
  async addNewStory(description, photoBlob, lat, lon) {
    try {
      const token = localStorage.getItem('token');
      console.log('Adding new story with token:', token ? 'Token exists' : 'No token');
      
      if (!token) throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');

      // Create form data
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photoBlob, 'photo.jpg');
      
      // Only add lat/lon if they exist
      if (lat !== null && lon !== null) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      console.log('Sending request to add story');
      const response = await fetch(`${this.baseUrl}/stories`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const responseJson = await response.json();
      console.log('Add story response:', responseJson);
      
      if (responseJson.error) throw new Error(responseJson.message);

      return responseJson;
    } catch (error) {
      console.error('Error adding story:', error);
      throw new Error(`Failed to add story: ${error.message}`);
    }
  }
  
  // Add authentication helper methods
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Create global apiService instance
const apiService = new ApiService();

// Make apiService available globally
window.apiService = apiService;