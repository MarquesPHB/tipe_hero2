import React, { useState } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Move, CheckCircle2, RotateCcw, Heart, Sparkles, Home } from 'lucide-react';

interface MouseDragDropActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface RoomOrganizePair {
  id: string;
  itemName: string;
  itemEmoji: string;
  itemColor: string;
  targetName: string;
  targetEmoji: string;
  targetSatisfiedEmoji: string;
  targetColor: string;
  hint: string;
  placed: boolean;
}

const ROOM_PAIRS: RoomOrganizePair[] = [
  {
    id: 'bear',
    itemName: 'Ursinho de Pelúcia',
    itemEmoji: '🧸',
    itemColor: 'from-amber-400 to-orange-500',
    targetName: 'Cesto de Brinquedos',
    targetEmoji: '🧺',
    targetSatisfiedEmoji: '🧸🧺✨',
    targetColor: 'border-amber-500/60 bg-amber-950/40',
    hint: 'Guarde o ursinho no cesto!',
    placed: false,
  },
  {
    id: 'book',
    itemName: 'Livro de Histórias',
    itemEmoji: '📚',
    itemColor: 'from-sky-400 to-blue-600',
    targetName: 'Estante de Livros',
    targetEmoji: '📖',
    targetSatisfiedEmoji: '📚📖✨',
    targetColor: 'border-sky-500/60 bg-sky-950/40',
    hint: 'Coloque o livro na estante!',
    placed: false,
  },
  {
    id: 'puzzle',
    itemName: 'Blocos de Montar',
    itemEmoji: '🧩',
    itemColor: 'from-purple-500 to-indigo-600',
    targetName: 'Caixa de Peças',
    targetEmoji: '📦',
    targetSatisfiedEmoji: '🧩📦✨',
    targetColor: 'border-purple-500/60 bg-purple-950/40',
    hint: 'Guarde as peças na caixa!',
    placed: false,
  },
  {
    id: 'shoes',
    itemName: 'Tênis de Escola',
    itemEmoji: '👟',
    itemColor: 'from-teal-400 to-emerald-600',
    targetName: 'Sapateira do Quarto',
    targetEmoji: '🚪',
    targetSatisfiedEmoji: '👟🚪✨',
    targetColor: 'border-teal-500/60 bg-teal-950/40',
    hint: 'Guarde o tênis na sapateira!',
    placed: false,
  },
  {
    id: 'plant',
    itemName: 'Regador com Água',
    itemEmoji: '💧',
    itemColor: 'from-emerald-400 to-teal-500',
    targetName: 'Vasinho de Flor',
    targetEmoji: '🪴',
    targetSatisfiedEmoji: '🌸🪴💧',
    targetColor: 'border-emerald-500/60 bg-emerald-950/40',
    hint: 'Regue a plantinha na janela!',
    placed: false,
  },
  {
    id: 'shirt',
    itemName: 'Camiseta Dobrada',
    itemEmoji: '👕',
    itemColor: 'from-rose-400 to-pink-600',
    targetName: 'Gaveta do Armário',
    targetEmoji: '🗄️',
    targetSatisfiedEmoji: '👕🗄️✨',
    targetColor: 'border-rose-500/60 bg-rose-950/40',
    hint: 'Guarde a roupa na gaveta!',
    placed: false,
  },
];

