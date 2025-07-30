/**
 * Simplified SnapHashQR App Controller
 * Using simplified libraries for better Electron compatibility
 */

class SnapHashQRApp {
    constructor() {
        this.cameraCapture = new CameraCapture();
        this.qrScanner = new SimpleQRScanner();
        this.hashGenerator = new HashGenerator();
        this.qrGenerator = new QRGenerator();
        this.verificationRecords = [];
        this.currentMode = 'home';
        
        console.log('SnapHashQR App created, initializing...');
        this.init();
    }

    async init() {
        try {
            console.log('Initializing SnapHashQR App...');
            this.setupEventListeners();
            this.loadStoredRecords();
            
            console.log('SnapHashQR App initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
            this.showNotification('Failed to initialize app: ' + error.message, 'error');
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                const action = e.target.getAttribute('data-action');
                console.log('Action clicked:', action);
                this.handleAction(action, e.target);
            }
        });

        // Cleanup on close
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        console.log('Event listeners set up');
    }

    async handleAction(action, element) {
        try {
            console.log('Handling action:', action);
            
            switch (action) {
                case 'show-home':
                    await this.showHome();
                    break;
                case 'show-capture':
                    await this.showCapture();
                    break;
                case 'show-verify':
                    await this.showVerify();
                    break;
                case 'capture-photo':
                    await this.capturePhoto();
                    break;
                case 'start-qr-scan':
                    await this.startQRScan();
                    break;
                case 'stop-qr-scan':
                    await this.stopQRScan();
                    break;
                case 'verify-hash':
                    await this.verifyHash();
                    break;
                case 'clear-records':
                    this.clearRecords();
                    break;
                default:
                    console.log('Unknown action:', action);
                    this.showNotification('Unknown action: ' + action, 'warning');
            }
        } catch (error) {
            console.error('Action error:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async showHome() {
        console.log('Showing home section');
        this.currentMode = 'home';
        this.updateNavigation();
        await this.cleanup();
        
        document.querySelectorAll('.app-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const homeSection = document.getElementById('home-section');
        if (homeSection) {
            homeSection.style.display = 'block';
            console.log('Home section displayed');
        }
    }

    async showCapture() {
        console.log('Showing capture section');
        this.currentMode = 'capture';
        this.updateNavigation();
        
        document.querySelectorAll('.app-section').forEach(section => {
            section.style.display = 'none';
        });
        
        let captureSection = document.getElementById('capture-section');
        if (!captureSection) {
            captureSection = this.createCaptureSection();
        }
        captureSection.style.display = 'block';
        
        // Initialize camera with delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeCamera();
        }, 500);
    }

    async showVerify() {
        console.log('Showing verify section');
        this.currentMode = 'verify';
        this.updateNavigation();
        
        document.querySelectorAll('.app-section').forEach(section => {
            section.style.display = 'none';
        });
        
        let verifySection = document.getElementById('verify-section');
        if (!verifySection) {
            verifySection = this.createVerifySection();
        }
        verifySection.style.display = 'block';
        
        this.updateRecordsList();
    }

    createCaptureSection() {
        console.log('Creating capture section');
        const section = document.createElement('div');
        section.id = 'capture-section';
        section.className = 'app-section';
        section.innerHTML = `
            <div class="capture-container glass-panel p-8 max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold mb-6 text-center">Capture & Verify Image</h2>
                
                <div class="camera-section mb-6">
                    <div class="camera-container relative mb-4 text-center">
                        <video id="camera-video" class="w-full max-w-md mx-auto rounded-lg shadow-lg" autoplay muted playsinline style="max-height: 400px;"></video>
                        <canvas id="camera-canvas" class="hidden"></canvas>
                        <div id="camera-status" class="mt-2 text-sm text-gray-600">Click "Start Camera" to begin</div>
                    </div>
                    
                    <div class="camera-controls flex justify-center gap-4 mb-4 flex-wrap">
                        <button id="start-camera-btn" class="btn-primary">
                            📹 Start Camera
                        </button>
                        <button id="capture-photo-btn" data-action="capture-photo" class="btn-secondary" disabled>
                            📸 Capture Photo
                        </button>
                        <button id="stop-camera-btn" class="btn-secondary" disabled>
                            ⏹ Stop Camera
                        </button>
                    </div>
                </div>
                
                <div id="capture-result" class="hidden">
                    <div class="result-display grid md:grid-cols-2 gap-6">
                        <div class="captured-image">
                            <h3 class="font-semibold mb-2">Captured Image</h3>
                            <img id="captured-preview" class="w-full rounded-lg shadow-md">
                        </div>
                        
                        <div class="verification-data">
                            <h3 class="font-semibold mb-2">Verification Info</h3>
                            <div id="qr-display" class="mb-4 text-center"></div>
                            
                            <div class="hash-info bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-medium mb-2">Hash Information</h4>
                                <p class="text-sm"><strong>Hash:</strong></p>
                                <p id="generated-hash" class="font-mono text-xs break-all bg-white p-2 rounded mt-1"></p>
                                <p class="text-sm mt-2"><strong>Timestamp:</strong> <span id="capture-timestamp"></span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('main').appendChild(section);
        
        // Add event listeners for camera controls
        setTimeout(() => {
            const startBtn = document.getElementById('start-camera-btn');
            const captureBtn = document.getElementById('capture-photo-btn');
            const stopBtn = document.getElementById('stop-camera-btn');
            
            if (startBtn) {
                startBtn.addEventListener('click', () => this.initializeCamera());
            }
            if (stopBtn) {
                stopBtn.addEventListener('click', () => this.stopCamera());
            }
        }, 100);
        
        return section;
    }

    createVerifySection() {
        console.log('Creating verify section');
        const section = document.createElement('div');
        section.id = 'verify-section';
        section.className = 'app-section';
        section.innerHTML = `
            <div class="verify-container glass-panel p-8 max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold mb-6 text-center">Verify Image Authenticity</h2>
                
                <div class="verify-methods grid md:grid-cols-2 gap-6 mb-6">
                    <div class="qr-scan-method">
                        <h3 class="font-semibold mb-4">Scan QR Code</h3>
                        <div class="qr-scanner-container relative mb-4 text-center">
                            <video id="qr-video" class="w-full max-w-sm mx-auto rounded-lg shadow-lg" autoplay muted playsinline style="max-height: 300px;"></video>
                            <div id="qr-status" class="mt-2 text-sm text-gray-600">Click "Start Scanning" to begin</div>
                        </div>
                        <div class="qr-controls flex justify-center gap-4">
                            <button data-action="start-qr-scan" class="btn-primary">
                                🔍 Start Scanning
                            </button>
                            <button data-action="stop-qr-scan" class="btn-secondary">
                                ⏹ Stop Scanning
                            </button>
                        </div>
                    </div>
                    
                    <div class="manual-verify-method">
                        <h3 class="font-semibold mb-4">Manual Verification</h3>
                        <div class="manual-inputs">
                            <label class="block mb-2">
                                <span class="text-sm font-medium">Enter Hash:</span>
                                <input type="text" id="manual-hash" class="w-full p-2 border rounded-md font-mono text-sm" placeholder="Enter SHA-256 hash...">
                            </label>
                            <button data-action="verify-hash" class="btn-primary w-full mt-2">
                                ✅ Verify Hash
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="verification-result" class="hidden">
                    <div class="result-panel bg-white p-6 rounded-lg shadow-md">
                        <h3 class="font-semibold mb-4">Verification Results</h3>
                        <div id="verification-details"></div>
                    </div>
                </div>
                
                <div class="stored-records mt-8">
                    <h3 class="font-semibold mb-4">Verification History</h3>
                    <div id="records-list" class="space-y-4"></div>
                    <button data-action="clear-records" class="btn-secondary mt-4">
                        🗑 Clear History
                    </button>
                </div>
            </div>
        `;
        
        document.querySelector('main').appendChild(section);
        return section;
    }

    async initializeCamera() {
        try {
            console.log('Initializing camera...');
            this.updateCameraStatus('Requesting camera access...');
            
            const video = document.getElementById('camera-video');
            const canvas = document.getElementById('camera-canvas');
            
            if (!video || !canvas) {
                throw new Error('Video or canvas element not found');
            }

            const success = await this.cameraCapture.initialize(video, canvas);
            
            if (success) {
                this.updateCameraStatus('Camera active - ready to capture');
                this.updateCameraControls(true);
                this.showNotification('Camera started successfully!', 'success');
                console.log('Camera initialized successfully');
            }
            
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.updateCameraStatus('Camera failed: ' + error.message);
            this.showNotification('Camera access failed: ' + error.message, 'error');
        }
    }

    async stopCamera() {
        try {
            console.log('Stopping camera...');
            await this.cameraCapture.stopCamera();
            this.updateCameraStatus('Camera stopped');
            this.updateCameraControls(false);
            this.showNotification('Camera stopped', 'info');
        } catch (error) {
            console.error('Error stopping camera:', error);
        }
    }

    updateCameraStatus(message) {
        const statusDiv = document.getElementById('camera-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            console.log('Camera status:', message);
        }
    }

    updateCameraControls(cameraActive) {
        const startBtn = document.getElementById('start-camera-btn');
        const captureBtn = document.getElementById('capture-photo-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        
        if (startBtn) startBtn.disabled = cameraActive;
        if (captureBtn) captureBtn.disabled = !cameraActive;
        if (stopBtn) stopBtn.disabled = !cameraActive;
    }

    async capturePhoto() {
        try {
            console.log('Capturing photo...');
            
            if (!this.cameraCapture.isStreaming) {
                throw new Error('Camera is not active');
            }

            const captureResult = this.cameraCapture.capturePhoto();
            console.log('Photo captured, generating hash...');
            
            const hashResult = await this.hashGenerator.generateImageHash(
                captureResult.imageData, 
                captureResult.metadata
            );
            
            console.log('Hash generated:', hashResult.hash.substring(0, 16) + '...');
            
            // Create verification record
            const record = this.hashGenerator.createVerificationRecord(hashResult, captureResult.imageData);
            this.addVerificationRecord(record);
            
            // Display results
            this.displayCaptureResults(captureResult, hashResult);
            
            this.showNotification('Photo captured and verified!', 'success');
            console.log('Photo capture completed successfully');
            
        } catch (error) {
            console.error('Photo capture error:', error);
            this.showNotification(`Capture failed: ${error.message}`, 'error');
        }
    }

    displayCaptureResults(captureResult, hashResult) {
        console.log('Displaying capture results...');
        
        const resultDiv = document.getElementById('capture-result');
        const preview = document.getElementById('captured-preview');
        const hashSpan = document.getElementById('generated-hash');
        const timestampSpan = document.getElementById('capture-timestamp');
        
        if (resultDiv) {
            resultDiv.classList.remove('hidden');
            
            if (preview) {
                preview.src = captureResult.imageData;
                console.log('Preview image set');
            }
            
            if (hashSpan) {
                hashSpan.textContent = hashResult.hash;
                console.log('Hash displayed');
            }
            
            if (timestampSpan) {
                timestampSpan.textContent = new Date(hashResult.timestamp).toLocaleString();
                console.log('Timestamp displayed');
            }
            
            // Create QR code placeholder
            const qrDisplay = document.getElementById('qr-display');
            if (qrDisplay) {
                qrDisplay.innerHTML = `
                    <div class="qr-placeholder bg-gray-200 w-32 h-32 mx-auto rounded flex items-center justify-center">
                        <span class="text-sm text-gray-600">QR Code<br>Generated</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Hash: ${hashResult.hash.substring(0, 16)}...</p>
                `;
            }
        }
    }

    async startQRScan() {
        try {
            console.log('Starting QR scan...');
            const video = document.getElementById('qr-video');
            
            if (!video) {
                throw new Error('QR video element not found');
            }

            await this.qrScanner.initialize(video);
            
            this.qrScanner.onScan((result) => {
                console.log('QR Code scanned:', result.data);
                this.handleQRScanResult(result);
            });
            
            await this.qrScanner.startScanning();
            this.updateQRStatus('Scanning for QR codes...');
            this.showNotification('QR scanning started', 'info');
            
        } catch (error) {
            console.error('QR scan start error:', error);
            this.updateQRStatus('QR scan failed: ' + error.message);
            this.showNotification(`Failed to start QR scanning: ${error.message}`, 'error');
        }
    }

    async stopQRScan() {
        try {
            console.log('Stopping QR scan...');
            await this.qrScanner.stopScanning();
            this.updateQRStatus('QR scanning stopped');
            this.showNotification('QR scanning stopped', 'info');
        } catch (error) {
            console.error('Error stopping QR scan:', error);
        }
    }

    updateQRStatus(message) {
        const statusDiv = document.getElementById('qr-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            console.log('QR status:', message);
        }
    }

    handleQRScanResult(result) {
        try {
            console.log('Processing QR scan result:', result.data);
            
            this.displayVerificationResult({
                type: 'qr_scan',
                data: result.data,
                timestamp: result.timestamp
            });
            
            this.showNotification('QR code scanned successfully!', 'success');
            this.stopQRScan();
            
        } catch (error) {
            console.error('QR scan result error:', error);
            this.showNotification('Failed to process QR code', 'error');
        }
    }

    async verifyHash() {
        try {
            const hashInput = document.getElementById('manual-hash');
            const hash = hashInput ? hashInput.value.trim() : '';
            
            if (!hash) {
                throw new Error('Please enter a hash to verify');
            }
            
            console.log('Verifying hash:', hash.substring(0, 16) + '...');
            
            // Look for matching record
            const matchingRecord = this.findRecordByHash(hash);
            
            this.displayVerificationResult({
                type: 'manual_verify',
                hash: hash,
                matchingRecord: matchingRecord,
                timestamp: Date.now()
            });
            
            const message = matchingRecord ? 'Hash verified successfully!' : 'Hash not found in records';
            const type = matchingRecord ? 'success' : 'warning';
            this.showNotification(message, type);
            
        } catch (error) {
            console.error('Hash verification error:', error);
            this.showNotification(`Verification failed: ${error.message}`, 'error');
        }
    }

    displayVerificationResult(verificationData) {
        console.log('Displaying verification result:', verificationData.type);
        
        const resultDiv = document.getElementById('verification-result');
        const detailsDiv = document.getElementById('verification-details');
        
        if (resultDiv && detailsDiv) {
            resultDiv.classList.remove('hidden');
            
            let html = '<div class="verification-result-content">';
            
            if (verificationData.type === 'qr_scan') {
                html += `
                    <div class="status-indicator bg-green-100 text-green-800 p-3 rounded-lg mb-4">
                        ✅ QR Code Scanned
                    </div>
                    <div class="qr-details">
                        <p><strong>Data:</strong> <span class="font-mono text-sm break-all">${verificationData.data}</span></p>
                        <p><strong>Scanned at:</strong> ${new Date(verificationData.timestamp).toLocaleString()}</p>
                    </div>
                `;
            } else if (verificationData.type === 'manual_verify') {
                const isValid = !!verificationData.matchingRecord;
                html += `
                    <div class="status-indicator ${isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} p-3 rounded-lg mb-4">
                        ${isValid ? '✅ Hash Found' : '⚠️ Hash Not Found'}
                    </div>
                    <div class="hash-details">
                        <p><strong>Hash:</strong> <span class="font-mono text-sm break-all">${verificationData.hash}</span></p>
                        ${isValid ? `
                            <p><strong>Original Timestamp:</strong> ${new Date(verificationData.matchingRecord.timestamp).toLocaleString()}</p>
                            <p><strong>Verification Count:</strong> ${verificationData.matchingRecord.verificationCount}</p>
                        ` : '<p class="text-sm text-gray-600 mt-2">This hash was not found in the local verification records.</p>'}
                    </div>
                `;
            }
            
            html += '</div>';
            detailsDiv.innerHTML = html;
        }
    }

    findRecordByHash(hash) {
        return this.verificationRecords.find(record => 
            record.hash === hash || record.shortHash === hash
        );
    }

    addVerificationRecord(record) {
        console.log('Adding verification record');
        this.verificationRecords.unshift(record);
        this.saveRecords();
        this.updateRecordsList();
    }

    updateRecordsList() {
        console.log('Updating records list, count:', this.verificationRecords.length);
        
        const recordsList = document.getElementById('records-list');
        if (recordsList) {
            if (this.verificationRecords.length === 0) {
                recordsList.innerHTML = '<p class="text-gray-500 text-center py-4">No verification records yet</p>';
            } else {
                recordsList.innerHTML = this.verificationRecords.map(record => `
                    <div class="record-item bg-white p-4 rounded-lg shadow-sm border">
                        <div class="flex items-start gap-4">
                            <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                📷
                            </div>
                            <div class="flex-1">
                                <p class="font-mono text-xs text-gray-600 break-all">${record.shortHash}...</p>
                                <p class="text-sm text-gray-500">${new Date(record.timestamp).toLocaleString()}</p>
                                <p class="text-xs text-gray-400">Verified ${record.verificationCount} time(s)</p>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    clearRecords() {
        console.log('Clearing all records');
        this.verificationRecords = [];
        this.saveRecords();
        this.updateRecordsList();
        this.showNotification('Records cleared', 'info');
    }

    saveRecords() {
        try {
            localStorage.setItem('snaphashqr_records', JSON.stringify(this.verificationRecords));
            console.log('Records saved to localStorage');
        } catch (error) {
            console.error('Failed to save records:', error);
        }
    }

    loadStoredRecords() {
        try {
            const stored = localStorage.getItem('snaphashqr_records');
            if (stored) {
                this.verificationRecords = JSON.parse(stored);
                console.log('Loaded', this.verificationRecords.length, 'stored records');
            }
        } catch (error) {
            console.error('Failed to load records:', error);
            this.verificationRecords = [];
        }
    }

    updateNavigation() {
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-primary-foreground');
            btn.classList.add('text-foreground', 'hover:bg-secondary');
        });
        
        const currentBtn = document.querySelector(`[data-action="show-${this.currentMode}"]`);
        if (currentBtn) {
            currentBtn.classList.add('bg-primary', 'text-primary-foreground');
            currentBtn.classList.remove('text-foreground', 'hover:bg-secondary');
        }
    }

    async cleanup() {
        console.log('Cleaning up resources...');
        
        try {
            await this.cameraCapture.stopCamera();
        } catch (e) {
            console.log('Camera cleanup error:', e.message);
        }
        
        try {
            await this.qrScanner.stopScanning();
        } catch (e) {
            console.log('QR scanner cleanup error:', e.message);
        }
    }

    showNotification(message, type = 'info') {
        console.log(`Notification [${type}]:`, message);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm border`;
        
        const colors = {
            success: 'bg-green-100 text-green-800 border-green-300',
            error: 'bg-red-100 text-red-800 border-red-300',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            info: 'bg-blue-100 text-blue-800 border-blue-300'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Remove on click
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating SnapHashQR app...');
    window.snapHashQRApp = new SnapHashQRApp();
});
