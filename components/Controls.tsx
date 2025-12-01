import React, { useState } from 'react';
import { SHAPES, THEMES } from '../constants';
import { AppState, ShapeType, ThemeName } from '../types';

interface ControlsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  fps: number;
}

export const Controls: React.FC<ControlsProps> = ({ state, setState, fps }) => {
  const [isOpen, setIsOpen] = useState(true);

  const currentTheme = state.isCustomTheme 
    ? { name: '自定义', ui: 'text-white', bg: state.customBg, colors: state.customColors } 
    : THEMES[state.theme];

  const handleSymbolChange = (index: number, val: string) => {
    const newSymbols = [...state.symbols] as [string, string, string, string];
    newSymbols[index] = val.slice(0, 2); // Limit length
    setState(prev => ({ ...prev, symbols: newSymbols }));
  };

  const handleThemeChange = (name: ThemeName) => {
    setState(prev => ({
      ...prev,
      theme: name,
      isCustomTheme: false,
    }));
  };

  const handleCustomColorChange = (index: number, val: string) => {
    const newColors = [...state.customColors];
    newColors[index] = val;
    setState(prev => ({
      ...prev,
      isCustomTheme: true,
      customColors: newColors
    }));
  };

  return (
    <div className={`fixed top-4 left-4 z-10 transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'}`}>
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`mb-2 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg ${currentTheme.ui} hover:bg-white/20 transition-colors`}
        >
            {isOpen ? '◀' : '⚙'}
        </button>

      {isOpen && (
        <div className={`
            p-6 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl
            max-h-[85vh] overflow-y-auto
            ${state.theme === ThemeName.MONDRIAN ? 'bg-white/80' : 'bg-black/40'}
            transition-colors duration-500
        `}>
          <h1 className={`text-2xl font-bold mb-6 ${currentTheme.ui} tracking-wider`}>
            粒子引擎
          </h1>

          {/* Stats */}
          <div className="flex justify-between text-xs mb-6 opacity-70 font-mono">
            <span className={currentTheme.ui}>帧率: {fps}</span>
            <span className={currentTheme.ui}>数量: {state.density}</span>
          </div>

          {/* Shape Selector */}
          <div className="mb-8">
            <label className={`block text-xs font-bold mb-3 uppercase tracking-widest ${currentTheme.ui}`}>模型选择</label>
            <div className="grid grid-cols-2 gap-2">
              {SHAPES.map((s) => (
                <button
                  key={s}
                  onClick={() => setState(prev => ({ ...prev, shape: s }))}
                  className={`
                    py-2 px-3 text-xs rounded-lg transition-all duration-200 border
                    ${state.shape === s 
                        ? 'bg-white text-black border-white font-bold scale-105 shadow-lg' 
                        : 'bg-transparent border-white/20 hover:bg-white/10 ' + currentTheme.ui}
                  `}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="mb-8">
            <label className={`block text-xs font-bold mb-3 uppercase tracking-widest ${currentTheme.ui}`}>
                粒子密度 ({state.density})
            </label>
            <input
              type="range"
              min="500"
              max="2000"
              step="100"
              value={state.density}
              onChange={(e) => setState(prev => ({ ...prev, density: parseInt(e.target.value) }))}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hover:bg-white/40 transition-all"
            />
          </div>

          {/* Symbols */}
          <div className="mb-8">
            <label className={`block text-xs font-bold mb-3 uppercase tracking-widest ${currentTheme.ui}`}>粒子符号</label>
            <div className="grid grid-cols-4 gap-2">
              {state.symbols.map((sym, i) => (
                <input
                  key={i}
                  type="text"
                  value={sym}
                  onChange={(e) => handleSymbolChange(i, e.target.value)}
                  className={`
                    w-full text-center py-2 rounded-lg bg-white/5 border border-white/10 
                    focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all
                    ${currentTheme.ui}
                  `}
                />
              ))}
            </div>
          </div>

          {/* Themes */}
          <div className="mb-8">
            <label className={`block text-xs font-bold mb-3 uppercase tracking-widest ${currentTheme.ui}`}>配色主题</label>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleThemeChange(t.name)}
                  className={`
                    flex flex-col items-center gap-1 group
                  `}
                >
                  <div 
                    className={`
                      w-8 h-8 rounded-full border border-white/20 shadow-sm transition-transform group-hover:scale-110
                      ${state.theme === t.name && !state.isCustomTheme ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110' : ''}
                    `}
                    style={{ background: `linear-gradient(135deg, ${t.colors[0]} 50%, ${t.colors[1]} 50%)` }}
                  />
                  <span className={`text-[10px] opacity-70 group-hover:opacity-100 transition-opacity ${currentTheme.ui}`}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Custom Colors */}
            <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                     <span className={`text-xs ${currentTheme.ui} opacity-80`}>自定义背景</span>
                     <input 
                        type="color" 
                        value={state.isCustomTheme ? state.customBg : THEMES[state.theme].bg}
                        onChange={(e) => setState(prev => ({ ...prev, isCustomTheme: true, customBg: e.target.value }))}
                        className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                     />
                </div>
                <div className="flex items-center justify-between">
                     <span className={`text-xs ${currentTheme.ui} opacity-80`}>自定义配色</span>
                     <div className="flex gap-1">
                        {(state.isCustomTheme ? state.customColors : THEMES[state.theme].colors).map((c, i) => (
                            <input 
                                key={i}
                                type="color" 
                                value={c}
                                onChange={(e) => handleCustomColorChange(i, e.target.value)}
                                className="w-5 h-5 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
                            />
                        ))}
                     </div>
                </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};