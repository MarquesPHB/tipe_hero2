import React, { useState, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Delete, CheckCircle, ArrowLeft, ArrowRight, FileText, Keyboard, Sparkles } from 'lucide-react';

interface BackspaceWorkshopActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface ExerciseItem {
  id: number;
  corruptText: string;
  cursorPos: number; // posição inicial do cursor
  correctText: string;
  requiredKey: 'Backspace' | 'Delete';
  explanation: string;
}

const EXERCISES: ExerciseItem[] = [
  {
    id: 1,
    corruptText: 'compputador',
    cursorPos: 5, // entre o 2º 'p' e o 'u' -> Backspace apaga o 'p' à esquerda
    correctText: 'computador',
    requiredKey: 'Backspace',
    explanation: 'O cursor está à direita da letra extra "p". Pressione a tecla BACKSPACE no seu teclado!',
  },
  {
    id: 2,
    corruptText: 'tecllado',
    cursorPos: 4, // antes do segundo 'l' -> Delete apaga o 'l' à frente
    correctText: 'teclado',
    requiredKey: 'Delete',
    explanation: 'O cursor está ANTES da letra extra "l". Pressione a tecla DELETE no seu teclado para apagar à frente!',
  },
  {
    id: 3,
    corruptText: 'moouse',
    cursorPos: 3, // depois do segundo 'o' -> Backspace
    correctText: 'mouse',
    requiredKey: 'Backspace',
    explanation: 'O cursor está após o segundo "o". Pressione BACKSPACE no teclado para apagar à esquerda!',
  },
  {
    id: 4,
    corruptText: 'escroll',
    cursorPos: 0, // no início antes de 'e' -> Delete
    correctText: 'scroll',
    requiredKey: 'Delete',
    explanation: 'O cursor está no começo, antes da letra "e". Pressione a tecla DELETE no teclado!',
  },
  {
    id: 5,
    corruptText: 'digitaçãoo',
    cursorPos: 10, // no fim da palavra após 'o' -> Backspace
    correctText: 'digitação',
    requiredKey: 'Backspace',
    explanation: 'O cursor está no final da palavra. Pressione BACKSPACE no teclado para apagar a letra final extra!',
  },
];

