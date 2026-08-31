// Performance monitoring
if ('performance' in window) {
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
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Scroll handler configuration
let scrollTimeout;
function debouncedHandleScroll() {
    if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = requestAnimationFrame(handleScroll);
}

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

function interpolateColor(color1, color2, factor) {
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

// Dynamic scroll color transition
function updateScrollColors() {
    const scrollTop = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const aboutSection = document.querySelector('.about-page');
    const isAboutVisible = aboutSection && aboutSection.style.display !== 'none' && aboutSection.offsetParent !== null;
    
    let transitionFactor = 0;
    
    if (isAboutVisible) {
        const aboutHeroStatement = document.querySelector('.about-hero-statement');
        const aboutContentSections = document.querySelectorAll('.about-section');
        const firstAboutSection = aboutContentSections.length > 0 ? aboutContentSections[0] : null;
        
        if (aboutHeroStatement && firstAboutSection) {
            const transitionStart = aboutHeroStatement.offsetTop + aboutHeroStatement.offsetHeight;
            const transitionEnd = firstAboutSection.offsetTop;
            const transitionRange = transitionEnd - transitionStart;
            
            if (transitionRange > 0 && scrollTop >= transitionStart && scrollTop <= transitionEnd) {
                transitionFactor = (scrollTop - transitionStart) / transitionRange;
            } else if (scrollTop > transitionEnd) {
                transitionFactor = 1;
            } else {
                transitionFactor = 0;
            }
            transitionFactor = transitionFactor * transitionFactor * (3 - 2 * transitionFactor);
        }
    } else {
        const projectsSection = document.querySelector('#assignments');
        let actualStartPercentage = 0; 
        let actualEndPercentage = colorConfig.endPercentage;
        
        if (projectsSection) {
            const projectsTop = projectsSection.offsetTop;
            actualEndPercentage = Math.min(100, (projectsTop / documentHeight) * 100);
        }
        
        const scrollPercentage = (scrollTop / documentHeight) * 100;

        if (scrollPercentage >= actualStartPercentage && scrollPercentage <= actualEndPercentage) {
            transitionFactor = (scrollPercentage - actualStartPercentage) / (actualEndPercentage - actualStartPercentage);
        } else if (scrollPercentage > actualEndPercentage) {
            transitionFactor = 1;
        }
        transitionFactor = transitionFactor * transitionFactor * (3 - 2 * transitionFactor);
    }

    const backgroundColor = interpolateColor(colorConfig.initial.background, colorConfig.final.background, transitionFactor);
    const textColor = interpolateColor(colorConfig.initial.text, colorConfig.final.text, transitionFactor);
    const accentColor = interpolateColor(colorConfig.initial.accent, colorConfig.final.accent, transitionFactor);

    document.body.style.backgroundColor = backgroundColor;

    const textElements = [
        '.nav__brand', '.nav__link', '.hero__flat-text', 
        '.content-column h3', '.content-column p', '.info-value', '.contact-statement',
        '.contact-link', '.footer__text', '.footer__links a', '.section__title',
        '.data-table td', '.expertise-list li', '.about-opening-statement',
        '.hub-title', '.hub-desc', '.hub-label'
    ];

    textElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.color = textColor;
        });
    });

    const accentElements = [
        '.info-label', '.table-container h3', '.info-block h4', 
        '.expertise-column h3', '.expertise-column h5', '.data-table th', 
        '.experience-subtitle', '.experience-period', '.expertise-description', '.affiliation-type'
    ];

    accentElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.color = accentColor;
        });
    });

    const backgroundElements = ['.header', '.hero', '.contact-sidebar', '.footer'];
    backgroundElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.backgroundColor = backgroundColor;
        });
    });

    const footer = document.querySelector('.footer');
    if (footer) {
        footer.style.borderTopColor = transitionFactor > 0.5 ? `rgba(255, 255, 255, 0.2)` : `rgba(0, 0, 0, 0.1)`;
    }

    const borderAlpha = transitionFactor > 0.5 ? 0.1 : 0.05;
    const borderColor = transitionFactor > 0.5 ? `rgba(255, 255, 255, ${borderAlpha})` : `rgba(0, 0, 0, ${borderAlpha})`;

    const borderElements = ['.data-table th', '.data-table td', '.expertise-list li', '.contact-sidebar', '.sidebar-links a'];
    borderElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.borderColor = borderColor;
        });
    });

    const logoImg = document.querySelector('.initials.logo-img');
    if (logoImg) {
        logoImg.style.filter = transitionFactor > 0.5 ? 'invert(1) brightness(1)' : 'none';
    }

    document.documentElement.style.setProperty('--dynamic-text-color', textColor);
    document.documentElement.style.setProperty('--dynamic-border-color', borderColor);
    document.documentElement.style.setProperty('--dynamic-background-color', backgroundColor);
    
    document.querySelectorAll('.btn--outline').forEach(btn => {
        btn.style.borderColor = textColor;
        btn.style.color = textColor;
    });
}

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

