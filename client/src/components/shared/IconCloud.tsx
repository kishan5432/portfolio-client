import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface IconCloudProps {
  icons: Array<{
    name: string;
    icon: string | React.ComponentType<{ className?: string }>;
    color?: string;
  }>;
  className?: string;
  radius?: number;
  speed?: number;
}

interface CloudIcon {
  name: string;
  icon: string | React.ComponentType<{ className?: string }>;
  color?: string;
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  scale: number;
}

export function IconCloud({
  icons,
  className,
  radius = 120,
  speed = 0.5
}: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cloudIcons, setCloudIcons] = useState<CloudIcon[]>([]);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  // Initialize icon positions in 3D sphere
  useEffect(() => {
    const initializedIcons: CloudIcon[] = icons.map((icon, index) => {
      const phi = Math.acos(-1 + (2 * index) / icons.length);
      const theta = Math.sqrt(icons.length * Math.PI) * phi;

      return {
        ...icon,
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        rotationX: 0,
        rotationY: 0,
        scale: 1
      };
    });

    setCloudIcons(initializedIcons);
  }, [icons, radius]);

  // Auto-rotation animation
  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x + speed * 0.5,
        y: prev.y + speed
      }));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [speed, shouldReduceMotion]);

  // Mouse interaction
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = (event.clientX - centerX) / rect.width;
    const mouseY = (event.clientY - centerY) / rect.height;

    setRotation({
      x: mouseY * 30,
      y: mouseX * 30
    });
  };

  // Transform 3D coordinates to 2D
  const transform3DTo2D = (icon: CloudIcon) => {
    const rotX = (rotation.x * Math.PI) / 180;
    const rotY = (rotation.y * Math.PI) / 180;

    // Rotate around Y axis
    let x = icon.x * Math.cos(rotY) - icon.z * Math.sin(rotY);
    let z = icon.x * Math.sin(rotY) + icon.z * Math.cos(rotY);

    // Rotate around X axis
    const y = icon.y * Math.cos(rotX) - z * Math.sin(rotX);
    z = icon.y * Math.sin(rotX) + z * Math.cos(rotX);

    // Calculate scale based on z-depth
    const scale = (z + radius) / (2 * radius);
    const opacity = Math.max(0.3, scale);

    return {
      x: x + radius,
      y: y + radius,
      scale: 0.5 + scale * 0.5,
      opacity,
      zIndex: Math.floor(scale * 100)
    };
  };

  if (shouldReduceMotion) {
    return (
      <div className={cn('grid grid-cols-6 gap-4 max-w-md mx-auto', className)}>
        {icons.map((icon, index) => (
          <div
            key={icon.name}
            className="flex items-center justify-center p-2 rounded-lg bg-muted/50"
          >
            {typeof icon.icon === 'string' ? (
              <img
                src={icon.icon}
                alt={icon.name}
                className="w-8 h-8"
                style={{ color: icon.color }}
              />
            ) : (
              <icon.icon className="w-8 h-8" style={{ color: icon.color }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-80 h-80 mx-auto cursor-pointer select-none',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
      style={{ perspective: '1000px' }}
    >
      {cloudIcons.map((icon, index) => {
        const transformed = transform3DTo2D(icon);

        return (
          <motion.div
            key={icon.name}
            className="absolute flex items-center justify-center"
            style={{
              left: transformed.x - 20,
              top: transformed.y - 20,
              zIndex: transformed.zIndex
            }}
            animate={{
              scale: transformed.scale,
              opacity: transformed.opacity
            }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: transformed.scale * 1.2 }}
            title={icon.name}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border shadow-lg"
              style={{
                borderColor: icon.color ? `${icon.color}20` : undefined,
                backgroundColor: icon.color ? `${icon.color}10` : undefined
              }}
            >
              {typeof icon.icon === 'string' ? (
                <img
                  src={icon.icon}
                  alt={icon.name}
                  className="w-6 h-6"
                  style={{ filter: icon.color ? `hue-rotate(${icon.color})` : undefined }}
                />
              ) : (
                <icon.icon
                  className="w-6 h-6"
                  style={{ color: icon.color }}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
