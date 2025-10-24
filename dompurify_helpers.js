/* DOMPurify Integration Helper
 * 
 * This file provides helper functions for safe HTML manipulation
 * using DOMPurify to prevent XSS attacks.
 */

// Wait for DOMPurify to load
function waitForDOMPurify(callback) {
    if (typeof DOMPurify !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForDOMPurify(callback), 50);
    }
}

// Safe innerHTML setter
function setSafeHTML(element, htmlString) {
    if (typeof DOMPurify === 'undefined') {
        console.error('DOMPurify not loaded! Cannot safely set HTML.');
        return;
    }
    element.innerHTML = DOMPurify.sanitize(htmlString);
}

// Safe HTML string sanitization
function sanitizeHTML(htmlString, config = {}) {
    if (typeof DOMPurify === 'undefined') {
        console.error('DOMPurify not loaded!');
        return '';
    }
    
    // Default safe configuration
    const defaultConfig = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'title', 'class', 'id'],
        ALLOW_DATA_ATTR: false
    };
    
    return DOMPurify.sanitize(htmlString, { ...defaultConfig, ...config });
}

// Safe append HTML
function appendSafeHTML(element, htmlString) {
    const tempDiv = document.createElement('div');
    setSafeHTML(tempDiv, htmlString);
    
    while (tempDiv.firstChild) {
        element.appendChild(tempDiv.firstChild);
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        waitForDOMPurify,
        setSafeHTML,
        sanitizeHTML,
        appendSafeHTML
    };
}