updateScrollColors();
window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
window.addEventListener('load', () => setTimeout(updateScrollColors, 100));
window.addEventListener('resize', () => setTimeout(updateScrollColors, 50));

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateScrollColors, 50);
    document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
        el.addEventListener('focus', () => requestAnimationFrame(updateScrollColors));
    });
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(updateScrollColors, 100);
});

// View Navigation
function toggleAbout() {
    const aboutSection = document.querySelector('.about-page');
    const homeElements = document.querySelectorAll('#home, #assignments, #contact');
    const navButton = document.getElementById('about-btn') || document.querySelector('.nav-button');
    const mainContent = document.querySelector('#main-content');
    
    if (aboutSection.style.display === 'none' || !aboutSection.style.display) {
        aboutSection.style.display = 'block';
        homeElements.forEach(el => {
            if (el) {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
            }
        });
        
        navButton.textContent = 'PORTFOLIO';
        navButton.setAttribute('aria-label', 'Return to portfolio page');
        aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        setTimeout(() => {
            const affiliationsVanta = document.getElementById('affiliations-vanta');
            if (affiliationsVanta && !affiliationsVanta.querySelector('canvas') && typeof VANTA !== 'undefined' && VANTA.TOPOLOGY) {
                VANTA.TOPOLOGY({
                    el: "#affiliations-vanta",
                    mouseControls: true, touchControls: true, gyroControls: false,
                    minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00,
                    color: 0xffffff, backgroundColor: 0x0
                });
            }
        }, 100);
        
        updateScrollColors();
        
        setTimeout(() => {
            const aboutTitle = aboutSection.querySelector('h1');
            if (aboutTitle) {
                aboutTitle.focus();
                aboutTitle.setAttribute('tabindex', '-1');
            }
        }, 500);
        
        document.querySelectorAll('.nav__link').forEach(link => link.classList.remove('active'));
        navButton.classList.add('active');
        announceToScreenReader('About page loaded');
    } else {
        aboutSection.style.display = 'none';
        aboutSection.setAttribute('aria-hidden', 'true');
        
        homeElements.forEach(el => {
            if (el) {
                el.style.display = 'block';
                el.removeAttribute('aria-hidden');
            }
        });
        
        const heroSection = document.querySelector('#home');
        if (heroSection) heroSection.style.display = 'flex';
        
        navButton.textContent = 'ABOUT';
        navButton.setAttribute('aria-label', 'Navigate to about page');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            mainContent.focus();
            mainContent.setAttribute('tabindex', '-1');
        }, 500);
        
        navButton.classList.remove('active');
        announceToScreenReader('Portfolio page loaded');
    }
    setTimeout(updateScrollColors, 100);
}

function goHome() {
    const aboutSection = document.querySelector('.about-page');
    const homeElements = document.querySelectorAll('#home, #assignments, #contact');
    const heroSection = document.querySelector('#home');
    
    aboutSection.style.display = 'none';
    homeElements.forEach(el => {
        if (el) {
            el.style.display = 'block';
            el.removeAttribute('aria-hidden');
        }
    });
    
    if (heroSection) heroSection.style.display = 'flex';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll('.nav__link').forEach(link => link.classList.remove('active'));
    setTimeout(updateScrollColors, 100);
}

window.toggleAbout = toggleAbout;
window.goHome = goHome;

