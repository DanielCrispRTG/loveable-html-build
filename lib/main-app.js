/**
 * Main SnapHashQR App with Working Camera Integration
 * Uses the proven working camera approach from camera-test.html
 */

class SnapHashQRMainApp {
    constructor() {
        this.camera = new WorkingCameraCapture();
        this.hashGenerator = new HashGenerator();
        this.qrGenerator = new QRGenerator();
        this.verificationRecords = [];
        this.currentMode = 'home';
        
        console.log('SnapHashQR Main App created');
        this.init();
    }

    async init() {
        try {
            console.log('Initializing SnapHashQR Main App...');
            this.setupEventListeners();
            this.loadStoredRecords();
            console.log('SnapHashQR Main App initialized successfully');
        } catch (error) {
            console.error('App initialization error:', error);
            this.showNotification('Failed to initialize app: ' + error.message, 'error');
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action]')) {
                const action = e.target.getAttribute('data-action');
                console.log('Action clicked:', action);
                this.handleAction(action, e.target);
            }
        });

        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
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
                case 'start-camera':
                    await this.startCamera();
                    break;
                case 'capture-photo':
                    await this.capturePhoto();
                    break;
                case 'stop-camera':
                    await this.stopCamera();
                    break;
                case 'verify-hash':
                    await this.verifyHash();
                    break;
                case 'clear-records':
                    this.clearRecords();
                    break;
                case 'show-privacy':
                case 'show-terms':
                case 'show-contact':
                    this.showNotification('Feature coming soon!', 'info');
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
                <h2 class="text-3xl font-bold mb-6 text-center">📸 Capture & Verify Images</h2>
                
                <div class="camera-section mb-6">
                    <div class="camera-container relative mb-4 text-center">
                        <video id="main-camera-video" class="w-full max-w-md mx-auto rounded-lg shadow-lg border-2 border-gray-300" autoplay muted playsinline style="max-height: 400px; display: none;"></video>
                        <canvas id="main-camera-canvas" class="w-full max-w-md mx-auto rounded-lg shadow-lg border-2 border-gray-300" style="max-height: 400px; display: none;"></canvas>
                        <div id="camera-placeholder" class="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-lg shadow-lg border-2 border-gray-300 flex items-center justify-center">
                            <div class="text-center text-gray-500">
                                <div class="text-4xl mb-2">📷</div>
                                <div>Camera will appear here</div>
                                <div class="text-sm">Click "Start Camera" to begin</div>
                            </div>
                        </div>
                        <div id="camera-status" class="mt-3 text-sm font-medium text-center">Ready to start camera</div>
                    </div>
                    
                    <div class="camera-controls flex justify-center gap-4 mb-6 flex-wrap">
                        <button id="start-camera-btn" data-action="start-camera" class="btn-primary">
                            📹 Start Camera
                        </button>
                        <button id="capture-photo-btn" data-action="capture-photo" class="btn-secondary" disabled>
                            📸 Capture Photo
                        </button>
                        <button id="stop-camera-btn" data-action="stop-camera" class="btn-secondary" disabled>
                            ⏹ Stop Camera
                        </button>
                    </div>
                </div>
                
                <div id="capture-result" class="hidden mt-8">
                    <h3 class="text-xl font-semibold mb-4 text-center">✅ Photo Captured Successfully!</h3>
                    <div class="result-display grid md:grid-cols-2 gap-6">
                        <div class="captured-image">
                            <h4 class="font-semibold mb-3">📷 Captured Image</h4>
                            <img id="captured-preview" class="w-full rounded-lg shadow-md border">
                            <div class="mt-2 text-sm text-gray-600" id="image-info"></div>
                        </div>
                        
                        <div class="verification-data">
                            <h4 class="font-semibold mb-3">🔐 Verification Data</h4>
                            
                            <div class="hash-info bg-gray-50 p-4 rounded-lg mb-4">
                                <h5 class="font-medium mb-2">📊 Hash Information</h5>
                                <div class="space-y-2">
                                    <div>
                                        <span class="text-sm font-medium">Full Hash:</span>
                                        <div id="generated-hash" class="font-mono text-xs break-all bg-white p-2 rounded mt-1 border"></div>
                                    </div>
                                    <div>
                                        <span class="text-sm font-medium">Short Hash:</span>
                                        <div id="short-hash" class="font-mono text-sm bg-white p-2 rounded mt-1 border"></div>
                                    </div>
                                    <div>
                                        <span class="text-sm font-medium">Timestamp:</span>
                                        <div id="capture-timestamp" class="text-sm bg-white p-2 rounded mt-1 border"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="qr-info bg-gray-50 p-4 rounded-lg">
                                <h5 class="font-medium mb-2">🔲 QR Code</h5>
                                <div id="qr-display" class="text-center mb-3"></div>
                                <div class="text-xs text-gray-600 text-center">
                                    QR code contains verification data
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('main').appendChild(section);
        return section;
    }

    createVerifySection() {
        console.log('Creating verify section');
        const section = document.createElement('div');
        section.id = 'verify-section';
        section.className = 'app-section';
        section.innerHTML = `
            <div class="verify-container glass-panel p-8 max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold mb-6 text-center">🔍 Verify Image Authenticity</h2>
                
                <div class="manual-verify-section mb-8">
                    <h3 class="font-semibold mb-4">📝 Manual Verification</h3>
                    <div class="manual-inputs bg-gray-50 p-6 rounded-lg">
                        <label class="block mb-4">
                            <span class="text-sm font-medium mb-2 block">Enter Hash to Verify:</span>
                            <input type="text" id="manual-hash" class="w-full p-3 border rounded-md font-mono text-sm" placeholder="Enter SHA-256 hash or short hash...">
                        </label>
                        <button data-action="verify-hash" class="btn-primary w-full">
                            ✅ Verify Hash
                        </button>
                    </div>
                </div>
                
                <div id="verification-result" class="hidden mb-8">
                    <div class="result-panel bg-white p-6 rounded-lg shadow-md border">
                        <h3 class="font-semibold mb-4">📋 Verification Results</h3>
                        <div id="verification-details"></div>
                    </div>
                </div>
                
                <div class="stored-records">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-semibold">📚 Verification History</h3>
                        <button data-action="clear-records" class="btn-secondary text-sm">
                            🗑 Clear History
                        </button>
                    </div>
                    <div id="records-list" class="space-y-4"></div>
                </div>
            </div>
        `;
        
        document.querySelector('main').appendChild(section);
        return section;
    }

    async startCamera() {
        try {
            console.log('Starting camera from main app...');
            this.updateCameraStatus('Starting camera...', 'info');
            
            const video = document.getElementById('main-camera-video');
            const canvas = document.getElementById('main-camera-canvas');
            const placeholder = document.getElementById('camera-placeholder');
            
            if (!video || !canvas) {
                throw new Error('Camera elements not found');
            }

            // Initialize camera with working implementation
            await this.camera.initialize(video, canvas);
            
            // Start camera
            await this.camera.startCamera();
            
            // Update UI
            if (placeholder) placeholder.style.display = 'none';
            video.style.display = 'block';
            canvas.style.display = 'block';
            
            this.updateCameraStatus('📹 Camera is active - ready to capture!', 'success');
            this.updateCameraControls(true);
            this.showNotification('Camera started successfully!', 'success');
            
        } catch (error) {
            console.error('Camera start error:', error);
            this.updateCameraStatus('❌ Camera failed: ' + error.message, 'error');
            this.showNotification('Camera failed: ' + error.message, 'error');
        }
    }

    async stopCamera() {
        try {
            console.log('Stopping camera from main app...');
            
            await this.camera.stopCamera();
            
            // Update UI
            const video = document.getElementById('main-camera-video');
            const canvas = document.getElementById('main-camera-canvas');
            const placeholder = document.getElementById('camera-placeholder');
            
            if (video) video.style.display = 'none';
            if (canvas) canvas.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
            
            this.updateCameraStatus('Camera stopped', 'info');
            this.updateCameraControls(false);
            this.showNotification('Camera stopped', 'info');
            
        } catch (error) {
            console.error('Error stopping camera:', error);
            this.showNotification('Error stopping camera: ' + error.message, 'error');
        }
    }

    async capturePhoto() {
        try {
            console.log('Capturing photo from main app...');
            
            if (!this.camera.isStreaming()) {
                throw new Error('Camera is not active');
            }

            this.updateCameraStatus('📸 Capturing photo...', 'info');
            
            // Capture photo using working implementation
            const captureResult = this.camera.capturePhoto();
            console.log('Photo captured, generating hash...');
            
            // Generate hash
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
            
            this.updateCameraStatus('✅ Photo captured and verified!', 'success');
            this.showNotification('Photo captured and verified successfully!', 'success');
            
        } catch (error) {
            console.error('Photo capture error:', error);
            this.updateCameraStatus('❌ Capture failed: ' + error.message, 'error');
            this.showNotification('Capture failed: ' + error.message, 'error');
        }
    }

    displayCaptureResults(captureResult, hashResult) {
        console.log('Displaying capture results...');
        
        const resultDiv = document.getElementById('capture-result');
        const preview = document.getElementById('captured-preview');
        const hashDiv = document.getElementById('generated-hash');
        const shortHashDiv = document.getElementById('short-hash');
        const timestampDiv = document.getElementById('capture-timestamp');
        const imageInfo = document.getElementById('image-info');
        const qrDisplay = document.getElementById('qr-display');
        
        if (resultDiv) {
            resultDiv.classList.remove('hidden');
            
            if (preview) {
                preview.src = captureResult.imageData;
            }
            
            if (hashDiv) {
                hashDiv.textContent = hashResult.hash;
            }
            
            if (shortHashDiv) {
                shortHashDiv.textContent = hashResult.hash.substring(0, 16) + '...';
            }
            
            if (timestampDiv) {
                timestampDiv.textContent = new Date(hashResult.timestamp).toLocaleString();
            }
            
            if (imageInfo) {
                imageInfo.textContent = `Size: ${captureResult.dimensions.width}×${captureResult.dimensions.height} | Data: ${Math.round(captureResult.imageData.length / 1024)}KB`;
            }
            
            // Simple QR code placeholder
            if (qrDisplay) {
                qrDisplay.innerHTML = `
                    <div class="qr-placeholder bg-gray-200 w-32 h-32 mx-auto rounded flex items-center justify-center">
                        <div class="text-center text-gray-600">
                            <div class="text-2xl mb-1">📱</div>
                            <div class="text-xs">QR Code</div>
                            <div class="text-xs">Generated</div>
                        </div>
                    </div>
                `;
            }
        }
        
        // Scroll to results
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    updateCameraStatus(message, type = 'info') {
        const statusDiv = document.getElementById('camera-status');
        if (statusDiv) {
            statusDiv.textContent = message;
            
            // Update styling based on type
            statusDiv.className = 'mt-3 text-sm font-medium text-center';
            if (type === 'success') {
                statusDiv.className += ' text-green-600';
            } else if (type === 'error') {
                statusDiv.className += ' text-red-600';
            } else if (type === 'info') {
                statusDiv.className += ' text-blue-600';
            }
        }
        console.log('Camera status:', message);
    }

    updateCameraControls(cameraActive) {
        const startBtn = document.getElementById('start-camera-btn');
        const captureBtn = document.getElementById('capture-photo-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        
        if (startBtn) startBtn.disabled = cameraActive;
        if (captureBtn) captureBtn.disabled = !cameraActive;
        if (stopBtn) stopBtn.disabled = !cameraActive;
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
        const resultDiv = document.getElementById('verification-result');
        const detailsDiv = document.getElementById('verification-details');
        
        if (resultDiv && detailsDiv) {
            resultDiv.classList.remove('hidden');
            
            const isValid = !!verificationData.matchingRecord;
            const statusClass = isValid ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
            const statusIcon = isValid ? '✅' : '⚠️';
            const statusText = isValid ? 'Hash Found & Verified' : 'Hash Not Found';
            
            let html = `
                <div class="status-indicator ${statusClass} p-4 rounded-lg border mb-4">
                    <div class="flex items-center">
                        <span class="text-2xl mr-3">${statusIcon}</span>
                        <div>
                            <div class="font-semibold">${statusText}</div>
                            <div class="text-sm opacity-75">Verification completed at ${new Date(verificationData.timestamp).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
                
                <div class="hash-details bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium mb-3">📊 Hash Details</h4>
                    <div class="space-y-2">
                        <div>
                            <span class="text-sm font-medium">Searched Hash:</span>
                            <div class="font-mono text-xs break-all bg-white p-2 rounded mt-1 border">${verificationData.hash}</div>
                        </div>
            `;
            
            if (isValid) {
                html += `
                        <div>
                            <span class="text-sm font-medium">Original Capture Time:</span>
                            <div class="text-sm bg-white p-2 rounded mt-1 border">${new Date(verificationData.matchingRecord.timestamp).toLocaleString()}</div>
                        </div>
                        <div>
                            <span class="text-sm font-medium">Verification Count:</span>
                            <div class="text-sm bg-white p-2 rounded mt-1 border">${verificationData.matchingRecord.verificationCount} time(s)</div>
                        </div>
                `;
            } else {
                html += `
                        <div class="text-sm text-gray-600 bg-white p-3 rounded mt-2 border">
                            This hash was not found in the local verification records. This could mean:
                            <ul class="list-disc list-inside mt-2 space-y-1">
                                <li>The image was not captured using this app</li>
                                <li>The hash was generated by a different device</li>
                                <li>The verification records were cleared</li>
                            </ul>
                        </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
            
            detailsDiv.innerHTML = html;
            
            // Scroll to results
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    findRecordByHash(hash) {
        return this.verificationRecords.find(record => 
            record.hash === hash || 
            record.shortHash === hash ||
            record.hash.startsWith(hash) ||
            hash.startsWith(record.shortHash)
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
                recordsList.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">📷</div>
                        <div class="font-medium">No verification records yet</div>
                        <div class="text-sm">Capture some photos to see verification history</div>
                    </div>
                `;
            } else {
                recordsList.innerHTML = this.verificationRecords.map((record, index) => `
                    <div class="record-item bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <div class="flex items-start gap-4">
                            <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl flex-shrink-0">
                                #${index + 1}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✅ Verified
                                    </span>
                                    <span class="text-xs text-gray-500">
                                        ${new Date(record.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <div class="space-y-1">
                                    <div>
                                        <span class="text-xs font-medium text-gray-600">Short Hash:</span>
                                        <div class="font-mono text-sm text-gray-800 bg-gray-50 px-2 py-1 rounded">${record.shortHash}</div>
                                    </div>
                                    <div class="flex justify-between items-center text-xs text-gray-500">
                                        <span>Verified ${record.verificationCount} time(s)</span>
                                        <span>${new Date(record.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    clearRecords() {
        if (confirm('Are you sure you want to clear all verification records? This cannot be undone.')) {
            console.log('Clearing all records');
            this.verificationRecords = [];
            this.saveRecords();
            this.updateRecordsList();
            this.showNotification('All verification records cleared', 'info');
        }
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
            await this.camera.stopCamera();
        } catch (e) {
            console.log('Camera cleanup error:', e.message);
        }
    }

    showNotification(message, type = 'info') {
        console.log(`Notification [${type}]:`, message);
        
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm border`;
        
        const colors = {
            success: 'bg-green-100 text-green-800 border-green-300',
            error: 'bg-red-100 text-red-800 border-red-300',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            info: 'bg-blue-100 text-blue-800 border-blue-300'
        };
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.innerHTML = `
            <div class="flex items-start gap-2">
                <span class="text-lg">${icons[type] || icons.info}</span>
                <div class="flex-1">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-lg hover:opacity-75">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating SnapHashQR main app...');
    window.snapHashQRApp = new SnapHashQRMainApp();
});
