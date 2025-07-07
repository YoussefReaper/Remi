/**
 * Auto-Hide Navigation System
 * Makes the topbar and sidebar auto-hide and show when mouse gets near them
 */

class AutoHideNavigation {
    constructor() {
        this.isEnabled = false;
        this.hoverTimeout = null;
        this.hideDelay = 1500; // Time to wait before hiding (ms)
        this.triggerZone = 15; // Pixels from edge to trigger show
        
        this.sidebar = null;
        this.topbar = null;
        this.mainContent = null;
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        this.sidebar = document.querySelector('.sidebar');
        this.topbar = document.querySelector('.topbar-menu');
        this.mainContent = document.querySelector('.main-content');
        
        if (!this.sidebar || !this.topbar) {
            console.warn('AutoHide: Required elements not found');
            return;
        }

        this.createTriggerZones();
        this.setupEventListeners();
        this.loadSettings();
    }

    createTriggerZones() {
        // Create invisible trigger zones
        const topTrigger = document.createElement('div');
        topTrigger.className = 'auto-hide-trigger-top';
        topTrigger.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: ${this.triggerZone}px;
            z-index: 30000;
            pointer-events: auto;
            background: transparent;
        `;

        const leftTrigger = document.createElement('div');
        leftTrigger.className = 'auto-hide-trigger-left';
        leftTrigger.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: ${this.triggerZone}px;
            height: 100vh;
            z-index: 30000;
            pointer-events: auto;
            background: transparent;
        `;

        document.body.appendChild(topTrigger);
        document.body.appendChild(leftTrigger);

        this.topTrigger = topTrigger;
        this.leftTrigger = leftTrigger;
    }

    setupEventListeners() {
        // Mouse position tracking for edge detection
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!this.isEnabled) return;

            // Check if mouse is near edges
            const nearTop = mouseY <= this.triggerZone;
            const nearLeft = mouseX <= this.triggerZone;

            if (nearTop) {
                this.showTopbar();
            } else {
                this.hideTopbarDelayed();
            }

            if (nearLeft) {
                this.showSidebar();
            } else {
                this.hideSidebarDelayed();
            }
        });

        // Keep bars visible when hovering over them
        this.topbar.addEventListener('mouseenter', () => {
            if (this.isEnabled) {
                this.showTopbar();
                this.clearHideTimeout();
            }
        });

        this.topbar.addEventListener('mouseleave', () => {
            if (this.isEnabled) {
                this.hideTopbarDelayed();
            }
        });

        this.sidebar.addEventListener('mouseenter', () => {
            if (this.isEnabled) {
                this.showSidebar();
                this.clearHideTimeout();
            }
        });

        this.sidebar.addEventListener('mouseleave', () => {
            if (this.isEnabled) {
                this.hideSidebarDelayed();
            }
        });

        // Toggle auto-hide with keyboard shortcut (Ctrl+H)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Settings integration
        window.addEventListener('autoHideToggle', (e) => {
            this.setEnabled(e.detail.enabled);
        });
    }

    showTopbar() {
        if (!this.topbar) return;
        this.topbar.classList.add('show');
        this.updateMainContentSpacing();
    }

    hideTopbar() {
        if (!this.topbar) return;
        this.topbar.classList.remove('show');
        this.updateMainContentSpacing();
    }

    hideTopbarDelayed() {
        this.clearHideTimeout();
        this.hoverTimeout = setTimeout(() => {
            this.hideTopbar();
        }, this.hideDelay);
    }

    showSidebar() {
        if (!this.sidebar) return;
        this.sidebar.classList.add('show');
        this.updateMainContentSpacing();
    }

    hideSidebar() {
        if (!this.sidebar) return;
        this.sidebar.classList.remove('show');
        this.updateMainContentSpacing();
    }

    hideSidebarDelayed() {
        this.clearHideTimeout();
        this.hoverTimeout = setTimeout(() => {
            this.hideSidebar();
        }, this.hideDelay);
    }

    clearHideTimeout() {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
    }

    updateMainContentSpacing() {
        if (!this.mainContent || !this.isEnabled) return;

        const sidebarVisible = this.sidebar.classList.contains('show');
        const topbarVisible = this.topbar.classList.contains('show');
        const sidebarExpanded = this.sidebar.classList.contains('expanded');

        // Update main content margins
        if (sidebarVisible) {
            const sidebarWidth = sidebarExpanded ? 'var(--sidebar-expanded-width)' : 'var(--sidebar-collapsed-width)';
            this.mainContent.style.marginLeft = sidebarWidth;
            this.mainContent.style.width = `calc(100% - ${sidebarWidth})`;
        } else {
            this.mainContent.style.marginLeft = '0';
            this.mainContent.style.width = '100%';
        }

        // Update top padding
        this.mainContent.style.paddingTop = topbarVisible ? '80px' : '20px';

        // Update topbar positioning
        if (sidebarVisible && topbarVisible) {
            const sidebarWidth = sidebarExpanded ? 'var(--sidebar-expanded-width)' : 'var(--sidebar-collapsed-width)';
            this.topbar.style.marginLeft = sidebarWidth;
            this.topbar.style.width = `calc(100% - ${sidebarWidth})`;
        } else {
            this.topbar.style.marginLeft = '0';
            this.topbar.style.width = '100%';
        }
    }

    enable() {
        this.isEnabled = true;
        document.body.classList.add('auto-hide-enabled');
        this.hideTopbar();
        this.hideSidebar();
        this.updateMainContentSpacing();
        this.saveSettings();
        this.showNotification('Auto-hide navigation enabled! Move mouse to edges to show.', 'success');
    }

    disable() {
        this.isEnabled = false;
        document.body.classList.remove('auto-hide-enabled');
        this.clearHideTimeout();
        
        // Reset positioning
        if (this.topbar) {
            this.topbar.classList.remove('show');
            this.topbar.style.marginLeft = '';
            this.topbar.style.width = '';
        }
        
        if (this.sidebar) {
            this.sidebar.classList.remove('show');
        }
        
        if (this.mainContent) {
            this.mainContent.style.marginLeft = '';
            this.mainContent.style.width = '';
            this.mainContent.style.paddingTop = '';
        }
        
        this.saveSettings();
        this.showNotification('Auto-hide navigation disabled.', 'info');
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    setEnabled(enabled) {
        if (enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('autoHideNavigation', JSON.stringify({ enabled: this.isEnabled }));
        } catch (error) {
            console.warn('Failed to save auto-hide settings:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('autoHideNavigation');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.enabled) {
                    this.enable();
                }
            }
        } catch (error) {
            console.warn('Failed to load auto-hide settings:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Try to use existing notification system
        if (window.showNotification) {
            window.showNotification(message, type);
            return;
        }

        // Fallback notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--glass-bg);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            padding: 1rem;
            color: var(--text-color);
            z-index: 50000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;

        const iconMap = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${iconMap[type] || iconMap.info}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize auto-hide navigation
const autoHideNav = new AutoHideNavigation();

// Expose globally for settings integration
window.autoHideNavigation = autoHideNav;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoHideNavigation;
}
