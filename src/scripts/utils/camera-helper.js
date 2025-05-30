// Camera Helper - Complete version
class CameraHelper {
  constructor() {
    this.stream = null;
    this.capturedImageDataUrl = null;
  }

  async startCamera(videoElement) {
    try {
      console.log('Starting camera...');
      
      // Stop any existing stream first
      this.stopCamera();
      
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });
      
      // Set video source
      videoElement.srcObject = this.stream;
      
      console.log('Camera started successfully');
      return true;
    } catch (error) {
      console.error('Error starting camera:', error);
      return false;
    }
  }

  captureImage(videoElement, canvas) {
    try {
      console.log('Capturing image...');
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      this.capturedImageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop camera after capturing
      this.stopCamera();
      
      console.log('Image captured successfully');
      return this.capturedImageDataUrl;
    } catch (error) {
      console.error('Error capturing image:', error);
      return null;
    }
  }

  stopCamera() {
    if (this.stream) {
      console.log('Stopping camera...');
      
      // Stop all tracks
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      
      this.stream = null;
      console.log('Camera stopped');
    }
  }

  async getCapturedImageBlob() {
    if (!this.capturedImageDataUrl) {
      console.error('No captured image available');
      return null;
    }
    
    try {
      // Convert data URL to blob
      const response = await fetch(this.capturedImageDataUrl);
      const blob = await response.blob();
      
      console.log('Image blob created:', blob.size, 'bytes');
      return blob;
    } catch (error) {
      console.error('Error creating image blob:', error);
      return null;
    }
  }

  // Alternative method to get blob directly from canvas
  async getImageBlobFromCanvas(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Canvas blob created:', blob.size, 'bytes');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        'image/jpeg',
        0.8
      );
    });
  }
}

// Create global instance
const cameraHelper = new CameraHelper();

// Make available globally
window.cameraHelper = cameraHelper;