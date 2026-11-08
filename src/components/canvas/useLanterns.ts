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
   * Sky starts 100% empty; lanterns only appear when correct answers match
   */
  const initAmbientLanterns = useCallback((_width: number, _height: number) => {
    lanternsRef.current = [];
  }, []);

  /**
   * Add a new lantern that launches from the city and rises into the night skyline,
   * intelligently distributed across the entire sky to maximize clearance from other lanterns.
   */
  const addLantern = useCallback(
    (canvasWidth: number, canvasHeight: number, questionIndex: number) => {
      const skylineBase = canvasHeight * 0.72;
      const minX = canvasWidth * 0.08;
      const maxX = canvasWidth * 0.92;
      const minY = skylineBase * 0.08;
      const maxY = skylineBase * 0.78;

      const existing = lanternsRef.current;
      let bestX = canvasWidth * 0.5;
      let bestY = skylineBase * 0.4;
      let bestDist = -1;

      if (existing.length === 0) {
        // First lantern: graceful center-upper sky position with slight random jitter
        bestX = canvasWidth * 0.45 + Math.random() * canvasWidth * 0.1;
        bestY = skylineBase * 0.32 + Math.random() * skylineBase * 0.15;
      } else {
        // Intelligent clearance placement: sample 32 candidates across the sky
        // and pick the candidate with the greatest distance from any existing lantern
        const candidateCount = 32;
        for (let i = 0; i < candidateCount; i++) {
          const candX = minX + Math.random() * (maxX - minX);
          const candY = minY + Math.random() * (maxY - minY);

          let minDist = Infinity;
          for (const l of existing) {
            const dist = Math.hypot(candX - l.targetX, (candY - l.targetY) * 1.35);
            if (dist < minDist) {
              minDist = dist;
            }
          }

          if (minDist > bestDist) {
            bestDist = minDist;
            bestX = candX;
            bestY = candY;
          }
        }
      }

      // Depth sizing: lanterns higher up in the distance are smaller (18-22px),
      // while lanterns closer are larger (28-35px) for atmospheric perspective
      const depthRatio = Math.max(0, Math.min(1, (bestY - minY) / (maxY - minY)));
      const baseSize = 18 + depthRatio * 16;

      const lantern: Lantern = {
        id: questionIndex,
        x: bestX + (Math.random() - 0.5) * 50,
        y: canvasHeight + 50,
        targetX: bestX,
        targetY: bestY,
        size: baseSize,
        color: LANTERN_COLORS[questionIndex % LANTERN_COLORS.length],
        opacity: 0,
        phase: 'rising',
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.7 + Math.random() * 0.9,
        riseSpeed: 1.4 + Math.random() * 0.5,
        glowIntensity: 0.9 + Math.random() * 0.25,
        particles: [],
        settled: false,
      };

      lanternsRef.current = [...lanternsRef.current, lantern];
    },
    []
  );

  const updateLanterns = useCallback((deltaTime: number) => {
    const dt = Math.min(deltaTime, 0.05);

    lanternsRef.current = lanternsRef.current.map((lantern) => {
      const updated = { ...lantern };

      if (updated.phase === 'rising') {
        updated.opacity = Math.min(1, updated.opacity + dt * 2.5);

        const dx = updated.targetX - updated.x;
        const dy = updated.targetY - updated.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          updated.phase = 'floating';
          updated.x = updated.targetX;
          updated.y = updated.targetY;
        } else {
          const speed = updated.riseSpeed * 130 * dt;
          updated.x += (dx / dist) * speed;
          updated.y += (dy / dist) * speed;
        }

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

  const drawLanterns = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      for (const lantern of lanternsRef.current) {
        if (lantern.opacity <= 0) continue;

        const sway = Math.sin(time * lantern.swaySpeed + lantern.swayOffset) * 6;
        const bob = Math.sin(time * 1.1 + lantern.swayOffset) * 3;
        const drawX = lantern.x + sway;
        const drawY = lantern.y + bob;

        ctx.save();
        ctx.globalAlpha = lantern.opacity;

        // Wide outer ambient glow
        const outerGlow = ctx.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, lantern.size * 4.8
        );
        outerGlow.addColorStop(0, `${lantern.color}50`);
        outerGlow.addColorStop(0.45, `${lantern.color}18`);
        outerGlow.addColorStop(1, `${lantern.color}00`);

        ctx.beginPath();
        ctx.fillStyle = outerGlow;
        ctx.arc(drawX, drawY, lantern.size * 4.8, 0, Math.PI * 2);
        ctx.fill();

        // Intense inner halo
        const midGlow = ctx.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, lantern.size * 2.3
        );
        midGlow.addColorStop(0, `${lantern.color}95`);
        midGlow.addColorStop(0.65, `${lantern.color}40`);
        midGlow.addColorStop(1, `${lantern.color}00`);

        ctx.beginPath();
        ctx.fillStyle = midGlow;
        ctx.arc(drawX, drawY, lantern.size * 2.3, 0, Math.PI * 2);
        ctx.fill();

        // Paper lantern gradient
        const bodyGradient = ctx.createRadialGradient(
          drawX, drawY - lantern.size * 0.15, lantern.size * 0.2,
          drawX, drawY, lantern.size
        );
        bodyGradient.addColorStop(0, '#FFFDF5');
        bodyGradient.addColorStop(0.25, '#FFE58A');
        bodyGradient.addColorStop(0.6, lantern.color);
        bodyGradient.addColorStop(1, adjustColor(lantern.color, -50));

        ctx.fillStyle = bodyGradient;

        ctx.beginPath();
        ctx.ellipse(
          drawX, drawY,
          lantern.size * 0.72, lantern.size,
          0, 0, Math.PI * 2
        );
        ctx.fill();

        // Bamboo / wire ribs structure
        ctx.strokeStyle = `${adjustColor(lantern.color, -70)}99`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(drawX, drawY - lantern.size);
        ctx.lineTo(drawX, drawY + lantern.size);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(
          drawX, drawY,
          lantern.size * 0.72, lantern.size * 0.28,
          0, 0, Math.PI * 2
        );
        ctx.stroke();

        // Top collar
        ctx.fillStyle = adjustColor(lantern.color, -50);
        ctx.beginPath();
        ctx.ellipse(
          drawX, drawY - lantern.size,
          lantern.size * 0.35, lantern.size * 0.1,
          0, 0, Math.PI * 2
        );
        ctx.fill();

        // Bottom combustion chamber
        ctx.fillStyle = adjustColor(lantern.color, -40);
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
          drawX, drawY + lantern.size * 0.2, lantern.size * 0.58
        );
        flameCore.addColorStop(0, `rgba(255, 255, 240, ${0.9 * flicker})`);
        flameCore.addColorStop(0.4, `rgba(255, 205, 90, ${0.55 * flicker})`);
        flameCore.addColorStop(1, 'rgba(255, 120, 30, 0)');

        ctx.beginPath();
        ctx.fillStyle = flameCore;
        ctx.arc(drawX, drawY + lantern.size * 0.2, lantern.size * 0.58, 0, Math.PI * 2);
        ctx.fill();

        // Spark particles trailing downwards
        for (const p of lantern.particles) {
          const pAlpha = (p.life / p.maxLife) * lantern.opacity;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 220, 110, ${pAlpha})`;
          ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    },
    []
  );

  const clearLanterns = useCallback(() => {
    lanternsRef.current = [];
  }, []);

  const getLanternCount = useCallback(() => {
    return lanternsRef.current.filter((l) => l.id >= 0).length;
  }, []);

  return { addLantern, clearLanterns, initAmbientLanterns, updateLanterns, drawLanterns, getLanternCount, lanternsRef };
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xFF) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xFF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
