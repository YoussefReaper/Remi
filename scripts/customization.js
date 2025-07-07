// ===== CUSTOMIZATION SCRIPT =====

// Default settings
const DEFAULT_SETTINGS = {
    theme: 'auto',
    colors: {
        accentPrimary: '#67C5FF',
        accentSecondary: '#AA79F9',
        backgroundColor: '#EEF8FF',
        textColor: '#125E8E',
        sidebarBorderColor: '#18BEFF',
        successColor: '#10B981',
        warningColor: '#F59E0B',
        errorColor: '#EF4444'
    },
    backgrounds: {
        chat: null,
        main: null
    },
    personality: {
        communicationStyle: 'friendly',
        relationshipLevel: 65,
        name: 'Remi',
        avatar: 'pfp/Remi-pfp.png'
    },
    preferences: {
        autoExpandSidebar: false,
        typingIndicators: true,
        smoothAnimations: true,
        soundEffects: false,
        compactMode: false,
        autoSave: true
    }
};

// Current settings (loaded from localStorage or defaults)
let currentSettings = { ...DEFAULT_SETTINGS };

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    initializeEventListeners();
    updatePreview();
    applySettings();
});

// ===== SETTINGS MANAGEMENT =====

function loadSettings() {
    try {
        const saved = localStorage.getItem('remiCustomization');
        if (saved) {
            currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        currentSettings = { ...DEFAULT_SETTINGS };
    }
    populateInterface();
}

function saveSettings() {
    saveSettingsEnhanced();
}

// Enhanced save settings function that cleans up temporary data
function saveSettingsEnhanced() {
    try {
        // Create a clean copy of settings without object URLs
        const settingsToSave = JSON.parse(JSON.stringify(currentSettings));
        
        // Remove object URL from custom avatar file before saving (it's temporary)
        if (settingsToSave.personality.customAvatarFile) {
            delete settingsToSave.personality.customAvatarFile.objectURL;
        }
        
        localStorage.setItem('remiCustomization', JSON.stringify(settingsToSave));
        showNotification('Settings saved successfully!', 'success');
        
        // Dispatch custom event to notify other pages
        window.dispatchEvent(new CustomEvent('remiCustomizationUpdated', {
            detail: settingsToSave
        }));
        
        if (currentSettings.preferences.autoSave) {
            applySettings();
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings', 'error');
    }
}

function applySettings() {
    applyTheme();
    applyColors();
    applyBackgrounds();
    applyPersonality();
    applyPreferences();
    updatePreview();
}

// ===== THEME MANAGEMENT =====

function applyTheme() {
    const theme = currentSettings.theme;
    const body = document.body;
    
    if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        body.setAttribute('data-theme', theme);
    }
}

// ===== COLOR MANAGEMENT =====

function applyColors() {
    const root = document.documentElement;
    const colors = currentSettings.colors;
    
    // Apply custom colors to CSS variables
    root.style.setProperty('--accent-primary', colors.accentPrimary);
    root.style.setProperty('--accent-secondary', colors.accentSecondary);
    root.style.setProperty('--success-color', colors.successColor);
    root.style.setProperty('--warning-color', colors.warningColor);
    root.style.setProperty('--error-color', colors.errorColor);
    
    // Update gradients
    root.style.setProperty('--gradient-start', colors.accentPrimary);
    root.style.setProperty('--gradient-end', colors.accentSecondary);
}

function applyColorPreset(preset) {
    const presets = {
        default: {
            accentPrimary: '#67C5FF',
            accentSecondary: '#AA79F9',
            backgroundColor: '#EEF8FF'
        },
        sunset: {
            accentPrimary: '#FF6B6B',
            accentSecondary: '#4ECDC4',
            backgroundColor: '#FFF5E1'
        },
        forest: {
            accentPrimary: '#52C41A',
            accentSecondary: '#1890FF',
            backgroundColor: '#F6FFED'
        },
        lavender: {
            accentPrimary: '#B37FEB',
            accentSecondary: '#50C9C3',
            backgroundColor: '#FAF7FF'
        },
        ocean: {
            accentPrimary: '#0EA5E9',
            accentSecondary: '#06B6D4',
            backgroundColor: '#F0F9FF'
        },
        rose: {
            accentPrimary: '#F43F5E',
            accentSecondary: '#EC4899',
            backgroundColor: '#FFF1F2'
        },
        mint: {
            accentPrimary: '#10B981',
            accentSecondary: '#059669',
            backgroundColor: '#ECFDF5'
        },
        cosmic: {
            accentPrimary: '#8B5CF6',
            accentSecondary: '#A855F7',
            backgroundColor: '#FAF5FF'
        },
        amber: {
            accentPrimary: '#F59E0B',
            accentSecondary: '#D97706',
            backgroundColor: '#FFFBEB'
        },
        coral: {
            accentPrimary: '#FF7849',
            accentSecondary: '#FF6B9D',
            backgroundColor: '#FFF8F5'
        }
    };
    
    if (presets[preset]) {
        currentSettings.colors = { ...currentSettings.colors, ...presets[preset] };
        populateColorInputs();
        if (currentSettings.preferences.autoSave) {
            saveSettings();
        }
    }
}

// ===== BACKGROUND MANAGEMENT =====

function applyBackgrounds() {
    // Apply chat background
    if (currentSettings.backgrounds.chat) {
        applyBackgroundToElement('.chat-container', currentSettings.backgrounds.chat);
    }
    
    // Apply main background
    if (currentSettings.backgrounds.main) {
        applyBackgroundToElement('.main-content', currentSettings.backgrounds.main);
    }
}

function applyBackgroundToElement(selector, backgroundData) {
    const element = document.querySelector(selector);
    if (element && backgroundData) {
        if (backgroundData.type === 'image') {
            element.style.backgroundImage = `url(${backgroundData.url})`;
            element.style.backgroundSize = 'cover';
            element.style.backgroundPosition = 'center';
            element.style.backgroundRepeat = 'no-repeat';
        } else if (backgroundData.type === 'gradient') {
            element.style.background = backgroundData.gradient;
        }
    }
}

function selectBackground(type) {
    const input = document.getElementById(`${type}BackgroundInput`);
    input.click();
}

function removeBackground(type) {
    currentSettings.backgrounds[type] = null;
    updateBackgroundPreview(type);
    if (currentSettings.preferences.autoSave) {
        saveSettings();
    }
}

function updateBackgroundPreview(type) {
    const preview = document.getElementById(`${type}Background`);
    const img = preview.querySelector('img');
    const noBackground = preview.querySelector('.no-background');
    
    if (currentSettings.backgrounds[type]) {
        img.src = currentSettings.backgrounds[type].url;
        img.style.display = 'block';
        noBackground.style.display = 'none';
    } else {
        img.style.display = 'none';
        noBackground.style.display = 'flex';
    }
}

// ===== PERSONALITY MANAGEMENT =====

function applyPersonality() {
    const personality = currentSettings.personality;
    
    // Update name displays
    document.getElementById('previewName').textContent = personality.name;
    
    // Update all elements with data-remi-name
    document.querySelectorAll('[data-remi-name]').forEach(element => {
        element.textContent = personality.name;
    });
    
    // Update relationship display
    updateRelationshipDisplay();
    
    // Update avatar with proper handling of custom uploads
    updateAvatarDisplay(personality.avatar);
}

function updateAvatarDisplay(avatarPath) {
    const previewAvatar = document.getElementById('previewAvatar');
    const currentAvatar = document.getElementById('currentAvatar');
    
    // Check if this is a custom uploaded avatar
    if (currentSettings.personality.customAvatarFile && 
        avatarPath.includes('custom_avatar_')) {
        
        // Use object URL for immediate display if available
        const customFile = currentSettings.personality.customAvatarFile;
        if (customFile.objectURL) {
            previewAvatar.src = customFile.objectURL;
            currentAvatar.src = customFile.objectURL;
            return;
        }
    }
    
    // For regular avatars or custom avatars that should be in the pfp folder
    // Try to load the image, fall back to default if it fails
    const testImage = new Image();
    testImage.onload = function() {
        previewAvatar.src = avatarPath;
        currentAvatar.src = avatarPath;
    };
    testImage.onerror = function() {
        // If custom avatar file doesn't exist, fall back to default
        console.warn(`Avatar image not found: ${avatarPath}. Falling back to default.`);
        const defaultAvatar = 'pfp/Remi-pfp.png';
        previewAvatar.src = defaultAvatar;
        currentAvatar.src = defaultAvatar;
        
        // Update settings to reflect the fallback
        if (avatarPath !== defaultAvatar) {
            currentSettings.personality.avatar = defaultAvatar;
            // Clean up invalid custom avatar reference
            if (currentSettings.personality.customAvatarFile) {
                delete currentSettings.personality.customAvatarFile;
            }
            showNotification('Custom avatar not found. Using default avatar.', 'warning');
        }
    };
    testImage.src = avatarPath;
}

function updateRelationshipDisplay() {
    const level = currentSettings.personality.relationshipLevel;
    const meterFill = document.querySelector('.meter-fill');
    const relationshipText = document.querySelector('.relationship-text');
    
    meterFill.style.width = `${level}%`;
    
    let relationship = 'Acquaintance';
    if (level >= 33 && level < 66) relationship = 'Friend';
    else if (level >= 66) relationship = 'Best Friend';
    
    relationshipText.textContent = `${relationship} (${level}%)`;
    
    // Update preview relationship text
    const previewRelationship = document.getElementById('previewRelationship');
    const styles = {
        friendly: 'Your AI Study Companion',
        professional: 'Your AI Assistant',
        casual: 'Your Study Buddy'
    };
    previewRelationship.textContent = styles[currentSettings.personality.communicationStyle] || styles.friendly;
}

function selectAvatar() {
    const input = document.getElementById('avatarInput');
    input.click();
}

function resetName() {
    document.getElementById('remiName').value = 'Remi';
    currentSettings.personality.name = 'Remi';
    updatePreview();
    if (currentSettings.preferences.autoSave) {
        saveSettings();
    }
}

// ===== PREFERENCES MANAGEMENT =====

function applyPreferences() {
    const prefs = currentSettings.preferences;
    
    // Apply smooth animations
    if (prefs.smoothAnimations) {
        document.body.classList.add('smooth-animations');
    } else {
        document.body.classList.remove('smooth-animations');
    }
    
    // Apply compact mode
    if (prefs.compactMode) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }
}

