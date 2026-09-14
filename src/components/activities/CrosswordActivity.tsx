import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, HelpCircle, Trophy, Keyboard } from 'lucide-react';

interface CrosswordActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Clue {
  id: number;
  word: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
  hint: string;
  emoji: string;
}

const CLUES: Clue[] = [
  { id: 1, word: 'SOL', direction: 'across', row: 0, col: 1, hint: 'Estrela que aquece e ilumina o nosso dia', emoji: '☀️' },
  { id: 2, word: 'LUA', direction: 'down', row: 0, col: 3, hint: 'Astro brilhante que ilumina o céu durante a noite', emoji: '🌙' },
  { id: 3, word: 'CASA', direction: 'across', row: 2, col: 0, hint: 'Nosso lar aconchegante onde a família vive unida', emoji: '🏡' },
  { id: 4, word: 'AMOR', direction: 'down', row: 2, col: 1, hint: 'Sentimento doce de carinho e respeito pelas pessoas', emoji: '💖' },
  { id: 5, word: 'BOLA', direction: 'across', row: 4, col: 0, hint: 'Brinquedo redondo para praticar esportes e se divertir', emoji: '⚽' },
];

export const CrosswordActivity: React.FC<CrosswordActivityProps> = ({ onComplete }) => {
  // Grid 6 rows x 4 cols
  const rows = 6;
  const cols = 4;

  // Build coordinate map for valid cells
  const cellMap = useRef<Record<string, { letter: string; clueIds: number[] }>>({});
  if (Object.keys(cellMap.current).length === 0) {
    CLUES.forEach((c) => {
      for (let i = 0; i < c.word.length; i++) {
        const r = c.direction === 'across' ? c.row : c.row + i;
        const col = c.direction === 'across' ? c.col + i : c.col;
        const key = `${r}-${col}`;
        if (!cellMap.current[key]) {
          cellMap.current[key] = { letter: c.word[i], clueIds: [c.id] };
        } else {
          cellMap.current[key].clueIds.push(c.id);
        }
      }
    });
  }

  const [gridValues, setGridValues] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 1 });
  const [activeDirection, setActiveDirection] = useState<'across' | 'down'>('across');
  const [selectedClueId, setSelectedClueId] = useState<number>(1);
  const [completedClues, setCompletedClues] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Check which clues are currently fully filled and correct
  useEffect(() => {
    const finished: number[] = [];
    CLUES.forEach((c) => {
      let isCorrect = true;
      for (let i = 0; i < c.word.length; i++) {
        const r = c.direction === 'across' ? c.row : c.row + i;
        const col = c.direction === 'across' ? c.col + i : c.col;
        const key = `${r}-${col}`;
        if ((gridValues[key] || '').toUpperCase() !== c.word[i]) {
          isCorrect = false;
          break;
        }
      }
      if (isCorrect) {
        finished.push(c.id);
      }
    });

    if (finished.length > completedClues.length) {
      sounds.coin();
    }
    setCompletedClues(finished);

    if (finished.length === CLUES.length && !isFinished) {
      setIsFinished(true);
      sounds.victoryFanfare();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => {
        onComplete({
          wpm: 28,
          accuracy: Math.max(85, 100 - errors * 3),
          errors,
          rewardXp: 75,
          rewardCoins: 50,
        });
      }, 1400);
    }
  }, [gridValues, completedClues.length, isFinished, errors, onComplete]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      const key = e.key.toUpperCase();

      if (/^[A-ZÁ-ÚÇ]$/.test(key)) {
        e.preventDefault();
        const curKey = `${selectedCell.row}-${selectedCell.col}`;
        const target = cellMap.current[curKey];

        if (target) {
          const isRight = target.letter === key;
          sounds.keyClick();
          if (!isRight) {
            setErrors((prev) => prev + 1);
          } else {
            sounds.successPing(600);
          }

          setGridValues((prev) => ({ ...prev, [curKey]: key }));

          // Move cursor to next cell in current direction
          moveToNextCell(selectedCell.row, selectedCell.col, activeDirection);
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        const curKey = `${selectedCell.row}-${selectedCell.col}`;
        sounds.keyClick(0.8);
        setGridValues((prev) => {
          const next = { ...prev };
          delete next[curKey];
          return next;
        });
        moveToPrevCell(selectedCell.row, selectedCell.col, activeDirection);
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        let { row, col } = selectedCell;
        if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') row = Math.min(rows - 1, row + 1);
        if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') col = Math.min(cols - 1, col + 1);

        if (cellMap.current[`${row}-${col}`]) {
          setSelectedCell({ row, col });
          updateClueFromCell(row, col, activeDirection);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, activeDirection, isFinished]);

  const moveToNextCell = (r: number, c: number, dir: 'across' | 'down') => {
    if (dir === 'across') {
      for (let nextC = c + 1; nextC < cols; nextC++) {
        if (cellMap.current[`${r}-${nextC}`]) {
          setSelectedCell({ row: r, col: nextC });
          return;
        }
      }
    } else {
      for (let nextR = r + 1; nextR < rows; nextR++) {
        if (cellMap.current[`${nextR}-${c}`]) {
          setSelectedCell({ row: nextR, col: c });
          return;
        }
      }
    }
  };

  const moveToPrevCell = (r: number, c: number, dir: 'across' | 'down') => {
    if (dir === 'across') {
      for (let prevC = c - 1; prevC >= 0; prevC--) {
        if (cellMap.current[`${r}-${prevC}`]) {
          setSelectedCell({ row: r, col: prevC });
          return;
        }
      }
    } else {
      for (let prevR = r - 1; prevR >= 0; prevR--) {
        if (cellMap.current[`${prevR}-${c}`]) {
          setSelectedCell({ row: prevR, col: c });
          return;
        }
      }
    }
  };

  const updateClueFromCell = (r: number, c: number, dir: 'across' | 'down') => {
    const data = cellMap.current[`${r}-${c}`];
    if (!data) return;
    const match = CLUES.find((clue) => data.clueIds.includes(clue.id) && clue.direction === dir);
    if (match) {
      setSelectedClueId(match.id);
    } else {
      const anyMatch = CLUES.find((clue) => data.clueIds.includes(clue.id));
      if (anyMatch) {
        setSelectedClueId(anyMatch.id);
        setActiveDirection(anyMatch.direction);
      }
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (!cellMap.current[`${r}-${c}`]) return;
    sounds.mouseClick();

    if (selectedCell.row === r && selectedCell.col === c) {
      // Toggle direction if cell has both
      const nextDir = activeDirection === 'across' ? 'down' : 'across';
      const hasClueInNextDir = CLUES.some(
        (clue) => cellMap.current[`${r}-${c}`]?.clueIds.includes(clue.id) && clue.direction === nextDir
      );
      if (hasClueInNextDir) {
        setActiveDirection(nextDir);
        updateClueFromCell(r, c, nextDir);
        return;
      }
    }

    setSelectedCell({ row: r, col: c });
    updateClueFromCell(r, c, activeDirection);
  };

  const handleSelectClue = (clue: Clue) => {
    sounds.mouseClick();
    setSelectedClueId(clue.id);
    setActiveDirection(clue.direction);
    setSelectedCell({ row: clue.row, col: clue.col });
  };

  const activeClue = CLUES.find((c) => c.id === selectedClueId);

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🧩</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              Palavras Cruzadas do Saber
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {completedClues.length} de {CLUES.length} palavras
              </span>
            </h3>
            <p className="text-xs text-slate-300">Digite as letras no teclado para desvendar as palavras!</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Keyboard className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Use as teclas de A a Z</span>
        </div>
      </div>

      {/* Main Game Layout: Grid + Clues Panel */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* The Crossword Grid (Left / Center) */}
        <div className="md:col-span-6 bg-slate-950/90 border-2 border-slate-700/80 rounded-2xl p-4 flex flex-col items-center justify-center shadow-xl">
          <div className="grid grid-rows-6 gap-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: cols }).map((_, c) => {
                  const key = `${r}-${c}`;
                  const cellData = cellMap.current[key];
                  const isSelected = selectedCell.row === r && selectedCell.col === c;
                  const letterValue = gridValues[key] || '';
                  const isWordComplete = cellData?.clueIds.some((id) => completedClues.includes(id));

                  if (!cellData) {
                    return (
                      <div
                        key={c}
                        className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-950/40 rounded-lg border border-slate-800/40 opacity-20 pointer-events-none"
                      />
                    );
                  }

                  // Find clue starting number if any
                  const startClue = CLUES.find((cl) => cl.row === r && cl.col === c);

                  return (
                    <div
                      key={c}
                      onClick={() => handleCellClick(r, c)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_#fbbf24] scale-105 z-10'
                          : isWordComplete
                          ? 'bg-emerald-900/70 border-2 border-emerald-400 text-emerald-100'
                          : 'bg-slate-800 hover:bg-slate-700/80 border border-slate-600 text-white'
                      }`}
                    >
                      {startClue && (
                        <span
                          className={`absolute top-0.5 left-1 text-[10px] font-bold ${
                            isSelected ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {startClue.id}
                        </span>
                      )}
                      {letterValue}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Dica: Clique no quadrado e digite no teclado físico</span>
          </div>
        </div>

        {/* Clues and Hints Panel (Right) */}
        <div className="md:col-span-6 flex flex-col space-y-3">
          {/* Active Clue Highlight Box */}
          {activeClue && (
            <div className="bg-sky-950/70 border-2 border-sky-500/60 rounded-2xl p-3.5 shadow-md">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-300 mb-1">
                <span className="text-lg">{activeClue.emoji}</span>
                <span>
                  Palavra {activeClue.id} ({activeClue.direction === 'across' ? 'Horizontal ➔' : 'Vertical ⬇️'} - {activeClue.word.length} letras):
                </span>
              </div>
              <p className="text-sm font-semibold text-white pl-7 leading-snug">{activeClue.hint}</p>
            </div>
          )}

          {/* List of All Clues */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2 max-h-[260px] overflow-y-auto">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Todas as Pistas</h4>
            {CLUES.map((clue) => {
              const isDone = completedClues.includes(clue.id);
              const isCurrent = clue.id === selectedClueId;

              return (
                <div
                  key={clue.id}
                  onClick={() => handleSelectClue(clue)}
                  className={`flex items-start justify-between p-2.5 rounded-xl text-xs cursor-pointer border transition-all ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                      : isDone
                      ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-base">{clue.emoji}</span>
                    <div>
                      <span className="font-bold mr-1.5">
                        {clue.id}. {clue.direction === 'across' ? '➔' : '⬇️'}
                      </span>
                      <span className="text-slate-200">{clue.hint}</span>
                    </div>
                  </div>
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2 mt-0.5" />}
                </div>
              );
            })}
          </div>

          {/* Mini Letter Assist Pad for Touch or Mouse */}
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <div className="text-[10px] text-slate-400 font-bold mb-1.5 text-center">Teclado na Tela de Apoio</div>
            <div className="flex flex-wrap justify-center gap-1">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZÇ'.split('').map((char) => (
                <button
                  key={char}
                  onClick={() => {
                    const curKey = `${selectedCell.row}-${selectedCell.col}`;
                    sounds.keyClick();
                    setGridValues((prev) => ({ ...prev, [curKey]: char }));
                    moveToNextCell(selectedCell.row, selectedCell.col, activeDirection);
                  }}
                  className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-lg text-xs font-bold border border-slate-700 flex items-center justify-center transition shadow-sm"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
