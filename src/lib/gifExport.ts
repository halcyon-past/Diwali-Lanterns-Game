'use client';

/**
 * GIF Export utility using gif.js
 * Records canvas frames and compiles them into a downloadable GIF
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
  quality: number; // 1-30, lower = better quality
  frameDelay: number; // ms between frames
  totalFrames: number;
}

const DEFAULT_OPTIONS: GifRecorderOptions = {
  width: 800,
  height: 600,
  quality: 10,
  frameDelay: 100,
  totalFrames: 50, // 5 seconds at 10fps
};

/**
 * Record frames from a canvas and export as GIF
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
      workers: 2,
      quality: opts.quality,
      width: opts.width,
      height: opts.height,
      workerScript: '/gif.worker.js',
    });

    // Create an offscreen canvas for frame capture at the target size
    const offscreen = document.createElement('canvas');
    offscreen.width = opts.width;
    offscreen.height = opts.height;
    const offCtx = offscreen.getContext('2d')!;

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
      offCtx.drawImage(canvas, 0, 0, opts.width, opts.height);
      gif.addFrame(offCtx, { copy: true, delay: opts.frameDelay });

      frameCount++;
      onProgress?.(frameCount / opts.totalFrames * 0.5); // Progress: 0-50% for capture
    }, opts.frameDelay);

    // Timeout safety
    setTimeout(() => {
      clearInterval(captureInterval);
      reject(new Error('GIF export timed out'));
    }, 30000);
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
 * Simple alternative: download canvas as PNG
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
