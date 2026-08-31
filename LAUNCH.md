# Launch Runbook

The whole merch build lives on the **`merch-drop`** branch. `main` is untouched, so ajvitanza.com looks exactly as it does today until you decide otherwise.

Launch is one merge.

---

## How this is wired

**Hosting is Vercel** (project `aj-vitanza-site`, team Desca), deploying from `ldescause/aj-vitanza-site`.

```
main branch  ──────────────►  ajvitanza.com                    (unchanged, no merch)
merch-drop branch  ────────►  aj-vitanza-site-git-merch-drop-desca.vercel.app
                                                               (full merch, test mode)
```

The site detects which one it's running on by hostname and behaves differently:

| | Staging URL | ajvitanza.com |
|---|---|---|
| Stripe link used | `linkTest` — fake cards | `link` — real money |
| Orange staging bar | Yes | Never |
| `?phase=` URL override | Works | Ignored |
| Search engine indexing | Blocked | Normal |
| Google Analytics checkout events | Suppressed | Sent |

That switch is automatic. There is no step where you swap test links for live ones by hand — which is exactly the step that goes wrong at 1am on launch day.

---

## Step 1 — Staging — ✅ AUTOMATIC

Nothing to configure. Vercel builds a preview for **every branch on every push**, so any push to `merch-drop` produces a staging URL:

```
https://aj-vitanza-site-git-merch-drop-desca.vercel.app
```

Every individual commit also gets its own permanent URL, so you can always go back and look at an earlier state.

> ⚠️ **Do not delete the Netlify account or the `ajvitanza.com` DNS zone.**
> Hosting moved to Vercel, but **Netlify is still the authoritative nameserver** for the domain — the registrar points at `dns1–4.p03.nsone.net`. The two DNS records inside that zone now point at Vercel. Delete the zone and the domain stops resolving entirely.
>
> The Netlify *site* (`lucent-fudge-f77356`) is now unused and safe to delete. The **DNS zone is not.**
> To fully cut ties with Netlify later, move the nameservers to another DNS provider first, then delete the zone.

---

## Step 2 — Build everything on the branch — ✅ DONE

```bash
git checkout merch-drop
```

Work here. Every push auto-deploys to the staging URL. `main` never moves.

**Stripe** → ✅ Built. One product and **one payment link capped at 50**, in both test and live mode, with a required Size dropdown (XS/S/M/L/XL), three shipping rates, 16 countries, phone + address collected, redirect to `/thanks.html`. The ten earlier per-size links are deactivated. Details in `MERCH-SETUP.md`.

**Config** → ✅ Done. Both links pasted into `merch.js`, live and test.

**Photos** → ✅ Done. The card carries a three-view gallery: the 360° rotation loops silently by default, with Front and Back stills behind thumbnails. All three are cut from the same video so the lighting and black backdrop match exactly — read `images/merch/README.txt` before replacing any of them. The signed graphic card stays a text callout — not photographed, by choice.

> ⚠️ **The shirt is WHITE.** The listing read "Heavyweight cotton — Black" for several drafts. Every render supplied is white/off-white, so it now says White. Confirm the real colourway before taking money — this is the kind of error that becomes 50 refund requests.

**Seller's permit** → ⬜ AJ to register with CDTFA (free, online). Until then Stripe Tax is dormant — collects nothing, costs nothing.

> **If you ever rebuild the link:** Stripe's `...` menu on a test-mode payment link has **"Copy to livemode"**, which brings the product, cap, Size dropdown, shipping rates, countries and redirect across in one click. That's how the live one was built. Don't run it twice — you'd get two live links, and only one of them counts toward the 50.

---

## Step 3 — Test on the staging URL

Because staging uses test-mode links, you can run the full checkout — size dropdown, shipping address, payment, redirect — as many times as you like, for free.

**Stripe's test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any postcode.

Use the phase buttons in the orange staging bar to preview every state without editing files.

