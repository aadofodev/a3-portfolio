// Performance monitoring
if ('performance' in window) {
    // Mark critical timing points
    performance.mark('page-interactive-start');
}

// Accessibility: Announce page changes to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Debounced scroll handler for performance
let scrollTimeout;
function debouncedHandleScroll() {
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(handleScroll);
}

// Color transition configuration
const colorConfig = {
    initial: {
        background: '#ffffff',
        text: '#000000',
        accent: '#333333',
        border: 'rgba(0, 0, 0, 0.2)'
    },
    final: {
        background: '#1a1a1a',
        text: '#ffffff',
        accent: '#cccccc',
        border: 'rgba(255, 255, 255, 0.3)'
    },
    startPercentage: 25,
    endPercentage: 75
};

// Utility function to interpolate between two colors
function interpolateColor(color1, color2, factor) {
    // Parse hex colors
    const parseHex = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    };

    const c1 = parseHex(color1);
    const c2 = parseHex(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
}

// Function to update colors based on scroll position
function updateScrollColors() {
    const scrollTop = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollTop / documentHeight) * 100;

    // Calculate transition factor
    let transitionFactor = 0;
    if (scrollPercentage >= colorConfig.startPercentage && scrollPercentage <= colorConfig.endPercentage) {
        transitionFactor = (scrollPercentage - colorConfig.startPercentage) / 
                            (colorConfig.endPercentage - colorConfig.startPercentage);
    } else if (scrollPercentage > colorConfig.endPercentage) {
        transitionFactor = 1;
    }

    // Smooth easing function
    transitionFactor = transitionFactor * transitionFactor * (3 - 2 * transitionFactor);

    // Interpolate colors
    const backgroundColor = interpolateColor(
        colorConfig.initial.background, 
        colorConfig.final.background, 
        transitionFactor
    );
    const textColor = interpolateColor(
        colorConfig.initial.text, 
        colorConfig.final.text, 
        transitionFactor
    );
    const accentColor = interpolateColor(
        colorConfig.initial.accent, 
        colorConfig.final.accent, 
        transitionFactor
    );

    // Update body background (only if not in project hover state)
    const hasProjectHover = document.body.classList.contains('project-hover-active') ||
                             document.body.classList.contains('project-hover-1') ||
                             document.body.classList.contains('project-hover-2') ||
                             document.body.classList.contains('project-hover-3') ||
                             document.body.classList.contains('project-hover-4') ||
                             document.body.classList.contains('project-hover-5') ||
                             document.body.classList.contains('project-hover-6');
    
    if (!hasProjectHover) {
        document.body.style.backgroundColor = backgroundColor;
    }

    // Update all text elements (only if not in project hover state)
    if (!hasProjectHover) {
        const textElements = [
            '.nav__brand', '.nav__link', '.hero__flat-text', 
            '.content-column h3', '.content-column p', '.info-value', '.contact-statement',
            '.contact-link', '.footer__text', '.footer__links a', '.section__title',
            '.data-table td', '.expertise-list li', '.current-project-content h3', '.about-opening-statement'
        ];

        textElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.color = textColor;
            });
        });
    }

    // Update flat text color (only if not in project hover state)
    if (!hasProjectHover) {
        const flatText = document.querySelector('.hero__flat-text');
        if (flatText) {
            flatText.style.color = textColor;
        }

        // Update accent color elements
        const accentElements = [
            '.ticker-item', '.info-label', '.table-container h3',
            '.info-block h4', '.expertise-column h3', '.expertise-column h5', 
            '.data-table th', '.current-project-content p', '.experience-subtitle',
            '.experience-period', '.expertise-description', '.affiliation-type'
        ];

        accentElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.color = accentColor;
            });
        });
    }

    // Update background elements (only if not in project hover state)
    if (!hasProjectHover) {
        const backgroundElements = [
            '.header', '.logo-ticker', '.hero', '.contact-sidebar', '.footer'
        ];

        backgroundElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.backgroundColor = backgroundColor;
            });
        });
    }

    // Update footer border color based on background
    const footer = document.querySelector('.footer');
    if (footer) {
        const borderColor = transitionFactor > 0.5 ? 
            `rgba(255, 255, 255, 0.2)` : 
            `rgba(0, 0, 0, 0.1)`;
        footer.style.borderTopColor = borderColor;
    }

    // Update minimal borders (only where essential)
    const borderAlpha = transitionFactor > 0.5 ? 0.1 : 0.05;
    const borderColor = transitionFactor > 0.5 ? 
        `rgba(255, 255, 255, ${borderAlpha})` : 
        `rgba(0, 0, 0, ${borderAlpha})`;

    const borderElements = [
        '.data-table th', '.data-table td', '.expertise-list li', 
        '.contact-sidebar', '.sidebar-links a'
    ];

    borderElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style.borderColor = borderColor;
        });
    });

    // Update logo image filter during transitions - invert to white when background is dark
    // (only if not in project hover state, hover state handles logo separately)
    if (!hasProjectHover) {
        const logoImg = document.querySelector('.initials.logo-img');
        const fullName = document.querySelector('.full-name');
        
        if (logoImg) {
            // Apply invert filter when background is dark (transitionFactor > 0.5)
            // This makes the black logo appear white on dark background
            if (transitionFactor > 0.5) {
                logoImg.style.filter = 'invert(1) brightness(1)';
            } else {
                logoImg.style.filter = 'none';
            }
        }
        
        // Update full name color
        if (fullName) {
            fullName.style.color = textColor;
        }
    }

    // Update CSS custom properties for pseudo-elements and button states
    document.documentElement.style.setProperty('--dynamic-text-color', textColor);
    document.documentElement.style.setProperty('--dynamic-border-color', borderColor);
    document.documentElement.style.setProperty('--dynamic-background-color', backgroundColor);
    
    // Update outline button styles
    const outlineButtons = document.querySelectorAll('.btn--outline');
    outlineButtons.forEach(btn => {
        btn.style.borderColor = textColor;
        btn.style.color = textColor;
    });
}

