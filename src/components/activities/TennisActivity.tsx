import React, { useState, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Sparkles } from 'lucide-react';

interface TennisActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

const TENNIS_KEYS = ['A', 'S', 'D', 'F', 'J', 'K', 'L', 'G', 'H'];
const SCORES = ['0', '15', '30', '40', 'GAME'];

export const TennisActivity: React.FC<TennisActivityProps> = ({ onComplete }) => {
  const [playerScoreIdx, setPlayerScoreIdx] = useState(0);
  const [rivalScoreIdx, setRivalScoreIdx] = useState(0);
  const [targetKey, setTargetKey] = useState<string>('J');
  const [ballPos, setBallPos] = useState({ x: 300, y: 180 });
  const [ballDirection, setBallDirection] = useState<'down' | 'up'>('down');
  const [rallyCount, setRallyCount] = useState(0);
  const [feedback, setFeedback] = useState('Prepare-se para rebater o saque!');
  const [isGameOver, setIsGameOver] = useState(false);
  const [hitQuality, setHitQuality] = useState<'smash' | 'good' | 'miss' | null>(null);

  // Ball movement loop
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setBallPos((pos) => {
        const speed = 7;
        const newY = ballDirection === 'down' ? pos.y + speed : pos.y - speed;

        // Rival auto-rebounds at top (y <= 70)
        if (newY <= 70 && ballDirection === 'up') {
          setBallDirection('down');
          // Pick new random key from home row
          const nextKey = TENNIS_KEYS[Math.floor(Math.random() * TENNIS_KEYS.length)];
          setTargetKey(nextKey);
          sounds.whoosh();
          return { x: 200 + Math.random() * 200, y: 70 };
        }

        // Missed by player at bottom (y >= 300)
        if (newY >= 300 && ballDirection === 'down') {
          sounds.errorThud();
          setHitQuality('miss');
          setFeedback('Fora da quadra! O rival marcou ponto.');
          setRivalScoreIdx((prev) => {
            const next = prev + 1;
            if (next >= SCORES.length - 1) {
              endGame(false);
            }
            return next;
          });
          setBallDirection('up');
          return { x: 300, y: 80 };
        }

        return { ...pos, y: newY };
      });
    }, 40);

    return () => clearInterval(interval);
  }, [ballDirection, isGameOver]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      const pressed = e.key.toUpperCase();

      // Check hit zone (ball approaching player between y=200 and y=290)
      if (ballDirection === 'down' && ballPos.y >= 190 && ballPos.y <= 295) {
        if (pressed === targetKey) {
          sounds.keyClick();
          sounds.coin();
          const isSmash = ballPos.y >= 230 && ballPos.y <= 270;
          setHitQuality(isSmash ? 'smash' : 'good');
          setFeedback(isSmash ? '⚡ SUPER SMASH NA LINHA! Ponto do Jogador!' : '🎾 Ótimo voleio de devolução!');

          setRallyCount((r) => r + 1);
          setBallDirection('up');

          // Check if game won
          setPlayerScoreIdx((prev) => {
            const next = prev + 1;
            if (next >= SCORES.length - 1) {
              endGame(true);
            }
            return next;
          });
        } else {
          sounds.errorThud();
          setFeedback(`Tecla incorreta! Você apertou ${pressed}. A tecla do voleio era ${targetKey}!`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetKey, ballPos, ballDirection, isGameOver]);

  const endGame = (playerWon: boolean) => {
    setIsGameOver(true);
    if (playerWon) {
      sounds.victoryFanfare();
      confetti({ particleCount: 100, spread: 80 });
      setFeedback('🏆 MATCH POINT! VOCÊ VENCEU O GRANDE SLAM SNES!');
    }
    setTimeout(() => {
      onComplete({
        wpm: 36,
        accuracy: 94,
        errors: rivalScoreIdx,
        rewardXp: 80,
        rewardCoins: 55,
      });
    }, 1600);
  };

  return (
    <div className="flex flex-col space-y-4 max-w-3xl mx-auto select-none">
      {/* HUD SNES Super Tennis */}
      <div className="bg-slate-900 border-4 border-emerald-400 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 snes-bezel">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 border-2 border-emerald-300 text-white flex items-center justify-center text-xl font-bold">
            🎾
          </div>
          <div>
            <h3 className="text-base font-black text-emerald-300 tracking-wider font-mono">
              SUPER TENNIS 16-BIT CLASSIC
            </h3>
            <p className="text-xs text-slate-300">
              Ralis Consecutivos: <b className="text-amber-400">{rallyCount}</b>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block uppercase">Você</span>
            <span className="text-xl font-black text-emerald-400">{SCORES[playerScoreIdx]}</span>
          </div>
          <span className="text-slate-500 font-bold">:</span>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-center">
            <span className="text-[10px] text-slate-400 block uppercase">Robô</span>
            <span className="text-xl font-black text-rose-400">{SCORES[rivalScoreIdx]}</span>
          </div>
        </div>
      </div>

      {/* Quadra 2D Vista Superior Retro */}
      <div className="relative w-full h-[340px] bg-gradient-to-b from-emerald-800 to-emerald-900 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl snes-bezel flex items-center justify-center">
        <svg viewBox="0 0 600 340" className="w-full h-full">
          {/* Linhas da Quadra */}
          <rect x="80" y="20" width="440" height="300" fill="#047857" stroke="#ffffff" strokeWidth="4" />
          {/* Linha Lateral Duplas */}
          <rect x="120" y="20" width="360" height="300" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Linha Central de Saque */}
          <line x1="300" y1="80" x2="300" y2="260" stroke="#ffffff" strokeWidth="2" />
          {/* Linhas de Saque Horizontal */}
          <line x1="120" y1="80" x2="480" y2="80" stroke="#ffffff" strokeWidth="2" />
          <line x1="120" y1="260" x2="480" y2="260" stroke="#ffffff" strokeWidth="2" />

          {/* Rede de Tênis Central */}
          <rect x="70" y="166" width="460" height="8" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
          <line x1="70" y1="170" x2="530" y2="170" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" />

          {/* Rival Robô (Topo da Quadra) */}
          <g transform={`translate(${ballPos.x - 20}, 30)`}>
            <ellipse cx="20" cy="30" rx="16" ry="5" fill="rgba(0,0,0,0.4)" />
            <rect x="10" y="8" width="20" height="18" fill="#ef4444" rx="3" />
            <circle cx="20" cy="4" r="7" fill="#cbd5e1" />
            {/* Raquete do Rival */}
            <circle cx="35" cy="12" r="10" fill="none" stroke="#f59e0b" strokeWidth="3" />
          </g>

          {/* Jogador (Base da Quadra) */}
          <g transform="translate(280, 270)">
            <ellipse cx="20" cy="30" rx="18" ry="6" fill="rgba(0,0,0,0.4)" />
            <rect x="10" y="6" width="20" height="20" fill="#3b82f6" rx="4" />
            <circle cx="20" cy="0" r="8" fill="#fde047" />
            {/* Raquete do Jogador */}
            <circle cx="36" cy="10" r="12" fill="none" stroke="#10b981" strokeWidth="3" />
          </g>

          {/* Bola de Tênis Amarela */}
          <g transform={`translate(${ballPos.x}, ${ballPos.y})`}>
            {/* Sombra da bola */}
            <ellipse cx="0" cy="12" rx="7" ry="3" fill="rgba(0,0,0,0.35)" />
            {/* Bola */}
            <circle cx="0" cy="0" r="8" fill="#ccff00" stroke="#84cc16" strokeWidth="1.5" />
          </g>
        </svg>

        {/* Mira com Tecla de Rebatida */}
        {ballDirection === 'down' && (
          <div
            className="absolute flex flex-col items-center pointer-events-none transition-transform"
            style={{
              left: `${(ballPos.x / 600) * 100}%`,
              top: `${(Math.min(ballPos.y + 25, 260) / 340) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-400 border-4 border-white text-slate-950 font-black text-2xl font-mono flex items-center justify-center shadow-[0_0_25px_#f59e0b] animate-bounce">
              {targetKey}
            </div>
            <span className="text-[10px] font-black text-white bg-slate-950/80 px-2 py-0.5 rounded-full mt-1 border border-slate-700">
              REBATER!
            </span>
          </div>
        )}
      </div>

      {/* Feedback e Instruções */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-center">
        <div className="text-sm font-bold text-amber-300 mb-1">{feedback}</div>
        <div className="text-xs text-slate-400">
          Observe a bola descer na quadra. Quando ela se aproximar da sua raquete, aperte a tecla indicada (<b>{targetKey}</b>) no seu teclado físico!
        </div>
      </div>
    </div>
  );
};

export default TennisActivity;
