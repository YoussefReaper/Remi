/**
 * Global Profile Manager
 * Handles profile updates across all pages
 */

window.GlobalProfileManager = {
    // Default profiles
    defaultProfiles: {
        user: {
            name: 'Student',
            title: 'Student',
            bio: 'Dedicated student working with Remi AI to achieve academic goals.',
            picture: 'pfp/Google_2015_logo.svg.png'
        },
        remi: {
            name: 'Remi',
            personality: 'friendly',
            description: 'Your AI Study Companion - I\'m here to help you learn, stay organized, and achieve your academic goals!',
            picture: 'pfp/Remi-pfp.png'
        }
    },

    // Initialize profile system
    init() {
        this.loadProfiles();
        this.applyProfiles();
        this.setupProfileListener();
    },

    // Load profiles from localStorage
    loadProfiles() {
        const saved = localStorage.getItem('remiProfiles');
        this.profiles = saved ? 
            { ...this.defaultProfiles, ...JSON.parse(saved) } : 
            JSON.parse(JSON.stringify(this.defaultProfiles));
    },

    // Apply profiles to current page
    applyProfiles() {
        // Apply Remi profile
        if (this.profiles.remi) {
            // Update Remi name
            document.querySelectorAll('[data-remi-name]').forEach(el => {
                el.textContent = this.profiles.remi.name;
            });
            
            // Update Remi avatar with proper fallback handling
            document.querySelectorAll('[data-remi-avatar]').forEach(el => {
                this.setAvatarWithFallback(el, this.profiles.remi.picture);
            });
            
            // Update Remi description
            document.querySelectorAll('[data-remi-description]').forEach(el => {
                el.textContent = this.profiles.remi.description;
            });
            
            // Update page title
            this.updatePageTitle();
        }

        // Apply user profile
        if (this.profiles.user) {
            // Update user name
            document.querySelectorAll('[data-user-name]').forEach(el => {
                el.textContent = this.profiles.user.name;
            });
            
            // Update user avatar
            document.querySelectorAll('[data-user-avatar]').forEach(el => {
                this.setAvatarWithFallback(el, this.profiles.user.picture);
            });
            
            // Update user title
            document.querySelectorAll('[data-user-title]').forEach(el => {
                el.textContent = this.profiles.user.title;
            });
        }
    },

    // Set avatar with fallback mechanism
    setAvatarWithFallback(element, avatarPath) {
        const testImage = new Image();
        testImage.onload = function() {
            element.src = avatarPath;
        };
        testImage.onerror = function() {
            console.warn(`Avatar image not found: ${avatarPath}. Using default.`);
            element.src = 'pfp/Remi-pfp.png';
        };
        testImage.src = avatarPath;
    },

    // Setup listener for profile updates
    setupProfileListener() {
        window.addEventListener('profileUpdated', (event) => {
            this.loadProfiles();
            this.applyProfiles();
        });

        // Listen for storage changes from other tabs
        window.addEventListener('storage', (event) => {
            if (event.key === 'remiProfiles') {
                this.loadProfiles();
                this.applyProfiles();
            }
        });
    },

    // Update page title based on current Remi name
    updatePageTitle() {
        const remiName = this.profiles?.remi?.name || 'Remi';
        const currentTitle = document.title;
        
        // Update title on different pages
        if (currentTitle.includes('Chat with')) {
            document.title = `Chat with ${remiName} - AI Student Assistant`;
        } else if (currentTitle.includes('Tasks') || currentTitle.includes('Task')) {
            document.title = `Tasks - ${remiName} AI Assistant`;
        } else if (currentTitle.includes('Schedule')) {
            document.title = `Schedule - ${remiName} AI Assistant`;
        } else if (currentTitle.includes('Tracker')) {
            document.title = `Tracker - ${remiName} AI Assistant`;
        } else if (currentTitle.includes('Achievements')) {
            document.title = `Achievements - ${remiName} AI Assistant`;
        } else if (currentTitle.includes('Shop')) {
            document.title = `Shop - ${remiName} AI Assistant`;
        } else if (currentTitle.includes('Customization')) {
            document.title = `Customization - ${remiName} AI Assistant`;
        } else if (currentTitle.includes('Settings')) {
            document.title = `Settings - ${remiName} AI Assistant`;
        } else if (currentTitle.includes('Remi') || currentTitle.includes('AI Student Assistant')) {
            document.title = `${remiName} - AI Student Assistant`;
        }
    },

    // Update a profile field
    updateProfile(profileType, field, value) {
        if (!this.profiles[profileType]) {
            this.profiles[profileType] = {};
        }
        
        this.profiles[profileType][field] = value;
        localStorage.setItem('remiProfiles', JSON.stringify(this.profiles));
        
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('profileUpdated', {
            detail: { profileType, field, value }
        }));
        
        this.applyProfiles();
    },

    // Get current profiles
    getProfiles() {
        return this.profiles;
    },

    // Reset profiles to default
    resetProfiles() {
        this.profiles = JSON.parse(JSON.stringify(this.defaultProfiles));
        localStorage.setItem('remiProfiles', JSON.stringify(this.profiles));
        this.applyProfiles();
        
        window.dispatchEvent(new CustomEvent('profileUpdated', {
            detail: { action: 'reset' }
        }));
    }
};

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.GlobalProfileManager.init();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.GlobalProfileManager.init();
    });
} else {
    window.GlobalProfileManager.init();
}