// Throttled scroll handler for performance
let ticking = false;
function handleScroll() {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateScrollColors();
            ticking = false;
        });
        ticking = true;
    }
}

// Initialize colors and add optimized scroll listener
updateScrollColors();
window.addEventListener('scroll', debouncedHandleScroll, { passive: true });

// Update colors on page load and resize
window.addEventListener('load', () => {
    setTimeout(updateScrollColors, 100); // Small delay to ensure DOM is ready
});
window.addEventListener('resize', () => {
    setTimeout(updateScrollColors, 50);
});

// Ensure smooth color transitions during page interactions
document.addEventListener('DOMContentLoaded', () => {
    // Force initial color update
    setTimeout(updateScrollColors, 50);
    
    // Handle focus states with color awareness
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    focusableElements.forEach(el => {
        el.addEventListener('focus', () => {
            requestAnimationFrame(updateScrollColors);
        });
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        setTimeout(updateScrollColors, 100);
    }
});

// About page toggle function with dual navigation and accessibility
function toggleAbout() {
    const aboutSection = document.querySelector('.about-page');
    const homeElements = document.querySelectorAll('#home, #projects, #current, #contact');
    const navButton = document.querySelector('.nav-button');
    const mainContent = document.querySelector('#main-content');
    
    if (aboutSection.style.display === 'none' || !aboutSection.style.display) {
        // Show about page, hide other sections
        aboutSection.style.display = 'block';
        homeElements.forEach(el => {
            if (el) {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Update button text and accessibility
        navButton.textContent = 'PORTFOLIO';
        navButton.setAttribute('aria-label', 'Return to portfolio page');
        
        // Scroll to about section
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Focus management
        setTimeout(() => {
            const aboutTitle = aboutSection.querySelector('h1');
            if (aboutTitle) {
                aboutTitle.focus();
                aboutTitle.setAttribute('tabindex', '-1');
            }
        }, 500);
        
        // Update nav link active state
        document.querySelectorAll('.nav__link').forEach(link => {
            link.classList.remove('active');
        });
        navButton.classList.add('active');
        
        // Announce to screen readers
        announceToScreenReader('About page loaded');
    } else {
        // Hide about page, show home sections
        aboutSection.style.display = 'none';
        aboutSection.setAttribute('aria-hidden', 'true');
        const heroSection = document.querySelector('#home');
        
        homeElements.forEach(el => {
            if (el) {
                el.style.display = 'block';
                el.removeAttribute('aria-hidden');
            }
        });
        
        // Force hero section to maintain flex layout for proper centering
        if (heroSection) {
            heroSection.style.display = 'flex';
        }
        
        // Update button text and accessibility
        navButton.textContent = 'ABOUT';
        navButton.setAttribute('aria-label', 'Navigate to about page');
        
        // Scroll to top and focus main content
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            mainContent.focus();
            mainContent.setAttribute('tabindex', '-1');
        }, 500);
        
        // Remove active state
        navButton.classList.remove('active');
        
        // Announce to screen readers
        announceToScreenReader('Portfolio page loaded');
    }
    
    // Update colors after transition
    setTimeout(updateScrollColors, 100);
}

// Home navigation function - logo only goes to homepage
function goHome() {
    const aboutSection = document.querySelector('.about-page');
    const homeElements = document.querySelectorAll('#home, #projects, #current, #contact');
    const heroSection = document.querySelector('#home');
    
    // Always show homepage, hide about page
    aboutSection.style.display = 'none';
    homeElements.forEach(el => {
        if (el) {
            el.style.display = 'block';
            el.removeAttribute('aria-hidden');
        }
    });
    
    // Force hero section to maintain flex layout
    if (heroSection) {
        heroSection.style.display = 'flex';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Remove all active states
    document.querySelectorAll('.nav__link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Update colors after transition
    setTimeout(updateScrollColors, 100);
}

// Make functions available globally
window.toggleAbout = toggleAbout;
window.goHome = goHome;

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target && target.style.display !== 'none') {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced header scroll effect that works with color transitions
function updateHeaderShadow() {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = (scrollY / documentHeight) * 100;
    
    if (scrollY > 100) {
        if (scrollPercentage > colorConfig.endPercentage) {
            header.style.boxShadow = '0 2px 20px rgba(255,255,255,0.1)';
        } else {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        }
    } else {
        header.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', updateHeaderShadow);

// Advanced scroll-triggered animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe all animation elements
const animatedElements = document.querySelectorAll(
    '.section__title, .section__subtitle, .fade-in, .slide-in-left, .slide-in-right, .scale-in'
);

animatedElements.forEach(el => {
    // Skip footer fade-in - it should always be visible
    if (!el.closest('.footer')) {
        observer.observe(el);
    } else {
        // Force footer to be visible immediately
        el.classList.add('animate-in');
    }
});

// Project cards with staggered animation
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card, index) => {
    card.classList.add('fade-in', `stagger-${Math.min(index + 1, 5)}`);
    observer.observe(card);
});

// Value items staggered animation
const valueItems = document.querySelectorAll('.value-item');
valueItems.forEach((item, index) => {
    item.classList.add('slide-in-left', `stagger-${Math.min(index + 1, 5)}`);
    observer.observe(item);
});

// Social links animation
const socialLinks = document.querySelectorAll('.social-link');
socialLinks.forEach((link, index) => {
    link.classList.add('fade-in', `stagger-${Math.min(index + 1, 5)}`);
    observer.observe(link);
});

// Enhanced navigation active state
const navLinks = document.querySelectorAll('.nav__link');
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.3 });

sections.forEach(section => {
    navObserver.observe(section);
});

// Ticker animation control
let tickerSpeed = 30; // seconds
const ticker = document.querySelector('.ticker-content');

if (ticker) {
    // Pause on hover
    ticker.addEventListener('mouseenter', () => {
        ticker.style.animationPlayState = 'paused';
    });
    
    ticker.addEventListener('mouseleave', () => {
        ticker.style.animationPlayState = 'running';
    });
}

// Hide contact sidebar on mobile scroll with color transition awareness
let lastScrollY = window.scrollY;
const contactSidebar = document.querySelector('.contact-sidebar');

if (contactSidebar && window.innerWidth <= 768) {
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY) {
            // Scrolling down
            contactSidebar.style.transform = 'translateY(100px)';
            contactSidebar.style.opacity = '0';
        } else {
            // Scrolling up
            contactSidebar.style.transform = 'translateY(0)';
            contactSidebar.style.opacity = '1';
        }
        
        lastScrollY = currentScrollY;
        
        // Ensure sidebar colors are updated
        updateScrollColors();
    });
}

