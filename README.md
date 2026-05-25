# My AI - AI Image Generation Website

An AI image generation website similar to myai.dev, built with Next.js 15 + TypeScript.

## Features

- AI image generation with FLUX technology (via Lepton AI)
- User registration and login
- Credits system
- Stripe payment integration
- Dark theme, modern UI

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.local` and fill in your API keys
   - Get Lepton AI key: https://lepton.ai
   - Get Stripe keys: https://dashboard.stripe.com

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Tech Stack

- Next.js 15 + TypeScript
- Tailwind CSS
- Lepton AI (image generation)
- Stripe (payments)
- JWT (auth)
