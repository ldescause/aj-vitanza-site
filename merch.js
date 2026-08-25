/* ============================================
   AJ VITANZA — MERCH
   ------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT FOR THE DROP.
   Everything below the CONFIG block is machinery.

   Setup walkthrough  → MERCH-SETUP.md
   Launch day steps   → LAUNCH.md
   ============================================ */

var MERCH_CONFIG = {

    /* ---------- MASTER SWITCH ----------
       false = the entire Merch section is hidden and its nav link removed. */
    enabled: true,

    /* ---------- PHASE ----------
       'teaser'   → images + prices, no buy buttons ("Dropping Soon")
       'presale'  → limited units, presale badge + counter
       'live'     → normal store, no cap messaging
       'soldout'  → everything sold out, points people to the show

       On the staging URL you can preview any phase without editing this
       file by adding ?phase=presale to the address. That override is
       ignored on the real domain. */
    phase: 'presale',

    /* ---------- WHICH DOMAINS ARE "REAL" ----------
       Anywhere NOT in this list is treated as staging: Stripe TEST links
       are used, a warning banner appears, ?phase= overrides are allowed,
       and the page is marked noindex. */
    productionHosts: ['ajvitanza.com', 'www.ajvitanza.com'],

    /* ---------- SECTION COPY ---------- */
    copy: {
        label: '04. — Wear It',
        title: 'Merch',
        teaser: {
            eyebrow: 'Coming Soon',
            blurb: 'First run of official AJ Vitanza merch. Limited quantities. Sign up below so you know the second presale opens.'
        },
        presale: {
            eyebrow: 'Presale — Limited Run',
            blurb: 'A limited number of units are available online before the show. Once these are gone, the rest go with AJ on the road.'
        },
        live: {
            eyebrow: 'Available Now',
            blurb: 'Official AJ Vitanza merch. Ships worldwide.'
        },
        soldout: {
            eyebrow: 'Sold Out',
            blurb: 'The online run is gone. Remaining stock is available in person at the show — first come, first served.'
        }
    },

    /* ---------- PRESALE COUNTER ----------
       Stripe enforces the real cap (each payment link auto-deactivates when
       it hits its limit). This counter is cosmetic — update `unitsRemaining`
       by hand, or set showCounter: false and forget about it. */
    presale: {
        showCounter: true,
        totalUnits: 100,
        unitsRemaining: 100
    },

    /* ---------- SHIPPING NOTE ---------- */
    shippingNote: 'Shipping is calculated at checkout based on your address. Local pickup at the show is available as a free option.',

    /* ---------- WHERE STRIPE SENDS PEOPLE AFTER PAYING ----------
       Paste into each payment link’s "After payment" setting. */
    successUrl: 'https://ajvitanza.com/thanks.html',

    /* ---------- PRODUCTS ----------
       stripeLink      : LIVE-mode buy.stripe.com URL — real money
       stripeLinkTest  : TEST-mode buy.stripe.com URL — fake cards

       Staging uses stripeLinkTest. Production uses stripeLink. If the one
       needed for the current environment is null, the card renders with a
       dead "Dropping Soon" button — nothing breaks, nothing sells.

       sizes  : shown on the card. Real selection happens in Stripe via a
                dropdown custom field. null for one-size items.
       status : null | 'soldout' | 'lowstock'
       badge  : optional tag, e.g. 'Presale Exclusive'
    */
    products: [
        {
            id: 'tee',
            name: 'Keep Me High Tee',
            subtitle: 'Heavyweight cotton — Black',
            price: 35,
            image: 'images/merch/tee-front.jpg',
            imageAlt: 'images/merch/tee-back.jpg',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            stripeLink: null,
            stripeLinkTest: null,
            status: null,
            badge: 'Presale Exclusive'
        },
        {
            id: 'hoodie',
            name: 'Keep Me High Hoodie',
            subtitle: 'Embroidered swoosh — Midnight',
            price: 70,
            image: 'images/merch/hoodie-front.jpg',
            imageAlt: 'images/merch/hoodie-back.jpg',
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            stripeLink: null,
            stripeLinkTest: null,
            status: null,
            badge: null
        },
        {
            id: 'poster',
            name: 'Cover Art Print',
            subtitle: '18×24 — Signed',
            price: 25,
            image: 'images/merch/poster.jpg',
            imageAlt: null,
            sizes: null,
            stripeLink: null,
            stripeLinkTest: null,
            status: null,
            badge: 'Signed'
        }
    ],

    /* ---------- CURRENCY ---------- */
    currency: 'USD',
    currencySymbol: '$'
};


/* ============================================================
   ---------------- MACHINERY BELOW ---------------------------
   You shouldn't need to touch anything past this line.
   ============================================================ */

