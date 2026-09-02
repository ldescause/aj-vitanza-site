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
    phase: 'soldout',

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
            eyebrow: 'Presale Closed',
            blurb: 'The presale is closed — every order is being packed now and ships with a graphic card signed by AJ. The rest of the run is at the merch table tonight, first come, first served.'
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
        soldout: { eyebrow: 'Presale Closed — See You At The Show', sub: 'AJ VITANZA DEBUT TEE', cta: 'See The Merch' }
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
    products: [
        {
            id: 'tee',
            name: 'AJ Vitanza Debut T-Shirt',
            /* NOTE: every render supplied shows a WHITE / off-white shirt.
               This previously read "Black", which would have been the first
               thing a buyer noticed was wrong. Confirm the real colourway. */
            subtitle: 'Heavyweight cotton — White',
            price: 50,

            /* ---- media ----
               `media` is the gallery, shown in order. Types:
                 video — loops silently, pauses when scrolled out of view
                 image — a still
               The first entry is what loads first, so keep the video there
               only while it stays small; it is 170KB today.

               All three assets are the same render on the same black
               backdrop (the stills are frames 0 and 75 of the video), which
               is why switching between them doesn't jump. If you replace one,
               replace all three or the set stops matching. */
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

            /* Kept so an older cached merch.js still renders something, and
               so the structured data has a stable image. */
            image: 'images/merch/tee-front.jpg',
            imageAlt: 'images/merch/tee-back.jpg',
            /* The one capped link. Size is a required dropdown inside it. */
            link:     'https://buy.stripe.com/00wfZjc2e6bO4BSagudfG05',
            linkTest: 'https://buy.stripe.com/test_00wfZjc2e6bO4BSagudfG05',

            sizes: [
                { label: 'XS', stock: 10, soldout: false },
                { label: 'S',  stock: 65, soldout: false },
                { label: 'M',  stock: 62, soldout: false },
                { label: 'L',  stock: 43, soldout: false },
                { label: 'XL', stock: 14, soldout: false }
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
    function linkFor(p) {
        if (!isProd) return p.linkTest || null;

        /* Hard guard: never send a real customer to a test-mode checkout.
           If a test link ends up in the live slot, the button goes dead
           rather than silently taking fake orders. */
        if (p.link && /\/test_/.test(p.link)) return null;
        return p.link || null;
    }

    var warnings = [];
    var expectsLinks = phase !== 'teaser' && phase !== 'soldout';
    cfg.products.forEach(function (p) {
        if (isProd) {
            if (p.link && /\/test_/.test(p.link)) {
                warnings.push(p.id + ': link is a TEST link — BLOCKED on production. ' +
                    'Replace it with the live-mode link.');
            }
            if (!p.link && expectsLinks) {
                warnings.push(p.id + ': no live link — the button will say "Dropping Soon".');
            }
        } else if (!p.linkTest && expectsLinks) {
            warnings.push(p.id + ': no linkTest — cannot test checkout on staging.');
        }

        /* The presale is capped in Stripe at one number. If the counter on
           the site claims something different, one of them is lying to the
           buyer — and it's usually this file, edited and forgotten. */
        if (phase === 'presale' && cfg.presale.showCounter &&
            cfg.presale.unitsRemaining > cfg.presale.totalUnits) {
            warnings.push('presale.unitsRemaining (' + cfg.presale.unitsRemaining +
                ') is greater than totalUnits (' + cfg.presale.totalUnits + ').');
        }

        /* Sizes are informational now — selection happens in Stripe. Marking
           one sold out here does NOT remove it from the Stripe dropdown. */
        var gone = (p.sizes || []).filter(function (s) { return s.soldout; });
        if (gone.length && expectsLinks) {
            warnings.push(p.id + ': ' + gone.map(function (s) { return s.label; }).join(', ') +
                ' marked sold out on the site, but the Stripe dropdown still offers ' +
                'every size. Remove the option in Stripe too, or you will take orders ' +
                'you cannot fill.');
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
        var link = linkFor(p);
        var buyable = phase !== 'teaser' && !soldOut && !!link;

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
        if (p.sizes && p.sizes.length) {
            body.appendChild(buildSizeList(p, buyable));
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

        body.appendChild(buildAction(p, link, buyable, soldOut));
        card.appendChild(body);
        return card;
    }

    /* ---- size list ---------------------------------------------------
       Information, not a control. Selection happens in Stripe's required
       dropdown, so these chips only tell the buyer what exists. A size
       flagged soldout is struck through here — but see the console warning:
       that does NOT remove it from the Stripe dropdown.               */
    function buildSizeList(p, buyable) {
        var wrap = el('div', 'merch-card-sizewrap');
        var label = el('span', 'merch-size-label');
        label.textContent = buyable ? 'Sizes — choose yours at checkout' : 'Sizes';
        var row = el('div', 'merch-card-sizes');

        p.sizes.forEach(function (sz) {
            var chip = el('span', 'merch-size');
            if (sz.soldout) {
                chip.classList.add('is-unavailable');
                chip.title = 'Sold out';
                chip.setAttribute('aria-label', sz.label + ' — sold out');
            }
            chip.textContent = sz.label;
            row.appendChild(chip);
        });

        wrap.appendChild(label);
        wrap.appendChild(row);
        return wrap;
    }

    /* ---- buy button --------------------------------------------------
       One link, capped at 50 in Stripe. When the cap is hit Stripe
       deactivates the link on its own and shows its own "no longer
       available" page — so an unlucky 51st buyer gets a clear message
       rather than a broken checkout.                                   */
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
