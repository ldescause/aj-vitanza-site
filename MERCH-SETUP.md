# Merch Drop — Status & Runbook

**Everything below is already built.** This document is now a reference for what exists and how to run the drop, not a to-do list. The remaining blockers are at the bottom.

**The drop:** AJ Vitanza Debut T-Shirt, 194 printed, $50. 50 released as an online presale; the rest go to the merch table at the show. Presale orders include a graphic card signed by AJ.

| Size | In the garage |
|---|---|
| XS | 10 |
| S | 65 |
| M | 62 |
| L | 43 |
| XL | 14 |
| **Total** | **194** |

**The presale is capped at 50 orders total**, across all sizes. Size is chosen at checkout.

---

## What exists in Stripe

Account: **Ajvitanza** (AJ's, operating from California). Built in both test and live mode.

**One product**, `AJ Vitanza Debut T-Shirt`, $50 one-off. (Five size-specific products from an earlier approach still exist in the catalog; their links are deactivated and they're harmless — archive them if you want a tidy catalog.)

**One payment link**, capped at **50 payments**. When the 50th order lands, Stripe deactivates the link itself and anyone arriving after sees "The link is no longer active." It has:

- Payment cap: **50** (`0 of 50 used` in the dashboard)
- A required **Size** dropdown: XS, S, M, L, XL — the choice appears on the order and the receipt
- Quantity locked at 1, adjustable quantity **off**
- Billing + shipping address, full name, phone number collected
- Three shipping rates (below), 16 ship-to countries
- Redirect to `https://ajvitanza.com/thanks.html`

The ten old per-size links are **deactivated** in both modes, so nothing can take an order outside the cap.

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

## The one thing to watch

A payment link caps **payments, not sizes**. One link capped at 50 gives you exactly the 50-order ceiling you asked for — but it cannot also protect an individual size.

**XS (10 in stock) and XL (14) are the only sizes where stock is below 50.** If more than 10 people pick XS, or more than 14 pick XL, you've sold shirts you don't have. S (65), M (62) and L (43) have enough depth that the presale can't realistically exhaust them.

So watch the **Size** column in the Stripe dashboard as orders come in. If XS or XL creeps toward its stock you can remove that option from the Stripe dropdown, deactivate the link early, or refund the overflow. Typical size distribution makes this unlikely — most orders are M and L — but it's a risk you're carrying rather than one the setup eliminates.

```
merch.js  ──►  renders the Merch section
   │
   └── one button ──►  buy.stripe.com/00wfZj…  (cap 50)
                            │
                            └── Size dropdown: XS / S / M / L / XL
```

---

## Running the drop

`merch.js` is the only file you edit. Everything lives in the `MERCH_CONFIG` block at the top.

| Moment | What to change |
|---|---|
| Presale opens | `phase: 'presale'` (already set) |
| During the presale | Update `presale.unitsRemaining` as sales come in |
| **A size runs out** | Delete it from the Size dropdown **in Stripe**, then set `soldout: true` here. Both halves, in that order |
| Getting close | Set the product's `status: 'lowstock'` |
| Presale over | `phase: 'soldout'` |
| **Public launch** | Raise the one cap in Stripe from 50 (below). No code change. |
| Emergency kill | `enabled: false` — section and nav link vanish |

### Presale → public sale is one number

Payment links stay editable after creation. When the presale ends, open the link in Stripe → Edit → raise the payment cap from **50** to **194** (or whatever is left after the merch table takes its share).

Same link, same URL, same product, same shipping rates. **Nothing in `merch.js` changes** except `phase: 'live'` and dropping the presale bonus.

### On sold-out sizes

**Read this one carefully — it changed when the ten per-size links became one.**

Back when each size had its own link, Stripe enforced sizes for you: a size capped out and that link died on its own. That is no longer true. There is now **one link, one cap of 50**, and the size is a dropdown inside it. Stripe counts payments; it does not know or care that you only own 10 XS.

So `soldout: true` in `merch.js` is **not** cosmetic catch-up any more — it's half of a two-part action, and it's the half that doesn't do anything:

1. **In Stripe:** delete that size from the dropdown. *This is the part that stops orders.*
2. **In `merch.js`:** set `soldout: true`. This strikes it through on the site so nobody clicks through and finds it missing.

Do (1) first. `merch.js` warns in the browser console whenever a size is marked sold out here while Stripe is still offering it, so an incomplete job is visible rather than silent — but the warning only helps if someone's looking.

If every size is marked sold out, the card flips to "Sold Out" by itself.

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
- [ ] Confirm the live cap still reads **0 of 50 used**
- [ ] Confirm the ten old per-size links are still Deactivated
- [ ] Sign 50 graphic cards and put them where you'll pack

---

## Things worth knowing

**Taxes.** Sales tax follows the inventory, so it's California — not AJ's New York bank account. Register with CDTFA (free, online, usually instant), add it in Stripe, and tax gets collected on California-bound orders only. Roughly $130 of tax across the run and about $8 in Stripe Tax fees. The separate question of which state gets *income* tax on the profit, given a NY resident operating in CA, is worth asking a professional — it's the one item here that isn't obvious.

**Fulfilment.** Stripe gives you an order list with addresses and phone numbers. Export the CSV from the Payments tab. Size now arrives as a **custom field** on the payment rather than as part of the product name — every order says "AJ Vitanza Debut T-Shirt", and the size sits in its own column. Confirm which column that is during the test purchase, before it matters: sorting the wrong one gets you fifty shirts in the wrong boxes.

Also watch the running size split here as orders arrive. It's the only early warning you get that XS or XL is about to oversell.

**Refunds and lost packages.** Handle in the Stripe dashboard. Decide the policy now and state it up front.

**Address collection.** Stripe collects and stores it — you never handle payment data or store addresses on your own site. That's the main reason this setup beats anything custom.