export const BackspaceWorkshopActivity: React.FC<BackspaceWorkshopActivityProps> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentText, setCurrentText] = useState(EXERCISES[0].corruptText);
  const [cursorPos, setCursorPos] = useState(EXERCISES[0].cursorPos);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  const currentExercise = EXERCISES[currentIdx];

  // Global Keyboard listener for physical Backspace, Delete, and Arrow navigation!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        setLastKeyPressed('Backspace');
        setTimeout(() => setLastKeyPressed(null), 300);
        handleBackspace();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        setLastKeyPressed('Delete');
        setTimeout(() => setLastKeyPressed(null), 300);
        handleDelete();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCursorPos((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCursorPos((prev) => Math.min(currentText.length, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursorPos, currentText, currentExercise, currentIdx]);

  const handleBackspace = () => {
    sounds.keyClick();
    if (cursorPos === 0) {
      sounds.errorThud();
      setFeedback('O cursor já está no início; não há nenhum caractere à esquerda para apagar com Backspace.');
      return;
    }

    if (currentExercise.requiredKey !== 'Backspace') {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
      setFeedback('Nesta posição o caractere errado está À SUA FRENTE. Pressione a tecla DELETE!');
      return;
    }

    const before = currentText.slice(0, cursorPos - 1);
    const after = currentText.slice(cursorPos);
    const updated = before + after;
    setCurrentText(updated);
    const newPos = cursorPos - 1;
    setCursorPos(newPos);

    if (updated === currentExercise.correctText) {
      advanceExercise();
    }
  };

  const handleDelete = () => {
    sounds.keyClick();
    if (cursorPos >= currentText.length) {
      sounds.errorThud();
      setFeedback('O cursor está no final do texto; não há nada à frente para apagar com Delete.');
      return;
    }

    if (currentExercise.requiredKey !== 'Delete') {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
      setFeedback('Nesta posição o caractere errado está ATRÁS (À ESQUERDA). Pressione a tecla BACKSPACE!');
      return;
    }

    const before = currentText.slice(0, cursorPos);
    const after = currentText.slice(cursorPos + 1);
    const updated = before + after;
    setCurrentText(updated);

    if (updated === currentExercise.correctText) {
      advanceExercise();
    }
  };

  const advanceExercise = () => {
    sounds.coin();
    setFeedback('🎉 Perfeito! Você usou a tecla exata no teclado!');

    if (currentIdx + 1 >= EXERCISES.length) {
      sounds.victoryFanfare();
      confetti({ particleCount: 80, spread: 70 });
      setTimeout(() => {
        onComplete({
          wpm: 28,
          accuracy: Math.max(75, 100 - errors * 5),
          errors,
          rewardXp: 60,
          rewardCoins: 45,
        });
      }, 1200);
    } else {
      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        setCurrentText(EXERCISES[nextIdx].corruptText);
        setCursorPos(EXERCISES[nextIdx].cursorPos);
        setFeedback(null);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
      {/* Header com indicador pedagógico */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">
              Oficina Prática de Backspace & Delete
            </h3>
            <p className="text-xs text-slate-400">
              Exercício {currentIdx + 1} de {EXERCISES.length}: use as teclas do seu teclado físico!
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          Erros: <b className="text-rose-400 font-mono">{errors}</b>
        </div>
      </div>

      {/* Regra Fundamental de Edição */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className={`flex items-center space-x-2.5 p-3 rounded-xl border transition-all ${
          currentExercise.requiredKey === 'Backspace'
            ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_#f43f5e33]'
            : 'bg-slate-900/60 border-slate-800 opacity-75'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold">
            ⌫
          </div>
          <div>
            <b className="text-rose-300">Tecla BACKSPACE:</b>
            <div className="text-slate-300 text-[11px]">Apaga a letra à <b>ESQUERDA</b> do cursor.</div>
          </div>
        </div>

        <div className={`flex items-center space-x-2.5 p-3 rounded-xl border transition-all ${
          currentExercise.requiredKey === 'Delete'
            ? 'bg-sky-950/40 border-sky-500 shadow-[0_0_15px_#0ea5e933]'
            : 'bg-slate-900/60 border-slate-800 opacity-75'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-bold">
            Del
          </div>
          <div>
            <b className="text-sky-300">Tecla DELETE:</b>
            <div className="text-slate-300 text-[11px]">Apaga a letra à <b>FRENTE (DIREITA)</b> do cursor.</div>
          </div>
        </div>
      </div>

      {/* Janela de Edição de Texto */}
      <div className="bg-slate-950 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
        <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center justify-center gap-2">
          <span>Palavra com erro de digitação:</span>
          <span className="text-amber-400 font-mono">(Posição {cursorPos} de {currentText.length})</span>
        </div>

        {/* Display da Palavra com Cursor Piscante */}
        <div className="font-mono text-3xl sm:text-4xl tracking-widest text-slate-100 flex items-center justify-center select-none py-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-slate-300">{currentText.slice(0, cursorPos)}</span>
          <span className="w-1.5 h-9 bg-amber-400 animate-pulse mx-0.5 rounded-full inline-block shadow-[0_0_10px_#f59e0b]" />
          <span className="text-slate-300">{currentText.slice(cursorPos)}</span>
        </div>

        <div className="mt-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-amber-300 flex items-center justify-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{currentExercise.explanation}</span>
        </div>

        {/* Dica de Teclado Físico */}
        <div className="mt-2 text-[11px] text-slate-400">
          💡 <span className="text-slate-300 font-semibold">Dica:</span> Pressione a tecla <b>BACKSPACE</b> (⌫) ou <b>DELETE</b> (Del) no seu teclado físico para resolver! Você também pode usar as setas ⬅️ ➡️ para mover o cursor.
        </div>
      </div>

      {feedback && (
        <div className="text-xs text-center font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 py-2.5 px-4 rounded-xl animate-in fade-in shadow">
          {feedback}
        </div>
      )}

      {/* Teclado Virtual Interativo (pode clicar ou usar as teclas físicas) */}
      <div className="grid grid-cols-2 gap-4 pt-1">
        <button
          onClick={handleBackspace}
          className={`flex items-center justify-center space-x-3 py-3.5 px-4 rounded-2xl font-bold border shadow-lg active:scale-95 transition ${
            lastKeyPressed === 'Backspace' || currentExercise.requiredKey === 'Backspace'
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_#f43f5e55]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Pressione a tecla Backspace no seu teclado ou clique aqui"
        >
          <ArrowLeft className="w-5 h-5" />
          <div className="text-left">
            <div className="text-xs sm:text-sm font-black">BACKSPACE (⌫)</div>
            <div className="text-[10px] opacity-80">Apagar Caractere à Esquerda</div>
          </div>
        </button>

        <button
          onClick={handleDelete}
          className={`flex items-center justify-center space-x-3 py-3.5 px-4 rounded-2xl font-bold border shadow-lg active:scale-95 transition ${
            lastKeyPressed === 'Delete' || currentExercise.requiredKey === 'Delete'
              ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_#0ea5e955]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Pressione a tecla Delete no seu teclado ou clique aqui"
        >
          <div className="text-left">
            <div className="text-xs sm:text-sm font-black">DELETE (Del)</div>
            <div className="text-[10px] opacity-80">Apagar Caractere à Frente</div>
          </div>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BackspaceWorkshopActivity;
