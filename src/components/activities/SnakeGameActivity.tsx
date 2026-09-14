import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RefreshCw } from 'lucide-react';

interface SnakeGameActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Position {
  x: number;
  y: number;
}

const GRID_WIDTH = 18;
const GRID_HEIGHT = 12;
const TARGET_APPLES = 7;

export const SnakeGameActivity: React.FC<SnakeGameActivityProps> = ({ onComplete }) => {
  const [snake, setSnake] = useState<Position[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ]);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [nextDirection, setNextDirection] = useState<Position>({ x: 1, y: 0 });
  const [food, setFood] = useState<Position>({ x: 12, y: 5 });
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const directionRef = useRef(direction);
  directionRef.current = direction;
  const nextDirectionRef = useRef(nextDirection);
  nextDirectionRef.current = nextDirection;
  const snakeRef = useRef(snake);
  snakeRef.current = snake;
  const foodRef = useRef(food);
  foodRef.current = food;

  // Handle keyboard arrow keys & WASD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }

      const cur = directionRef.current;

      if ((e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') && cur.y === 0) {
        setNextDirection({ x: 0, y: -1 });
        sounds.keyClick();
      } else if ((e.key === 'ArrowDown' || e.key.toLowerCase() === 's') && cur.y === 0) {
        setNextDirection({ x: 0, y: 1 });
        sounds.keyClick();
      } else if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && cur.x === 0) {
        setNextDirection({ x: -1, y: 0 });
        sounds.keyClick();
      } else if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && cur.x === 0) {
        setNextDirection({ x: 1, y: 0 });
        sounds.keyClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main game tick
  useEffect(() => {
    if (!isPlaying || isCompleted) return;

    const interval = setInterval(() => {
      const curDir = nextDirectionRef.current;
      setDirection(curDir);

      const curSnake = [...snakeRef.current];
      const head = curSnake[0];

      // New head position with friendly edge wrap-around
      let newX = head.x + curDir.x;
      let newY = head.y + curDir.y;

      if (newX < 0) newX = GRID_WIDTH - 1;
      if (newX >= GRID_WIDTH) newX = 0;
      if (newY < 0) newY = GRID_HEIGHT - 1;
      if (newY >= GRID_HEIGHT) newY = 0;

      const newHead = { x: newX, y: newY };

      // Check self-collision: if head bumps body, gentle pass-through without death for pleasant learning
      const hasEatenFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;

      let newSnake: Position[];
      if (hasEatenFood) {
        newSnake = [newHead, ...curSnake];
        sounds.plantSprout();
        const newScore = score + 1;
        setScore(newScore);

        if (newScore >= TARGET_APPLES) {
          setIsCompleted(true);
          setIsPlaying(false);
          sounds.victoryFanfare();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

          setTimeout(() => {
            onComplete({
              wpm: 35,
              accuracy: 98,
              errors: 0,
              rewardXp: 80,
              rewardCoins: 50,
            });
          }, 1500);
          return;
        }

        // Spawn new food not on snake
        let spawnPos: Position;
        do {
          spawnPos = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT),
          };
        } while (newSnake.some((s) => s.x === spawnPos.x && s.y === spawnPos.y));

        setFood(spawnPos);
      } else {
        newSnake = [newHead, ...curSnake.slice(0, -1)];
      }

      setSnake(newSnake);
    }, 180);

    return () => clearInterval(interval);
  }, [isPlaying, isCompleted, score, onComplete]);

  const changeDir = (dx: number, dy: number) => {
    const cur = directionRef.current;
    if (dx !== 0 && cur.x === 0) {
      setNextDirection({ x: dx, y: 0 });
      sounds.keyClick();
    } else if (dy !== 0 && cur.y === 0) {
      setNextDirection({ x: 0, y: dy });
      sounds.keyClick();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🐛</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Cobrinha Amiga do Jardim
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {score} de {TARGET_APPLES} maçãs colhidas
              </span>
            </h3>
            <p className="text-xs text-slate-300">Use as Setas do teclado ou W, A, S, D para guiar a cobrinha!</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <div className="w-28 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
              style={{ width: `${(score / TARGET_APPLES) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-400">{score}/{TARGET_APPLES}</span>
        </div>
      </div>

      {/* Snake Arena Grid */}
      <div className="relative w-full h-[320px] sm:h-[350px] bg-slate-950 border-2 border-emerald-700/60 rounded-3xl overflow-hidden shadow-2xl p-2 flex items-center justify-center">
        {/* Garden Grass Tile Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        <div
          className="grid w-full h-full gap-1 p-2"
          style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_HEIGHT}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_HEIGHT }).map((_, r) =>
            Array.from({ length: GRID_WIDTH }).map((_, c) => {
              const isHead = snake[0].x === c && snake[0].y === r;
              const isBody = snake.slice(1).some((s) => s.x === c && s.y === r);
              const isFood = food.x === c && food.y === r;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`rounded-md transition-all flex items-center justify-center text-sm ${
                    isHead
                      ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] z-10 scale-105'
                      : isBody
                      ? 'bg-emerald-600/90 border border-emerald-400/40'
                      : isFood
                      ? 'animate-bounce text-base'
                      : 'bg-slate-900/20'
                  }`}
                >
                  {isHead && <span className="text-[11px] leading-none">👀</span>}
                  {isFood && '🍎'}
                </div>
              );
            })
          )}
        </div>

        {/* Victory Banner */}
        {isCompleted && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-20 animate-in fade-in">
            <span className="text-5xl animate-bounce">🍎🐛🎉</span>
            <h3 className="text-xl font-black text-emerald-400">Parabéns! Meta Alcançada!</h3>
            <p className="text-xs text-slate-200">Você guiou a cobrinha com agilidade total nas setas de navegação!</p>
          </div>
        )}
      </div>

      {/* On-screen Directional Controls for Mouse or Touch */}
      <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Pratique as setas de navegação com a mão direita!</span>
        </div>

        {/* D-Pad Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => changeDir(-1, 0)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center border border-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => changeDir(0, -1)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center border border-slate-700 transition"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeDir(0, 1)}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center border border-slate-700 transition"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => changeDir(1, 0)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center border border-slate-700 transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