// Parallax effect disabled - removed for normal scrolling behavior
// Reset any existing transform on hero content
document.addEventListener('DOMContentLoaded', () => {
    const heroContent = document.querySelector('.hero__content');
    if (heroContent) {
        heroContent.style.transform = 'none';
    }
    
    // Project hover effect - global color change with different colors per project
    const projectBoxes = document.querySelectorAll('.project-box');
    
    projectBoxes.forEach((box, index) => {
        const projectNumber = index + 1; // 1-6
        
        box.addEventListener('mouseenter', () => {
            // Remove all project hover classes first
            document.body.classList.remove('project-hover-1', 'project-hover-2', 'project-hover-3', 
                                          'project-hover-4', 'project-hover-5', 'project-hover-6');
            // Add the specific project hover class
            document.body.classList.add(`project-hover-${projectNumber}`);
            document.body.classList.add('project-hover-active');
            // Pause scroll-based color updates while hovering
        });
        
        box.addEventListener('mouseleave', () => {
            // Remove all project hover classes
            document.body.classList.remove('project-hover-1', 'project-hover-2', 'project-hover-3',
                                          'project-hover-4', 'project-hover-5', 'project-hover-6');
            document.body.classList.remove('project-hover-active');
            // Resume scroll-based color updates
            setTimeout(() => {
                updateScrollColors();
            }, 100);
        });
    });
});

