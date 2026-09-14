import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Gauge, Zap, Flame, Trophy, Sparkles } from 'lucide-react';

interface NitroRaceActivityProps {
  targetText?: string;
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

export const NitroRaceActivity: React.FC<NitroRaceActivityProps> = ({
  targetText = 'Acelere pelo autódromo mantendo o ritmo para disparar o turbo e vencer a corrida!',
  onComplete,
}) => {
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [nitroGauge, setNitroGauge] = useState(0); // 0 a 100%
  const [nitroActive, setNitroActive] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0); // 0 a 100%
  const [bot1Progress, setBot1Progress] = useState(0);
  const [bot2Progress, setBot2Progress] = useState(0);
  const [finished, setFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Foco no input ao montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Bots de corrida avançam de forma progressiva
  useEffect(() => {
    if (finished || !startTime) return;

    const interval = setInterval(() => {
      setBot1Progress((prev) => Math.min(96, prev + 0.85 + Math.random() * 0.35));
      setBot2Progress((prev) => Math.min(93, prev + 0.7 + Math.random() * 0.45));
    }, 200);

    return () => clearInterval(interval);
  }, [startTime, finished]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    const value = e.target.value;

    if (!startTime) {
      setStartTime(Date.now());
      sounds.engineAccel();
    }

    // Identifica novos acertos/erros
    if (value.length > typed.length) {
      const charIndex = value.length - 1;
      if (value[charIndex] === targetText[charIndex]) {
        sounds.keyClick();
        // Aumenta barra de nitro
        setNitroGauge((prev) => {
          const next = Math.min(100, prev + 6);
          if (next >= 100 && !nitroActive) {
            setNitroActive(true);
            sounds.coin();
            sounds.whoosh();
          }
          return next;
        });
      } else {
        sounds.errorThud();
        setErrors((err) => err + 1);
        setNitroGauge(0);
        setNitroActive(false);
      }
    }

    setTyped(value);

    // Progresso do jogador
    const pct = Math.min(100, Math.round((value.length / targetText.length) * 100));
    setPlayerProgress(pct);

    // Estatísticas ao vivo
    const elapsedMinutes = Math.max(0.01, (Date.now() - (startTime || Date.now())) / 60000);
    const wordsCount = value.length / 5;
    const currentWpm = Math.round(wordsCount / elapsedMinutes);
    setWpm(currentWpm);

    const totalTyped = value.length;
    const acc = totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - errors) / totalTyped) * 100)) : 100;
    setAccuracy(acc);

    // Conclusão da Corrida
    if (value.length >= targetText.length) {
      setFinished(true);
      sounds.victoryFanfare();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

      setTimeout(() => {
        onComplete({
          wpm: Math.max(20, currentWpm),
          accuracy: acc,
          errors,
          rewardXp: 80,
          rewardCoins: 65,
        });
      }, 1400);
    }
  };

  return (
    <div className="flex flex-col space-y-4 select-none w-full max-w-4xl mx-auto">
      {/* Placar estilo Coquinhos com Velocímetro e Nitro */}
      <div className="grid grid-cols-3 gap-3 bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-3 text-center shadow-lg">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-1 text-sky-400 text-xs font-bold">
            <Gauge className="w-4 h-4" />
            <span>Velocímetro</span>
          </div>
          <span className="text-2xl font-black text-white font-mono mt-0.5">{wpm} WPM</span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
            <Zap className="w-4 h-4" />
            <span>Precisão</span>
          </div>
          <span className="text-2xl font-black text-white font-mono mt-0.5">{accuracy}%</span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4" />
            <span>Turbo Nitro</span>
          </div>
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-700 mt-2 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                nitroActive
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse shadow-[0_0_10px_#fbbf24]'
                  : 'bg-gradient-to-r from-sky-500 to-amber-400'
              }`}
              style={{ width: `${nitroGauge}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pista 2D de Corrida com Pilotos Animais Fofos */}
      <div className="relative w-full h-[200px] bg-slate-950 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-3 flex flex-col justify-around">
        {/* Asfalto com marcações de faixa */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />

        {/* Linha de chegada quadriculada */}
        <div className="absolute right-8 top-0 bottom-0 w-6 bg-[repeating-linear-gradient(45deg,#fff,#fff_6px,#000_6px,#000_12px)] opacity-70 z-0 border-l-2 border-white/50" />

        {/* Faixa 1: Jogador (Você - Super Kart Turbo) */}
        <div className="relative h-11 bg-gradient-to-r from-sky-950/80 to-slate-900/90 rounded-xl border border-sky-500/50 flex items-center px-3 z-10 shadow-sm">
          <span className="text-[10px] font-extrabold text-sky-300 w-20 shrink-0 flex items-center space-x-1">
            <span>🐱</span>
            <span>VOCÊ:</span>
          </span>
          <div className="relative flex-1 h-full">
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-150 flex items-center space-x-1.5"
              style={{ left: `${playerProgress}%` }}
            >
              <div className="text-2xl drop-shadow-lg">🏎️💨</div>
              {nitroActive && (
                <span className="text-[10px] bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black px-2 py-0.5 rounded-full animate-bounce shadow-md">
                  TURBO! 🔥
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Faixa 2: Raposa Turbo */}
        <div className="relative h-10 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center px-3 z-10">
          <span className="text-[10px] font-bold text-amber-300/80 w-20 shrink-0 flex items-center space-x-1">
            <span>🦊</span>
            <span>Raposa:</span>
          </span>
          <div className="relative flex-1 h-full">
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 text-xl"
              style={{ left: `${bot1Progress}%` }}
            >
              🚗💨
            </div>
          </div>
        </div>

        {/* Faixa 3: Speed Panda */}
        <div className="relative h-10 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center px-3 z-10">
          <span className="text-[10px] font-bold text-emerald-300/80 w-20 shrink-0 flex items-center space-x-1">
            <span>🐼</span>
            <span>Panda:</span>
          </span>
          <div className="relative flex-1 h-full">
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 text-xl"
              style={{ left: `${bot2Progress}%` }}
            >
              🚙💨
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de Texto Dinâmica da Corrida */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 shadow-inner">
        <div className="font-mono text-base sm:text-lg leading-relaxed select-none tracking-wide">
          {targetText.split('').map((char, idx) => {
            let className = 'text-slate-500';
            if (idx < typed.length) {
              className = typed[idx] === char ? 'text-emerald-400 font-bold' : 'text-rose-400 bg-rose-950/80 rounded px-0.5';
            } else if (idx === typed.length) {
              className = 'text-amber-300 underline underline-offset-4 decoration-2 font-bold animate-pulse';
            }
            return (
              <span key={idx} className={className}>
                {char === ' ' && idx < typed.length && typed[idx] !== ' ' ? '·' : char}
              </span>
            );
          })}
        </div>

        {/* Input de Digitação */}
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleInput}
          disabled={finished}
          className="w-full mt-3 px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-sky-500/50 text-white font-mono text-sm focus:border-amber-400 focus:outline-none shadow-sm transition"
          placeholder="Digite o texto aqui para acelerar a toda velocidade..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      <div className="text-xs text-slate-400 text-center flex items-center justify-center space-x-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>
          <b>Estratégia Coquinhos de Corrida:</b> Mantenha os olhos nas próximas letras e digite sem hesitar para recarregar o Nitro e cruzar a linha de chegada em primeiro!
        </span>
      </div>
    </div>
  );
};
