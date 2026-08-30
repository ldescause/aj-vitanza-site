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
        label: '01. — Wear It',      // homepage section (numbered like its siblings)
        labelPage: 'Official Store', // standalone /merch page
        title: 'Merch',
        teaser: {
            eyebrow: 'Coming Soon',
            blurb: 'First run of official AJ Vitanza merch. Limited quantities. Sign up below so you know the second presale opens.'
        },
        presale: {
            eyebrow: 'Presale — 50 Units',
            blurb: '50 of the 194-shirt run are being released early. Presale orders get a graphic card signed by AJ — presale only, not available at the show.'
        },
        live: {
            eyebrow: 'Available Now',
            blurb: 'Official AJ Vitanza merch. Ships worldwide.'
        },
        soldout: {
            eyebrow: 'Presale Sold Out',
            blurb: 'All 50 presale shirts are gone. The rest of the run is available in person at the show — first come, first served. (The signed card was presale only.)'
        }
    },

    /* ---------- HERO ----------
       The homepage hero is merch-led, so its copy is driven from here too.
       Otherwise the hero could still say "Presale Now Open" days after the
       section below it went sold out — the exact kind of drift that makes a
       site look abandoned.

       Set enabled: false to leave the hero markup alone. */
    hero: {
        enabled: true,
        teaser:  { eyebrow: 'Merch — Dropping Soon',     sub: 'AJ VITANZA DEBUT TEE', cta: 'See The Tee' },
        presale: { eyebrow: 'Presale Open — 50 Units',   sub: 'AJ VITANZA DEBUT TEE', cta: 'Shop The Tee' },
        live:    { eyebrow: 'Merch — Available Now',     sub: 'AJ VITANZA DEBUT TEE', cta: 'Shop The Tee' },
        soldout: { eyebrow: 'Presale Sold Out',          sub: 'AJ VITANZA DEBUT TEE', cta: 'See The Merch' }
    },

    /* ---------- PRESALE COUNTER ----------
       Stripe enforces the real cap (each payment link auto-deactivates when
       it hits its limit). This counter is cosmetic — update `unitsRemaining`
       by hand, or set showCounter: false and forget about it. */
    presale: {
        showCounter: true,

        /* These describe the PRESALE ALLOCATION, not the whole print run.
           50 shirts online now; the other 144 go to the merch table.

           The real cap lives in Stripe, per size. This number is the
           marketing display — keep it roughly honest against the sum of
           the per-size `presale` values below, or the console will nag. */
        totalUnits: 50,
        unitsRemaining: 50,

        /* At or below this many units, the counter turns warm amber and the
           label sharpens. Set to 0 to never escalate. */
        urgentBelow: 12,

        /* The presale-only sweetener. Rendered as a callout on the product.
           Set to null to remove it. */
        bonus: {
            title: 'Signed graphic card included',
            text: 'Every presale order ships with a graphic card hand-signed by AJ. Presale only — not available at the merch table.'
        }
    },

    /* ---------- COUNTDOWN ----------
       Ticks down to the show. Shows in the teaser and presale phases only.

       showDate MUST include a timezone offset, or the clock will be wrong
       for anyone outside your timezone. Format:

           2026-09-12T20:00:00-04:00
           └── date ──┘ └time┘ └─ offset (-04:00 = US Eastern, summer)

       Common US offsets:  Eastern -04:00 (summer) / -05:00 (winter)
                           Central -05:00 / -06:00
                           Pacific -07:00 / -08:00

       Set enabled: false if you'd rather not run a clock. */
    countdown: {
        enabled: false,
        showDate: '2026-09-12T20:00:00-04:00',   // ← REPLACE with the real show
        labelBefore: 'Presale closes when doors open',
        labelAfter: 'Doors are open — merch table only',
        venue: ''    // optional, e.g. 'Brooklyn Made · Brooklyn, NY'
    },

    /* ---------- SHIPPING NOTE ---------- */
    shippingNote: 'Shipping is calculated at checkout based on your address. Everything ships from us — no pickup option.',

    /* ---------- WHERE STRIPE SENDS PEOPLE AFTER PAYING ----------
       Paste into each payment link’s "After payment" setting. */
    successUrl: 'https://ajvitanza.com/thanks.html',

    /* ---------- PRODUCTS ----------
       ONE STRIPE PAYMENT LINK PER SIZE. This is deliberate.

       A single link with a size dropdown cannot cap stock by size — with
       only 14 XL and 10 XS in the whole run, one enthusiastic buyer could
       oversell a size before you notice. Five separate links, each with its
       own payment cap, means Stripe itself kills a size the moment it's
       gone. No code running at 2am, no manual watching.

       Per size:
         label     : what shows on the card (XS, S, M, L, XL)
         link      : LIVE-mode buy.stripe.com URL — real money
         linkTest  : TEST-mode buy.stripe.com URL — fake cards
         soldout   : set true to grey the size out on the site

       Staging uses linkTest. Production uses link. If the one needed for
       the current environment is missing, that size renders as unavailable
       — nothing breaks, nothing sells.

       stock   : how many of that size exist in the whole run (reference only,
                 for your own bookkeeping — it doesn't drive anything)
       presale : how many of that size the Stripe link's payment cap is set
                 to. These must match what you actually type into Stripe.

       status : null | 'soldout' | 'lowstock'
       badge  : optional tag, e.g. 'Presale Exclusive'
    */
    products: [
        {
            id: 'tee',
            name: 'AJ Vitanza Debut T-Shirt',
            subtitle: 'Heavyweight cotton — Black',
            price: 50,
            image: 'images/merch/tee-front.jpg',
            imageAlt: 'images/merch/tee-back.jpg',
            sizes: [
                { label: 'XS', stock: 10, presale: 3,
                  link:     'https://buy.stripe.com/5kQbJ34zMdEg9Wc9cqdfG00',
                  linkTest: 'https://buy.stripe.com/test_5kQbJ34zMdEg9Wc9cqdfG00',
                  soldout: false },

                { label: 'S',  stock: 65, presale: 17,
                  link:     'https://buy.stripe.com/9B6aEZgiudEg9Wc60edfG01',
                  linkTest: 'https://buy.stripe.com/test_9B6aEZgiudEg9Wc60edfG01',
                  soldout: false },

                { label: 'M',  stock: 62, presale: 16,
                  link:     'https://buy.stripe.com/bJe14p2rE8jW7O4gESdfG02',
                  linkTest: 'https://buy.stripe.com/test_bJe14p2rE8jW7O4gESdfG02',
                  soldout: false },

                { label: 'L',  stock: 43, presale: 11,
                  link:     'https://buy.stripe.com/9B6fZj5DQgQs3xO4WadfG03',
                  linkTest: 'https://buy.stripe.com/test_9B6fZj5DQgQs3xO4WadfG03',
                  soldout: false },

                { label: 'XL', stock: 14, presale: 3,
                  link:     'https://buy.stripe.com/bJe28t0jwas47O4gESdfG04',
                  linkTest: 'https://buy.stripe.com/test_bJe28t0jwas47O4gESdfG04',
                  soldout: false }
            ],
            status: null,
            badge: 'Presale Exclusive'
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
       (Vercel already sends X-Robots-Tag: noindex on preview deployments
       — this is belt and braces, and covers local file:// previews too.) */
    if (!isProd) {
        var robots = document.createElement('meta');
        robots.name = 'robots';
        robots.content = 'noindex, nofollow';
        document.head.appendChild(robots);
    }

    /* Is this the standalone /merch page, or the homepage section? */
    var isStandalone = document.body.classList.contains('page-merch');

    /* ---------------------------------------------------------
       KILL SWITCH
       --------------------------------------------------------- */
    if (!cfg.enabled) {
        if (isStandalone) {
            /* Removing everything would leave a blank page, so say something
               instead. The page still exists — people have the link. */
            var grid0 = section.querySelector('.merch-grid');
            var meta0 = section.querySelector('.merch-meta');
            if (meta0) meta0.hidden = true;
            if (grid0) grid0.innerHTML = '';
            setText('.merch-label', 'Official Store');
            setText('.merch-eyebrow-text', 'Nothing available');
            setText('.merch-blurb',
                'There’s no merch on sale right now. Sign up below and you’ll hear first when the next drop goes live.');
            setText('.merch-shipping-note', '');
        } else {
            section.remove();
        }
        var navLink = document.querySelector('.nav-links a[href="#merch"]');
        if (navLink) navLink.remove();
        var navShop = document.querySelector('.nav-shop:not(.nav-shop--alt)');
        if (navShop) navShop.remove();
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
    /* Resolves ONE SIZE's checkout URL for the current environment.
       Returns null when that size can't be bought right now. */
    function linkForSize(sz) {
        if (!sz || sz.soldout) return null;
        if (!isProd) return sz.linkTest || null;

        /* Hard guard: never send a real customer to a test-mode checkout.
           If a test link ends up in the live slot, that size renders as
           unavailable rather than silently taking fake orders. */
        if (sz.link && /\/test_/.test(sz.link)) return null;
        return sz.link || null;
    }

    /* A product is buyable if at least one of its sizes has a usable link. */
    function anySizeBuyable(p) {
        return (p.sizes || []).some(function (sz) { return !!linkForSize(sz); });
    }

    var warnings = [];
    var expectsLinks = phase !== 'teaser' && phase !== 'soldout';
    cfg.products.forEach(function (p) {
        (p.sizes || []).forEach(function (sz) {
            var where = p.id + '/' + sz.label;
            if (sz.soldout) return;
            if (isProd) {
                if (sz.link && /\/test_/.test(sz.link)) {
                    warnings.push(where + ': link is a TEST link — BLOCKED on production. ' +
                        'Replace it with the live-mode link.');
                }
                if (!sz.link && expectsLinks) {
                    warnings.push(where + ': no live link — this size shows as unavailable.');
                }
            } else if (!sz.linkTest && expectsLinks) {
                warnings.push(where + ': no linkTest — cannot test this size on staging.');
            }

            /* Catch the mistake that actually costs money: the same link
               pasted under two sizes. Both would sell the same Stripe
               product, and one size's cap would swallow the other's. */
            var slot = isProd ? 'link' : 'linkTest';
            if (sz[slot]) {
                var twin = (p.sizes || []).filter(function (o) {
                    return o !== sz && o[slot] === sz[slot];
                });
                if (twin.length) {
                    warnings.push(where + ': same ' + slot + ' as ' +
                        twin.map(function (o) { return o.label; }).join(', ') +
                        ' — each size needs its OWN payment link or the caps collide.');
                }
            }
        });

        /* Sanity-check the presale allocation against the counter. */
        if (phase === 'presale' && cfg.presale.showCounter) {
            var alloc = (p.sizes || []).reduce(function (n, sz) {
                return n + (sz.presale || 0);
            }, 0);
            if (alloc && alloc !== cfg.presale.totalUnits) {
                warnings.push(p.id + ': per-size presale caps add up to ' + alloc +
                    ' but presale.totalUnits says ' + cfg.presale.totalUnits +
                    ' — the counter and Stripe disagree.');
            }
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
       HERO COPY (homepage only)
       --------------------------------------------------------- */
    if (cfg.hero && cfg.hero.enabled && !isStandalone) {
        var h = cfg.hero[phase];
        if (h) {
            setDocText('.hero-eyebrow-text', h.eyebrow);
            setDocText('.hero-sub', h.sub);
            setDocText('.hero-cta-text', h.cta);
        }
    }

    /* ---------------------------------------------------------
       RENDER
       --------------------------------------------------------- */
    setText('.merch-label', isStandalone
        ? (cfg.copy.labelPage || cfg.copy.label)
        : cfg.copy.label);
    setText('.merch-eyebrow-text', copy.eyebrow);
    setText('.merch-blurb', copy.blurb);
    setText('.merch-shipping-note', phase === 'soldout' ? '' : cfg.shippingNote);

    var titleEl = section.querySelector('.merch-title');
    if (titleEl) titleEl.textContent = cfg.copy.title;

    /* Presale counter */
    var counter = section.querySelector('.merch-counter');
    var counterShown = false;
    if (counter) {
        if (phase === 'presale' && cfg.presale.showCounter) {
            var total = Math.max(1, cfg.presale.totalUnits);
            var left = Math.max(0, Math.min(cfg.presale.unitsRemaining, total));
            var pct = Math.round(((total - left) / total) * 100);
            var urgent = cfg.presale.urgentBelow > 0 && left <= cfg.presale.urgentBelow;

            counter.querySelector('.merch-counter-num').textContent = left;
            counter.querySelector('.merch-counter-total').textContent =
                '/ ' + total + ' left';
            counter.querySelector('.merch-counter-fill').style.width = pct + '%';
            counter.querySelector('.merch-meta-label').textContent =
                urgent ? 'Almost gone' : 'Stock remaining';
            if (urgent) counter.classList.add('is-urgent');

            counter.hidden = false;
            counterShown = true;
        } else {
            counter.hidden = true;
        }
    }

    /* Countdown to the show */
    var countdownShown = startCountdown();

    /* The meta row only exists if something is in it */
    var meta = section.querySelector('.merch-meta');
    if (meta) meta.hidden = !(counterShown || countdownShown);

    /* Product grid */
    var grid = section.querySelector('.merch-grid');
    if (!grid) return;
    grid.innerHTML = '';

    /* A single product gets a wide side-by-side feature layout instead of a
       lonely card stretched across the grid. */
    var isFeature = cfg.products.length === 1;
    if (isFeature) grid.classList.add('merch-grid--feature');

    cfg.products.forEach(function (p) {
        grid.appendChild(buildCard(p, isFeature));
    });

    if (typeof window.AJ_refreshInteractions === 'function') {
        window.AJ_refreshInteractions();
    }


    /* ---------------- countdown ---------------- */

    function startCountdown() {
        var cd = cfg.countdown || {};
        var box = section.querySelector('.merch-countdown');
        if (!box) return false;

        var showsInThisPhase = (phase === 'presale' || phase === 'teaser');
        if (!cd.enabled || !showsInThisPhase) {
            box.hidden = true;
            return false;
        }

        var target = new Date(cd.showDate).getTime();
        if (isNaN(target)) {
            if (window.console) {
                console.warn('[merch] countdown.showDate is not a valid date: "' +
                    cd.showDate + '". Expected e.g. 2026-09-12T20:00:00-04:00');
            }
            box.hidden = true;
            return false;
        }

        var labelEl = box.querySelector('.merch-countdown-label');
        var venueEl = box.querySelector('.merch-countdown-venue');
        var nums = {
            days: box.querySelector('[data-cd="days"]'),
            hours: box.querySelector('[data-cd="hours"]'),
            mins: box.querySelector('[data-cd="mins"]'),
            secs: box.querySelector('[data-cd="secs"]')
        };

        if (venueEl) venueEl.textContent = cd.venue || '';

        function pad(n) { return n < 10 ? '0' + n : String(n); }

        function tick() {
            var diff = target - Date.now();

            if (diff <= 0) {
                box.classList.add('is-past');
                if (labelEl) labelEl.textContent = cd.labelAfter || '';
                nums.days.textContent = '00';
                nums.hours.textContent = '00';
                nums.mins.textContent = '00';
                nums.secs.textContent = '00';
                clearInterval(timer);
                return;
            }

            var s = Math.floor(diff / 1000);
            var d = Math.floor(s / 86400);
            var h = Math.floor((s % 86400) / 3600);
            var m = Math.floor((s % 3600) / 60);

            if (labelEl) labelEl.textContent = cd.labelBefore || '';
            nums.days.textContent = pad(d);
            nums.hours.textContent = pad(h);
            nums.mins.textContent = pad(m);
            nums.secs.textContent = pad(s % 60);

            /* under 48 hours, the clock goes warm */
            if (diff < 48 * 3600 * 1000) box.classList.add('is-urgent');
        }

        tick();
        var timer = setInterval(tick, 1000);
        box.hidden = false;
        return true;
    }


    /* ---------------- builders ---------------- */

    function buildCard(p, isFeature) {
        /* Every size flagged sold out IS the product being sold out. Without
           this the last size selling out leaves a card reading "Dropping
           Soon", which tells the buyer the opposite of the truth. */
        var everySizeGone = (p.sizes && p.sizes.length)
            ? p.sizes.every(function (sz) { return sz.soldout; })
            : false;

        var soldOut = p.status === 'soldout' || phase === 'soldout' ||
            (everySizeGone && phase !== 'teaser');
        var buyable = phase !== 'teaser' && !soldOut && anySizeBuyable(p);

        var card = el('article', 'merch-card' + (isFeature ? ' merch-card--feature' : ''));
        card.setAttribute('data-reveal', isFeature ? '' : 'scale');
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

        /* SIZE PICKER
           Each size is its own Stripe link, so the size chosen here decides
           where the button sends you. When nothing's buyable the chips are
           inert text, exactly as they were in teaser mode. */
        var picker = null;
        if (p.sizes && p.sizes.length) {
            picker = buildSizePicker(p, buyable);
            body.appendChild(picker.el);
        }

        /* Presale-only bonus callout */
        var bonus = cfg.presale.bonus;
        if (bonus && phase === 'presale' && !soldOut) {
            var bx = el('div', 'merch-bonus');
            var bh = el('span', 'merch-bonus-title');
            bh.textContent = bonus.title;
            var bt = el('p', 'merch-bonus-text');
            bt.textContent = bonus.text;
            bx.appendChild(bh);
            bx.appendChild(bt);
            body.appendChild(bx);
        }

        var action = buildAction(p, buyable, soldOut);
        body.appendChild(action.el);
        if (picker) picker.onChange(action.setSize);

        card.appendChild(body);
        return card;
    }

    /* ---- size picker -------------------------------------------------
       Renders one chip per size. Sizes without a usable link for this
       environment are dead — that's how a sold-out size looks once its
       Stripe link hits its cap and you flip `soldout: true`.            */
    function buildSizePicker(p, buyable) {
        var wrap = el('div', 'merch-card-sizewrap');
        var label = el('span', 'merch-size-label');
        var row = el('div', 'merch-card-sizes');
        var listeners = [];
        var chips = [];

        var available = (p.sizes || []).filter(function (sz) {
            return buyable && !!linkForSize(sz);
        });

        label.textContent = buyable
            ? (available.length ? 'Pick your size' : 'Sizes')
            : 'Sizes';

        p.sizes.forEach(function (sz) {
            var usable = buyable && !!linkForSize(sz);
            var chip;

            if (usable) {
                chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'merch-size merch-size--pick';
                chip.setAttribute('aria-pressed', 'false');
                chip.addEventListener('click', function () {
                    chips.forEach(function (c) {
                        c.classList.remove('is-selected');
                        if (c.tagName === 'BUTTON') c.setAttribute('aria-pressed', 'false');
                    });
                    chip.classList.add('is-selected');
                    chip.setAttribute('aria-pressed', 'true');
                    listeners.forEach(function (fn) { fn(sz); });
                });
            } else {
                chip = el('span', 'merch-size');
                if (buyable) {
                    /* Buyable product, unbuyable size — say why. */
                    chip.classList.add('is-unavailable');
                    chip.title = sz.soldout ? 'Sold out' : 'Not available';
                    chip.setAttribute('aria-label', sz.label + ' — ' +
                        (sz.soldout ? 'sold out' : 'not available'));
                }
            }

            chip.textContent = sz.label;
            chips.push(chip);
            row.appendChild(chip);
        });

        wrap.appendChild(label);
        wrap.appendChild(row);

        /* One size available and nothing to choose between — preselect it
           so the buyer isn't asked to click a decision they don't have. */
        if (available.length === 1) {
            var only = chips[p.sizes.indexOf(available[0])];
            if (only && only.tagName === 'BUTTON') {
                setTimeout(function () { only.click(); }, 0);
            }
        }

        return {
            el: wrap,
            onChange: function (fn) { listeners.push(fn); }
        };
    }

    /* ---- buy button --------------------------------------------------
       Starts inert and becomes a real link once a size is picked. Using an
       <a> that only gets an href on selection means a mis-click before
       choosing a size can't open a checkout for the wrong shirt.         */
    function buildAction(p, buyable, soldOut) {
        if (!buyable) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.disabled = true;
            btn.className = 'btn btn--ghost merch-btn is-disabled';
            btn.innerHTML = '<span>' + (soldOut ? 'Sold Out' : 'Dropping Soon') + '</span>';
            return { el: btn, setSize: function () {} };
        }

        var verb = phase === 'presale' ? 'Reserve Yours' : 'Buy Now';
        var chosen = null;

        var a = document.createElement('a');
        a.className = 'btn btn--primary merch-btn is-disabled';
        a.setAttribute('role', 'button');
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('data-magnetic', '');
        a.setAttribute('data-ripple', '');
        paint('Select a size');

        function paint(text) {
            a.innerHTML = '<span>' + text + '</span>' +
                (isProd ? '' : '<span class="merch-btn-test">test</span>');
        }

        a.addEventListener('click', function (e) {
            if (!chosen) { e.preventDefault(); return; }

            /* Only report real purchases to analytics. */
            if (isProd && typeof window.gtag === 'function') {
                window.gtag('event', 'begin_checkout', {
                    currency: cfg.currency,
                    value: p.price,
                    items: [{
                        item_id: p.id + '-' + chosen.label.toLowerCase(),
                        item_name: p.name,
                        item_variant: chosen.label,
                        price: p.price
                    }]
                });
            }
        });

        return {
            el: a,
            setSize: function (sz) {
                var url = linkForSize(sz);
                if (!url) return;
                chosen = sz;
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener';
                a.classList.remove('is-disabled');
                a.removeAttribute('aria-disabled');
                paint(verb + ' — ' + sz.label);
            }
        };
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

    /* Same, but scoped to the whole document — the hero lives outside
       the merch section. */
    function setDocText(sel, txt) {
        var n = document.querySelector(sel);
        if (n && txt) n.textContent = txt;
    }

    function formatPrice(v) {
        return (v % 1 === 0) ? String(v) : v.toFixed(2);
    }
})();
