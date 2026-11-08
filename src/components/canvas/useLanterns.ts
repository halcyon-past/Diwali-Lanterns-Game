'use client';

import { useRef, useCallback } from 'react';
import { LANTERN_COLORS } from '@/lib/types';

export interface Lantern {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  opacity: number;
  phase: 'rising' | 'floating' | 'settled';
  swayOffset: number;
  swaySpeed: number;
  riseSpeed: number;
  glowIntensity: number;
  particles: LanternParticle[];
  settled: boolean;
}

interface LanternParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function useLanterns() {
  const lanternsRef = useRef<Lantern[]>([]);

  /**
   * Add a new lantern that launches from the bottom and rises up into the night skyline
   */
  const addLantern = useCallback(
    (canvasWidth: number, canvasHeight: number, questionIndex: number) => {
      const skylineBase = canvasHeight * 0.72;

      // Target position in the upper sky above the city
      const targetX = Math.random() * canvasWidth * 0.85 + canvasWidth * 0.075;
      const targetY = Math.random() * skylineBase * 0.65 + skylineBase * 0.05;

      const lantern: Lantern = {
        id: questionIndex,
        x: canvasWidth * 0.35 + Math.random() * canvasWidth * 0.3,
        y: canvasHeight + 40,
        targetX,
        targetY,
        size: 20 + Math.random() * 12,
        color: LANTERN_COLORS[questionIndex % LANTERN_COLORS.length],
        opacity: 0,
        phase: 'rising',
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.8 + Math.random() * 1.4,
        riseSpeed: 1.4 + Math.random() * 0.8,
        glowIntensity: 0.8 + Math.random() * 0.3,
        particles: [],
        settled: false,
      };

      lanternsRef.current = [...lanternsRef.current, lantern];
    },
    []
  );

  /**
   * Update all lantern physics and spark trails
   */
  const updateLanterns = useCallback((deltaTime: number) => {
    const dt = Math.min(deltaTime, 0.05);

    lanternsRef.current = lanternsRef.current.map((lantern) => {
      const updated = { ...lantern };

      if (updated.phase === 'rising') {
        updated.opacity = Math.min(1, updated.opacity + dt * 2.5);

        const dx = updated.targetX - updated.x;
        const dy = updated.targetY - updated.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 4) {
          updated.phase = 'floating';
          updated.x = updated.targetX;
          updated.y = updated.targetY;
        } else {
          const speed = updated.riseSpeed * 130 * dt;
          updated.x += (dx / dist) * speed;
          updated.y += (dy / dist) * speed;
        }

        // Generate glowing amber spark trail below rising lantern
        if (Math.random() < 0.45) {
          updated.particles.push({
            x: updated.x + (Math.random() - 0.5) * updated.size * 0.4,
            y: updated.y + updated.size * 1.1,
            vx: (Math.random() - 0.5) * 18,
            vy: Math.random() * 35 + 15,
            life: 1,
            maxLife: 1,
            size: Math.random() * 2.8 + 1,
          });
        }
      } else if (updated.phase === 'floating') {
        updated.settled = true;
      }

      // Update particle decay
      updated.particles = updated.particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy - 12 * dt,
          life: p.life - dt * 1.8,
        }))
        .filter((p) => p.life > 0);

