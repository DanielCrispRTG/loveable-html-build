/**
 * Camera Capture Module for SnapHashQR
 * Based on electrocam implementation with enhancements
 */

class CameraCapture {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.isStreaming = false;
        this.width = 640;
        this.height = 480;
    }

    async startCamera() {
        try {
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: this.width },
                    height: { ideal: this.height },
                    facingMode: 'environment' // Back camera preferred for QR scanning
                },
                audio: false
            });

            this.video.srcObject = this.stream;
            this.video.play();

            // Set up video event listeners
            this.setupVideoEvents();

            return true;
        } catch (error) {
            console.error('Camera access error:', error);
            throw new Error(`Failed to access camera: ${error.message}`);
        }
    }

    setupVideoEvents() {
        this.video.addEventListener('canplay', () => {
            if (!this.isStreaming) {
                // Adjust canvas size based on actual video dimensions
                if (this.video.videoWidth > 0) {
                    this.height = this.video.videoHeight / (this.video.videoWidth / this.width);
                }
                this.canvas.setAttribute('width', this.width);
                this.canvas.setAttribute('height', this.height);
                this.isStreaming = true;
            }
        });

        this.video.addEventListener('play', () => {
            // Continuous canvas update for live preview
            const updateCanvas = () => {
                if (this.video.paused || this.video.ended) return;
                this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
                requestAnimationFrame(updateCanvas);
            };
            updateCanvas();
        });
    }

    capturePhoto() {
        if (!this.isStreaming) {
            throw new Error('Camera is not streaming');
        }

        // Capture current frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
        
        // Get image data
        const imageData = this.canvas.toDataURL('image/jpeg', 0.9);
        const metadata = this.getCaptureMetadata();

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
            },
            videoSettings: this.stream ? this.stream.getVideoTracks()[0].getSettings() : null
        };
    }

    async stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.isStreaming = false;
        }
    }

    async switchCamera() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length > 1) {
                // Stop current stream
                await this.stopCamera();
                
                // Get current device ID
                const currentDeviceId = this.stream ? 
                    this.stream.getVideoTracks()[0].getSettings().deviceId : null;
                
                // Find next camera
                const currentIndex = videoDevices.findIndex(device => 
                    device.deviceId === currentDeviceId);
                const nextIndex = (currentIndex + 1) % videoDevices.length;
                const nextDevice = videoDevices[nextIndex];
                
                // Start with new camera
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: nextDevice.deviceId },
                    audio: false
                });
                
                this.video.srcObject = this.stream;
                this.video.play();
                
                return nextDevice.label || `Camera ${nextIndex + 1}`;
            }
            
            return 'Only one camera available';
        } catch (error) {
            console.error('Camera switch error:', error);
            throw error;
        }
    }

    getVideoElement() {
        return this.video;
    }

    getCanvasElement() {
        return this.canvas;
    }
}

// Export for use in the main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraCapture;
} else {
    window.CameraCapture = CameraCapture;
}
