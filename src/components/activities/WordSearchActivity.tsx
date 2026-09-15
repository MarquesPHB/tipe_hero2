import React, { useState } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Search, CheckCircle2, Sparkles, Trophy } from 'lucide-react';

interface WordSearchActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface FoundWord {
  word: string;
  coords: [number, number][];
  color: string;
}

// 10x10 Retro Grid containing:
// TECLADO (row 1, cols 1-7)
// MOUSE (col 8, rows 2-6)
// ENTER (row 7, cols 2-6)
// PIXEL (row 4, cols 2-6)
// SHIFT (col 0, rows 3-7)
// RETRO (row 9, cols 4-8)
const GRID: string[][] = [
  ['A', 'T', 'E', 'C', 'L', 'A', 'D', 'O', 'K', 'X'],
  ['B', 'F', 'Q', 'Z', 'W', 'P', 'R', 'M', 'Y', 'L'],
  ['C', 'V', 'P', 'I', 'X', 'E', 'L', 'O', 'J', 'S'],
  ['S', 'N', 'A', 'R', 'T', 'K', 'V', 'U', 'N', 'D'],
  ['H', 'J', 'P', 'O', 'N', 'M', 'L', 'S', 'B', 'C'],
  ['I', 'K', 'E', 'N', 'T', 'E', 'R', 'E', 'A', 'P'],
  ['F', 'L', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['T', 'O', 'P', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U'],
  ['Z', 'X', 'C', 'V', 'R', 'E', 'T', 'R', 'O', 'M'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
];

const TARGET_WORDS = [
  {
    word: 'TECLADO',
    coords: [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
    ] as [number, number][],
    color: '#38bdf8',
  },
  {
    word: 'PIXEL',
    coords: [
      [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
    ] as [number, number][],
    color: '#f59e0b',
  },
  {
    word: 'MOUSE',
    coords: [
      [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
    ] as [number, number][],
    color: '#10b981',
  },
  {
    word: 'ENTER',
    coords: [
      [5, 2], [5, 3], [5, 4], [5, 5], [5, 6],
    ] as [number, number][],
    color: '#ec4899',
  },
  {
    word: 'SHIFT',
    coords: [
      [3, 0], [4, 0], [5, 0], [6, 0], [7, 0],
    ] as [number, number][],
    color: '#a855f7',
  },
  {
    word: 'RETRO',
    coords: [
      [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
    ] as [number, number][],
    color: '#f97316',
  },
];

export const WordSearchActivity: React.FC<WordSearchActivityProps> = ({ onComplete }) => {
  const [selectedCoords, setSelectedCoords] = useState<[number, number][]>([]);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleCellClick = (r: number, c: number) => {
    sounds.keyClick();

    // Check if cell already part of current selection
    const exists = selectedCoords.some(([cr, cc]) => cr === r && cc === c);
    let newSelection: [number, number][];

    if (exists) {
      newSelection = selectedCoords.filter(([cr, cc]) => !(cr === r && cc === c));
    } else {
      newSelection = [...selectedCoords, [r, c]];
    }

    setSelectedCoords(newSelection);

    // Check if new selection matches any target word
    for (const tw of TARGET_WORDS) {
      if (foundWords.some((fw) => fw.word === tw.word)) continue;

      if (tw.coords.length === newSelection.length) {
        const matches = tw.coords.every(([tr, tc]) =>
          newSelection.some(([sr, sc]) => sr === tr && sc === tc)
        );

        if (matches) {
          sounds.coin();
          const updatedFound = [...foundWords, tw];
          setFoundWords(updatedFound);
          setSelectedCoords([]);

          if (updatedFound.length === TARGET_WORDS.length) {
            setIsFinished(true);
            sounds.victoryFanfare();
            confetti({ particleCount: 100, spread: 80 });
            setTimeout(() => {
              onComplete({
                wpm: 32,
                accuracy: 98,
                errors: 0,
                rewardXp: 85,
                rewardCoins: 60,
              });
            }, 1800);
          }
          return;
        }
      }
    }
  };

  const getCellHighlight = (r: number, c: number) => {
    // Check in found words
    for (const fw of foundWords) {
      if (fw.coords.some(([cr, cc]) => cr === r && cc === c)) {
        return { bg: fw.color, text: '#0f172a', isFound: true };
      }
    }

    // Check in currently selected
    if (selectedCoords.some(([cr, cc]) => cr === r && cc === c)) {
      return { bg: '#facc15', text: '#0f172a', isSelected: true };
    }

    return null;
  };

  return (
    <div className="flex flex-col space-y-4 max-w-3xl mx-auto select-none">
      {/* Header SNES Arcade */}
      <div className="bg-slate-900 border-4 border-amber-400 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 snes-bezel">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 border-2 border-amber-300 text-slate-950 flex items-center justify-center text-xl font-bold">
            🔍
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-amber-300 tracking-wider font-mono">
              CAÇA-PALAVRAS RETRÔ 16-BIT
            </h3>
            <p className="text-xs text-slate-300">
              Encontradas: {foundWords.length} de {TARGET_WORDS.length} palavras
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedCoords([])}
          className="text-xs font-mono text-slate-400 hover:text-white bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 active:scale-95 transition"
        >
          Limpar Seleção
        </button>
      </div>

      {/* Grid e Lista de Palavras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Grade 10x10 */}
        <div className="md:col-span-2 bg-slate-950 border-4 border-slate-700 rounded-3xl p-4 shadow-2xl snes-bezel flex items-center justify-center">
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full max-w-[380px]">
            {GRID.map((row, r) =>
              row.map((letter, c) => {
                const hl = getCellHighlight(r, c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono text-xs sm:text-sm font-black flex items-center justify-center transition-all ${
                      hl?.isFound
                        ? 'font-black scale-105 shadow-md text-slate-950'
                        : hl?.isSelected
                        ? 'scale-110 shadow-lg text-slate-950 font-black'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                    style={hl ? { backgroundColor: hl.bg, color: hl.text } : undefined}
                  >
                    {letter}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Lista de Palavras a Encontrar */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400 block mb-2">
              Palavras Ocultas:
            </span>
            <div className="space-y-1.5">
              {TARGET_WORDS.map((tw) => {
                const isFound = foundWords.some((fw) => fw.word === tw.word);
                return (
                  <div
                    key={tw.word}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      isFound
                        ? 'bg-slate-900 border border-emerald-500/40 text-emerald-400 line-through opacity-80'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: tw.color }}
                      />
                      <span>{tw.word}</span>
                    </span>
                    {isFound && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            💡 <b>Instrução:</b> Clique em cada letra da palavra na grade (na horizontal ou vertical). Quando selecionar todas as letras, a palavra será marcada automaticamente!
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordSearchActivity;
