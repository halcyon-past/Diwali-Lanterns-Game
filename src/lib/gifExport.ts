'use client';

/**
 * GIF Export utility using gif.js
 * Records canvas frames and compiles them into a high-quality downloadable keepsake GIF
 */

// Dynamic import for gif.js (it uses Web Workers)
let GIFConstructor: typeof import('gif.js').default | null = null;

async function loadGIF() {
  if (!GIFConstructor) {
    const mod = await import('gif.js');
    GIFConstructor = mod.default;
  }
  return GIFConstructor;
}

export interface GifRecorderOptions {
  width: number;
  height: number;
  quality: number; // 1-30, lower = better quality (3 = crisp high quality)
  frameDelay: number; // ms between frames
  totalFrames: number;
  player1Name?: string;
  player2Name?: string;
  matchPercentage?: number;
}

const DEFAULT_OPTIONS: GifRecorderOptions = {
  width: 800,
  height: 600,
  quality: 3, // High quality color palette
  frameDelay: 90,
  totalFrames: 42,
};

/**
 * Draw celebratory keepsake overlay on the final frames of the GIF
 */
function drawEndOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  player1Name: string,
  player2Name: string,
  matchPercentage: number,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, alpha));

  // Subtle dark vignette to make the festive golden text pop
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.15,
    width / 2, height / 2, width * 0.65
  );
  vignette.addColorStop(0, 'rgba(10, 1, 24, 0.42)');
  vignette.addColorStop(1, 'rgba(5, 0, 15, 0.75)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // Center celebratory greeting card
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Floating Diyas & sparkles above text
  ctx.font = '28px sans-serif';
  ctx.fillText('✨  🪔  ✨', width / 2, height / 2 - 68);

  // Middle line 1: "Happy Diwali to"
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
  ctx.fillStyle = '#FFF8E1';
  ctx.shadowColor = 'rgba(255, 180, 50, 0.85)';
  ctx.shadowBlur = 14;
  ctx.fillText('Happy Diwali to', width / 2, height / 2 - 25);

  // Middle line 2: "Name1 & Name2"
  ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
  ctx.fillStyle = '#FFE082';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.95)';
  ctx.shadowBlur = 24;
  const namesText = `${player1Name} & ${player2Name}`;
  ctx.fillText(namesText, width / 2, height / 2 + 22);

  // Decorative divider
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(255, 224, 130, 0.7)';
  ctx.shadowBlur = 8;
  ctx.fillText('✦   •   ✦', width / 2, height / 2 + 58);

  // Bottom Badge: Match percentage
  const badgeY = height - 54;
  const badgeText = `❤️ ${matchPercentage}% Match  •  Diwali Lanterns 🪔`;

  ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
  const textWidth = ctx.measureText(badgeText).width;
  const badgeWidth = textWidth + 36;
  const badgeHeight = 36;
  const badgeX = (width - badgeWidth) / 2;

  // Badge background with gold border
  ctx.fillStyle = 'rgba(20, 5, 38, 0.82)';
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.65)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(255, 180, 50, 0.6)';
  ctx.shadowBlur = 15;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 18);
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
    const gif = new GIF({
      workers: 3,
      quality: opts.quality,
      width: opts.width,
      height: opts.height,
      workerScript: '/gif.worker.js',
      dither: 'FloydSteinberg',
    });

    // Create an offscreen canvas for frame capture at target size
    const offscreen = document.createElement('canvas');
    offscreen.width = opts.width;
    offscreen.height = opts.height;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true })!;

    const hasEndOverlay = Boolean(opts.player1Name && opts.player2Name);
    const overlayFramesCount = 15; // final ~1.5s shows the grand celebratory greeting
    const overlayStartFrame = Math.max(0, opts.totalFrames - overlayFramesCount);

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

      // Draw current canvas state to offscreen canvas
      offCtx.clearRect(0, 0, opts.width, opts.height);
      offCtx.drawImage(canvas, 0, 0, opts.width, opts.height);

      // On final frames, progressively overlay the custom names & match percentage
      let delay = opts.frameDelay;
      if (hasEndOverlay && frameCount >= overlayStartFrame) {
        const overlayStep = frameCount - overlayStartFrame;
        const alpha = Math.min(1, (overlayStep + 1) / 4); // Fades in smoothly over 4 frames

        drawEndOverlay(
          offCtx,
          opts.width,
          opts.height,
          opts.player1Name!,
          opts.player2Name!,
          opts.matchPercentage ?? 100,
          alpha
        );

        // Pause slightly longer on the final 3 frames so players can admire the keepsake
        if (frameCount >= opts.totalFrames - 3) {
          delay = opts.frameDelay * 2.8; // ~250ms hold
        }
      }

      gif.addFrame(offCtx, { copy: true, delay });

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

  offCtx.drawImage(canvas, 0, 0);

  if (player1Name && player2Name) {
    drawEndOverlay(
      offCtx,
      canvas.width,
      canvas.height,
      player1Name,
      player2Name,
      matchPercentage ?? 100,
      1
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