// ===== EVENT LISTENERS =====

function initializeEventListeners() {
    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            currentSettings.theme = theme;
            updateThemeSelection();
            if (currentSettings.preferences.autoSave) {
                saveSettings();
            }
        });
    });
    
    // Color inputs
    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('change', function() {
            const colorType = this.id;
            const value = this.value;
            
            // Update color value display
            const valueDisplay = this.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('color-value')) {
                valueDisplay.textContent = value;
            }
            
            // Update settings
            currentSettings.colors[colorType] = value;
            
            if (currentSettings.preferences.autoSave) {
                saveSettings();
            }
        });
    });
    
    // Color presets
    document.querySelectorAll('.preset-option').forEach(preset => {
        preset.addEventListener('click', function() {
            const presetName = this.dataset.preset;
            applyColorPreset(presetName);
            updatePresetSelection(presetName);
        });
    });
    
    // Background file inputs
    document.getElementById('chatBackgroundInput').addEventListener('change', function(e) {
        handleBackgroundUpload(e, 'chat');
    });
    
    document.getElementById('mainBackgroundInput').addEventListener('change', function(e) {
        handleBackgroundUpload(e, 'main');
    });
    
    // Avatar input
    document.getElementById('avatarInput').addEventListener('change', function(e) {
        handleAvatarUpload(e);
    });
    
    // Avatar presets
    document.querySelectorAll('.avatar-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            const avatar = this.dataset.avatar;
            currentSettings.personality.avatar = avatar;
            updateAvatarSelection();
            if (currentSettings.preferences.autoSave) {
                saveSettings();
            }
        });
    });
    
    // Personality options
    document.querySelectorAll('input[name="communicationStyle"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                currentSettings.personality.communicationStyle = this.value;
                updatePreview();
                if (currentSettings.preferences.autoSave) {
                    saveSettings();
                }
            }
        });
    });
    
    // Relationship slider
    document.getElementById('relationshipLevel').addEventListener('input', function() {
        currentSettings.personality.relationshipLevel = parseInt(this.value);
        updateRelationshipDisplay();
        if (currentSettings.preferences.autoSave) {
            saveSettings();
        }
    });
    
    // Name input
    document.getElementById('remiName').addEventListener('input', function() {
        currentSettings.personality.name = this.value;
        updatePreview();
        if (currentSettings.preferences.autoSave) {
            saveSettings();
        }
    });
    
    // Preference toggles
    document.querySelectorAll('.preference-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const prefName = this.id;
            currentSettings.preferences[prefName] = this.checked;
            
            if (prefName === 'smoothAnimations' || prefName === 'compactMode') {
                applyPreferences();
            }
            
            if (currentSettings.preferences.autoSave) {
                saveSettings();
            }
        });
    });
    
    // Import input
    document.getElementById('importInput').addEventListener('change', function(e) {
        handleSettingsImport(e);
    });
}