// UI Interactions
function updateHeaderShadow() {
    const header = document.querySelector('.header');
    const scrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const projectsSection = document.querySelector('#assignments');
    
    let transitionFactor = 0;
    if (projectsSection) {
        const projectsTop = projectsSection.offsetTop;
        const scrollPercentage = (scrollY / documentHeight) * 100;
        const actualEndPercentage = Math.min(100, (projectsTop / documentHeight) * 100);
        
        if (scrollPercentage >= 0 && scrollPercentage <= actualEndPercentage) {
            transitionFactor = scrollPercentage / actualEndPercentage;
        } else if (scrollPercentage > actualEndPercentage) {
            transitionFactor = 1;
        }
        transitionFactor = transitionFactor * transitionFactor * (3 - 2 * transitionFactor);
    }
    
    if (scrollY > 50) {
        const whiteShadowOpacity = transitionFactor * 0.1;
        const blackShadowOpacity = (1 - transitionFactor) * 0.1;
        header.style.boxShadow = transitionFactor > 0 ? 
            `0 2px 20px rgba(255,255,255,${whiteShadowOpacity})` : 
            `0 2px 20px rgba(0,0,0,${blackShadowOpacity})`;
    } else {
        header.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', updateHeaderShadow);

const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -100px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.section__title, .section__subtitle, .fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach(el => {
    if (!el.closest('.footer')) {
        observer.observe(el);
    } else {
        el.classList.add('animate-in');
    }
});

document.querySelectorAll('.project-card').forEach((card, index) => {
    card.classList.add('fade-in', `stagger-${Math.min(index + 1, 5)}`);
    observer.observe(card);
});

document.querySelectorAll('.value-item').forEach((item, index) => {
    item.classList.add('slide-in-left', `stagger-${Math.min(index + 1, 5)}`);
    observer.observe(item);
});

document.querySelectorAll('.social-link').forEach((link, index) => {
    link.classList.add('fade-in', `stagger-${Math.min(index + 1, 5)}`);
    observer.observe(link);
});

let lastScrollY = window.scrollY;
const contactSidebar = document.querySelector('.contact-sidebar');

if (contactSidebar && window.innerWidth <= 768) {
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY) {
            contactSidebar.style.transform = 'translateY(100px)';
            contactSidebar.style.opacity = '0';
        } else {
            contactSidebar.style.transform = 'translateY(0)';
            contactSidebar.style.opacity = '1';
        }
        lastScrollY = currentScrollY;
        updateScrollColors();
    });
}

function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(img => img.classList.add('loaded'));
    }
}

function setupImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
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

let cursor = null;
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 768) {
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    document.body.classList.add('custom-cursor-active');
    
    document.addEventListener('mousemove', (e) => {
        if (cursor) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursor.style.opacity = '1';
        }
    });
    
    document.addEventListener('mouseleave', () => { if (cursor) cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { if (cursor) cursor.style.opacity = '1'; });
    
    const checkPointerElement = (e) => {
        if (!cursor) return;
        const target = e.target;
        const isInteractive = target.tagName === 'A' || target.tagName === 'BUTTON' ||
                             (target.hasAttribute('role') && target.getAttribute('role') === 'button') ||
                             (target.hasAttribute('tabindex') && target.getAttribute('tabindex') === '0') ||
                             target.closest('a, button, [role="button"], .card, .nav__brand, [onclick]') ||
                             window.getComputedStyle(target).cursor === 'pointer';
        
        isInteractive ? cursor.classList.add('pulse') : cursor.classList.remove('pulse');
    };
    
    document.addEventListener('mousemove', checkPointerElement);
    
    const originalHandleScroll = handleScroll;
    handleScroll = function() {
        originalHandleScroll();
        if (cursor) {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = (scrollTop / documentHeight) * 100;
            cursor.style.borderColor = scrollPercentage > colorConfig.endPercentage ? '#32b4c2' : '#218c9e';
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    setupLazyLoading();
    setupImageErrorHandling();
    
    const footerFadeIn = document.querySelector('.footer .fade-in');
    if (footerFadeIn) footerFadeIn.classList.add('animate-in');
    
    if ('performance' in window) {
        performance.mark('page-interactive-end');
        performance.measure('page-interactive', 'page-interactive-start', 'page-interactive-end');
    }
});

// Smooth anchor scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target && target.style.display !== 'none') {
            const headerHeight = document.querySelector('.header').offsetHeight + 20;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            
            setTimeout(() => {
                const focusTarget = target.querySelector('h1, h2, h3') || target;
                focusTarget.setAttribute('tabindex', '-1');
                focusTarget.focus();
            }, 500);
            
            const scrollInterval = setInterval(() => {
                updateScrollColors();
                if (Math.abs(window.scrollY - targetPosition) < 10) clearInterval(scrollInterval);
            }, 16); 
        }
    });
});