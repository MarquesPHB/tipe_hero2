import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Flame, RotateCcw, Droplets, Sun, Lightbulb, Heart } from 'lucide-react';

interface TargetClickActivityProps {
  mode?: 'simple' | 'double' | 'right';
  targetCount?: number;
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface PlantOrHelpItem {
  id: number;
  name: string;
  emoji: string;
  bloomedEmoji: string;
  actionText: string;
  bgGradient: string;
  borderColor: string;
}

// Plantinhas e flores para regar com amor (Modo Simples e Botão Direito)
const GARDEN_PLANTS: PlantOrHelpItem[] = [
  { id: 1, name: 'Muda de Girassol', emoji: '🌱', bloomedEmoji: '🌻', actionText: 'Regar Girassol', bgGradient: 'from-amber-400 to-yellow-500', borderColor: 'border-amber-200' },
  { id: 2, name: 'Brotinho de Margarida', emoji: '🌱', bloomedEmoji: '🌼', actionText: 'Regar Margarida', bgGradient: 'from-emerald-400 to-teal-500', borderColor: 'border-emerald-200' },
  { id: 3, name: 'Muda de Moranguinho', emoji: '🌱', bloomedEmoji: '🍓', actionText: 'Regar Morangos', bgGradient: 'from-rose-400 to-red-500', borderColor: 'border-rose-200' },
  { id: 4, name: 'Brotinho de Tulipa', emoji: '🌱', bloomedEmoji: '🌷', actionText: 'Regar Tulipa', bgGradient: 'from-pink-400 to-purple-500', borderColor: 'border-pink-200' },
  { id: 5, name: 'Trevilho da Horta', emoji: '🌱', bloomedEmoji: '🍀', actionText: 'Regar Trevinho', bgGradient: 'from-green-400 to-emerald-600', borderColor: 'border-green-200' },
  { id: 6, name: 'Laranjeira do Pomar', emoji: '🌱', bloomedEmoji: '🍊', actionText: 'Regar Laranjeira', bgGradient: 'from-orange-400 to-amber-500', borderColor: 'border-orange-200' },
];

// Objetos do quarto e da casa para consertar, acender e arrumar (Modo Clique Duplo)
const HELPFUL_OBJECTS: PlantOrHelpItem[] = [
  { id: 101, name: 'Abajur de Leitura', emoji: '💡', bloomedEmoji: '✨💡', actionText: 'Acender Luz', bgGradient: 'from-amber-400 to-yellow-500', borderColor: 'border-yellow-100' },
  { id: 102, name: 'Ventilador do Quarto', emoji: '🌀', bloomedEmoji: '🍃🌀', actionText: 'Ligar Brisa', bgGradient: 'from-sky-400 to-cyan-500', borderColor: 'border-sky-200' },
  { id: 103, name: 'Relógio de Estudos', emoji: '⏰', bloomedEmoji: '🔔⏰', actionText: 'Ajustar Horário', bgGradient: 'from-indigo-400 to-purple-500', borderColor: 'border-indigo-200' },
  { id: 104, name: 'Rádio de Música', emoji: '📻', bloomedEmoji: '🎵📻', actionText: 'Tocar Melodia', bgGradient: 'from-rose-400 to-pink-500', borderColor: 'border-rose-200' },
  { id: 105, name: 'Livro de Histórias', emoji: '📖', bloomedEmoji: '⭐📖', actionText: 'Abrir Lição', bgGradient: 'from-teal-400 to-emerald-500', borderColor: 'border-teal-200' },
  { id: 106, name: 'Vaso da Janela', emoji: '🪴', bloomedEmoji: '🌸🪴', actionText: 'Arrumar Vaso', bgGradient: 'from-emerald-500 to-green-600', borderColor: 'border-green-200' },
];

export const TargetClickActivity: React.FC<TargetClickActivityProps> = ({
  mode = 'simple',
  targetCount = 8,
  onComplete,
}) => {
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isBloomed, setIsBloomed] = useState(false);
  const [currentItem, setCurrentItem] = useState<PlantOrHelpItem>(GARDEN_PLANTS[0]);
  const [showRightMenu, setShowRightMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [hitFeedback, setHitFeedback] = useState<{ x: number; y: number; text: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const spawnNewItem = () => {
    setIsBloomed(false);
    setShowRightMenu(false);

    const items = mode === 'double' ? HELPFUL_OBJECTS : GARDEN_PLANTS;
    const randomItem = items[Math.floor(Math.random() * items.length)];
    setCurrentItem(randomItem);

    // Posições com margens seguras dentro do canteiro
    setPos({
      x: Math.floor(Math.random() * 68 + 16),
      y: Math.floor(Math.random() * 56 + 22),
    });
  };

  useEffect(() => {
    spawnNewItem();
  }, [mode]);

  const triggerPositiveEffect = (clientX: number, clientY: number, message: string) => {
    sounds.bubblePop(1.1);
    sounds.coin();
    setCombo((prev) => prev + 1);
    setIsBloomed(true);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setHitFeedback({
        x: clientX - rect.left,
        y: clientY - rect.top,
        text: message,
      });
      setTimeout(() => setHitFeedback(null), 700);
    }
  };

  const handleSuccessfulCare = (e: React.MouseEvent) => {
    const praiseMessages =
      mode === 'double'
        ? ['Consertado com carinho! 💡', 'Quarto iluminado! ✨', 'Tudo organizado! ⭐', 'Muito bem feito! 🌟']
        : ['Regada com amor! 💧🌸', 'Floresceu linda! 🌻✨', 'Cuidado exemplar! 🌱💖', 'A natureza agradece! 🌿⭐'];

    const msg = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
    triggerPositiveEffect(e.clientX, e.clientY, msg);

    const nextHits = hits + 1;
    setHits(nextHits);

    if (nextHits >= targetCount) {
      sounds.victoryFanfare();
      confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
      setTimeout(() => {
        onComplete({
          wpm: 0,
          accuracy: Math.max(75, Math.round((targetCount / (targetCount + errors)) * 100)),
          errors,
          rewardXp: 55,
          rewardCoins: 45,
        });
      }, 1100);
    } else {
      setTimeout(() => {
        spawnNewItem();
      }, 400);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'simple') {
      handleSuccessfulCare(e);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'double') {
      handleSuccessfulCare(e);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mode === 'right') {
      sounds.mouseClick();
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMenuPos({
          x: Math.min(rect.width - 190, Math.max(12, e.clientX - rect.left)),
          y: Math.min(rect.height - 150, Math.max(12, e.clientY - rect.top)),
        });
        setShowRightMenu(true);
      }
    }
  };

