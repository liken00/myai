# MY.AI — Free Unlimited AI Image Generator
## Project Specification

---

## 1. Project Overview

**Project Name:** MY.AI
**Type:** Web Application (AI Image Generation)
**Core Functionality:** A free, unlimited AI image generator powered by multiple state-of-the-art models via the PoYo.ai API. Users select a model, enter a text prompt, optionally configure style/size, and receive a generated image.
**Target Users:** General users who want free AI image generation without sign-up.
**Target Clone Reference:** https://raphael.app

---

## 2. Architecture

```
┌─────────────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│   Frontend (HTML/CSS)   │────▶│   Flask Backend (app.py)  │────▶│   PoYo.ai API   │
│   Single index.html     │◀────│   /api/generate           │◀────│  api.poyo.ai    │
│   GitHub Pages          │     │   Render.com (free tier)  │     │                 │
└─────────────────────────┘     └──────────────────────────┘     └─────────────────┘
```

- **Frontend:** Static HTML/CSS/JS, hosted on GitHub Pages
- **Backend:** Single-file Flask app, hosted on Render.com free tier
- **API:** PoYo.ai (api.poyo.ai) with Bearer token auth

---

## 3. PoYo.ai API Specification

### Authentication
- Bearer token in `Authorization` header
- API key obtained from https://poyo.ai dashboard

### Endpoints
| Method | URL | Purpose |
|--------|-----|---------|
| POST | https://api.poyo.ai/api/generate/submit | Submit generation task |
| GET | https://api.poyo.ai/api/generate/polling?task_id=xxx | Poll for result |

### Workflow
1. Client → Backend: `POST /api/generate` with `{model, prompt, ...}`
2. Backend → PoYo.ai: `POST https://api.poyo.ai/api/generate/submit`
3. Backend returns `task_id` to client
4. Client polls Backend: `GET /api/generate/status?task_id=xxx`
5. Backend → PoYo.ai: `GET https://api.poyo.ai/api/generate/polling?task_id=xxx`
6. Backend returns result/images to client

### Available Models

| Model ID | Display Name | Description |
|----------|-------------|-------------|
| `nano-banana-2` | Nano Banana 2 | Fast, high-quality text-to-image (Gemini 3.1 Flash) |
| `nano-banana-pro` | Nano Banana Pro | Studio-quality, slower (Gemini 3 Pro) |
| `seedream-5.0` | Seedream 5.0 | ByteDance Seedream 5, text-to-image + editing |
| `flux-kontext-pro` | Flux Kontext | Black Forest Labs, text-to-image + editing |
| `qwen-image` | Qwen Image | Alibaba Qwen VL-based image generation |

### Submit Payload Structure (per model)

**Common fields:**
```json
{
  "model": "nano-banana-2",
  "prompt": "string",
  "aspect_ratio": "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
  "resolution": "auto" | "512" | "768" | "1024" | "1536" | "2048" | "4K",
  "num_images": 1
}
```

**Model-specific fields:**
- `nano-banana-2`: `output_format` (png/jpg/jpeg/webp), `enable_web_search` (bool)
- `nano-banana-pro`: `output_format`, `enable_web_search`, `size`
- `seedream-5.0`: `seed` (int, optional), `strength` (float, optional)
- `flux-kontext-pro`: `seed` (int, optional), `strength` (float, optional)
- `qwen-image`: `output_format`, `size`

### Response Format

**Submit response:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "task_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**Polling response (when complete):**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "finished",
    "images": [
      {
        "url": "https://...",
        "b64_json": "..."
      }
    ]
  }
}
```

**Polling response (when still processing):**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "processing"
  }
}
```

---

## 4. Backend Specification

### Stack
- **Framework:** Flask 3.x
- **WSGI:** Gunicorn (for production)
- **Host:** Render.com free tier ( spins down after 15 min inactivity)

### Endpoints

#### `POST /api/generate`
Submit a generation task.

**Request body:**
```json
{
  "model": "nano-banana-2",
  "prompt": "A majestic lion in the savanna",
  "aspect_ratio": "16:9",
  "resolution": "1024",
  "output_format": "png",
  "enable_web_search": false
}
```

**Response:**
```json
{
  "success": true,
  "task_id": "xxx"
}
```

#### `GET /api/generate/status?task_id=xxx`
Poll for task status.

**Response (processing):**
```json
{
  "status": "processing",
  "progress": null
}
```

**Response (complete):**
```json
{
  "status": "finished",
  "images": [{"url": "https://..."}]
}
```

**Response (failed):**
```json
{
  "status": "failed",
  "error": "error message"
}
```

#### `GET /`
Serves the frontend HTML (proxies to index.html for convenience in dev).

