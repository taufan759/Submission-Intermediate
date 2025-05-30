// Add this script to your HTML before the closing </body> tag for debugging
// Remove it once issues are resolved

(function() {
  // Create debugging tools
  const debug = {
    logAPIRequests: true,
    logModelEvents: true,
    logPresenterEvents: true,
    logViewEvents: true,
    
    init: function() {
      console.log('Debug tools initialized');
      
      // Monitor local storage for token changes
      this.monitorToken();
      
      // Add error handler for uncaught exceptions
      window.addEventListener('error', (event) => {
        console.error('Uncaught error:', event.error);
      });
      
      // Add API request interceptor if using fetch
      this.interceptFetch();
    },
    
    monitorToken: function() {
      console.log('Token status:', localStorage.getItem('token') ? 'Found' : 'Not found');
      
      // Create a proxy for localStorage to detect token changes
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        if (key === 'token') {
          console.log(`Token ${value ? 'set' : 'removed'}`);
        }
        originalSetItem.apply(this, arguments);
      };
      
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = function(key) {
        if (key === 'token') {
          console.log('Token removed');
        }
        originalRemoveItem.apply(this, arguments);
      };
    },
    
    interceptFetch: function() {
      // Intercept fetch calls to debug API interactions
      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        const url = args[0];
        
        if (typeof url === 'string' && url.includes('story-api.dicoding.dev')) {
          console.log('API Request:', url, args[1] ? args[1].method || 'GET' : 'GET');
          
          try {
            const response = await originalFetch.apply(this, args);
            const clonedResponse = response.clone();
            
            // Log response status
            console.log('API Response Status:', response.status, response.statusText);
            
            // Try to parse and log JSON response for debugging
            clonedResponse.json().then(data => {
              console.log('API Response:', data);
              
              // Check for error in response
              if (data.error) {
                console.error('API Error:', data.message);
              }
            }).catch(e => {}); // Silent catch for non-JSON responses
            
            return response;
          } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
          }
        }
        
        return originalFetch.apply(this, args);
      };
    }
  };
  
  // Initialize debugging tools
  debug.init();
  
  // Expose debugging tools globally
  window.appDebug = debug;
})();