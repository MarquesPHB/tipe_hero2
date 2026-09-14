import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Circle, CheckCircle2 } from 'lucide-react';

interface RingTossActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Peg {
  id: number;
  xPercent: number; // 20%, 40%, 60%, 80%
  name: string;
  emoji: string;
  hasRing: boolean;
}

const INITIAL_PEGS: Peg[] = [
  { id: 1, xPercent: 20, name: 'Ursinho de Pelúcia', emoji: '🧸', hasRing: false },
  { id: 2, xPercent: 40, name: 'Troféu Dourado', emoji: '🏆', hasRing: false },
  { id: 3, xPercent: 60, name: 'Foguete Estelar', emoji: '🚀', hasRing: false },
  { id: 4, xPercent: 80, name: 'Vaso de Flores', emoji: '🌸', hasRing: false },
];

export const RingTossActivity: React.FC<RingTossActivityProps> = ({ onComplete }) => {
  const [pegs, setPegs] = useState<Peg[]>(INITIAL_PEGS);
  const [reticleX, setReticleX] = useState(50); // percentage 10 to 90
  const [isThrowing, setIsThrowing] = useState(false);
  const [ringFlight, setRingFlight] = useState<{ startX: number; targetX: number; progress: number } | null>(null);
  const [successfulCatches, setSuccessfulCatches] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const reticleXRef = useRef(reticleX);
  reticleXRef.current = reticleX;
  const isThrowingRef = useRef(isThrowing);
  isThrowingRef.current = isThrowing;
  const pegsRef = useRef(pegs);
  pegsRef.current = pegs;

  // Oscillation of reticle
  useEffect(() => {
    let forward = true;
    const interval = setInterval(() => {
      if (isThrowingRef.current || isFinished) return;

      setReticleX((prev) => {
        let next = prev + (forward ? 2 : -2);
        if (next >= 85) {
          next = 85;
          forward = false;
        } else if (next <= 15) {
          next = 15;
          forward = true;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isFinished]);

  // Handle Spacebar or Enter to throw
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        launchRing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished]);

  const launchRing = () => {
    if (isThrowingRef.current || isFinished) return;

    setIsThrowing(true);
    sounds.whoosh();

    const currentX = reticleXRef.current;
    setRingFlight({ startX: 50, targetX: currentX, progress: 0 });

    // Animate ring trajectory
    let p = 0;
    const flightTimer = setInterval(() => {
      p += 0.1;
      if (p >= 1) {
        clearInterval(flightTimer);
        setRingFlight(null);
        evaluateHit(currentX);
      } else {
        setRingFlight((prev) => (prev ? { ...prev, progress: p } : null));
      }
    }, 40);
  };

  const evaluateHit = (landX: number) => {
    // Find closest peg within tolerance (±7%)
    const hitPeg = pegsRef.current.find((peg) => Math.abs(peg.xPercent - landX) <= 7 && !peg.hasRing);

    if (hitPeg) {
      sounds.coin();
      sounds.successPing(650);

      const updatedPegs = pegsRef.current.map((p) => (p.id === hitPeg.id ? { ...p, hasRing: true } : p));
      setPegs(updatedPegs);

      const newCatches = successfulCatches + 1;
      setSuccessfulCatches(newCatches);

      if (newCatches >= pegs.length && !isFinished) {
        setIsFinished(true);
        sounds.victoryFanfare();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

        setTimeout(() => {
          onComplete({
            wpm: 34,
            accuracy: Math.max(85, 100 - errors * 5),
            errors,
            rewardXp: 80,
            rewardCoins: 50,
          });
        }, 1500);
      }
    } else {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
    }

    setIsThrowing(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Jogo da Argola no Parque de Diversões
              <span className="text-xs font-normal text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                {successfulCatches} de {pegs.length} prêmios conquistados
              </span>
            </h3>
            <p className="text-xs text-slate-300">Pressione a Barra de Espaço ou clique no botão quando a mira alinhar com a garrafa!</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <Circle className="w-4 h-4 text-amber-400" />
          <span>Argolas Restantes: {pegs.length - successfulCatches}</span>
        </div>
      </div>

      {/* Carnival Tent Arena */}
      <div className="relative w-full h-[360px] bg-slate-950 border-2 border-amber-600/70 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
        {/* Striped festive top banner */}
        <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 opacity-80" />

        {/* Pegs / Prize Bottles Shelf */}
        <div className="relative w-full h-48 mt-12 flex items-center justify-around border-b-4 border-amber-800/80 bg-slate-900/40 rounded-2xl p-4">
          {pegs.map((peg) => (
            <div
              key={peg.id}
              className="flex flex-col items-center relative group"
              style={{ left: `${peg.xPercent - 50}%` }}
            >
              {/* Prize Emoji */}
              <div className={`text-4xl sm:text-5xl transition-transform ${peg.hasRing ? 'scale-110' : 'group-hover:scale-105'}`}>
                {peg.emoji}
              </div>

              {/* Wooden Peg / Bottle */}
              <div className="w-6 h-16 bg-gradient-to-b from-amber-600 to-amber-900 rounded-t-lg border border-amber-400/50 shadow-md relative flex justify-center">
                {/* Captured Ring overlay */}
                {peg.hasRing && (
                  <div className="absolute top-4 w-12 h-6 border-4 border-yellow-300 rounded-full shadow-[0_0_12px_#fde047] rotate-[-15deg] z-10 animate-in zoom-in" />
                )}
              </div>

              <span className="text-[11px] font-bold text-slate-300 mt-1">{peg.name}</span>

              {peg.hasRing && (
                <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Conquistado!
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Dynamic Aiming Reticle Line */}
        <div className="relative w-full h-8 flex items-center">
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-75"
            style={{ left: `${reticleX}%` }}
          >
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-amber-400" />
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center bg-amber-400/20 shadow-[0_0_10px_#fbbf24]">
              <div className="w-2 h-2 rounded-full bg-amber-300" />
            </div>
          </div>
        </div>

        {/* Ring in Flight Animation */}
        {ringFlight && (
          <div
            className="absolute pointer-events-none transition-all duration-75 z-20 flex items-center justify-center"
            style={{
              left: `${ringFlight.startX + (ringFlight.targetX - ringFlight.startX) * ringFlight.progress}%`,
              bottom: `${40 + Math.sin(ringFlight.progress * Math.PI) * 160}px`,
              transform: 'translate(-50%, 50%)',
            }}
          >
            <div className="w-14 h-8 border-4 border-yellow-300 rounded-full shadow-[0_0_15px_#fde047] rotate-[-20deg]" />
          </div>
        )}

        {/* Bottom Throwing Line & Controls */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={launchRing}
            disabled={isThrowing || isFinished}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-sm shadow-xl flex items-center space-x-2 transition"
          >
            <Circle className="w-5 h-5" />
            <span>LANÇAR ARGOLA! [Espaço]</span>
          </button>
        </div>
      </div>

      {/* Guidance */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-start space-x-3 text-xs text-slate-300 w-full">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <b className="text-amber-300">Coordenação de Tempo & Barra de Espaço:</b> Acompanhe o movimento suave do pêndulo com os olhos e pressione a barra de espaço com o polegar exatamente quando a mira passar sobre a garrafa!
        </div>
      </div>
    </div>
  );
};
