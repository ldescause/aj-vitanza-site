# Launch Runbook

The whole merch build lives on the **`merch-drop`** branch. `main` is untouched, so ajvitanza.com looks exactly as it does today until you decide otherwise.

Launch is one merge.

---

## How this is wired

```
main branch  ──────────────►  ajvitanza.com          (unchanged, no merch)
merch-drop branch  ────────►  merch-drop--<site>.netlify.app   (full merch, test mode)
```

The site detects which one it's running on by hostname and behaves differently:

| | Staging URL | ajvitanza.com |
|---|---|---|
| Stripe links used | `stripeLinkTest` — fake cards | `stripeLink` — real money |
| Orange staging bar | Yes | Never |
| `?phase=` URL override | Works | Ignored |
| Search engine indexing | Blocked | Normal |
| Google Analytics checkout events | Suppressed | Sent |

That switch is automatic. There is no step where you swap test links for live ones by hand — which is exactly the step that goes wrong at 1am on launch day.

---

## Step 1 — Turn on branch deploys (once)

Netlify dashboard → **Site configuration → Build & deploy → Branch deploys**
→ *Let me add individual branches* → add `merch-drop`

You'll get a URL like `https://merch-drop--ajvitanza.netlify.app`. That's your staging site. Bookmark it.

---

## Step 2 — Build everything on the branch

```bash
git checkout merch-drop
```

Work here. Every push auto-deploys to the staging URL. `main` never moves.

**Photos** → `images/merch/` as `tee-front.jpg` and `tee-back.jpg` (square, ~1200×1200, 200–400KB, dark backgrounds). Worth shooting the signed card next to the shirt — right now it is described but never shown.

**Stripe** → follow `MERCH-SETUP.md`. Create the shirt **twice**: once in test mode, once in live mode. Stripe has a Test/Live toggle in the dashboard; the two are entirely separate worlds with separate links.

**Config** → in `merch.js`, fill both link fields:

```js
stripeLink:     'https://buy.stripe.com/aEU7sK...',        // live
stripeLinkTest: 'https://buy.stripe.com/test_aEU7sK...',   // test
```

---

## Step 3 — Test on the staging URL

Because staging uses test-mode links, you can run the full checkout — size dropdown, shipping address, payment, redirect — as many times as you like, for free.

**Stripe's test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any postcode.

Use the phase buttons in the orange staging bar to preview every state without editing files.

### Test checklist

**Every phase renders** — click through `teaser`, `presale`, `live`, `soldout` in the staging bar
- [ ] Teaser: buttons dead, say "Dropping Soon"
- [ ] Presale: counter shows, bar fills, buttons say "Reserve Yours"
- [ ] Live: buttons say "Buy Now"
- [ ] Sold out: everything greyed, badge reads "Sold Out", shipping note gone
- [ ] Signed-card callout appears in `presale` only — not in teaser, live, or soldout

**A full test purchase**
- [ ] Buy button opens Stripe checkout
- [ ] Size dropdown appears and is required
- [ ] Shipping address form appears
- [ ] All shipping rates listed with clear names
- [ ] Test card completes payment
- [ ] Redirects to `/thanks.html`
- [ ] Receipt email arrives, **shows the selected size**
- [ ] Order appears in the Stripe dashboard with size + address

**The cap actually works** — this is the one that costs real money if it's wrong
- [ ] Temporarily set a test link's payment limit to 1
- [ ] Buy it once, then reload — link should be dead
- [ ] Reset the limit
- [ ] Confirm the **live** link is capped at 50

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

Netlify builds `main` → live on ajvitanza.com in about a minute.

The moment it's on the real domain, the site flips itself: live Stripe links, no staging bar, analytics on, indexable. Nothing to remember.

### Immediately after merging

- [ ] Load ajvitanza.com — **no orange bar** (if you see one, `productionHosts` is wrong)
- [ ] Buy button points at `buy.stripe.com/...` with **no** `test_` in the URL
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
| All 50 presale gone | `phase: 'soldout'` |
| Selling the remaining 150 online later | `phase: 'live'`, new uncapped Stripe link, drop the bonus |
| Something's wrong | `enabled: false` — section and nav link vanish |

---

## If something breaks mid-drop

**Pull the section immediately:** set `enabled: false` in `merch.js`, push. Under a minute.

**Stop sales but keep the page:** deactivate the payment links in the Stripe dashboard — instant, no deploy needed. Buttons stay but checkout refuses. This is the fastest lever you have.

**Roll back the whole site:** Netlify → Deploys → find the last good one → *Publish deploy*. Instant, no git.

---

## Things to decide before you open

**The 50/150 split is enforced in two different places, and only one is real.** Stripe's payment limit on the link is what actually stops sales at 50. The number on the website is a manually-updated marketing display. Don't let them drift so far apart that the site says "31 left" when Stripe has already closed.

**Payments vs. shirts.** Stripe's cap counts payments. Leave adjustable quantity off and the two are the same thing — 50 payments, 50 shirts. Turn it on and one order can take three shirts while using one payment slot, and you'll oversell into the 150 you meant to keep for the show.

**Pickup at the show.** Free and unrestricted, so anyone can pick it — including someone three states away. Fine if your presale crowd is local; if not, rename it `Pickup at the show — [City] [Date] ONLY` or drop it.

**Don't forget the cards.** The signed graphic card isn't tracked anywhere in Stripe — it's a promise made on the website. Sign 50 and put them somewhere you won't forget when you're packing. It's the entire reason someone buys now instead of at the show, so a missing card is a broken promise, not a minor omission.

**If you oversell anyway:** decide now whether you refund or fulfil late from the show stock. Easier to choose while nothing's on fire.
