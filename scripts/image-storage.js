/**
 * Image Storage Utility
 * Handles efficient image storage using IndexedDB with compression
 */

class ImageStorage {
    constructor() {
        this.dbName = 'RemiImageDB';
        this.dbVersion = 1;
        this.storeName = 'images';
        this.db = null;
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }

    // Compress image before storing
    compressImage(file, maxWidth = 512, maxHeight = 512, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataURL);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    // Store image in IndexedDB
    async storeImage(id, imageData) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const imageRecord = {
                id: id,
                data: imageData,
                timestamp: Date.now()
            };

            const request = store.put(imageRecord);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Retrieve image from IndexedDB
    async getImage(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Delete image from IndexedDB
    async deleteImage(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Store image with compression
    async storeCompressedImage(id, file) {
        try {
            const compressedImage = await this.compressImage(file);
            await this.storeImage(id, compressedImage);
            
            // Store reference in localStorage for quick access
            localStorage.setItem(`image_ref_${id}`, 'indexed_db');
            
            return compressedImage;
        } catch (error) {
            console.error('Error storing compressed image:', error);
            throw error;
        }
    }

    // Get image with fallback to localStorage
    async getImageWithFallback(id) {
        try {
            // Check if image is in IndexedDB
            const imageRef = localStorage.getItem(`image_ref_${id}`);
            
            if (imageRef === 'indexed_db') {
                const imageData = await this.getImage(id);
                if (imageData) return imageData;
            }
            
            // Fallback to localStorage for legacy images
            const legacyImage = localStorage.getItem(id);
            if (legacyImage) {
                // Migrate to IndexedDB
                await this.storeImage(id, legacyImage);
                localStorage.setItem(`image_ref_${id}`, 'indexed_db');
                // Remove from localStorage to save space
                localStorage.removeItem(id);
                return legacyImage;
            }
            
            return null;
        } catch (error) {
            console.error('Error retrieving image:', error);
            return null;
        }
    }

    // Clear all images
    async clearAllImages() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                // Clear localStorage references
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('image_ref_')) {
                        localStorage.removeItem(key);
                    }
                });
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get storage usage information
    async getStorageInfo() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const images = request.result;
                let totalSize = 0;
                
                images.forEach(image => {
                    totalSize += image.data.length;
                });

                resolve({
                    imageCount: images.length,
                    totalSize: totalSize,
                    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
                });
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Migrate all legacy localStorage images to IndexedDB
    async migrateLegacyImages() {
        const legacyKeys = ['profilePicture', 'userAvatar', 'remiAvatar'];
        let migratedCount = 0;

        for (const key of legacyKeys) {
            try {
                const legacyImage = localStorage.getItem(key);
                if (legacyImage && legacyImage.startsWith('data:image/')) {
                    await this.storeImage(key, legacyImage);
                    localStorage.setItem(`image_ref_${key}`, 'indexed_db');
                    localStorage.removeItem(key);
                    migratedCount++;
                    console.log(`Migrated ${key} to IndexedDB`);
                }
            } catch (error) {
                console.error(`Error migrating ${key}:`, error);
            }
        }

        return migratedCount;
    }

    // Clean up old images (older than specified days)
    async cleanupOldImages(daysOld = 30) {
        if (!this.db) await this.init();

        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const images = request.result;
                let deletedCount = 0;

                images.forEach(image => {
                    if (image.timestamp && image.timestamp < cutoffTime) {
                        store.delete(image.id);
                        localStorage.removeItem(`image_ref_${image.id}`);
                        deletedCount++;
                    }
                });

                resolve(deletedCount);
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Create global instance
window.ImageStorage = new ImageStorage();

// Initialize image storage and migrate legacy images when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.ImageStorage.init();
        
        // Migrate any legacy images from localStorage
        const migratedCount = await window.ImageStorage.migrateLegacyImages();
        if (migratedCount > 0) {
            console.log(`Successfully migrated ${migratedCount} images to IndexedDB`);
        }

        // Optional: Show storage info in console for debugging
        const storageInfo = await window.ImageStorage.getStorageInfo();
        console.log('Image Storage Info:', storageInfo);
        
    } catch (error) {
        console.error('Error initializing image storage:', error);
    }
});

// Add utility functions to window for debugging
window.debugImageStorage = {
    getInfo: () => window.ImageStorage.getStorageInfo(),
    migrate: () => window.ImageStorage.migrateLegacyImages(),
    cleanup: (days = 30) => window.ImageStorage.cleanupOldImages(days),
    clear: () => window.ImageStorage.clearAllImages()
};
