'use client';
import { useEffect, useRef, useState } from 'react';

export const useSpotlightEffect = (config: any = {}) => {
  const {
    spotlightSize = 200,
    spotlightIntensity = 0.8,
    fadeSpeed = 0.1,
    glowColor = '255, 255, 255',
    pulseSpeed = 2000,
  } = config;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const spotlightPos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);
  const isHoveredRef = useRef(false);
  const opacityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    const resizeCanvas = () => {
      // Size the canvas to its parent container
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Map viewport coordinates to canvas local coordinates
      const rect = canvas.getBoundingClientRect();
      targetPos.current = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
      isHoveredRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
    };

    const render = () => {
      if (!canvas || !ctx) return;

      // Smooth position transition
      spotlightPos.current.x = lerp(
        spotlightPos.current.x,
        targetPos.current.x,
        fadeSpeed
      );
      spotlightPos.current.y = lerp(
        spotlightPos.current.y,
        targetPos.current.y,
        fadeSpeed
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth opacity transition
      opacityRef.current = lerp(
        opacityRef.current,
        isHoveredRef.current ? 1 : 0,
        0.05
      );

      // Only draw if we have some opacity
      if (opacityRef.current < 0.01) {
        animationFrame.current = requestAnimationFrame(render);
        return;
      }

      // Static glow size (no pulse effect)
      const glowSize = spotlightSize * 0.45; // Significantly tighter glow size

      const baseAlpha = opacityRef.current;

      // Draw the subtle background glow
      ctx.globalCompositeOperation = 'screen';
      const glowGradient = ctx.createRadialGradient(
        spotlightPos.current.x,
        spotlightPos.current.y,
        0,
        spotlightPos.current.x,
        spotlightPos.current.y,
        glowSize
      );
      
      // Increased intensity glow with custom color
      glowGradient.addColorStop(0, `rgba(${glowColor}, ${baseAlpha * 0.40})`);
      glowGradient.addColorStop(0.5, `rgba(${glowColor}, ${baseAlpha * 0.15})`);
      glowGradient.addColorStop(1, `rgba(${glowColor}, 0)`);
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(
        spotlightPos.current.x,
        spotlightPos.current.y,
        glowSize,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Ensure we switch back for the next frame
      ctx.globalCompositeOperation = 'source-over';

      animationFrame.current = requestAnimationFrame(render);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Bind to the hero section instead of the document to only track when inside
    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    } else {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [spotlightSize, spotlightIntensity, fadeSpeed, glowColor, pulseSpeed]);

  return canvasRef;
};

export default function SpotlightCanvas({
  config = {},
  className = '',
}: {
  config?: any;
  className?: string;
}) {
  const canvasRef = useSpotlightEffect(config);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 pointer-events-none z-50 ${className}`} 
    />
  );
}
