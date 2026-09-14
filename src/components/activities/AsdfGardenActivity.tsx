import React, { useState, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sprout, Sparkles, CheckCircle2, Heart } from 'lucide-react';

interface AsdfGardenActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface PlantBed {
  key: string;
  fingerName: string;
  fingerColor: string;
  plantName: string;
  emoji: string;
  stage: number; // 0: semente, 1: broto, 2: flor, 3: colhida
}

export const AsdfGardenActivity: React.FC<AsdfGardenActivityProps> = ({ onComplete }) => {
  const [beds, setBeds] = useState<PlantBed[]>([
    { key: 'A', fingerName: 'Dedo Mínimo', fingerColor: 'text-rose-400', plantName: 'Amora', emoji: '🫐', stage: 0 },
    { key: 'S', fingerName: 'Dedo Anular', fingerColor: 'text-amber-400', plantName: 'Sálvia', emoji: '🌿', stage: 0 },
    { key: 'D', fingerName: 'Dedo Médio', fingerColor: 'text-emerald-400', plantName: 'Dente-de-Leão', emoji: '🌼', stage: 0 },
    { key: 'F', fingerName: 'Dedo Indicador (Marca Tátil)', fingerColor: 'text-sky-400', plantName: 'Feijoeiro', emoji: '🌱', stage: 0 },
    { key: 'G', fingerName: 'Dedo Indicador (Extensão)', fingerColor: 'text-cyan-400', plantName: 'Girassol', emoji: '🌻', stage: 0 },
  ]);

  const [activeTargetKey, setActiveTargetKey] = useState<string>('A');
  const [harvestCount, setHarvestCount] = useState(0);
  const [errors, setErrors] = useState(0);
  const targetTotal = 15; // 3 ciclos de colheita

  // Sequência pedagógica da mão esquerda na linha-base: A -> S -> D -> F -> G
  const sequence = ['A', 'S', 'D', 'F', 'G'];
  const [seqIndex, setSeqIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (sequence.includes(key)) {
        e.preventDefault();
        triggerKey(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seqIndex, beds, harvestCount]);

  const triggerKey = (pressed: string) => {
    const expected = sequence[seqIndex];

    if (pressed === expected) {
      sounds.plantSprout();

      setBeds((prev) =>
        prev.map((bed) => {
          if (bed.key === pressed) {
            const nextStage = (bed.stage + 1) % 4;
            return { ...bed, stage: nextStage };
          }
          return bed;
        })
      );

      const nextSeqIdx = (seqIndex + 1) % sequence.length;
      setSeqIndex(nextSeqIdx);
      setActiveTargetKey(sequence[nextSeqIdx]);

      setHarvestCount((prev) => {
        const next = prev + 1;
        if (next >= targetTotal) {
          finishGarden();
        }
        return next;
      });
    } else {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
    }
  };

  const finishGarden = () => {
    sounds.victoryFanfare();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      onComplete({
        wpm: 32,
        accuracy: Math.max(75, 100 - errors * 5),
        errors,
        rewardXp: 65,
        rewardCoins: 50,
      });
    }, 1200);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Placar da Colheita */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
        <div className="flex items-center space-x-2">
          <Sprout className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            Horta ASDF: {harvestCount}/{targetTotal} regas e colheitas
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-400">
            Próxima semente: <b className="text-amber-400 text-sm">{activeTargetKey}</b>
          </span>
          <span className="text-slate-400">
            Erros: <b className="text-rose-400">{errors}</b>
          </span>
        </div>
      </div>

      {/* Canteiros da Horta com Animações */}
      <div className="grid grid-cols-5 gap-3 bg-gradient-to-b from-amber-950/20 to-emerald-950/30 border-2 border-emerald-900/60 rounded-2xl p-4 shadow-xl">
        {beds.map((bed) => {
          const isCurrent = activeTargetKey === bed.key;
          return (
            <button
              key={bed.key}
              onClick={() => triggerKey(bed.key)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all select-none cursor-pointer ${
                isCurrent
                  ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_15px_#f59e0b44] scale-105 animate-pulse'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Tecla Gigante */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-extrabold text-2xl shadow-md border ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-100 border-slate-700'
                }`}
              >
                {bed.key}
              </div>

              {/* Planta / Estágio de Crescimento */}
              <div className="h-16 flex items-center justify-center text-4xl my-2 transition-transform duration-200">
                {bed.stage === 0 && <span className="opacity-60 text-2xl">🌱</span>}
                {bed.stage === 1 && <span className="text-3xl">🌿</span>}
                {bed.stage === 2 && <span className="text-4xl animate-bounce">{bed.emoji}</span>}
                {bed.stage === 3 && <span className="text-3xl opacity-90">✨</span>}
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-slate-200 block">{bed.plantName}</span>
                <span className={`text-[10px] font-medium ${bed.fingerColor} block mt-0.5 leading-tight`}>
                  {bed.fingerName}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Guia Anatômico da Mão Esquerda */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
        <div className="text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
          <span>🖐️ Guia Anatômico da Mão Esquerda (Linha-Base ABNT2):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
            <b className="text-rose-300">Tecla A:</b> 1º dedo (mínimo)
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
            <b className="text-amber-300">Tecla S:</b> 2º dedo (anular)
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
            <b className="text-emerald-300">Tecla D:</b> 3º dedo (médio)
          </div>
          <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
            <b className="text-sky-300">Teclas F e G:</b> 4º dedo (indicador)
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 text-center">
        📖 <b>Dica da Lição 1:</b> Pressione a tecla sem bater com força. Deixe o polegar esquerdo descansando suavemente sobre a barra de espaço.
      </div>
    </div>
  );
};
