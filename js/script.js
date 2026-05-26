/* ========== GLOBAL WEBSITE SETUP ========== */
'use strict';


/* ========== SITE HEADER ========== */
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('[data-site-header]');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const headerHashLinks = document.querySelectorAll('.site-header a[href*="#"]');
    const sectionIds = ['about', 'services', 'contact'];
    const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    if (!header) {
        return;
    }

    const setHeaderState = () => {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    const closeMobileMenu = () => {
        header.classList.remove('is-menu-open');

        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open navigation menu');
        }
    };

    const setActiveLink = (activeId) => {
        navLinks.forEach((link) => {
            const linkHash = new URL(link.href, window.location.href).hash.replace('#', '');
            link.classList.toggle('is-active', linkHash === activeId);
        });
    };

    const updateActiveLink = () => {
        if (!sections.length) {
            const currentHash = window.location.hash.replace('#', '');
            setActiveLink(currentHash);
            return;
        }

        const headerOffset = header.offsetHeight + 24;
        const activeSection = sections.reduce((current, section) => {
            const sectionTop = section.getBoundingClientRect().top;

            if (sectionTop <= headerOffset) {
                return section;
            }

            return current;
        }, sections[0]);

        setActiveLink(activeSection.id);
    };

    const scrollToSection = (targetId) => {
        const target = document.getElementById(targetId);

        if (!target) {
            return false;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `#${targetId}`);
        setActiveLink(targetId);
        return true;
    };

    setHeaderState();
    updateActiveLink();

    window.addEventListener('scroll', () => {
        setHeaderState();
        updateActiveLink();
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 820) {
            closeMobileMenu();
        }
    });

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = header.classList.toggle('is-menu-open');

            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        });
    }

    headerHashLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const linkUrl = new URL(link.href, window.location.href);
            const targetId = linkUrl.hash.replace('#', '');
            const isSamePage = linkUrl.pathname === window.location.pathname ||
                (linkUrl.pathname.endsWith('/index.html') && window.location.pathname === '/');

            closeMobileMenu();

            if (targetId && isSamePage && scrollToSection(targetId)) {
                event.preventDefault();
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });
});


/* ========== TRUST STRIP SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const trustStrip = document.querySelector('[data-trust-strip]');

    if (!trustStrip) {
        return;
    }

    const revealTrustStrip = () => {
        trustStrip.classList.add('is-visible');
    };

    if (!('IntersectionObserver' in window)) {
        revealTrustStrip();
        return;
    }

    const trustStripObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                revealTrustStrip();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.28
    });

    trustStripObserver.observe(trustStrip);
});
