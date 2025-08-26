import React, { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CanvasBackgroundProps {
  variant?: 'constellation' | 'neural' | 'flow' | 'matrix';
  className?: string;
}

export function CanvasBackground({ variant = 'constellation', className = '' }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const shouldReduceMotion = useReducedMotion();

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Optimize canvas for performance
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Set canvas size with device pixel ratio for crisp rendering
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Animation variants
    const animations = {
      constellation: () => createConstellationAnimation(ctx, canvas, animationRef),
      neural: () => createNeuralNetworkAnimation(ctx, canvas, animationRef),
      flow: () => createFlowFieldAnimation(ctx, canvas, animationRef),
      matrix: () => createMatrixAnimation(ctx, canvas, animationRef),
    };

    const cleanup = animations[variant]();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      cleanup?.();
    };
  }, [variant]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    return initCanvas();
  }, [initCanvas, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div className={`fixed inset-0 -z-10 bg-gradient-to-br from-background via-background/98 to-primary/6 ${className}`} />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 w-full h-full ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}

// Get theme colors from CSS variables
function getThemeColors() {
  const root = document.documentElement;
  const style = getComputedStyle(root);

  // Parse HSL values and convert to rgba
  const parseHSL = (hslString: string, alpha: number = 1) => {
    const values = hslString.trim().split(' ');
    if (values.length >= 3) {
      const h = parseFloat(values[0]) || 0;
      const s = parseFloat(values[1].replace('%', '')) || 0;
      const l = parseFloat(values[2].replace('%', '')) || 0;

      // Convert HSL to RGB
      const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l / 100 - c / 2;

      let r = 0, g = 0, b = 0;
      if (h < 60) { r = c; g = x; b = 0; }
      else if (h < 120) { r = x; g = c; b = 0; }
      else if (h < 180) { r = 0; g = c; b = x; }
      else if (h < 240) { r = 0; g = x; b = c; }
      else if (h < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgba(99, 102, 241, ${alpha})`; // fallback
  };

  return {
    primary: parseHSL(style.getPropertyValue('--primary').trim()),
    accent: parseHSL(style.getPropertyValue('--accent').trim()),
    secondary: parseHSL(style.getPropertyValue('--secondary').trim()),
    background: parseHSL(style.getPropertyValue('--background').trim()),
  };
}

// Optimized constellation animation
function createConstellationAnimation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  animationRef: React.MutableRefObject<number | undefined>
) {
  const nodes: Node[] = [];
  const nodeCount = 60; // Reduced for better performance
  const connectionDistance = 100;
  const colors = getThemeColors();

  interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }

  // Initialize nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * canvas.width / (window.devicePixelRatio || 1),
      y: Math.random() * canvas.height / (window.devicePixelRatio || 1),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.2,
    });
  }

  let lastTime = 0;
  const targetFPS = 60;
  const frameInterval = 1000 / targetFPS;

  function animate(currentTime: number) {
    if (currentTime - lastTime < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Clear with subtle background
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // Update and draw nodes
    nodes.forEach((node) => {
      // Update position
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off edges with padding
      const padding = 50;
      if (node.x < padding || node.x > width - padding) node.vx *= -0.8;
      if (node.y < padding || node.y > height - padding) node.vy *= -0.8;

      // Keep nodes in bounds
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));

      // Draw node with theme color
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary.replace(/[\d.]+\)$/g, `${node.opacity})`);
      ctx.fill();
    });

    // Draw connections (optimized)
    ctx.strokeStyle = colors.primary.replace(/[\d.]+\)$/g, '0.15)');
    ctx.lineWidth = 0.5;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.2;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    animationRef.current = requestAnimationFrame(animate);
  }

  animate(0);

  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}

// Optimized neural network animation
function createNeuralNetworkAnimation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  animationRef: React.MutableRefObject<number | undefined>
) {
  const neurons: Neuron[] = [];
  const neuronCount = 40; // Reduced for performance
  const layers = 4;
  const colors = getThemeColors();

  interface Neuron {
    x: number;
    y: number;
    layer: number;
    activation: number;
    connections: number[];
  }

  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);

  // Initialize neurons in layers
  for (let layer = 0; layer < layers; layer++) {
    const neuronsInLayer = Math.floor(neuronCount / layers);
    for (let i = 0; i < neuronsInLayer; i++) {
      neurons.push({
        x: (width / layers) * layer + width / (layers * 2),
        y: (height / neuronsInLayer) * i + height / (neuronsInLayer * 2),
        layer,
        activation: Math.random(),
        connections: [],
      });
    }
  }

  // Create connections between adjacent layers
  neurons.forEach((neuron, index) => {
    if (neuron.layer < layers - 1) {
      neurons.forEach((other, otherIndex) => {
        if (other.layer === neuron.layer + 1 && Math.random() > 0.4) {
          neuron.connections.push(otherIndex);
        }
      });
    }
  });

  let time = 0;
  let lastTime = 0;
  const frameInterval = 1000 / 30; // Lower FPS for neural network

  function animate(currentTime: number) {
    if (currentTime - lastTime < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;

    // Clear with background
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.05;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    time += 0.01;

    // Update neuron activations with smoother transitions
    neurons.forEach((neuron, index) => {
      neuron.activation = (Math.sin(time + index * 0.1) + 1) / 2;
    });

    // Draw connections
    neurons.forEach((neuron) => {
      neuron.connections.forEach((connectionIndex) => {
        const target = neurons[connectionIndex];
        const opacity = (neuron.activation + target.activation) / 2 * 0.25;

        ctx.strokeStyle = colors.accent.replace(/[\d.]+\)$/g, `${opacity})`);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(neuron.x, neuron.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });
    });

    // Draw neurons
    neurons.forEach((neuron) => {
      const size = 2 + neuron.activation * 4;
      const opacity = 0.3 + neuron.activation * 0.5;

      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary.replace(/[\d.]+\)$/g, `${opacity})`);
      ctx.fill();
    });

    animationRef.current = requestAnimationFrame(animate);
  }

  animate(0);

  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}

// Optimized flow field animation
function createFlowFieldAnimation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  animationRef: React.MutableRefObject<number | undefined>
) {
  const particles: Particle[] = [];
  const particleCount = 150; // Reduced for performance
  const colors = getThemeColors();

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    trail: { x: number; y: number }[];
  }

  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      life: Math.random() * 100,
      maxLife: 150 + Math.random() * 100,
      trail: [],
    });
  }

  let time = 0;
  let lastTime = 0;
  const frameInterval = 1000 / 45;

  function animate(currentTime: number) {
    if (currentTime - lastTime < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;

    // Clear with fade effect
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.02;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    time += 0.003;

    particles.forEach((particle) => {
      // Calculate flow field force
      const angle = Math.sin(particle.x * 0.008 + time) + Math.cos(particle.y * 0.008 + time);
      const force = 0.08;

      particle.vx += Math.cos(angle) * force;
      particle.vy += Math.sin(angle) * force;

      // Apply friction
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Add to trail
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > 8) {
        particle.trail.shift();
      }

      // Update life
      particle.life++;

      // Reset particle if needed
      if (particle.life > particle.maxLife ||
        particle.x < 0 || particle.x > width ||
        particle.y < 0 || particle.y > height) {
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.vx = 0;
        particle.vy = 0;
        particle.life = 0;
        particle.maxLife = 150 + Math.random() * 100;
        particle.trail = [];
      }

      // Draw particle trail
      if (particle.trail.length > 1) {
        ctx.strokeStyle = colors.primary.replace(/[\d.]+\)$/g, '0.3)');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        for (let i = 1; i < particle.trail.length; i++) {
          ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }
        ctx.stroke();
      }

      // Draw particle
      const opacity = (1 - particle.life / particle.maxLife) * 0.6;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = colors.accent.replace(/[\d.]+\)$/g, `${opacity})`);
      ctx.fill();
    });

    animationRef.current = requestAnimationFrame(animate);
  }

  animate(0);

  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}

// Optimized matrix animation
function createMatrixAnimation(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  animationRef: React.MutableRefObject<number | undefined>
) {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);
  const fontSize = 12;
  const columns = Math.floor(width / fontSize);
  const drops: number[] = [];
  const colors = getThemeColors();

  // Initialize drops
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * height / fontSize;
  }

  const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

  let lastTime = 0;
  const frameInterval = 1000 / 20; // Slower for matrix effect

  function animate(currentTime: number) {
    if (currentTime - lastTime < frameInterval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    lastTime = currentTime;

    // Clear with fade
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = characters[Math.floor(Math.random() * characters.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Gradient effect
      const opacity = Math.max(0.1, 1 - (drops[i] / (height / fontSize)) * 0.8);
      ctx.fillStyle = colors.primary.replace(/[\d.]+\)$/g, `${opacity})`);
      ctx.fillText(text, x, y);

      if (drops[i] * fontSize > height && Math.random() > 0.98) {
        drops[i] = 0;
      }

      drops[i]++;
    }

    animationRef.current = requestAnimationFrame(animate);
  }

  animate(0);

  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}