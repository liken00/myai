# MY.AI Frontend

Single-file HTML/CSS/JS frontend for MY.AI. Dark-themed, no framework dependencies.

## Files

- `index.html` — Complete frontend (HTML + CSS + JS in one file)

## Configuration

In `index.html`, set the `API_BASE` constant to point to your backend:

```js
const API_BASE = 'https://your-render-app.onrender.com';
```

For local development:
```js
const API_BASE = 'http://localhost:5000';
```

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g., `myai-frontend`).
2. Push `index.html` to the `main` branch.
3. Go to **Settings → Pages → Source**: select `main` branch and `/ (root)`.
4. Your site will be live at `https://yourusername.github.io/myai-frontend/`.

Or simply host `index.html` on any static hosting provider (Cloudflare Pages, Vercel, Netlify, etc.).

## Features

- 5 AI models: Nano Banana 2, Nano Banana Pro, Seedream 5.0, Flux Kontext, Qwen Image
- Dark UI matching raphael.app aesthetic
- Aspect ratio, resolution, and format options per model
- Real-time polling with loading spinner
- Download and Share buttons
- Responsive design (mobile-friendly)
- Keyboard shortcut: `Ctrl+Enter` to generate
