# MY.AI — 免费无限制 AI 图像生成器

> 一个完全免费、无需注册的 AI 图像生成器，基于 PoYo.ai API 构建。

**在线体验：** https://liken00.github.io/myai/

---

## 🎯 功能特性

- **5 个顶级 AI 模型**：Nano Banana、Nano Banana Pro、Seedream 4.5、Flux Kontext、Qwen Image
- **完全免费**：无需注册、无用量限制
- **多种尺寸**：支持 1:1、16:9、9:16 等多种宽高比
- **风格预设**：写实照片、数字艺术、油画、动漫
- **高分辨率**：最高支持 4K 分辨率输出

---

## 🏗️ 系统架构

```
┌─────────────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│   前端 (HTML/CSS/JS)     │────▶│   Flask 后端 (app.py)     │────▶│   PoYo.ai API   │
│   GitHub Pages           │◀────│   Render.com             │◀────│   api.poyo.ai   │
│   docs/index.html        │     │   /api/generate          │     │                 │
└─────────────────────────┘     └──────────────────────────┘     └─────────────────┘
```

- **前端**：静态 HTML/CSS/JS，托管于 GitHub Pages（`docs/` 目录）
- **后端**：单文件 Flask 应用，托管于 Render.com 免费版
- **API**：PoYo.ai（api.poyo.ai），Bearer Token 认证

---

## 🚀 快速部署

### 后端 — Render.com

1. 将 `backend/` 目录推送至 GitHub 仓库
2. 登录 [Render.com](https://render.com)，新建 **Web Service**
3. 连接你的 GitHub 仓库
4. 配置以下内容：

| 配置项 | 值 |
|--------|-----|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Plan | Free |

5. 添加环境变量：

| 变量名 | 值 |
|--------|-----|
| `POYO_API_KEY` | 你的 PoYo.ai API Key（从 [poyo.ai](https://poyo.ai) 获取） |

6. 点击 Deploy，等待完成 ✅

> ⚠️ Render.com 免费版在闲置 15 分钟后会自动休眠，第一次请求可能需要 30 秒唤醒。

### 前端 — GitHub Pages

前端直接使用 `docs/index.html`，由 GitHub Pages 服务。

1. 确保 GitHub 仓库已启用 GitHub Pages（Settings → Pages → Source: main branch, `/ (root)`）
2. 修改 `docs/index.html` 中的 `API_BASE` 指向你的后端地址：

```js
const API_BASE = 'https://your-render-app.onrender.com';
```

3. 运行部署脚本：

```bash
bash scripts/deploy_frontend.sh
```

---

## 🛠️ 本地开发

### 后端

```bash
cd backend
pip install -r requirements.txt
export POYO_API_KEY=your_poyo_api_key_here
python app.py
# 访问 http://localhost:5000
```

### 前端

```bash
# 直接用浏览器打开 frontend/index.html
# 或使用任意静态服务器：
npx serve frontend
```

修改 `frontend/index.html` 中的 `API_BASE` 指向本地后端：

```js
const API_BASE = 'http://localhost:5000';
```

---

## 📁 项目结构

```
myai/
├── docs/
│   └── index.html          # 🚀 前端主文件（GitHub Pages 源）
├── frontend/
│   └── index.html          # 前端开发副本（git 工作区）
├── backend/
│   ├── app.py              # Flask 后端（单文件）
│   ├── requirements.txt    # Python 依赖
│   ├── render.yaml         # Render.com 部署配置
│   ├── .env.example        # 环境变量模板
│   └── README.md           # 后端详细文档
├── scripts/
│   └── deploy_frontend.sh  # 前端部署脚本
├── SPEC.md                 # 完整设计规范文档
└── README.md               # 本文件
```

---

## 🔑 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `POYO_API_KEY` | ✅ 是 | — | PoYo.ai API Bearer Token |
| `FLASK_ENV` | 否 | `production` | `development` 开启调试模式 |
| `PORT` | 否 | `5000` | 服务器监听端口 |
| `FRONTEND_URL` | 否 | `*` | CORS 许可的前端域名 |

参考 `backend/.env.example`：

```env
# PoYo.ai API Key（必需）
POYO_API_KEY=your_poyo_api_key_here

# Flask 环境（可选，development 开启调试）
FLASK_ENV=production

# 监听端口（可选）
PORT=5000
```

---

## 📦 可用模型

| 模型 ID | 显示名称 | 说明 |
|---------|---------|------|
| `nano-banana` | Nano Banana | 极速生成，Gemini 2.5 Flash |
| `nano-banana-pro` | Nano Banana Pro | 更高质量，速度稍慢 |
| `seedream-4.5` | Seedream 4.5 | 字节跳动，4K 输出，编辑能力 |
| `flux-kontext-pro` | Flux Kontext | Black Forest Labs，文本+编辑 |
| `qwen-image` | Qwen Image | 阿里巴巴，VL 多模态 |

---

## 🎨 自定义前端

如需修改前端样式或文案，直接编辑 `docs/index.html`：

- **颜色主题**：修改 CSS 变量 `:root` 中的颜色值
- **模型列表**：在 `.model-cards` 容器中添加/删除 `.model-card` 元素
- **灵感画廊**：在 `.gallery-grid` 中添加 `.gallery-item`，设置 `data-prompt` 属性
- **后端地址**：修改 `<script>` 中的 `API_BASE` 常量

---

## 📄 许可证

MIT
