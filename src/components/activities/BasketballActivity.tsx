import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Flame, CheckCircle2, RotateCcw } from 'lucide-react';

interface BasketballActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface ShotChallenge {
  id: number;
  label: string;
  points: number;
  keySequence: string[];
}

const CHALLENGES: ShotChallenge[] = [
  { id: 1, label: 'Lance Livre (Fácil)', points: 1, keySequence: ['A', 'S', 'D'] },
  { id: 2, label: 'Arremesso de Meia Distância', points: 2, keySequence: ['J', 'K', 'L'] },
  { id: 3, label: 'Bomba de 3 Pontos (Linha Curva)', points: 3, keySequence: ['Q', 'W', 'E', 'R'] },
  { id: 4, label: 'Enterrada Espetacular (Slam Dunk)', points: 2, keySequence: ['U', 'I', 'O', 'P'] },
  { id: 5, label: 'Cesta Decisiva do Meio da Quadra (Buzzer Beater)', points: 3, keySequence: ['S', 'P', 'A', 'C', 'E'] },
];

export const BasketballActivity: React.FC<BasketballActivityProps> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typedKeys, setTypedKeys] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isShooting, setIsShooting] = useState(false);
  const [ballState, setBallState] = useState<'holding' | 'flying' | 'swish' | 'miss'>('holding');
  const [ballPos, setBallPos] = useState({ x: 120, y: 280 });
  const [feedback, setFeedback] = useState<string>('Digite a sequência de teclas para armar e acertar o arremesso!');
  const [isFinished, setIsFinished] = useState(false);
  const [meterVal, setMeterVal] = useState(50);

  const challenge = CHALLENGES[currentIdx];

  // Moving power meter effect (SNES arcade style)
  useEffect(() => {
    if (isShooting || isFinished) return;
    const interval = setInterval(() => {
      setMeterVal((prev) => {
        const next = prev + 5;
        return next > 100 ? 0 : next;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [isShooting, isFinished]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isShooting || isFinished) return;

      const key = e.key === ' ' ? 'SPACE' : e.key.toUpperCase();
      const expectedKey = challenge.keySequence[typedKeys.length];

      if (key === expectedKey) {
        sounds.keyClick();
        const updated = [...typedKeys, key];
        setTypedKeys(updated);

        if (updated.length === challenge.keySequence.length) {
          triggerShot(true);
        }
      } else if (e.key.length === 1 || e.key === ' ') {
        sounds.errorThud();
        setFeedback(`Ops! Você pressionou ${key}. A tecla certa agora é "${expectedKey}"!`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typedKeys, currentIdx, isShooting, isFinished]);

  const triggerShot = (success: boolean) => {
    setIsShooting(true);
    setBallState('flying');
    sounds.whoosh();
    setFeedback('🏀 A bola está no ar... mirando a cesta!');

    // Animate arc towards basket hoop at (480, 130)
    let step = 0;
    const startX = 120;
    const startY = 280;
    const hoopX = 480;
    const hoopY = 135;

    const anim = setInterval(() => {
      step += 0.08;
      if (step >= 1) {
        clearInterval(anim);
        if (success) {
          setBallState('swish');
          sounds.coin();
          setScore((s) => s + challenge.points);
          setStreak((st) => st + 1);
          setFeedback(`🔥 CESTA! +${challenge.points} PONTOS! Arremesso perfeito!`);
          confetti({ particleCount: 50, spread: 60, origin: { x: 0.7, y: 0.4 } });
        } else {
          setBallState('miss');
          sounds.errorThud();
          setStreak(0);
          setFeedback('Bateu no aro! Quase lá!');
        }

        setTimeout(() => {
          advanceRound();
        }, 1200);
      } else {
        // Parabolic arc
        const currX = startX + (hoopX - startX) * step;
        const currY = startY + (hoopY - startY) * step - Math.sin(step * Math.PI) * 120;
        setBallPos({ x: currX, y: currY });
      }
    }, 30);
  };

  const advanceRound = () => {
    if (currentIdx + 1 >= CHALLENGES.length) {
      setIsFinished(true);
      sounds.victoryFanfare();
      confetti({ particleCount: 100, spread: 90 });
      setTimeout(() => {
        onComplete({
          wpm: 38,
          accuracy: 95,
          errors: 0,
          rewardXp: 85,
          rewardCoins: 60,
        });
      }, 1500);
    } else {
      const next = currentIdx + 1;
      setCurrentIdx(next);
      setTypedKeys([]);
      setIsShooting(false);
      setBallState('holding');
      setBallPos({ x: 120, y: 280 });
      setFeedback('Digite as teclas em sequência para o próximo arremesso!');
    }
  };

  return (
    <div className="flex flex-col space-y-4 max-w-3xl mx-auto select-none">
      {/* HUD Retrô SNES Arcade */}
      <div className="bg-slate-900 border-4 border-amber-400/80 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 snes-bezel">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 border-2 border-amber-300 text-white flex items-center justify-center text-xl font-bold shadow">
            🏀
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-amber-300 tracking-wider font-mono">
              SNES BASKET CHAMPIONSHIP 16-BIT
            </h3>
            <p className="text-xs text-slate-300">
              Desafio {currentIdx + 1} de {CHALLENGES.length}: {challenge.label}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-center font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Placar</span>
            <span className="text-lg font-black text-amber-400">{score} PTS</span>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-center font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Combo</span>
            <span className="text-lg font-black text-cyan-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              {streak}x
            </span>
          </div>
        </div>
      </div>

      {/* Arena 2D de Basquete Retro (SVG / Canvas) */}
      <div className="relative w-full h-[320px] bg-gradient-to-b from-sky-950 via-slate-900 to-amber-950 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl snes-bezel flex items-center justify-center">
        {/* Torcida Retrô pixelada no fundo */}
        <div className="absolute top-0 inset-x-0 h-16 bg-slate-900/90 border-b border-amber-500/20 flex items-center justify-around opacity-40 text-xs">
          <span>👥</span><span>👏</span><span>👥</span><span>🎉</span><span>👥</span><span>🙌</span><span>👥</span><span>🔥</span>
        </div>

        <svg viewBox="0 0 600 320" className="w-full h-full">
          {/* Piso da Quadra de Madeira */}
          <rect x="0" y="220" width="600" height="100" fill="#78350f" />
          <line x1="0" y1="220" x2="600" y2="220" stroke="#f59e0b" strokeWidth="4" />
          <line x1="0" y1="270" x2="600" y2="270" stroke="#92400e" strokeWidth="1" strokeDasharray="10 10" />

          {/* Linha de 3 pontos */}
          <path d="M 300 220 C 350 240, 420 270, 420 320" fill="none" stroke="#fde68a" strokeWidth="3" />

          {/* Tabela de Basquete (Backboard & Hoop) */}
          <g>
            {/* Poste */}
            <rect x="530" y="80" width="12" height="180" fill="#475569" stroke="#0f172a" strokeWidth="2" />
            <line x1="530" y1="120" x2="495" y2="135" stroke="#64748b" strokeWidth="6" />

            {/* Vidro da Tabela */}
            <rect x="495" y="65" width="8" height="85" fill="#f8fafc" stroke="#dc2626" strokeWidth="4" />
            <rect x="495" y="90" width="4" height="35" fill="none" stroke="#dc2626" strokeWidth="3" />

            {/* Aro de metal */}
            <line x1="455" y1="135" x2="495" y2="135" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />

            {/* Rede balançando */}
            <polygon
              points="458,135 492,135 482,170 468,170"
              fill="rgba(255,255,255,0.7)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="3 3"
              className={ballState === 'swish' ? 'animate-bounce' : ''}
            />
          </g>

          {/* Jogador de Basquete Pixel Art 16-bit */}
          <g transform="translate(80, 190)">
            {/* Sombra */}
            <ellipse cx="25" cy="55" rx="20" ry="6" fill="rgba(0,0,0,0.5)" />
            {/* Corpo / Uniforme */}
            <rect x="15" y="15" width="20" height="28" fill="#ea580c" rx="4" stroke="#7c2d12" strokeWidth="2" />
            <text x="25" y="32" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="black">7</text>
            {/* Shorts */}
            <rect x="15" y="40" width="20" height="12" fill="#1e293b" />
            {/* Pernas */}
            <rect x="16" y="50" width="5" height="10" fill="#d97706" />
            <rect x="29" y="50" width="5" height="10" fill="#d97706" />
            {/* Cabeça */}
            <circle cx="25" cy="8" r="8" fill="#d97706" stroke="#78350f" strokeWidth="1" />
            {/* Faixa na cabeça */}
            <rect x="17" y="4" width="16" height="3" fill="#facc15" />
            {/* Braço levantado */}
            <line x1="32" y1="20" x2="40" y2="10" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Bola de Basquete em Movimento */}
          <g transform={`translate(${ballPos.x}, ${ballPos.y})`}>
            <circle cx="0" cy="0" r="14" fill="#ea580c" stroke="#7c2d12" strokeWidth="2" className="shadow-lg" />
            {/* Costuras da bola */}
            <line x1="-14" y1="0" x2="14" y2="0" stroke="#7c2d12" strokeWidth="1.5" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#7c2d12" strokeWidth="1.5" />
            <path d="M -9 -9 Q 0 0 -9 9" fill="none" stroke="#7c2d12" strokeWidth="1.2" />
            <path d="M 9 -9 Q 0 0 9 9" fill="none" stroke="#7c2d12" strokeWidth="1.2" />
          </g>
        </svg>

        {/* Medidor de Força Retrô Arcade */}
        <div className="absolute top-4 left-4 bg-slate-950/90 border-2 border-amber-400 p-2 rounded-xl shadow-lg w-40">
          <div className="flex justify-between text-[10px] text-amber-300 font-mono font-bold mb-1">
            <span>SHOT METER</span>
            <span>{meterVal}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all ${
                meterVal >= 70 && meterVal <= 90 ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-amber-400'
              }`}
              style={{ width: `${meterVal}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feedback em tempo real */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center text-xs font-bold text-amber-300">
        {feedback}
      </div>

      {/* Sequência de Teclas do Arremesso */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 shadow-xl text-center">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-3">
          Digite no seu teclado físico na ordem exata para arremessar:
        </span>

        <div className="flex items-center justify-center gap-3">
          {challenge.keySequence.map((key, kIdx) => {
            const isTyped = kIdx < typedKeys.length;
            const isCurrent = kIdx === typedKeys.length && !isShooting;

            return (
              <div
                key={kIdx}
                className={`w-14 h-14 rounded-2xl border-2 font-mono text-xl font-black flex items-center justify-center shadow-lg transition-all ${
                  isTyped
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_#10b98166] scale-95'
                    : isCurrent
                    ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_20px_#f59e0b88] scale-110 animate-bounce'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {key}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BasketballActivity;
