/**
 * Simplified Camera Capture for Electron
 */

class CameraCapture {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.stream = null;
        this.isStreaming = false;
        this.width = 640;
        this.height = 480;
    }

    async initialize(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        console.log('Initializing camera...');
        return await this.startCamera();
    }

    async startCamera() {
        try {
            console.log('Requesting camera access...');
            
            const constraints = {
                video: {
                    width: { ideal: this.width },
                    height: { ideal: this.height },
                    facingMode: 'environment'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Camera access granted!');

            this.video.srcObject = this.stream;
            
            return new Promise((resolve, reject) => {
                this.video.addEventListener('loadedmetadata', () => {
                    this.video.play();
                    this.setupVideoEvents();
                    console.log('Camera started successfully');
                    resolve(true);
                });
                
                this.video.addEventListener('error', (error) => {
                    console.error('Video error:', error);
                    reject(error);
                });
            });

        } catch (error) {
            console.error('Camera access error:', error);
            throw new Error(`Failed to access camera: ${error.message}`);
        }
    }

    setupVideoEvents() {
        this.video.addEventListener('canplay', () => {
            if (!this.isStreaming) {
                console.log('Video can play, setting up canvas...');
                
                if (this.video.videoWidth > 0) {
                    this.height = this.video.videoHeight / (this.video.videoWidth / this.width);
                }
                
                this.canvas.width = this.width;
                this.canvas.height = this.height;
                this.isStreaming = true;
                
                console.log(`Canvas set to ${this.width}x${this.height}`);
            }
        });

        this.video.addEventListener('play', () => {
            console.log('Video started playing');
            this.updateCanvas();
        });
    }

    updateCanvas() {
        if (this.video && this.ctx && !this.video.paused && !this.video.ended) {
            this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
        }
        requestAnimationFrame(() => this.updateCanvas());
    }

    capturePhoto() {
        if (!this.isStreaming) {
            throw new Error('Camera is not streaming');
        }

        console.log('Capturing photo...');
        
        // Draw current frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
        
        // Get image data
        const imageData = this.canvas.toDataURL('image/jpeg', 0.9);
        const metadata = this.getCaptureMetadata();

        console.log('Photo captured successfully');

        return {
            imageData,
            metadata,
            timestamp: Date.now(),
            dimensions: { width: this.width, height: this.height }
        };
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
            }
        };
    }

    async stopCamera() {
        console.log('Stopping camera...');
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log('Camera track stopped');
            });
            this.stream = null;
            this.isStreaming = false;
        }
    }
}

// Make available globally
window.CameraCapture = CameraCapture;
