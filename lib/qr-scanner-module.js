/**
 * QR Code Scanner Module for SnapHashQR
 * Uses nimiq/qr-scanner library with custom enhancements
 */

class QRScanner {
    constructor(videoElement, options = {}) {
        this.video = videoElement;
        this.options = {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            ...options
        };
        
        this.scanner = null;
        this.isScanning = false;
        this.onScanCallback = null;
        this.onErrorCallback = null;
    }

    async initialize() {
        try {
            // Dynamically import QR Scanner
            if (typeof QrScanner === 'undefined') {
                // Try to load from our lib directory
                await this.loadQRScannerLibrary();
            }

            // Create QR Scanner instance
            this.scanner = new QrScanner(
                this.video,
                (result) => this.handleScanResult(result),
                {
                    ...this.options,
                    onDecodeError: (error) => this.handleScanError(error)
                }
            );

            return true;
        } catch (error) {
            console.error('QR Scanner initialization error:', error);
            throw new Error(`Failed to initialize QR scanner: ${error.message}`);
        }
    }

    async loadQRScannerLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof QrScanner !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = './lib/qr-scanner.min.js';
            script.type = 'module';
            script.onload = () => {
                // Wait a bit for the module to be available
                setTimeout(() => {
                    if (typeof QrScanner !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('QrScanner not available after loading'));
                    }
                }, 100);
            };
            script.onerror = () => reject(new Error('Failed to load QR scanner library'));
            document.head.appendChild(script);
        });
    }

    async startScanning() {
        if (!this.scanner) {
            throw new Error('QR Scanner not initialized');
        }

        try {
            await this.scanner.start();
            this.isScanning = true;
            return true;
        } catch (error) {
            console.error('Failed to start QR scanning:', error);
            throw error;
        }
    }

    async stopScanning() {
        if (this.scanner && this.isScanning) {
            this.scanner.stop();
            this.isScanning = false;
        }
    }

    onScan(callback) {
        this.onScanCallback = callback;
    }

    onError(callback) {
        this.onErrorCallback = callback;
    }

    handleScanResult(result) {
        if (this.onScanCallback) {
            const enhancedResult = {
                data: result.data,
                cornerPoints: result.cornerPoints,
                timestamp: Date.now(),
                scannerInfo: {
                    isScanning: this.isScanning,
                    scannerOptions: this.options
                }
            };
            this.onScanCallback(enhancedResult);
        }
    }

    handleScanError(error) {
        if (this.onErrorCallback) {
            this.onErrorCallback(error);
        }
    }

    async scanImage(imageSource) {
        try {
            if (!window.QrScanner) {
                await this.loadQRScannerLibrary();
            }

            const result = await QrScanner.scanImage(imageSource, {
                returnDetailedScanResult: true
            });

            return {
                data: result.data,
                cornerPoints: result.cornerPoints,
                timestamp: Date.now(),
                source: 'image'
            };
        } catch (error) {
            console.error('Image scan error:', error);
            throw new Error(`Failed to scan image: ${error.message}`);
        }
    }

    async hasCamera() {
        try {
            if (!window.QrScanner) {
                await this.loadQRScannerLibrary();
            }
            return await QrScanner.hasCamera();
        } catch (error) {
            console.error('Camera check error:', error);
            return false;
        }
    }

    async listCameras() {
        try {
            if (!window.QrScanner) {
                await this.loadQRScannerLibrary();
            }
            return await QrScanner.listCameras();
        } catch (error) {
            console.error('Camera list error:', error);
            return [];
        }
    }

    async setCamera(cameraId) {
        if (this.scanner) {
            try {
                await this.scanner.setCamera(cameraId);
                return true;
            } catch (error) {
                console.error('Set camera error:', error);
                throw error;
            }
        }
        return false;
    }

    destroy() {
        if (this.scanner) {
            this.scanner.destroy();
            this.scanner = null;
        }
        this.isScanning = false;
    }

    getScanner() {
        return this.scanner;
    }

    isActive() {
        return this.isScanning;
    }
}

// Export for use in the main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRScanner;
} else {
    window.QRScanner = QRScanner;
}
