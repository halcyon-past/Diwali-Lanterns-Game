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

    const { initStars, drawStars } = useStars(600);
    const { addLantern, initAmbientLanterns, updateLanterns, drawLanterns } = useLanterns();
    const { spawnParticles, updateParticles, drawParticles, spawnBurst } = useParticles(160);

    const drawSky = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Cosmic Diwali midnight gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, '#04010b');
      skyGradient.addColorStop(0.2, '#0c021f');
      skyGradient.addColorStop(0.45, '#0a1033');
      skyGradient.addColorStop(0.7, '#0f0e38');
      skyGradient.addColorStop(0.88, '#1b0e35');
      skyGradient.addColorStop(1, '#090514');

      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Ethereal royal purple nebula
      const nebula1 = ctx.createRadialGradient(
        width * 0.72, height * 0.25, 0,
        width * 0.72, height * 0.25, width * 0.5
      );
      nebula1.addColorStop(0, 'rgba(120, 30, 150, 0.22)');
      nebula1.addColorStop(0.5, 'rgba(60, 15, 90, 0.09)');
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      // Golden horizon ambient haze from millions of Diwali celebrations
      const goldenHaze = ctx.createLinearGradient(0, height * 0.55, 0, height);
      goldenHaze.addColorStop(0, 'rgba(255, 140, 20, 0)');
      goldenHaze.addColorStop(0.7, 'rgba(255, 120, 20, 0.08)');
      goldenHaze.addColorStop(1, 'rgba(255, 160, 40, 0.18)');

      ctx.fillStyle = goldenHaze;
      ctx.fillRect(0, height * 0.55, width, height * 0.45);
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
        const skylineBase = height * 0.24;

        ctx.clearRect(0, 0, width, height);

        drawSky(ctx, width, height);
        drawStars(ctx, time);
        drawLanterns(ctx, time);
        drawParticles(ctx, time);
        drawSkyline(ctx, { width, height, baseY: skylineBase });
        drawGround(ctx, width, height, skylineBase);

        updateLanterns(deltaTime);
        updateParticles(deltaTime);

        if (Math.random() < 0.15) {
          spawnParticles(width, height, 1);
        }

        if (showLanternCount && totalQuestions > 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 220, 100, 0.95)';
          ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Outfit", sans-serif';
          ctx.textAlign = 'right';
          ctx.shadowColor = 'rgba(255, 150, 0, 0.9)';
          ctx.shadowBlur = 10;
          ctx.fillText(
            `🪔 ${lanternCount} / ${totalQuestions} Lanterns Ascending`,
            width - 24,
            36
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
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        initStars(w, h);
        initAmbientLanterns(w, h);
      };

      resize();
      window.addEventListener('resize', resize);
      animationRef.current = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationRef.current);
      };
    }, [initStars, initAmbientLanterns, render]);

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
        className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          display: 'block',
        }}
      />
    );
  }
);

export default SkylineCanvas;
