import React, { useEffect, useRef } from 'react';

const MatrixBackground = ({ isLockdown }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const charSize = 20;
    const columns = Math.ceil(canvas.width / charSize);
    const drops = new Array(columns).fill(0);
    const chars = '01ABCDEF'.split('');

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 10, 16, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${charSize}px monospace`;
      
      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * charSize;
        
        ctx.fillStyle = isLockdown ? '#f00' : '#00f3ff';
        ctx.globalAlpha = Math.random() * 0.5 + 0.1;
        ctx.fillText(text, x, y * charSize);

        const threshold = isLockdown ? 0.99 : 0.975;
        if (y * charSize > canvas.height && Math.random() > threshold) {
          drops[i] = 0;
        }
        drops[i]++;
      });
    };

    const speed = isLockdown ? 15 : 30;
    const interval = setInterval(draw, speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, [isLockdown]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 bg-cyber-dark opacity-30"
    />
  );
};

export default MatrixBackground;
