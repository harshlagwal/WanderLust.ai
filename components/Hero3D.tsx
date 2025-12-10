import React, { useEffect, useRef } from 'react';

const Hero3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: {x: number, y: number, size: number, speed: number, alpha: number}[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        alpha: Math.random()
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Particles
      ctx.fillStyle = '#ffffff';
      particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y -= p.speed;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
      });
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative h-[95vh] w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* 3D-like Content */}
      <div className="relative z-10 text-center px-4 pb-32 md:pb-32">
        <div className="inline-block mb-4 animate-float">
          <div className="text-7xl md:text-9xl mb-2 filter drop-shadow-2xl scale-110">🌍</div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 drop-shadow-lg mb-4 tracking-tight">
          Your Dream Journey <br/> Starts Here
        </h1>
        
        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed mb-8">
          Experience AI-powered travel planning. Personalized itineraries crafted in seconds.
        </p>

        <div className="flex justify-center gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 transform hover:-translate-y-2 transition-transform duration-300 shadow-lg">
                <span className="text-3xl block mb-1">✈️</span>
                <p className="text-sm text-white font-medium">Smart Flights</p>
            </div>
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 transform hover:-translate-y-2 transition-transform duration-300 delay-100 shadow-lg">
                <span className="text-3xl block mb-1">🏨</span>
                <p className="text-sm text-white font-medium">Luxury Stays</p>
            </div>
             <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 transform hover:-translate-y-2 transition-transform duration-300 delay-200 shadow-lg">
                <span className="text-3xl block mb-1">🧭</span>
                <p className="text-sm text-white font-medium">Local Gems</p>
            </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-8 h-8 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default Hero3D;