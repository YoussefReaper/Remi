// ===== UNIVERSAL CUSTOMIZATION LOADER =====
// This script applies saved customization settings to any page

(function() {
    'use strict';

    // Default settings (same as in customization.js)
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

    let currentSettings = { ...DEFAULT_SETTINGS };

    // Load and apply settings immediately
    function loadAndApplySettings() {
        try {
            const saved = localStorage.getItem('remiCustomization');
            if (saved) {
                currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading customization settings:', error);
            currentSettings = { ...DEFAULT_SETTINGS };
        }

        applyAllSettings();
    }

    // Apply all customization settings
    function applyAllSettings() {
        applyTheme();
        applyColors();
        applyBackgrounds();
        applyPersonality();
        applyPreferences();
    }

    // Apply theme settings
    function applyTheme() {
        const theme = currentSettings.theme;
        const body = document.body;
        
        if (theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
            body.setAttribute('data-theme', theme);
        }
    }    // Apply color settings
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

        // Update other color variables for consistency
        root.style.setProperty('--icons-color', colors.accentPrimary);
        root.style.setProperty('--sidebar-border-color', colors.sidebarBorderColor);
        root.style.setProperty('--title-text-color', colors.accentSecondary);
        
        // Additional color mappings for comprehensive coverage
        root.style.setProperty('--button-hover-bg-color', colors.accentPrimary);
        root.style.setProperty('--text-shadow-color', colors.accentPrimary);
        root.style.setProperty('--completion-color', colors.successColor);
        root.style.setProperty('--late-color', colors.warningColor);
        root.style.setProperty('--not-done-color', colors.errorColor);
        root.style.setProperty('--in-progress-color', colors.accentPrimary);
        
        // Update theme-specific background if applicable
        if (colors.backgroundColor) {
            root.style.setProperty('--background-color', colors.backgroundColor);
        }
        if (colors.textColor) {
            root.style.setProperty('--text-color', colors.textColor);
        }
    }    // Apply background settings
    function applyBackgrounds() {
        // Apply chat background
        if (currentSettings.backgrounds.chat) {
            applyBackgroundToElement('.chat-container, .chat-messages, .messages-container', currentSettings.backgrounds.chat);
        }
        
        // Apply main background to various page containers
        if (currentSettings.backgrounds.main) {
            applyBackgroundToElement('.main-content, .hero-section, .content-container, .page-container', currentSettings.backgrounds.main);
        }
    }

    function applyBackgroundToElement(selector, backgroundData) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
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
        });
    }    // Apply personality settings
    function applyPersonality() {
        const personality = currentSettings.personality;
        
        // Update Remi name in various elements
        const nameElements = document.querySelectorAll('.remi-name, .ai-name, [data-remi-name], .hero-title .gradient-text');
        nameElements.forEach(element => {
            if (element.classList.contains('gradient-text') || element.closest('.hero-title')) {
                // For hero title, only update if it contains "Remi"
                const text = element.textContent;
                if (text.includes('Remi')) {
                    element.textContent = text.replace('Remi', personality.name);
                }
            } else {
                element.textContent = personality.name;
            }
        });

        // Update Remi avatar in various elements
        const avatarElements = document.querySelectorAll('.remi-avatar img, .ai-avatar, .avatar-img, [data-remi-avatar]');
        avatarElements.forEach(element => {
            element.src = personality.avatar;
            element.alt = personality.name;
        });

        // Update communication style indicators
        const styleElements = document.querySelectorAll('[data-communication-style], .relationship-level');
        styleElements.forEach(element => {
            element.textContent = getStyleDescription(personality.communicationStyle);
        });

        // Update relationship level displays
        updateRelationshipDisplays();
        
        // Update page title if it contains Remi
        if (document.title.includes('Remi')) {
            document.title = document.title.replace('Remi', personality.name);
        }
    }

    function getStyleDescription(style) {
        const descriptions = {
            friendly: 'Your AI Study Companion',
            professional: 'Your AI Assistant',
            casual: 'Your Study Buddy'
        };
        return descriptions[style] || descriptions.friendly;
    }    function updateRelationshipDisplays() {
        const level = currentSettings.personality.relationshipLevel;
        
        // Update relationship meters
        const meters = document.querySelectorAll('.meter-fill, .relationship-meter .meter-fill, [data-relationship-meter]');
        meters.forEach(meter => {
            meter.style.width = `${level}%`;
        });

        // Update relationship percentages
        const percentages = document.querySelectorAll('.relationship-percentage, [data-relationship-percentage]');
        percentages.forEach(element => {
            element.textContent = `${level}%`;
        });

        // Update relationship text and labels
        const relationshipTexts = document.querySelectorAll('.relationship-text, [data-relationship-text], .meter-label');
        relationshipTexts.forEach(element => {
            let relationship = 'Acquaintance';
            if (level >= 21 && level < 41) relationship = 'Acquaintance';
            else if (level >= 41 && level < 71) relationship = 'Friend';
            else if (level >= 71 && level < 91) relationship = 'Close Friend';
            else if (level >= 91) relationship = 'Best Friend';
            else if (level < 21) relationship = 'Stranger';
            
            element.textContent = `${relationship} (${level}%)`;
        });
        
        // Update mood indicators based on relationship level
        const moodElements = document.querySelectorAll('.mood-emoji, .mood-indicator');
        moodElements.forEach(element => {
            let emoji = '😐';
            if (level >= 21 && level < 41) emoji = '🙂';
            else if (level >= 41 && level < 71) emoji = '😊';
            else if (level >= 71 && level < 91) emoji = '🥰';
            else if (level >= 91) emoji = '💖';
            
            if (element.classList.contains('mood-emoji')) {
                element.textContent = emoji;
            }
        });
    }

    // Apply preference settings
    function applyPreferences() {
        const prefs = currentSettings.preferences;
        const body = document.body;
        
        // Apply smooth animations
        if (prefs.smoothAnimations) {
            body.classList.add('smooth-animations');
        } else {
            body.classList.remove('smooth-animations');
        }
        
        // Apply compact mode
        if (prefs.compactMode) {
            body.classList.add('compact-mode');
        } else {
            body.classList.remove('compact-mode');
        }

        // Apply auto-expand sidebar
        if (prefs.autoExpandSidebar) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.add('auto-expanded');
            }
        }
    }

    // Function to trigger updates across all open tabs/windows
    function broadcastCustomizationUpdate() {
        // Dispatch custom event for same-page updates
        window.dispatchEvent(new CustomEvent('remiCustomizationUpdated'));
        
        // Store a timestamp to trigger storage events in other tabs
        localStorage.setItem('remiCustomizationTimestamp', Date.now().toString());
    }    // Listen for storage changes to update settings in real-time
    function setupStorageListener() {
        window.addEventListener('storage', function(e) {
            if (e.key === 'remiCustomization' || e.key === 'remiCustomizationTimestamp') {
                loadAndApplySettings();
            }
        });

        // Also listen for custom events from the customization page
        window.addEventListener('remiCustomizationUpdated', function() {
            loadAndApplySettings();
        });
    }

    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAndApplySettings);
        } else {
            loadAndApplySettings();
        }
        
        setupStorageListener();
        
        // Re-apply settings when theme changes (for auto theme)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
    }

    // Auto-initialize
    initialize();

    // Expose global functions for external use
    window.refreshCustomization = loadAndApplySettings;
    window.broadcastCustomization = broadcastCustomizationUpdate;

})();
