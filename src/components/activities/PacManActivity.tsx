import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface PacManActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

// 1: Wall, 0: Dot, 2: Fruit, 3: Empty
const MAZE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 3, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const TARGET_DOTS = 25;

export const PacManActivity: React.FC<PacManActivityProps> = ({ onComplete }) => {
  const [grid, setGrid] = useState<number[][]>(MAZE_MAP);
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 5, c: 7 });
  const [playerDir, setPlayerDir] = useState<{ dr: number; dc: number }>({ dr: 0, dc: 1 });
  const [mouthOpen, setMouthOpen] = useState(true);
  const [dotsEaten, setDotsEaten] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const gridRef = useRef(grid);
  gridRef.current = grid;
  const posRef = useRef(playerPos);
  posRef.current = playerPos;
  const dirRef = useRef(playerDir);
  dirRef.current = playerDir;

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        trySetDir(-1, 0);
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        trySetDir(1, 0);
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        trySetDir(0, -1);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        trySetDir(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const trySetDir = (dr: number, dc: number) => {
    const cur = posRef.current;
    const targetR = cur.r + dr;
    const targetC = cur.c + dc;
    if (gridRef.current[targetR] && gridRef.current[targetR][targetC] !== 1) {
      setPlayerDir({ dr, dc });
    }
  };

  // Movement loop
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      const cur = posRef.current;
      const dir = dirRef.current;
      const nextR = cur.r + dir.dr;
      const nextC = cur.c + dir.dc;

      setMouthOpen((prev) => !prev);

      if (gridRef.current[nextR] && gridRef.current[nextR][nextC] !== 1) {
        setPlayerPos({ r: nextR, c: nextC });

        // Eat dot or fruit
        const cellVal = gridRef.current[nextR][nextC];
        if (cellVal === 0 || cellVal === 2) {
          if (cellVal === 2) {
            sounds.coin();
          } else {
            sounds.successPing(700);
          }

          const newGrid = gridRef.current.map((row) => [...row]);
          newGrid[nextR][nextC] = 3; // empty
          setGrid(newGrid);

          const newEaten = dotsEaten + (cellVal === 2 ? 3 : 1);
          setDotsEaten(newEaten);

          if (newEaten >= TARGET_DOTS && !isFinished) {
            setIsFinished(true);
            sounds.victoryFanfare();
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

            setTimeout(() => {
              onComplete({
                wpm: 36,
                accuracy: 99,
                errors: 0,
                rewardXp: 85,
                rewardCoins: 55,
              });
            }, 1500);
          }
        }
      }
    }, 180);

    return () => clearInterval(timer);
  }, [dotsEaten, isFinished, onComplete]);

  // Player rotation angle
  let rotDeg = 0;
  if (playerDir.dc === 1) rotDeg = 0;
  if (playerDir.dr === 1) rotDeg = 90;
  if (playerDir.dc === -1) rotDeg = 180;
  if (playerDir.dr === -1) rotDeg = 270;

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🟡</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Pac-Brotinho no Labirinto
              <span className="text-xs font-normal text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                {dotsEaten} de {TARGET_DOTS} sementes colhidas
              </span>
            </h3>
            <p className="text-xs text-slate-300">Navegue pelos corredores com as setas para colher sementes e frutinhas!</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <div className="w-28 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${Math.min(100, (dotsEaten / TARGET_DOTS) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-amber-400">{dotsEaten}/{TARGET_DOTS}</span>
        </div>
      </div>

      {/* The Maze Viewport */}
      <div className="relative w-full h-[340px] sm:h-[370px] bg-slate-950 border-2 border-indigo-700/60 rounded-3xl overflow-hidden shadow-2xl p-2 flex items-center justify-center">
        <div
          className="grid w-full h-full max-w-md max-h-[330px] gap-0.5 p-1 bg-slate-900/40 rounded-2xl border border-slate-800"
          style={{
            gridTemplateColumns: `repeat(${MAZE_MAP[0].length}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${MAZE_MAP.length}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;

              if (cell === 1) {
                // Wall
                return (
                  <div
                    key={`${r}-${c}`}
                    className="bg-indigo-950 border border-indigo-700/80 rounded-md shadow-inner"
                  />
                );
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className="relative flex items-center justify-center bg-slate-950/70"
                >
                  {isPlayer ? (
                    <div
                      className="w-6 h-6 rounded-full bg-amber-400 border border-yellow-200 shadow-[0_0_12px_#fbbf24] flex items-center justify-center transition-transform duration-100 z-10"
                      style={{ transform: `rotate(${rotDeg}deg)` }}
                    >
                      {/* Simple animated mouth */}
                      <div
                        className={`w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-slate-950 ml-auto transition-all ${
                          mouthOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </div>
                  ) : cell === 0 ? (
                    // Dot
                    <div className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_4px_#fde047]" />
                  ) : cell === 2 ? (
                    // Fruit
                    <span className="text-sm animate-bounce">🍒</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Victory Screen */}
        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30 animate-in fade-in">
            <span className="text-5xl animate-bounce">🟡🍒🎉</span>
            <h3 className="text-xl font-black text-amber-400">Labirinto Conquistado!</h3>
            <p className="text-xs text-slate-200">Você guiou o Pac-Brotinho com precisão total através do labirinto!</p>
          </div>
        )}
      </div>

      {/* On-screen Directional Controls */}
      <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Controle a navegação no labirinto com as setas ou clique abaixo:</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => trySetDir(0, -1)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center border border-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => trySetDir(-1, 0)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center border border-slate-700 transition"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => trySetDir(1, 0)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center border border-slate-700 transition"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => trySetDir(0, 1)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center border border-slate-700 transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