// Enhanced form interactions (if form exists)
const formControls = document.querySelectorAll('.form-control');
const formGroups = document.querySelectorAll('.form-group');

// Animate form groups on scroll
formGroups.forEach((group, index) => {
    group.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(group);
});

formControls.forEach(control => {
    control.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    control.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Lazy loading implementation
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => img.classList.add('loaded'));
    }
}

// Keyboard navigation enhancement
function setupKeyboardNavigation() {
    // Trap focus in modal-like states
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.blur) {
                activeElement.blur();
            }
        }
    });
}

// Error handling for images
function setupImageErrorHandling() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            const parent = this.closest('.project-image');
            if (parent) {
                parent.style.backgroundColor = 'var(--color-secondary)';
                parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-secondary); font-size: var(--font-size-sm);">Image unavailable</div>';
            }
        });
    });
}

// Enhanced cursor effect that adapts to color transitions
let cursor = null;

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 768) {
    cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--color-primary);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease, border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        if (cursor) {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
            cursor.style.opacity = '1';
        }
    });
    
    // Enhanced cursor for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .nav__brand');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursor) cursor.style.transform = 'scale(1.5)';
        });
        el.addEventListener('mouseleave', () => {
            if (cursor) cursor.style.transform = 'scale(1)';
        });
    });
    
    // Update cursor color during scroll transitions
    const originalHandleScroll = handleScroll;
    handleScroll = function() {
        originalHandleScroll();
        if (cursor) {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = (scrollTop / documentHeight) * 100;
            const cursorColor = scrollPercentage > colorConfig.endPercentage ? '#32b4c2' : '#218c9e';
            cursor.style.borderColor = cursorColor;
        }
    };
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    setupLazyLoading();
    setupKeyboardNavigation();
    setupImageErrorHandling();
    
    // Ensure footer is always visible
    const footerFadeIn = document.querySelector('.footer .fade-in');
    if (footerFadeIn) {
        footerFadeIn.classList.add('animate-in');
    }
    
    // Mark performance milestone
    if ('performance' in window) {
        performance.mark('page-interactive-end');
        performance.measure('page-interactive', 'page-interactive-start', 'page-interactive-end');
    }
    
    // Announce page readiness to screen readers
    setTimeout(() => {
        announceToScreenReader('Page loaded and ready for interaction');
    }, 1000);
});

// Enhanced smooth scroll with accessibility
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target && target.style.display !== 'none') {
            const headerHeight = document.querySelector('.header').offsetHeight + 20;
            const targetPosition = target.offsetTop - headerHeight;
            
            // Announce navigation to screen readers
            const targetName = target.querySelector('h1, h2, h3')?.textContent || 'section';
            announceToScreenReader(`Navigating to ${targetName}`);
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Focus management for accessibility
            setTimeout(() => {
                const focusTarget = target.querySelector('h1, h2, h3') || target;
                focusTarget.setAttribute('tabindex', '-1');
                focusTarget.focus();
            }, 500);
            
            // Update colors during smooth scroll
            const scrollInterval = setInterval(() => {
                updateScrollColors();
                if (Math.abs(window.scrollY - targetPosition) < 10) {
                    clearInterval(scrollInterval);
                }
            }, 16); // ~60fps
        }
    });
});

// Service worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Performance and Analytics (Privacy-conscious)

// Privacy-conscious analytics placeholder
// Replace with preferred privacy-focused analytics solution
// Examples: Plausible, Fathom, or self-hosted solutions

// Basic performance tracking
if ('performance' in window && 'timing' in window.performance) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
            
            // You can send this data to your analytics service here
            // ensuring compliance with privacy regulations
        }, 0);
    });
}