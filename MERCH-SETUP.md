# Merch Drop — Setup Runbook

Everything is built. The site currently shows the Merch section in **teaser** mode: real layout, real prices, placeholder artwork, dead buttons that say "Dropping Soon." Nothing can be bought yet.

You only ever edit one file: **`merch.js`**.

---

## How the pieces fit

```
merch.js  ──►  renders the Merch section on the site
   │
   └── stripeLink  ──►  buy.stripe.com/...  (Stripe hosts checkout)
                             │
                             ├── collects size (dropdown)
                             ├── collects shipping address
                             ├── calculates shipping by destination
                             ├── enforces the unit cap, then auto-deactivates
                             │
                             └──►  ajvitanza.com/thanks.html
```

Stripe is the source of truth for money, inventory, and addresses. The site is just the storefront. That means no backend, no database, nothing to break at 2am — and if Stripe hits the cap, the link dies on its own even if you're asleep.

**Cost:** Stripe takes 2.9% + $0.30 per transaction. No monthly fee. On a $35 tee that's about $1.32.

---

## Part 1 — Stripe (do this once per product)

### 1. Create the product

Stripe Dashboard → **Product catalogue** → **Add product**

- Name: `Keep Me High Tee`
- Price: `35.00 USD`, **One-off**
- Upload the product image (Stripe shows it during checkout)

### 2. Create the payment link

Product page → **Create payment link**

### 3. Add the size dropdown

In the payment link editor → **Custom fields** → **Add custom field**

- Type: **Dropdown**
- Label: `Size`
- Options: `S`, `M`, `L`, `XL`, `XXL`
- Mark it **Required**

This is how one link handles all sizes. The chosen size shows on the order in your Stripe dashboard and on the buyer's receipt.

> Skip this step for one-size items like the poster.

### 4. Turn on shipping + set your rates

Same editor → **Shipping address** → toggle on → pick the countries you'll ship to.

Then **Shipping rates** → add one rate per zone:

| Rate name | Price | Delivery estimate |
|---|---|---|
| Pickup at the show | $0.00 | At the venue |
| US Standard | $6.00 | 5–8 business days |
| Canada | $15.00 | 7–14 business days |
| International | $25.00 | 10–21 business days |

**One honest caveat:** Stripe Payment Links show the buyer *all* the rates you've defined and let them choose — they don't auto-detect location and filter the list. So label them unmistakably ("US Standard — United States only") or someone in Toronto will pick the $6 US rate. If a buyer picks wrong, you'll see the mismatch between their address and their chosen rate in the Stripe dashboard and can refund the difference or bill it.

If you outgrow that, the upgrade is a small Netlify serverless function that creates the Checkout Session and filters shipping options by the address in real time. Same design, same page — worth doing for drop #2 if this one moves volume. Not worth the setup for this one.

**On "Pickup at the show":** it's free and unrestricted, so anyone can select it. Fine if presale buyers are mostly local. If not, either drop the option or rename it `Pickup at the show — [City] [Date] ONLY`.

### 5. Set the presale unit cap

Same editor → **Advanced options** → **Limit the number of payments**

Set it to your presale allocation. When it's hit, Stripe deactivates the link automatically and nobody can buy. This is your real inventory guard — the counter on the website is cosmetic.

**Do the math per product, not overall.** If 100 units total across 3 items, decide the split (say 50 tees / 30 hoodies / 20 posters) and cap each link accordingly.

Also enable **Adjustable quantity** with a max of 2–3 if you want to allow multiples but stop resellers clearing you out.

### 6. Set the confirmation page

Same editor → **After payment** → **Redirect to your website**

Paste: `https://ajvitanza.com/thanks.html`

### 7. Copy the link

You'll get something like `https://buy.stripe.com/aEU7sK1234abcd`. Save it — that goes into `merch.js`.

**Repeat 1–7 for each product.**

---

## Part 2 — The website

### 1. Add the photos

Drop them in `images/merch/` with these names:

```
tee-front.jpg      tee-back.jpg
hoodie-front.jpg   hoodie-back.jpg
poster.jpg
```

Square (1:1), around 1200×1200, compressed to 200–400KB. Dark backgrounds blend best with the site. Back images are optional — they cross-fade on hover.

Missing files degrade gracefully to a dashed "Artwork coming" placeholder, so you can deploy in any order.

### 2. Fill in `merch.js`

Open it. Everything you need is in the `MERCH_CONFIG` block at the top.

```js
phase: 'presale',          // was 'teaser'

presale: {
    showCounter: true,
    totalUnits: 100,
    unitsRemaining: 100
},

products: [
    {
        id: 'tee',
        name: 'Keep Me High Tee',
        subtitle: 'Heavyweight cotton — Black',
        price: 35,
        image: 'images/merch/tee-front.jpg',
        imageAlt: 'images/merch/tee-back.jpg',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stripeLink: 'https://buy.stripe.com/aEU7sK1234abcd',   // ← paste here
        status: null,
        badge: 'Presale Exclusive'
    },
    // ...
]
```

Adjust prices, names, and copy to match the actual goods.

### 3. Deploy

```bash
git add .
git commit -m "Add merch presale"
git push
```

Netlify picks it up. `merch.js` and `index.html` are set to never cache, so mid-drop edits go live on the next page load.

---

## Running the drop

| Moment | What to change in `merch.js` |
|---|---|
| Building it out | `phase: 'teaser'` — layout visible, nothing buyable |
| Presale opens | `phase: 'presale'` + paste the Stripe links |
| During the presale | Update `unitsRemaining` as sales come in (Stripe dashboard shows the count) |
| One item runs out | Set that product's `status: 'soldout'` |
| Getting close | Set `status: 'lowstock'` for urgency |
| Presale over | `phase: 'soldout'` — points people to the show |
| Public launch | `phase: 'live'`, fresh Stripe links with no cap, `status: null` |
| Emergency kill | `enabled: false` — section and nav link vanish entirely |

The counter is manual on purpose. Stripe is what actually stops sales; the number on the site is a marketing device. If updating it by hand sounds annoying, set `showCounter: false` and the bar disappears — everything else still works.

---

## Before you open the presale

- [ ] Run one **live-mode** test purchase with a real card. Buy it yourself.
- [ ] Confirm the receipt email arrives and shows the selected size
- [ ] Confirm the redirect lands on `/thanks.html`
- [ ] Refund your test purchase in Stripe
- [ ] Check the section on an actual phone, not just a narrow browser window
- [ ] Confirm each link's payment cap is set — this is the one that costs real money if missed
- [ ] Decide what happens if you oversell: refund, or fulfil late and eat the cost

---

## Things worth knowing

**Taxes.** Stripe Tax is a paid add-on that auto-calculates sales tax. For a one-off merch run under a few thousand dollars you're likely fine without it, but that's a question for whoever does AJ's taxes, not for me — I'm not a tax advisor.

**Fulfilment.** Stripe gives you an order list with addresses; you're packing and shipping yourself. Export the CSV from the Payments tab. If this becomes a recurring thing, Shopify Lite ($5/mo) or Printful is worth revisiting — Stripe Payment Links are perfect for one drop, less so for an ongoing store.

**Refunds and lost packages.** Handle in the Stripe dashboard directly. Decide your policy now and put it in the shipping note so it's stated up front.

**Address collection.** Stripe collects and stores it — you never handle payment data or store addresses on your own site. That's the main reason this setup is the right call over anything custom.