### Test checklist

**Every phase renders** — click through `teaser`, `presale`, `live`, `soldout` in the staging bar
- [ ] Teaser: sizes are plain text, button dead, says "Dropping Soon"
- [ ] Presale: counter shows, bar fills, button says "Reserve Yours"
- [ ] Live: button says "Buy Now"
- [ ] Sold out: everything greyed, badge reads "Sold Out", shipping note gone
- [ ] Signed-card callout appears in `presale` only — not in teaser, live, or soldout

**The buy button and sizes**
- [ ] One button; size chips are information only (selection happens in Stripe)
- [ ] Button opens the capped link
- [ ] The Stripe page shows a required **Size** dropdown: XS, S, M, L, XL
- [ ] Setting a size's `soldout: true` strikes it through on the card — and the console warns that Stripe still offers it
- [ ] Setting all five `soldout: true` flips the card to "Sold Out", not "Dropping Soon"

**A full test purchase**
- [ ] Buy button opens the Stripe checkout
- [ ] Shipping address form appears
- [ ] All shipping rates listed with clear names; no pickup option
- [ ] Test card completes payment
- [ ] Redirects to `/thanks.html`
- [ ] Receipt email arrives
- [ ] Order appears in the Stripe dashboard with size + address
- [ ] **Find where the size actually lands** in the Payments CSV export — it's a custom field, not part of the product name. Note the column name now; you'll be sorting on it to pack 50 boxes

**The cap actually works** — this is the one that costs real money if it's wrong
- [ ] Temporarily set the test link's payment limit to 1
- [ ] Buy it once, then reload — the link should be dead
- [ ] Reset the limit to 50
- [ ] Confirm the **live** link reads `0 of 50 used`
- [ ] Confirm adjustable quantity is OFF
- [ ] Confirm the ten old per-size links are Deactivated in both modes

**Presentation**
- [ ] Check on a real phone, not a narrow browser window
- [ ] All photos load; no dashed "Artwork coming" placeholders left
- [ ] Prices match what you're actually charging
- [ ] Nav "Merch" link scrolls to the section
- [ ] Nav "Music" scrolls to **Elsewhere** — the EP, the DSP links and the videos are one section now, below the merch
- [ ] Browser console clean (merch.js warns loudly about config problems)
- [ ] Paste the page into Google's Rich Results Test. It should find a **Product** with price 50.00 and an availability that matches the phase you're in — `merch.js` writes those from `MERCH_CONFIG`, so a mismatch means something is wrong, not that the schema needs hand-editing

**Prove the environment switch**
- [ ] Staging bar visible on staging
- [ ] Buy buttons show a small "test" pill on staging
- [ ] Console logs `STAGING`, not `PRODUCTION`

---

## Step 4 — Ship it

Set the launch phase in `merch.js` (`'presale'` for the drop), commit, then:

```bash
git checkout main
git merge merch-drop
git push
```

Vercel builds `main` → live on ajvitanza.com in well under a minute.

The moment it's on the real domain, the site flips itself: live Stripe links, no staging bar, analytics on, indexable. Nothing to remember.

### Immediately after merging

- [ ] Load ajvitanza.com — **no orange bar** (if you see one, `productionHosts` is wrong)
- [ ] The button points at `buy.stripe.com/...` with **no** `test_` in the URL
- [ ] Browser console clean — it warns if the link is missing or still in test mode
- [ ] One real purchase with a real card, then refund it in Stripe
- [ ] `ajvitanza.com/merch` redirects correctly — this is the link you'll share

---

## The countdown

Off by default, because it needs a real date. Turn it on in `merch.js`:

```js
countdown: {
    enabled: true,
    showDate: '2026-09-12T20:00:00-04:00',
    labelBefore: 'Presale closes when doors open',
    labelAfter: 'Doors are open — merch table only',
    venue: 'Brooklyn Made · Brooklyn, NY'
}
```

