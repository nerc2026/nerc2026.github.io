document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js');

    // Mobile Hamburger Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Close menu when a navigation link is clicked
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuToggle.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }
        });
    }

    // Filter the public poster lists while keeping each result with its session time.
    const posterSearch = document.getElementById('poster-search');
    if (posterSearch) {
        const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '')
            .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
        const clearSearch = document.getElementById('poster-search-clear');
        const searchCount = document.getElementById('poster-search-count');
        const emptyResults = document.getElementById('poster-search-empty');
        const sessions = [...document.querySelectorAll('.poster-session')].map(element => ({
            element,
            count: element.querySelector('.poster-session-count'),
            posters: [...element.querySelectorAll('.poster-entry')].map(poster => ({
                element: poster,
                text: normalize(poster.textContent),
                board: normalize(poster.dataset.board).replace(/ /g, '')
            }))
        }));
        const posterCount = sessions.reduce((total, session) => total + session.posters.length, 0);

        const filterPosters = () => {
            const query = normalize(posterSearch.value);
            const terms = query.split(' ').filter(Boolean);
            const boardMatch = query.match(/^(?:board\s*)?(s\s*)?(\d+)$/);
            const board = boardMatch ? `${boardMatch[1] ? 's' : ''}${Number(boardMatch[2])}` : null;
            let matches = 0;

            sessions.forEach(session => {
                let visible = 0;
                session.posters.forEach(poster => {
                    const match = board !== null ? poster.board === board : terms.every(term => poster.text.includes(term));
                    poster.element.hidden = !match;
                    if (match) visible++;
                });
                session.element.hidden = visible === 0;
                session.element.open = query.length > 0 && visible > 0;
                session.count.textContent = query ? `${visible} of ${session.posters.length} posters` : `${session.posters.length} posters`;
                matches += visible;
            });

            searchCount.textContent = query ? `${matches} ${matches === 1 ? 'poster' : 'posters'} found.` : `${posterCount} posters across two sessions.`;
            emptyResults.hidden = matches !== 0;
            clearSearch.disabled = posterSearch.value.length === 0;
        };

        posterSearch.addEventListener('input', filterPosters);
        clearSearch.addEventListener('click', () => {
            posterSearch.value = '';
            filterPosters();
            posterSearch.focus();
        });
        filterPosters();
        document.getElementById('poster-search-controls').hidden = false;

        const openPosterSession = hash => {
            const session = sessions.find(item => `#${item.element.id}` === hash);
            if (!session) return;
            posterSearch.value = '';
            filterPosters();
            session.element.open = true;
            document.getElementById('posters').classList.add('revealed');
            requestAnimationFrame(() => session.element.scrollIntoView({ block: 'start' }));
        };
        document.querySelectorAll('a[href^="#poster-session-"]').forEach(link => {
            link.addEventListener('click', () => openPosterSession(link.hash));
        });
        window.addEventListener('hashchange', () => openPosterSession(window.location.hash));
        openPosterSession(window.location.hash);
    }

    // Scrollspy: Highlight navigation links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-links a');

    if (sections.length > 0 && navLinksList.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-40% 0px -55% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinksList.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                            link.setAttribute('aria-current', 'true');
                        } else {
                            link.classList.remove('active');
                            link.removeAttribute('aria-current');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // Back-to-top button logic
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll reveal logic
    const revealSections = document.querySelectorAll('section:not(.hero)');
    if (revealSections.length > 0) {
        const revealObserverOptions = {
            root: null,
            threshold: 0
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, revealObserverOptions);

        revealSections.forEach(section => {
            // Add 'revealed' right away to any section already in the viewport at load
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                section.classList.add('revealed');
            }
            revealObserver.observe(section);
        });
    }
});
