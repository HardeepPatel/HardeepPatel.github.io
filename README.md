# Hardeep Patel — Portfolio

Static portfolio for https://HardeepPatel.github.io, adapted from the Context Labs reference design and Hardeep's September 2026 résumé.

## GitHub Pages

Upload or merge this folder's contents into `HardeepPatel/HardeepPatel.github.io`. In repository **Settings → Pages**, select **Deploy from a branch**, then **main** and **/(root)**. No build command, server, or environment variables are needed. `.nojekyll` keeps these files served as plain static assets.

## Folder structure

- `index.html`: homepage
- `html/`: work, expertise, about, and contact pages; existing page URLs preserved
- `images/`: original portfolio images, hero image, favicon
- `assets/css/`: shared styles
- `assets/js/`: navigation, workspace tabs, carousel, and project animations
- `assets/fonts/`: local fonts
- `assets/documents/`: downloadable résumé
- `scripts/`: local validation only

## Preview

Run `python3 -m http.server 8000` from this folder and open http://localhost:8000.

## Edit

Edit the HTML pages directly. Styles and navigation behavior are shared across all pages. The site has no package dependencies or build step. Content is available even with JavaScript disabled; at narrow widths, enable JavaScript for the menu.

The typography follows the user-provided Context Labs reference. The homepage uses an edited personal hero portrait and the user-supplied profile photo. The contact links open email, LinkedIn, or GitHub; there is no form requiring a backend.

## Checks

Run `python3 scripts/check_site.py` to validate local links and hosted assets. With the preview server running, Playwright and Google Chrome installed, run `node scripts/check_browser.cjs` to check navigation, downloads, redirects, image loading, and overflow at desktop, tablet, and phone widths. `PORTFOLIO_URL` can point this check at a deployed copy.

GitHub's publishing instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Reference layout and image treatments

The homepage now reuses the banking page's actual stylesheet, compact centered navigation, centered hero, floating workspace frame, perspective skills grid, and blue/green section treatments. The work carousel reuses the reference homepage's expanding rails. Portfolio tabs and carousel controls work with mouse, touch, and keyboard.

The original agriculture, Infibeam, and ISRO images remain in `images/`. Enhanced motion-blur versions are in `images/work/`; these are used in the homepage work carousel and experience page. Local skill logos come from Devicon (https://github.com/devicons/devicon). No remote image requests are required at runtime.

The custom HP monogram is in `images/hp-mark.svg`. The two project animations reuse the supplied banking section's paper panels, transitions, and original phase durations. Their content explains a cross-shard transfer and the retrieval/generation/evaluation loop for cache policies. Playback starts when visible; replay and next-scene controls are available. Reduced motion presents the final scene with manual controls.

The work carousel advances every two seconds, including after a pointer click. Keyboard focus pauses it so links remain usable. Skills use the reference's repeatable 35%-visibility reveal in both scroll directions.

The homepage's Toya photo uses `images/work/agriculture-motion-v2.png`, a generated panning photograph with blur throughout the crop rows. Infibeam retains `images/work/payments-motion.png` at its complete aspect ratio so the motion-blurred edges remain visible.
