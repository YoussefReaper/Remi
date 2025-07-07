// Homepage Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    
    // Animate relationship meter on page load
    animateRelationshipMeter();
    
    // Add hover effects to relationship levels
    addRelationshipLevelInteractions();
    
    // Add floating elements animation
    animateFloatingElements();
    
    // Add stats counter animation
    animateStatsOnScroll();
    
    // Add smooth scrolling for internal links
    addSmoothScrolling();
});

function animateRelationshipMeter() {
    const meterFill = document.querySelector('.meter-fill');
    if (meterFill) {
        const targetWidth = meterFill.style.width;
        meterFill.style.width = '0%';
        
        setTimeout(() => {
            meterFill.style.transition = 'width 2s ease-out';
            meterFill.style.width = targetWidth;
        }, 500);
    }
}

function addRelationshipLevelInteractions() {
    const levelCards = document.querySelectorAll('.level-card');
    
    levelCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            // Add a subtle scale animation on hover
            card.style.transform = 'translateY(-10px) scale(1.02)';
            
            // Change the relationship meter temporarily
            const meterFill = document.querySelector('.meter-fill');
            if (meterFill) {
                const percentages = ['15%', '30%', '55%', '80%', '95%'];
                const labels = ['Stranger (15%)', 'Acquaintance (30%)', 'Friend (55%)', 'Close Friend (80%)', 'Best Friend (95%)'];
                
                meterFill.style.width = percentages[index];
                const meterLabel = document.querySelector('.meter-label');
                if (meterLabel) {
                    meterLabel.textContent = labels[index];
                }
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            
            // Reset meter to original state
            const meterFill = document.querySelector('.meter-fill');
            if (meterFill) {
                meterFill.style.width = '65%';
                const meterLabel = document.querySelector('.meter-label');
                if (meterLabel) {
                    meterLabel.textContent = 'Friendly (65%)';
                }
            }
        });
    });
}

function animateFloatingElements() {
    const floatingElements = document.querySelectorAll('.float-element');
    
    floatingElements.forEach((element, index) => {
        // Add random movement
        setInterval(() => {
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            element.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${Math.random() * 360}deg)`;
        }, 3000 + index * 500);
    });
}

function animateStatsOnScroll() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const finalValue = stat.textContent;
                
                // Extract numeric value
                const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
                
                if (numericValue) {
                    animateNumber(stat, 0, numericValue, finalValue);
                }
                
                observer.unobserve(stat);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element, start, end, suffix) {
    const duration = 2000;
    const increment = end / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        // Format the number
        let displayValue;
        if (suffix.includes('K')) {
            displayValue = Math.floor(current / 1000) + 'K+';
        } else if (suffix.includes('%')) {
            displayValue = Math.floor(current) + '%';
        } else {
            displayValue = Math.floor(current).toLocaleString() + '+';
        }
        
        element.textContent = displayValue;
    }, 16);
}

function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add dynamic mood changes
function updateMood() {
    const moods = ['😊', '😄', '🥰', '😎', '🤗', '✨'];
    const moodEmoji = document.querySelector('.mood-emoji');
    
    if (moodEmoji) {
        setInterval(() => {
            const randomMood = moods[Math.floor(Math.random() * moods.length)];
            moodEmoji.textContent = randomMood;
        }, 5000);
    }
}

// Initialize mood updates
updateMood();

// Add particle effect on CTA button hover
document.addEventListener('DOMContentLoaded', function() {
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-large');
    
    ctaButtons.forEach(button => {
        button.addEventListener('mouseenter', createParticles);
    });
});

function createParticles(event) {
    const button = event.target;
    const rect = button.getBoundingClientRect();
    
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = rect.left + Math.random() * rect.width + 'px';
        particle.style.top = rect.top + Math.random() * rect.height + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = '#67C5FF';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.opacity = '0.8';
        
        document.body.appendChild(particle);
        
        // Animate particle
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
            { transform: `translate(${(Math.random() - 0.5) * 100}px, ${-50 - Math.random() * 50}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => {
            particle.remove();
        };
    }
}
