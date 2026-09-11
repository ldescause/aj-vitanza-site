(function () {
    'use strict';

    var isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* The site is deliberately SILENT. A Web Audio engine used to live here
       — drone, boot tones, a resolve chime and an impact hit — along with a
       Keep Me High track. All of it is gone: this is a shop, and a page that
       makes noise at someone who is deciding whether to spend $50 is working
       against itself. The visual boot sequence below is unchanged.

       If sound is ever wanted again, it belongs behind an off-by-default
       control, not on a gate tap. */

    function startSite() {
        initSplitText();
        initSiteInteractions();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startSite, { once: true });
    } else {
        startSite();
    }

    // ========== TEXT SPLIT ANIMATION ==========
    function initSplitText() {
        var splitEls = document.querySelectorAll('[data-split]');
        splitEls.forEach(function (el) {
            var text = el.textContent.trim();
            el.innerHTML = '';
            // Split into words first, then chars. Each word is a non-breaking
            // group so a line can only break at a space — never mid-word.
            var words = text.split(/\s+/);
            var charIndex = 0;
            words.forEach(function (word, wi) {
                var wordEl = document.createElement('span');
                wordEl.className = 'word';
                word.split('').forEach(function (char) {
                    var span = document.createElement('span');
                    span.className = 'char';
                    span.textContent = char;
                    span.style.animationDelay = (charIndex * 0.04) + 's';
                    wordEl.appendChild(span);
                    charIndex++;
                });
                el.appendChild(wordEl);
                if (wi < words.length - 1) {
                    el.appendChild(document.createTextNode(' '));
                }
            });

            if ('IntersectionObserver' in window) {
                var obs = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            var charSpans = el.querySelectorAll('.char');
                            charSpans.forEach(function (c, idx) {
                                setTimeout(function () {
                                    c.classList.add('revealed');
                                    c.style.opacity = '1';
                                    c.style.transform = 'translateY(0) rotateX(0)';
                                }, idx * 40);
                            });
                            obs.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.3 });
                obs.observe(el);
            }
        });
    }

    // ========== SITE INTERACTIONS ==========
    function initSiteInteractions() {
        initCursor();
        initMagnetic();
        initRipple();
        initScrollReveals();
        initPressQuote();
        initTilt();
        initCarousel();
        initAnchorScroll();
        initHeroGlow();
        initProductMotion();

        updateScrollProgress();
        updateNav();
    }

    // ========== CUSTOM CURSOR ==========
    function initCursor() {
        var cursor = document.getElementById('cursor');
        var mouseX = 0, mouseY = 0;
        var glowX = 0, glowY = 0;

        if (!isMobile && !prefersReducedMotion && cursor) {
            document.body.classList.add('has-cursor');
            var dot = cursor.querySelector('.cursor-dot');
            var glow = cursor.querySelector('.cursor-glow');

            document.addEventListener('mousemove', function (e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
            }, { passive: true });

            var cursorRunning = true;
            function animateCursor() {
                if (!cursorRunning) return;
                glowX += (mouseX - glowX) * 0.08;
                glowY += (mouseY - glowY) * 0.08;

                if (dot) {
                    dot.style.left = mouseX + 'px';
                    dot.style.top = mouseY + 'px';
                }
                if (glow) {
                    glow.style.left = glowX + 'px';
                    glow.style.top = glowY + 'px';
                }
                requestAnimationFrame(animateCursor);
            }
            animateCursor();

            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    cursorRunning = false;
                } else if (!cursorRunning) {
                    cursorRunning = true;
                    animateCursor();
                }
            });

            document.addEventListener('mousedown', function () { cursor.classList.add('clicking'); });
            document.addEventListener('mouseup', function () { cursor.classList.remove('clicking'); });

            document.querySelectorAll('a, button, .btn, .dsp, .track, .vid-card, .stream-link, [data-magnetic]').forEach(function (el) {
                el.addEventListener('mouseenter', function () { cursor.classList.add('hovering'); });
                el.addEventListener('mouseleave', function () { cursor.classList.remove('hovering'); });
            });
        }
    }

    // ========== MAGNETIC HOVER ==========
    function initMagnetic() {
        if (isMobile) return;
        document.querySelectorAll('[data-magnetic]').forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
                el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(function () { el.style.transition = ''; }, 500);
            });
        });
    }

    // ========== RIPPLE EFFECT ==========
    function initRipple() {
        document.querySelectorAll('[data-ripple]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                var rect = el.getBoundingClientRect();
                var ripple = document.createElement('span');
                ripple.className = 'ripple';
                var size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                el.appendChild(ripple);
                setTimeout(function () { ripple.remove(); }, 700);
            });
        });
    }

    // ========== SCROLL PROGRESS ==========
    var scrollProgress = document.getElementById('scrollProgress');

    function updateScrollProgress() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = progress + '%';
    }

    // ========== NAVIGATION ==========
    var nav = document.getElementById('nav');

    function updateNav() {
        if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 80);
        }
    }

    // ========== HERO PARALLAX ==========
    var heroImg = document.getElementById('heroImg');
    var heroField = document.querySelector('.hero-field');
    var heroContent = document.querySelector('.hero-content');
    var heroScroll = document.getElementById('heroScroll');

    function updateHeroParallax() {
        var scrollTop = window.scrollY;
        var vh = window.innerHeight;
        if (scrollTop > vh) return;

        var progress = scrollTop / vh;

        if (heroImg) {
            heroImg.style.transform = 'scale(' + (1 + progress * 0.15) + ') translate3d(0, ' + (scrollTop * 0.2) + 'px, 0)';
            heroImg.style.opacity = Math.max(0, 0.55 - progress * 0.55);
        }
        if (heroField) {
            heroField.style.transform = 'scale(' + (1 + progress * 0.06) + ') translate3d(0, ' + (scrollTop * 0.1) + 'px, 0)';
        }
        if (heroContent) {
            heroContent.style.opacity = Math.max(0, 1 - progress * 2);
            heroContent.style.transform = 'translate3d(0, ' + (scrollTop * 0.3) + 'px, 0)';
        }
        if (heroScroll) {
            heroScroll.style.opacity = Math.max(0, 1 - progress * 4);
        }
    }

    // ========== UNIFIED SCROLL ==========
    var ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function () {
                updateScrollProgress();
                updateNav();
                if (!isMobile && !prefersReducedMotion) updateHeroParallax();
                ticking = false;
            });
            ticking = true;
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    // ========== SCROLL REVEALS ==========
    function initScrollReveals() {
        var revealEls = document.querySelectorAll('[data-reveal]');
        if ('IntersectionObserver' in window) {
            var revealObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        revealObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
            revealEls.forEach(function (el) { revealObs.observe(el); });
        } else {
            revealEls.forEach(function (el) { el.classList.add('revealed'); });
        }
    }

    function initPressQuote() {}

    // ========== 3D TILT ==========
    function initTilt() {
        if (isMobile) return;
        document.querySelectorAll('[data-tilt]').forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width;
                var y = (e.clientY - rect.top) / rect.height;
                var rotateX = (y - 0.5) * -12;
                var rotateY = (x - 0.5) * 12;
                el.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
                el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(function () { el.style.transition = ''; }, 600);
            });
        });
    }

    // ========== VIDEO CAROUSEL DRAG ==========
    function initCarousel() {
        var carousel = document.getElementById('videosCarousel');
        if (!carousel) return;

        var isDown = false, startX, scrollLeft;
        carousel.addEventListener('mousedown', function (e) {
            isDown = true;
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });
        carousel.addEventListener('mouseleave', function () { isDown = false; });
        carousel.addEventListener('mouseup', function () { isDown = false; });
        carousel.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            var x = e.pageX - carousel.offsetLeft;
            carousel.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });
    }

    // ========== SMOOTH ANCHOR SCROLL ==========
    function initAnchorScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var id = this.getAttribute('href');
                if (id === '#') return;
                var target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    var navH = nav ? nav.offsetHeight : 0;
                    var top = target.getBoundingClientRect().top + window.scrollY - navH;
                    window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                }
            });
        });
    }

    // ========== HERO CURSOR GLOW ==========
    function initHeroGlow() {
        var hero = document.querySelector('.hero');
        if (!hero || isMobile) return;

        var glowEl = document.createElement('div');
        glowEl.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;transition:opacity 0.4s;opacity:0;';
        hero.appendChild(glowEl);
        hero.addEventListener('mouseenter', function () { glowEl.style.opacity = '1'; });
        hero.addEventListener('mouseleave', function () { glowEl.style.opacity = '0'; });
        hero.addEventListener('mousemove', function (e) {
            var rect = hero.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            glowEl.style.background = 'radial-gradient(circle 400px at ' + x + 'px ' + y + 'px, rgba(94,143,194,0.12), rgba(40,80,140,0.06) 40%, transparent 70%)';
        });
    }

    // ========== PRODUCT MOTION ==========
    function initProductMotion() {
        if (prefersReducedMotion) return;
        document.querySelectorAll('.merch-card-media').forEach(function (media) {
            media.addEventListener('mouseenter', function () { media.classList.add('is-active-motion'); });
            media.addEventListener('mouseleave', function () { media.classList.remove('is-active-motion'); });
        });
    }

})();
