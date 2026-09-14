import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Goal, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

interface PenaltyKickActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface TargetZone {
  id: number;
  label: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  keyHint: string;
}

const ZONES: TargetZone[] = [
  { id: 1, label: 'Superior Esquerdo', xPercent: 20, yPercent: 25, keyHint: 'Q' },
  { id: 2, label: 'Centro Alto', xPercent: 50, yPercent: 20, keyHint: 'W' },
  { id: 3, label: 'Superior Direito', xPercent: 80, yPercent: 25, keyHint: 'E' },
  { id: 4, label: 'Rasteiro Esquerdo', xPercent: 22, yPercent: 75, keyHint: 'A' },
  { id: 5, label: 'Rasteiro Direito', xPercent: 78, yPercent: 75, keyHint: 'D' },
];

const TOTAL_ROUNDS = 5;

export const PenaltyKickActivity: React.FC<PenaltyKickActivityProps> = ({ onComplete }) => {
  const [round, setRound] = useState(1);
  const [goalsScored, setGoalsScored] = useState(0);
  const [shotsHistory, setShotsHistory] = useState<('goal' | 'saved')[]>([]);
  const [isKicking, setIsKicking] = useState(false);
  const [ballAnim, setBallAnim] = useState<{ targetX: number; targetY: number; progress: number } | null>(null);
  const [goaliePos, setGoaliePos] = useState<number>(50); // X percent
  const [message, setMessage] = useState<string>('Escolha o canto do gol para chutar!');
  const [isFinished, setIsFinished] = useState(false);

  // Play whistle at start
  useEffect(() => {
    sounds.whistle();
  }, []);

  // Keyboard shortcut listener (Q, W, E, A, D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isKicking || isFinished) return;
      const key = e.key.toUpperCase();
      const match = ZONES.find((z) => z.keyHint === key);
      if (match) {
        shoot(match);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isKicking, isFinished]);

  const shoot = (zone: TargetZone) => {
    if (isKicking || isFinished) return;

    setIsKicking(true);
    sounds.kickBall();
    setMessage('Chutou com força no gol...');

    // Goalie decides dive target (randomly picks one zone 1 to 5)
    const goalieZoneId = Math.floor(Math.random() * 5) + 1;
    const goalieTarget = ZONES.find((z) => z.id === goalieZoneId);
    if (goalieTarget) {
      setGoaliePos(goalieTarget.xPercent);
    }

    // Animate ball
    let p = 0;
    setBallAnim({ targetX: zone.xPercent, targetY: zone.yPercent, progress: 0 });

    const interval = setInterval(() => {
      p += 0.12;
      if (p >= 1) {
        clearInterval(interval);
        setBallAnim(null);
        evaluateShot(zone.id, goalieZoneId);
      } else {
        setBallAnim({ targetX: zone.xPercent, targetY: zone.yPercent, progress: p });
      }
    }, 40);
  };

  const evaluateShot = (shotZoneId: number, goalieZoneId: number) => {
    const isGoal = shotZoneId !== goalieZoneId;

    if (isGoal) {
      sounds.goalCheer();
      sounds.coin();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      setMessage('⚽ GOOOOOOL! Golaço no ângulo!');
      const newGoals = goalsScored + 1;
      setGoalsScored(newGoals);
      setShotsHistory((prev) => [...prev, 'goal']);
    } else {
      sounds.errorThud();
      setMessage('🧤 Defesaça do goleiro!');
      setShotsHistory((prev) => [...prev, 'saved']);
    }

    const nextRound = round + 1;
    setRound(nextRound);

    if (nextRound > TOTAL_ROUNDS && !isFinished) {
      setIsFinished(true);
      setTimeout(() => {
        sounds.victoryFanfare();
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });

        setTimeout(() => {
          onComplete({
            wpm: 35,
            accuracy: Math.max(80, (goalsScored / TOTAL_ROUNDS) * 100),
            errors: TOTAL_ROUNDS - goalsScored,
            rewardXp: 90,
            rewardCoins: 60,
          });
        }, 1600);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsKicking(false);
        setGoaliePos(50);
        setMessage('Prepare-se para o próximo pênalti!');
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">⚽</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Disputa de Pênaltis da Amizade
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Pênalti {Math.min(round, TOTAL_ROUNDS)} de {TOTAL_ROUNDS}
              </span>
            </h3>
            <p className="text-xs text-slate-300">{message}</p>
          </div>
        </div>

        {/* Scorecard Dots */}
        <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
            const status = shotsHistory[i];
            return (
              <div
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  status === 'goal'
                    ? 'bg-emerald-500 text-slate-950'
                    : status === 'saved'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-700 text-slate-400 border border-slate-600'
                }`}
              >
                {status === 'goal' ? '✓' : status === 'saved' ? '✗' : i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stadium Soccer Goal Arena */}
      <div className="relative w-full h-[360px] sm:h-[380px] bg-gradient-to-b from-sky-950 via-slate-900 to-emerald-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-600/60 flex flex-col justify-between p-4">
        {/* Stadium Lights & Crowd */}
        <div className="absolute top-2 inset-x-8 flex justify-between text-xs text-slate-400 opacity-60">
          <span>🏟️ Estádio da Vitória</span>
          <span>✨ Torcida Animada</span>
        </div>

        {/* The Soccer Goal Frame */}
        <div className="relative w-full max-w-lg mx-auto h-56 mt-8 border-4 border-white rounded-t-xl bg-slate-900/60 shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden">
          {/* Goal Net Hexagon/Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />

          {/* Goalie Character */}
          <div
            className="absolute bottom-2 transition-all duration-300 flex flex-col items-center z-10"
            style={{ left: `${goaliePos}%`, transform: 'translateX(-50%)' }}
          >
            <span className="text-5xl drop-shadow-lg">🧤🧑‍🦱🧤</span>
            <div className="w-10 h-3 bg-slate-950/60 rounded-full blur-[2px]" />
          </div>

          {/* Interactive Target Zones in the Goal */}
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => shoot(zone)}
              disabled={isKicking || isFinished}
              style={{ left: `${zone.xPercent}%`, top: `${zone.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl border-2 border-dashed border-amber-400/70 hover:border-amber-300 bg-amber-400/15 hover:bg-amber-400/35 active:scale-95 disabled:pointer-events-none transition-all flex flex-col items-center justify-center shadow-lg group z-20"
            >
              <span className="text-xs font-black text-amber-300 group-hover:scale-110 transition">
                [{zone.keyHint}]
              </span>
              <span className="text-[9px] font-bold text-amber-200 text-center leading-tight">
                {zone.label}
              </span>
            </button>
          ))}
        </div>

        {/* Grass Turf Pitch & Penalty Spot */}
        <div className="relative w-full h-24 bg-gradient-to-t from-emerald-800 to-emerald-600 border-t-4 border-emerald-400 flex items-center justify-center">
          {/* Penalty Spot */}
          <div className="w-4 h-4 rounded-full bg-white shadow-md" />

          {/* Ball */}
          {!ballAnim ? (
            <div className="absolute bottom-6 text-4xl animate-bounce drop-shadow-lg cursor-pointer">
              ⚽
            </div>
          ) : (
            <div
              className="absolute pointer-events-none transition-all duration-75 text-4xl drop-shadow-2xl z-30"
              style={{
                left: `${50 + (ballAnim.targetX - 50) * ballAnim.progress}%`,
                bottom: `${24 + ballAnim.progress * 180}px`,
                transform: `translate(-50%, 50%) scale(${1 - ballAnim.progress * 0.45}) rotate(${
                  ballAnim.progress * 360
                }deg)`,
              }}
            >
              ⚽
            </div>
          )}
        </div>

        {/* Victory Screen */}
        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-40 animate-in fade-in">
            <span className="text-6xl animate-bounce">🏆⚽🎉</span>
            <h3 className="text-xl font-black text-emerald-400">Pênaltis Finalizados com Sucesso!</h3>
            <p className="text-xs text-slate-200">Você marcou {goalsScored} de {TOTAL_ROUNDS} gols na disputa!</p>
          </div>
        )}
      </div>

      {/* Touch/Button Control Bar */}
      <div className="flex items-center justify-between w-full bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Use as teclas [Q, W, E, A, D] ou clique diretamente no canto desejado</span>
        </div>

        <div className="flex items-center space-x-1">
          {ZONES.map((z) => (
            <button
              key={z.id}
              onClick={() => shoot(z)}
              disabled={isKicking || isFinished}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs border border-slate-700 transition"
            >
              {z.keyHint}: {z.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
