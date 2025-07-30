/**
 * Hash Generator Module for SnapHashQR
 * Generates SHA-256 hashes for image verification
 */

class HashGenerator {
    constructor() {
        this.algorithm = 'SHA-256';
    }

    /**
     * Generate SHA-256 hash from image data and metadata
     */
    async generateImageHash(imageData, metadata) {
        try {
            // Create combined data string
            const combinedData = this.createCombinedData(imageData, metadata);
            
            // Convert to ArrayBuffer
            const encoder = new TextEncoder();
            const data = encoder.encode(combinedData);
            
            // Generate hash
            const hashBuffer = await crypto.subtle.digest(this.algorithm, data);
            
            // Convert to hex string
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return {
                hash: hashHex,
                algorithm: this.algorithm,
                timestamp: Date.now(),
                metadata: metadata,
                dataSize: combinedData.length
            };
        } catch (error) {
            console.error('Hash generation error:', error);
            throw new Error(`Failed to generate hash: ${error.message}`);
        }
    }

    /**
     * Create combined data string from image and metadata
     */
    createCombinedData(imageData, metadata) {
        // Remove data URL prefix if present
        const cleanImageData = imageData.startsWith('data:') ? 
            imageData.split(',')[1] : imageData;

        // Create deterministic metadata string
        const metadataString = JSON.stringify({
            timestamp: metadata.timestamp,
            userAgent: metadata.userAgent,
            platform: metadata.platform,
            devicePixelRatio: metadata.devicePixelRatio,
            screenResolution: metadata.screenResolution,
            // Exclude variable video settings for consistency
            imageSize: metadata.dimensions || {}
        });

        // Combine image data with metadata
        return cleanImageData + '|' + metadataString;
    }

    /**
     * Verify a hash against image data and metadata
     */
    async verifyHash(imageData, metadata, providedHash) {
        try {
            const generatedResult = await this.generateImageHash(imageData, metadata);
            return {
                isValid: generatedResult.hash === providedHash.toLowerCase(),
                generatedHash: generatedResult.hash,
                providedHash: providedHash.toLowerCase(),
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Hash verification error:', error);
            throw new Error(`Failed to verify hash: ${error.message}`);
        }
    }

    /**
     * Generate a shorter hash for QR codes (first 16 characters)
     */
    async generateShortHash(imageData, metadata) {
        const fullResult = await this.generateImageHash(imageData, metadata);
        return {
            ...fullResult,
            shortHash: fullResult.hash.substring(0, 16),
            fullHash: fullResult.hash
        };
    }

    /**
     * Create a verification record
     */
    createVerificationRecord(hashResult, imageData) {
        return {
            id: this.generateId(),
            hash: hashResult.hash,
            shortHash: hashResult.hash.substring(0, 16),
            algorithm: hashResult.algorithm,
            timestamp: hashResult.timestamp,
            metadata: hashResult.metadata,
            imagePreview: this.createImagePreview(imageData),
            verified: true,
            verificationCount: 1
        };
    }

    /**
     * Generate a unique ID for records
     */
    generateId() {
        return 'shqr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Create a small preview image
     */
    createImagePreview(imageData, maxSize = 150) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate dimensions maintaining aspect ratio
                let { width, height } = img;
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = imageData;
        });
    }

    /**
     * Validate hash format
     */
    isValidHashFormat(hash) {
        // SHA-256 should be 64 characters, all hexadecimal
        return /^[a-f0-9]{64}$/i.test(hash);
    }

    /**
     * Validate short hash format
     */
    isValidShortHashFormat(hash) {
        // Short hash should be 16 characters, all hexadecimal
        return /^[a-f0-9]{16}$/i.test(hash);
    }
}

// Export for use in the main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HashGenerator;
} else {
    window.HashGenerator = HashGenerator;
}
