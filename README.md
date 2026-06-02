# Elon Musk RewardRush — Tesla Spin Giveaway

A mobile-friendly landing page where visitors spin a prize wheel, win Tesla-themed rewards, and claim prizes via WhatsApp. Built with plain HTML, CSS, and JavaScript (no build step required).

---

## Features

- Animated spin wheel (3×2 prize grid) with gold highlight on the winner
- ~**20% chance** to land on **Try Again**, ~80% on a real prize
- Win modal with confetti, claim code, and **Claim on WhatsApp** link
- **Try Again** in the popup *or* tap the main spin button to spin again (dynamic button text)
- Saved wins in `localStorage` (survives page refresh until user spins for another prize)
- Responsive layout (2-column grid on mobile)

---

## Quick start

### 1. Configure WhatsApp

This project does **not** read `.env` files at runtime (static site). Use **`config.js`**:

```bash
cp config.example.js config.js
```

Edit `config.js`:

```javascript
window.APP_CONFIG = {
  WHATSAPP_NUMBER: "12268457134", // country code + number, no + or spaces
};
```

`config.js` is **gitignored**. Never commit your real number.

A `.env.example` file is included only as a reference for the variable name.

### 2. Add assets

Place images in `assets/`:

| File | Purpose |
|------|---------|
| `background.jpg` | Full-page background |
| `ppf.jpg` | Profile photo (hero + modal signature) |
| `img1.jpg` … `img5.jpg` | Prize images |
| `retry.png` or `retry.jpg` | Try Again tile |
| `favicon.svg` | Browser tab icon |

Optional: `front.jpg` (not used by default stylesheet).

### 3. Run locally

```bash
# Python
python -m http.server 8000

# Node (if installed)
npx serve .
```

Open [http://localhost:8000](http://localhost:8000).

> Always use a local server — opening `index.html` directly can break paths and scripts.

---

## Project structure

```
V2/
├── index.html          # Page markup
├── styles.css          # Layout and theme
├── app.js              # Spin logic, modal, storage
├── config.js           # Your WhatsApp number (gitignored)
├── config.example.js   # Template for config.js
├── .env.example        # Reference only (not loaded by the app)
├── assets/             # Images
└── README.md
```

---

## How the spin works

### Odds

- `RETRY_CHANCE = 0.2` in `app.js` → **20%** Try Again, **80%** split evenly across the 5 real prizes.

To change odds, edit:

```javascript
const RETRY_CHANCE = 0.2; // 0.0 = never retry, 1.0 = always retry
```

### Spin button & disclaimer

| Element | First visit | After first spin |
|---------|-------------|------------------|
| Main button | `SPIN NOW` | `SPIN NOW` (unchanged) |
| Text below button | `Free to play · No purchase required` | `Spin again! Elon has more Teslas to give away!` |

Clicking **SPIN NOW** always starts a new spin. If a prize was saved, it is cleared first so the user can hunt for a different reward.

### Popup actions

| Result | Popup |
|--------|--------|
| **Try Again** | Styled “Next Spin” popup + **SPIN AGAIN** (auto-starts a new spin) |
| **Real prize** | Confetti, claim code, WhatsApp link, **Try Again — spin for another prize** |

Users can:

1. Close the popup and use the **main spin button**, or  
2. Use **Try Again** inside the popup (same result: new spin).

### Persistence

- Winning a real prize saves to `localStorage` under key `emrr_win`.
- Refreshing the page reopens the win modal with the same code.
- Spinning again (main button or popup Try Again) **clears** the saved win.

---

## WhatsApp claim message

Pre-filled message includes:

- Event: **Elon Musk RewardRush**
- Prize name and value
- Claim code (`EMRR-XXXXXX`)

Ensure `WHATSAPP_NUMBER` in `config.js` is correct for your region (e.g. `1` for US/Canada).

---

## Deployment

1. Copy `config.example.js` → `config.js` on the server (or set via your host’s env → build step if you add one later).
2. Upload all files **except** do not expose secrets in public repos without gitignore.
3. Serve over **HTTPS** for best mobile/WhatsApp behavior.

Works on: Netlify, Vercel, GitHub Pages, Cloudflare Pages, any static host.

---

## Customization

| What | Where |
|------|--------|
| WhatsApp number | `config.js` |
| Retry odds | `app.js` → `RETRY_CHANCE` |
| Prizes list | `app.js` → `PRIZES` |
| Brand name in messages | `app.js` → `BRAND_NAME` |
| Colors / fonts | `styles.css` |
| Hero copy | `index.html` |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| WhatsApp link does nothing | Set `WHATSAPP_NUMBER` in `config.js` |
| `config.js` 404 in console | Copy from `config.example.js` |
| Images missing | Check filenames in `assets/` match `app.js` |
| Confetti missing | Needs internet for canvas-confetti CDN |
| Buttons dead | Hard refresh; ensure `config.js` loads before `app.js` |

---

## License

Private project — use and modify as needed for your deployment.
