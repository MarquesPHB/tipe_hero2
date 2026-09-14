import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Shield, Sparkles, Trophy, Zap, RotateCcw, Flame } from 'lucide-react';
import { VirtualABNT2Keyboard } from '../VirtualABNT2Keyboard';

interface BubbleTetrisActivityProps {
  title?: string;
  charPool?: string[];
  targetPops?: number;
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface FallingBubble {
  id: number;
  char: string;
  displayChar: string;
  x: number; // Porcentagem horizontal 10% a 90%
  y: number; // Porcentagem vertical 0% (topo) a 100% (chão)
  speed: number;
  color: string;
  borderColor: string;
  emoji: string;
  size: number;
  isPopping?: boolean;
}

const NATURE_RAIN_EMOJIS = ['🌱', '🌸', '🌻', '🌷', '🌼', '🍀', '🌿', '🍓', '🍊', '🪴'];
const BUBBLE_COLORS = [
  { bg: 'from-sky-500 to-cyan-400', border: 'border-sky-200', text: 'text-white' },
  { bg: 'from-emerald-500 to-teal-400', border: 'border-emerald-200', text: 'text-white' },
  { bg: 'from-blue-500 to-indigo-400', border: 'border-blue-200', text: 'text-white' },
  { bg: 'from-teal-500 to-cyan-500', border: 'border-teal-200', text: 'text-white' },
  { bg: 'from-emerald-400 to-green-500', border: 'border-green-200', text: 'text-white' },
];

export const BubbleTetrisActivity: React.FC<BubbleTetrisActivityProps> = ({
  title = 'Chuva Refrescante: Gotinhas para Florescer o Jardim!',
  charPool = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
  targetPops = 16,
  onComplete,
}) => {
  const [bubbles, setBubbles] = useState<FallingBubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [shields, setShields] = useState(4);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'victory'>('playing');
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const nextBubbleId = useRef(1);
  const lastSpawnTime = useRef(Date.now());
  const speedMultiplier = useRef(1);
  const isFinishedRef = useRef(false);

  // Spawna uma nova bolha com letra do pool
  const spawnBubble = useCallback(() => {
    if (isFinishedRef.current || gameState !== 'playing') return;

    const availableChars = charPool.length > 0 ? charPool : ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ç'];
    const chosenChar = availableChars[Math.floor(Math.random() * availableChars.length)];
    const colorScheme = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    const emoji = NATURE_RAIN_EMOJIS[Math.floor(Math.random() * NATURE_RAIN_EMOJIS.length)];

    const newBubble: FallingBubble = {
      id: nextBubbleId.current++,
      char: chosenChar.toLowerCase(),
      displayChar: chosenChar.toUpperCase(),
      x: Math.floor(Math.random() * 72 + 14), // entre 14% e 86% da largura
      y: 0,
      speed: (0.35 + Math.random() * 0.25) * speedMultiplier.current,
      color: colorScheme.bg,
      borderColor: colorScheme.border,
      emoji,
      size: 58,
    };

    setBubbles((prev) => [...prev, newBubble]);
  }, [charPool, gameState]);

  // Loop de física do jogo (bolhas caindo suavemente)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Cria nova bolha a cada ~1.4 segundos se houver menos de 6 bolhas na tela
      if (now - lastSpawnTime.current > 1400) {
        lastSpawnTime.current = now;
        setBubbles((prev) => {
          if (prev.length < 6) {
            spawnBubble();
          }
          return prev;
        });
      }

      // Atualiza posição Y das bolhas
      setBubbles((prev) => {
        const nextList: FallingBubble[] = [];
        let hitGround = false;

        for (const b of prev) {
          if (b.isPopping) continue;

          const newY = b.y + b.speed;
          if (newY >= 88) {
            // Bolha tocou a linha do chão!
            hitGround = true;
          } else {
            nextList.push({ ...b, y: newY });
          }
        }

        if (hitGround) {
          sounds.errorThud();
          setCombo(0);
          setErrors((e) => e + 1);
          setShields((s) => {
            const rem = s - 1;
            if (rem <= 0) {
              setGameState('gameover');
            }
            return Math.max(0, rem);
          });
        }

        return nextList;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [gameState, spawnBubble]);

  // Dispara a primeira bolha de imediato
  useEffect(() => {
    spawnBubble();
  }, [spawnBubble]);

  // Escuta as teclas digitadas no teclado físico
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState !== 'playing' || isFinishedRef.current) return;

      const key = e.key.toLowerCase();
      setPressedKey(key);
      setTimeout(() => setPressedKey(null), 200);

      // Procura a bolha mais próxima do chão com a letra pressionada
      setBubbles((prev) => {
        const matches = prev.filter((b) => !b.isPopping && b.char === key);

        if (matches.length > 0) {
          // Escolhe a bolha que estiver mais baixa (maior Y) para estourar primeiro
          matches.sort((a, b) => b.y - a.y);
          const target = matches[0];

          sounds.bubblePop(1 + Math.min(0.5, combo * 0.1));
          sounds.keyClick();

          const nextCombo = combo + 1;
          setCombo(nextCombo);
          setScore((s) => s + 100 * nextCombo);

          const nextPopped = poppedCount + 1;
          setPoppedCount(nextPopped);

          // Checa vitória
          if (nextPopped >= targetPops) {
            isFinishedRef.current = true;
            setGameState('victory');
            sounds.victoryFanfare();
            confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });

            setTimeout(() => {
              onComplete({
                wpm: Math.round(nextPopped * 1.5),
                accuracy: Math.max(70, Math.round((nextPopped / (nextPopped + errors)) * 100)),
                errors,
                rewardXp: 60,
                rewardCoins: 50,
              });
            }, 1200);
          }

          // Marca a bolha como estourando
          return prev.map((b) => (b.id === target.id ? { ...b, isPopping: true } : b));
        } else {
          // Tecla errada
          sounds.errorThud();
          setCombo(0);
          setErrors((err) => err + 1);
          return prev;
        }
      });
    },
    [combo, errors, gameState, onComplete, poppedCount, targetPops]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const restartGame = () => {
    isFinishedRef.current = false;
    setGameState('playing');
    setBubbles([]);
    setPoppedCount(0);
    setShields(4);
    setScore(0);
    setCombo(0);
    setErrors(0);
    lastSpawnTime.current = Date.now();
    spawnBubble();
  };

  // Encontra a letra prioritária (a bolha mais baixa) para iluminar no teclado virtual
  const lowestActiveBubble = [...bubbles]
    .filter((b) => !b.isPopping)
    .sort((a, b) => b.y - a.y)[0];
  const targetCharForKeyboard = lowestActiveBubble ? lowestActiveBubble.char : '';

  return (
    <div className="flex flex-col items-center space-y-3 select-none w-full max-w-4xl mx-auto">
      {/* Barra de Status e Placar Coquinhos */}
      <div className="w-full flex items-center justify-between bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center space-x-4">
          {/* Escudos / Vidas */}
          <div className="flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 hidden sm:inline">Escudos:</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    s <= shields ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#34d399]' : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Progresso de Plantas Regadas */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-200">
            <span className="text-base">🌱</span>
            <span>
              Flores Regadas: <b className="text-emerald-400 font-extrabold">{poppedCount}/{targetPops}</b>
            </span>
          </div>

          {/* Combo Dinâmico */}
          {combo > 1 && (
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs animate-bounce shadow-md">
              <Flame className="w-3.5 h-3.5 text-yellow-200" />
              <span>COMBO {combo}x!</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/40">
            ⭐ {score} pts
          </div>

          <button
            onClick={restartGame}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Arena de Queda das Bolhas (Tetris de Bolhas) */}
      <div
        ref={containerRef}
        className="relative w-full h-[320px] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/70 border-2 border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Fundo com bolhas de água e estrelas decorativas sutis */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.12),transparent_70%)] pointer-events-none" />

        {/* Nuvens fofas no topo */}
        <div className="absolute top-2 left-6 text-2xl opacity-40 animate-pulse pointer-events-none">☁️</div>
        <div className="absolute top-3 right-8 text-2xl opacity-40 animate-pulse pointer-events-none">☁️</div>

        {/* Bolhas Caindo */}
        {bubbles.map((b) => {
          if (b.isPopping) {
            return (
              <div
                key={b.id}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping text-3xl"
              >
                🌸✨
              </div>
            );
          }

          return (
            <div
              key={b.id}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${b.color} border-2 ${b.borderColor} shadow-[0_0_15px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center cursor-default transition-transform hover:scale-105 active:scale-95`}
            >
              {/* Brilho reflexivo da bolha */}
              <div className="absolute top-1.5 left-2 w-3 h-2 rounded-full bg-white/70 rotate-[-30deg]" />

              {/* Emoji da plantinha/gota de chuva */}
              <span className="text-xs -mt-1 leading-none">{b.emoji}</span>

              {/* Letra da tecla a digitar */}
              <span className="font-black text-xl leading-tight text-white drop-shadow-md">
                {b.displayChar}
              </span>
            </div>
          );
        })}

        {/* Canteiro de Flores no Chão */}
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center pointer-events-none">
          <div className="w-full border-t-2 border-dashed border-emerald-500/60 flex items-center justify-center">
            <span className="bg-slate-900/90 text-emerald-300 font-bold text-[10px] px-3 py-0.5 rounded-full border border-emerald-500/40 -mt-2.5">
              🌱 Canteiro de Flores: Digite a letra no teclado para que a gotinha de chuva regue a semente!
            </span>
          </div>
        </div>

        {/* Overlay de Fim de Jogo */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30 animate-in fade-in">
            <div className="text-4xl">🌱💧</div>
            <h3 className="text-lg font-black text-amber-400">As sementinhas precisam de água!</h3>
            <p className="text-xs text-slate-300">Relaxe os dedos, posicione as mãos na linha-base e tente novamente.</p>
            <button
              onClick={restartGame}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Overlay de Vitória */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-30 animate-in zoom-in-95">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-lg font-black text-emerald-400">Chuva de Bolhas Concluída!</h3>
            <p className="text-xs text-slate-200">Reflexos rápidos de digitação com excelente ritmo!</p>
          </div>
        )}
      </div>

      {/* Teclado Virtual ABNT2 Guia na Base */}
      <div className="w-full">
        <VirtualABNT2Keyboard
          targetChar={targetCharForKeyboard}
          pressedChar={pressedKey || undefined}
        />
      </div>
    </div>
  );
};
