/**
 * Storage Management Utility
 * Provides storage management features for the settings page
 */

class StorageManager {
    constructor() {
        this.init();
    }

    async init() {
        // Add storage management section to settings if it doesn't exist
        this.addStorageSection();
        this.updateStorageInfo();
    }

    addStorageSection() {
        // Check if storage section already exists
        if (document.getElementById('storage-management')) return;

        // Find a good place to add the section (e.g., after customization settings)
        const settingsContainer = document.querySelector('.settings-section') || document.querySelector('.main-content');
        if (!settingsContainer) return;

        const storageSection = document.createElement('div');
        storageSection.id = 'storage-management';
        storageSection.className = 'settings-section';
        storageSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-database"></i> Storage Management</h2>
                <p>Manage image storage and free up space</p>
            </div>
            <div class="section-content">
                <div class="storage-info">
                    <div class="storage-stat">
                        <span class="stat-label">Images Stored:</span>
                        <span id="image-count" class="stat-value">Loading...</span>
                    </div>
                    <div class="storage-stat">
                        <span class="stat-label">Storage Used:</span>
                        <span id="storage-size" class="stat-value">Loading...</span>
                    </div>
                </div>
                <div class="storage-actions">
                    <button id="migrate-images" class="btn btn-secondary">
                        <i class="fas fa-sync"></i> Migrate Legacy Images
                    </button>
                    <button id="cleanup-images" class="btn btn-warning">
                        <i class="fas fa-broom"></i> Clean Old Images
                    </button>
                    <button id="clear-images" class="btn btn-danger">
                        <i class="fas fa-trash"></i> Clear All Images
                    </button>
                </div>
                <div id="storage-status" class="storage-status"></div>
            </div>
        `;

        settingsContainer.appendChild(storageSection);
        this.attachEventListeners();
    }

    attachEventListeners() {
        const migrateBtn = document.getElementById('migrate-images');
        const cleanupBtn = document.getElementById('cleanup-images');
        const clearBtn = document.getElementById('clear-images');

        if (migrateBtn) {
            migrateBtn.addEventListener('click', () => this.migrateImages());
        }

        if (cleanupBtn) {
            cleanupBtn.addEventListener('click', () => this.cleanupImages());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearImages());
        }
    }

    async updateStorageInfo() {
        try {
            if (!window.ImageStorage) return;

            const info = await window.ImageStorage.getStorageInfo();
            
            const imageCountEl = document.getElementById('image-count');
            const storageSizeEl = document.getElementById('storage-size');

            if (imageCountEl) imageCountEl.textContent = info.imageCount;
            if (storageSizeEl) storageSizeEl.textContent = `${info.totalSizeMB} MB`;

        } catch (error) {
            console.error('Error updating storage info:', error);
        }
    }

    async migrateImages() {
        this.showStatus('Migrating legacy images...', 'info');
        
        try {
            const count = await window.ImageStorage.migrateLegacyImages();
            this.showStatus(`Successfully migrated ${count} images`, 'success');
            this.updateStorageInfo();
        } catch (error) {
            this.showStatus('Error migrating images: ' + error.message, 'error');
        }
    }

    async cleanupImages() {
        if (!confirm('This will remove images older than 30 days. Continue?')) return;

        this.showStatus('Cleaning up old images...', 'info');
        
        try {
            const count = await window.ImageStorage.cleanupOldImages(30);
            this.showStatus(`Cleaned up ${count} old images`, 'success');
            this.updateStorageInfo();
        } catch (error) {
            this.showStatus('Error cleaning up images: ' + error.message, 'error');
        }
    }

    async clearImages() {
        if (!confirm('This will permanently delete ALL stored images. This cannot be undone. Continue?')) return;

        this.showStatus('Clearing all images...', 'info');
        
        try {
            await window.ImageStorage.clearAllImages();
            this.showStatus('All images cleared successfully', 'success');
            this.updateStorageInfo();
        } catch (error) {
            this.showStatus('Error clearing images: ' + error.message, 'error');
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('storage-status');
        if (!statusEl) return;

        statusEl.className = `storage-status ${type}`;
        statusEl.textContent = message;

        // Clear status after 5 seconds
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'storage-status';
        }, 5000);
    }
}

// Initialize storage manager on settings page
if (window.location.pathname.includes('settings.html') || document.title.includes('Settings')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for other scripts to load
        setTimeout(() => {
            new StorageManager();
        }, 1000);
    });
}