### Environment Variables
| Variable | Description |
|----------|-------------|
| `POYO_API_KEY` | Bearer token for PoYo.ai API |
| `FLASK_ENV` | `production` or `development` |

### Error Handling
- All PoYo.ai errors proxied with 502/503 status
- Timeout: PoYo.ai tasks should complete within 60s for image models
- Backend polling timeout: 120 seconds max
- Render.com free tier timeout: 30s for requests (polling handled via frontend auto-retry)

---

## 5. Frontend Specification

### UI Design (Dark Theme — matching raphael.app style)

**Color Palette:**
- Background: `#0a0a0a` (near black)
- Surface: `#141414` (dark gray cards)
- Border: `#2a2a2a`
- Primary accent: `#7c3aed` (violet/purple)
- Secondary accent: `#3b82f6` (blue)
- Text primary: `#ffffff`
- Text secondary: `#a1a1aa`
- Success: `#22c55e`
- Error: `#ef4444`

**Typography:**
- Font: Inter (Google Fonts), fallback to system sans-serif
- Logo: Bold, gradient text (violet to blue)

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│  HEADER: [MY.AI logo]                [GitHub link]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  MODEL SELECTOR (horizontal pill buttons)            │
│  [Nano Banana 2] [Nano Banana Pro] [Seedream 5.0]    │
│  [Flux Kontext]  [Qwen Image]                        │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  TEXTAREA: Enter your prompt...                │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  OPTIONS ROW:                                        │
│  [Aspect Ratio ▼] [Resolution ▼] [Output Format ▼]   │
│                                                      │
│  [ ✨ Generate Image ]                               │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  IMAGE DISPLAY AREA                          │   │
│  │  (shows generated image or placeholder)      │   │
│  │  [Download] [Share] buttons when ready        │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  FOOTER: Free unlimited AI image generation.        │
└──────────────────────────────────────────────────────┘
```

### Interaction Flow
1. User selects model (default: Nano Banana 2)
2. User types prompt
3. User optionally selects aspect ratio (default: 1:1), resolution, format
4. User clicks "Generate Image"
5. Button shows loading spinner, text changes to "Generating..."
6. Frontend polls backend every 2 seconds
7. Image appears when complete; Download + Share buttons activate
8. Error messages displayed inline

### Features
- **Model Selector:** Horizontal pill buttons, one active at a time
- **Prompt Input:** Large textarea, placeholder "Describe the image you want to create..."
- **Aspect Ratio:** Dropdown — 1:1, 16:9, 9:16, 4:3, 3:4
- **Resolution:** Dropdown — auto, 512, 768, 1024, 1536, 2048, 4K
- **Output Format:** Dropdown — png, jpg, webp
- **Generate Button:** Full-width, purple gradient, disabled while generating
- **Image Display:** Centered, max 512px on screen, shows placeholder before generation
- **Download Button:** Downloads image from URL
- **Share Button:** Copies URL to clipboard with toast notification
- **Loading State:** Animated dots or spinner overlay on image area
- **Error State:** Red banner below the form

---

## 6. File Structure

```
myai/
├── SPEC.md
├── README.md
├── backend/
│   ├── app.py              # Single Flask application
│   ├── requirements.txt    # Python dependencies
│   └── render.yaml         # Render.com deployment config
└── frontend/
    ├── index.html          # Complete single-file frontend
    └── README.md           # Frontend notes (GitHub Pages deploy)
```

---

## 7. Deployment Plan

### Backend — Render.com
1. Create account at render.com
2. Connect GitHub repo
3. Create Web Service:
   - Root directory: `backend/`
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
   - Plan: Free
4. Add environment variable: `POYO_API_KEY` = your PoYo.ai API key

### Frontend — GitHub Pages
1. Create `username.github.io` repo or use existing
2. Push `frontend/index.html` to `gh-pages` branch
3. Or: use `https://raw.githubusercontent.com/.../index.html` as direct link
4. Configure `VITE_API_URL` or hardcode backend URL in frontend

---

## 8. Implementation Notes

- The Flask app is a **single `app.py`** file with all routes, API proxy logic, and CORS handling
- No database required — stateless request/response
- Frontend uses vanilla JS (no framework) for minimal dependencies
- Polling is handled client-side to avoid server-side async complexity
- All model-specific parameters are forwarded from frontend to backend to PoYo.ai
- Render.com free tier spins down after 15 min — first request after idle may take ~30s to wake
- For production: add a health check cron job or upgrade to a paid plan

---

## 9. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POYO_API_KEY` | Yes | — | PoYo.ai API bearer token |
| `FLASK_ENV` | No | production | `development` enables debug |
| `FRONTEND_URL` | No | * | CORS origin whitelist |
