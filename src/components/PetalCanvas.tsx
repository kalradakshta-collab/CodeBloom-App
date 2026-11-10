import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  color: string;
  opacity: number;
}

interface PetalCanvasProps {
  enabled?: boolean;
}

export const PetalCanvas: React.FC<PetalCanvasProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Respect user motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Blossom petal colors: soft pinks, pastel lavender & blush
    const petalColors = [
      '#F8DCE8',
      '#F5C5DA',
      '#FBE7F0',
      '#E9D5F5',
      '#FFE4D2'
    ];

    const petalCount = Math.min(28, Math.floor(width / 50));
    const petals: Petal[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 7,
        speedX: Math.random() * 0.9 + 0.3,
        speedY: Math.random() * 0.8 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.03 + 0.01,
        color: petalColors[Math.floor(Math.random() * petalColors.length)],
        opacity: Math.random() * 0.5 + 0.4
      });
    }

    let mouseX = width / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // Gentle breeze influence
        const breeze = ((mouseX - width / 2) / width) * 0.4;
        p.x += p.speedX + breeze;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -20;
        } else if (p.x < -20) {
          p.x = width + 20;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(1, Math.sin(p.flip));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        // Draw natural petal curve
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.6, p.size * 0.8, p.size * 0.4, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.4, -p.size * 0.7, -p.size * 0.6, 0, -p.size);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 transition-opacity duration-500"
      aria-hidden="true"
    />
  );
};
