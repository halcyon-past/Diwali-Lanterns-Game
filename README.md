# 🪔 Diwali Lanterns — Romantic Couples Trivia Game

> **Live Production URL**: [diwali.aritro.cloud](https://diwali.aritro.cloud)  
> **Crafted with 🪔 by [Aritro Saha](https://aritro.cloud)**

A romantic real-time multiplayer Diwali trivia game crafted specifically for couples. Answer intimate questions about each other (either "Him/Her" debates or 1-word text answers with smart fuzzy typo matching). Whenever your answers match, a warm glowing Diwali paper lantern ascends from the city skyline into your shared starry midnight sky. At the end of the round, couples can download their shared illuminated skyline as an animated GIF or high-resolution PNG memory.

---

## ✨ Features

- **🌐 Real-Time Multiplayer with WebSockets**:
  - Instant room creation with 6-character room codes.
  - One-click copyable invite links (`?room=XXXXXX`).
  - Powered by Pusher Channels (Vercel-native serverless WebSocket architecture).
- **📱 Pass & Play / Couch Co-Op Mode**:
  - Sitting next to each other on the couch? Play seamlessly on a single device with phone-passing prompts ("*No peeking!*").
- **🎆 Living Midnight Skyline & Visual Engine**:
  - HTML5 Canvas engine rendering deep midnight Diwali skies with cosmic purple nebulae.
  - 550+ twinkling, multi-spectral stars with authentic four-point diffraction spikes.
  - Detailed Indian temple and palace skyline with domes, spires, and warm lit windows.
  - Authentic paper lanterns with realistic vertical ribbing, flickering candle fire cores, ambient halos, upward floating physics, and falling golden spark trails.
  - Floating golden sparkles, fireflies, and ambient cosmic dust.
- **🎵 Procedural Diwali Festive Background Music & Sound FX**:
  - Built-in Web Audio API synthesizer — zero external audio files to download, works instantly and offline.
  - Authentic Raag Bhupali (Mohanam) joyful pentatonic sitar & flute melody.
  - Soothing acoustic tanpura drone and rhythmic ghungroo (temple ankle bell) chimes.
  - Sparkling ascent sound FX whenever a lantern rises into the sky.
  - Joyous major chord celebration arpeggio on matching answers.
  - One-click toggle in top header (`Play Diwali Music` / `Diwali Music: Playing ✨`).
- **💡 200+ Handcrafted Couples Questions Across 5 Categories**:
  - *Who's More Likely To* (Him / Her debates)
  - *Favorites* (1-word answers)
  - *Relationship & Firsts* (Him / Her & text)
  - *Memories & Quirks* (1-word text)
  - *Diwali Special* (Festive traditions & sweet moments)
- **🔍 Smart Fuzzy Matching**:
  - Uses Fuse.js + Levenshtein distance normalization so couples aren't penalized for minor typos, different capitalization, or extra spaces in 1-word answers.
- **✏️ Custom Question Creator**:
  - Hosts can add personalized inside-joke questions directly in the room settings.
- **🎁 Animated GIF & High-Res PNG Export**:
  - Capture and export the moving, twinkling night skyline with all the lanterns you lit together using Web Workers (`gif.js`).

---

## 🚀 Deployment on Vercel (`diwali.aritro.cloud`)

This application is built with Next.js 16 (App Router) and is 100% serverless, perfectly tailored for Vercel deployment.

### 1. Set Up Free Pusher Account
1. Sign up for a free account at [pusher.com](https://pusher.com) (free sandbox plan gives 200,000 messages/day).
2. Create a Channels App named `diwali-lanterns`.
3. Select your preferred cluster (e.g., `ap2` for India / Asia Pacific, or `mt1` for US).
4. Enable **Client Events** in App Settings (*App Settings* -> toggle *Enable Client Events*).

### 2. Configure Environment Variables in Vercel
In your Vercel Project Settings (**Settings** -> **Environment Variables**), add the following private variables:

```env
PUSHER_APP_ID=2210438
PUSHER_KEY=f2019c5df4e54eb98dcb
PUSHER_SECRET=159098389c82d5747a0e
PUSHER_CLUSTER=ap2
```

> **Note**: To prevent Vercel's *"Keep This Value Private"* security warning, the application uses standard private environment variables. The client reads the public key and cluster securely via the internal Next.js route `/api/pusher/config`. (Legacy `NEXT_PUBLIC_PUSHER_KEY` is also supported as an automatic fallback).

### 3. Attach Custom Domain (`diwali.aritro.cloud`)
1. In your Vercel Dashboard, go to **Settings** -> **Domains**.
2. Enter `diwali.aritro.cloud`.
3. In your DNS provider (Cloudflare, Namecheap, etc.), add the CNAME record:
   - **Type**: `CNAME`
   - **Name**: `diwali`
   - **Target**: `cname.vercel-dns.com`
4. Vercel will automatically provision the SSL certificate.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/halcyon-past/Diwali-Lanterns-Game.git
cd Diwali-Lanterns-Game

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# (Fill in your Pusher credentials in .env.local)

# Run development server
npm run dev

# Or test optimized production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (React 19, TypeScript, App Router)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com) + Framer Motion
- **Real-Time WebSockets**: [Pusher Channels](https://pusher.com/channels) (Presence & Private Channels)
- **Visuals & Canvas**: HTML5 2D Canvas Engine (Custom skyline rendering, DPR auto-scaling, lantern physics)
- **Audio Synthesizer**: Web Audio API (Procedural Raag Bhupali sitar/flute synth, tanpura drone, sound FX)
- **Fuzzy Matching**: [Fuse.js](https://fusejs.io) + Levenshtein distance
- **Export Engine**: `gif.js` via dedicated Web Workers + Canvas DataURL PNG export

---

## 📜 License & Copyright

Crafted with 🪔 by **[Aritro Saha](https://aritro.cloud)** • [aritro.cloud](https://aritro.cloud) • © 2026. All rights reserved.
