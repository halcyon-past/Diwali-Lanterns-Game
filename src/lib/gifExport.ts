'use client';

/**
 * GIF Export utility using gif.js
 * Records canvas frames and compiles them into a high-quality downloadable keepsake GIF
 */

// Dynamic loader for gif.js (robust across Next.js Turbopack / SSR)
async function loadGIF(): Promise<any> {
  if (typeof window === 'undefined') return null;

  // 1. If window.GIF is already initialized
  if ((window as any).GIF) {
    return (window as any).GIF;
  }

  // 2. Load via public/gif.js script tag
  try {
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[src="/gif.js"]');
      if (existing) {
        if ((window as any).GIF) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Failed to load /gif.js')));
        return;
      }

      const script = document.createElement('script');
      script.src = '/gif.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load /gif.js'));
      document.head.appendChild(script);
    });

    if ((window as any).GIF) {
      return (window as any).GIF;
    }
  } catch {
    // fallback to dynamic import
  }

  // 3. Bundler import fallback
  const mod: any = await import('gif.js');
  return mod.default || mod;
}

export interface GifRecorderOptions {
  width: number;
  height: number;
  quality: number; // 1-30, lower = better quality (2 = ultra-crisp NeuQuant sampling)
  frameDelay: number; // ms between frames
  totalFrames: number;
  player1Name?: string;
  player2Name?: string;
  matchPercentage?: number;
}

const DEFAULT_OPTIONS: GifRecorderOptions = {
  width: 800,
  height: 600,
  quality: 2, // Maximum color palette precision without noise
  frameDelay: 90,
  totalFrames: 36, // ~3.3s smooth festive loop
};

/**
 * Draw vibrant, high-contrast keepsake overlay that stays visible throughout the GIF
 */
function drawKeepsakeOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  player1Name: string,
  player2Name: string,
  matchPercentage: number
) {
  ctx.save();

  // Subtle dark sky contrast boost around center to ensure text always pops
  const centerGlow = ctx.createRadialGradient(
    width / 2, height / 2 - 10, width * 0.1,
    width / 2, height / 2 - 10, width * 0.52
  );
  centerGlow.addColorStop(0, 'rgba(6, 1, 16, 0.55)');
  centerGlow.addColorStop(0.7, 'rgba(8, 2, 20, 0.35)');
  centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, width, height);

  // Center Glassmorphic Crest Card
  const cardW = Math.min(540, width * 0.88);
  const cardH = 175;
  const cardX = (width - cardW) / 2;
  const cardY = (height - cardH) / 2 - 12;

  // Outer gold halo around card
  ctx.shadowColor = 'rgba(255, 180, 50, 0.75)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = 'rgba(14, 3, 28, 0.82)';
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 20);
  ctx.fill();
  ctx.stroke();

  // Inner subtle border highlight
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 235, 150, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cardX + 4, cardY + 4, cardW - 8, cardH - 8, 16);
  ctx.stroke();

  // Corner decorative flourishes
  ctx.font = '12px sans-serif';
  ctx.fillStyle = 'rgba(255, 215, 0, 0.75)';
  ctx.fillText('✦', cardX + 16, cardY + 22);
  ctx.fillText('✦', cardX + cardW - 24, cardY + 22);
  ctx.fillText('✦', cardX + 16, cardY + cardH - 12);
  ctx.fillText('✦', cardX + cardW - 24, cardY + cardH - 12);

  // Content inside Card
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Festive Diyas top row
  ctx.font = '24px sans-serif';
  ctx.shadowColor = 'rgba(255, 180, 0, 0.9)';
  ctx.shadowBlur = 12;
  ctx.fillText('✨  🪔  ✨', width / 2, cardY + 32);

  // "HAPPY DIWALI TO"
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
  ctx.fillStyle = '#FFF9C4';
  ctx.shadowColor = 'rgba(255, 180, 50, 0.85)';
  ctx.shadowBlur = 10;
  ctx.fillText('H A P P Y   D I W A L I   T O', width / 2, cardY + 68);

  // Couple Names: Large, ultra-vibrant radiant gold
  const coupleText = `${player1Name} & ${player2Name}`;
  const fontSize = cardW < 460 ? 28 : 35;
  ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif`;

  // First pass: warm luminous bloom
  ctx.fillStyle = '#FFE082';
  ctx.shadowColor = 'rgba(255, 160, 20, 0.98)';
  ctx.shadowBlur = 20;
  ctx.fillText(coupleText, width / 2, cardY + 112);

  // Second pass: sharp golden gradient fill
  const textGrad = ctx.createLinearGradient(0, cardY + 95, 0, cardY + 130);
  textGrad.addColorStop(0, '#FFFFFF');
  textGrad.addColorStop(0.3, '#FFF9C4');
  textGrad.addColorStop(0.7, '#FFD54F');
  textGrad.addColorStop(1, '#FFB300');
  ctx.fillStyle = textGrad;
  ctx.shadowBlur = 6;
  ctx.fillText(coupleText, width / 2, cardY + 112);

  // Bottom ornamental accent
  ctx.font = '13px sans-serif';
  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.shadowBlur = 8;
  ctx.fillText('✦   •   ✦', width / 2, cardY + 148);

  // Bottom Floating Badge: Match Percentage
  const badgeY = height - 42;
  const badgeText = `❤️ ${matchPercentage}% Match  •  Diwali Lanterns 🪔`;

  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
  const textMetrics = ctx.measureText(badgeText);
  const badgeW = textMetrics.width + 38;
  const badgeH = 36;
  const badgeX = (width - badgeW) / 2;

  // Badge background & glow
  ctx.fillStyle = 'rgba(16, 3, 32, 0.88)';
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(255, 180, 50, 0.8)';
  ctx.shadowBlur = 18;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY - badgeH / 2, badgeW, badgeH, 18);
  ctx.fill();
  ctx.stroke();

  // Badge text
  ctx.fillStyle = '#FFD54F';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
  ctx.shadowBlur = 10;
  ctx.fillText(badgeText, width / 2, badgeY);

  ctx.restore();
}

/**
 * Record frames from a canvas and export as high-quality GIF
 */
export async function exportCanvasAsGif(
  canvas: HTMLCanvasElement,
  options: Partial<GifRecorderOptions> = {},
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const GIF = await loadGIF();

  return new Promise((resolve, reject) => {
    // Note: dither is set to false to completely avoid noisy pixel speckling on dark night sky gradients
    const gif = new GIF({
      workers: 3,
      quality: opts.quality,
      width: opts.width,
      height: opts.height,
      workerScript: '/gif.worker.js',
      dither: false,
    });

    const offscreen = document.createElement('canvas');
    offscreen.width = opts.width;
    offscreen.height = opts.height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })!;

    const hasKeepsake = Boolean(opts.player1Name && opts.player2Name);

    // Compute aspect-ratio cover transform to prevent stretching/squishing of circular lanterns
    const srcW = canvas.width;
    const srcH = canvas.height;
    const scale = Math.max(opts.width / srcW, opts.height / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const offsetX = (opts.width - drawW) / 2;
    const offsetY = (opts.height - drawH) / 2;

    let frameCount = 0;
    const captureInterval = setInterval(() => {
      if (frameCount >= opts.totalFrames) {
        clearInterval(captureInterval);

        gif.on('finished', (blob: Blob) => {
          resolve(blob);
        });

        gif.on('progress', (p: number) => {
          onProgress?.(0.5 + p * 0.5); // Progress: 50-100% for encoding
        });

        gif.render();
        return;
      }

      // Draw current canvas state with high quality smoothing and correct aspect ratio
      offCtx.clearRect(0, 0, opts.width, opts.height);
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = 'high';
      offCtx.drawImage(canvas, offsetX, offsetY, drawW, drawH);

      // ALWAYS overlay the vibrant keepsake text on EVERY frame of the GIF
      if (hasKeepsake) {
        drawKeepsakeOverlay(
          offCtx,
          opts.width,
          opts.height,
          opts.player1Name!,
          opts.player2Name!,
          opts.matchPercentage ?? 100
        );
      }

      gif.addFrame(offCtx, { copy: true, delay: opts.frameDelay });

      frameCount++;
      onProgress?.((frameCount / opts.totalFrames) * 0.5); // Progress: 0-50% for capture
    }, opts.frameDelay);

    // Timeout safety
    setTimeout(() => {
      clearInterval(captureInterval);
      reject(new Error('GIF export timed out'));
    }, 45000);
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download canvas as celebratory PNG keepsake
 */
export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename: string,
  player1Name?: string,
  player2Name?: string,
  matchPercentage?: number
): void {
  const offscreen = document.createElement('canvas');
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;
  const offCtx = offscreen.getContext('2d')!;

  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = 'high';
  offCtx.drawImage(canvas, 0, 0);

  if (player1Name && player2Name) {
    drawKeepsakeOverlay(
      offCtx,
      canvas.width,
      canvas.height,
      player1Name,
      player2Name,
      matchPercentage ?? 100
    );
  }

  const url = offscreen.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
