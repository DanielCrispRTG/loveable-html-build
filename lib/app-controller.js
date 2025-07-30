/**
 * SnapHashQR Application Controller
 * Main application logic integrating camera, QR scanning, and hash generation
 */

class SnapHashQRApp {
    constructor() {
        this.cameraCapture = null;
        this.qrScanner = null;
        this.hashGenerator = new HashGenerator();
        this.qrGenerator = new QRGenerator();
        this.verificationRecords = [];
        this.currentMode = 'home'; // home, capture, verify
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing SnapHashQR App...');
            this.setupEventListeners();
            this.loadStoredRecords();
            
            // Check for camera availability
            const hasCamera = await navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => true)
                .catch(() => false);
            
            if (!hasCamera) {
                this.showNotification('Camera not available', 'warning');
            }
            
            console.log('SnapHashQR App initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
            this.showNotification('Failed to initialize app', 'error');
        }
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                const action = e.target.getAttribute('data-action');
                this.handleAction(action, e.target);
            }
        });

        // Handle visibility change to manage camera resources
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.pauseCamera();
            }
        });

        // Handle beforeunload to cleanup resources
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    async handleAction(action, element) {
        try {
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
                case 'download-qr':
                    await this.downloadQR(element);
                    break;
                case 'clear-records':
                    this.clearRecords();
                    break;
                default:
                    console.log('Unknown action:', action);
            }
        } catch (error) {
            console.error('Action error:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async showHome() {
        this.currentMode = 'home';
        this.updateNavigation();
        await this.cleanup();
        
        // Show home content, hide others
        document.querySelectorAll('.app-section').forEach(section => {
            section.style.display = 'none';
        });
        
        const homeSection = document.getElementById('home-section');
        if (homeSection) {
            homeSection.style.display = 'block';
        }
    }

    async showCapture() {
        this.currentMode = 'capture';
        this.updateNavigation();
        
        // Show capture section
        document.querySelectorAll('.app-section').forEach(section => {
            section.style.display = 'none';
        });
        
        let captureSection = document.getElementById('capture-section');
        if (!captureSection) {
            captureSection = this.createCaptureSection();
        }
        captureSection.style.display = 'block';
        
        // Initialize camera
        await this.initializeCamera();
    }

    async showVerify() {
        this.currentMode = 'verify';
        this.updateNavigation();
        
        // Show verify section
        document.querySelectorAll('.app-section').forEach(section => {
            section.style.display = 'none';
        });
        
        let verifySection = document.getElementById('verify-section');
        if (!verifySection) {
            verifySection = this.createVerifySection();
        }
        verifySection.style.display = 'block';
        
        // Initialize QR scanner for verification
        await this.initializeQRScanner();
    }

    createCaptureSection() {
        const section = document.createElement('div');
        section.id = 'capture-section';
        section.className = 'app-section';
        section.innerHTML = `
            <div class="capture-container glass-panel p-8 max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold mb-6 text-center">Capture & Verify Image</h2>
                
                <div class="camera-section mb-6">
                    <div class="camera-container relative mb-4">
                        <video id="camera-video" class="w-full max-w-md mx-auto rounded-lg shadow-lg" autoplay muted playsinline></video>
                        <canvas id="camera-canvas" class="hidden"></canvas>
                    </div>
                    
                    <div class="camera-controls flex justify-center gap-4 mb-4">
                        <button data-action="capture-photo" class="btn-primary">
                            📸 Capture Photo
                        </button>
                        <button id="switch-camera" class="btn-secondary">
                            🔄 Switch Camera
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
                            <h3 class="font-semibold mb-2">Verification QR Code</h3>
                            <div id="qr-display" class="mb-4"></div>
                            
                            <div class="hash-info bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-medium mb-2">Hash Information</h4>
                                <p class="text-sm"><strong>Hash:</strong> <span id="generated-hash" class="font-mono text-xs break-all"></span></p>
                                <p class="text-sm"><strong>Timestamp:</strong> <span id="capture-timestamp"></span></p>
                            </div>
                            
                            <button data-action="download-qr" class="btn-secondary mt-4">
                                💾 Download QR Code
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('main').appendChild(section);
        return section;
    }

    createVerifySection() {
        const section = document.createElement('div');
        section.id = 'verify-section';
        section.className = 'app-section';
        section.innerHTML = `
            <div class="verify-container glass-panel p-8 max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold mb-6 text-center">Verify Image Authenticity</h2>
                
                <div class="verify-methods grid md:grid-cols-2 gap-6 mb-6">
                    <div class="qr-scan-method">
                        <h3 class="font-semibold mb-4">Scan QR Code</h3>
                        <div class="qr-scanner-container relative mb-4">
                            <video id="qr-video" class="w-full max-w-sm mx-auto rounded-lg shadow-lg" autoplay muted playsinline></video>
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
            const video = document.getElementById('camera-video');
            const canvas = document.getElementById('camera-canvas');
            
            if (video && canvas) {
                this.cameraCapture = new CameraCapture(video, canvas);
                await this.cameraCapture.startCamera();
                this.showNotification('Camera started successfully', 'success');
                
                // Setup switch camera button
                const switchBtn = document.getElementById('switch-camera');
                if (switchBtn) {
                    switchBtn.addEventListener('click', async () => {
                        try {
                            const result = await this.cameraCapture.switchCamera();
                            this.showNotification(`Switched to: ${result}`, 'info');
                        } catch (error) {
                            this.showNotification(`Camera switch failed: ${error.message}`, 'warning');
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.showNotification(`Camera initialization failed: ${error.message}`, 'error');
        }
    }

    async initializeQRScanner() {
        try {
            const video = document.getElementById('qr-video');
            
            if (video) {
                this.qrScanner = new QRScanner(video);
                await this.qrScanner.initialize();
                
                this.qrScanner.onScan((result) => {
                    this.handleQRScanResult(result);
                });
                
                this.qrScanner.onError((error) => {
                    console.log('QR scan error:', error);
                });
                
                this.showNotification('QR Scanner initialized', 'success');
            }
        } catch (error) {
            console.error('QR Scanner initialization error:', error);
            this.showNotification(`QR Scanner initialization failed: ${error.message}`, 'error');
        }
    }

    async capturePhoto() {
        try {
            if (!this.cameraCapture) {
                throw new Error('Camera not initialized');
            }

            const captureResult = this.cameraCapture.capturePhoto();
            const hashResult = await this.hashGenerator.generateImageHash(
                captureResult.imageData, 
                captureResult.metadata
            );
            
            const qrResult = await this.qrGenerator.generateHashQR(hashResult);
            
            // Create verification record
            const record = this.hashGenerator.createVerificationRecord(hashResult, captureResult.imageData);
            this.addVerificationRecord(record);
            
            // Display results
            this.displayCaptureResults(captureResult, hashResult, qrResult);
            
            this.showNotification('Photo captured and verified!', 'success');
        } catch (error) {
            console.error('Photo capture error:', error);
            this.showNotification(`Capture failed: ${error.message}`, 'error');
        }
    }

    displayCaptureResults(captureResult, hashResult, qrResult) {
        const resultDiv = document.getElementById('capture-result');
        const preview = document.getElementById('captured-preview');
        const qrDisplay = document.getElementById('qr-display');
        const hashSpan = document.getElementById('generated-hash');
        const timestampSpan = document.getElementById('capture-timestamp');
        
        if (resultDiv) {
            resultDiv.classList.remove('hidden');
            
            if (preview) preview.src = captureResult.imageData;
            if (hashSpan) hashSpan.textContent = hashResult.hash;
            if (timestampSpan) timestampSpan.textContent = new Date(hashResult.timestamp).toLocaleString();
            
            if (qrDisplay) {
                const qrImg = document.createElement('img');
                qrImg.src = qrResult.dataUrl;
                qrImg.className = 'w-32 h-32 mx-auto border rounded';
                qrDisplay.innerHTML = '';
                qrDisplay.appendChild(qrImg);
            }
        }
    }

    async startQRScan() {
        try {
            if (!this.qrScanner) {
                await this.initializeQRScanner();
            }
            
            await this.qrScanner.startScanning();
            this.showNotification('QR scanning started', 'info');
        } catch (error) {
            console.error('QR scan start error:', error);
            this.showNotification(`Failed to start QR scanning: ${error.message}`, 'error');
        }
    }

    async stopQRScan() {
        if (this.qrScanner) {
            await this.qrScanner.stopScanning();
            this.showNotification('QR scanning stopped', 'info');
        }
    }

    handleQRScanResult(result) {
        try {
            const qrInfo = this.qrGenerator.parseQRData(result.data);
            
            if (qrInfo.isValid) {
                this.displayVerificationResult({
                    type: 'qr_scan',
                    qrInfo: qrInfo,
                    scanResult: result,
                    timestamp: Date.now()
                });
                
                this.showNotification('QR code scanned successfully!', 'success');
                this.stopQRScan();
            } else {
                this.showNotification('Invalid QR code format', 'warning');
            }
        } catch (error) {
            console.error('QR scan result error:', error);
            this.showNotification('Failed to process QR code', 'error');
        }
    }

    async verifyHash() {
        try {
            const hashInput = document.getElementById('manual-hash');
            const hash = hashInput.value.trim();
            
            if (!hash) {
                throw new Error('Please enter a hash to verify');
            }
            
            if (!this.hashGenerator.isValidHashFormat(hash) && !this.hashGenerator.isValidShortHashFormat(hash)) {
                throw new Error('Invalid hash format');
            }
            
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
        const resultDiv = document.getElementById('verification-result');
        const detailsDiv = document.getElementById('verification-details');
        
        if (resultDiv && detailsDiv) {
            resultDiv.classList.remove('hidden');
            
            let html = `<div class="verification-result-content">
                <div class="result-status mb-4">`;
            
            if (verificationData.type === 'qr_scan') {
                const qrInfo = verificationData.qrInfo;
                html += `
                    <div class="status-indicator bg-green-100 text-green-800 p-3 rounded-lg">
                        ✅ QR Code Valid
                    </div>
                    <div class="qr-details mt-4">
                        <p><strong>Hash:</strong> <span class="font-mono text-sm">${qrInfo.shortHash}</span></p>
                        <p><strong>Algorithm:</strong> ${qrInfo.algorithm}</p>
                        <p><strong>Timestamp:</strong> ${new Date(qrInfo.timestamp).toLocaleString()}</p>
                    </div>
                `;
            } else if (verificationData.type === 'manual_verify') {
                const isValid = !!verificationData.matchingRecord;
                html += `
                    <div class="status-indicator ${isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} p-3 rounded-lg">
                        ${isValid ? '✅ Hash Found' : '⚠️ Hash Not Found'}
                    </div>
                    <div class="hash-details mt-4">
                        <p><strong>Hash:</strong> <span class="font-mono text-sm break-all">${verificationData.hash}</span></p>
                        ${isValid ? `
                            <p><strong>Original Timestamp:</strong> ${new Date(verificationData.matchingRecord.timestamp).toLocaleString()}</p>
                            <p><strong>Verification Count:</strong> ${verificationData.matchingRecord.verificationCount}</p>
                        ` : '<p class="text-sm text-gray-600">This hash was not found in the local verification records.</p>'}
                    </div>
                `;
            }
            
            html += `</div></div>`;
            detailsDiv.innerHTML = html;
        }
    }

    findRecordByHash(hash) {
        return this.verificationRecords.find(record => 
            record.hash === hash || record.shortHash === hash
        );
    }

    addVerificationRecord(record) {
        this.verificationRecords.unshift(record);
        this.saveRecords();
        this.updateRecordsList();
    }

    updateRecordsList() {
        const recordsList = document.getElementById('records-list');
        if (recordsList) {
            if (this.verificationRecords.length === 0) {
                recordsList.innerHTML = '<p class="text-gray-500 text-center">No verification records yet</p>';
            } else {
                recordsList.innerHTML = this.verificationRecords.map(record => `
                    <div class="record-item bg-white p-4 rounded-lg shadow-sm border">
                        <div class="flex items-start gap-4">
                            <img src="${record.imagePreview}" alt="Preview" class="w-16 h-16 object-cover rounded">
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
        this.verificationRecords = [];
        this.saveRecords();
        this.updateRecordsList();
        this.showNotification('Records cleared', 'info');
    }

    saveRecords() {
        try {
            localStorage.setItem('snaphashqr_records', JSON.stringify(this.verificationRecords));
        } catch (error) {
            console.error('Failed to save records:', error);
        }
    }

    loadStoredRecords() {
        try {
            const stored = localStorage.getItem('snaphashqr_records');
            if (stored) {
                this.verificationRecords = JSON.parse(stored);
                this.updateRecordsList();
            }
        } catch (error) {
            console.error('Failed to load records:', error);
            this.verificationRecords = [];
        }
    }

    updateNavigation() {
        // Update navigation buttons to show current section
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

    async pauseCamera() {
        if (this.cameraCapture) {
            // Pause but don't fully stop to allow quick resume
            console.log('Pausing camera due to visibility change');
        }
    }

    async cleanup() {
        if (this.cameraCapture) {
            await this.cameraCapture.stopCamera();
            this.cameraCapture = null;
        }
        
        if (this.qrScanner) {
            this.qrScanner.destroy();
            this.qrScanner = null;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm`;
        
        const colors = {
            success: 'bg-green-100 text-green-800 border-green-300',
            error: 'bg-red-100 text-red-800 border-red-300',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            info: 'bg-blue-100 text-blue-800 border-blue-300'
        };
        
        notification.className += ` ${colors[type] || colors.info} border`;
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
    window.snapHashQRApp = new SnapHashQRApp();
});
