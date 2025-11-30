import { memo, useMemo } from 'react';

interface HeroParticlesProps {
  shouldAnimate: boolean;
  isMobile: boolean;
}

// Partículas con posiciones fijas (no dependen de window.innerWidth)
const PARTICLE_CONFIGS = [
  { x: 15, y: 20, size: 5, delay: 0, duration: 12, colorIndex: 0, isSparkle: false },
  { x: 40, y: 40, size: 6.5, delay: 0.8, duration: 14, colorIndex: 1, isSparkle: false },
  { x: 65, y: 60, size: 8, delay: 1.6, duration: 12, colorIndex: 2, isSparkle: false },
  { x: 80, y: 30, size: 6.5, delay: 2.4, duration: 10, colorIndex: 3, isSparkle: true },
] as const;

const PARTICLE_COLORS = [
  { main: 'rgba(233, 30, 99, 0.3)', shadow: 'rgba(233, 30, 99, 0.4)' },
  { main: 'rgba(255, 215, 0, 0.25)', shadow: 'rgba(255, 215, 0, 0.35)' },
  { main: 'rgba(0, 168, 127, 0.25)', shadow: 'rgba(0, 168, 127, 0.35)' },
  { main: 'rgba(255, 215, 0, 0.4)', shadow: 'rgba(255, 215, 0, 0.6)' },
] as const;

const PETAL_CONFIGS = [
  { left: 15, top: 20, delay: 0, duration: 14 },
  { left: 40, top: 40, delay: 2, duration: 16 },
] as const;

export const HeroParticles = memo(({ shouldAnimate, isMobile }: HeroParticlesProps) => {
  // Solo calcular partículas una vez - usar valores fijos en porcentajes
  const particles = useMemo(() => {
    if (!shouldAnimate) return [];
    const particleCount = isMobile ? 2 : 4;
    return PARTICLE_CONFIGS.slice(0, particleCount).map((config, i) => ({
      key: `particle-${i}`,
      ...config,
      color: PARTICLE_COLORS[config.colorIndex],
    }));
  }, [shouldAnimate, isMobile]);

  if (!shouldAnimate) return null;

  return (
    <>
      {/* Pétalos con CSS animations - reducidos para mejor performance */}
      {PETAL_CONFIGS.map((petal, i) => (
        <div
          key={`petal-${i}`}
          className="hero-petal"
          style={
            {
              left: `${petal.left}%`,
              top: `${petal.top}%`,
              '--delay': `${petal.delay}s`,
              '--duration': `${petal.duration}s`,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      ))}

      {/* Partículas con CSS animations */}
      {particles.map((particle) => (
        <div
          key={particle.key}
          className={`hero-particle ${
            particle.isSparkle ? 'hero-particle-sparkle' : ''
          }`}
          style={
            {
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              '--delay': `${particle.delay}s`,
              '--duration': `${particle.isSparkle ? 10 : particle.duration}s`,
              '--color-main': particle.color.main,
              '--color-shadow': particle.color.shadow,
              '--size': `${particle.size}px`,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      ))}
    </>
  );
});

HeroParticles.displayName = 'HeroParticles';