// ===== FILE HANDLING =====

function handleBackgroundUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentSettings.backgrounds[type] = {
                type: 'image',
                url: e.target.result,
                filename: file.name
            };
            updateBackgroundPreview(type);
            if (currentSettings.preferences.autoSave) {
                saveSettings();
            }
        };
        reader.readAsDataURL(file);
    }
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showNotification('Image file is too large. Please select an image under 5MB.', 'error');
            return;
        }
        
        // Generate unique filename to avoid conflicts
        const timestamp = new Date().getTime();
        const extension = file.name.split('.').pop();
        const newFileName = `custom_avatar_${timestamp}.${extension}`;
        const avatarPath = `pfp/${newFileName}`;
        
        // Create object URL for immediate preview
        const objectURL = URL.createObjectURL(file);
        
        // Update avatar immediately for preview
        currentSettings.personality.avatar = avatarPath;
        currentSettings.personality.customAvatarFile = {
            name: newFileName,
            objectURL: objectURL,
            originalName: file.name
        };
        
        updateAvatarSelection();
        
        // Show success message with instructions
        showNotification(
            `Avatar uploaded successfully! Note: To use this avatar across sessions, copy the image to the 'pfp' folder as '${newFileName}'`, 
            'success',
            8000 // Show for 8 seconds since it's important info
        );
        
        if (currentSettings.preferences.autoSave) {
            saveSettings();
        }
    }
}

function handleSettingsImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedSettings = JSON.parse(e.target.result);
                currentSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
                populateInterface();
                applySettings();
                showNotification('Settings imported successfully!', 'success');
            } catch (error) {
                console.error('Error importing settings:', error);
                showNotification('Error importing settings file', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// ===== UI UPDATES =====

function populateInterface() {
    populateThemeSelection();
    populateColorInputs();
    populatePersonalityInputs();
    populatePreferences();
    updateBackgroundPreviews();
}

function populateThemeSelection() {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.theme === currentSettings.theme);
    });
}

function populateColorInputs() {
    Object.entries(currentSettings.colors).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input) {
            input.value = value;
            const valueDisplay = input.nextElementSibling;
            if (valueDisplay && valueDisplay.classList.contains('color-value')) {
                valueDisplay.textContent = value;
            }
        }
    });
}

function populatePersonalityInputs() {
    // Communication style
    const styleRadio = document.querySelector(`input[name="communicationStyle"][value="${currentSettings.personality.communicationStyle}"]`);
    if (styleRadio) {
        styleRadio.checked = true;
    }
    
    // Relationship level
    document.getElementById('relationshipLevel').value = currentSettings.personality.relationshipLevel;
    
    // Name
    document.getElementById('remiName').value = currentSettings.personality.name;
}

