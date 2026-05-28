/* ========== GLOBAL WEBSITE SETUP ========== */
'use strict';

const prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false };

const observeReveal = (target, reveal, options = {}) => {
    if (!target) {
        return;
    }

    if (!('IntersectionObserver' in window)) {
        reveal();
        return;
    }

    const observer = new IntersectionObserver((entries, activeObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                reveal();
                activeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: options.threshold ?? 0.24
    });

    observer.observe(target);
};


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

        const activationPoint = header.offsetHeight + window.innerHeight * 0.28;
        let activeSectionId = '';

        sections.forEach((section) => {
            const sectionPosition = section.getBoundingClientRect();

            if (sectionPosition.top <= activationPoint && sectionPosition.bottom > activationPoint) {
                activeSectionId = section.id;
            }
        });

        setActiveLink(activeSectionId);
    };

    const scrollToSection = (targetId) => {
        const target = document.getElementById(targetId);

        if (!target) {
            return false;
        }

        target.scrollIntoView({
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
            block: 'start'
        });
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

    observeReveal(trustStrip, revealTrustStrip, { threshold: 0.28 });
});


/* ========== SERVICES SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('[data-services-carousel]');

    if (!carousel) {
        return;
    }

    const viewport = carousel.querySelector('[data-services-viewport]');
    const track = carousel.querySelector('[data-services-track]');
    const dotsContainer = carousel.querySelector('[data-services-dots]');

    if (!viewport || !track || !dotsContainer) {
        return;
    }

    const originalCards = Array.from(track.children);
    const cardCount = originalCards.length;

    if (!cardCount) {
        return;
    }

    const autoplayDelay = 4200;
    let visibleCards = 0;
    let slideStep = 1;
    let currentIndex = cardCount;
    let autoplayTimer = null;
    let isDragging = false;
    let dragAxis = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTranslate = 0;
    let currentTranslate = 0;

    const getGap = () => {
        const styles = window.getComputedStyle(track);
        return parseFloat(styles.columnGap || styles.gap) || 0;
    };

    const getCardSize = () => {
        const firstCard = track.querySelector('.service-card');
        return firstCard ? firstCard.getBoundingClientRect().width + getGap() : 0;
    };

    const getVisibleCards = () => {
        const styles = window.getComputedStyle(carousel.querySelector('.services-carousel'));
        return Number.parseInt(styles.getPropertyValue('--visible-cards'), 10) || 1;
    };

    const getPageCount = () => visibleCards === 2 ? 2 : cardCount;

    const getActiveDotIndex = () => {
        const normalizedIndex = ((currentIndex % cardCount) + cardCount) % cardCount;
        return visibleCards === 2 ? Math.floor(normalizedIndex / 2) : normalizedIndex;
    };

    const setTrackPosition = (index, shouldAnimate = true) => {
        const cardSize = getCardSize();

        track.classList.toggle('is-dragging', !shouldAnimate);
        currentTranslate = -index * cardSize;
        track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
    };

    const updateDots = () => {
        const activeDotIndex = getActiveDotIndex();
        const dots = dotsContainer.querySelectorAll('.services-carousel__dot');

        dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === activeDotIndex);
            dot.setAttribute('aria-current', index === activeDotIndex ? 'true' : 'false');
        });
    };

    const normalizeIndex = () => {
        while (currentIndex >= cardCount * 2) {
            currentIndex -= cardCount;
            setTrackPosition(currentIndex, false);
        }

        while (currentIndex < cardCount) {
            currentIndex += cardCount;
            setTrackPosition(currentIndex, false);
        }

        updateDots();
    };

    const goToIndex = (index, shouldAnimate = true) => {
        currentIndex = index;
        setTrackPosition(currentIndex, shouldAnimate);
        updateDots();
    };

    const goToNext = () => {
        normalizeIndex();
        goToIndex(currentIndex + slideStep);
    };

    const startAutoplay = () => {
        window.clearInterval(autoplayTimer);

        if (document.hidden) {
            autoplayTimer = null;
            return;
        }

        autoplayTimer = window.setInterval(goToNext, autoplayDelay);
    };

    const stopAutoplay = () => {
        window.clearInterval(autoplayTimer);
    };

    const buildClones = () => {
        track.innerHTML = '';

        for (let group = 0; group < 3; group += 1) {
            originalCards.forEach((card) => {
                const cardClone = card.cloneNode(true);

                cardClone.classList.toggle('is-clone', group !== 1);

                track.appendChild(cardClone);
            });
        }
    };

    const buildDots = () => {
        const pageCount = getPageCount();
        dotsContainer.innerHTML = '';

        for (let index = 0; index < pageCount; index += 1) {
            const dot = document.createElement('button');
            const targetIndex = visibleCards === 2 ? index * 2 : index;

            dot.className = 'services-carousel__dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Show services slide ${index + 1}`);
            dot.addEventListener('click', () => {
                stopAutoplay();
                goToIndex(cardCount + targetIndex);
                startAutoplay();
            });

            dotsContainer.appendChild(dot);
        }
    };

    const syncCarousel = () => {
        const previousVisibleCards = visibleCards;
        visibleCards = getVisibleCards();
        slideStep = visibleCards === 2 ? 2 : 1;

        if (previousVisibleCards !== visibleCards) {
            const normalizedIndex = ((currentIndex % cardCount) + cardCount) % cardCount;
            const adjustedIndex = visibleCards === 2 && normalizedIndex >= 2 ? 2 : normalizedIndex;
            currentIndex = cardCount + adjustedIndex;
            buildDots();
        }

        setTrackPosition(currentIndex, false);
        updateDots();
    };

    const getPointerX = (event) => event.clientX;
    const getPointerY = (event) => event.clientY;

    const handlePointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        if (event.target.closest('a, button')) {
            return;
        }

        isDragging = true;
        dragAxis = null;
        dragStartX = getPointerX(event);
        dragStartY = getPointerY(event);
        dragStartTranslate = currentTranslate;
        viewport.classList.add('is-dragging');
        track.classList.add('is-dragging');
        stopAutoplay();
        viewport.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        if (!isDragging) {
            return;
        }

        const dragDistanceX = getPointerX(event) - dragStartX;
        const dragDistanceY = getPointerY(event) - dragStartY;

        if (!dragAxis && (Math.abs(dragDistanceX) > 8 || Math.abs(dragDistanceY) > 8)) {
            dragAxis = Math.abs(dragDistanceX) > Math.abs(dragDistanceY) ? 'horizontal' : 'vertical';
        }

        if (dragAxis !== 'horizontal') {
            return;
        }

        event.preventDefault();

        currentTranslate = dragStartTranslate + dragDistanceX;
        track.style.transform = `translate3d(${currentTranslate}px, 0, 0)`;
    };

    const handlePointerUp = (event) => {
        if (!isDragging) {
            return;
        }

        const dragDistance = getPointerX(event) - dragStartX;
        const cardSize = getCardSize();
        const threshold = Math.min(120, cardSize * 0.2);

        isDragging = false;
        viewport.classList.remove('is-dragging');
        track.classList.remove('is-dragging');

        if (dragAxis !== 'horizontal') {
            startAutoplay();
            return;
        }

        if (Math.abs(dragDistance) > threshold) {
            const direction = dragDistance < 0 ? 1 : -1;
            goToIndex(currentIndex + (direction * slideStep));
        } else {
            goToIndex(currentIndex);
        }

        startAutoplay();
    };

    buildClones();
    syncCarousel();
    startAutoplay();

    track.addEventListener('transitionend', normalizeIndex);
    viewport.addEventListener('pointerdown', handlePointerDown);
    viewport.addEventListener('pointermove', handlePointerMove);
    viewport.addEventListener('pointerup', handlePointerUp);
    viewport.addEventListener('pointercancel', handlePointerUp);
    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', () => {
        if (!isDragging) {
            startAutoplay();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
            return;
        }

        isDragging = false;
        dragAxis = null;
        viewport.classList.remove('is-dragging');
        track.classList.remove('is-dragging');
        normalizeIndex();
        syncCarousel();
        startAutoplay();
    });

    window.addEventListener('resize', syncCarousel);
});


/* ========== ABOUT SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.querySelector('[data-about-section]');

    if (!aboutSection) {
        return;
    }

    const revealAboutSection = () => {
        aboutSection.classList.add('is-visible');
    };

    observeReveal(aboutSection, revealAboutSection);
});


/* ========== CONTACT SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const contactSection = document.querySelector('[data-contact-section]');

    if (!contactSection) {
        return;
    }

    const revealContactSection = () => {
        contactSection.classList.add('is-visible');
    };

    observeReveal(contactSection, revealContactSection);
});


/* ========== SERVICE BENEFITS STRIP SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const serviceBenefitsStrip = document.querySelector('[data-service-benefits]');

    if (!serviceBenefitsStrip) {
        return;
    }

    const revealServiceBenefits = () => {
        serviceBenefitsStrip.classList.add('is-visible');
    };

    observeReveal(serviceBenefitsStrip, revealServiceBenefits, { threshold: 0.28 });
});


/* ========== SERVICE GALLERY SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('[data-gallery]');

    if (!gallery) {
        return;
    }

    const triggers = Array.from(gallery.querySelectorAll('[data-gallery-trigger]'));
    const lightbox = gallery.querySelector('[data-gallery-lightbox]');
    const lightboxImage = gallery.querySelector('[data-gallery-image]');
    const closeButton = gallery.querySelector('[data-gallery-close]');
    const previousButton = gallery.querySelector('[data-gallery-prev]');
    const nextButton = gallery.querySelector('[data-gallery-next]');
    const images = triggers.map((trigger) => trigger.dataset.gallerySrc);

    if (!triggers.length || !lightbox || !lightboxImage || !closeButton || !previousButton || !nextButton) {
        return;
    }

    let activeIndex = 0;
    let touchStartX = 0;
    let isChangingImage = false;

    const setImage = (index) => {
        activeIndex = (index + images.length) % images.length;
        lightboxImage.src = images[activeIndex];
    };

    const showImage = (index, direction = 0) => {
        if (isChangingImage) {
            return;
        }

        if (lightbox.hidden) {
            setImage(index);
            return;
        }

        isChangingImage = true;
        lightbox.style.setProperty('--gallery-slide-distance', `${direction * -22}px`);
        lightbox.classList.add('is-changing');

        window.setTimeout(() => {
            setImage(index);
            lightbox.style.setProperty('--gallery-slide-distance', `${direction * 22}px`);

            window.requestAnimationFrame(() => {
                lightbox.classList.remove('is-changing');
                isChangingImage = false;
            });
        }, 180);
    };

    const openLightbox = (index) => {
        setImage(index);
        lightbox.hidden = false;
        document.body.classList.add('is-lightbox-open');
        closeButton.focus();
    };

    const closeLightbox = () => {
        lightbox.hidden = true;
        document.body.classList.remove('is-lightbox-open');
        lightboxImage.src = '';
        triggers[activeIndex]?.focus();
    };

    const showPreviousImage = () => {
        showImage(activeIndex - 1, -1);
    };

    const showNextImage = () => {
        showImage(activeIndex + 1, 1);
    };

    triggers.forEach((trigger, index) => {
        trigger.addEventListener('click', () => {
            openLightbox(index);
        });
    });

    closeButton.addEventListener('click', closeLightbox);
    previousButton.addEventListener('click', showPreviousImage);
    nextButton.addEventListener('click', showNextImage);

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    lightbox.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (event) => {
        const touchEndX = event.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) < 50) {
            return;
        }

        if (swipeDistance > 0) {
            showPreviousImage();
        } else {
            showNextImage();
        }
    }, { passive: true });

    document.addEventListener('keydown', (event) => {
        if (lightbox.hidden) {
            return;
        }

        if (event.key === 'Escape') {
            closeLightbox();
        }

        if (event.key === 'ArrowLeft') {
            showPreviousImage();
        }

        if (event.key === 'ArrowRight') {
            showNextImage();
        }
    });
});


/* ========== SERVICE PROCESS SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const serviceProcess = document.querySelector('[data-service-process]');

    if (!serviceProcess) {
        return;
    }

    const revealServiceProcess = () => {
        serviceProcess.classList.add('is-visible');
    };

    observeReveal(serviceProcess, revealServiceProcess, { threshold: 0.28 });
});


/* ========== SERVICE FAQ SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const faqSection = document.querySelector('[data-faq-section]');

    if (!faqSection) {
        return;
    }

    const faqToggles = faqSection.querySelectorAll('[data-faq-toggle]');

    const setFaqState = (toggle, shouldOpen) => {
        const faqItem = toggle.closest('.service-faq-item');
        if (!faqItem) {
            return;
        }

        const answer = faqItem.querySelector('[data-faq-answer]');
        if (!answer) {
            return;
        }

        toggle.setAttribute('aria-expanded', String(shouldOpen));
        faqItem.classList.toggle('is-open', shouldOpen);

        if (shouldOpen) {
            answer.style.height = `${answer.scrollHeight}px`;
        } else {
            answer.style.height = `${answer.scrollHeight}px`;
            window.requestAnimationFrame(() => {
                answer.style.height = '0px';
            });
        }
    };

    faqToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';

            setFaqState(toggle, !isOpen);
        });
    });

    window.addEventListener('resize', () => {
        faqToggles.forEach((toggle) => {
            if (toggle.getAttribute('aria-expanded') === 'true') {
                const answer = toggle.closest('.service-faq-item')?.querySelector('[data-faq-answer]');

                if (answer) {
                    answer.style.height = `${answer.scrollHeight}px`;
                }
            }
        });
    });
});


/* ========== SERVICE CTA SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const serviceCta = document.querySelector('[data-service-cta]');

    if (!serviceCta) {
        return;
    }

    const revealServiceCta = () => {
        serviceCta.classList.add('is-visible');
    };

    observeReveal(serviceCta, revealServiceCta);
});


/* ========== CONTACT FORM SECTION ========== */
document.addEventListener('DOMContentLoaded', () => {
    const contactPageSection = document.querySelector('[data-contact-page-section]');

    if (!contactPageSection) {
        return;
    }

    const contactPageInfo = contactPageSection.querySelector('.contact-page-section__info');

    const revealContactPageInfo = () => {
        contactPageSection.classList.add('is-visible');
    };

    observeReveal(contactPageInfo || contactPageSection, revealContactPageInfo);
});
