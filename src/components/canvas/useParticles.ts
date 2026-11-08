'use client';

import { useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'sparkle' | 'firefly' | 'dust';
}

export function useParticles(maxParticles: number = 120) {
  const particlesRef = useRef<Particle[]>([]);

  const spawnParticles = useCallback(
    (width: number, height: number, count: number = 3) => {
      if (particlesRef.current.length >= maxParticles) return;

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const type = Math.random() < 0.35
          ? 'sparkle'
          : Math.random() < 0.65
          ? 'firefly'
          : 'dust';

        const particle: Particle = {
          x: Math.random() * width,
          y: Math.random() * height * 0.8,
          vx: (Math.random() - 0.5) * 16,
          vy: (Math.random() - 0.5) * 10 - 4,
          size: type === 'sparkle'
            ? Math.random() * 2 + 1.2
            : type === 'firefly'
            ? Math.random() * 3 + 1.2
            : Math.random() * 1.5 + 0.4,
          life: 1,
          maxLife: 1,
          color:
            type === 'sparkle'
              ? 'rgba(255, 215, 0,'
              : type === 'firefly'
              ? 'rgba(210, 255, 120,'
              : 'rgba(255, 240, 220,',
          type,
        };

        newParticles.push(particle);
      }

      particlesRef.current = [...particlesRef.current, ...newParticles];
    },
    [maxParticles]
  );

  const updateParticles = useCallback((dt: number) => {
    particlesRef.current = particlesRef.current
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        life: p.life - dt * (p.type === 'dust' ? 0.3 : p.type === 'firefly' ? 0.45 : 0.85),
        vy: p.type === 'firefly' ? p.vy + Math.sin(Date.now() * 0.003) * 0.4 : p.vy,
      }))
      .filter((p) => p.life > 0);
  }, []);

  const drawParticles = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      for (const p of particlesRef.current) {
        const alpha = p.life / p.maxLife;

        if (p.type === 'sparkle') {
          const sparkleSize = p.size * (1 + Math.sin(time * 12) * 0.35);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(time * 2.5);

          ctx.strokeStyle = `${p.color}${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(-sparkleSize, 0);
          ctx.lineTo(sparkleSize, 0);
          ctx.moveTo(0, -sparkleSize);
          ctx.lineTo(0, sparkleSize);
          ctx.stroke();

          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === 'firefly') {
          const glow = ctx.createRadialGradient(
            p.x, p.y, 0,
            p.x, p.y, p.size * 3.5
          );
          const pulse = Math.sin(time * 4.5 + p.x) * 0.35 + 0.65;
          glow.addColorStop(0, `${p.color}${alpha * pulse})`);
          glow.addColorStop(1, `${p.color}0)`);

          ctx.beginPath();
          ctx.fillStyle = glow;
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.fillStyle = `${p.color}${alpha * 0.45})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    []
  );

  const spawnBurst = useCallback(
    (x: number, y: number, count: number = 30) => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 40 + Math.random() * 70;

        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 1.2,
          life: 1,
          maxLife: 1,
          color: Math.random() > 0.4
            ? 'rgba(255, 215, 0,'
            : 'rgba(255, 120, 30,',
          type: 'sparkle',
        });
      }
      particlesRef.current = [...particlesRef.current, ...newParticles];
    },
    []
  );

  return { spawnParticles, updateParticles, drawParticles, spawnBurst };
}
