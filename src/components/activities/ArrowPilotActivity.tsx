import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Gauge, Shield, Trophy } from 'lucide-react';

interface ArrowPilotActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Obstacle {
  id: number;
  lane: number; // 0: esquerda, 1: centro, 2: direita
  y: number; // 0% a 100%
  type: 'fuel' | 'rock';
}

export const ArrowPilotActivity: React.FC<ArrowPilotActivityProps> = ({ onComplete }) => {
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [speed, setSpeed] = useState(60);
  const [progress, setProgress] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([
    { id: 1, lane: 0, y: 10, type: 'fuel' },
    { id: 2, lane: 2, y: 40, type: 'rock' },
    { id: 3, lane: 1, y: 70, type: 'fuel' },
  ]);

  const targetScore = 8;
  const laneRef = useRef(lane);
  laneRef.current = lane;

  // Previne rolagem de página ao usar setas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        moveRight();
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        boostSpeed();
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        brakeSpeed();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const moveLeft = () => {
    sounds.keyClick();
    setLane((prev) => Math.max(0, prev - 1));
  };

  const moveRight = () => {
    sounds.keyClick();
    setLane((prev) => Math.min(2, prev + 1));
  };

  const boostSpeed = () => {
    sounds.engineAccel();
    setSpeed((prev) => Math.min(100, prev + 10));
  };

  const brakeSpeed = () => {
    sounds.keyClick();
    setSpeed((prev) => Math.max(40, prev - 10));
  };

  // Loop do jogo de navegação
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setObstacles((prev) => {
        const nextObstacles: Obstacle[] = [];
        let hit = false;
        let collected = false;

        prev.forEach((item) => {
          const nextY = item.y + (speed / 60) * 2.2;

          // Colisão com o veículo (na altura de 80%)
          if (nextY >= 74 && nextY <= 86 && item.lane === laneRef.current) {
            if (item.type === 'fuel') {
              collected = true;
            } else {
              hit = true;
            }
          } else if (nextY < 100) {
            nextObstacles.push({ ...item, y: nextY });
          }
        });

        if (collected) {
          sounds.coin();
          setScore((s) => {
            const next = s + 1;
            setProgress(Math.round((next / targetScore) * 100));
            if (next >= targetScore) {
              finishGame();
            }
            return next;
          });
        }

        if (hit) {
          sounds.errorThud();
          setErrors((e) => e + 1);
        }

        // Gera novo obstáculo periodicamente
        if (Math.random() < 0.28 && nextObstacles.length < 4) {
          const newLane = Math.floor(Math.random() * 3);
          const isFuel = Math.random() > 0.45;
          nextObstacles.push({
            id: Date.now() + Math.random(),
            lane: newLane,
            y: 0,
            type: isFuel ? 'fuel' : 'rock',
          });
        }

        return nextObstacles;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver, speed]);

  const finishGame = () => {
    setGameOver(true);
    sounds.victoryFanfare();
    confetti({ particleCount: 80, spread: 70 });
    setTimeout(() => {
      onComplete({
        wpm: 35,
        accuracy: Math.max(75, 100 - errors * 5),
        errors,
        rewardXp: 60,
        rewardCoins: 50,
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* HUD do Veículo */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">
            Energia Coletada: {score}/{targetScore}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300">
            <Gauge className="w-4 h-4 text-sky-400" />
            <span>Velocidade: <b>{speed} km/h</b></span>
          </div>
          <div className="text-xs text-slate-400">
            Desvios com falha: <b className="text-rose-400">{errors}</b>
          </div>
        </div>
      </div>

      {/* Pista de Corrida (3 Faixas) */}
      <div className="relative w-full h-[320px] bg-slate-950 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Linhas de faixa tracejadas */}
        <div className="absolute inset-0 grid grid-cols-3 divide-x divide-slate-800 pointer-events-none">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/10" />
          </div>
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/20" />
          </div>
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/10" />
          </div>
        </div>

        {/* Obstáculos e Cristais de Energia */}
        {obstacles.map((obs) => {
          const leftPercent = obs.lane === 0 ? 16.6 : obs.lane === 1 ? 50 : 83.3;
          return (
            <div
              key={obs.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform"
              style={{ left: `${leftPercent}%`, top: `${obs.y}%` }}
            >
              {obs.type === 'fuel' ? (
                <div className="w-9 h-9 rounded-full bg-emerald-500 border-2 border-emerald-200 flex items-center justify-center text-lg shadow-[0_0_15px_#10b981] animate-pulse">
                  ⚡
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-rose-900 border-2 border-rose-500 flex items-center justify-center text-lg shadow-[0_0_12px_#f43f5e]">
                  🪨
                </div>
              )}
            </div>
          );
        })}

        {/* O Veículo Navegante */}
        <div
          className="absolute bottom-6 -translate-x-1/2 transition-all duration-150"
          style={{
            left: lane === 0 ? '16.6%' : lane === 1 ? '50%' : '83.3%',
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-t from-sky-600 to-cyan-400 border-2 border-white shadow-[0_0_20px_#38bdf8] flex items-center justify-center text-2xl animate-bounce">
            🚀
          </div>
        </div>
      </div>

      {/* Controles táteis / Guia das Setas */}
      <div className="flex flex-col items-center space-y-2 pt-1">
        <div className="text-xs text-slate-400">
          Use as <b>Setas do Teclado</b> ou toque nos botões abaixo:
        </div>
        <div className="flex flex-col items-center gap-1.5 select-none">
          <button
            onClick={boostSpeed}
            className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 flex items-center justify-center text-sky-400 shadow"
            title="Acelerar (Seta para Cima)"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={moveLeft}
              className="w-16 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 flex items-center justify-center text-amber-400 shadow"
              title="Faixa Esquerda (Seta para Esquerda)"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={brakeSpeed}
              className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 flex items-center justify-center text-sky-400 shadow"
              title="Frear (Seta para Baixo)"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <button
              onClick={moveRight}
              className="w-16 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 flex items-center justify-center text-amber-400 shadow"
              title="Faixa Direita (Seta para Direita)"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 text-center">
        💡 <b>Dica de Produtividade:</b> As setas de direção permitem deslocar o cursor por linhas e palavras sem necessidade de retirar as mãos do teclado para pegar o mouse.
      </div>
    </div>
  );
};
