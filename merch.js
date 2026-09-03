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
    phase: 'live',

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
            blurb: 'The AJ Vitanza debut tee — heavyweight cotton, white. Ships worldwide. Limited stock, and when a size is gone it\u2019s gone.'
        },
        soldout: {
            eyebrow: 'Presale Closed',
            blurb: 'The 50-unit presale is closed and every order is being packed now. The full run drops here soon — sign up below and you\u2019ll hear first.'
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
        soldout: { eyebrow: 'Presale Closed — Full Drop Coming Soon', sub: 'AJ VITANZA DEBUT TEE', cta: 'See The Tee' }
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
        /* REMAINING, not sold. The card renders it as "N / 50 left", so this
           is (cap − payments taken). Read "Limited use: X of 50 used" on the
           payment link in Stripe and put 50 − X here.

           The Stripe cap is now 53, NOT 50 — raised to absorb three refunds
           (refunds don't return a slot, Stripe counts payments). So:

             payments taken   44 of 53
             refunded          3
             shirts shipped   41
             shirts still available -> 9    <- this number

           totalUnits stays 50 because 50 shirts is the promise; 53 is just
           the mechanism. Cap minus taken equals shirts left only while the
           refund count and the cap uplift stay in step — if you refund
           another, raise the cap again or this drifts.

           Typed by hand, so it is wrong the moment it isn't updated — bump it
           when you check Stripe, or set showCounter: false and stop making a
           claim you can't keep. */
        unitsRemaining: 9,

        /* At or below this many units, the counter turns warm amber and the
           label sharpens. Set to 0 to never escalate. */
        urgentBelow: 12,

        /* The presale-only sweetener. Rendered as a callout on the product.
           Set to null to remove it. */
        /* The signed card was a presale-only sweetener. It is gone, so this
           is null — leaving it on would promise something no longer shipped. */
        bonus: null
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
        /* Still off. Turning it on is a promise: it says the presale CLOSES
           when doors open, so if people can still order online after the
           clock hits zero, the urgency reads as theatre. Deactivate the
           Stripe link at showtime and this can go true.

           Now set to the real show — it was a placeholder date two weeks
           out, which would have been wrong the moment anyone enabled it.
           -07:00 is LA in September (Pacific Daylight Time). */
        enabled: false,
        showDate: '2026-09-02T18:30:00-07:00',
        labelBefore: 'Presale closes when doors open',
        labelAfter: 'Doors are open — merch table only',
        venue: 'The Moroccan Lounge · Los Angeles, CA'
    },

    /* ---------- SHIPPING NOTE ---------- */
    shippingNote: 'Shipping is calculated at checkout based on your address. Everything ships from us — no pickup option.',

    /* ---------- WHERE STRIPE SENDS PEOPLE AFTER PAYING ----------
       This value is documentation — Stripe holds the real setting, per link,
       under "After payment". The two modes need DIFFERENT urls:

         LIVE link → https://ajvitanza.com/thanks.html
         TEST link → https://aj-vitanza-site-git-merch-drop-desca.vercel.app/thanks.html

       Why: thanks.html only exists on the merch-drop branch. Until that is
       merged to main, ajvitanza.com/thanks.html is a 404 — so a test purchase
       pointed at production takes the payment and then lands the buyer on an
       error page. That is exactly what happened the first time we tested.

       LAUNCH ORDER MATTERS: the live link's redirect stays broken until main
       is merged. Merge first, then share the link — never the other way. */
    successUrl: 'https://ajvitanza.com/thanks.html',

    /* ---------- PRODUCTS ----------
       ONE STRIPE PAYMENT LINK, CAPPED AT 50. Size is chosen inside Stripe
       via a required dropdown, so the presale stops dead at 50 orders
       regardless of which sizes people picked.

       link      : LIVE-mode buy.stripe.com URL — real money
       linkTest  : TEST-mode buy.stripe.com URL — fake cards

       Staging uses linkTest. Production uses link. If the one needed for
       the current environment is missing, the button goes dead rather than
       sending anyone to a broken or fake checkout.

       THE TRADE-OFF, so it isn't a surprise later: a payment link caps
       PAYMENTS, not sizes. One link capped at 50 cannot also protect an
       individual size. XS (10 in stock) and XL (14) are the only sizes
       where stock is below 50, so those are the two that could
       oversubscribe. Watch them in the Stripe dashboard — the Size column
       is on every order — and refund or substitute if one runs past its
       stock. S/M/L have enough depth to absorb the whole presale.

       sizes  : shown on the card as information only. Selection happens in
                Stripe. Set soldout: true to strike one through once you've
                sold that size out; it's cosmetic, and it does NOT stop
                someone picking it in the Stripe dropdown — remove the
                option in Stripe for that.

       stock  : units of that size in the whole run. Reference only.

       status : null | 'soldout' | 'lowstock'
       badge  : optional tag, e.g. 'Presale Exclusive'
    */
    /* ---------- PRODUCTS ----------
       ONE CAPPED STRIPE LINK PER SIZE. This is the only arrangement that can
       actually stop a sold-out size being bought: a payment link caps
       PAYMENTS, so a single link with a size dropdown can never protect an
       individual size. Each link below is capped at that size's real stock,
       so Stripe deactivates it the moment the size runs out and checkout
       becomes impossible on its own — not merely greyed out here.

       stock   : units left when the drop opened. Reference only; Stripe's cap
                 is the thing that actually enforces it.
       link    : LIVE buy.stripe.com URL for that size, capped in Stripe.
       soldout : set true to grey it out on the site. Stripe has already
                 stopped it; this just tells the visitor before they click.

       There are deliberately NO test-mode links: staging therefore shows
       "Dropping Soon" rather than risking a real charge from a test page. */
    products: [
        {
            id: 'tee',
            name: 'AJ Vitanza Debut T-Shirt',
            subtitle: 'Heavyweight cotton — White',
            price: 50,

            media: [
                {
                    type: 'video',
                    src: 'video/tee-360.mp4',
                    poster: 'video/tee-360-poster.jpg',
                    label: '360°',
                    alt: 'The AJ Vitanza debut tee rotating a full turn'
                },
                {
                    type: 'image',
                    src: 'images/merch/tee-front.jpg',
                    label: 'Front',
                    alt: 'Front of the tee — swoosh on the chest'
                },
                {
                    type: 'image',
                    src: 'images/merch/tee-back.jpg',
                    label: 'Back',
                    alt: 'Back of the tee — AJ VITANZA wordmark'
                }
            ],

            image: 'images/merch/tee-front.jpg',
            imageAlt: 'images/merch/tee-back.jpg',

            sizes: [
                { label: 'XS', stock:  8, soldout: false, link: 'https://buy.stripe.com/fZu5kF5DQ9o0c4kewKdfG06' },
                { label: 'S',  stock: 46, soldout: false, link: 'https://buy.stripe.com/14AaEZeameIkfgw88mdfG07' },
                { label: 'M',  stock: 44, soldout: false, link: 'https://buy.stripe.com/4gM3cx3vIcAc2tK74idfG08' },
                { label: 'L',  stock: 33, soldout: false, link: 'https://buy.stripe.com/9B6dRb0jw2ZC2tK0FUdfG09' },
                { label: 'XL', stock:  8, soldout: false, link: 'https://buy.stripe.com/00w00l7LY7fS5FWgESdfG0a' }
            ],
            status: null,
            badge: null
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
        syncStructuredData(null);
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
    /* Resolves the product's checkout URL for the current environment.
       Returns null when it can't be bought right now. */
    function linkFor(sz) {
        if (!sz || sz.soldout || !sz.link) return null;
        /* Staging never gets a live link. There are no per-size test links, so
           staging shows a dead button rather than risking a real charge. */
        if (!isProd) return null;
        /* Hard guard: never send a real customer to a test-mode checkout. */
        if (/\/test_/.test(sz.link)) return null;
        return sz.link;
    }

    /* A product is buyable if ANY of its sizes still is. */
    function anyBuyable(p) {
        return (p.sizes || []).some(function (sz) { return !!linkFor(sz); });
    }

    var warnings = [];
    var expectsLinks = phase !== 'teaser' && phase !== 'soldout';
    cfg.products.forEach(function (p) {
        (p.sizes || []).forEach(function (sz) {
            if (sz.soldout) return;
            if (!sz.link && expectsLinks) {
                warnings.push(p.id + ' ' + sz.label + ': no link — that size cannot be bought.');
            }
            if (isProd && sz.link && /\/test_/.test(sz.link)) {
                warnings.push(p.id + ' ' + sz.label + ': TEST link in the live slot — BLOCKED.');
            }
        });
        /* Two sizes sharing a link means one eats the other's cap and both
           buyers get the wrong shirt. Cheap to check, expensive to miss. */
        var seen = {};
        (p.sizes || []).forEach(function (sz) {
            if (!sz.link) return;
            if (seen[sz.link]) {
                warnings.push(p.id + ': ' + seen[sz.link] + ' and ' + sz.label +
                    ' share the same Stripe link — one will eat the other\u2019s stock.');
            }
            seen[sz.link] = sz.label;
        });
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

    syncStructuredData(cfg.products[0]);


    /* ---------------- structured data ----------------

       The JSON-LD in index.html carries a Product node for the tee. Its price
       and availability are written here rather than by hand, because a static
       schema drifts the moment you flip a phase — and a page that tells Google
       "InStock" while showing "Sold Out" is the kind of mismatch that earns a
       manual action. One source of truth: MERCH_CONFIG.

       Passing null (the kill switch, or nothing to sell) drops the Product
       node entirely, leaving the MusicGroup behind. */

    function syncStructuredData(product) {
        var tag = document.getElementById('ld-graph');
        if (!tag) return;

        var data;
        try {
            data = JSON.parse(tag.textContent);
        } catch (e) {
            console.warn('[merch] structured data is not valid JSON — leaving it alone.');
            return;
        }
        if (!data || !Array.isArray(data['@graph'])) return;

        var graph = data['@graph'];
        var idx = -1;
        for (var i = 0; i < graph.length; i++) {
            if (graph[i]['@type'] === 'Product') { idx = i; break; }
        }
        if (idx === -1) return;

        /* Nothing on sale — remove the offer rather than describe a phantom. */
        if (!product) {
            graph.splice(idx, 1);
            tag.textContent = JSON.stringify(data, null, 4);
            return;
        }

        var node = graph[idx];
        var everySizeGone = (product.sizes || []).length > 0 &&
            product.sizes.every(function (sz) { return sz.soldout; });
        var soldOut = product.status === 'soldout' || phase === 'soldout' ||
            (everySizeGone && phase !== 'teaser');

        /* Staging must never advertise itself to a crawler, and a teaser has
           nothing to buy yet. Both are honest as PreOrder/OutOfStock rather
           than a claim we can't back. */
        var availability =
            soldOut          ? 'https://schema.org/SoldOut' :
            phase === 'teaser' ? 'https://schema.org/PreOrder' :
                                  'https://schema.org/InStock';

        node.name = product.name;
        node.offers = node.offers || { '@type': 'Offer' };
        /* Schema wants a plain decimal, no currency symbol, no thousands
           separator — always two places so "50" doesn't read as an integer
           count of something. */
        node.offers.price = Number(product.price).toFixed(2);
        node.offers.priceCurrency = 'USD';
        node.offers.availability = availability;

        /* Sizes the site knows are gone shouldn't be implied as orderable. */
        var live = (product.sizes || []).filter(function (sz) { return !sz.soldout; });
        if (live.length) {
            node.size = live.map(function (sz) { return sz.label; });
        } else {
            delete node.size;
        }

        tag.textContent = JSON.stringify(data, null, 4);
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
        var buyable = phase !== 'teaser' && !soldOut && anyBuyable(p);

        var card = el('article', 'merch-card' + (isFeature ? ' merch-card--feature' : ''));
        card.setAttribute('data-reveal', isFeature ? '' : 'scale');
        if (soldOut) card.classList.add('is-soldout');

        /* media */
        var media = el('div', 'merch-card-media');
        media.setAttribute('data-tilt', '');

        var gallery = buildGallery(p, media);

        var ph = el('span', 'merch-card-placeholder');
        ph.textContent = 'Artwork coming';
        media.appendChild(ph);

        if (soldOut) {
            media.appendChild(mkBadge('Sold Out', 'merch-badge--soldout'));
        } else {
            if (p.badge) media.appendChild(mkBadge(p.badge));
            if (p.status === 'lowstock') media.appendChild(mkBadge('Low Stock', 'merch-badge--low'));
        }

        /* The media well and its thumbnail rail are ONE column. They must be
           wrapped: .merch-card--feature is a two-column grid, so appending
           the rail as a sibling made it a third grid item, which pushed the
           body onto a second row and turned the card into a tall scroll. */
        var mediaCol = el('div', 'merch-card-mediacol');
        mediaCol.appendChild(media);
        if (gallery) mediaCol.appendChild(gallery);
        card.appendChild(mediaCol);

        /* body */
        var body = el('div', 'merch-card-body');

        var head = el('div', 'merch-card-head');
        var name = el('h3', 'merch-card-name');
        /* Wrap each word so the line can only break at spaces. Without this,
           "T-Shirt" splits at the hyphen into "T-" / "Shirt", which is the
           first thing you notice on the card. Built from text nodes rather
           than innerHTML so a product name can never inject markup. */
        p.name.split(/(\s+)/).forEach(function (chunk) {
            if (/^\s+$/.test(chunk)) {
                name.appendChild(document.createTextNode(chunk));
            } else if (chunk) {
                var w = el('span', 'nowrap');
                w.textContent = chunk;
                name.appendChild(w);
            }
        });
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

        /* SIZES — informational only. The real choice is a required
           dropdown inside Stripe, so these are chips, not controls. */
        var action = buildAction(p, buyable, soldOut);
        if (p.sizes && p.sizes.length) {
            body.appendChild(buildSizeList(p, buyable, function (sz) {
                if (action.__pick) action.__pick(sz);
            }));
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

        body.appendChild(action);
        card.appendChild(body);
        return card;
    }

    /* ---- size list ---------------------------------------------------
       Information, not a control. Selection happens in Stripe's required
       dropdown, so these chips only tell the buyer what exists. A size
       flagged soldout is struck through here — but see the console warning:
       that does NOT remove it from the Stripe dropdown.               */
    function buildSizeList(p, buyable, onPick) {
        var wrap = el('div', 'merch-card-sizewrap');
        var label = el('span', 'merch-size-label');
        label.textContent = buyable ? 'Choose your size' : 'Sizes';
        var row = el('div', 'merch-card-sizes');
        row.setAttribute('role', 'radiogroup');
        row.setAttribute('aria-label', 'Size');

        var chips = [];
        p.sizes.forEach(function (sz) {
            var live = !!linkFor(sz);
            /* A sold-out size is a SPAN, not a button: there is nothing to
               press, nothing focusable, and no way to reach a checkout. */
            var chip = el(live ? 'button' : 'span', 'merch-size');
            chip.textContent = sz.label;

            if (!live) {
                chip.classList.add('is-unavailable');
                chip.title = sz.soldout ? 'Sold out' : 'Not available';
                chip.setAttribute('aria-label', sz.label + ' — sold out');
                chip.setAttribute('aria-disabled', 'true');
            } else {
                chip.type = 'button';
                chip.classList.add('merch-size--pick');
                chip.setAttribute('role', 'radio');
                chip.setAttribute('aria-checked', 'false');
                chip.addEventListener('click', function () {
                    chips.forEach(function (c) {
                        c.classList.remove('is-selected');
                        c.setAttribute('aria-checked', 'false');
                    });
                    chip.classList.add('is-selected');
                    chip.setAttribute('aria-checked', 'true');
                    onPick(sz);
                });
                chips.push(chip);
            }
            row.appendChild(chip);
        });

        wrap.appendChild(label);
        wrap.appendChild(row);
        return wrap;
    }

    /* ---- buy button --------------------------------------------------
       Starts inert and only becomes a real link once a size is chosen, so
       there is no path to checkout without one. Each size carries its own
       capped Stripe link; when that size sells out Stripe deactivates the
       link and the chip here goes grey and unclickable.                  */
    function buildAction(p, buyable, soldOut) {
        var a = document.createElement('a');
        a.className = 'btn btn--primary merch-btn is-disabled';
        a.setAttribute('role', 'button');
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('data-magnetic', '');
        a.setAttribute('data-ripple', '');

        function setLabel(t) { a.innerHTML = '<span>' + t + '</span>'; }

        if (!buyable) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.disabled = true;
            btn.className = 'btn btn--ghost merch-btn is-disabled';
            btn.innerHTML = '<span>' + (soldOut ? 'Sold Out' : 'Dropping Soon') + '</span>';
            return btn;
        }

        setLabel('Select a size');

        a.addEventListener('click', function (e) {
            if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
            if (isProd && typeof window.gtag === 'function') {
                window.gtag('event', 'begin_checkout', {
                    currency: cfg.currency, value: p.price,
                    items: [{ item_id: p.id + '-' + (a.dataset.size || ''),
                              item_name: p.name, price: p.price }]
                });
            }
        });

        a.__pick = function (sz) {
            var link = linkFor(sz);
            if (!link) return;
            a.href = link;
            a.target = '_blank';
            a.rel = 'noopener';
            a.dataset.size = sz.label;
            a.removeAttribute('aria-disabled');
            a.classList.remove('is-disabled');
            setLabel('Buy ' + sz.label + ' — ' + cfg.currencySymbol + formatPrice(p.price));
        };
        return a;
    }

    /* ---------------- helpers ---------------- */

    /* setAttribute rather than the property, so the hint is present in the
       markup itself — some browsers only honour it as an attribute, and it
       makes the behaviour visible to anything inspecting the DOM. */
    /* ---------------- media gallery ----------------

       Fills `media` with every slide and returns the thumbnail rail (or null
       when there's nothing to switch between). Falls back to the old
       image/imageAlt pair so an older config still renders.

       Three things this has to get right:
       - A video that autoplays must be muted and playsinline, or iOS refuses
         and you get a black rectangle.
       - It must stop when it's not on screen. A looping video decoding
         forever in a background tab is a battery complaint, not a feature.
       - prefers-reduced-motion means the poster, not the loop. Spinning
         merch is exactly the kind of motion that setting exists for. */

    function buildGallery(p, media) {
        var items = p.media && p.media.length ? p.media : null;

        if (!items) {
            /* legacy shape */
            if (!p.image) { media.classList.add('is-empty'); return null; }
            items = [{ type: 'image', src: p.image, alt: p.name, label: 'Front' }];
            if (p.imageAlt) items.push({ type: 'image', src: p.imageAlt, alt: '', label: 'Back' });
        }

        var reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var slides = [];
        var videos = [];
        var failures = 0;

        items.forEach(function (item, i) {
            var node;
            if (item.type === 'video' && !reduceMotion) {
                node = mkVideo(item, i === 0);
                videos.push(node);
                /* A <video> with a <source> child reports failure on the
                   source, not always on the video, so listen to both — this
                   is what keeps a dead mp4 counting toward the placeholder
                   instead of silently leaving a black rectangle. */
                node.addEventListener('error', onFail);
                node.querySelector('source').addEventListener('error', onFail);
            } else if (item.type === 'video') {
                /* reduced motion: the poster stands in for the loop */
                node = mkImg(item.poster || item.src, item.alt || '', 'merch-card-img', onFail);
            } else {
                node = mkImg(item.src, item.alt || '', 'merch-card-img', onFail);
            }
            node.classList.add('merch-slide');
            if (i === 0) node.classList.add('is-active');
            media.appendChild(node);
            slides.push(node);
        });

        function onFail() {
            /* Only claim "Artwork coming" once every slide has failed —
               one missing file shouldn't blank a gallery that still works. */
            failures++;
            if (failures >= items.length) media.classList.add('is-empty');
        }

        pauseOffscreen(videos, media);

        if (slides.length < 2) return null;

        var rail = el('div', 'merch-thumbs');
        rail.setAttribute('role', 'tablist');
        rail.setAttribute('aria-label', 'Product views');

        var thumbs = items.map(function (item, i) {
            var t = el('button', 'merch-thumb' + (i === 0 ? ' is-active' : ''));
            t.type = 'button';
            t.setAttribute('role', 'tab');
            t.setAttribute('aria-selected', i === 0 ? 'true' : 'false');

            var timg = document.createElement('img');
            timg.src = item.type === 'video' ? (item.poster || item.src) : item.src;
            timg.alt = '';
            timg.setAttribute('loading', 'lazy');
            timg.setAttribute('decoding', 'async');
            t.appendChild(timg);

            var cap = el('span', 'merch-thumb-label');
            cap.textContent = item.label || String(i + 1);
            t.appendChild(cap);

            /* The label is decorative; the button needs a real name. */
            t.setAttribute('aria-label', 'View ' + (item.label || 'image ' + (i + 1)));

            t.addEventListener('click', function () { show(i); });
            rail.appendChild(t);
            return t;
        });

        function show(idx) {
            slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
            thumbs.forEach(function (t, i) {
                t.classList.toggle('is-active', i === idx);
                t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
            });
            /* Only the visible video should be decoding. */
            videos.forEach(function (v) {
                if (v.classList.contains('is-active')) safePlay(v);
                else safePause(v);
            });
        }

        /* Arrow keys move between views, as a tablist should. */
        rail.addEventListener('keydown', function (e) {
            var i = thumbs.indexOf(document.activeElement);
            if (i === -1) return;
            var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
            if (next === -1) return;
            e.preventDefault();
            next = (next + thumbs.length) % thumbs.length;
            thumbs[next].focus();
            show(next);
        });

        return rail;
    }

    function mkVideo(item, eager) {
        var v = document.createElement('video');
        v.muted = true;               /* property, not just the attribute — */
        v.setAttribute('muted', '');  /* Safari checks the property on play() */
        v.loop = true;
        v.autoplay = true;
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.setAttribute('aria-label', item.alt || '');
        /* Below the fold on the homepage, so don't spend the bandwidth until
           it's wanted. pauseOffscreen upgrades this when it scrolls in. */
        v.preload = eager ? 'metadata' : 'none';
        if (item.poster) v.poster = item.poster;
        v.className = 'merch-card-img merch-card-video';

        var s = document.createElement('source');
        s.src = item.src;
        s.type = 'video/mp4';
        v.appendChild(s);
        return v;
    }

    function safePlay(v) {
        /* play() rejects if the browser declines autoplay OR if it's simply
           called before there are enough frames decoded — which is the normal
           case, since the observer fires the instant the card scrolls in and
           preload is deliberately light.

           Swallowing that rejection and stopping is what left the 360 frozen
           on its poster: one early rejection and nothing ever tried again.
           So mark intent, and retry once the media says it can play. */
        v.__wantsPlay = true;
        var r = v.play();
        if (r && typeof r.catch === 'function') {
            r.catch(function () {
                if (!v.__retryBound) {
                    v.__retryBound = true;
                    v.addEventListener('canplay', function () {
                        /* Only if it's still wanted — the viewer may have
                           switched slides or scrolled away in the meantime. */
                        if (v.__wantsPlay && v.classList.contains('is-active')) {
                            var r2 = v.play();
                            if (r2 && typeof r2.catch === 'function') r2.catch(function () {});
                        }
                    });
                }
            });
        }
    }

    function safePause(v) {
        v.__wantsPlay = false;
        v.pause();
    }

    function pauseOffscreen(videos, media) {
        if (!videos.length) return;
        if (!('IntersectionObserver' in window)) {
            videos.forEach(function (v) { if (v.classList.contains('is-active')) safePlay(v); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                videos.forEach(function (v) {
                    if (en.isIntersecting && v.classList.contains('is-active')) {
                        /* Upgrade preload once it's actually wanted — 'metadata'
                           is often too little for play() to succeed first try. */
                        if (v.preload !== 'auto') v.preload = 'auto';
                        safePlay(v);
                    } else {
                        safePause(v);
                    }
                });
            });
        }, { threshold: 0.15 });
        io.observe(media);
    }

    function mkImg(src, alt, cls, onFail) {
        var img = document.createElement('img');
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        img.alt = alt || '';
        img.className = cls;
        img.addEventListener('error', function () {
            img.remove();
            if (onFail) onFail();
        });
        /* src last: setting it starts the fetch, so the hints above must
           already be in place or the browser ignores them. */
        img.src = src;
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
