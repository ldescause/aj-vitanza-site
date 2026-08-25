(function () {
    'use strict';

    var isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ========== AUDIO ENGINE ==========
    var audioCtx = null;
    var masterGain = null;

    function getAudioContext() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function getMasterGain() {
        var ctx = getAudioContext();
        if (!masterGain) {
            masterGain = ctx.createGain();
            masterGain.gain.value = 0.8;
            masterGain.connect(ctx.destination);
        }
        return masterGain;
    }

    function playTone(freq, duration, gainVal, type, rampDown) {
        var ctx = getAudioContext();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(gainVal || 0.02, ctx.currentTime);
        if (rampDown !== false) {
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (duration || 0.1));
        }
        osc.connect(gain);
        gain.connect(getMasterGain());
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + (duration || 0.1));
    }

    function playNoise(duration, gainVal) {
        var ctx = getAudioContext();
        var bufferSize = ctx.sampleRate * (duration || 0.1);
        var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        var gain = ctx.createGain();
        gain.gain.setValueAtTime(gainVal || 0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        var filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(getMasterGain());
        source.start();
    }

    // Deep cinematic sub-bass drone
    var droneOscs = [];
    function startDrone() {
        var ctx = getAudioContext();
        var master = getMasterGain();
        var droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0, ctx.currentTime);
        droneGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
        droneGain.connect(master);

        [40, 40.2, 60, 80.1].forEach(function (freq) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(droneGain);
            osc.start();
            droneOscs.push({ osc: osc, gain: droneGain });
        });

        // dark rumble layer
        var rumbleGain = ctx.createGain();
        rumbleGain.gain.setValueAtTime(0, ctx.currentTime);
        rumbleGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 4);
        rumbleGain.connect(master);
        var rumble = ctx.createOscillator();
        rumble.type = 'sawtooth';
        rumble.frequency.value = 30;
        var rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.value = 80;
        rumble.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumble.start();
        droneOscs.push({ osc: rumble, gain: rumbleGain });
    }

    function stopDrone() {
        var ctx = getAudioContext();
        droneOscs.forEach(function (d) {
            d.gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);
            setTimeout(function () {
                try { d.osc.stop(); } catch (e) {}
            }, 2000);
        });
        droneOscs = [];
    }

    function playBootUp() {
        // cinematic power-on: low sweep + impact
        var ctx = getAudioContext();
        var master = getMasterGain();
        // sweep up
        var sweep = ctx.createOscillator();
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(30, ctx.currentTime);
        sweep.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.2);
        var sweepGain = ctx.createGain();
        sweepGain.gain.setValueAtTime(0.04, ctx.currentTime);
        sweepGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.8);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        var sweepFilter = ctx.createBiquadFilter();
        sweepFilter.type = 'lowpass';
        sweepFilter.frequency.setValueAtTime(100, ctx.currentTime);
        sweepFilter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2);
        sweep.connect(sweepFilter);
        sweepFilter.connect(sweepGain);
        sweepGain.connect(master);
        sweep.start();
        sweep.stop(ctx.currentTime + 1.5);

        // impact hit at 1.2s
        setTimeout(function () {
            playNoise(0.3, 0.06);
            playTone(55, 0.8, 0.1, 'sine');
            playTone(110, 0.4, 0.04, 'triangle');
        }, 1200);
    }

    function playTypeBlip() {
        var freq = 1200 + Math.random() * 600;
        playTone(freq, 0.02, 0.008, 'square');
    }

    function playProgressTick() {
        playTone(900 + Math.random() * 200, 0.025, 0.01, 'sine');
    }

    function playResolveChime() {
        var ctx = getAudioContext();
        var master = getMasterGain();

        // Industrial synth hit — detuned saw stack + filtered noise burst
        var freqs = [55, 55.5, 110, 82.4];
        freqs.forEach(function (freq) {
            var osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            var gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
            var filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 1.5);
            filter.Q.value = 4;
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 2);
        });

        // metallic noise burst
        playNoise(0.15, 0.04);
    }

    function playFinalImpact() {
        var ctx = getAudioContext();
        var master = getMasterGain();

        // Heavy sub drop
        var sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120, ctx.currentTime);
        sub.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 1.5);
        var subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.15, ctx.currentTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
        sub.connect(subGain);
        subGain.connect(master);
        sub.start();
        sub.stop(ctx.currentTime + 2);

        // Industrial noise hit
        playNoise(0.4, 0.07);

        // Distorted saw stab
        var stab = ctx.createOscillator();
        stab.type = 'sawtooth';
        stab.frequency.value = 65;
        var stabGain = ctx.createGain();
        stabGain.gain.setValueAtTime(0.08, ctx.currentTime);
        stabGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        var distFilter = ctx.createBiquadFilter();
        distFilter.type = 'lowpass';
        distFilter.frequency.value = 400;
        distFilter.Q.value = 8;
        stab.connect(distFilter);
        distFilter.connect(stabGain);
        stabGain.connect(master);
        stab.start();
        stab.stop(ctx.currentTime + 1.5);
    }

    // ========== GATE ==========
    var gate = document.getElementById('gate');
    var gateBtn = document.getElementById('gateBtn');

    document.body.style.overflow = 'hidden';

    // Add ?skipintro to the URL to jump straight to the site.
    // Invaluable when you're reloading 50 times to tweak the merch section.
    //
    // Pages without the intro markup (merch.html) also take this path — the
    // gate only exists on the homepage, and without this guard the listener
    // below would throw on a null element and kill every other script.
    var skipIntro = prefersReducedMotion ||
        !gate || !gateBtn ||
        /[?&]skipintro/i.test(window.location.search);

    if (skipIntro) {
        // skip everything
        if (gate) gate.classList.add('hidden');
        document.body.style.overflow = '';
        window.addEventListener('load', function () {
            initSplitText();
            initSiteInteractions();
        });
        return;
    }

    gateBtn.addEventListener('click', function () {
        getAudioContext();
        playBootUp();
        startDrone();
        gate.classList.add('hidden');
        prepareMusic();
        startTerminalBoot();
    });

    // ========== TERMINAL BOOT ==========
    var terminalBoot = document.getElementById('terminalBoot');
    var terminalContent = document.getElementById('terminalContent');
    var BOOT_LINES = [
        { text: 'BIOS v4.2.1 — AJ VITANZA SYSTEMS', speed: 5, pause: 120, status: null },
        { text: 'Loading audio subsystem', speed: 4, pause: 60, status: 'OK', progress: true },
        { text: 'Mounting media: KEEP_ME_HIGH.wav', speed: 4, pause: 60, status: 'READY', progress: true },
        { text: 'Signal acquired — 48kHz / 24bit', speed: 4, pause: 80, status: null },
        { text: 'All systems nominal', speed: 6, pause: 180, status: null },
    ];

    function startTerminalBoot() {
        terminalBoot.classList.add('active');
        // Print header instantly
        var header = document.createElement('div');
        header.className = 'terminal-line terminal-header';
        header.textContent = '> SYSTEM BOOT';
        terminalContent.appendChild(header);
        setTimeout(function () { processBootLine(0); }, 120);
    }

    function processBootLine(index) {
        if (index >= BOOT_LINES.length) {
            startLogoReveal();
            return;
        }

        var line = BOOT_LINES[index];
        var lineEl = document.createElement('div');
        lineEl.className = 'terminal-line';
        terminalContent.appendChild(lineEl);

        var charIndex = 0;
        var text = line.text;

        function typeNext() {
            if (charIndex < text.length) {
                lineEl.textContent = text.substring(0, charIndex + 1);
                if (charIndex % 3 === 0) playTypeBlip();
                charIndex++;
                setTimeout(typeNext, line.speed);
            } else if (line.progress) {
                animateProgress(lineEl, text, function () {
                    appendStatus(lineEl, line.status);
                    setTimeout(function () { processBootLine(index + 1); }, 40);
                });
            } else {
                setTimeout(function () {
                    appendStatus(lineEl, line.status);
                    setTimeout(function () { processBootLine(index + 1); }, 40);
                }, line.pause);
            }
        }

        typeNext();
    }

    function appendStatus(lineEl, status) {
        if (!status) return;
        var tag = document.createElement('span');
        tag.className = 'terminal-status';
        tag.textContent = ' [' + status + ']';
        lineEl.appendChild(tag);
        playProgressTick();
    }

    function animateProgress(lineEl, prefix, callback) {
        var progress = 0;
        var barWidth = 16;

        function tick() {
            progress += Math.random() * 30 + 22;
            if (progress > 100) progress = 100;
            var filled = Math.round((progress / 100) * barWidth);
            var bar = ' [' + '█'.repeat(filled) + '·'.repeat(barWidth - filled) + '] ' + Math.round(progress) + '%';
            lineEl.textContent = prefix + bar;
            playProgressTick();
            if (progress < 100) {
                setTimeout(tick, 14 + Math.random() * 10);
            } else {
                setTimeout(callback, 60);
            }
        }
        tick();
    }

    // ========== 3D LOGO REVEAL ==========
    var logoReveal = document.getElementById('logoReveal');
    var logoParticles = document.getElementById('logoParticles');
    var logoRevealText = document.getElementById('logoRevealText');
    var logoRevealSub = document.getElementById('logoRevealSub');

    function startLogoReveal() {
        // Activate logo BEHIND terminal first so there's no flash
        logoReveal.classList.add('active', 'phase-glitch');
        spawnParticles();

        // Now fade terminal out — logo is already visible behind it
        terminalBoot.classList.add('fade-out');
        setTimeout(function () {
            terminalBoot.classList.remove('active', 'fade-out');
        }, 400);

        // Phase 1: Glitchy, blurry, fast spin
        setTimeout(function () {
            logoReveal.classList.remove('phase-glitch');
            logoReveal.classList.add('phase-resolving');
            playResolveChime();

            // Start music during resolve — song plays from the top
            startMusic();

            // Phase 2: Resolving, slower spin, clearing
            setTimeout(function () {
                logoReveal.classList.remove('phase-resolving');
                logoReveal.classList.add('phase-clear');

                logoRevealText.classList.add('visible');
                logoRevealSub.classList.add('visible');
                stopDrone();

                // Auto-enter after a short beat of music on the logo screen
                setTimeout(finishIntro, 1800);
            }, 900);
        }, 700);
    }

    function spawnParticles() {
        if (!logoParticles) return;
        var count = isMobile ? 20 : 40;
        for (var i = 0; i < count; i++) {
            setTimeout(function () {
                var p = document.createElement('div');
                p.className = 'logo-particle';
                var cx = 50 + (Math.random() - 0.5) * 20;
                var cy = 50 + (Math.random() - 0.5) * 20;
                p.style.left = cx + '%';
                p.style.top = cy + '%';
                p.style.setProperty('--px', (Math.random() - 0.5) * 200 + 'px');
                p.style.setProperty('--py', (Math.random() - 0.5) * 200 + 'px');
                p.style.animationDelay = (Math.random() * 0.5) + 's';
                p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
                logoParticles.appendChild(p);
                setTimeout(function () { p.remove(); }, 3500);
            }, Math.random() * 4000);
        }
    }

    // ========== FINISH INTRO ==========
    function finishIntro() {
        playFinalImpact();

        // Prepare main site BEFORE fading logo out
        window.scrollTo(0, 0);
        document.body.style.overflow = '';
        initSplitText();
        initSiteInteractions();

        // Fade logo out — main site is ready underneath, music keeps playing
        logoReveal.classList.add('fade-out');
        setTimeout(function () {
            logoReveal.className = 'logo-reveal';
        }, 700);
    }

    // ========== MUSIC ==========
    var musicAudio = null;

    // Created on the gate tap (a user gesture) so the file is buffering
    // through the whole boot sequence and play() resolves instantly.
    function prepareMusic() {
        if (musicAudio) return;
        musicAudio = new Audio('audio/keep-me-high.m4a');
        musicAudio.loop = true;
        musicAudio.volume = 0;
        musicAudio.preload = 'auto';
        musicAudio.load();
    }

    function startMusic() {
        prepareMusic();
        musicAudio.volume = 0;
        musicAudio.currentTime = 0;

        musicAudio.play().then(function () {
            var vol = 0;
            var fadeIn = setInterval(function () {
                vol += 0.03;
                if (vol >= 0.6) {
                    vol = 0.6;
                    clearInterval(fadeIn);
                }
                musicAudio.volume = vol;
            }, 40);
        }).catch(function () {});
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
                if (!isMobile) updateHeroParallax();
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
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            });
        });
    }

    // ========== HERO CURSOR GLOW ==========
    function initHeroGlow() {
        var hero = document.querySelector('.hero');
        if (!hero || isMobile) return;

        var glowEl = document.createElement('div');
        glowEl.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;transition:opacity 0.4s;opacity:0;';
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

})();
