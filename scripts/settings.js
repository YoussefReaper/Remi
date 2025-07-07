/**
 * Settings Page JavaScript
 * Handles profile management, appearance settings, and application configuration
 */

class SettingsManager {
    constructor() {
        this.currentSection = 'profiles';
        this.imageStorage = new ImageStorageManager();
        this.defaultProfiles = {
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
        };
        
        this.settings = {
            theme: 'auto',
            fontSize: 16,
            compactMode: false,
            animations: true,
            autoHideNavigation: false,
            taskReminders: true,
            achievementNotifications: true,
            soundEffects: true,
            privacyMode: false,
            developerMode: false,
            autoSave: true,
            backupFrequency: 'weekly'
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadProfiles();
        this.setupEventListeners();
        this.initializeUI();
        console.log('Settings Manager initialized');
    }

    setupEventListeners() {
        try {
            // Navigation
            document.querySelectorAll('.settings-nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const section = e.target.closest('.settings-nav-item')?.dataset.section;
                    if (section) {
                        this.switchSection(section);
                    }
                });
            });

            // Profile picture changes
            const changeUserPicBtn = document.getElementById('changeUserPicBtn');
            const changeRemiPicBtn = document.getElementById('changeRemiPicBtn');
            const userProfileInput = document.getElementById('userProfileInput');
            const remiProfileInput = document.getElementById('remiProfileInput');

            changeUserPicBtn?.addEventListener('click', () => {
                userProfileInput?.click();
            });
            
            changeRemiPicBtn?.addEventListener('click', () => {
                remiProfileInput?.click();
            });

            userProfileInput?.addEventListener('change', (e) => {
                this.handleProfilePictureChange(e, 'user');
            });
            
            remiProfileInput?.addEventListener('change', (e) => {
                this.handleProfilePictureChange(e, 'remi');
            });

            // Profile form inputs with validation
            const userName = document.getElementById('userName');
            const userTitle = document.getElementById('userTitle');
            const userBio = document.getElementById('userBio');
            const remiName = document.getElementById('remiName');
            const remiPersonality = document.getElementById('remiPersonality');
            const remiDescription = document.getElementById('remiDescription');

            userName?.addEventListener('input', (e) => {
                this.updateProfileData('user', 'name', e.target.value);
            });
            
            userTitle?.addEventListener('input', (e) => {
                this.updateProfileData('user', 'title', e.target.value);
            });
            
            userBio?.addEventListener('input', (e) => {
                this.updateProfileData('user', 'bio', e.target.value);
            });

            remiName?.addEventListener('input', (e) => {
                this.updateProfileData('remi', 'name', e.target.value);
            });
            
            remiPersonality?.addEventListener('change', (e) => {
                this.updateProfileData('remi', 'personality', e.target.value);
            });
            
            remiDescription?.addEventListener('input', (e) => {
                this.updateProfileData('remi', 'description', e.target.value);
            });

            // Profile actions
            const saveProfilesBtn = document.getElementById('saveProfilesBtn');
            const resetProfilesBtn = document.getElementById('resetProfilesBtn');
            const exportProfilesBtn = document.getElementById('exportProfilesBtn');
            const importProfilesBtn = document.getElementById('importProfilesBtn');
            const importProfilesInput = document.getElementById('importProfilesInput');

            saveProfilesBtn?.addEventListener('click', () => {
                this.saveProfiles();
            });
            
            resetProfilesBtn?.addEventListener('click', () => {
                this.showConfirmation('Reset Profiles', 'Are you sure you want to reset all profiles to default? This action cannot be undone.', () => {
                    this.resetProfiles();
                });
            });
            
            exportProfilesBtn?.addEventListener('click', () => {
                this.exportProfiles();
            });
            
            importProfilesBtn?.addEventListener('click', () => {
                importProfilesInput?.click();
            });

            importProfilesInput?.addEventListener('change', (e) => {
                this.importProfiles(e.target.files[0]);
            });

