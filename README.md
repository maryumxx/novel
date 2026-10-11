# The Night Before You

A private anniversary book for October 11, 2025–October 11, 2026. Vite + React + TypeScript, react-pageflip/StPageFlip, locally bundled fonts, and Web Audio paper sounds. No analytics, backend, or remote font requests. The original reading soundtrack is bundled locally.

## Run locally

Install Node.js 22.12+ (Node 24 also works), then open PowerShell in this folder:

```powershell
cd C:\Users\Maryam\novel
npm install
npm run dev
```

Open the Local URL printed by Vite (normally http://127.0.0.1:5173). On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

```powershell
npm run verify:content
npm run build
npm run preview
```

The completed production files are in `dist/`. Serve that folder through HTTP; opening `index.html` directly with `file://` will not load the app correctly.

## Reading

Open Our Story animates the hardcover. Desktops show two pages; phones show one. Use Previous/Next, keyboard arrows, a mouse drag from a page corner, or a horizontal touch swipe. Vertical scrolling remains available. Contents jumps to any chapter or the finale. Click an original screenshot to enlarge it; Escape, the close button, or the backdrop closes the lightbox. The final page returns to the cover and resets the reading position.

Page-turn sounds and quiet reading music start enabled after the Open Our Story gesture. Use Pages and Music to mute them independently; preferences are remembered. The original 64-second instrumental loops continuously through chapters and photo viewing, pauses on returning to the cover or hiding the tab, and resumes when reading resumes. No audio plays before opening. The music is mixed at 8.5% through a Web Audio gain so it stays quiet on mobile. Its source is public/audio/our-quiet-pages.wav; scripts/create-reading-music.py can recreate it with Python and numpy. The page rustle is synthesized locally in src/pageSound.ts. Plain pages disables the flip library; the system reduced-motion preference selects this mode automatically. Only the reading position and sound preference use localStorage. Storage failures do not prevent reading.

## Manuscript and images

`src/data/manuscript.json` contains all 26 ordered sections, imported from the supplied PDF without rewriting or shortening. The original PDF uses one paragraph per section; PDF visual line wraps are joined into spaces. Numbered headings are split into an ID and a title, and the original part headings are retained. `manuscript-extracted.txt` is a private reference used by the content verification command, not a public download.

`src/pagination.ts` measures the actual HTML typography at the current page dimensions and splits paragraphs at word boundaries, preferring sentence endings. Continuations preserve every word. Resizing regenerates the physical pages and keeps a nearby logical reading position. Physical page counts vary by screen size; there are always 26 story sections.

Later author-requested passages are in `src/data/author-additions.json` and woven into the existing chapter text by `src/data/book.ts`. Chapter 25 includes the imagined children, his wish for two and hers for four, and their chosen names Zidan and Zayna. The original PDF import remains intact; verification also checks that each addition has an unambiguous insertion point.

Original screenshots live in `public/memories/`. Replace a file with an image of the same filename, or edit the mapping in `src/data/book.ts` (path, caption, accessible description, and section number):

| File | After section | Memory |
|---|---:|---|
| `01-first-hello.jpg` | 5 | LinkedIn greeting at 4:20 PM |
| `02-the-project.jpg` | 5 | Cybersecurity website |
| `03-he-noticed.jpg` | 6 | Design and colour compliment |
| `04-pakistan.jpg` | 8 | Pakistan conversation |
| `05-delhi.jpg` | 8 | Delhi invitation |
| `06-ketchup.jpg` | 19 | Ketchup exchange |
| `07-first-photo-of-you.jpeg` | 20 | His first clear photograph |
| `08-first-photo-of-me.jpeg` | 20 | Her first photograph |
| `09-the-family-i-imagine.jpeg` | 25 | Illustration of the imagined future family |

Six chat screenshots were supplied, although the original brief mentioned seven. Two later-supplied portraits are preserved as a paired keepsake interlude after section 20; edit firstPhotographs in src/data/book.ts to update them. The desktop paginator keeps the portraits together on facing pages; phones show one at a time. No seventh screenshot or replacement conversation was invented. To add another, put the original in this folder and add one mapping entry. Images retain their original proportions and wording. In the Instagram screenshot, the left bubbles are hers and the right bubbles are his.

The original import can be repeated, if needed, using Python with `pypdf`:

```powershell
python scripts/import-manuscript.py "D:\The_Night_Before_You_Anniversary_Novel(1).pdf"
```

## Privacy and optional passcode

**Public hosting exposes the full manuscript, names, and screenshots to anyone who can access the files.** An unlisted URL, `robots.txt`, and noindex/nofollow directives are not access controls. Keep the repository private and enable deployment-level authentication that also protects `/assets/` and `/memories/` before sharing sensitive content. Hosting-provider privacy features may depend on your plan. Do not assume a free public deployment is private.

For a casual visual gate, copy `.env.example` to `.env.local` and set `VITE_ACCESS_PASSCODE`, then restart/rebuild. It is compiled into client JavaScript and **does not provide strong security or protect direct asset URLs**. The entered value is kept only in memory. Do not use a password you use elsewhere.

## Free Vercel deployment

1. Create a private Git repository containing this source (exclude `node_modules`, `.env.local`, and `dist`).
2. In Vercel, add a new project and import that repository. Use the Hobby plan where eligible for personal use.
3. Choose Vite, build command `npm run build`, output directory `dist`, and a supported Node.js version of at least 22.12.
4. Optionally set `VITE_ACCESS_PASSCODE` in build environment variables. Arrange real access protection separately as explained above.
5. Deploy. Subsequent pushes rebuild the project. `vercel.json` includes noindex and privacy headers.

Official guide: https://vercel.com/docs/frameworks/frontend/vite

## Free Netlify deployment

1. Import the private Git repository as a new project on the Free plan, within its current usage limits.
2. The included `netlify.toml` sets `npm run build`, publish directory `dist`, and Node 22.
3. Configure optional build environment variables and any deployment-level access protection before distributing the link.
4. Deploy. Alternatively, run `npm run build` locally and upload **only `dist/`** using Netlify's manual deploy flow; manual uploads do not rebuild environment variables.

Official guides: https://docs.netlify.com/manage/projects/add-new-project/ and https://docs.netlify.com/build/configure-builds/overview/

Neither guide implies that free hosting includes private access. Check provider limits and protection options before publishing these personal files.

## Verification

- Production TypeScript/Vite build and all-section text verification.
- Browser checks at a 390 × 844 phone viewport and a 1280 × 900 desktop viewport: opening, page buttons, keyboard arrows, corner drag, chapter selection, original-image lightbox/Escape, sound control, plain pages, finale, and restart.
- No browser console errors observed during those checks.
- Phone-sized Chromium testing is not a physical iPhone Safari test. Test touch swipes and audio on the receiving phone before gifting; if its browser has trouble with animated pages, use Plain pages.

The page-turn library is deliberately pinned by `package-lock.json`. Keep the lockfile for reproducible installs. The optional `.openai/hosting.json` is used by Sites hosting and is not needed by Vercel or Netlify.


