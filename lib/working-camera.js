/**
 * Working Camera Implementation for SnapHashQR Main App
 * Based on the successful camera-test.html approach
 */

class WorkingCameraCapture {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.stream = null;
        this.isActive = false;
        this.width = 640;
        this.height = 480;
    }

    async initialize(videoElement, canvasElement) {
        console.log('Initializing working camera...');
        
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        return true;
    }

    async startCamera() {
        try {
            console.log('Starting camera with working method...');
            
            // Use the exact same approach as camera-test.html
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: this.width },
                    height: { ideal: this.height }
                },
                audio: false
            });
            
            console.log('Camera stream obtained successfully!');
            
            this.video.srcObject = this.stream;
            
            return new Promise((resolve, reject) => {
                this.video.addEventListener('loadedmetadata', () => {
                    console.log('Video metadata loaded');
                    this.video.play();
                });
                
                this.video.addEventListener('playing', () => {
                    console.log('Video is playing - camera is active');
                    this.isActive = true;
                    
                    // Set up canvas dimensions
                    this.canvas.width = this.video.videoWidth || this.width;
                    this.canvas.height = this.video.videoHeight || this.height;
                    
                    console.log(`Canvas set to ${this.canvas.width}x${this.canvas.height}`);
                    resolve(true);
                });
                
                this.video.addEventListener('error', (error) => {
                    console.error('Video error:', error);
                    reject(error);
                });
                
                // Timeout fallback
                setTimeout(() => {
                    if (!this.isActive) {
                        reject(new Error('Camera start timeout'));
                    }
                }, 10000);
            });
            
        } catch (error) {
            console.error('Camera start error:', error);
            throw new Error(`Failed to start camera: ${error.message}`);
        }
    }

    capturePhoto() {
        if (!this.isActive || !this.video || !this.canvas) {
            throw new Error('Camera is not active or not properly initialized');
        }

        console.log('Capturing photo with working method...');
        
        try {
            // Use the exact same approach as camera-test.html
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            const imageData = this.canvas.toDataURL('image/jpeg', 0.9);
            const metadata = this.getCaptureMetadata();

            console.log(`Photo captured! Data length: ${imageData.length}`);

            return {
                imageData,
                metadata,
                timestamp: Date.now(),
                dimensions: { width: this.canvas.width, height: this.canvas.height }
            };
            
        } catch (error) {
            console.error('Photo capture error:', error);
            throw new Error(`Failed to capture photo: ${error.message}`);
        }
    }

    getCaptureMetadata() {
        return {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            devicePixelRatio: window.devicePixelRatio || 1,
            screenResolution: {
                width: screen.width,
                height: screen.height
            },
            captureTime: Date.now()
        };
    }

    async stopCamera() {
        console.log('Stopping camera...');
        
        try {
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    console.log('Stopping track:', track.kind);
                    track.stop();
                });
                this.stream = null;
            }
            
            if (this.video) {
                this.video.srcObject = null;
            }
            
            this.isActive = false;
            console.log('Camera stopped successfully');
            
        } catch (error) {
            console.error('Error stopping camera:', error);
        }
    }

    isStreaming() {
        return this.isActive;
    }
}

// Make available globally
window.WorkingCameraCapture = WorkingCameraCapture;