            // Appearance settings
            const themeSelect = document.getElementById('themeSelect');
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            const compactModeToggle = document.getElementById('compactModeToggle');
            const animationsToggle = document.getElementById('animationsToggle');
            const autoHideToggle = document.getElementById('autoHideToggle');

            themeSelect?.addEventListener('change', (e) => {
                this.updateSetting('theme', e.target.value);
                this.applyTheme(e.target.value);
            });
            
            fontSizeSlider?.addEventListener('input', (e) => {
                this.updateSetting('fontSize', parseInt(e.target.value));
                this.applyFontSize(e.target.value);
                const fontSizeValue = document.getElementById('fontSizeValue');
                if (fontSizeValue) fontSizeValue.textContent = e.target.value + 'px';
            });
            
            compactModeToggle?.addEventListener('change', (e) => {
                this.updateSetting('compactMode', e.target.checked);
                this.applyCompactMode(e.target.checked);
            });
            
            animationsToggle?.addEventListener('change', (e) => {
                this.updateSetting('animations', e.target.checked);
                this.applyAnimations(e.target.checked);
            });

            autoHideToggle?.addEventListener('change', (e) => {
                this.updateSetting('autoHideNavigation', e.target.checked);
                this.applyAutoHideNavigation(e.target.checked);
            });

            // Notification settings
            const taskRemindersToggle = document.getElementById('taskRemindersToggle');
            const achievementNotificationsToggle = document.getElementById('achievementNotificationsToggle');
            const soundEffectsToggle = document.getElementById('soundEffectsToggle');

            taskRemindersToggle?.addEventListener('change', (e) => {
                this.updateSetting('taskReminders', e.target.checked);
            });
            
            achievementNotificationsToggle?.addEventListener('change', (e) => {
                this.updateSetting('achievementNotifications', e.target.checked);
            });
            
            soundEffectsToggle?.addEventListener('change', (e) => {
                this.updateSetting('soundEffects', e.target.checked);
            });

            // Privacy settings
            const clearChatHistoryBtn = document.getElementById('clearChatHistoryBtn');
            const clearLocalDataBtn = document.getElementById('clearLocalDataBtn');
            const privacyModeToggle = document.getElementById('privacyModeToggle');

            clearChatHistoryBtn?.addEventListener('click', () => {
                this.showConfirmation('Clear Chat History', 'Are you sure you want to clear all chat history? This action cannot be undone.', () => {
                    this.clearChatHistory();
                });
            });
            
            clearLocalDataBtn?.addEventListener('click', () => {
                this.showConfirmation('Clear All Data', 'Are you sure you want to clear all local data? This will reset the application to its initial state.', () => {
                    this.clearAllData();
                });
            });
            
            privacyModeToggle?.addEventListener('change', (e) => {
                this.updateSetting('privacyMode', e.target.checked);
            });

            // Advanced settings
            const developerModeToggle = document.getElementById('developerModeToggle');
            const autoSaveToggle = document.getElementById('autoSaveToggle');
            const backupFrequency = document.getElementById('backupFrequency');
            const resetAppBtn = document.getElementById('resetAppBtn');

            developerModeToggle?.addEventListener('change', (e) => {
                this.updateSetting('developerMode', e.target.checked);
                this.applyDeveloperMode(e.target.checked);
            });
            
            autoSaveToggle?.addEventListener('change', (e) => {
                this.updateSetting('autoSave', e.target.checked);
            });
            
            backupFrequency?.addEventListener('change', (e) => {
                this.updateSetting('backupFrequency', e.target.value);
            });
            
            resetAppBtn?.addEventListener('click', () => {
                this.showConfirmation('Factory Reset', 'Are you sure you want to perform a factory reset? This will delete all data and settings and cannot be undone.', () => {
                    this.factoryReset();
                });
            });

            // Modal handlers
            const modalCancelBtn = document.getElementById('modalCancelBtn');
            const modalConfirmBtn = document.getElementById('modalConfirmBtn');
            const confirmationModal = document.getElementById('confirmationModal');

