import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Trophy, Flame, RotateCcw, Sparkles, Heart } from 'lucide-react';

interface MouseReflexActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface HarvestItem {
  id: number;
  x: number;
  y: number;
  emoji: string;
  label: string;
  bgGradient: string;
  borderColor: string;
  size: number;
  points: number;
}

const HEALTHY_HARVEST = [
  { emoji: '🍎', label: 'Maçã Vermelha', bgGradient: 'from-red-400 to-rose-600', borderColor: 'border-red-200' },
  { emoji: '🍊', label: 'Laranja Doce', bgGradient: 'from-amber-400 to-orange-500', borderColor: 'border-amber-200' },
  { emoji: '🍓', label: 'Morango Fresco', bgGradient: 'from-rose-400 to-pink-600', borderColor: 'border-rose-200' },
  { emoji: '🍇', label: 'Uvas Roxas', bgGradient: 'from-purple-400 to-indigo-600', borderColor: 'border-purple-200' },
  { emoji: '🥕', label: 'Cenoura da Horta', bgGradient: 'from-orange-400 to-amber-600', borderColor: 'border-orange-200' },
  { emoji: '🍉', label: 'Melancia', bgGradient: 'from-emerald-400 to-green-600', borderColor: 'border-emerald-200' },
  { emoji: '🌽', label: 'Milho Dourado', bgGradient: 'from-yellow-400 to-amber-500', borderColor: 'border-yellow-200' },
  { emoji: '🥦', label: 'Brócolis Nutritivo', bgGradient: 'from-green-500 to-emerald-700', borderColor: 'border-green-200' },
];

export const MouseReflexActivity: React.FC<MouseReflexActivityProps> = ({ onComplete }) => {
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [activeItem, setActiveItem] = useState<HarvestItem | null>(null);
  const [harvestFeedback, setHarvestFeedback] = useState<{ x: number; y: number; text: string } | null>(null);
  const targetScore = 10;
  const isFinishedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnItem = useCallback(() => {
    if (isFinishedRef.current) return;
    const type = HEALTHY_HARVEST[Math.floor(Math.random() * HEALTHY_HARVEST.length)];
    setActiveItem({
      id: Date.now(),
      x: Math.floor(Math.random() * 70 + 15),
      y: Math.floor(Math.random() * 60 + 20),
      emoji: type.emoji,
      label: type.label,
      bgGradient: type.bgGradient,
      borderColor: type.borderColor,
      size: Math.floor(Math.random() * 8 + 68),
      points: 100,
    });
  }, []);

  useEffect(() => {
    spawnItem();
  }, [spawnItem]);

  const handleHarvestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFinishedRef.current) return;

    sounds.bubblePop(1.1 + Math.min(0.4, combo * 0.08));
    sounds.coin();

    const nextCombo = combo + 1;
    setCombo(nextCombo);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setHarvestFeedback({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        text: nextCombo > 1 ? `🧺 ${nextCombo}x COLHEITA PERFEITA!` : '🧺 Colhido para a Cesta!',
      });
      setTimeout(() => setHarvestFeedback(null), 600);
    }

    const nextScore = score + 1;
    setScore(nextScore);

    if (nextScore >= targetScore) {
      isFinishedRef.current = true;
      sounds.victoryFanfare();
      confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
      setTimeout(() => {
        onComplete({
          wpm: 0,
          accuracy: Math.max(75, Math.round((targetScore / (targetScore + errors)) * 100)),
          errors,
          rewardXp: 60,
          rewardCoins: 50,
        });
      }, 1100);
    } else {
      spawnItem();
    }
  };

  const handleMiss = () => {
    sounds.errorThud();
    setCombo(0);
    setErrors((prev) => prev + 1);
  };

  const resetActivity = () => {
    isFinishedRef.current = false;
    setScore(0);
    setErrors(0);
    setCombo(0);
    spawnItem();
  };

  return (
    <div className="flex flex-col space-y-3.5 select-none w-full max-w-4xl mx-auto">
      {/* Placar Construtivo e Positivo */}
      <div className="flex items-center justify-between bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧺</span>
            <span className="text-xs font-bold text-slate-200">
              Alimentos Colhidos para a Cesta:{' '}
              <b className="text-emerald-400 font-extrabold text-sm">{score} de {targetScore}</b>
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs animate-bounce shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>{combo}x HORTA PRODUTIVA!</span>
            </div>
          )}

          <div className="text-xs text-slate-400 hidden sm:inline">
            Cliques fora: <b className="text-amber-400">{errors}</b>
          </div>
        </div>

        <button
          onClick={resetActivity}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Recomeçar</span>
        </button>
      </div>

      {/* Orientação Educativa e Construtiva */}
      <div className="text-xs text-center py-2 px-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-inner">
        🍎 <b>Colheita Feliz no Pomar e na Horta:</b> Mova o cursor até os frutos e legumes maduros e clique com carinho para recolhê-los frescos para a cesta da família!
      </div>

      {/* Arena do Pomar e Horta */}
      <div
        ref={containerRef}
        onClick={handleMiss}
        className="relative w-full h-[340px] bg-gradient-to-b from-slate-950 via-emerald-950/30 to-slate-950 border-2 border-emerald-700/50 rounded-3xl overflow-hidden shadow-2xl cursor-pointer select-none"
      >
        {/* Fundo do pomar verdejante */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0,transparent_80%)] pointer-events-none" />
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none border border-emerald-900/10">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border border-emerald-900/10 flex items-center justify-center text-[10px] text-emerald-900/40 font-mono">
              {i % 3 === 0 ? '🌿' : ''}
            </div>
          ))}
        </div>

        {/* Feedback visual de alimento recolhido */}
        {harvestFeedback && (
          <div
            style={{ left: `${harvestFeedback.x}px`, top: `${harvestFeedback.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 font-black text-sm text-emerald-300 bg-slate-950/95 px-3.5 py-1.5 rounded-full border-2 border-emerald-400 shadow-[0_0_20px_#10b981] animate-bounce flex items-center space-x-1"
          >
            <span>✨</span>
            <span>{harvestFeedback.text}</span>
          </div>
        )}

        {/* Alimento Maduro para Colher */}
        {activeItem && (
          <button
            onClick={handleHarvestClick}
            style={{
              left: `${activeItem.x}%`,
              top: `${activeItem.y}%`,
              width: `${activeItem.size}px`,
              height: `${activeItem.size}px`,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-3xl p-2 bg-gradient-to-br ${activeItem.bgGradient} border-2 ${activeItem.borderColor} shadow-[0_0_25px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95 animate-pulse`}
          >
            <div className="absolute top-1.5 left-2 w-3 h-2 rounded-full bg-white/60 pointer-events-none" />
            <span className="text-3xl drop-shadow-md select-none">{activeItem.emoji}</span>
            <span className="text-[9px] font-black text-slate-950 bg-white/90 px-1.5 py-0.5 rounded-full mt-1 shadow-sm whitespace-nowrap">
              Colher
            </span>
          </button>
        )}
      </div>

      {/* Dica Ergonômica e Nutricional */}
      <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <b>Alimentação Saudável e Consciência Ecológica:</b> Frutas, verduras e legumes dão energia natural para o corpo e a mente. Colher no momento certo e valorizar os alimentos é um hábito precioso!
        </span>
      </div>
    </div>
  );
};
