"""
MY.AI — Flask Backend
Free Unlimited AI Image Generator
PoYo.ai API proxy with async submit/poll workflow.
"""

import os
import time
import logging
from datetime import timedelta

import requests
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

# ------------------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------------------

POYO_API_BASE = "https://api.poyo.ai"
POYO_API_KEY = os.environ.get("POYO_API_KEY", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"],
)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("myai")


# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

def poyo_headers():
    """Return headers for PoYo.ai API requests."""
    return {
        "Authorization": f"Bearer {POYO_API_KEY}",
        "Content-Type": "application/json",
    }


def validate_api_key():
    """Ensure API key is configured."""
    if not POYO_API_KEY:
        return False, jsonify({
            "success": False,
            "error": "POYO_API_KEY environment variable is not set."
        }), 500
    return True, None, None


# Style preset: maps UI style name → English suffix appended to prompt
STYLE_PRESETS = {
    "写实照片": ", photorealistic, ultra detailed, professional photography, 4K",
    "数字艺术": ", digital art, highly detailed, vibrant colors, 4K",
    "油画": ", oil painting style, masterpiece, detailed brushwork",
    "动漫": ", anime style, vibrant, high quality illustration",
}

def apply_style(prompt: str, style: str) -> str:
    """Append style suffix to prompt if a style preset is selected."""
    if style and style in STYLE_PRESETS:
        return f"{prompt}{STYLE_PRESETS[style]}"
    return prompt


def build_submit_payload(model: str, prompt: str, **kwargs):
    """
    Build the PoYo.ai submit payload for the given model.
    Strips out None values and forwards all extra kwargs as-is.
    """
    payload = {
        "model": model,
        "prompt": prompt,
    }

    # Common optional fields
    for field in ["aspect_ratio", "resolution", "num_images", "output_format",
                  "enable_web_search", "seed", "strength", "size"]:
        if field in kwargs and kwargs[field] is not None:
            payload[field] = kwargs[field]

    return payload


# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint for Render.com."""
    return jsonify({
        "status": "ok",
        "api_key_configured": bool(POYO_API_KEY),
    })


@app.route("/api/generate", methods=["POST"])
def generate_submit():
    """
    Submit a generation task to PoYo.ai.

    Request body (JSON):
    {
        "model": "nano-banana-2",
        "prompt": "A majestic lion in the savanna",
        "aspect_ratio": "1:1",         # optional
        "resolution": "1024",          # optional
        "output_format": "png",        # optional
        "enable_web_search": false,    # optional
        "seed": 42,                    # optional (seedream/flux)
        "strength": 0.8,              # optional (seedream/flux)
    }
    """
    valid, err_resp, status = validate_api_key()
    if not valid:
        return err_resp, status

    data = request.get_json(silent=True) or {}
    model = data.get("model", "").strip()
    prompt = apply_style(
        data.get("prompt", "").strip(),
        data.get("style", ""),
    )

    if not model:
        return jsonify({"success": False, "error": "Field 'model' is required."}), 400
    if not prompt:
        return jsonify({"success": False, "error": "Field 'prompt' is required."}), 400

    # Whitelist supported models
    SUPPORTED_MODELS = {
        "nano-banana",
        "nano-banana-2-new",
        "nano-banana-pro",
        "seedream-4.5",
        "flux-kontext-pro",
        "qwen-image",
    }
    if model not in SUPPORTED_MODELS:
        return jsonify({
            "success": False,
            "error": f"Unsupported model '{model}'. "
                     f"Supported: {', '.join(sorted(SUPPORTED_MODELS))}"
        }), 400

    payload = build_submit_payload(
        model=model,
        prompt=prompt,
        aspect_ratio=data.get("aspect_ratio"),
        resolution=data.get("resolution"),
        num_images=data.get("num_images", 1),
        output_format=data.get("output_format"),
        enable_web_search=data.get("enable_web_search"),
        seed=data.get("seed"),
        strength=data.get("strength"),
        size=data.get("size"),
    )

    try:
        resp = requests.post(
            f"{POYO_API_BASE}/api/generate/submit",
            headers=poyo_headers(),
            json=payload,
            timeout=30,
        )
    except requests.RequestException as e:
        log.error(f"PoYo.ai submit request failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to reach PoYo.ai API. Please try again."
        }), 502

    try:
        resp_data = resp.json()
    except Exception:
        return jsonify({
            "success": False,
            "error": f"Unexpected response from PoYo.ai: {resp.text[:200]}"
        }), 502

    if resp.status_code != 200 or resp_data.get("code") != 0:
        return jsonify({
            "success": False,
            "error": resp_data.get("message", "PoYo.ai returned an error."),
            "detail": resp_data,
        }), 502

    task_id = resp_data.get("data", {}).get("task_id")
    if not task_id:
        return jsonify({
            "success": False,
            "error": "PoYo.ai did not return a task_id."
        }), 502

    log.info(f"Task submitted: {task_id} | model={model}")
    return jsonify({
        "success": True,
        "task_id": task_id,
    })


@app.route("/api/generate/status", methods=["GET"])
def generate_status():
    """
    Poll PoYo.ai for task status.

    Query params:
        task_id: string (required)

    Returns:
        {
          "status": "processing" | "finished" | "failed",
          "images": [...],   # only when finished
          "error": "..."     # only when failed
        }
    """
    valid, err_resp, status = validate_api_key()
    if not valid:
        return err_resp, status

    task_id = request.args.get("task_id", "").strip()
    if not task_id:
        return jsonify({"error": "task_id query parameter is required."}), 400

    try:
        resp = requests.get(
            f"{POYO_API_BASE}/api/generate/polling",
            headers=poyo_headers(),
            params={"task_id": task_id},
            timeout=30,
        )
    except requests.RequestException as e:
        log.error(f"PoYo.ai polling request failed: {e}")
        return jsonify({"error": "Failed to reach PoYo.ai API."}), 502

    try:
        resp_data = resp.json()
    except Exception:
        return jsonify({"error": f"Unexpected response: {resp.text[:200]}"}), 502

    if resp.status_code != 200 or resp_data.get("code") != 0:
        return jsonify({
            "status": "failed",
            "error": resp_data.get("message", "PoYo.ai polling error."),
        })

    data = resp_data.get("data", {})
    task_status = data.get("status", "unknown")

    if task_status == "finished":
        images = data.get("images", [])
        if not images:
            # Some responses nest images differently
            images = data.get("image_url", [])
            if isinstance(images, str):
                images = [{"url": images}]
        return jsonify({
            "status": "finished",
            "images": images,
        })

    elif task_status in ("processing", "pending", "running"):
        return jsonify({
            "status": "processing",
            "progress": data.get("progress"),
        })

    else:
        return jsonify({
            "status": "failed",
            "error": data.get("error_message") or f"Unknown task status: {task_status}",
        })


@app.route("/", methods=["GET"])
def index():
    """Serve frontend in development; in production this route won't be used."""
    return jsonify({
        "service": "MY.AI Backend",
        "version": "1.0.0",
        "endpoints": ["/api/generate", "/api/generate/status", "/api/health"],
    })


# ------------------------------------------------------------------------------
# Error handlers
# ------------------------------------------------------------------------------

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found."}), 404


@app.errorhandler(500)
def internal_error(e):
    log.exception("Unhandled exception")
    return jsonify({"error": "Internal server error."}), 500


# ------------------------------------------------------------------------------
# Entry point
# ------------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
