import React, { useState, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { ArrowDownCircle, ArrowUpCircle, Droplets, Trophy, Sparkles, Heart } from 'lucide-react';

interface MouseScrollActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface VerticalPlant {
  id: number;
  depthPercent: number; // 0 a 100% de altura na estante vertical
  label: string;
  emoji: string;
  wateredEmoji: string;
  watered: boolean;
}

export const MouseScrollActivity: React.FC<MouseScrollActivityProps> = ({ onComplete }) => {
  const [waterLevel, setWaterLevel] = useState(10);
  const [plants, setPlants] = useState<VerticalPlant[]>([
    { id: 1, depthPercent: 25, label: 'Morangueiro do Alto', emoji: '🌱', wateredEmoji: '🍓 Moranguinho', watered: false },
    { id: 2, depthPercent: 50, label: 'Girassol da Varanda', emoji: '🌱', wateredEmoji: '🌻 Girassol Feliz', watered: false },
    { id: 3, depthPercent: 75, label: 'Orquídea da Estante', emoji: '🌱', wateredEmoji: '🌸 Orquídea Florista', watered: false },
    { id: 4, depthPercent: 95, label: 'Samambaia da Base', emoji: '🌱', wateredEmoji: '🪴 Samambaia Verde', watered: false },
  ]);
  const [currentPlantIdx, setCurrentPlantIdx] = useState(0);
  const [wateredCount, setWateredCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentPlant = plants[currentPlantIdx];

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 3 : -3;
    setWaterLevel((prev) => Math.max(0, Math.min(100, prev + delta)));
  };

  const handleWaterPlant = (plant: VerticalPlant) => {
    sounds.coin();
    sounds.bubblePop(1.2);
    setPlants((prev) =>
      prev.map((p) => (p.id === plant.id ? { ...p, watered: true } : p))
    );
    const nextCount = wateredCount + 1;
    setWateredCount(nextCount);

    if (nextCount >= plants.length) {
      sounds.victoryFanfare();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        onComplete({
          wpm: 0,
          accuracy: 100,
          errors: 0,
          rewardXp: 55,
          rewardCoins: 45,
        });
      }, 1100);
    } else {
      setCurrentPlantIdx((prev) => prev + 1);
    }
  };

  const isNearPlant =
    currentPlant &&
    Math.abs(waterLevel - currentPlant.depthPercent) < 7 &&
    !currentPlant.watered;

  return (
    <div className="flex flex-col space-y-4 select-none w-full max-w-4xl mx-auto">
      {/* Barra de Status Positiva */}
      <div className="flex items-center justify-between bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center space-x-2">
          <Droplets className="w-5 h-5 text-sky-400" />
          <span className="text-xs font-bold text-slate-200">
            Jardim Vertical (Roda do Mouse):{' '}
            <b className="text-emerald-400 font-extrabold text-sm">{wateredCount} de {plants.length}</b> vasos regados
          </span>
        </div>
        <div className="text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
          Altura do Regador: <b className="text-sky-400 font-bold">{Math.round(waterLevel)}%</b>
        </div>
      </div>

      <div className="text-xs text-center py-2 px-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-inner">
        🪴 <b>Gire a Rodinha do Mouse (Scroll):</b> Suba e desça o regador de água fresca pelas prateleiras do jardim vertical para regar cada plantinha da casa!
      </div>

      {/* Estante Vertical de Vasos com Scroll */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="relative w-full h-[330px] bg-gradient-to-b from-slate-950 via-emerald-950/30 to-slate-950 border-2 border-emerald-700/50 rounded-3xl overflow-hidden shadow-2xl flex"
      >
        {/* Régua de Andares da Estante */}
        <div className="w-20 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between p-2 text-[10px] text-slate-400 font-mono">
          <span>☀️ Topo</span>
          <span>🍓 Andar 1</span>
          <span>🌻 Andar 2</span>
          <span>🌸 Andar 3</span>
          <span>🪴 Base</span>
        </div>

        {/* Área Central da Estante e Vasinhos */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Prateleiras de madeira no fundo */}
          <div className="absolute inset-0 flex flex-col justify-around pointer-events-none opacity-20">
            <div className="h-2 bg-amber-700 w-full" />
            <div className="h-2 bg-amber-700 w-full" />
            <div className="h-2 bg-amber-700 w-full" />
            <div className="h-2 bg-amber-700 w-full" />
          </div>

          {/* Plantas nos andares */}
          {plants.map((plt) => (
            <div
              key={plt.id}
              className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-3 transition-all ${
                plt.watered ? 'opacity-50 scale-95' : 'opacity-100'
              }`}
              style={{ top: `${plt.depthPercent}%` }}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-lg transition-transform ${
                  plt.watered
                    ? 'bg-emerald-950/70 border-emerald-400/60 text-emerald-300'
                    : isNearPlant && currentPlant?.id === plt.id
                    ? 'bg-amber-400 border-white text-slate-950 scale-125 animate-bounce ring-4 ring-emerald-400/50'
                    : 'bg-slate-800/90 border-slate-600'
                }`}
              >
                {plt.watered ? '💖' : plt.emoji}
              </div>
              <span className="text-[11px] font-extrabold text-slate-200 whitespace-nowrap bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-700 shadow-md">
                {plt.watered ? plt.wateredEmoji : `${plt.label} (${plt.depthPercent}%)`}
              </span>
            </div>
          ))}

          {/* Regador Controlado pelo Scroll */}
          <div
            className="absolute left-6 -translate-y-1/2 transition-all duration-75 flex items-center space-x-3 pointer-events-none z-20"
            style={{ top: `${waterLevel}%` }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 border-2 border-white flex items-center justify-center text-2xl shadow-[0_0_20px_#0284c7]">
              🚿
            </div>
            <div className="bg-slate-950/90 border border-sky-400/50 px-2.5 py-1 rounded-xl text-[11px] font-bold text-sky-300 shadow">
              Regador em {Math.round(waterLevel)}%
            </div>
          </div>
        </div>

        {/* Botões manuais de rolagem para acessibilidade e toque */}
        <div className="w-14 border-l border-slate-800 bg-slate-900/50 flex flex-col justify-between p-2">
          <button
            onClick={() => setWaterLevel((p) => Math.max(0, p - 10))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center transition active:scale-95"
            title="Subir Regador"
          >
            <ArrowUpCircle className="w-6 h-6" />
          </button>

          <button
            onClick={() => setWaterLevel((p) => Math.min(100, p + 10))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center transition active:scale-95"
            title="Descer Regador"
          >
            <ArrowDownCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Botão de Regar quando alinhado */}
      {isNearPlant && (
        <div className="flex justify-center animate-bounce">
          <button
            onClick={() => handleWaterPlant(currentPlant)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl flex items-center space-x-2 transition transform active:scale-95"
          >
            <Droplets className="w-5 h-5 text-sky-200" />
            <span>Regar {currentPlant.label} com Água Fresca!</span>
          </button>
        </div>
      )}

      {/* Dica Construtiva */}
      <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <b>Cuidado com a Natureza:</b> As plantas limpam o ar de nossa casa e trazem alegria e beleza para a família. Regá-las no horário certo é um ato de amor e responsabilidade!
        </span>
      </div>
    </div>
  );
};
