import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VirtualABNT2Keyboard } from '../VirtualABNT2Keyboard';
import { sounds } from '../../audio/soundEngine';
import { speakText } from '../../speech/tts';
import confetti from 'canvas-confetti';
import { Gauge, Zap, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { BubbleTetrisActivity } from './BubbleTetrisActivity';

interface GenericTypingActivityProps {
  title: string;
  targetText: string;
  suggestedFinger?: string;
  pedagogicalTip?: string;
  initialMode?: 'classic' | 'bubbles';
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

export const GenericTypingActivity: React.FC<GenericTypingActivityProps> = ({
  title,
  targetText,
  suggestedFinger,
  pedagogicalTip,
  initialMode = 'classic',
  onComplete,
}) => {
  const [gameMode, setGameMode] = useState<'classic' | 'bubbles'>(initialMode);
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isDone, setIsDone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Extrai caracteres únicos do texto para o modo Chuva de Bolhas
  const charPool = useMemo(() => {
    const chars = Array.from(
      new Set(
        targetText
          .toLowerCase()
          .split('')
          .filter((c) => (c >= 'a' && c <= 'z') || c === 'ç' || (c >= '0' && c <= '9'))
      )
    );
    return chars.length >= 3 ? chars : ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ç'];
  }, [targetText]);

  useEffect(() => {
    if (gameMode === 'classic') {
      inputRef.current?.focus();
    }
  }, [gameMode]);

  const currentExpectedChar = targetText[typed.length] || '';

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDone) return;
    const val = e.target.value;

    if (!startTime) {
      setStartTime(Date.now());
    }

    if (val.length > typed.length) {
      const idx = val.length - 1;
      if (val[idx] === targetText[idx]) {
        sounds.keyClick();
      } else {
        sounds.errorThud();
        setErrors((prev) => prev + 1);
      }
    }

    setTyped(val);

    // Métricas
    const elapsedMinutes = Math.max(0.01, (Date.now() - (startTime || Date.now())) / 60000);
    const words = val.length / 5;
    const currentWpm = Math.round(words / elapsedMinutes);
    setWpm(currentWpm);

    const total = val.length;
    const acc = total > 0 ? Math.max(0, Math.round(((total - errors) / total) * 100)) : 100;
    setAccuracy(acc);

    // Conclusão
    if (val.length >= targetText.length) {
      setIsDone(true);
      sounds.victoryFanfare();
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });

      setTimeout(() => {
        onComplete({
          wpm: Math.max(15, currentWpm),
          accuracy: acc,
          errors,
          rewardXp: 55,
          rewardCoins: 45,
        });
      }, 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setPressedKeys((prev) => new Set(prev).add(e.key.toLowerCase()));
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(e.key.toLowerCase());
      return next;
    });
  };

  const handleTTS = () => {
    speakText(targetText);
  };

  // Se o aluno escolheu jogar no modo Chuva de Bolhas
  if (gameMode === 'bubbles') {
    return (
      <div className="flex flex-col space-y-3 w-full">
        {/* Seletor de Modo no Topo */}
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/70 rounded-xl px-3 py-1.5 shadow-sm">
          <span className="text-xs font-bold text-slate-300">Modo de Jogo:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => {
                sounds.mouseClick();
                setGameMode('classic');
              }}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              ⌨️ Digitação Tradicional
            </button>
            <button
              className="px-3 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow"
            >
              🫧 Chuva de Bolhas
            </button>
          </div>
        </div>

        <BubbleTetrisActivity
          title={title}
          charPool={charPool}
          targetPops={16}
          onComplete={onComplete}
        />
      </div>
    );
  }

  // Modo Digitação Tradicional com Opção de Alternar
  return (
    <div className="flex flex-col space-y-3.5 select-none w-full max-w-4xl mx-auto">
      {/* Seletor de Modo no Topo (Alternar para Chuva de Bolhas) */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/70 rounded-2xl px-3.5 py-1.5 shadow-sm">
        <span className="text-xs font-bold text-slate-300">Modo de Jogo:</span>
        <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-white shadow"
          >
            ⌨️ Digitação Tradicional
          </button>
          <button
            onClick={() => {
              sounds.mouseClick();
              setGameMode('bubbles');
            }}
            className="px-3 py-1 rounded-lg text-xs font-bold text-sky-400 hover:bg-sky-950/60 hover:text-sky-300 transition flex items-center space-x-1"
          >
            <span>🫧</span>
            <span>Chuva de Bolhas</span>
          </button>
        </div>
      </div>

      {/* Painel de Métricas em Tempo Real */}
      <div className="flex items-center justify-between bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-slate-300">
              Velocidade: <b className="text-sky-400 font-mono text-sm">{wpm} WPM</b>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300">
              Precisão: <b className="text-emerald-400 font-mono text-sm">{accuracy}%</b>
            </span>
          </div>
          <div className="text-xs text-slate-400 hidden sm:inline">
            Erros: <b className="text-rose-400">{errors}</b>
          </div>
        </div>

        <button
          onClick={handleTTS}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition active:scale-95"
          title="Ouvir texto da atividade"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Ouvir</span>
        </button>
      </div>

      {/* Área de Visualização do Texto */}
      <div
        className="bg-slate-950 border-2 border-slate-700 rounded-3xl p-5 shadow-inner cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="font-mono text-lg sm:text-xl leading-relaxed tracking-wide select-none">
          {targetText.split('').map((char, idx) => {
            let cls = 'text-slate-500';
            if (idx < typed.length) {
              cls = typed[idx] === char ? 'text-emerald-400 font-bold' : 'text-rose-400 bg-rose-950/70 rounded px-0.5';
            } else if (idx === typed.length) {
              cls = 'text-amber-300 font-extrabold underline underline-offset-4 decoration-2 animate-pulse';
            }
            return (
              <span key={idx} className={cls}>
                {char === ' ' && idx < typed.length && typed[idx] !== ' ' ? '·' : char}
              </span>
            );
          })}
        </div>

        {/* Campo de Entrada Real */}
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          disabled={isDone}
          className="w-full mt-3 px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-slate-700 text-white font-mono text-base focus:border-amber-400 focus:outline-none shadow-md"
          placeholder="Comece a digitar o texto aqui..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      {/* Teclado Virtual com Iluminação Dinâmica da Próxima Tecla */}
      <VirtualABNT2Keyboard
        targetChar={currentExpectedChar}
        suggestedFinger={suggestedFinger}
        pressedChar={Array.from(pressedKeys)[0]}
      />

      {pedagogicalTip && (
        <div className="text-[11px] text-slate-400 text-center bg-slate-900/60 p-2 rounded-xl border border-slate-800">
          💡 {pedagogicalTip}
        </div>
      )}
    </div>
  );
};
