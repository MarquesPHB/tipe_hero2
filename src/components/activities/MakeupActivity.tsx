import React, { useState } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Palette, CheckCircle2, RotateCcw } from 'lucide-react';

interface MakeupActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

export const MakeupActivity: React.FC<MakeupActivityProps> = ({ onComplete }) => {
  const [lipstickColor, setLipstickColor] = useState<string>('#f43f5e'); // default soft rose
  const [eyeshadowColor, setEyeshadowColor] = useState<string>('#818cf8'); // soft lavender
  const [blushColor, setBlushColor] = useState<string>('#fb7185'); // soft blush
  const [sticker, setSticker] = useState<string>('⭐');
  const [hairAccessory, setHairAccessory] = useState<string>('🌸');
  const [styledCount, setStyledCount] = useState<number>(2);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const [activeCategory, setActiveCategory] = useState<'lip' | 'eye' | 'blush' | 'sticker' | 'accessory'>('lip');

  const LIPSTICK_OPTIONS = [
    { name: 'Cereja Doce', color: '#e11d48' },
    { name: 'Coral Suave', color: '#fb923c' },
    { name: 'Pink Encantado', color: '#ec4899' },
    { name: 'Brilho Dourado', color: '#f59e0b' },
    { name: 'Lilás Mágico', color: '#a855f7' },
  ];

  const EYESHADOW_OPTIONS = [
    { name: 'Lavanda Celestial', color: '#818cf8' },
    { name: 'Turquesa Marinho', color: '#2dd4bf' },
    { name: 'Ouro Radiante', color: '#fbbf24' },
    { name: 'Pétala de Rosa', color: '#f472b6' },
    { name: 'Verde Primavera', color: '#4ade80' },
  ];

  const BLUSH_OPTIONS = [
    { name: 'Pêssego Natural', color: '#fb923c' },
    { name: 'Rosa Suave', color: '#fb7185' },
    { name: 'Cereja Floral', color: '#f43f5e' },
  ];

  const STICKER_OPTIONS = ['⭐', '🦋', '💖', '🌈', '🌸', '✨'];
  const ACCESSORY_OPTIONS = ['🌸', '🎀', '👑', '🎧', '👒', '🌼'];

  const handleApplyOption = (type: 'lip' | 'eye' | 'blush' | 'sticker' | 'accessory', value: string) => {
    sounds.successPing(750);
    setStyledCount((prev) => prev + 1);

    if (type === 'lip') setLipstickColor(value);
    if (type === 'eye') setEyeshadowColor(value);
    if (type === 'blush') setBlushColor(value);
    if (type === 'sticker') setSticker(value);
    if (type === 'accessory') setHairAccessory(value);
  };

  const handleFinishLook = () => {
    if (isFinished) return;
    setIsFinished(true);
    sounds.victoryFanfare();
    confetti({ particleCount: 100, spread: 85, origin: { y: 0.6 } });

    setTimeout(() => {
      onComplete({
        wpm: 35,
        accuracy: 100,
        errors: 0,
        rewardXp: 80,
        rewardCoins: 50,
      });
    }, 1600);
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">💄</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Camarim Criativo & Estilo Facial
              <span className="text-xs font-normal text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-500/30">
                {styledCount} toques criativos aplicados
              </span>
            </h3>
            <p className="text-xs text-slate-300">Escolha as cores de maquiagem, adesivos faciais e tiaras para criar um visual radiante!</p>
          </div>
        </div>

        <button
          onClick={handleFinishLook}
          disabled={isFinished}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" /> Concluir Look!
        </button>
      </div>

      {/* Main Studio Workspace: Avatar Portrait (Left) + Styling Tools (Right) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Avatar Mirror Display */}
        <div className="md:col-span-6 bg-slate-950/90 border-2 border-pink-600/50 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden h-[360px]">
          {/* Mirror Frame & Lights */}
          <div className="absolute top-2 inset-x-4 flex justify-between px-4 text-xs opacity-80 text-amber-300">
            <span>💡</span>
            <span>💡</span>
            <span>💡</span>
            <span>💡</span>
            <span>💡</span>
          </div>

          {/* Stylized Vector Face Portrait */}
          <div className="relative w-52 h-64 flex items-center justify-center mt-2">
            {/* Hair */}
            <div className="absolute top-2 w-44 h-48 rounded-full bg-gradient-to-b from-amber-800 to-amber-950 shadow-lg" />

            {/* Hair Accessory */}
            {hairAccessory && (
              <div className="absolute -top-3 right-6 text-4xl z-30 animate-bounce">
                {hairAccessory}
              </div>
            )}

            {/* Face Base */}
            <div className="relative w-36 h-44 rounded-[42px] bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-300/60 shadow-inner flex flex-col items-center justify-center z-10">
              {/* Eyes & Eyeshadow */}
              <div className="flex justify-around w-full px-6 -mt-4">
                {/* Left Eye */}
                <div className="relative flex flex-col items-center">
                  {/* Eyeshadow */}
                  <div
                    className="w-7 h-4 rounded-t-full transition-colors duration-300 opacity-90 shadow-sm"
                    style={{ backgroundColor: eyeshadowColor }}
                  />
                  {/* Eye */}
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-400 flex items-center justify-center -mt-1 shadow-inner">
                    <div className="w-3 h-3 rounded-full bg-slate-900 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-white self-start ml-0.5 mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* Right Eye */}
                <div className="relative flex flex-col items-center">
                  {/* Eyeshadow */}
                  <div
                    className="w-7 h-4 rounded-t-full transition-colors duration-300 opacity-90 shadow-sm"
                    style={{ backgroundColor: eyeshadowColor }}
                  />
                  {/* Eye */}
                  <div className="w-5 h-5 rounded-full bg-white border border-slate-400 flex items-center justify-center -mt-1 shadow-inner">
                    <div className="w-3 h-3 rounded-full bg-slate-900 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-white self-start ml-0.5 mt-0.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nose */}
              <div className="w-1.5 h-3 bg-amber-400/70 rounded-full mt-2" />

              {/* Cheeks with Blush & Stickers */}
              <div className="flex justify-between w-full px-5 mt-1">
                {/* Left Cheek Blush */}
                <div
                  className="w-6 h-4 rounded-full transition-colors duration-300 opacity-80 filter blur-[1px]"
                  style={{ backgroundColor: blushColor }}
                />

                {/* Face Sticker on Right Cheek */}
                <div className="text-xl animate-pulse">
                  {sticker}
                </div>

                {/* Right Cheek Blush */}
                <div
                  className="w-6 h-4 rounded-full transition-colors duration-300 opacity-80 filter blur-[1px]"
                  style={{ backgroundColor: blushColor }}
                />
              </div>

              {/* Lips with Lipstick */}
              <div
                className="w-9 h-4 rounded-full mt-3 transition-colors duration-300 shadow-md border border-black/10 flex items-center justify-center"
                style={{ backgroundColor: lipstickColor }}
              >
                <div className="w-4 h-0.5 bg-white/50 rounded-full -mt-0.5" />
              </div>
            </div>
          </div>

          <div className="text-xs text-pink-300 font-bold mt-2">
            Visual Radiante e Estiloso ✨
          </div>
        </div>

        {/* Styling Toolbox Panel */}
        <div className="md:col-span-6 flex flex-col space-y-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveCategory('lip')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeCategory === 'lip' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              💄 Batom
            </button>
            <button
              onClick={() => setActiveCategory('eye')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeCategory === 'eye' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              👁️ Sombra
            </button>
            <button
              onClick={() => setActiveCategory('blush')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeCategory === 'blush' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌸 Blush
            </button>
            <button
              onClick={() => setActiveCategory('sticker')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeCategory === 'sticker' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ Adesivo
            </button>
            <button
              onClick={() => setActiveCategory('accessory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeCategory === 'accessory' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 Tiara
            </button>
          </div>

          {/* Palette Items according to active category */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl min-h-[220px]">
            {activeCategory === 'lip' && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-300">Escolha o Batom & Brilho Labial:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {LIPSTICK_OPTIONS.map((opt) => (
                    <button
                      key={opt.color}
                      onClick={() => handleApplyOption('lip', opt.color)}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center space-x-2 text-xs text-white transition active:scale-95"
                    >
                      <div className="w-5 h-5 rounded-full border border-white/50" style={{ backgroundColor: opt.color }} />
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeCategory === 'eye' && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-300">Escolha a Sombra dos Olhos:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {EYESHADOW_OPTIONS.map((opt) => (
                    <button
                      key={opt.color}
                      onClick={() => handleApplyOption('eye', opt.color)}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center space-x-2 text-xs text-white transition active:scale-95"
                    >
                      <div className="w-5 h-5 rounded-full border border-white/50" style={{ backgroundColor: opt.color }} />
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeCategory === 'blush' && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-300">Escolha o Blush das Bochechas:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {BLUSH_OPTIONS.map((opt) => (
                    <button
                      key={opt.color}
                      onClick={() => handleApplyOption('blush', opt.color)}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center space-x-2 text-xs text-white transition active:scale-95"
                    >
                      <div className="w-5 h-5 rounded-full border border-white/50" style={{ backgroundColor: opt.color }} />
                      <span>{opt.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeCategory === 'sticker' && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-300">Escolha o Adesivo Facial:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {STICKER_OPTIONS.map((stk) => (
                    <button
                      key={stk}
                      onClick={() => handleApplyOption('sticker', stk)}
                      className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center text-2xl active:scale-95 transition"
                    >
                      <span>{stk}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeCategory === 'accessory' && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-300">Escolha o Enfeite de Cabelo:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {ACCESSORY_OPTIONS.map((acc) => (
                    <button
                      key={acc}
                      onClick={() => handleApplyOption('accessory', acc)}
                      className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center text-2xl active:scale-95 transition"
                    >
                      <span>{acc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
