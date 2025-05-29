const cameraHelper = {
  stream: null,
  capturedImage: null,
  
  async startCamera(videoElement) {
    try {
      if (this.stream) {
        this.stopCamera();
      }
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      });
      
      this.stream = stream;
      videoElement.srcObject = stream;
      
      return true;
    } catch (error) {
      console.error('Error starting camera:', error);
      return false;
    }
  },
  
  stopCamera() {
    console.log('Stopping camera stream');
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      this.stream = null;
    }
  },
  
  captureImage(videoElement, canvas) {
    if (!videoElement || !canvas) {
      console.error('Video or canvas element missing');
      return null;
    }
    
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, width, height);
    
    this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);
    this.stopCamera();
    
    return this.capturedImage;
  },
  
  async getCapturedImageBlob() {
    if (!this.capturedImage) {
      throw new Error('No image captured yet');
    }
    
    const response = await fetch(this.capturedImage);
    return await response.blob();
  }
};
