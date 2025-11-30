import { memo } from 'react';

interface HeroBackgroundProps {
  shouldAnimate: boolean;
}

export const HeroBackground = memo(({ shouldAnimate }: HeroBackgroundProps) => {
  return (
    <>
      {/* Fondo claro con más contraste para resaltar la flor */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f0f0f0] via-white to-[#f8f8f8]" />

      {/* Animación de blob SVG - colores más intensos para resaltar la flor */}
      <svg
        className="absolute inset-0 w-full h-full -z-10 opacity-50"
        preserveAspectRatio="xMidYMid slice"
        viewBox="10 10 80 80"
        style={{ mixBlendMode: 'multiply' }}
        aria-hidden="true"
      >
        {/* Verde principal más intenso */}
        <path
          fill="#50C878"
          className="hero-out-top"
          d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"
          opacity="0.6"
        />
        {/* Amarillo claro más visible */}
        <path
          fill="#FFE082"
          className="hero-in-top"
          d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"
          opacity="0.5"
        />
        {/* Verde esmeralda más intenso */}
        <path
          fill="#00A87F"
          className="hero-out-bottom"
          d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"
          opacity="0.45"
        />
        {/* Rosa más visible */}
        <path
          fill="#E91E63"
          className="hero-in-bottom"
          d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"
          opacity="0.4"
        />
      </svg>

      {/* Patrón sutil de puntos */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }}
        aria-hidden="true"
      />

      {/* Línea decorativa - solo CSS, sin motion.div */}
      <div
        className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#50C878]/20 to-transparent"
        style={{
          opacity: shouldAnimate ? 0.3 : 0.2,
        }}
        aria-hidden="true"
      />
    </>
  );
});

HeroBackground.displayName = 'HeroBackground';

