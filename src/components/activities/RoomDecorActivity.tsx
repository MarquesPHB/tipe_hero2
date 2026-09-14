import React, { useState } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Home, CheckCircle2, RotateCcw } from 'lucide-react';

interface RoomDecorActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface DecorSlot {
  key: string;
  name: string;
  categoryEmoji: string;
  options: { id: string; label: string; emoji: string; color: string }[];
}

const DECOR_SLOTS: DecorSlot[] = [
  {
    key: 'bed',
    name: 'Cama Fofa',
    categoryEmoji: '🛏️',
    options: [
      { id: 'bed1', label: 'Cama Azul Nuvem', emoji: '🛏️', color: 'from-sky-500 to-blue-600' },
      { id: 'bed2', label: 'Cama Rosa Castelo', emoji: '🛏️', color: 'from-pink-500 to-rose-600' },
      { id: 'bed3', label: 'Cama Verde Floresta', emoji: '🛏️', color: 'from-emerald-500 to-green-600' },
      { id: 'bed4', label: 'Cama Estrela Roxa', emoji: '🛏️', color: 'from-purple-500 to-indigo-600' },
    ],
  },
  {
    key: 'rug',
    name: 'Tapete',
    categoryEmoji: '🧶',
    options: [
      { id: 'rug1', label: 'Tapete Nuvem Branca', emoji: '☁️', color: 'bg-slate-100 text-slate-800' },
      { id: 'rug2', label: 'Tapete Arco-Íris', emoji: '🌈', color: 'bg-gradient-to-r from-red-400 via-yellow-300 to-sky-400 text-white' },
      { id: 'rug3', label: 'Tapete Flor Amarela', emoji: '🌼', color: 'bg-amber-300 text-amber-900' },
      { id: 'rug4', label: 'Tapete Gamer', emoji: '🎮', color: 'bg-slate-800 text-emerald-400' },
    ],
  },
  {
    key: 'plant',
    name: 'Plantinha',
    categoryEmoji: '🪴',
    options: [
      { id: 'p1', label: 'Girassol Alegre', emoji: '🌻', color: '' },
      { id: 'p2', label: 'Cacto Amigo', emoji: '🌵', color: '' },
      { id: 'p3', label: 'Planta Costela-de-Adão', emoji: '🪴', color: '' },
      { id: 'p4', label: 'Buquê de Rosas', emoji: '💐', color: '' },
    ],
  },
  {
    key: 'lamp',
    name: 'Luminária',
    categoryEmoji: '💡',
    options: [
      { id: 'l1', label: 'Lua Mágica', emoji: '🌙', color: '' },
      { id: 'l2', label: 'Cogumelo Fofo', emoji: '🍄', color: '' },
      { id: 'l3', label: 'Estrela Dourada', emoji: '⭐', color: '' },
      { id: 'l4', label: 'Abajur Clássico', emoji: '💡', color: '' },
    ],
  },
  {
    key: 'shelf',
    name: 'Estante de Brinquedos',
    categoryEmoji: '📚',
    options: [
      { id: 's1', label: 'Robô & Livros', emoji: '🤖', color: '' },
      { id: 's2', label: 'Urso de Pelúcia', emoji: '🧸', color: '' },
      { id: 's3', label: 'Foguete Espacial', emoji: '🚀', color: '' },
      { id: 's4', label: 'Carro Elétrico', emoji: '🚗', color: '' },
    ],
  },
];