            modalCancelBtn?.addEventListener('click', () => {
                this.hideModal();
            });
            
            modalConfirmBtn?.addEventListener('click', () => {
                if (this.pendingAction) {
                    this.pendingAction();
                    this.pendingAction = null;
                }
                this.hideModal();
            });

            // Close modal on overlay click
            confirmationModal?.addEventListener('click', (e) => {
                if (e.target.id === 'confirmationModal') {
                    this.hideModal();
                }
            });
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            this.showNotification('Error initializing settings interface', 'error');
        }
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;
    }

    async handleProfilePictureChange(event, profileType) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showNotification('Please select a valid image file', 'error');
                return;
            }
            
            // Validate file size (max 10MB - we'll compress it anyway)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                this.showNotification('Image file is too large. Please select a file under 10MB', 'error');
                return;
            }

            // Show loading state
            this.showNotification('Processing image...', 'info');
            
            // Store the image using our efficient storage manager
            const imageKey = `${profileType}_profile_${Date.now()}`;
            const storageResult = await this.imageStorage.storeImage(file, imageKey);
            
            // Get the processed image for immediate display
            const processedImageUrl = await this.imageStorage.getImage(imageKey);
            
            if (processedImageUrl) {
                // Update the profile with the storage reference
                this.updateProfilePicture(profileType, imageKey, processedImageUrl);
                this.showNotification('Profile picture updated successfully!', 'success');
            } else {
                throw new Error('Failed to process image');
            }
            
        } catch (error) {
            console.error('Error handling profile picture change:', error);
            this.showNotification('Error updating profile picture: ' + error.message, 'error');
        }
    }

    updateProfilePicture(profileType, imageKey, displayUrl) {
        const imgElement = document.getElementById(`${profileType}ProfilePic`);
        if (imgElement) {
            imgElement.src = displayUrl;
            // Store the image key reference instead of the full data URL
            this.updateProfileData(profileType, 'picture', imageKey);
            
            // Update across all pages
            this.updateProfileAcrossPages(profileType, 'picture', displayUrl);
        }
    }

    /**
     * Resolve an image URL from storage key or direct URL
     * @param {string} pictureValue - Could be a storage key or direct URL
     * @returns {Promise<string>} - Resolved image URL
     */
    async resolveImageUrl(pictureValue) {
        try {
            // If it's already a valid URL or data URL, return as is
            if (pictureValue.startsWith('data:') || 
                pictureValue.startsWith('http') || 
                pictureValue.startsWith('pfp/') || 
                pictureValue.startsWith('./') || 
                pictureValue.startsWith('../')) {
                return pictureValue;
            }

            // Check if it's a storage key (stored images start with profileType_profile_)
            if (pictureValue.includes('_profile_')) {
                const storedImage = await this.imageStorage.getImage(pictureValue);
                if (storedImage) {
                    return storedImage;
                }
            }

            // Fallback to original value
            return pictureValue;
        } catch (error) {
            console.error('Error resolving image URL:', error);
            return pictureValue; // Return original value as fallback
        }
    }

    safeLocalStorageSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage error:', error);
            if (error.name === 'QuotaExceededError') {
                this.showNotification('Storage quota exceeded. Please clear some data.', 'error');
            } else {
                this.showNotification('Error saving data', 'error');
            }
            return false;
        }
    }

    safeLocalStorageGet(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return defaultValue;
        }
    }

    updateProfileData(profileType, field, value) {
        try {
            if (!this.currentProfiles) {
                this.currentProfiles = JSON.parse(JSON.stringify(this.defaultProfiles));
            }
            
            // Validate profile data before updating
            if (!this.validateProfileData(profileType, field, value)) {
                return;
            }
            
            this.currentProfiles[profileType][field] = value;
            
            // Auto-save if enabled
            if (this.settings.autoSave) {
                this.saveProfiles();
            }
            
            // Update across all pages for important fields
            if (['name', 'picture', 'description', 'title'].includes(field)) {
                this.updateProfileAcrossPages(profileType, field, value);
            }
        } catch (error) {
            console.error('Error updating profile data:', error);
            this.showNotification('Error updating profile', 'error');
        }
    }

    updateProfileAcrossPages(profileType, field, value) {
        console.log('Updating profile across pages:', profileType, field, value);
        
        // Use GlobalProfileManager if available, otherwise fallback to direct localStorage
        if (window.GlobalProfileManager) {
            console.log('Using GlobalProfileManager');
            window.GlobalProfileManager.updateProfile(profileType, field, value);
        } else {
            console.log('GlobalProfileManager not available, using localStorage fallback');
            // Store in localStorage for other pages to access
            const globalProfiles = JSON.parse(localStorage.getItem('remiProfiles') || '{}');
            if (!globalProfiles[profileType]) {
                globalProfiles[profileType] = {};
            }
            globalProfiles[profileType][field] = value;
            localStorage.setItem('remiProfiles', JSON.stringify(globalProfiles));
        }

        // Update current page elements immediately
        if (profileType === 'remi') {
            if (field === 'name') {
                document.querySelectorAll('[data-remi-name]').forEach(el => {
                    el.textContent = value;
                });
            } else if (field === 'picture') {
                document.querySelectorAll('[data-remi-avatar]').forEach(el => {
                    el.src = value;
                });
            } else if (field === 'description') {
                document.querySelectorAll('[data-remi-description]').forEach(el => {
                    el.textContent = value;
                });
            }
        }
        
        if (profileType === 'user') {
            if (field === 'name') {
                document.querySelectorAll('[data-user-name]').forEach(el => {
                    el.textContent = value;
                });
            } else if (field === 'picture') {
                document.querySelectorAll('[data-user-avatar]').forEach(el => {
                    el.src = value;
                });
            } else if (field === 'title') {
                document.querySelectorAll('[data-user-title]').forEach(el => {
                    el.textContent = value;
                });
            }
        }

        // Dispatch custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('profileUpdated', {
            detail: { profileType, field, value }
        }));
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('remiSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.showNotification('Error loading saved settings, using defaults', 'warning');
        }
    }

    loadProfiles() {
        try {
            const savedProfiles = localStorage.getItem('remiProfiles');
            if (savedProfiles) {
                const parsed = JSON.parse(savedProfiles);
                this.currentProfiles = { ...this.defaultProfiles, ...parsed };
            } else {
                this.currentProfiles = JSON.parse(JSON.stringify(this.defaultProfiles));
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
            this.currentProfiles = JSON.parse(JSON.stringify(this.defaultProfiles));
            this.showNotification('Error loading saved profiles, using defaults', 'warning');
        }
    }

    async initializeUI() {
        try {
            // Load profile data into forms
            if (this.currentProfiles.user) {
                const user = this.currentProfiles.user;
                const userName = document.getElementById('userName');
                const userTitle = document.getElementById('userTitle');
                const userBio = document.getElementById('userBio');
                const userProfilePic = document.getElementById('userProfilePic');

                if (userName) userName.value = user.name || '';
                if (userTitle) userTitle.value = user.title || '';
                if (userBio) userBio.value = user.bio || '';
                
                if (userProfilePic && user.picture) {
                    // Check if it's a storage key or direct URL
                    const imageUrl = await this.resolveImageUrl(user.picture);
                    userProfilePic.src = imageUrl;
                    userProfilePic.onerror = function() {
                        this.src = 'pfp/Google_2015_logo.svg.png';
                    };
                }
            }
            
            if (this.currentProfiles.remi) {
                const remi = this.currentProfiles.remi;
                const remiName = document.getElementById('remiName');
                const remiPersonality = document.getElementById('remiPersonality');
                const remiDescription = document.getElementById('remiDescription');
                const remiProfilePic = document.getElementById('remiProfilePic');

                if (remiName) remiName.value = remi.name || '';
                if (remiPersonality) remiPersonality.value = remi.personality || 'friendly';
                if (remiDescription) remiDescription.value = remi.description || '';
                
                if (remiProfilePic && remi.picture) {
                    // Check if it's a storage key or direct URL
                    const imageUrl = await this.resolveImageUrl(remi.picture);
                    remiProfilePic.src = imageUrl;
                    remiProfilePic.onerror = function() {
                        this.src = 'pfp/Remi-pfp.png';
                    };
                }
            }

            // Load appearance settings
            const themeSelect = document.getElementById('themeSelect');
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            const fontSizeValue = document.getElementById('fontSizeValue');
            const compactModeToggle = document.getElementById('compactModeToggle');
            const animationsToggle = document.getElementById('animationsToggle');
            const autoHideToggle = document.getElementById('autoHideToggle');

            if (themeSelect) themeSelect.value = this.settings.theme;
            if (fontSizeSlider) fontSizeSlider.value = this.settings.fontSize;
            if (fontSizeValue) fontSizeValue.textContent = this.settings.fontSize + 'px';
            if (compactModeToggle) compactModeToggle.checked = this.settings.compactMode;
            if (animationsToggle) animationsToggle.checked = this.settings.animations;
            if (autoHideToggle) autoHideToggle.checked = this.settings.autoHideNavigation;

            // Load notification settings
            const taskRemindersToggle = document.getElementById('taskRemindersToggle');
            const achievementNotificationsToggle = document.getElementById('achievementNotificationsToggle');
            const soundEffectsToggle = document.getElementById('soundEffectsToggle');

            if (taskRemindersToggle) taskRemindersToggle.checked = this.settings.taskReminders;
            if (achievementNotificationsToggle) achievementNotificationsToggle.checked = this.settings.achievementNotifications;
            if (soundEffectsToggle) soundEffectsToggle.checked = this.settings.soundEffects;

            // Load privacy settings
            const privacyModeToggle = document.getElementById('privacyModeToggle');
            if (privacyModeToggle) privacyModeToggle.checked = this.settings.privacyMode;

            // Load advanced settings
            const developerModeToggle = document.getElementById('developerModeToggle');
            const autoSaveToggle = document.getElementById('autoSaveToggle');
            const backupFrequency = document.getElementById('backupFrequency');

            if (developerModeToggle) developerModeToggle.checked = this.settings.developerMode;
            if (autoSaveToggle) autoSaveToggle.checked = this.settings.autoSave;
            if (backupFrequency) backupFrequency.value = this.settings.backupFrequency;

            // Apply current settings
            this.applyTheme(this.settings.theme);
            this.applyFontSize(this.settings.fontSize);
            this.applyCompactMode(this.settings.compactMode);
            this.applyAnimations(this.settings.animations);
            this.applyAutoHideNavigation(this.settings.autoHideNavigation);
            this.applyDeveloperMode(this.settings.developerMode);
        } catch (error) {
            console.error('Error initializing UI:', error);
            this.showNotification('Error loading settings interface', 'error');
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('remiSettings', JSON.stringify(this.settings));
    }

    saveProfiles() {
        // Ensure currentProfiles is properly initialized
        if (!this.currentProfiles) {
            this.currentProfiles = JSON.parse(JSON.stringify(this.defaultProfiles));
        }
        
        // Update currentProfiles with current form values
        this.updateCurrentProfilesFromForm();
        
        localStorage.setItem('remiProfiles', JSON.stringify(this.currentProfiles));
        this.showNotification('Profiles saved successfully!', 'success');
        
        // Update profiles across all pages
        Object.keys(this.currentProfiles).forEach(profileType => {
            const profile = this.currentProfiles[profileType];
            Object.keys(profile).forEach(field => {
                this.updateProfileAcrossPages(profileType, field, profile[field]);
            });
        });
    }

    updateCurrentProfilesFromForm() {
        // Update user profile from form - use empty string fallback to ensure values are always saved
        const userName = document.getElementById('userName')?.value || '';
        const userTitle = document.getElementById('userTitle')?.value || '';
        const userBio = document.getElementById('userBio')?.value || '';
        const userProfilePic = document.getElementById('userProfilePic')?.src || '';
        
        this.currentProfiles.user.name = userName;
        this.currentProfiles.user.title = userTitle;
        this.currentProfiles.user.bio = userBio;
        if (userProfilePic) this.currentProfiles.user.picture = userProfilePic;
        
        // Update Remi profile from form - use empty string fallback to ensure values are always saved
        const remiName = document.getElementById('remiName')?.value || '';
        const remiPersonality = document.getElementById('remiPersonality')?.value || '';
        const remiDescription = document.getElementById('remiDescription')?.value || '';
        const remiProfilePic = document.getElementById('remiProfilePic')?.src || '';
        
        this.currentProfiles.remi.name = remiName;
        this.currentProfiles.remi.personality = remiPersonality;
        this.currentProfiles.remi.description = remiDescription;
        if (remiProfilePic) this.currentProfiles.remi.picture = remiProfilePic;
    }

    resetProfiles() {
        this.currentProfiles = JSON.parse(JSON.stringify(this.defaultProfiles));
        localStorage.removeItem('remiProfiles');
        this.initializeUI();
        this.showNotification('Profiles reset to default!', 'info');
    }

    exportProfiles() {
        const exportData = {
            profiles: this.currentProfiles,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `remi-profiles-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Profiles exported successfully!', 'success');
    }

    importProfiles(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.profiles) {
                    this.currentProfiles = { ...this.defaultProfiles, ...data.profiles };
                    this.saveProfiles();
                    this.initializeUI();
                }
                
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    localStorage.setItem('remiSettings', JSON.stringify(this.settings));
                    this.initializeUI();
                }
                
                this.showNotification('Profiles imported successfully!', 'success');
            } catch (error) {
                this.showNotification('Error importing profiles: Invalid file format', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    applyTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme === 'light') {
            document.body.classList.remove('dark-mode');
        } else {
            // Auto theme - follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    }

    applyFontSize(size) {
        document.documentElement.style.setProperty('--base-font-size', size + 'px');
    }

    applyCompactMode(enabled) {
        if (enabled) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    }

    applyAnimations(enabled) {
        if (enabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    }

    applyAutoHideNavigation(enabled) {
        if (window.autoHideNavigation) {
            window.autoHideNavigation.setEnabled(enabled);
        } else {
            // Auto-hide not loaded yet, try again later
            setTimeout(() => {
                if (window.autoHideNavigation) {
                    window.autoHideNavigation.setEnabled(enabled);
                }
            }, 100);
        }
    }

    applyDeveloperMode(enabled) {
        if (enabled) {
            document.body.classList.add('developer-mode');
            console.log('Developer mode enabled');
        } else {
            document.body.classList.remove('developer-mode');
        }
    }

    clearChatHistory() {
        try {
            // Clear all chat-related localStorage entries
            const keys = Object.keys(localStorage);
            let clearedCount = 0;
            
            keys.forEach(key => {
                if (key.startsWith('chatHistory-') || key === 'chatList') {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            });
            
            this.showNotification(`Chat history cleared! (${clearedCount} items removed)`, 'info');
        } catch (error) {
            console.error('Error clearing chat history:', error);
            this.showNotification('Error clearing chat history', 'error');
        }
    }

    clearAllData() {
        try {
            // Clear all Remi-related localStorage
            const keys = Object.keys(localStorage);
            let clearedCount = 0;
            
            keys.forEach(key => {
                if (key.startsWith('remi') || key.startsWith('chat')) {
                    localStorage.removeItem(key);
                    clearedCount++;
                }
            });
            
            this.showNotification(`All data cleared! (${clearedCount} items removed) Please refresh the page.`, 'warning');
            
            // Refresh page after 2 seconds
            setTimeout(() => {
                location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error clearing all data:', error);
            this.showNotification('Error clearing data', 'error');
        }
    }

    factoryReset() {
        // Clear all data
        localStorage.clear();
        sessionStorage.clear();
        
        this.showNotification('Factory reset complete! Refreshing page...', 'info');
        
        // Refresh page after 2 seconds
        setTimeout(() => {
            location.reload();
        }, 2000);
    }

    showConfirmation(title, message, onConfirm) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        this.pendingAction = onConfirm;
        
        const modal = document.getElementById('confirmationModal');
        modal.classList.add('show');
    }

    hideModal() {
        const modal = document.getElementById('confirmationModal');
        modal.classList.remove('show');
        this.pendingAction = null;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('.notification-icon');
        const messageEl = notification.querySelector('.notification-message');
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        icon.className = `notification-icon ${icons[type]}`;
        messageEl.textContent = message;
        
        // Set notification type class
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Validation methods
    validateProfileData(profileType, field, value) {
        try {
            switch (field) {
                case 'name':
                    if (typeof value !== 'string') return false;
                    if (value.length > 50) {
                        this.showNotification('Name must be 50 characters or less', 'warning');
                        return false;
                    }
                    break;
                case 'title':
                    if (typeof value !== 'string') return false;
                    if (value.length > 30) {
                        this.showNotification('Title must be 30 characters or less', 'warning');
                        return false;
                    }
                    break;
                case 'bio':
                case 'description':
                    if (typeof value !== 'string') return false;
                    if (value.length > 500) {
                        this.showNotification('Description must be 500 characters or less', 'warning');
                        return false;
                    }
                    break;
                case 'picture':
                    if (typeof value !== 'string') return false;
                    // Check if it's a valid data URL or file path
                    if (!value.startsWith('data:image/') && !value.startsWith('pfp/') && !value.startsWith('http')) {
                        this.showNotification('Invalid image format', 'error');
                        return false;
                    }
                    break;
            }
            return true;
        } catch (error) {
            console.error('Error validating profile data:', error);
            return false;
        }
    }

    // Enhanced error handling for localStorage operations
    safeLocalStorageSet(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage error:', error);
            if (error.name === 'QuotaExceededError') {
                this.showNotification('Storage quota exceeded. Please clear some data.', 'error');
            } else {
                this.showNotification('Error saving data', 'error');
            }
            return false;
        }
    }

    safeLocalStorageGet(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return defaultValue;
        }
    }
}

/**
 * Image Storage Manager
 * Handles efficient image storage using compression and IndexedDB for large images
 */
class ImageStorageManager {
    constructor() {
        this.maxLocalStorageImageSize = 500 * 1024; // 500KB limit for localStorage
        this.compressionQuality = 0.8; // 80% quality for compression
        this.maxImageDimension = 512; // Max width/height for profile pics
    }

    /**
     * Store an image efficiently - uses localStorage for small images, IndexedDB for large ones
     */
    async storeImage(imageFile, key) {
        try {
            // First, compress and resize the image
            const compressedDataUrl = await this.compressImage(imageFile);
            
            // Check size - if small enough, use localStorage
            if (compressedDataUrl.length < this.maxLocalStorageImageSize) {
                localStorage.setItem(`image_${key}`, compressedDataUrl);
                return { type: 'localStorage', data: compressedDataUrl };
            } else {
                // Store in IndexedDB for larger images
                await this.storeInIndexedDB(key, compressedDataUrl);
                // Store reference in localStorage
                localStorage.setItem(`image_${key}`, `indexeddb:${key}`);
                return { type: 'indexedDB', data: `indexeddb:${key}` };
            }
        } catch (error) {
            console.error('Error storing image:', error);
            throw error;
        }
    }

    /**
     * Retrieve an image from storage
     */
    async getImage(key) {
        try {
            const storageRef = localStorage.getItem(`image_${key}`);
            if (!storageRef) return null;

            // Check if it's a direct data URL or IndexedDB reference
            if (storageRef.startsWith('data:')) {
                return storageRef;
            } else if (storageRef.startsWith('indexeddb:')) {
                const indexedKey = storageRef.replace('indexeddb:', '');
                return await this.getFromIndexedDB(indexedKey);
            }
            
            return null;
        } catch (error) {
            console.error('Error retrieving image:', error);
            return null;
        }
    }

    /**
     * Compress and resize an image file
     */
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = this.calculateNewDimensions(img.width, img.height);
                
                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to compressed data URL
                const compressedDataUrl = canvas.toDataURL('image/jpeg', this.compressionQuality);
                resolve(compressedDataUrl);
            };

            img.onerror = () => reject(new Error('Failed to load image'));

            // Create object URL from file
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Calculate new dimensions while maintaining aspect ratio
     */
    calculateNewDimensions(originalWidth, originalHeight) {
        const maxDim = this.maxImageDimension;
        
        if (originalWidth <= maxDim && originalHeight <= maxDim) {
            return { width: originalWidth, height: originalHeight };
        }

        if (originalWidth > originalHeight) {
            return {
                width: maxDim,
                height: Math.round((originalHeight * maxDim) / originalWidth)
            };
        } else {
            return {
                width: Math.round((originalWidth * maxDim) / originalHeight),
                height: maxDim
            };
        }
    }

    /**
     * Store image in IndexedDB
     */
    async storeInIndexedDB(key, dataUrl) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('RemiImageDB', 1);

            request.onerror = () => reject(new Error('Failed to open IndexedDB'));

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                
                const imageData = {
                    key: key,
                    data: dataUrl,
                    timestamp: Date.now()
                };

                const putRequest = store.put(imageData);
                
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(new Error('Failed to store image in IndexedDB'));
            };
        });
    }

    /**
     * Get image from IndexedDB
     */
    async getFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('RemiImageDB', 1);

            request.onerror = () => {
                console.warn('IndexedDB not available, falling back to default image');
                resolve(null);
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['images'], 'readonly');
                const store = transaction.objectStore('images');
                
                const getRequest = store.get(key);
                
                getRequest.onsuccess = () => {
                    const result = getRequest.result;
                    resolve(result ? result.data : null);
                };
                
                getRequest.onerror = () => {
                    console.warn('Failed to retrieve image from IndexedDB');
                    resolve(null);
                };
            };
        });
    }

    /**
     * Delete an image from storage
     */
    async deleteImage(key) {
        try {
            const storageRef = localStorage.getItem(`image_${key}`);
            localStorage.removeItem(`image_${key}`);

            if (storageRef && storageRef.startsWith('indexeddb:')) {
                const indexedKey = storageRef.replace('indexeddb:', '');
                await this.deleteFromIndexedDB(indexedKey);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }

    /**
     * Delete image from IndexedDB
     */
    async deleteFromIndexedDB(key) {
        return new Promise((resolve) => {
            const request = indexedDB.open('RemiImageDB', 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                
                store.delete(key);
                resolve();
            };

            request.onerror = () => {
                console.warn('Failed to delete from IndexedDB');
                resolve();
            };
        });
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});

// Listen for profile updates from other pages
window.addEventListener('profileUpdated', (event) => {
    const { profileType, field, value } = event.detail;
    console.log(`Profile updated: ${profileType}.${field} = ${value}`);
    
    // Update UI if settings page is currently active
    if (window.settingsManager && window.settingsManager.currentProfiles) {
        window.settingsManager.currentProfiles[profileType][field] = value;
        
        // Update form fields if they exist
        if (profileType === 'user' && field === 'name') {
            const nameInput = document.getElementById('userName');
            if (nameInput) nameInput.value = value;
        }
        
        if (profileType === 'remi' && field === 'name') {
            const nameInput = document.getElementById('remiName');
            if (nameInput) nameInput.value = value;
        }
    }
});
