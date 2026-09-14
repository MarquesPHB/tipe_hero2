import React, { useState } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Delete, CheckCircle, ArrowLeft, ArrowRight, FileText } from 'lucide-react';

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
    cursorPos: 5, // entre o segundo 'p' e o 'u' -> Backspace apaga o 'p' à esquerda
    correctText: 'computador',
    requiredKey: 'Backspace',
    explanation: 'O cursor está à direita da letra extra. Pressione BACKSPACE para apagar o "p" à esquerda!',
  },
  {
    id: 2,
    corruptText: 'tecllado',
    cursorPos: 4, // antes do segundo 'l' -> Delete apaga o 'l' à frente
    correctText: 'teclado',
    requiredKey: 'Delete',
    explanation: 'O cursor está ANTES da letra extra "l". Pressione DELETE para apagar o caractere à sua frente!',
  },
  {
    id: 3,
    corruptText: 'moouse',
    cursorPos: 3, // depois do segundo 'o'
    correctText: 'mouse',
    requiredKey: 'Backspace',
    explanation: 'O cursor está após o segundo "o". Use BACKSPACE para apagar o "o" excedente à esquerda.',
  },
  {
    id: 4,
    corruptText: 'escroll',
    cursorPos: 0, // no início da palavra
    correctText: 'scroll',
    requiredKey: 'Delete',
    explanation: 'O cursor está no começo antes da letra "e". Use DELETE para apagar a letra que está na frente!',
  },
  {
    id: 5,
    corruptText: 'digitaçãoo',
    cursorPos: 10, // no fim da palavra
    correctText: 'digitação',
    requiredKey: 'Backspace',
    explanation: 'O cursor está no final da palavra. Pressione BACKSPACE para apagar o "o" extra.',
  },
];

export const BackspaceWorkshopActivity: React.FC<BackspaceWorkshopActivityProps> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentText, setCurrentText] = useState(EXERCISES[0].corruptText);
  const [cursorPos, setCursorPos] = useState(EXERCISES[0].cursorPos);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentExercise = EXERCISES[currentIdx];

  const handleBackspace = () => {
    sounds.keyClick();
    if (cursorPos === 0) {
      sounds.errorThud();
      setFeedback('O cursor já está no início; não há nada à esquerda para apagar com Backspace.');
      return;
    }

    if (currentExercise.requiredKey !== 'Backspace') {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
      setFeedback('Nesta posição você precisa apagar o caractere à FRENTE. Para isso use a tecla DELETE!');
      return;
    }

    const before = currentText.slice(0, cursorPos - 1);
    const after = currentText.slice(cursorPos);
    const updated = before + after;
    setCurrentText(updated);
    setCursorPos(cursorPos - 1);

    if (updated === currentExercise.correctText) {
      advanceExercise();
    }
  };

  const handleDelete = () => {
    sounds.keyClick();
    if (cursorPos >= currentText.length) {
      sounds.errorThud();
      setFeedback('O cursor está no final; não há nada à frente para apagar com Delete.');
      return;
    }

    if (currentExercise.requiredKey !== 'Delete') {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
      setFeedback('Nesta posição você precisa apagar o caractere à ESQUERDA. Para isso use BACKSPACE!');
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
    setFeedback('Perfeito! Palavra corrigida com a tecla exata!');

    if (currentIdx + 1 >= EXERCISES.length) {
      sounds.victoryFanfare();
      confetti({ particleCount: 70, spread: 60 });
      setTimeout(() => {
        onComplete({
          wpm: 25,
          accuracy: Math.max(70, 100 - errors * 6),
          errors,
          rewardXp: 55,
          rewardCoins: 40,
        });
      }, 1000);
    } else {
      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        setCurrentText(EXERCISES[nextIdx].corruptText);
        setCursorPos(EXERCISES[nextIdx].cursorPos);
        setFeedback(null);
      }, 700);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header com indicador pedagógico */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-xl p-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-sky-400" />
          <span className="text-sm font-bold text-slate-200">
            Simulador de Bloco de Notas: Exercício {currentIdx + 1} de {EXERCISES.length}
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Erros: <b className="text-rose-400">{errors}</b>
        </div>
      </div>

      {/* Regra Fundamental de Edição */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center space-x-2 bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-lg text-rose-200">
          <ArrowLeft className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <b>Backspace (⌫):</b> Apaga o caractere à <b>ESQUERDA</b> do cursor.
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-sky-950/30 border border-sky-500/30 p-2.5 rounded-lg text-sky-200">
          <ArrowRight className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <b>Delete (Del):</b> Apaga o caractere à <b>FRENTE / DIREITA</b> do cursor.
          </div>
        </div>
      </div>

      {/* Janela de Edição */}
      <div className="bg-slate-950 border-2 border-slate-700 rounded-xl p-6 shadow-inner text-center">
        <div className="text-xs text-slate-400 mb-2">Palavra no documento:</div>
        <div className="font-mono text-3xl tracking-widest text-slate-100 flex items-center justify-center select-none py-4">
          {currentText.slice(0, cursorPos)}
          <span className="w-1.5 h-8 bg-amber-400 animate-pulse mx-0.5 rounded-full inline-block shadow-[0_0_8px_#f59e0b]" />
          {currentText.slice(cursorPos)}
        </div>

        <p className="text-xs text-amber-300 mt-2">{currentExercise.explanation}</p>
      </div>

      {feedback && (
        <div className="text-xs text-center font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 py-2 rounded-lg">
          {feedback}
        </div>
      )}

      {/* Botoes de Ação */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          onClick={handleBackspace}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-900 to-rose-800 hover:from-rose-800 hover:to-rose-700 text-rose-100 font-bold border border-rose-500/40 shadow-lg active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Usar BACKSPACE (Apagar à Esquerda)</span>
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-900 to-sky-800 hover:from-sky-800 hover:to-sky-700 text-sky-100 font-bold border border-sky-500/40 shadow-lg active:scale-95 transition"
        >
          <span>Usar DELETE (Apagar à Frente)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
