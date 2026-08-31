AJ Vitanza Debut T-Shirt media.

WHAT'S HERE
  tee-front.jpg   front view (swoosh on chest)   960x1200, ~35KB
  tee-back.jpg    back view (AJVITANZA wordmark) 960x1200, ~36KB

  ../../video/tee-360.mp4         the 360 rotation, ~170KB
  ../../video/tee-360-poster.jpg  its first frame, ~18KB

ALL THREE COME FROM ONE SOURCE
  Everything is cut from "aj 3d shirt vid 2.mov" in the AJ MERCH ASSETS
  folder. The stills are frames 0 (front) and 75 (back) of that video.

  This matters. The original 3d shirt 1.png / 3d shirt 3.png renders sit
  on a BLUE GRADIENT background, while the video is on BLACK. Putting
  those side by side in one gallery looked stitched together. Keying the
  blue out was tried and abandoned: the shirt's own shading is grey-blue
  and the render's edges fade softly into the backdrop, so both a colour
  match and a border flood-fill ate holes in the shoulders.

  Taking the stills from the video sidesteps all of it — same camera,
  same lights, same black, guaranteed.

  IF YOU REPLACE ONE, REPLACE ALL THREE, or the set stops matching.

  To recut the stills:
    ffmpeg -i "aj 3d shirt vid 2.mov" -vf "select='eq(n\,0)'"  -frames:v 1 front.png
    ffmpeg -i "aj 3d shirt vid 2.mov" -vf "select='eq(n\,75)'" -frames:v 1 back.png
  then pad (don't crop) to 4:5 on black and resize to 960x1200.

THE VIDEO
  720x1280, 5.0s, 151 frames, starts and ends front-facing so the loop is
  seamless. Re-encoded to 600px wide h264 at crf 30 — 2.0MB down to 170KB.

  mp4 only. A vp9 webm was built and thrown away: it came out LARGER
  (246KB) than the h264, and mp4 plays everywhere, so the second file
  earned nothing.

  It autoplays muted and looping, pauses when scrolled off screen, and is
  replaced by the poster under prefers-reduced-motion. Do not remove the
  muted property or playsinline — iOS refuses to autoplay without both and
  you get a black rectangle.

THE GALLERY
  Configured in merch.js under the product's `media` array, in display
  order. First entry is what loads first, so keep the video there only
  while it stays small.

  A missing file no longer blanks the card — the placeholder appears only
  when EVERY slide fails, so one bad path still leaves a working gallery.

CACHING
  vercel.json caches /images/merch and /video for one hour, not the year
  the rest of /images gets. Deliberate: you'll swap these while keeping
  the filenames, and a long immutable cache would keep serving the old one.

NOT USED
  The signed graphic card is deliberately not photographed. It stays a
  text-only callout on the card.
