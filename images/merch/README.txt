AJ Vitanza Debut T-Shirt photography.

WHAT'S HERE
  tee-front.jpg   the real 3D render, front (swoosh on chest)
  tee-back.jpg    the real 3D render, back (AJVITANZA wordmark)
                  shown on hover as a cross-fade

Both are 1200x1200 and about 100KB each, made from the 1080x1440 source
renders in "AJ MERCH ASSETS". The card wants a square, so rather than
cropping the shirt the background gradient was extended sideways — it's a
vertical gradient, so replicating the edge columns is seamless.

IF YOU REPLACE THEM
  - Square (1:1). 1200x1200 is plenty.
  - JPG, 100-200KB. Compress before committing; the source renders were
    1.2MB and 930KB, which is 10x more than the page needs.
  - A missing file degrades to a dashed "Artwork coming" placeholder, so
    you can deploy in any order.

UNUSED ASSET
  "aj 3d shirt vid 2.mov" (5s, 720x1280) is sitting in the assets folder.
  It could replace the hover cross-fade with a rotating shirt — ask and
  it can be wired in.

  The signed graphic card is deliberately not photographed. It stays a
  text-only callout on the card.

CACHING
  vercel.json caches this folder for one hour, not the year that the
  rest of /images gets. That's deliberate: you'll be swapping these files
  while keeping the filenames, and a year-long immutable cache would keep
  serving the old one to anyone who'd already loaded the page.
