/**
 * Skyline drawing functions for the Diwali night sky canvas.
 * Draws an Indian city skyline with temples, domes, and buildings.
 */

export interface SkylineConfig {
  width: number;
  height: number;
  baseY: number; // Y position where skyline starts (from bottom)
}

/**
 * Draw the complete skyline silhouette
 */
export function drawSkyline(
  ctx: CanvasRenderingContext2D,
  config: SkylineConfig
): void {
  const { width, height, baseY } = config;
  const skylineY = height - baseY;

  ctx.save();
  ctx.fillStyle = '#0a0a12';
  ctx.beginPath();
  ctx.moveTo(0, height);

  // Segment width for building placement
  const segments = 40;
  const segWidth = width / segments;

  // Building heights and shapes
  const buildings = generateBuildings(segments, baseY);

  let x = 0;
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];
    const bx = x;
    const bw = segWidth * b.width;

    switch (b.type) {
      case 'temple':
        drawTemple(ctx, bx, skylineY, bw, b.height);
        break;
      case 'dome':
        drawDome(ctx, bx, skylineY, bw, b.height);
        break;
      case 'tower':
        drawTower(ctx, bx, skylineY, bw, b.height);
        break;
      case 'building':
        drawBuilding(ctx, bx, skylineY, bw, b.height);
        break;
      case 'minaret':
        drawMinaret(ctx, bx, skylineY, bw, b.height);
        break;
    }

    x += bw;
    if (x >= width) break;
  }

  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Draw lit festive windows and diyas along the roofs
  drawWindows(ctx, buildings, segWidth, skylineY, width);
  drawRoofDiyas(ctx, buildings, segWidth, skylineY, width);

  ctx.restore();
}

interface Building {
  type: 'temple' | 'dome' | 'tower' | 'building' | 'minaret';
  width: number; // in segments
  height: number; // in pixels
}

function generateBuildings(segments: number, maxHeight: number): Building[] {
  const buildings: Building[] = [];
  const types: Building['type'][] = ['temple', 'dome', 'tower', 'building', 'minaret'];
  let remaining = segments;

  // Seed a deterministic but varied skyline
  const seed = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2];

  let idx = 0;
  while (remaining > 0) {
    const w = Math.min(1 + (seed[idx % seed.length] % 3), remaining);
    const typeIdx = seed[idx % seed.length] % types.length;
    const heightFactor = 0.35 + (seed[(idx + 3) % seed.length] / 10) * 0.55;

    buildings.push({
      type: types[typeIdx],
      width: w,
      height: maxHeight * Math.min(heightFactor, 0.95),
    });

    remaining -= w;
    idx++;
  }

  return buildings;
}

function drawTemple(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number,
  w: number, h: number
): void {
  const centerX = x + w / 2;
  const topY = baseY - h;
  const spireH = h * 0.35;

  ctx.lineTo(x, baseY);
  ctx.lineTo(x, baseY - h * 0.45);

  ctx.lineTo(x + w * 0.1, baseY - h * 0.5);
  ctx.lineTo(x + w * 0.1, baseY - h * 0.6);
  ctx.lineTo(x + w * 0.2, baseY - h * 0.65);
  ctx.lineTo(x + w * 0.2, baseY - h * 0.72);

  ctx.lineTo(centerX - w * 0.05, baseY - h + spireH);
  ctx.lineTo(centerX, topY);
  ctx.lineTo(centerX + w * 0.05, baseY - h + spireH);

  ctx.lineTo(x + w * 0.8, baseY - h * 0.72);
  ctx.lineTo(x + w * 0.8, baseY - h * 0.65);
  ctx.lineTo(x + w * 0.9, baseY - h * 0.6);
  ctx.lineTo(x + w * 0.9, baseY - h * 0.5);
  ctx.lineTo(x + w, baseY - h * 0.45);
  ctx.lineTo(x + w, baseY);
}

function drawDome(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number,
  w: number, h: number
): void {
  const centerX = x + w / 2;

  ctx.lineTo(x, baseY);
  ctx.lineTo(x, baseY - h * 0.4);

  ctx.quadraticCurveTo(x, baseY - h * 0.9, centerX, baseY - h);
  ctx.quadraticCurveTo(x + w, baseY - h * 0.9, x + w, baseY - h * 0.4);

  ctx.lineTo(x + w, baseY);
}

