import { useCallback, useRef } from 'react';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const isHoveringRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Callback ref para el cursor
  const cursorCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      // Cleanup cuando se desmonta
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    cursorRef.current = node;

    let rafId: number;
    let lastUpdate = 0;
    const throttleDelay = 16; // ~60fps

    const updateMousePosition = (e: MouseEvent) => {
      // Evitar actualizaciones cuando está fuera de la ventana
      if (e.clientX < 0 || e.clientY < 0 || 
          e.clientX > window.innerWidth || e.clientY > window.innerHeight) {
        return;
      }

      const now = Date.now();
      if (now - lastUpdate < throttleDelay) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (cursorRef.current) {
            const scale = isHoveringRef.current ? 1.8 : 1;
            cursorRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0) scale(${scale})`;
            lastUpdate = Date.now();
          }
        });
      } else {
        if (cursorRef.current) {
          const scale = isHoveringRef.current ? 1.8 : 1;
          cursorRef.current.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0) scale(${scale})`;
          lastUpdate = now;
        }
      }
    };

    // Para elementos interactivos, usar event delegation optimizado
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.matches('a, button, [role="button"]')) {
        isHoveringRef.current = true;
        // La actualización se hará en el próximo mousemove
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.matches('a, button, [role="button"]')) {
        isHoveringRef.current = false;
        // La actualización se hará en el próximo mousemove
      }
    };

    document.addEventListener('mousemove', updateMousePosition, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });

    // Guardar función de cleanup
    cleanupRef.current = () => {
      document.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Solo mostrar en desktop
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return null;
  }

  // Cursor optimizado - usa transform directo en lugar de animaciones de framer-motion
  return (
    <div
      ref={cursorCallbackRef}
      className="fixed top-0 left-0 w-3 h-3 rounded-full bg-white/20 pointer-events-none z-[9999] mix-blend-difference"
      style={{
        willChange: 'transform',
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};
