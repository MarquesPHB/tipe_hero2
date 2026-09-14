import React from 'react';
import { IslandDef } from '../types';
import { sounds } from '../audio/soundEngine';
import { CheckCircle2, Lock, Play, Sparkles, ChevronRight, Award } from 'lucide-react';

interface FullIslandTrailProps {
  islands: IslandDef[];
  completedPhases: number[];
  activitiesDoneByIsland: { [islandId: number]: boolean[] };
  currentIslandIdx: number;
  onSelectIsland: (islandId: number) => void;
}

export const FullIslandTrail: React.FC<FullIslandTrailProps> = ({
  islands,
  completedPhases,
  activitiesDoneByIsland,
  currentIslandIdx,
  onSelectIsland,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Cabeçalho da Trilha Completa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center text-xl font-bold shadow-[0_0_15px_#f59e0b33]">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                Trilha Completa de Aprendizagem (10 Ilhas)
              </h3>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-400/40">
                100% Visível
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Jornada pedagógica contínua: do mouse e linha-base até a cidadela dos mestres.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Progresso Geral:</span>
            <span className="font-mono font-bold text-amber-400">
              {completedPhases.length}/10 Ilhas
            </span>
          </div>
        </div>
      </div>

      {/* Grid / Trilha Linear das 10 Ilhas */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {islands.map((island, idx) => {
          const isDone = completedPhases.includes(idx);
          const isUnlocked = idx === 0 || completedPhases.includes(idx - 1) || isDone;
          const isCurrent = currentIslandIdx === idx;
          const doneList = activitiesDoneByIsland[idx] || [];
          const doneCount = doneList.filter(Boolean).length;
          const totalActivities = island.activities.length;

          return (
            <button
              key={island.id}
              onClick={() => {
                sounds.mouseClick();
                onSelectIsland(idx);
              }}
              className={`relative rounded-2xl p-3.5 text-left border transition-all flex flex-col justify-between group ${
                isCurrent
                  ? 'bg-gradient-to-b from-sky-950/80 to-slate-900 border-sky-400 shadow-[0_0_20px_#38bdf833] scale-[1.02]'
                  : isDone
                  ? 'bg-slate-950/90 border-emerald-500/40 hover:border-emerald-400/80'
                  : isUnlocked
                  ? 'bg-slate-950/70 border-slate-700/80 hover:border-amber-400/80'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Badge superior */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  #{idx + 1}
                </span>

                {isDone ? (
                  <span className="text-emerald-400 bg-emerald-500/20 p-1 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                ) : isCurrent ? (
                  <span className="text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider animate-pulse border border-sky-500/40">
                    Atual
                  </span>
                ) : !isUnlocked ? (
                  <span className="text-slate-500 p-1">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-amber-400 bg-amber-400/20 p-1 rounded-lg border border-amber-400/30">
                    <Play className="w-3 h-3 fill-current" />
                  </span>
                )}
              </div>

              {/* Ícone e Nome */}
              <div className="my-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border mb-2 group-hover:scale-105 transition"
                  style={{ backgroundColor: island.color, borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  {island.icon}
                </div>
                <h4 className="text-xs font-black text-white truncate leading-tight">
                  {island.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {island.npcName}
                </p>
              </div>

              {/* Barra de Progresso da Ilha */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 w-full">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>{doneCount}/{totalActivities}</span>
                  <span className="font-bold text-slate-300">
                    {Math.round((doneCount / totalActivities) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isDone
                        ? 'bg-emerald-400'
                        : isCurrent
                        ? 'bg-sky-400'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((doneCount / totalActivities) * 100))}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