**The timezone offset is not optional.** `-04:00` is US Eastern in summer, `-05:00` in winter; Central is `-05:00`/`-06:00`, Pacific `-07:00`/`-08:00`. Without it, browsers interpret the time in the *viewer's* timezone, so someone in California sees a clock three hours off. A bad date silently misleads people about when they can still order — which is worse than having no clock at all.

Behaviour:

- Shows only in the `teaser` and `presale` phases
- Under 48 hours it turns amber
- Past the date it freezes at zero and swaps to `labelAfter`
- An unparseable date hides the clock and logs a console warning rather than rendering `NaN`

The stock counter escalates the same way — at or below `presale.urgentBelow` (set to 12 for this drop) the number turns amber and the label changes to "Almost gone."

One caution: the countdown says the presale closes at doors, so make sure it actually does. If the clock hits zero and people can still order online, or if it's still counting after you've closed the presale, the urgency reads as theatre. Deactivating the payment links in Stripe at showtime keeps the two honest.

---

## Running the drop

Edit `merch.js` on `main`, commit, push. `merch.js` is set to never cache, so changes land on the next page load.

| Situation | Change |
|---|---|
| Sales coming in | Update `presale.unitsRemaining` |
| Under 12 left | Nothing — the counter goes amber on its own |
| A size runs out | Set that size's `soldout: true` **and remove it from the Size dropdown in Stripe.** The site strikes it through; Stripe keeps offering it until you delete the option. Doing only the first half means you keep taking orders you can't fill — the console warns you about exactly this |
| All 50 presale gone | `phase: 'soldout'` |
| Selling the remaining 144 online later | `phase: 'live'`, new links with new caps, `soldout: false`, drop the bonus |
| Something's wrong | `enabled: false` — section and nav link vanish |

---

## If something breaks mid-drop

**Pull the section immediately:** set `enabled: false` in `merch.js`, push. Under a minute.

**Stop sales but keep the page:** deactivate the payment links in the Stripe dashboard — instant, no deploy needed. Buttons stay but checkout refuses. This is the fastest lever you have.

**Roll back the whole site:** Vercel → Deployments → find the last good one → *Promote to Production*. Instant, no git.

---

## Things to decide before you open

**The 50/144 split is enforced in two different places, and only one is real.** The payment cap on the Stripe link is what actually stops sales at 50. The number on the website is a manually-updated marketing display. Don't let them drift so far apart that the site says "31 left" when Stripe has already closed the link.

**Payments vs. shirts.** Stripe's cap counts payments. Leave adjustable quantity off and the two are the same thing. Turn it on and one order can take three shirts while using one payment slot, and you'll oversell into the stock you meant to keep for the show.

**Nothing stops a single size from selling out.** This is the sharpest edge in the current setup. There is one link with one cap of 50, and the size is a dropdown *inside* it — so all 50 could be Medium. You have 62 Mediums, so that particular case is survivable, but XS (10) and XL (14) are not: 15 people picking XL is an oversell you find out about after the fact.

Watch the size split in the Stripe dashboard as orders come in. When a size gets close to its real stock, **delete that option from the dropdown in Stripe** — that is the only thing that actually stops it. Setting `soldout: true` in `merch.js` updates the website's appearance and nothing else.

**The site can only ever be a mirror, never a lock.** Every stock number and struck-through size on the page is something you typed. The two systems that hold real inventory are Stripe (what people can order) and the garage (what exists). The website agrees with them only as often as you make it.

**Don't forget the cards.** The signed graphic card isn't tracked anywhere in Stripe — it's a promise made on the website. Sign 50 and put them somewhere you won't forget when you're packing. It's the entire reason someone buys now instead of at the show, so a missing card is a broken promise, not a minor omission.

**If you oversell anyway:** decide now whether you refund or fulfil late from the show stock. Easier to choose while nothing's on fire.
