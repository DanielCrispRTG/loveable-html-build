/**
 * Simplified QR Scanner for Electron using jsQR
 * This is a more compatible approach for Electron
 */

class SimpleQRScanner {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isScanning = false;
        this.onScanCallback = null;
        this.onErrorCallback = null;
        this.scanInterval = null;
    }

    async initialize(videoElement) {
        this.video = videoElement;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        console.log('Initializing QR Scanner...');
        
        // Load jsQR library if not already loaded
        if (typeof jsQR === 'undefined') {
            await this.loadJsQR();
        }
        
        return true;
    }

    async loadJsQR() {
        return new Promise((resolve, reject) => {
            if (typeof jsQR !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
            script.onload = () => {
                console.log('jsQR library loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load jsQR library');
                reject(new Error('Failed to load QR scanning library'));
            };
            document.head.appendChild(script);
        });
    }

    async startScanning() {
        if (!this.video) {
            throw new Error('Video element not initialized');
        }

        try {
            console.log('Starting QR scanning...');
            
            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            this.video.srcObject = stream;
            this.video.play();

            this.isScanning = true;
            this.startScanLoop();
            
            console.log('QR scanning started');
            return true;
            
        } catch (error) {
            console.error('Failed to start QR scanning:', error);
            throw error;
        }
    }

    startScanLoop() {
        if (!this.isScanning) return;

        const scan = () => {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                this.canvas.height = this.video.videoHeight;
                this.canvas.width = this.video.videoWidth;
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                
                const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                
                if (typeof jsQR !== 'undefined') {
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });
                    
                    if (code) {
                        console.log('QR Code detected:', code.data);
                        this.handleScanResult(code);
                        return; // Stop scanning after successful read
                    }
                }
            }
            
            if (this.isScanning) {
                requestAnimationFrame(scan);
            }
        };
        
        requestAnimationFrame(scan);
    }

    handleScanResult(code) {
        if (this.onScanCallback) {
            const result = {
                data: code.data,
                location: code.location,
                timestamp: Date.now()
            };
            this.onScanCallback(result);
        }
    }

    onScan(callback) {
        this.onScanCallback = callback;
    }

    onError(callback) {
        this.onErrorCallback = callback;
    }

    async stopScanning() {
        console.log('Stopping QR scanning...');
        this.isScanning = false;
        
        if (this.video && this.video.srcObject) {
            const tracks = this.video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
        }
    }

    // Scan image file
    async scanImage(imageElement) {
        try {
            if (typeof jsQR === 'undefined') {
                await this.loadJsQR();
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = imageElement.width;
            canvas.height = imageElement.height;
            
            ctx.drawImage(imageElement, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                return {
                    data: code.data,
                    location: code.location,
                    timestamp: Date.now()
                };
            } else {
                throw new Error('No QR code found in image');
            }
            
        } catch (error) {
            console.error('Image scan error:', error);
            throw error;
        }
    }
}

// Make available globally
window.SimpleQRScanner = SimpleQRScanner;