(function () {
    'use strict';

    var cfg = MERCH_CONFIG;
    var section = document.getElementById('merch');
    if (!section) return;

    /* ---------------------------------------------------------
       ENVIRONMENT
       --------------------------------------------------------- */
    var host = (window.location.hostname || '').toLowerCase();
    var isProd = cfg.productionHosts.indexOf(host) !== -1;

    /* Staging gets noindex so the drop never leaks into search results.
       (Netlify already sends X-Robots-Tag on branch deploys — this is
       belt and braces, and covers local file:// previews too.) */
    if (!isProd) {
        var robots = document.createElement('meta');
        robots.name = 'robots';
        robots.content = 'noindex, nofollow';
        document.head.appendChild(robots);
    }

    /* ---------------------------------------------------------
       KILL SWITCH
       --------------------------------------------------------- */
    if (!cfg.enabled) {
        section.remove();
        var navLink = document.querySelector('.nav-links a[href="#merch"]');
        if (navLink) navLink.remove();
        return;
    }

    /* ---------------------------------------------------------
       PHASE — with ?phase= override on staging only
       --------------------------------------------------------- */
    var phase = cfg.phase;
    var phaseOverridden = false;
    var VALID_PHASES = ['teaser', 'presale', 'live', 'soldout'];

    if (!isProd) {
        var qp = new URLSearchParams(window.location.search).get('phase');
        if (qp && VALID_PHASES.indexOf(qp) !== -1) {
            phase = qp;
            phaseOverridden = true;
        }
    }
    if (VALID_PHASES.indexOf(phase) === -1) phase = 'teaser';

    var copy = cfg.copy[phase] || cfg.copy.live;

    /* ---------------------------------------------------------
       LINK RESOLUTION + SAFETY CHECKS
       --------------------------------------------------------- */
    function linkFor(p) {
        if (!isProd) return p.stripeLinkTest || null;

        /* Hard guard: never send a real customer to a test-mode checkout.
           If a test link ends up in the live slot, the card falls back to a
           dead button rather than silently taking fake orders. */
        if (p.stripeLink && /\/test_/.test(p.stripeLink)) return null;
        return p.stripeLink || null;
    }

    var warnings = [];
    cfg.products.forEach(function (p) {
        if (isProd) {
            if (p.stripeLink && /\/test_/.test(p.stripeLink)) {
                warnings.push(p.id + ': stripeLink is a TEST link — BLOCKED on production. ' +
                    'Replace it with the live-mode link.');
            }
            if (!p.stripeLink && phase !== 'teaser' && phase !== 'soldout') {
                warnings.push(p.id + ': no live stripeLink — card will show "Dropping Soon".');
            }
        } else if (!p.stripeLinkTest && phase !== 'teaser' && phase !== 'soldout') {
            warnings.push(p.id + ': no stripeLinkTest — cannot test checkout on staging.');
        }
    });
    if (warnings.length && window.console) {
        console.warn('[merch] ' + (isProd ? 'PRODUCTION' : 'STAGING') + ' warnings:\n  • ' +
            warnings.join('\n  • '));
    }

    /* ---------------------------------------------------------
       STAGING BANNER
       --------------------------------------------------------- */
    if (!isProd) {
        var bar = document.createElement('div');
        bar.className = 'staging-bar';
        bar.innerHTML =
            '<span class="staging-bar-tag">Staging</span>' +
            '<span class="staging-bar-text">Stripe <strong>test mode</strong> — payments are fake. ' +
            'Phase: <strong>' + phase + '</strong>' +
            (phaseOverridden ? ' (via URL)' : '') + '</span>' +
            '<span class="staging-bar-links">' +
            VALID_PHASES.map(function (ph) {
                return '<a href="?phase=' + ph + '#merch"' +
                    (ph === phase ? ' class="is-current"' : '') + '>' + ph + '</a>';
            }).join('') +
            '</span>';
        document.body.appendChild(bar);
        document.body.classList.add('has-staging-bar');
    }

    /* ---------------------------------------------------------
       RENDER
       --------------------------------------------------------- */
    setText('.merch-label', cfg.copy.label);
    setText('.merch-eyebrow-text', copy.eyebrow);
    setText('.merch-blurb', copy.blurb);
    setText('.merch-shipping-note', phase === 'soldout' ? '' : cfg.shippingNote);

    var titleEl = section.querySelector('.merch-title');
    if (titleEl) titleEl.textContent = cfg.copy.title;

    /* Presale counter */
    var counter = section.querySelector('.merch-counter');
    if (counter) {
        if (phase === 'presale' && cfg.presale.showCounter) {
            var total = Math.max(1, cfg.presale.totalUnits);
            var left = Math.max(0, Math.min(cfg.presale.unitsRemaining, total));
            var pct = Math.round(((total - left) / total) * 100);

            counter.querySelector('.merch-counter-num').textContent = left;
            counter.querySelector('.merch-counter-total').textContent =
                'of ' + total + ' presale units remaining';
            counter.querySelector('.merch-counter-fill').style.width = pct + '%';
            counter.hidden = false;
        } else {
            counter.hidden = true;
        }
    }

    /* Product grid */
    var grid = section.querySelector('.merch-grid');
    if (!grid) return;
    grid.innerHTML = '';
    cfg.products.forEach(function (p) {
        grid.appendChild(buildCard(p));
    });

    if (typeof window.AJ_refreshInteractions === 'function') {
        window.AJ_refreshInteractions();
    }


    /* ---------------- builders ---------------- */

    function buildCard(p) {
        var soldOut = p.status === 'soldout' || phase === 'soldout';
        var link = linkFor(p);
        var buyable = phase !== 'teaser' && !soldOut && !!link;

        var card = el('article', 'merch-card');
        card.setAttribute('data-reveal', 'scale');
        if (soldOut) card.classList.add('is-soldout');

        /* media */
        var media = el('div', 'merch-card-media');
        media.setAttribute('data-tilt', '');

        if (p.image) {
            media.appendChild(mkImg(p.image, p.name, 'merch-card-img', function () {
                media.classList.add('is-empty');
            }));
            if (p.imageAlt) {
                media.appendChild(mkImg(p.imageAlt, '', 'merch-card-img merch-card-img--alt'));
            }
        } else {
            media.classList.add('is-empty');
        }

        var ph = el('span', 'merch-card-placeholder');
        ph.textContent = 'Artwork coming';
        media.appendChild(ph);

        if (soldOut) {
            media.appendChild(mkBadge('Sold Out', 'merch-badge--soldout'));
        } else {
            if (p.badge) media.appendChild(mkBadge(p.badge));
            if (p.status === 'lowstock') media.appendChild(mkBadge('Low Stock', 'merch-badge--low'));
        }

        card.appendChild(media);

        /* body */
        var body = el('div', 'merch-card-body');

        var head = el('div', 'merch-card-head');
        var name = el('h3', 'merch-card-name');
        name.textContent = p.name;
        var price = el('span', 'merch-card-price');
        price.textContent = cfg.currencySymbol + formatPrice(p.price);
        head.appendChild(name);
        head.appendChild(price);
        body.appendChild(head);

        if (p.subtitle) {
            var sub = el('p', 'merch-card-sub');
            sub.textContent = p.subtitle;
            body.appendChild(sub);
        }

        if (p.sizes && p.sizes.length) {
            var sizes = el('div', 'merch-card-sizes');
            p.sizes.forEach(function (s) {
                var chip = el('span', 'merch-size');
                chip.textContent = s;
                sizes.appendChild(chip);
            });
            body.appendChild(sizes);
        }

        body.appendChild(buildAction(p, link, buyable, soldOut));
        card.appendChild(body);
        return card;
    }

    function buildAction(p, link, buyable, soldOut) {
        if (!buyable) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.disabled = true;
            btn.className = 'btn btn--ghost merch-btn is-disabled';
            btn.innerHTML = '<span>' + (soldOut ? 'Sold Out' : 'Dropping Soon') + '</span>';
            return btn;
        }

        var a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'btn btn--primary merch-btn';
        a.setAttribute('data-magnetic', '');
        a.setAttribute('data-ripple', '');
        a.innerHTML = '<span>' +
            (phase === 'presale' ? 'Reserve Yours' : 'Buy Now') + '</span>' +
            (isProd ? '' : '<span class="merch-btn-test">test</span>');

        a.addEventListener('click', function () {
            /* Only report real purchases to analytics. */
            if (isProd && typeof window.gtag === 'function') {
                window.gtag('event', 'begin_checkout', {
                    currency: cfg.currency,
                    value: p.price,
                    items: [{ item_id: p.id, item_name: p.name, price: p.price }]
                });
            }
        });
        return a;
    }


    /* ---------------- helpers ---------------- */

    function mkImg(src, alt, cls, onFail) {
        var img = document.createElement('img');
        img.src = src;
        img.alt = alt || '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.className = cls;
        img.addEventListener('error', function () {
            img.remove();
            if (onFail) onFail();
        });
        return img;
    }

    function mkBadge(text, extra) {
        var b = el('span', 'merch-badge' + (extra ? ' ' + extra : ''));
        b.textContent = text;
        return b;
    }

    function el(tag, cls) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        return n;
    }

    function setText(sel, txt) {
        var n = section.querySelector(sel);
        if (n) n.textContent = txt || '';
    }

    function formatPrice(v) {
        return (v % 1 === 0) ? String(v) : v.toFixed(2);
    }
})();
