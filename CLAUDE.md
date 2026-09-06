# AJ VITANZA — site operating notes

Read this before changing anything. It is written for an agent working
without a human watching.

## What this is

A **static site**. No framework, no build step, no `npm install`.
Plain HTML/CSS/JS served as-is.

- `index.html` — homepage
- `merch.html` — standalone store page (`/merch`, `/shop`, `/store`)
- `thanks.html` — post-checkout confirmation (noindex)
- `merch.js` — the store. **`MERCH_CONFIG` at the top is the only thing to edit.**
- `script.js`, `styles.css` — site machinery
- `vercel.json` — routing, cache headers, security headers
- `orders/` — fulfilment CSVs and the packing station (not public-facing logic)

## How a change reaches the live site

```
edit files  →  git commit  →  git push origin main  →  Vercel deploys  →  ajvitanza.com
```

Vercel watches `main`. There is no deploy command to run. Pushing IS deploying.
A push is live in roughly 30–60 seconds.

Do not add a build step. Do not migrate hosting. Do not add a bundler.

## The 90% case: changing the drop

Everything about the drop lives in `MERCH_CONFIG` at the top of `merch.js`.
Nothing below that block should need touching.

**`phase`** — one of `'teaser' | 'presale' | 'live' | 'soldout'`.
Changing this one string re-skins the whole store, the homepage hero,
and the nav. Currently `'live'`.

**`sizes`** — the per-size array. Each entry:

```js
{ label: 'M', stock: 99, soldout: false, link: 'https://buy.stripe.com/REPLACE_ME' }
```

The example above is illustrative and the numbers are fake. The real per-size
`stock`, `soldout`, and `link` values live in `MERCH_CONFIG` at the top of
`merch.js` — that is the only source of truth.

- `soldout: true` → greys the size out and strikes it through
- `stock` drives the "N remaining" counter and the "Almost gone" urgency state
- `link` is a **capped Stripe payment link**, one per size

**`enabled: false`** hides the entire merch section and its nav link.

`copy` and `hero` hold the per-phase text so the hero can never contradict
the section below it.

## Rules

1. **Never invent or edit a Stripe URL.** The links are capped per size in
   Stripe itself. If a link is missing, stop and ask — do not substitute
   another size's link. A wrong link sells the wrong garment.
2. **Never lower `stock` to fake urgency.** It should reflect reality.
3. **One concern per commit**, with a plain-English message. These commits
   get read later when reconciling orders.
4. **Don't touch `orders/`** unless the task is explicitly about fulfilment.
   Those CSVs are the record of real money.
5. If a change would touch more than `MERCH_CONFIG`, say what you're about
   to do before doing it.

## Verifying before you push

There are no tests. Check by reading:

- `node --check merch.js` — catches syntax errors. **Always run this after
  editing `merch.js`.** A syntax error there takes the whole store down.
- Confirm every non-`soldout` size still has a `link`.
- Confirm `phase` is one of the four valid strings.

Local preview is `./dev.sh` (macOS only, opens a browser — not useful on
a headless server).

## Staging vs production

`productionHosts` in `MERCH_CONFIG` lists the real domains. Anywhere else
— Vercel preview URLs, localhost — is treated as staging: Stripe TEST
links, a warning banner, `?phase=` previews allowed, and noindex.

So a Vercel preview deploy is safe to share. It cannot take real money.

## Longer docs

- `MERCH-SETUP.md` — how the store was wired up
- `LAUNCH.md` — launch-day runbook
