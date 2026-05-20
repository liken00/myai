# MY.AI — Free Unlimited AI Image Generator

> Clone of https://raphael.app — powered by PoYo.ai API.

## Overview

MY.AI is a free, unlimited AI image generator web app. No sign-up required. Five AI models available:

| Model | Description |
|-------|-------------|
| **Nano Banana 2** | Fast, high-quality text-to-image (Gemini 3.1 Flash) |
| **Nano Banana Pro** | Studio-quality, slower (Gemini 3 Pro) |
| **Seedream 5.0** | ByteDance Seedream 5, text-to-image + editing |
| **Flux Kontext** | Black Forest Labs Flux Kontext, text-to-image + editing |
| **Qwen Image** | Alibaba Qwen VL-based image generation |

## Architecture

```
frontend/index.html   →  GitHub Pages (static)
backend/app.py        →  Render.com free tier (Flask)
                         ↕
                       PoYo.ai API (api.poyo.ai)
```

## Quick Start

### 1. Backend (Local)

```bash
cd backend
pip install -r requirements.txt
export POYO_API_KEY=your_poyo_api_key
python app.py
# → http://localhost:5000
```

### 2. Frontend (Local)

Open `frontend/index.html` in a browser, then update `API_BASE` at the top of the `<script>` section:

```js
const API_BASE = 'http://localhost:5000';
```

## Deployment

### Backend → Render.com

1. Push `backend/` to a GitHub repo.
2. Create a **Web Service** on [Render.com](https://render.com), connect the repo.
3. Set environment variable `POYO_API_KEY` (from [poyo.ai](https://poyo.ai)).
4. Deploy! The `render.yaml` handles the configuration automatically.

### Frontend → GitHub Pages

1. Push `frontend/index.html` to a GitHub repo.
2. Enable GitHub Pages (Settings → Pages → Source: main branch, root).
3. Update `API_BASE` in `index.html` to point to your Render backend URL.

## Project Structure

```
myai/
├── SPEC.md              # Full design + API specification
├── README.md            # This file
├── backend/
│   ├── app.py           # Flask API proxy (single file)
│   ├── requirements.txt # Python dependencies
│   ├── render.yaml      # Render.com deployment config
│   └── README.md        # Backend-specific docs
└── frontend/
    ├── index.html       # Complete single-file frontend
    └── README.md        # Frontend deploy docs
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POYO_API_KEY` | Yes | Bearer token from poyo.ai dashboard |
| `FLASK_ENV` | No | `development` or `production` |
| `PORT` | No | Server port (default: 5000) |

## License

MIT