      return updated;
    });
  }, []);

  /**
   * Render all lanterns with realistic light scattering and warm glowing core
   */
  const drawLanterns = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      for (const lantern of lanternsRef.current) {
        if (lantern.opacity <= 0) continue;

        const sway = Math.sin(time * lantern.swaySpeed + lantern.swayOffset) * 5;
        const bob = Math.sin(time * 1.1 + lantern.swayOffset) * 2.5;
        const drawX = lantern.x + sway;
        const drawY = lantern.y + bob;

        ctx.save();
        ctx.globalAlpha = lantern.opacity;

        // Wide outer ambient glow
        const outerGlow = ctx.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, lantern.size * 4.5
        );
        outerGlow.addColorStop(0, `${lantern.color}45`);
        outerGlow.addColorStop(0.45, `${lantern.color}15`);
        outerGlow.addColorStop(1, `${lantern.color}00`);

        ctx.beginPath();
        ctx.fillStyle = outerGlow;
        ctx.arc(drawX, drawY, lantern.size * 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Intense inner halo
        const midGlow = ctx.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, lantern.size * 2.2
        );
        midGlow.addColorStop(0, `${lantern.color}90`);
        midGlow.addColorStop(0.65, `${lantern.color}35`);
        midGlow.addColorStop(1, `${lantern.color}00`);

        ctx.beginPath();
        ctx.fillStyle = midGlow;
        ctx.arc(drawX, drawY, lantern.size * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Traditional paper lantern silhouette (elongated rounded cylinder)
        const bodyGradient = ctx.createRadialGradient(
          drawX, drawY - lantern.size * 0.15, lantern.size * 0.2,
          drawX, drawY, lantern.size
        );
        bodyGradient.addColorStop(0, '#FFFDF0');
        bodyGradient.addColorStop(0.25, '#FFE27A');
        bodyGradient.addColorStop(0.6, lantern.color);
        bodyGradient.addColorStop(1, adjustColor(lantern.color, -50));

        ctx.fillStyle = bodyGradient;

        ctx.beginPath();
        ctx.ellipse(
          drawX, drawY,
          lantern.size * 0.7, lantern.size,
          0, 0, Math.PI * 2
        );
        ctx.fill();

        // Bamboo / wire ribs structure
        ctx.strokeStyle = `${adjustColor(lantern.color, -65)}88`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(drawX, drawY - lantern.size);
        ctx.lineTo(drawX, drawY + lantern.size);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(
          drawX, drawY,
          lantern.size * 0.7, lantern.size * 0.25,
          0, 0, Math.PI * 2
        );
        ctx.stroke();

        // Top collar
        ctx.fillStyle = adjustColor(lantern.color, -45);
        ctx.beginPath();
        ctx.ellipse(
          drawX, drawY - lantern.size,
          lantern.size * 0.35, lantern.size * 0.1,
          0, 0, Math.PI * 2
        );
        ctx.fill();

        // Bottom combustion chamber / ring
        ctx.fillStyle = adjustColor(lantern.color, -35);
        ctx.beginPath();
        ctx.ellipse(
          drawX, drawY + lantern.size,
          lantern.size * 0.35, lantern.size * 0.1,
          0, 0, Math.PI * 2
        );
        ctx.fill();

        // Candle flame flicker in heart of lantern
        const flicker = 0.85 + Math.sin(time * 9 + lantern.swayOffset) * 0.1 +
                         Math.sin(time * 15 + lantern.swayOffset * 2) * 0.05;
        const flameCore = ctx.createRadialGradient(
          drawX, drawY + lantern.size * 0.2, 0,
          drawX, drawY + lantern.size * 0.2, lantern.size * 0.55
        );
        flameCore.addColorStop(0, `rgba(255, 255, 230, ${0.85 * flicker})`);
        flameCore.addColorStop(0.4, `rgba(255, 200, 80, ${0.5 * flicker})`);
        flameCore.addColorStop(1, 'rgba(255, 120, 30, 0)');

        ctx.beginPath();
        ctx.fillStyle = flameCore;
        ctx.arc(drawX, drawY + lantern.size * 0.2, lantern.size * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Spark particles trailing downwards
        for (const p of lantern.particles) {
          const pAlpha = (p.life / p.maxLife) * lantern.opacity;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 215, 100, ${pAlpha})`;
          ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    },
    []
  );

  const getLanternCount = useCallback(() => {
    return lanternsRef.current.length;
  }, []);

  return { addLantern, updateLanterns, drawLanterns, getLanternCount, lanternsRef };
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xFF) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xFF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
