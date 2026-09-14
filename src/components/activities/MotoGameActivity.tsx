import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowRight, ArrowLeft, ArrowUp, Zap, Flag } from 'lucide-react';

interface MotoGameActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Item {
  id: number;
  xDist: number; // in meters (0 to 1000)
  type: 'star' | 'energy';
  collected: boolean;
}

const TRACK_LENGTH = 1000; // 1000 meters

export const MotoGameActivity: React.FC<MotoGameActivityProps> = ({ onComplete }) => {
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [jumpY, setJumpY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [items, setItems] = useState<Item[]>([
    { id: 1, xDist: 150, type: 'star', collected: false },
    { id: 2, xDist: 280, type: 'star', collected: false },
    { id: 3, xDist: 400, type: 'energy', collected: false },
    { id: 4, xDist: 550, type: 'star', collected: false },
    { id: 5, xDist: 700, type: 'star', collected: false },
    { id: 6, xDist: 850, type: 'energy', collected: false },
    { id: 7, xDist: 920, type: 'star', collected: false },
  ]);

  const speedRef = useRef(speed);
  speedRef.current = speed;
  const distRef = useRef(distance);
  distRef.current = distance;
  const isJumpingRef = useRef(isJumping);
  isJumpingRef.current = isJumping;
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'w', 's', 'a', 'd', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd' || e.key === 'ArrowUp') {
        accelerate();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a' || e.key === 'ArrowDown') {
        brake();
      } else if (e.code === 'Space') {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const accelerate = () => {
    sounds.engineAccel();
    setSpeed((prev) => Math.min(45, prev + 8));
  };

  const brake = () => {
    sounds.keyClick();
    setSpeed((prev) => Math.max(0, prev - 10));
  };

  const jump = () => {
    if (isJumpingRef.current) return;
    setIsJumping(true);
    sounds.whoosh();

    let step = 0;
    const jumpInterval = setInterval(() => {
      step += 0.15;
      if (step >= Math.PI) {
        clearInterval(jumpInterval);
        setJumpY(0);
        setIsJumping(false);
      } else {
        setJumpY(Math.sin(step) * 45);
      }
    }, 30);
  };

  // Physics game loop
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      const curSpeed = speedRef.current;
      const curDist = distRef.current;

      if (curSpeed > 0) {
        const nextDist = curDist + curSpeed * 0.4;
        setDistance(nextDist);

        // Check star collection
        const updated = itemsRef.current.map((item) => {
          if (!item.collected && Math.abs(item.xDist - nextDist) < 35) {
            sounds.coin();
            setStarsCollected((prev) => prev + 1);
            return { ...item, collected: true };
          }
          return item;
        });
        setItems(updated);

        // Check finish line
        if (nextDist >= TRACK_LENGTH && !isFinished) {
          setIsFinished(true);
          sounds.victoryFanfare();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

          setTimeout(() => {
            onComplete({
              wpm: 38,
              accuracy: 99,
              errors: 0,
              rewardXp: 85,
              rewardCoins: 60,
            });
          }, 1600);
        }

        // Gradual friction
        setSpeed((prev) => Math.max(0, prev * 0.985));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isFinished, onComplete]);

  const progressPercent = Math.min(100, (distance / TRACK_LENGTH) * 100);

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🏍️</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Passeio de Moto Ecológica no Parque
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {Math.round(progressPercent)}% do circuito
              </span>
            </h3>
            <p className="text-xs text-slate-300">Pressione Seta Direita para acelerar, Seta Esquerda para frear e Espaço para pular!</p>
          </div>
        </div>

        {/* Speedometer & Stars */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold text-sm">⭐ {starsCollected}</span>
          </div>
          <div className="bg-sky-950/80 px-3 py-1.5 rounded-xl border border-sky-500/40 text-sky-300 font-mono font-bold">
            {Math.round(speed * 2)} km/h
          </div>
        </div>
      </div>

      {/* 2D Landscape Track Arena */}
      <div className="relative w-full h-[320px] sm:h-[350px] bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-600/60 flex flex-col justify-between">
        {/* Clouds & Sun */}
        <div className="absolute top-4 left-8 text-3xl opacity-90 animate-pulse">☀️</div>
        <div
          className="absolute top-8 flex space-x-24 text-3xl opacity-75"
          style={{ transform: `translateX(-${(distance * 0.1) % 400}px)` }}
        >
          <span>☁️</span>
          <span>☁️</span>
          <span>☁️</span>
          <span>☁️</span>
        </div>

        {/* Distant Hills / Trees Layer */}
        <div
          className="absolute bottom-20 inset-x-0 flex space-x-16 text-3xl opacity-85 transition-transform"
          style={{ transform: `translateX(-${(distance * 0.4) % 600}px)` }}
        >
          <span>🌳</span>
          <span>🌲</span>
          <span>🌳</span>
          <span>🌲</span>
          <span>🌳</span>
          <span>🌲</span>
          <span>🌳</span>
        </div>

        {/* Track Ground Layer */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-emerald-800 via-emerald-600 to-emerald-500 border-t-4 border-emerald-400">
          {/* Ground Flowers & Stones moving */}
          <div
            className="flex items-center space-x-20 pt-2 text-xl transition-transform"
            style={{ transform: `translateX(-${(distance * 1.2) % 400}px)` }}
          >
            <span>🌼</span>
            <span>🌸</span>
            <span>🍀</span>
            <span>🌼</span>
            <span>🌸</span>
          </div>
        </div>

        {/* Items along the track relative to bike */}
        <div className="absolute bottom-16 inset-x-0 h-16 pointer-events-none">
          {items.map((item) => {
            const relDist = item.xDist - distance;
            // Screen center is at 30% of width (x=180px approx)
            const screenX = 140 + relDist * 1.5;

            if (screenX < -50 || screenX > 800 || item.collected) return null;

            return (
              <div
                key={item.id}
                className="absolute bottom-4 text-3xl animate-bounce"
                style={{ left: `${screenX}px` }}
              >
                {item.type === 'star' ? '⭐' : '⚡'}
              </div>
            );
          })}

          {/* Finish Line Banner at 1000m */}
          {distance < TRACK_LENGTH + 200 && (
            <div
              className="absolute bottom-2 flex flex-col items-center"
              style={{ left: `${140 + (TRACK_LENGTH - distance) * 1.5}px` }}
            >
              <div className="text-4xl animate-pulse">🏁</div>
              <div className="w-2 h-20 bg-slate-900 border-2 border-white" />
            </div>
          )}
        </div>

        {/* The Player Motorcycle */}
        <div
          className="absolute left-24 bottom-14 transition-all duration-75 z-20 flex flex-col items-center"
          style={{ transform: `translateY(-${jumpY}px)` }}
        >
          {/* Rider Avatar & Motorcycle */}
          <div className="text-5xl drop-shadow-lg filter -scale-x-100">
            🏍️
          </div>
        </div>

        {/* Finish Overlay */}
        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30 animate-in fade-in">
            <span className="text-6xl animate-bounce">🏁🏍️🏆</span>
            <h3 className="text-xl font-black text-emerald-400">Circuito Concluído com Sucesso!</h3>
            <p className="text-xs text-slate-200">Você dominou a aceleração suave e o equilíbrio impecável da moto!</p>
          </div>
        )}
      </div>

      {/* Interactive Control Buttons */}
      <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Controle de Aceleração com os Dedos da Mão Direita</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={brake}
            className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 active:scale-95 text-rose-200 font-bold text-xs border border-rose-700/60 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Frear [⬅️]
          </button>
          <button
            onClick={jump}
            className="px-4 py-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 active:scale-95 text-indigo-200 font-bold text-xs border border-indigo-700/60 transition flex items-center gap-1"
          >
            <ArrowUp className="w-4 h-4" /> Pular [Espaço]
          </button>
          <button
            onClick={accelerate}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-lg transition flex items-center gap-1"
          >
            Acelerar [➡️] <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