  const handleCareAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRightMenu(false);
    handleSuccessfulCare(e);
  };

  const handleMiss = () => {
    sounds.errorThud();
    setCombo(0);
    setErrors((prev) => prev + 1);
    setShowRightMenu(false);
  };

  const resetActivity = () => {
    setHits(0);
    setErrors(0);
    setCombo(0);
    spawnNewItem();
  };

  return (
    <div className="flex flex-col space-y-3.5 select-none w-full max-w-4xl mx-auto">
      {/* Barra de Status Positiva e Construtiva */}
      <div className="flex items-center justify-between bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {mode === 'double' ? (
              <Lightbulb className="w-5 h-5 text-amber-400" />
            ) : (
              <Droplets className="w-5 h-5 text-sky-400" />
            )}
            <span className="text-xs font-bold text-slate-200">
              {mode === 'double'
                ? 'Objetos Consertados e Arrumados'
                : mode === 'right'
                ? 'Cuidados Especiais Realizados'
                : 'Plantinhas Regadas com Amor'}:{' '}
              <b className="text-amber-400 font-extrabold text-sm">{hits}/{targetCount}</b>
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs animate-bounce shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>{combo}x CUIDADO PERFEITO!</span>
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

      {/* Instruções Construtivas e Seguras */}
      <div className="text-xs text-center py-2 px-4 rounded-xl font-semibold bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-emerald-950/70 border border-emerald-500/40 text-emerald-300 shadow-inner">
        {mode === 'double' ? (
          <span>💡 <b>Arrumar a Casa (Clique Duplo):</b> Dê dois cliques rápidos e suaves com o botão esquerdo para acender as luzes, consertar aparelhos e arrumar o quarto!</span>
        ) : mode === 'right' ? (
          <span>🌿 <b>Jardineiro do Bem (Botão Direito):</b> Clique com o botão direito na plantinha para abrir o menu de cuidados e escolha adubar, regar ou colocar ao sol!</span>
        ) : (
          <span>🌱 <b>Regue a Plantinha (Clique Simples):</b> Mova o cursor até a mudinha de flor e clique suavemente para regá-la com água fresca e vê-la florescer!</span>
        )}
      </div>

      {/* Jardim e Canteiro Construtivo */}
      <div
        ref={containerRef}
        onClick={handleMiss}
        className="relative w-full h-[340px] bg-gradient-to-b from-slate-950 via-emerald-950/40 to-slate-950 border-2 border-emerald-700/50 rounded-3xl overflow-hidden shadow-2xl cursor-pointer select-none"
      >
        {/* Fundo de canteiro ecológico */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none border border-emerald-800/20">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border border-emerald-800/10 flex items-center justify-center text-[10px] text-emerald-900/40 font-mono">
              {i % 4 === 0 ? '🌿' : i % 5 === 0 ? '🌱' : ''}
            </div>
          ))}
        </div>

        {/* Efeito Flutuante de Cuidado Realizado */}
        {hitFeedback && (
          <div
            style={{ left: `${hitFeedback.x}px`, top: `${hitFeedback.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 font-black text-sm text-emerald-300 bg-slate-950/95 px-3.5 py-1.5 rounded-full border-2 border-emerald-400 shadow-[0_0_20px_#10b981] animate-bounce flex items-center space-x-1"
          >
            <span>✨</span>
            <span>{hitFeedback.text}</span>
          </div>
        )}

        {/* ITEM CONSTRUTIVO: PLANTINHA A REGAR OU OBJETO A CONSERTAR */}
        <button
          onClick={mode === 'simple' ? handleClick : undefined}
          onDoubleClick={mode === 'double' ? handleDoubleClick : undefined}
          onContextMenu={mode === 'right' ? handleContextMenu : undefined}
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-3xl p-3 bg-gradient-to-br ${currentItem.bgGradient} border-2 ${currentItem.borderColor} shadow-[0_0_25px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95 animate-pulse`}
        >
          {/* Brilho da gota / sol */}
          <div className="absolute top-1 left-2 w-3 h-2 rounded-full bg-white/60" />

          {/* Emoji principal com transição para florescido */}
          <span className="text-4xl drop-shadow-md select-none transition-transform duration-300">
            {isBloomed ? currentItem.bloomedEmoji : currentItem.emoji}
          </span>

          {/* Nome e ação positiva */}
          <span className="text-[10px] font-black text-slate-950 bg-white/90 px-2 py-0.5 rounded-full mt-1.5 shadow-sm whitespace-nowrap flex items-center space-x-1">
            {mode === 'double' ? (
              <span>⚡ 2 Cliques para Ligar</span>
            ) : mode === 'right' ? (
              <span>🖱️ Botão Direito</span>
            ) : (
              <span>💧 {currentItem.name}</span>
            )}
          </span>
        </button>

        {/* Menu de Cuidados Gentis do Botão Direito */}
        {showRightMenu && mode === 'right' && (
          <div
            style={{ left: `${menuPos.x}px`, top: `${menuPos.y}px` }}
            className="absolute z-40 w-52 bg-slate-900/95 border-2 border-emerald-400/80 rounded-2xl p-2 shadow-2xl backdrop-blur-md animate-in zoom-in-95"
          >
            <div className="text-[11px] font-bold text-emerald-300 px-2 py-1 border-b border-slate-700/80 flex items-center space-x-1.5">
              <span>🌱</span>
              <span>Menu de Cuidados do Jardim</span>
            </div>
            <button
              onClick={handleCareAction}
              className="w-full text-left px-3 py-1.5 mt-1 text-xs font-semibold text-slate-200 hover:bg-sky-600 hover:text-white rounded-xl transition flex items-center space-x-2"
            >
              <span>💧</span>
              <span>Regar com Água Fresca</span>
            </button>
            <button
              onClick={handleCareAction}
              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-amber-500 hover:text-slate-950 rounded-xl transition flex items-center space-x-2"
            >
              <span>☀️</span>
              <span>Colocar ao Sol da Manhã</span>
            </button>
            <button
              onClick={handleCareAction}
              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-emerald-600 hover:text-white rounded-xl transition flex items-center space-x-2"
            >
              <span>🌿</span>
              <span>Limpar Folhinhas com Amor</span>
            </button>
            <button
              onClick={handleCareAction}
              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-purple-600 hover:text-white rounded-xl transition flex items-center space-x-2"
            >
              <span>🎵</span>
              <span>Cantar Melodia Suave</span>
            </button>
          </div>
        )}
      </div>

      {/* Dica Construtiva e Ergonômica */}
      <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {mode === 'double'
              ? 'Dica de Arrumação: Dê dois cliques ritmados e rápidos com a ponta do indicador sem deslocar o mouse.'
              : mode === 'right'
              ? 'Dica do Jardineiro: Acione o botão direito com o dedo médio com firmeza e suavidade para abrir o menu.'
              : 'Dica de Cuidado: Conduza o regador com o antebraço apoiado e dê um toque leve no botão esquerdo para regar.'}
          </span>
        </div>
      </div>
    </div>
  );
};
