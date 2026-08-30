Drop the AJ Vitanza Debut T-Shirt photography here.

WHAT'S HERE NOW
  tee-front.jpg and tee-back.jpg are GENERATED PLACEHOLDERS.
  Delete them and drop the real shots in with the same names.

FILENAMES (referenced by merch.js — change them there if you rename)
  tee-front.jpg    shown by default
  tee-back.jpg     optional; cross-fades in on hover

SPECS
  - Square (1:1). 1200x1200 is plenty.
  - JPG, roughly 200-400KB each. Compress before committing.
  - Shoot or crop on a dark background so the card blends with the site.
  - Missing file degrades to a dashed "Artwork coming" placeholder.
    Nothing breaks, so you can deploy in any order.

WORTH SHOOTING
  The signed graphic card, alongside the shirt or on its own. It's the
  entire reason to buy in the presale rather than at the merch table,
  and right now it's described in text but never shown. One extra frame.

CACHING
  netlify.toml caches this folder for one hour, not the year that the
  rest of /images gets. That's deliberate: you'll be swapping these files
  while keeping the filenames, and a year-long immutable cache would keep
  serving the placeholder to anyone who'd already loaded the page.
