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
| Stripe links used | each size's `linkTest` — fake cards | each size's `link` — real money |
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

**Stripe** → ✅ Built. Five products and five payment links in **both** test and live mode, caps XS 3 / S 17 / M 16 / L 11 / XL 3, three shipping rates, 16 countries, phone + address collected, redirect to `/thanks.html`. Full inventory in `MERCH-SETUP.md`.

**Config** → ✅ Done. All ten links are pasted into `merch.js`, live and test, verified distinct.

**Photos** → ⬜ Still needed. `images/merch/` as `tee-front.jpg` and `tee-back.jpg` (square, ~1200×1200, 200–400KB, dark backgrounds). The files there now are placeholders. Worth shooting the signed card next to the shirt — right now it's described but never shown.

**Seller's permit** → ⬜ AJ to register with CDTFA (free, online). Until then Stripe Tax is dormant — collects nothing, costs nothing.

> **If you ever rebuild a link:** Stripe's `...` menu on a test-mode payment link has **"Copy to livemode"**, which brings the product, cap, shipping rates, countries and redirect across in one click. That's how the live set was built. Don't run it twice on the same link — you'll get two live links for one size, which is the exact failure the console warns about.

---

## Step 3 — Test on the staging URL

Because staging uses test-mode links, you can run the full checkout — size dropdown, shipping address, payment, redirect — as many times as you like, for free.

**Stripe's test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any postcode.

Use the phase buttons in the orange staging bar to preview every state without editing files.

### Test checklist

**Every phase renders** — click through `teaser`, `presale`, `live`, `soldout` in the staging bar
- [ ] Teaser: sizes are plain text, button dead, says "Dropping Soon"
- [ ] Presale: counter shows, bar fills, sizes are clickable, button says "Select a size" until you pick one
- [ ] Live: button says "Buy Now — [size]" once a size is picked
- [ ] Sold out: everything greyed, badge reads "Sold Out", shipping note gone
- [ ] Signed-card callout appears in `presale` only — not in teaser, live, or soldout

**The size picker**
- [ ] Clicking a size highlights it and only it
- [ ] Button text updates to name the chosen size
- [ ] Clicking the button before choosing a size does nothing
- [ ] **Each size opens a different Stripe checkout** — click all five, confirm five distinct URLs. Two sizes sharing a link is the failure that silently oversells one and starves the other
- [ ] Setting a size's `soldout: true` strikes it through and makes it unclickable
- [ ] Setting all five `soldout: true` flips the card to "Sold Out", not "Dropping Soon"

**A full test purchase**
- [ ] Buy button opens Stripe checkout **for the size you picked**
- [ ] Shipping address form appears
- [ ] All shipping rates listed with clear names; no pickup option
- [ ] Test card completes payment
- [ ] Redirects to `/thanks.html`
- [ ] Receipt email arrives and **names the size in the product line**
- [ ] Order appears in the Stripe dashboard with size + address

**The caps actually work** — this is the one that costs real money if it's wrong
- [ ] Temporarily set a test link's payment limit to 1
- [ ] Buy it once, then reload — that size should be dead, the others still fine
- [ ] Reset the limit
- [ ] Confirm the **live** caps read 3 / 17 / 16 / 11 / 3
- [ ] Confirm adjustable quantity is OFF on all five live links

**Presentation**
- [ ] Check on a real phone, not a narrow browser window
- [ ] All photos load; no dashed "Artwork coming" placeholders left
- [ ] Prices match what you're actually charging
- [ ] Nav "Merch" link scrolls to the section
- [ ] Browser console clean (merch.js warns loudly about config problems)

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
- [ ] Pick a size — the button points at `buy.stripe.com/...` with **no** `test_` in the URL
- [ ] Browser console clean — it names any size whose link is missing, duplicated, or still in test mode
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
| A size hits its cap | Set that size's `soldout: true` — Stripe already stopped it, this just makes the site say so |
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

**The 50/144 split is enforced in two different places, and only one is real.** The five payment caps in Stripe are what actually stop sales. The number on the website is a manually-updated marketing display. Don't let them drift so far apart that the site says "31 left" when Stripe has already closed every size.

**Payments vs. shirts.** Stripe's cap counts payments. Leave adjustable quantity off and the two are the same thing. Turn it on and one order can take three shirts while using one payment slot, and you'll oversell into the stock you meant to keep for the show.

**The thin sizes are the fragile ones.** XS is 10 units total and XL is 14 — a presale cap of 3 each leaves a real reserve for the merch table, but there's no slack if you decide to bump them. Whatever you change, change it in Stripe *and* in `merch.js`; the console warns when the five caps stop adding up to 50.

**Five links look identical.** `buy.stripe.com/aEU7sK...` differs from `buy.stripe.com/aEU8tL...` by a few characters. Pasting the same one under two sizes means one size eats the other's cap and the second never sells — and both send buyers the wrong shirt. The console catches it; look at it before you merge.

**Don't forget the cards.** The signed graphic card isn't tracked anywhere in Stripe — it's a promise made on the website. Sign 50 and put them somewhere you won't forget when you're packing. It's the entire reason someone buys now instead of at the show, so a missing card is a broken promise, not a minor omission.

**If you oversell anyway:** decide now whether you refund or fulfil late from the show stock. Easier to choose while nothing's on fire.
