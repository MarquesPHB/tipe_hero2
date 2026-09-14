import React from 'react';
import { IslandDef } from '../types';
import { sounds } from '../audio/soundEngine';
import { speakText } from '../speech/tts';
import { CheckCircle2, Circle, Play, Volume2, BookOpen, ChevronRight } from 'lucide-react';

interface MissionsListViewProps {
  islands: IslandDef[];
  completedPhases: number[];
  activitiesDoneByIsland: { [islandId: number]: boolean[] };
  onOpenIsland: (islandId: number) => void;
}

export const MissionsListView: React.FC<MissionsListViewProps> = ({
  islands,
  completedPhases,
  activitiesDoneByIsland,
  onOpenIsland,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Cabeçalho Didático */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Currículo Pedagógico Sequencial
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              Trilha Prática de Digitação & Utilização do Mouse
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Trilha prática e interativa com 10 ilhas temáticas: domine a precisão do mouse, a ergonomia dos punhos e o toque ágil com os 10 dedos no teclado ABNT2, com velocidade e precisão.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center shrink-0">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Progresso da Trilha</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {completedPhases.length}/10
            </span>
            <span className="text-[10px] text-slate-400 block">ilhas conquistadas</span>
          </div>
        </div>
      </div>

      {/* Linha de Progressão Didática */}
      <div className="space-y-4">
        {islands.map((island, idx) => {
          const isFinished = completedPhases.includes(idx);
          const isUnlocked = idx === 0 || completedPhases.includes(idx - 1) || isFinished;
          const doneList = activitiesDoneByIsland[idx] || [];
          const doneCount = doneList.filter(Boolean).length;

          return (
            <div
              key={island.id}
              className={`relative rounded-3xl border transition-all overflow-hidden ${
                isFinished
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-md'
                  : isUnlocked
                  ? 'bg-slate-900/90 border-slate-700 hover:border-amber-400/60 shadow-lg'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-60'
              }`}
            >
              {/* Barra superior de status da ilha */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  {/* Ícone da Ilha com cor temática */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg border-2 border-white/20"
                    style={{ backgroundColor: island.color }}
                  >
                    {island.icon}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400">
                        {island.pedagogicalModule}
                      </span>
                      {isFinished && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          ✓ Concluído
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                      {idx + 1}. {island.name}
                    </h3>

                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {island.goal}
                    </p>

                    <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-400">
                      <span>👤 Mentor: <b className="text-slate-200">{island.npcName}</b> ({island.npcTitle})</span>
                      <span>•</span>
                      <span>🎯 8 Atividades Didáticas ({doneCount}/8 feitas)</span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center space-x-2 shrink-0 sm:self-center">
                  <button
                    onClick={() => speakText(`${island.name}. ${island.goal}`)}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center transition"
                    title="Ouvir descrição da missão"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      sounds.mouseClick();
                      onOpenIsland(idx);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md ${
                      isFinished
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black'
                    }`}
                  >
                    <span>{isFinished ? 'Revisar Atividades' : 'Explorar Ilha'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Prévia rápida das 8 atividades em formato de pílulas */}
              <div className="px-6 pb-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 flex flex-wrap gap-2 text-[11px]">
                {island.activities.map((act, aIdx) => {
                  const done = doneList[aIdx];
                  return (
                    <div
                      key={act.id}
                      className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                        done
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{done ? '✓' : aIdx + 1}</span>
                      <span className="truncate max-w-[150px]">{act.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
