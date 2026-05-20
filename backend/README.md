# MY.AI Backend

Flask-based API proxy for the MY.AI free unlimited AI image generator.

## Quick Start (Local Development)

```bash
cd backend
pip install -r requirements.txt
export POYO_API_KEY=your_poyo_api_key_here
python app.py
```

The server starts on `http://localhost:5000`.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POYO_API_KEY` | Yes | — | Bearer token from poyo.ai dashboard |
| `FLASK_ENV` | No | `production` | Set to `development` for debug mode |
| `PORT` | No | `5000` | Port to listen on |
| `FRONTEND_URL` | No | `*` | CORS origin whitelist |

## API Endpoints

### `POST /api/generate`

Submit a generation task.

```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nano-banana-2",
    "prompt": "A majestic lion in the savanna",
    "aspect_ratio": "16:9",
    "resolution": "1024",
    "output_format": "png"
  }'
```

**Response:**
```json
{ "success": true, "task_id": "xxx-xxx-xxx" }
```

### `GET /api/generate/status?task_id=xxx`

Poll for task status. Poll every 2 seconds.

**Response (processing):**
```json
{ "status": "processing" }
```

**Response (finished):**
```json
{ "status": "finished", "images": [{ "url": "https://..." }] }
```

**Response (failed):**
```json
{ "status": "failed", "error": "Something went wrong." }
```

### `GET /api/health`

Health check endpoint for Render.com.

## Deploy to Render.com

1. Create a new **Web Service** on [Render.com](https://render.com).
2. Connect your GitHub repo.
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`
4. Add environment variable:
   - `POYO_API_KEY` = your key from [poyo.ai](https://poyo.ai)
5. Deploy!

The `render.yaml` file in this directory automates the above — Render will pick it up automatically on push.

## Supported Models

| Model ID | Display Name |
|----------|-------------|
| `nano-banana-2` | Nano Banana 2 |
| `nano-banana-pro` | Nano Banana Pro |
| `seedream-5.0` | Seedream 5.0 |
| `flux-kontext-pro` | Flux Kontext |
| `qwen-image` | Qwen Image |
