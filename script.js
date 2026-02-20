document.addEventListener('DOMContentLoaded', () => {
    console.log('NERC 2026 Website Loaded');

    // Future functionality: Mobile menu toggle, smooth scrolling tweaks
    
    // Example: Smooth scroll behavior check (handled by CSS, but JS fallback can go here)
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
});
