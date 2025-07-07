// ===== CUSTOMIZATION TEST SCRIPT =====
// This script helps test customization features across all pages

function testCustomizationFeatures() {
    console.log('🎨 Testing Remi Customization System...');
    
    // Test 1: Check if customization loader is loaded
    if (window.refreshCustomization) {
        console.log('✅ Customization loader detected');
    } else {
        console.log('❌ Customization loader not found');
        return;
    }
    
    // Test 2: Check for customizable elements
    const testElements = {
        'Remi Name Elements': '.remi-name, .ai-name, [data-remi-name]',
        'Avatar Elements': '.remi-avatar img, .ai-avatar, .avatar-img, [data-remi-avatar]',
        'Relationship Meters': '.meter-fill, [data-relationship-meter]',
        'Mood Elements': '.mood-emoji, .mood-indicator',
        'Communication Style': '[data-communication-style], .relationship-level'
    };
    
    Object.entries(testElements).forEach(([name, selector]) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`✅ ${name}: ${elements.length} element(s) found`);
        } else {
            console.log(`⚠️ ${name}: No elements found (${selector})`);
        }
    });
    
    // Test 3: Check CSS variables
    const testCSSVars = [
        '--accent-primary',
        '--accent-secondary', 
        '--gradient-start',
        '--gradient-end',
        '--success-color',
        '--warning-color',
        '--error-color'
    ];
    
    const computedStyle = getComputedStyle(document.documentElement);
    testCSSVars.forEach(varName => {
        const value = computedStyle.getPropertyValue(varName).trim();
        if (value) {
            console.log(`✅ CSS Variable ${varName}: ${value}`);
        } else {
            console.log(`❌ CSS Variable ${varName}: Not found`);
        }
    });
    
    // Test 4: Check stored customization settings
    try {
        const settings = localStorage.getItem('remiCustomization');
        if (settings) {
            const parsed = JSON.parse(settings);
            console.log('✅ Stored customization settings found:', parsed);
        } else {
            console.log('⚠️ No stored customization settings found (using defaults)');
        }
    } catch (error) {
        console.log('❌ Error reading customization settings:', error);
    }
    
    console.log('🎯 Customization test complete!');
}

// Auto-run test when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testCustomizationFeatures, 1000);
});

// Expose global function for manual testing
window.testCustomization = testCustomizationFeatures;
