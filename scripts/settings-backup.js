/**
 * Settings Page JavaScript
 * Handles profile management, appearance settings, and application configuration
 */

class SettingsManager {
    constructor() {
        this.currentSection = 'profiles';
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
        try {
            this.loadSettings();
            this.loadProfiles();
            this.setupEventListeners();
            this.initializeUI();
            console.log('Settings Manager initialized successfully');
            console.log('Current profiles:', this.currentProfiles);
            console.log('Current settings:', this.settings);
        } catch (error) {
            console.error('Error initializing Settings Manager:', error);
            this.showNotification('Error initializing settings', 'error');
        }
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

            // Profile picture changes with enhanced debugging
            const changeUserPicBtn = document.getElementById('changeUserPicBtn');
            const changeRemiPicBtn = document.getElementById('changeRemiPicBtn');
            const userProfileInput = document.getElementById('userProfileInput');
            const remiProfileInput = document.getElementById('remiProfileInput');

            console.log('Profile picture elements found:', {
                changeUserPicBtn: !!changeUserPicBtn,
                changeRemiPicBtn: !!changeRemiPicBtn,
                userProfileInput: !!userProfileInput,
                remiProfileInput: !!remiProfileInput
            });

            changeUserPicBtn?.addEventListener('click', (e) => {
                console.log('User profile picture button clicked');
                e.preventDefault();
                e.stopPropagation();
                if (userProfileInput) {
                    userProfileInput.value = ''; // Clear previous selection
                    userProfileInput.click();
                } else {
                    console.error('User profile input element not found');
                    this.showNotification('Error: Cannot open file selector', 'error');
                }
            });
            
            changeRemiPicBtn?.addEventListener('click', (e) => {
                console.log('Remi profile picture button clicked');
                e.preventDefault();
                e.stopPropagation();
                if (remiProfileInput) {
                    remiProfileInput.value = ''; // Clear previous selection
                    remiProfileInput.click();
                } else {
                    console.error('Remi profile input element not found');
                    this.showNotification('Error: Cannot open file selector', 'error');
                }
            });

            userProfileInput?.addEventListener('change', (e) => {
                console.log('User profile input changed:', e.target.files.length, 'files');
                if (e.target.files.length > 0) {
                    this.handleProfilePictureChange(e, 'user');
                }
            });
            
            remiProfileInput?.addEventListener('change', (e) => {
                console.log('Remi profile input changed:', e.target.files.length, 'files');
                if (e.target.files.length > 0) {
                    this.handleProfilePictureChange(e, 'remi');
                }
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

            // Test button for debugging profile updates
            const testProfileUpdateBtn = document.getElementById('testProfileUpdateBtn');
            testProfileUpdateBtn?.addEventListener('click', () => {
                this.testProfileUpdate();
            });

            // Appearance settings
            const themeSelect = document.getElementById('themeSelect');
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            const compactModeToggle = document.getElementById('compactModeToggle');
            const animationsToggle = document.getElementById('animationsToggle');

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

            // Additional fallback: make the entire profile picture container clickable
            const userProfileContainer = document.querySelector('.user-profile .profile-picture-container');
            const remiProfileContainer = document.querySelector('.remi-profile .profile-picture-container');

            userProfileContainer?.addEventListener('click', (e) => {
                console.log('User profile container clicked');
                if (userProfileInput) {
                    userProfileInput.value = '';
                    userProfileInput.click();
                }
            });

            remiProfileContainer?.addEventListener('click', (e) => {
                console.log('Remi profile container clicked');
                if (remiProfileInput) {
                    remiProfileInput.value = '';
                    remiProfileInput.click();
                }
            });

            // Text button alternatives for profile picture changes
            const changeUserPicTextBtn = document.getElementById('changeUserPicTextBtn');
            const changeRemiPicTextBtn = document.getElementById('changeRemiPicTextBtn');

            changeUserPicTextBtn?.addEventListener('click', (e) => {
                console.log('User profile picture text button clicked');
                e.preventDefault();
                e.stopPropagation();
                if (userProfileInput) {
                    userProfileInput.value = '';
                    userProfileInput.click();
                } else {
                    this.showNotification('Error: Cannot open file selector', 'error');
                }
            });

            changeRemiPicTextBtn?.addEventListener('click', (e) => {
                console.log('Remi profile picture text button clicked');
                e.preventDefault();
                e.stopPropagation();
                if (remiProfileInput) {
                    remiProfileInput.value = '';
                    remiProfileInput.click();
                } else {
                    this.showNotification('Error: Cannot open file selector', 'error');
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

    handleProfilePictureChange(event, profileType) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }
        
        console.log(`Handling profile picture change for ${profileType}:`, file.name, file.type, file.size);
        
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showNotification('Please select a valid image file', 'error');
                return;
            }
            
            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                this.showNotification('Image file is too large. Please select a file under 5MB', 'error');
                return;
            }
            
            // Show loading state
            this.showNotification('Processing image...', 'info');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imageUrl = e.target.result;
                    console.log(`Image loaded for ${profileType}, size:`, imageUrl.length);
                    this.updateProfilePicture(profileType, imageUrl);
                    this.showNotification('Profile picture updated successfully!', 'success');
                    
                    // Clear the file input to allow re-selecting the same file
                    event.target.value = '';
                } catch (error) {
                    console.error('Error processing image:', error);
                    this.showNotification('Error processing image file', 'error');
                }
            };
            
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                this.showNotification('Error reading image file', 'error');
            };
            
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error handling profile picture change:', error);
            this.showNotification('Error updating profile picture', 'error');
        }
    }

    updateProfilePicture(profileType, imageUrl) {
        try {
            const imgElement = document.getElementById(`${profileType}ProfilePic`);
            if (!imgElement) {
                console.error(`Profile picture element not found: ${profileType}ProfilePic`);
                this.showNotification('Error: Profile picture element not found', 'error');
                return;
            }
            
            console.log(`Updating ${profileType} profile picture`);
            
            // Update the image source
            imgElement.src = imageUrl;
            
            // Add error handling for image loading
            imgElement.onerror = () => {
                console.error('Error loading new profile image');
                this.showNotification('Error loading new profile image', 'error');
                // Revert to default image
                if (profileType === 'user') {
                    imgElement.src = 'pfp/Google_2015_logo.svg.png';
                } else {
                    imgElement.src = 'pfp/Remi-pfp.png';
                }
            };
            
            imgElement.onload = () => {
                console.log(`${profileType} profile picture loaded successfully`);
            };
            
            // Update profile data
            this.updateProfileData(profileType, 'picture', imageUrl);
            
            // Update across all pages
            this.updateProfileAcrossPages(profileType, 'picture', imageUrl);
        } catch (error) {
            console.error('Error updating profile picture:', error);
            this.showNotification('Error updating profile picture display', 'error');
        }
    }

    updateProfileData(profileType, field, value) {
        try {
            console.log(`[Profile Update] Updating ${profileType}.${field} = ${value}`);
            
            if (!this.currentProfiles) {
                console.log('[Profile Update] Initializing currentProfiles');
                this.currentProfiles = JSON.parse(JSON.stringify(this.defaultProfiles));
            }
            
            // Ensure the profile type exists
            if (!this.currentProfiles[profileType]) {
                console.log(`[Profile Update] Creating profile type: ${profileType}`);
                this.currentProfiles[profileType] = {};
            }
            
            // Validate profile data before updating
            if (!this.validateProfileData(profileType, field, value)) {
                console.log(`[Profile Update] Validation failed for ${profileType}.${field} = ${value}`);
                this.showNotification(`Invalid ${field} value`, 'error');
                return false;
            }
            
            // Store previous value for comparison
            const previousValue = this.currentProfiles[profileType][field];
            
            // Update the profile data
            this.currentProfiles[profileType][field] = value;
            console.log(`[Profile Update] Profile updated: ${profileType}.${field} changed from "${previousValue}" to "${value}"`);
            
            // Update UI immediately
            this.updateProfileUI(profileType, field, value);
            
            // Auto-save if enabled
            if (this.settings.autoSave) {
                console.log('[Profile Update] Auto-saving profiles');
                setTimeout(() => this.saveProfiles(), 100); // Debounce saves
            }
            
            // Update across all pages for name and picture changes
            if (field === 'name' || field === 'picture') {
                this.updateProfileAcrossPages(profileType, field, value);
            }
            
            // Show success feedback for important changes
            if (field === 'name' || field === 'picture') {
                this.showNotification(`${profileType} ${field} updated successfully`, 'success');
            }
            
            return true;
        } catch (error) {
            console.error('[Profile Update] Error updating profile data:', error);
            this.showNotification('Error updating profile', 'error');
            return false;
        }
    }

    updateProfileUI(profileType, field, value) {
        try {
            console.log(`[UI Update] Updating UI for ${profileType}.${field} = ${value}`);
            
            if (profileType === 'user') {
                switch (field) {
                    case 'name':
                        const userNameEl = document.getElementById('userName');
                        if (userNameEl && userNameEl.value !== value) {
                            userNameEl.value = value;
                        }
                        break;
                    case 'title':
                        const userTitleEl = document.getElementById('userTitle');
                        if (userTitleEl && userTitleEl.value !== value) {
                            userTitleEl.value = value;
                        }
                        break;
                    case 'bio':
                        const userBioEl = document.getElementById('userBio');
                        if (userBioEl && userBioEl.value !== value) {
                            userBioEl.value = value;
                        }
                        break;
                    case 'picture':
                        const userPicEl = document.getElementById('userProfilePic');
                        if (userPicEl && userPicEl.src !== value) {
                            userPicEl.src = value;
                            userPicEl.onerror = function() {
                                console.log('User profile picture failed to load, using default');
                                this.src = 'pfp/Google_2015_logo.svg.png';
                            };
                        }
                        break;
                }
            } else if (profileType === 'remi') {
                switch (field) {
                    case 'name':
                        const remiNameEl = document.getElementById('remiName');
                        if (remiNameEl && remiNameEl.value !== value) {
                            remiNameEl.value = value;
                        }
                        break;
                    case 'personality':
                        const remiPersonalityEl = document.getElementById('remiPersonality');
                        if (remiPersonalityEl && remiPersonalityEl.value !== value) {
                            remiPersonalityEl.value = value;
                        }
                        break;
                    case 'description':
                        const remiDescEl = document.getElementById('remiDescription');
                        if (remiDescEl && remiDescEl.value !== value) {
                            remiDescEl.value = value;
                        }
                        break;
                    case 'picture':
                        const remiPicEl = document.getElementById('remiProfilePic');
                        if (remiPicEl && remiPicEl.src !== value) {
                            remiPicEl.src = value;
                            remiPicEl.onerror = function() {
                                console.log('Remi profile picture failed to load, using default');
                                this.src = 'pfp/Remi-pfp.png';
                            };
                        }
                        break;
                }
            }
        } catch (error) {
            console.error('[UI Update] Error updating UI:', error);
        }
    }

    updateProfileAcrossPages(profileType, field, value) {
        try {
            console.log(`[Cross-Page] Updating ${profileType}.${field} across pages with value: ${value}`);
            
            // Store in localStorage for other pages to access
            const globalProfiles = this.safeLocalStorageGet('remiProfiles', {});
            if (!globalProfiles[profileType]) {
                globalProfiles[profileType] = {};
            }
            globalProfiles[profileType][field] = value;
            
            console.log(`[Cross-Page] Storing in localStorage:`, globalProfiles);
            
            if (!this.safeLocalStorageSet('remiProfiles', globalProfiles)) {
                console.error('[Cross-Page] Failed to save profiles to localStorage');
                this.showNotification('Error saving profile data', 'error');
                return false;
            }

            // Update current page elements
            if (profileType === 'remi' && field === 'name') {
                // Update all Remi name references on current page
                const remiElements = document.querySelectorAll('[data-remi-name]');
                console.log(`[Cross-Page] Found ${remiElements.length} Remi name elements to update`);
                remiElements.forEach(el => {
                    el.textContent = value;
                });
            }
            
            if (profileType === 'remi' && field === 'picture') {
                // Update all Remi avatar references on current page
                const remiAvatars = document.querySelectorAll('[data-remi-avatar]');
                console.log(`[Cross-Page] Found ${remiAvatars.length} Remi avatar elements to update`);
                remiAvatars.forEach(el => {
                    el.src = value;
                    el.onerror = function() { 
                        console.log('[Cross-Page] Remi avatar failed to load, using default');
                        this.src = 'pfp/Remi-pfp.png'; 
                    };
                });
            }
            
            if (profileType === 'user' && field === 'name') {
                // Update all user name references on current page
                const userElements = document.querySelectorAll('[data-user-name]');
                console.log(`[Cross-Page] Found ${userElements.length} user name elements to update`);
                userElements.forEach(el => {
                    el.textContent = value;
                });
            }
            
            if (profileType === 'user' && field === 'picture') {
                // Update all user avatar references on current page
                const userAvatars = document.querySelectorAll('[data-user-avatar]');
                console.log(`[Cross-Page] Found ${userAvatars.length} user avatar elements to update`);
                userAvatars.forEach(el => {
                    el.src = value;
                    el.onerror = function() { 
                        console.log('[Cross-Page] User avatar failed to load, using default');
                        this.src = 'pfp/Google_2015_logo.svg.png'; 
                    };
                });
            }

            // Dispatch custom event for other scripts to listen to
            window.dispatchEvent(new CustomEvent('profileUpdated', {
                detail: { profileType, field, value }
            }));
            
            console.log(`[Cross-Page] Profile update dispatched: ${profileType}.${field}`);
            return true;
        } catch (error) {
            console.error('[Cross-Page] Error updating profile across pages:', error);
            this.showNotification('Error updating profile globally', 'error');
            return false;
        }
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

    initializeUI() {
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
                    userProfilePic.src = user.picture;
                    userProfilePic.onerror = function() {
                        console.log('User profile picture failed to load, using default');
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
                    remiProfilePic.src = remi.picture;
                    remiProfilePic.onerror = function() {
                        console.log('Remi profile picture failed to load, using default');
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

            if (themeSelect) themeSelect.value = this.settings.theme;
            if (fontSizeSlider) fontSizeSlider.value = this.settings.fontSize;
            if (fontSizeValue) fontSizeValue.textContent = this.settings.fontSize + 'px';
            if (compactModeToggle) compactModeToggle.checked = this.settings.compactMode;
            if (animationsToggle) animationsToggle.checked = this.settings.animations;

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
            this.applyDeveloperMode(this.settings.developerMode);
            
            // Show initialization success
            console.log('Settings UI initialized successfully');
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
        try {
            console.log('[Save] Starting profile save operation...');
            
            // Ensure currentProfiles is properly initialized
            if (!this.currentProfiles) {
                console.log('[Save] Initializing currentProfiles for save');
                this.currentProfiles = JSON.parse(JSON.stringify(this.defaultProfiles));
            }
            
            // Update currentProfiles with current form values
            this.updateCurrentProfilesFromForm();
            
            console.log('[Save] Profiles to save:', JSON.stringify(this.currentProfiles, null, 2));
            
            // Validate profiles before saving
            if (!this.currentProfiles.user || !this.currentProfiles.remi) {
                console.error('[Save] Invalid profile structure');
                this.showNotification('Error: Invalid profile structure', 'error');
                return false;
            }
            
            // Clean profile data before saving
            const cleanedProfiles = this.cleanProfileData(this.currentProfiles);
            if (!cleanedProfiles) {
                this.showNotification('Error: Invalid profile data', 'error');
                return false;
            }
            
            if (!this.safeLocalStorageSet('remiProfiles', cleanedProfiles)) {
                console.error('[Save] Primary save failed, attempting emergency save...');
                if (this.emergencySaveProfiles(this.currentProfiles)) {
                    this.showNotification('Profiles saved with reduced data due to storage issues', 'warning');
                } else {
                    this.showNotification('Error saving profiles to storage', 'error');
                    return false;
                }
            } else {
                this.showNotification('Profiles saved successfully!', 'success');
            }
            
            // Update profiles across all pages
            Object.keys(this.currentProfiles).forEach(profileType => {
                const profile = this.currentProfiles[profileType];
                Object.keys(profile).forEach(field => {
                    this.updateProfileAcrossPages(profileType, field, profile[field]);
                });
            });
            
            console.log('[Save] Profiles saved and updated across pages');
            return true;
        } catch (error) {
            console.error('[Save] Error saving profiles:', error);
            this.showNotification('Error saving profiles', 'error');
            return false;
        }
    }

    // Emergency fallback save mechanism
    emergencySaveProfiles(profiles) {
        console.log('[Emergency Save] Attempting emergency profile save...');
        
        try {
            // Method 1: Try minimal profile data
            const minimalProfiles = {
                user: {
                    name: profiles.user?.name || 'Student',
                    title: profiles.user?.title || 'Student',
                    bio: profiles.user?.bio || '',
                    picture: profiles.user?.picture || 'pfp/Google_2015_logo.svg.png'
                },
                remi: {
                    name: profiles.remi?.name || 'Remi',
                    personality: profiles.remi?.personality || 'friendly',
                    description: profiles.remi?.description || '',
                    picture: profiles.remi?.picture || 'pfp/Remi-pfp.png'
                }
            };
            
            console.log('[Emergency Save] Trying minimal profile data...');
            localStorage.setItem('remiProfiles', JSON.stringify(minimalProfiles));
            console.log('[Emergency Save] ✓ Minimal profile save successful');
            return true;
            
        } catch (error1) {
            console.error('[Emergency Save] Minimal save failed:', error1);
            
            try {
                // Method 2: Try saving just names
                const nameOnlyProfiles = {
                    user: { name: profiles.user?.name || 'Student' },
                    remi: { name: profiles.remi?.name || 'Remi' }
                };
                
                console.log('[Emergency Save] Trying name-only profiles...');
                localStorage.setItem('remiProfiles', JSON.stringify(nameOnlyProfiles));
                console.log('[Emergency Save] ✓ Name-only profile save successful');
                return true;
                
            } catch (error2) {
                console.error('[Emergency Save] Name-only save failed:', error2);
                
                try {
                    // Method 3: Try clearing storage and saving
                    console.log('[Emergency Save] Clearing localStorage and retrying...');
                    const backupData = {};
                    
                    // Backup other important data
                    for (let key in localStorage) {
                        if (localStorage.hasOwnProperty(key) && key !== 'remiProfiles') {
                            backupData[key] = localStorage.getItem(key);
                        }
                    }
                    
                    localStorage.clear();
                    
                    // Restore other data
                    for (let key in backupData) {
                        try {
                            localStorage.setItem(key, backupData[key]);
                        } catch (restoreError) {
                            console.warn(`[Emergency Save] Could not restore ${key}:`, restoreError);
                        }
                    }
                    
                    // Try saving profiles again
                    localStorage.setItem('remiProfiles', JSON.stringify(minimalProfiles));
                    console.log('[Emergency Save] ✓ Post-clear profile save successful');
                    return true;
                    
                } catch (error3) {
                    console.error('[Emergency Save] All emergency save methods failed:', error3);
                    return false;
                }
            }
        }
    }

    updateCurrentProfilesFromForm() {
        try {
            console.log('[Form Update] Updating current profiles from form...');
            
            // Ensure currentProfiles exists
            if (!this.currentProfiles) {
                this.currentProfiles = JSON.parse(JSON.stringify(this.defaultProfiles));
            }
            
            // Update user profile from form
            const userName = document.getElementById('userName');
            const userTitle = document.getElementById('userTitle');
            const userBio = document.getElementById('userBio');
            const userProfilePic = document.getElementById('userProfilePic');
            
            if (!this.currentProfiles.user) {
                this.currentProfiles.user = {};
            }
            
            if (userName) {
                this.currentProfiles.user.name = userName.value || '';
                console.log('[Form Update] User name:', userName.value);
            } else {
                console.warn('[Form Update] userName element not found');
            }
            
            if (userTitle) {
                this.currentProfiles.user.title = userTitle.value || '';
                console.log('[Form Update] User title:', userTitle.value);
            } else {
                console.warn('[Form Update] userTitle element not found');
            }
            
            if (userBio) {
                this.currentProfiles.user.bio = userBio.value || '';
                console.log('[Form Update] User bio length:', userBio.value.length);
            } else {
                console.warn('[Form Update] userBio element not found');
            }
            
            if (userProfilePic && userProfilePic.src) {
                this.currentProfiles.user.picture = userProfilePic.src;
                console.log('[Form Update] User picture:', userProfilePic.src);
            } else {
                console.warn('[Form Update] userProfilePic element not found or no src');
            }
            
            // Update Remi profile from form
            const remiName = document.getElementById('remiName');
            const remiPersonality = document.getElementById('remiPersonality');
            const remiDescription = document.getElementById('remiDescription');
            const remiProfilePic = document.getElementById('remiProfilePic');
            
            if (!this.currentProfiles.remi) {
                this.currentProfiles.remi = {};
            }
            
            if (remiName) {
                this.currentProfiles.remi.name = remiName.value || '';
                console.log('[Form Update] Remi name:', remiName.value);
            } else {
                console.warn('[Form Update] remiName element not found');
            }
            
            if (remiPersonality) {
                this.currentProfiles.remi.personality = remiPersonality.value || '';
                console.log('[Form Update] Remi personality:', remiPersonality.value);
            } else {
                console.warn('[Form Update] remiPersonality element not found');
            }
            
            if (remiDescription) {
                this.currentProfiles.remi.description = remiDescription.value || '';
                console.log('[Form Update] Remi description length:', remiDescription.value.length);
            } else {
                console.warn('[Form Update] remiDescription element not found');
            }
            
            if (remiProfilePic && remiProfilePic.src) {
                this.currentProfiles.remi.picture = remiProfilePic.src;
                console.log('[Form Update] Remi picture:', remiProfilePic.src);
            } else {
                console.warn('[Form Update] remiProfilePic element not found or no src');
            }
            
            console.log('[Form Update] Form data updated in currentProfiles:', this.currentProfiles);
        } catch (error) {
            console.error('[Form Update] Error updating profiles from form:', error);
            this.showNotification('Error reading form data', 'error');
        }
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
            console.log(`[LocalStorage] Attempting to save ${key}:`, value);
            
            // Check if value can be stringified
            let stringValue;
            try {
                stringValue = JSON.stringify(value);
                console.log(`[LocalStorage] Stringified data length: ${stringValue.length} characters`);
            } catch (stringifyError) {
                console.error('[LocalStorage] JSON.stringify error:', stringifyError);
                console.error('[LocalStorage] Problematic value:', value);
                this.showNotification('Error: Cannot convert profile data to storage format', 'error');
                return false;
            }
            
            // Check localStorage availability
            if (typeof(Storage) === "undefined") {
                console.error('[LocalStorage] localStorage not supported');
                this.showNotification('Error: Browser does not support local storage', 'error');
                return false;
            }
            
            // Check available storage space
            try {
                const testKey = '__test_storage__';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
            } catch (testError) {
                console.error('[LocalStorage] Storage test failed:', testError);
                this.showNotification('Error: Storage is not accessible', 'error');
                return false;
            }
            
            // Attempt to save
            localStorage.setItem(key, stringValue);
            console.log(`[LocalStorage] Successfully saved ${key} to localStorage`);
            
            // Verify the save
            const retrieved = localStorage.getItem(key);
            if (retrieved !== stringValue) {
                console.error('[LocalStorage] Verification failed: saved data doesn\'t match');
                this.showNotification('Error: Data verification failed after save', 'error');
                return false;
            }
            
            console.log('[LocalStorage] Save operation completed and verified successfully');
            return true;
        } catch (error) {
            console.error('[LocalStorage] Save error:', error);
            console.error('[LocalStorage] Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            if (error.name === 'QuotaExceededError') {
                console.error('[LocalStorage] Storage quota exceeded');
                this.showNotification('Storage quota exceeded. Please clear some data or try a smaller profile.', 'error');
            } else if (error.name === 'SecurityError') {
                console.error('[LocalStorage] Security error - localStorage blocked');
                this.showNotification('Error: Storage access blocked by browser security settings', 'error');
            } else {
                this.showNotification(`Error saving data: ${error.message}`, 'error');
            }
            return false;
        }
    }

    safeLocalStorageGet(key, defaultValue = null) {
        try {
            console.log(`[LocalStorage] Attempting to retrieve ${key}`);
            
            if (typeof(Storage) === "undefined") {
                console.error('[LocalStorage] localStorage not supported');
                return defaultValue;
            }
            
            const item = localStorage.getItem(key);
            console.log(`[LocalStorage] Raw retrieved data:`, item);
            
            if (item === null) {
                console.log(`[LocalStorage] No data found for ${key}, returning default value`);
                return defaultValue;
            }
            
            if (item === '') {
                console.log(`[LocalStorage] Empty string found for ${key}, returning default value`);
                return defaultValue;
            }
            
            const parsed = JSON.parse(item);
            console.log(`[LocalStorage] Successfully parsed data for ${key}:`, parsed);
            return parsed;
        } catch (error) {
            console.error(`[LocalStorage] Error reading ${key}:`, error);
            console.error('[LocalStorage] Error details:', {
                name: error.name,
                message: error.message,
                rawData: localStorage.getItem(key)
            });
            return defaultValue;
        }
    }

    cleanProfileData(profiles) {
        try {
            console.log('[Data Cleanup] Cleaning profile data before save...');
            
            const cleaned = JSON.parse(JSON.stringify(profiles));
            
            // Remove any circular references or functions
            const cleanObject = (obj) => {
                if (obj === null || typeof obj !== 'object') return obj;
                if (obj instanceof Date) return obj.toISOString();
                if (obj instanceof RegExp) return obj.toString();
                if (typeof obj === 'function') return null;
                
                const seen = new WeakSet();
                const clean = (item) => {
                    if (item === null || typeof item !== 'object') return item;
                    if (seen.has(item)) return '[Circular Reference]';
                    seen.add(item);
                    
                    if (Array.isArray(item)) {
                        return item.map(clean);
                    }
                    
                    const result = {};
                    for (const key in item) {
                        if (item.hasOwnProperty(key)) {
                            const value = item[key];
                            if (typeof value === 'function') continue;
                            result[key] = clean(value);
                        }
                    }
                    return result;
                };
                
                return clean(obj);
            };
            
            const cleanedProfiles = cleanObject(cleaned);
            console.log('[Data Cleanup] Cleaned profile data:', cleanedProfiles);
            
            // Validate required fields
            if (!cleanedProfiles.user || !cleanedProfiles.remi) {
                console.error('[Data Cleanup] Missing required profile sections');
                return null;
            }
            
            // Ensure required fields exist
            if (!cleanedProfiles.user.name) cleanedProfiles.user.name = 'Student';
            if (!cleanedProfiles.remi.name) cleanedProfiles.remi.name = 'Remi';
            
            console.log('[Data Cleanup] Profile data cleaned successfully');
            return cleanedProfiles;
        } catch (error) {
            console.error('[Data Cleanup] Error cleaning profile data:', error);
            return null;
        }
    }

    testProfileUpdate() {
        console.log('[Test] Starting profile update test...');
        try {
            // Test basic profile update
            console.log('[Test] Testing user name update...');
            this.updateProfileData('user', 'name', 'Test User ' + Date.now());
            
            console.log('[Test] Testing remi name update...');
            this.updateProfileData('remi', 'name', 'Test Remi ' + Date.now());
            
            // Test form reading
            console.log('[Test] Testing form reading...');
            this.updateCurrentProfilesFromForm();
            
            // Test saving
            console.log('[Test] Testing profile save...');
            const saveResult = this.saveProfiles();
            
            // Display current state
            console.log('[Test] Current profiles state:', this.currentProfiles);
            console.log('[Test] localStorage state:', localStorage.getItem('remiProfiles'));
            
            if (saveResult) {
                this.showNotification('Profile update test completed successfully! Check console for details.', 'success');
            } else {
                this.showNotification('Profile update test failed! Check console for details.', 'error');
            }
        } catch (error) {
            console.error('[Test] Error during profile update test:', error);
            this.showNotification('Profile update test error: ' + error.message, 'error');
        }
    }

    checkLocalStorageQuota() {
        try {
            console.log('[Storage Check] Checking localStorage quota...');
            
            if (typeof(Storage) === "undefined") {
                console.error('[Storage Check] localStorage not supported');
                return { available: false, error: 'localStorage not supported' };
            }
            
            // Test current storage usage
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
            
            console.log(`[Storage Check] Current localStorage usage: ~${totalSize} characters`);
            
            // Test available space by trying to store a large test string
            const testKey = '__quota_test__';
            const testSize = 1024 * 1024; // 1MB test
            const testData = 'x'.repeat(testSize);
            
            try {
                localStorage.setItem(testKey, testData);
                localStorage.removeItem(testKey);
                console.log('[Storage Check] localStorage quota test passed');
                return { available: true, currentUsage: totalSize };
            } catch (quotaError) {
                console.warn('[Storage Check] localStorage quota test failed:', quotaError);
                return { 
                    available: false, 
                    error: quotaError.name, 
                    currentUsage: totalSize 
                };
            }
        } catch (error) {
            console.error('[Storage Check] Error checking localStorage quota:', error);
            return { available: false, error: error.message };
        }
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