function populatePreferences() {
    Object.entries(currentSettings.preferences).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input) {
            input.checked = value;
        }
    });
}

function updateBackgroundPreviews() {
    updateBackgroundPreview('chat');
    updateBackgroundPreview('main');
}

function updateThemeSelection() {
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.theme === currentSettings.theme);
    });
    applyTheme();
}

function updatePresetSelection(preset) {
    document.querySelectorAll('.preset-option').forEach(option => {
        option.classList.toggle('selected', option.dataset.preset === preset);
    });
}

function updateAvatarSelection() {
    document.querySelectorAll('.avatar-preset').forEach(preset => {
        preset.classList.toggle('selected', preset.dataset.avatar === currentSettings.personality.avatar);
    });
    applyPersonality();
}

function updatePreview() {
    applyPersonality();
}

// ===== ACTION FUNCTIONS =====

function saveCustomization() {
    saveSettings();
    applySettings();
}

function resetToDefaults() {
    if (confirm('Are you sure you want to reset all customizations to default values?')) {
        currentSettings = { ...DEFAULT_SETTINGS };
        populateInterface();
        applySettings();
        saveSettings();
        showNotification('Settings reset to defaults', 'info');
    }
}

function exportSettings() {
    try {
        const settingsBlob = new Blob([JSON.stringify(currentSettings, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(settingsBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'remi-customization.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Settings exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting settings:', error);
        showNotification('Error exporting settings', 'error');
    }
}

function importSettings() {
    document.getElementById('importInput').click();
}

// ===== NOTIFICATION SYSTEM =====

function showNotification(message, type = 'info', duration = 5000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after specified duration
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// ===== AUTO-SAVE FUNCTIONALITY =====

// Save settings periodically if auto-save is enabled
setInterval(() => {
    if (currentSettings.preferences.autoSave) {
        saveSettings();
    }
}, 30000); // Save every 30 seconds

// Save settings when the page is about to be unloaded
window.addEventListener('beforeunload', () => {
    if (currentSettings.preferences.autoSave) {
        saveSettings();
    }
});

// ===== CLEANUP AND UTILITY FUNCTIONS =====

// Clean up object URLs when page unloads to prevent memory leaks
window.addEventListener('beforeunload', function() {
    if (currentSettings.personality.customAvatarFile && 
        currentSettings.personality.customAvatarFile.objectURL) {
        URL.revokeObjectURL(currentSettings.personality.customAvatarFile.objectURL);
    }
});

// Function to validate if a custom avatar file exists
function validateCustomAvatar(avatarPath) {
    return new Promise((resolve) => {
        if (!avatarPath.includes('custom_avatar_')) {
            resolve(true); // Not a custom avatar, assume it exists
            return;
        }
        
        const testImage = new Image();
        testImage.onload = () => resolve(true);
        testImage.onerror = () => resolve(false);
        testImage.src = avatarPath;
    });
}

// Function to create a downloadable avatar guide
function showAvatarGuide() {
    const guide = `
# Custom Avatar Setup Guide

To use your custom avatar across all sessions:

1. Copy your uploaded image file to the 'pfp' folder in your Remi directory
2. Rename it to match the filename shown in the success message
3. The avatar will then persist across browser sessions

## Supported formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

## File size limit: 5MB
## Recommended size: 200x200 pixels or higher

Your current custom avatar: ${currentSettings.personality.customAvatarFile ? currentSettings.personality.customAvatarFile.name : 'None'}
    `.trim();
    
    // Create and download the guide
    const blob = new Blob([guide], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remi_avatar_guide.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Avatar setup guide downloaded!', 'info');
}

// ===== INITIALIZATION =====

// Initialize the customization system
console.log('Remi Customization System Loaded');
