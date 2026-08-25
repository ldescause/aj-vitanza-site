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

**Photos** → `images/merch/` (square, ~1200×1200, 200–400KB, dark backgrounds).

**Stripe** → follow `MERCH-SETUP.md`. Create each product **twice**: once in test mode, once in live mode. Stripe has a Test/Live toggle in the dashboard; the two are entirely separate worlds with separate links.

**Config** → in `merch.js`, fill both link fields per product:

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
- [ ] Sold out: everything greyed, badges read "Sold Out", shipping note gone

**A full test purchase, per product**
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
- [ ] Confirm the **live** links have their real caps set

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
- [ ] Buy buttons point at `buy.stripe.com/...` with **no** `test_` in the URL
- [ ] One real purchase with a real card, then refund it in Stripe
- [ ] `ajvitanza.com/merch` redirects correctly — this is the link you'll share

---

## Running the drop

Edit `merch.js` on `main`, commit, push. `merch.js` is set to never cache, so changes land on the next page load.

| Situation | Change |
|---|---|
| Sales coming in | Update `presale.unitsRemaining` |
| One item gone | That product's `status: 'soldout'` |
| Nearly gone | `status: 'lowstock'` |
| Presale over | `phase: 'soldout'` |
| Public launch | `phase: 'live'`, swap in uncapped links, `status: null` |
| Something's wrong | `enabled: false` — section and nav link vanish |

---

## If something breaks mid-drop

**Pull the section immediately:** set `enabled: false` in `merch.js`, push. Under a minute.

**Stop sales but keep the page:** deactivate the payment links in the Stripe dashboard — instant, no deploy needed. Buttons stay but checkout refuses. This is the fastest lever you have.

**Roll back the whole site:** Netlify → Deploys → find the last good one → *Publish deploy*. Instant, no git.

---

## Two things to decide before you open

**Unit split.** Caps are per payment link, not global. 100 units across three items means deciding the split (50 tees / 30 hoodies / 20 posters) and capping each link separately.

**Pickup at the show.** It's free and anyone can select it, including someone three states away. Fine if your presale crowd is local. If not, either drop the option or rename it `Pickup at the show — [City] [Date] ONLY`.

**On overselling:** Stripe caps each link independently, so it can't oversell a single product. But if you're printing to order or sharing stock between the presale and the merch table, decide now what happens if the numbers don't line up — refund, or fulfil late and eat the shipping.
