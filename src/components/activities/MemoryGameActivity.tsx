import React, { useState, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Brain, RefreshCw } from 'lucide-react';

interface MemoryGameActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface CardItem {
  id: number;
  pairId: number;
  emoji: string;
  label: string;
}

const BASE_CARDS = [
  { pairId: 1, emoji: '⌨️', label: 'Teclado' },
  { pairId: 2, emoji: '🖱️', label: 'Mouse' },
  { pairId: 3, emoji: '🌸', label: 'Florzinha' },
  { pairId: 4, emoji: '🌳', label: 'Árvore' },
  { pairId: 5, emoji: '☀️', label: 'Sol' },
  { pairId: 6, emoji: '🍓', label: 'Morango' },
];

export const MemoryGameActivity: React.FC<MemoryGameActivityProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize and shuffle cards
  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = () => {
    const deck: CardItem[] = [];
    let idCounter = 1;

    BASE_CARDS.forEach((item) => {
      deck.push({ id: idCounter++, pairId: item.pairId, emoji: item.emoji, label: item.label });
      deck.push({ id: idCounter++, pairId: item.pairId, emoji: item.emoji, label: item.label });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setMoves(0);
    setErrors(0);
    setIsLocked(false);
    setIsFinished(false);
  };

  const handleCardClick = (index: number) => {
    if (isLocked || isFinished) return;
    if (flippedIndices.includes(index)) return;

    const clickedCard = cards[index];
    if (matchedPairIds.includes(clickedCard.pairId)) return;

    sounds.whoosh();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((prev) => prev + 1);

      const firstIndex = newFlipped[0];
      const secondIndex = newFlipped[1];
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.pairId === secondCard.pairId) {
        // Match!
        setTimeout(() => {
          sounds.coin();
          const newMatched = [...matchedPairIds, firstCard.pairId];
          setMatchedPairIds(newMatched);
          setFlippedIndices([]);
          setIsLocked(false);

          if (newMatched.length === BASE_CARDS.length) {
            // Victory!
            setIsFinished(true);
            sounds.victoryFanfare();
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

            setTimeout(() => {
              onComplete({
                wpm: 35,
                accuracy: Math.max(85, 100 - errors * 3),
                errors,
                rewardXp: 75,
                rewardCoins: 50,
              });
            }, 1600);
          }
        }, 500);
      } else {
        // Mismatch
        setErrors((prev) => prev + 1);
        setTimeout(() => {
          sounds.errorThud();
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Jogo da Memória: Tecnologia & Natureza
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {matchedPairIds.length} de {BASE_CARDS.length} pares encontrados
              </span>
            </h3>
            <p className="text-xs text-slate-300">Clique para virar duas cartas e encontre todos os pares iguais!</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <div className="bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
            Jogadas: <b className="text-sky-400">{moves}</b>
          </div>
          <button
            onClick={initializeDeck}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Embaralhar novamente"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Cards (4 columns x 3 rows) */}
      <div className="w-full grid grid-cols-3 sm:grid-cols-4 gap-3 p-4 bg-slate-950/90 border-2 border-slate-700/80 rounded-3xl shadow-2xl">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx);
          const isMatched = matchedPairIds.includes(card.pairId);

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`h-28 sm:h-32 rounded-2xl cursor-pointer transition-all duration-300 transform flex flex-col items-center justify-center p-2 relative ${
                isMatched
                  ? 'bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_15px_#34d399]/40 scale-95'
                  : isFlipped
                  ? 'bg-sky-900/80 border-2 border-sky-400 shadow-[0_0_15px_#38bdf8]/50 scale-100'
                  : 'bg-slate-800 hover:bg-slate-700/90 border-2 border-slate-600 hover:border-sky-400/60 active:scale-95'
              }`}
            >
              {isFlipped || isMatched ? (
                <div className="flex flex-col items-center space-y-1 animate-in zoom-in-75 duration-200">
                  <span className="text-4xl sm:text-5xl">{card.emoji}</span>
                  <span className="text-[11px] font-extrabold text-white tracking-wide">{card.label}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1 text-slate-400">
                  <Brain className="w-8 h-8 text-sky-400/60" />
                  <span className="text-[10px] font-bold text-slate-400">?</span>
                </div>
              )}

              {isMatched && (
                <div className="absolute top-1 right-1.5 text-xs text-emerald-400 font-bold">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ergonomic Guidance */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-start space-x-3 text-xs text-slate-300 w-full">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <b className="text-emerald-300">Atenção & Memória Visual:</b> Memorize onde cada carta está ao virar e pratique o clique certeiro com o mouse, estimulando os reflexos cognitivos e a coordenação motora!
        </div>
      </div>
    </div>
  );
};
