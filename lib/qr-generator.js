/**
 * QR Code Generator Module for SnapHashQR
 * Generates QR codes from hashes and verification data
 */

class QRGenerator {
    constructor() {
        this.defaultOptions = {
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#FFFFFF",
            correctLevel: QRGenerator.CorrectLevel.M
        };
    }

    /**
     * Error correction levels
     */
    static CorrectLevel = {
        L: 1, // ~7%
        M: 0, // ~15%
        Q: 3, // ~25%
        H: 2  // ~30%
    };

    /**
     * Generate QR code for hash verification
     */
    async generateHashQR(hashResult, options = {}) {
        try {
            const qrData = this.createQRData(hashResult);
            const qrOptions = { ...this.defaultOptions, ...options };
            
            return await this.generateQRCode(qrData, qrOptions);
        } catch (error) {
            console.error('QR generation error:', error);
            throw new Error(`Failed to generate QR code: ${error.message}`);
        }
    }

    /**
     * Create structured data for QR code
     */
    createQRData(hashResult) {
        // Create compact data structure for QR code
        const qrData = {
            v: "1.0", // Version
            h: hashResult.shortHash || hashResult.hash.substring(0, 16), // Short hash
            t: hashResult.timestamp,
            a: "SHA256"
        };

        // Convert to JSON string
        return JSON.stringify(qrData);
    }

    /**
     * Generate QR code using a simple implementation
     */
    async generateQRCode(data, options) {
        return new Promise((resolve, reject) => {
            try {
                // Create canvas element
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size
                canvas.width = options.width;
                canvas.height = options.height;
                
                // Use a simple QR code generation approach
                // This is a basic implementation - in production you'd use a proper QR library
                const qrCodeDataUrl = this.generateSimpleQR(data, options);
                
                resolve({
                    dataUrl: qrCodeDataUrl,
                    data: data,
                    options: options,
                    timestamp: Date.now()
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Simple QR code generation (placeholder implementation)
     * In production, you would use a proper QR code library like qrcode.js
     */
    generateSimpleQR(data, options) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = options.width;
        canvas.height = options.height;
        
        // Fill background
        ctx.fillStyle = options.colorLight;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create a simple pattern representing a QR code
        // This is a placeholder - you would integrate a real QR library here
        const cellSize = canvas.width / 25;
        const pattern = this.createQRPattern(data);
        
        ctx.fillStyle = options.colorDark;
        
        for (let row = 0; row < 25; row++) {
            for (let col = 0; col < 25; col++) {
                if (pattern[row] && pattern[row][col]) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
        
        return canvas.toDataURL();
    }

    /**
     * Create a pattern based on data (simplified)
     * This is a placeholder implementation
     */
    createQRPattern(data) {
        const size = 25;
        const pattern = Array(size).fill().map(() => Array(size).fill(false));
        
        // Create finder patterns (corners)
        this.addFinderPattern(pattern, 0, 0);
        this.addFinderPattern(pattern, 0, size - 7);
        this.addFinderPattern(pattern, size - 7, 0);
        
        // Add some data-based pattern
        const hash = this.simpleHash(data);
        for (let i = 7; i < size - 7; i++) {
            for (let j = 7; j < size - 7; j++) {
                pattern[i][j] = (hash + i + j) % 3 === 0;
            }
        }
        
        return pattern;
    }

    /**
     * Add finder pattern to QR code
     */
    addFinderPattern(pattern, startRow, startCol) {
        const finderPattern = [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1],
            [1,1,1,1,1,1,1]
        ];
        
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                if (startRow + i < pattern.length && startCol + j < pattern[0].length) {
                    pattern[startRow + i][startCol + j] = finderPattern[i][j] === 1;
                }
            }
        }
    }

    /**
     * Simple hash function for pattern generation
     */
    simpleHash(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Parse QR code data
     */
    parseQRData(qrString) {
        try {
            const data = JSON.parse(qrString);
            
            if (data.v && data.h && data.t && data.a) {
                return {
                    version: data.v,
                    shortHash: data.h,
                    timestamp: data.t,
                    algorithm: data.a,
                    isValid: true
                };
            }
            
            return { isValid: false, error: 'Invalid QR format' };
        } catch (error) {
            return { isValid: false, error: 'Failed to parse QR data' };
        }
    }

    /**
     * Validate QR code format
     */
    isValidQRFormat(qrString) {
        const parsed = this.parseQRData(qrString);
        return parsed.isValid;
    }

    /**
     * Get QR code info
     */
    getQRInfo(qrString) {
        return this.parseQRData(qrString);
    }
}

// Export for use in the main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRGenerator;
} else {
    window.QRGenerator = QRGenerator;
}
