import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { ParticleSystem } from './components/ParticleSystem';
import { Controls } from './components/Controls';
import { AppState, ShapeType, ThemeName } from './types';
import { THEMES, DEFAULT_SYMBOLS } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    shape: ShapeType.MOBIUS,
    density: 1200,
    symbols: DEFAULT_SYMBOLS,
    theme: ThemeName.DUNHUANG,
    customBg: '#000000',
    customColors: ['#ffffff', '#ff0000', '#00ff00', '#0000ff'],
    isCustomTheme: false,
  });

  const [fps, setFps] = useState(60);

  // Derive current colors based on theme selection
  const currentBg = state.isCustomTheme ? state.customBg : THEMES[state.theme].bg;
  const currentParticleColors = state.isCustomTheme ? state.customColors : THEMES[state.theme].colors;

  // Simple FPS counter
  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();
    const loop = () => {
      const time = performance.now();
      frame++;
      if (time >= lastTime + 1000) {
        setFps(Math.round((frame * 1000) / (time - lastTime)));
        frame = 0;
        lastTime = time;
      }
      requestAnimationFrame(loop);
    };
    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full h-screen relative" style={{ backgroundColor: currentBg, transition: 'background-color 0.5s ease' }}>
      
      <Canvas 
        camera={{ position: [0, 0, 12], fov: 45 }}
        dpr={[1, 2]} // Support high DPI
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[currentBg]} />
        
        {/* Ambient light for base visibility if we used standard materials (we use basic, but good to have) */}
        <ambientLight intensity={0.5} />
        
        <ParticleSystem 
          shape={state.shape} 
          density={state.density} 
          symbols={state.symbols}
          colors={currentParticleColors}
        />
        
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          rotateSpeed={0.5} 
          zoomSpeed={0.7}
          minDistance={2}
          maxDistance={30}
        />
      </Canvas>

      <Controls state={state} setState={setState} fps={fps} />
      
      {/* Decorative background title if needed, or simple footer */}
      <div className={`fixed bottom-4 right-4 text-[10px] opacity-30 pointer-events-none select-none ${state.theme === ThemeName.MONDRIAN ? 'text-black' : 'text-white'}`}>
        沉浸式粒子引擎 v1.0
      </div>
    </div>
  );
};

export default App;