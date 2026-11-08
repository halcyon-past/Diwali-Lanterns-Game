# 🪔 Diwali Lanterns — Couples Trivia Game

> **Production URL**: [diwali.aritro.cloud](https://diwali.aritro.cloud)

A romantic real-time multiplayer Diwali trivia game crafted specifically for couples. Answer questions about each other (either "Him/Her" or 1-word text answers with smart fuzzy typo matching). Whenever your answers match, a glowing Diwali paper lantern rises from the city into the night sky, gradually illuminating a starry skyline. At the end of the round, couples can download their shared illuminated skyline as an animated GIF or high-resolution PNG memory.

---

## ✨ Features

- **Real-Time Multiplayer with WebSockets**: Instant room creation with 6-character room codes and one-click invite links powered by Pusher Channels (Vercel-native serverless WebSocket architecture).
- **Pass & Play / Couch Co-Op Mode**: Sitting next to each other? Play seamlessly on a single device with phone-passing prompts!
- **Stunning Night Skyline & Visual Engine**:
  - HTML5 Canvas engine rendering deep midnight Diwali cosmic skies with soft nebula glows.
  - 550+ twinkling, colored stars with four-point diffraction spikes.
  - Detailed Indian city skyline with temples, domes, minarets, and warm lit windows.
  - Authentic paper lanterns with realistic ribbing, flickering candle fire cores, ambient halos, upward floating physics, and falling golden spark trails.
  - Floating golden sparkles, fireflies, and ambient cosmic dust.
- **200+ Built-in Couples Questions**:
  - *Who's More Likely To* (Him / Her debates)
  - *Favorites* (1-word answers)
  - *Relationship & Firsts* (Him / Her & text)
  - *Memories & Quirks* (1-word text)
  - *Diwali Special* (Festive questions & traditions)
- **Fuzzy Match Engine**: Uses Fuse.js + Levenshtein distance normalization so couples aren't penalized for typos, capitalization, or extra spaces in 1-word answers.
- **Custom Question Creator**: Hosts can add personalized inside-joke questions on the fly.
- **Animated GIF & PNG Export**: Exports the moving, twinkling night skyline with all the lanterns you lit together using Web Workers (`gif.js`).

---

## 🚀 Deployment on Vercel (Custom Domain: `diwali.aritro.cloud`)

This application is built with Next.js 16 (App Router) and is 100% serverless, perfectly tailored for Vercel deployment.

### 1. Set Up Free Pusher Account (WebSocket real-time sync)
1. Sign up for a free account at [pusher.com](https://pusher.com) (free tier includes 200k messages/day, plenty for couples gameplay).
2. Create a Channels App named `diwali-lanterns`.
3. Select your closest cluster (e.g. `ap2` for India or `mt1` for US).
4. Enable **Client Events** in App Settings (under *App Settings* -> *Enable Client Events*).

### 2. Configure Environment Variables in Vercel
Add the following environment variables in your Vercel Project Settings (*Settings* -> *Environment Variables*):

```env
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
```

### 3. Attach Custom Domain (`diwali.aritro.cloud`)
1. In your Vercel Dashboard, go to **Settings** -> **Domains**.
2. Enter `diwali.aritro.cloud`.
3. Add the DNS records (CNAME `cname.vercel-dns.com`) in your Cloudflare/DNS provider for `aritro.cloud`.

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/halcyon-past/Diwali-Lanterns-Game.git
cd Diwali-Lanterns-Game

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# (Fill in your Pusher credentials in .env.local)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start playing!

---

## 🎨 Tech Stack

- **Framework**: Next.js 16 (React 19, TypeScript, App Router)
- **Real-Time WebSockets**: Pusher Channels (Presence & Private Channels)
- **Visuals & Animation**: HTML5 2D Canvas API + Framer Motion
- **Styling**: Tailwind CSS v4 with custom Diwali glow effects
- **Fuzzy Matching**: Fuse.js + Levenshtein distance
- **Export**: `gif.js` via Web Workers + Canvas DataURL PNG export
