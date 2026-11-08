'use client';

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { drawSkyline, drawGround } from './skylineShapes';
import { useStars } from './useStars';
import { useLanterns } from './useLanterns';
import { useParticles } from './useParticles';

export interface SkylineCanvasHandle {
  addLantern: (questionIndex: number) => void;
  spawnCelebration: (x: number, y: number) => void;
  getCanvas: () => HTMLCanvasElement | null;
  captureFrame: () => string | null;
}

interface SkylineCanvasProps {
  className?: string;
  showLanternCount?: boolean;
  lanternCount?: number;
  totalQuestions?: number;
}

const SkylineCanvas = forwardRef<SkylineCanvasHandle, SkylineCanvasProps>(
  function SkylineCanvas({ className = '', showLanternCount, lanternCount = 0, totalQuestions = 0 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    const { initStars, drawStars } = useStars(550);
    const { addLantern, updateLanterns, drawLanterns } = useLanterns();
    const { spawnParticles, updateParticles, drawParticles, spawnBurst } = useParticles(150);

    const drawSky = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Midnight Diwali gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, '#0a0015');
      skyGradient.addColorStop(0.2, '#120025');
      skyGradient.addColorStop(0.45, '#0e183a');
      skyGradient.addColorStop(0.72, '#0c1445');
      skyGradient.addColorStop(0.88, '#16103c');
      skyGradient.addColorStop(1, '#0a0a14');

      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Deep purple ethereal cosmos glow
      const nebula1 = ctx.createRadialGradient(
        width * 0.75, height * 0.22, 0,
        width * 0.75, height * 0.22, width * 0.45
      );
      nebula1.addColorStop(0, 'rgba(90, 25, 120, 0.18)');
      nebula1.addColorStop(0.5, 'rgba(50, 15, 80, 0.08)');
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      // Soft blue night haze
      const nebula2 = ctx.createRadialGradient(
        width * 0.2, height * 0.38, 0,
        width * 0.2, height * 0.38, width * 0.35
      );
      nebula2.addColorStop(0, 'rgba(25, 55, 110, 0.14)');
      nebula2.addColorStop(0.6, 'rgba(12, 25, 60, 0.05)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);
    }, []);

    const render = useCallback(
      (timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const time = (timestamp - startTimeRef.current) / 1000;
        const deltaTime = lastTimeRef.current
          ? (timestamp - lastTimeRef.current) / 1000
          : 0.016;
        lastTimeRef.current = timestamp;

        const width = canvas.width;
        const height = canvas.height;
        const skylineBase = height * 0.26;

        ctx.clearRect(0, 0, width, height);

        // Render layers from background to foreground
        drawSky(ctx, width, height);
        drawStars(ctx, time);
        drawLanterns(ctx, time);
        drawParticles(ctx, time);
        drawSkyline(ctx, { width, height, baseY: skylineBase });
        drawGround(ctx, width, height, skylineBase);

        // Update physics
        updateLanterns(deltaTime);
        updateParticles(deltaTime);

        // Subtle ambient sparkles
        if (Math.random() < 0.12) {
          spawnParticles(width, height, 1);
        }

        // Live lantern counter badge on canvas
        if (showLanternCount && totalQuestions > 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 215, 80, 0.95)';
          ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'right';
          ctx.shadowColor = 'rgba(255, 140, 0, 0.8)';
          ctx.shadowBlur = 8;
          ctx.fillText(
            `🪔 ${lanternCount} / ${totalQuestions} Lanterns Lit`,
            width - 20,
            32
          );
          ctx.restore();
        }

        animationRef.current = requestAnimationFrame(render);
      },
      [
        drawSky, drawStars, drawLanterns, drawParticles, updateLanterns,
        updateParticles, spawnParticles, showLanternCount, lanternCount, totalQuestions,
      ]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        initStars(rect.width, rect.height);
      };

      resize();
      window.addEventListener('resize', resize);
      animationRef.current = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationRef.current);
      };
    }, [initStars, render]);

    useImperativeHandle(ref, () => ({
      addLantern: (questionIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        addLantern(canvas.width, canvas.height, questionIndex);

        const burstX = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
        const burstY = canvas.height * 0.35 + Math.random() * canvas.height * 0.25;
        spawnBurst(burstX, burstY, 35);
      },
      spawnCelebration: (x: number, y: number) => {
        spawnBurst(x, y, 40);
      },
      getCanvas: () => canvasRef.current,
      captureFrame: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.toDataURL('image/png');
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${className}`}
        style={{ display: 'block' }}
      />
    );
  }
);

export default SkylineCanvas;
