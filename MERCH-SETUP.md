# Merch Drop — Status & Runbook

**Everything below is already built.** This document is now a reference for what exists and how to run the drop, not a to-do list. The remaining blockers are at the bottom.

**The drop:** AJ Vitanza Debut T-Shirt, 194 printed, $50. 50 released as an online presale; the rest go to the merch table at the show. Presale orders include a graphic card signed by AJ.

| Size | In the garage | Presale cap | Held for show |
|---|---|---|---|
| XS | 10 | 3 | 7 |
| S | 65 | 17 | 48 |
| M | 62 | 16 | 46 |
| L | 43 | 11 | 32 |
| XL | 14 | 3 | 11 |
| **Total** | **194** | **50** | **144** |

---

## What exists in Stripe

Account: **Ajvitanza** (AJ's, operating from California). Built in both test and live mode.

**Five products**, one per size, named `AJ Vitanza Debut T-Shirt - XS` through `- XL`, all $50 one-off.

**Five payment links**, one per size. Each has:

- Payment cap: **XS 3 · S 17 · M 16 · L 11 · XL 3** (sums to 50)
- Quantity locked at 1, adjustable quantity **off**
- Billing + shipping address, full name, phone number collected
- Three shipping rates (below), 16 ship-to countries
- Redirect to `https://ajvitanza.com/thanks.html`

**Three shipping rates**, account-level so every link shares them:

| Rate | Price | Estimate |
|---|---|---|
| US Standard — United States only | $6.00 | 5–8 business days |
| Canada only | $22.00 | 7–14 business days |
| International — outside US & Canada | $35.00 | 10–21 business days |

Priced against real USPS costs — First-Class Package International starts around $19.40 and a 2 lb parcel runs about $27.65, so the old $15/$25 numbers lost money on every order. Those two rates are archived, not deleted.

**Ship-to countries:** US, Canada, UK, Ireland, Germany, France, Netherlands, Belgium, Spain, Italy, Sweden, Denmark, Norway, Australia, New Zealand, Japan.

**One honest caveat that hasn't changed:** Stripe Payment Links show every buyer all three rates and let them choose — they don't filter by address. Hence the blunt names. If someone in Toronto picks the $6 US rate, you'll see the mismatch in the dashboard and can bill or refund the difference.

---

## Why five links instead of one

A single link with a size dropdown caps *payments*, not sizes. One link capped at 50 would happily sell 50 XLs against 14 units of stock. Five links with their own caps mean Stripe kills each size the moment it's exhausted — no monitoring, no code, nothing to remember at 2am.

```
merch.js  ──►  renders the Merch section
   │
   ├── XS → buy.stripe.com/5kQbJ3…  (cap 3)
   ├── S  → buy.stripe.com/9B6aEZ…  (cap 17)
   ├── M  → buy.stripe.com/bJe14p…  (cap 16)
   ├── L  → buy.stripe.com/9B6fZj…  (cap 11)
   └── XL → buy.stripe.com/bJe28t…  (cap 3)
```

**The five URLs differ by a few characters.** Pasting one under two sizes means one size eats the other's cap and both buyers get the wrong shirt. The browser console warns if it spots a duplicate — look at it before you merge.

---

## Running the drop

`merch.js` is the only file you edit. Everything lives in the `MERCH_CONFIG` block at the top.

| Moment | What to change |
|---|---|
| Presale opens | `phase: 'presale'` (already set) |
| During the presale | Update `presale.unitsRemaining` as sales come in |
| **A size runs out** | Set that size's `soldout: true` |
| Getting close | Set the product's `status: 'lowstock'` |
| Presale over | `phase: 'soldout'` |
| **Public launch** | Raise the five caps in Stripe (below). No code change. |
| Emergency kill | `enabled: false` — section and nav link vanish |

### Presale → public sale is one number per link

Payment links stay editable after creation. When the presale ends, open each link in Stripe → Edit → change the payment cap:

| Size | Presale cap | Public cap (full stock) |
|---|---|---|
| XS | 3 | **10** |
| S | 17 | **65** |
| M | 16 | **62** |
| L | 11 | **43** |
| XL | 3 | **14** |

Same links, same URLs, same products, same shipping rates. **Nothing in `merch.js` changes** except `phase: 'live'` and dropping the presale bonus. That's the whole migration.

### On sold-out sizes

Stripe kills a capped-out link on its own, so a size stops selling whether or not you touch the site. Setting `soldout: true` is cosmetic — it turns a size that would otherwise look broken into one that visibly reads "gone". Worth doing within a few hours; not an emergency. If all five are marked sold out, the card flips to "Sold Out" by itself.

---

## Still blocking launch

- [ ] **Real photos** into `images/merch/` (see the README in that folder). Placeholders degrade gracefully, so this doesn't block a deploy — only a good-looking one.
- [ ] **California seller's permit.** Register free at CDTFA, add the registration in Stripe → Tax. Until then Stripe Tax is dormant: it collects nothing and costs nothing. Get it before the first California order lands, or AJ owes that tax out of pocket.
- [ ] **One live test purchase.** Buy a shirt yourself with a real card, confirm the receipt names the size, confirm the redirect lands on `/thanks.html`, then refund it in Stripe.

---

## Before you open the presale

- [ ] Real photos in place, or accept the placeholder
- [ ] Live-mode test purchase done and refunded
- [ ] Receipt email arrives and **names the size** in the product line
- [ ] Check the section on an actual phone, not a narrow browser window
- [ ] Browser console clean on ajvitanza.com — it names any size whose link is missing, duplicated, or still in test mode
- [ ] Confirm the five live caps still read 3 / 17 / 16 / 11 / 3
- [ ] Sign 50 graphic cards and put them where you'll pack

---

## Things worth knowing

**Taxes.** Sales tax follows the inventory, so it's California — not AJ's New York bank account. Register with CDTFA (free, online, usually instant), add it in Stripe, and tax gets collected on California-bound orders only. Roughly $130 of tax across the run and about $8 in Stripe Tax fees. The separate question of which state gets *income* tax on the profit, given a NY resident operating in CA, is worth asking a professional — it's the one item here that isn't obvious.

**Fulfilment.** Stripe gives you an order list with addresses and phone numbers. Export the CSV from the Payments tab — the size is in the product name, so one sort gets you five stacks.

**Refunds and lost packages.** Handle in the Stripe dashboard. Decide the policy now and state it up front.

**Address collection.** Stripe collects and stores it — you never handle payment data or store addresses on your own site. That's the main reason this setup beats anything custom.