export const RoomDecorActivity: React.FC<RoomDecorActivityProps> = ({ onComplete }) => {
  const [selections, setSelections] = useState<Record<string, string>>({
    bed: 'bed1',
    rug: 'rug1',
    plant: 'p1',
    lamp: 'l1',
    shelf: 's1',
  });
  const [activeTab, setActiveTab] = useState<string>('bed');
  const [totalCustomizations, setTotalCustomizations] = useState(3);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelectOption = (slotKey: string, optionId: string) => {
    sounds.coin();
    setSelections((prev) => ({ ...prev, [slotKey]: optionId }));
    setTotalCustomizations((prev) => prev + 1);
  };

  const handleFinishDecor = () => {
    if (isFinished) return;
    setIsFinished(true);
    sounds.victoryFanfare();
    confetti({ particleCount: 100, spread: 85, origin: { y: 0.6 } });

    setTimeout(() => {
      onComplete({
        wpm: 34,
        accuracy: 100,
        errors: 0,
        rewardXp: 85,
        rewardCoins: 55,
      });
    }, 1600);
  };

  const currentSlot = DECOR_SLOTS.find((s) => s.key === activeTab) || DECOR_SLOTS[0];

  const selectedBed = DECOR_SLOTS.find((s) => s.key === 'bed')?.options.find((o) => o.id === selections.bed);
  const selectedRug = DECOR_SLOTS.find((s) => s.key === 'rug')?.options.find((o) => o.id === selections.rug);
  const selectedPlant = DECOR_SLOTS.find((s) => s.key === 'plant')?.options.find((o) => o.id === selections.plant);
  const selectedLamp = DECOR_SLOTS.find((s) => s.key === 'lamp')?.options.find((o) => o.id === selections.lamp);
  const selectedShelf = DECOR_SLOTS.find((s) => s.key === 'shelf')?.options.find((o) => o.id === selections.shelf);

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🏡</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Decore o Quarto dos Sonhos
              <span className="text-xs font-normal text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                {totalCustomizations} decorações personalizadas
              </span>
            </h3>
            <p className="text-xs text-slate-300">Escolha a cama, tapete, plantinhas e brinquedos para deixar o quarto aconchegante!</p>
          </div>
        </div>

        <button
          onClick={handleFinishDecor}
          disabled={isFinished}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" /> Concluir Quarto!
        </button>
      </div>

      {/* Main Studio View: Cozy 2D Room (Left) + Furniture Catalog (Right) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* The Decorated Room Stage */}
        <div className="md:col-span-7 bg-slate-950/95 border-2 border-amber-600/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden h-[360px] flex flex-col justify-between">
          {/* Wall Background with Sunlit Window */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-b-2 border-amber-900/40">
            {/* Window */}
            <div className="absolute top-4 left-10 w-24 h-24 rounded-t-full bg-sky-300 border-4 border-amber-800 shadow-md overflow-hidden flex items-center justify-center">
              <span className="text-2xl animate-pulse">☀️</span>
              {/* Window Panes */}
              <div className="absolute inset-0 border-r-2 border-amber-800 left-1/2 -ml-0.5 pointer-events-none" />
              <div className="absolute inset-0 border-b-2 border-amber-800 top-1/2 -mt-0.5 pointer-events-none" />
            </div>

            {/* Poster / Picture Frame */}
            <div className="absolute top-6 right-12 w-16 h-20 bg-amber-100 rounded-lg border-2 border-amber-800 shadow-md p-1 flex flex-col items-center justify-center text-xl">
              <span>🌈</span>
              <span className="text-[7px] font-bold text-slate-700 mt-1">PAZ & AMOR</span>
            </div>
          </div>

          {/* Floor */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-amber-950/80 to-amber-900/40" />

          {/* Interactive Room Items Positioned Cozily */}
          <div className="relative w-full h-full z-10 flex flex-col justify-end pb-2">
            {/* Upper Shelf on wall */}
            <div className="absolute top-8 right-36 flex flex-col items-center">
              <div className="text-4xl animate-bounce drop-shadow-md">
                {selectedShelf?.emoji}
              </div>
              <div className="w-20 h-2 bg-amber-700 rounded shadow-md mt-1" />
            </div>

            {/* Bed on the Left */}
            <div className="absolute bottom-10 left-6 flex flex-col items-center">
              {/* Pillow & Blanket */}
              <div
                className={`w-36 h-20 rounded-2xl p-2 shadow-xl border-2 border-white/20 bg-gradient-to-br ${
                  selectedBed?.color || 'from-sky-500 to-blue-600'
                } flex flex-col justify-between`}
              >
                {/* Pillow */}
                <div className="w-10 h-6 bg-white rounded-lg shadow-sm self-start" />
                {/* Folded blanket edge */}
                <div className="w-full h-3 bg-white/30 rounded-md" />
              </div>
              {/* Wooden Legs */}
              <div className="flex justify-between w-32 -mt-1">
                <div className="w-2 h-4 bg-amber-800 rounded-b" />
                <div className="w-2 h-4 bg-amber-800 rounded-b" />
              </div>
            </div>

            {/* Nightstand with Lamp on left */}
            <div className="absolute bottom-12 left-44 flex flex-col items-center">
              <div className="text-3xl animate-pulse">
                {selectedLamp?.emoji}
              </div>
              <div className="w-12 h-10 bg-amber-800 rounded-lg border border-amber-600 shadow-md flex items-center justify-center">
                <div className="w-2 h-1 bg-amber-300 rounded-full" />
              </div>
            </div>

            {/* Rug in Center */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div
                className={`px-8 py-3 rounded-full shadow-lg border border-white/20 flex items-center gap-2 ${
                  selectedRug?.color || 'bg-slate-100 text-slate-800'
                }`}
              >
                <span className="text-2xl">{selectedRug?.emoji}</span>
                <span className="text-xs font-bold">{selectedRug?.label}</span>
              </div>
            </div>

            {/* Plant Pot on Right */}
            <div className="absolute bottom-10 right-8 flex flex-col items-center">
              <div className="text-4xl animate-bounce">
                {selectedPlant?.emoji}
              </div>
              <div className="w-10 h-8 bg-amber-600 rounded-b-xl border-2 border-amber-700 shadow-md flex items-center justify-center" />
            </div>
          </div>
        </div>

        {/* Furniture Selector Catalog (Right) */}
        <div className="md:col-span-5 flex flex-col space-y-3">
          {/* Catalog Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {DECOR_SLOTS.map((slot) => (
              <button
                key={slot.key}
                onClick={() => setActiveTab(slot.key)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === slot.key ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{slot.categoryEmoji}</span>
                <span>{slot.name}</span>
              </button>
            ))}
          </div>

          {/* Options Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl min-h-[240px]">
            <h4 className="text-xs font-black text-slate-300 mb-2.5">
              Escolha para {currentSlot.name}:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {currentSlot.options.map((opt) => {
                const isSelected = selections[currentSlot.key] === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentSlot.key, opt.id)}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-between text-xs font-bold ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
