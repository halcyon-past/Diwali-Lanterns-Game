'use client';

import { useRef, useCallback } from 'react';

export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

/**
 * Hook to manage star field rendering on canvas
 */
export function useStars(count: number = 550) {
  const starsRef = useRef<Star[]>([]);
  const initialized = useRef(false);

  const initStars = useCallback((width: number, height: number) => {
    if (initialized.current && starsRef.current.length > 0) return;

    const stars: Star[] = [];
    const colors = [
      'rgba(255, 255, 255,',
      'rgba(255, 245, 210,',
      'rgba(210, 230, 255,',
      'rgba(255, 220, 180,',
      'rgba(235, 215, 255,',
    ];

    for (let i = 0; i < count; i++) {
      // Exponential distribution to cluster more stars in the upper night sky
      const yBias = Math.pow(Math.random(), 1.4);

      stars.push({
        x: Math.random() * width,
        y: yBias * height * 0.78, // Keep in upper night sky
        size: Math.random() * 2.4 + 0.4,
        brightness: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 3.5 + 1.2,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    starsRef.current = stars;
    initialized.current = true;
  }, [count]);

  const drawStars = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const stars = starsRef.current;

      for (const star of stars) {
        // Twinkling brightness
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const alpha = star.brightness * (0.35 + twinkle * 0.65);

        ctx.beginPath();
        ctx.fillStyle = `${star.color}${alpha})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering aura for brighter stars
        if (star.size > 1.8 && alpha > 0.6) {
          const glowSize = star.size * 3.2;
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, glowSize
          );
          gradient.addColorStop(0, `${star.color}${alpha * 0.45})`);
          gradient.addColorStop(1, `${star.color}0)`);

          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // 4-point sparkle cross for prominent stars
          if (star.size > 2.1) {
            ctx.strokeStyle = `${star.color}${alpha * 0.35})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(star.x - glowSize * 1.2, star.y);
            ctx.lineTo(star.x + glowSize * 1.2, star.y);
            ctx.moveTo(star.x, star.y - glowSize * 1.2);
            ctx.lineTo(star.x, star.y + glowSize * 1.2);
            ctx.stroke();
          }
        }
      }
    },
    []
  );

  return { initStars, drawStars };
}