export const MouseDragDropActivity: React.FC<MouseDragDropActivityProps> = ({ onComplete }) => {
  const [pairs, setPairs] = useState<RoomOrganizePair[]>(ROOM_PAIRS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    sounds.mouseClick();
    e.dataTransfer.setData('text/plain', id);
    setSelectedItemId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || selectedItemId;
    processMatch(sourceId, targetId);
  };

  const handleItemSelect = (id: string) => {
    sounds.mouseClick();
    setSelectedItemId(id);
  };

  const handleTargetClick = (targetId: string) => {
    if (!selectedItemId) return;
    processMatch(selectedItemId, targetId);
  };

  const processMatch = (sourceId: string | null, targetId: string) => {
    if (!sourceId) return;

    if (sourceId === targetId) {
      sounds.bubblePop();
      sounds.coin();
      sounds.successPing();

      setActiveReaction(targetId);
      setTimeout(() => setActiveReaction(null), 1200);

      const updated = pairs.map((p) => (p.id === targetId ? { ...p, placed: true } : p));
      setPairs(updated);
      setSelectedItemId(null);

      const placedCount = updated.filter((p) => p.placed).length;
      if (placedCount >= pairs.length) {
        sounds.victoryFanfare();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => {
          onComplete({
            wpm: 0,
            accuracy: Math.max(75, 100 - errors * 10),
            errors,
            rewardXp: 60,
            rewardCoins: 50,
          });
        }, 1200);
      }
    } else {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
      setSelectedItemId(null);
    }
  };

  const resetActivity = () => {
    setPairs(ROOM_PAIRS);
    setSelectedItemId(null);
    setErrors(0);
  };

  const placedTotal = pairs.filter((p) => p.placed).length;

  return (
    <div className="flex flex-col space-y-4 select-none w-full max-w-4xl mx-auto">
      {/* Placar Positivo e Construtivo */}
      <div className="flex items-center justify-between bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center space-x-3">
          <Home className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            Itens Arrumados no Quarto:{' '}
            <b className="text-amber-400 font-extrabold text-sm">{placedTotal} de {pairs.length}</b>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs text-slate-400 hidden sm:inline">
            Erros de encaixe: <b className="text-amber-400">{errors}</b>
          </div>
          <button
            onClick={resetActivity}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recomeçar</span>
          </button>
        </div>
      </div>

      {/* Orientação Educativa e Construtiva */}
      <div className="text-xs text-center py-2 px-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/40 text-emerald-300 shadow-inner">
        🧺 <b>Arrumar o Quarto & Guardar os Brinquedos:</b> Clique e arraste cada brinquedo ou objeto até seu lugar certo (cesto, estante, gaveta, vasinho)! Também funciona clicando primeiro no item e depois no destino.
      </div>

      {/* Arena de Arrumação e Organização */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 border-2 border-slate-800 rounded-3xl p-5 shadow-2xl">
        {/* LADO ESQUERDO: OBJETOS ESPALHADOS PARA GUARDAR */}
        <div className="flex flex-col space-y-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4">
          <h4 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
            <span>🧸</span>
            <span>Objetos para Guardar (Clique & Arraste)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2.5">
            {pairs.map((p) => {
              const isSelected = selectedItemId === p.id;
              if (p.placed) {
                return (
                  <div
                    key={p.id}
                    className="h-24 rounded-2xl border-2 border-dashed border-emerald-900/40 bg-emerald-950/20 flex flex-col items-center justify-center opacity-40"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                    <span className="text-[10px] font-bold text-emerald-400">Arrumado!</span>
                  </div>
                );
              }

              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, p.id)}
                  onClick={() => handleItemSelect(p.id)}
                  className={`h-24 rounded-2xl p-2 bg-gradient-to-br ${p.itemColor} shadow-lg border-2 cursor-grab active:cursor-grabbing transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center ${
                    isSelected ? 'border-white ring-4 ring-sky-400/60 scale-105 animate-pulse' : 'border-white/40'
                  }`}
                >
                  <span className="text-3xl drop-shadow-md">{p.itemEmoji}</span>
                  <span className="text-[11px] font-extrabold text-white mt-1 leading-tight drop-shadow">
                    {p.itemName}
                  </span>
                  <span className="text-[9px] text-white/80 font-semibold mt-0.5">
                    {isSelected ? '🎯 Selecionado!' : 'Arraste-me'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* LADO DIREITO: LOCAIS DE ORGANIZAÇÃO DO QUARTO */}
        <div className="flex flex-col space-y-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4">
          <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <span>✨</span>
            <span>Lugares Certos no Quarto (Solte Aqui)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2.5">
            {pairs.map((p) => {
              const isReacting = activeReaction === p.id;
              return (
                <div
                  key={p.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, p.id)}
                  onClick={() => handleTargetClick(p.id)}
                  className={`h-24 rounded-2xl border-2 p-2 flex flex-col items-center justify-center text-center transition-all ${
                    p.placed
                      ? 'border-emerald-500 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : p.targetColor
                  } ${selectedItemId ? 'hover:scale-105 cursor-pointer ring-2 ring-emerald-400/40' : ''}`}
                >
                  <span className={`text-3xl transition-transform ${isReacting ? 'scale-125 animate-bounce' : ''}`}>
                    {p.placed ? p.targetSatisfiedEmoji : p.targetEmoji}
                  </span>

                  <span className="text-[11px] font-extrabold text-slate-200 mt-1 leading-tight">
                    {p.targetName}
                  </span>

                  {p.placed ? (
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center space-x-0.5 mt-0.5">
                      <Heart className="w-2.5 h-2.5 fill-emerald-400" />
                      <span>Organizado!</span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                      {p.hint}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dica Ergonômica e Construtiva */}
      <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <b>Bons Hábitos no Lar:</b> Arrumar os brinquedos e o quarto desenvolve responsabilidade, cuidado com seus pertences e deixa o ambiente agradável para toda a família!
        </span>
      </div>
    </div>
  );
};