function drawTower(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number,
  w: number, h: number
): void {
  const towerW = w * 0.45;
  const towerX = x + (w - towerW) / 2;

  ctx.lineTo(x, baseY);
  ctx.lineTo(x, baseY - h * 0.3);
  ctx.lineTo(towerX, baseY - h * 0.3);

  ctx.lineTo(towerX, baseY - h * 0.85);

  ctx.lineTo(x + w / 2, baseY - h);
  ctx.lineTo(towerX + towerW, baseY - h * 0.85);

  ctx.lineTo(towerX + towerW, baseY - h * 0.3);
  ctx.lineTo(x + w, baseY - h * 0.3);
  ctx.lineTo(x + w, baseY);
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number,
  w: number, h: number
): void {
  ctx.lineTo(x, baseY);
  ctx.lineTo(x, baseY - h);
  ctx.lineTo(x + w, baseY - h);
  ctx.lineTo(x + w, baseY);
}

function drawMinaret(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number,
  w: number, h: number
): void {
  const centerX = x + w / 2;
  const minaretW = w * 0.25;

  ctx.lineTo(x, baseY);
  ctx.lineTo(x, baseY - h * 0.2);
  ctx.lineTo(centerX - minaretW, baseY - h * 0.2);

  ctx.lineTo(centerX - minaretW, baseY - h * 0.7);
  ctx.lineTo(centerX - minaretW * 1.5, baseY - h * 0.75);
  ctx.quadraticCurveTo(centerX, baseY - h * 1.1, centerX + minaretW * 1.5, baseY - h * 0.75);
  ctx.lineTo(centerX + minaretW, baseY - h * 0.7);

  ctx.lineTo(centerX + minaretW, baseY - h * 0.2);
  ctx.lineTo(x + w, baseY - h * 0.2);
  ctx.lineTo(x + w, baseY);
}

function drawWindows(
  ctx: CanvasRenderingContext2D,
  buildings: Building[],
  segWidth: number,
  skylineY: number,
  canvasWidth: number
): void {
  ctx.save();

  let x = 0;
  for (const b of buildings) {
    const bw = segWidth * b.width;
    const windowCount = Math.floor(b.width * 2);
    const maxWindowH = b.height * 0.45;

    for (let i = 0; i < windowCount; i++) {
      if (((x * 7 + i * 13) % 5) > 2) continue;

      const wx = x + (bw / (windowCount + 1)) * (i + 1);
      const wy = skylineY - maxWindowH * 0.35 - ((i * 17) % 3) * 10;

      if (wx >= canvasWidth) break;

      const gradient = ctx.createRadialGradient(wx, wy, 0, wx, wy, 5);
      gradient.addColorStop(0, 'rgba(255, 215, 100, 0.95)');
      gradient.addColorStop(1, 'rgba(255, 180, 50, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(wx - 5, wy - 5, 10, 10);

      ctx.fillStyle = 'rgba(255, 230, 150, 0.85)';
      ctx.fillRect(wx - 1.5, wy - 2.5, 3, 5);
    }

    x += bw;
  }

  ctx.restore();
}

function drawRoofDiyas(
  ctx: CanvasRenderingContext2D,
  buildings: Building[],
  segWidth: number,
  skylineY: number,
  canvasWidth: number
): void {
  ctx.save();
  let x = 0;
  for (const b of buildings) {
    const bw = segWidth * b.width;
    const diyaX = x + bw * 0.5;
    const diyaY = skylineY - b.height * 0.4;

    if (diyaX < canvasWidth && Math.random() > 0.4) {
      // Golden diya flame glow
      const flameGrad = ctx.createRadialGradient(diyaX, diyaY, 0, diyaX, diyaY, 7);
      flameGrad.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
      flameGrad.addColorStop(0.5, 'rgba(255, 100, 20, 0.4)');
      flameGrad.addColorStop(1, 'rgba(255, 60, 0, 0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(diyaX, diyaY, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    x += bw;
  }
  ctx.restore();
}

/**
 * Draw ground / horizon line with deep night gradient
 */
export function drawGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseY: number
): void {
  const groundY = height - baseY;
  const gradient = ctx.createLinearGradient(0, groundY, 0, height);
  gradient.addColorStop(0, '#0a0a14');
  gradient.addColorStop(0.3, '#06060c');
  gradient.addColorStop(1, '#020205');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, groundY, width, baseY);
}
