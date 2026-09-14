import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Lightbulb, CheckCircle2, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

interface ShiftCapsLabActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface LabChallenge {
  id: number;
  title: string;
  instruction: string;
  targetText: string;
  tip: string;
}

const CHALLENGES: LabChallenge[] = [
  {
    id: 1,
    title: 'Inicial Maiúscula Pontual',
    instruction: 'Segure a tecla Shift com a mão oposta e aperte a letra B, depois digite o restante minúsculo:',
    targetText: 'Brasil',
    tip: 'Use SHIFT para a inicial maiúscula mantendo o ritmo contínuo de digitação.',
  },
  {
    id: 2,
    title: 'Texto Longo em Caixa Alta',
    instruction: 'Acione a tecla Caps Lock (o LED indicador acenderá) e digite o título inteiro em maiúsculas:',
    targetText: 'ALERTA',
    tip: 'A Caps Lock mantém todas as letras em maiúsculo sem precisar segurar o Shift.',
  },
  {
    id: 3,
    title: 'Símbolo Superior (@)',
    instruction: 'Segure a tecla SHIFT e pressione o número 2 para digitar o símbolo arroba:',
    targetText: '@',
    tip: 'Caps Lock não ativa símbolos superiores; para @, #, $, !, use sempre a tecla Shift.',
  },
  {
    id: 4,
    title: 'Símbolo Superior (!)',
    instruction: 'Segure SHIFT e pressione a tecla 1 para digitar o ponto de exclamação:',
    targetText: '!',
    tip: 'O dedo mínimo da mão direita segura o Shift enquanto o dedo mínimo esquerdo toca na tecla 1.',
  },
  {
    id: 5,
    title: 'Retorno ao Texto Minúsculo',
    instruction: 'Desative a Caps Lock (desligando a luz indicadora) e digite a palavra normal em minúsculas:',
    targetText: 'teclado',
    tip: 'Pressione Caps Lock novamente para apagar o indicador e voltar às minúsculas.',
  },
];

export const ShiftCapsLabActivity: React.FC<ShiftCapsLabActivityProps> = ({ onComplete }) => {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [capsLedOn, setCapsLedOn] = useState(false);
  const [errors, setErrors] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChallenge = CHALLENGES[challengeIdx];

  useEffect(() => {
    inputRef.current?.focus();
  }, [challengeIdx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Detecta estado do Caps Lock via API nativa do navegador
    if (typeof e.getModifierState === 'function') {
      setCapsLedOn(e.getModifierState('CapsLock'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentInput(val);

    // Checa acerto caracter por caracter
    if (val.length > currentInput.length) {
      const lastChar = val[val.length - 1];
      const expectedChar = currentChallenge.targetText[val.length - 1];

      if (lastChar === expectedChar) {
        sounds.keyClick();
      } else {
        sounds.errorThud();
        setErrors((prev) => prev + 1);
      }
    }

    if (val === currentChallenge.targetText) {
      sounds.coin();
      sounds.successPing();
      const nextIdx = challengeIdx + 1;
      setCompletedSteps(nextIdx);

      if (nextIdx >= CHALLENGES.length) {
        sounds.victoryFanfare();
        confetti({ particleCount: 80, spread: 70 });
        setTimeout(() => {
          onComplete({
            wpm: 28,
            accuracy: Math.max(75, 100 - errors * 6),
            errors,
            rewardXp: 55,
            rewardCoins: 40,
          });
        }, 1100);
      } else {
        setTimeout(() => {
          setChallengeIdx(nextIdx);
          setCurrentInput('');
        }, 700);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4 select-none">
      {/* Painel de Indicadores de Teclado */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Laboratório Prático de Shift & Caps Lock: Desafio {challengeIdx + 1} de {CHALLENGES.length}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Caps Lock Ativa:</span>
              <div
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  capsLedOn
                    ? 'bg-amber-400 border-amber-300 shadow-[0_0_12px_#f59e0b]'
                    : 'bg-slate-800 border-slate-700'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Card do Desafio Prático */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center text-xs">
                {challengeIdx + 1}
              </span>
              <span>{currentChallenge.title}</span>
            </h3>
            <span className="text-xs text-slate-400">
              Erros: <b className="text-rose-400">{errors}</b>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {currentChallenge.instruction}
          </p>

          {/* Área de Digitação Prática */}
          <div className="bg-slate-950 border-2 border-slate-700 rounded-xl p-4 shadow-inner flex flex-col items-center justify-center space-y-3">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">
              Digite exatamente:
            </div>
            <div className="font-mono text-2xl font-black text-amber-300 tracking-wider bg-slate-900 px-6 py-2 rounded-xl border border-slate-800 shadow-md">
              {currentChallenge.targetText}
            </div>

            <div className="w-full max-w-sm">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyDown}
                placeholder="Digite aqui..."
                className="w-full text-center px-4 py-3 rounded-xl bg-slate-900 border-2 border-sky-500/60 focus:border-amber-400 text-white font-mono text-xl font-bold focus:outline-none shadow-lg tracking-wider"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
              />
            </div>

            {currentInput.length > 0 && (
              <div className="text-xs font-mono text-slate-400">
                Digitado: <span className="text-white font-bold">{currentInput}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dica Ergonômica de Digitação */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>Dica de Técnica:</b> {currentChallenge.tip}
        </div>
      </div>
    </div>
  );
};
