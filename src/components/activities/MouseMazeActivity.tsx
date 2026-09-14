import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { RotateCcw, Shield, Trophy, Sparkles, Move } from 'lucide-react';

interface MouseMazeActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Segment {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  cumulativeBefore: number;
}

const SEGMENTS: Segment[] = [
  { id: 0, x1: 60, y1: 60, x2: 160, y2: 60, length: 100, cumulativeBefore: 0 },
  { id: 1, x1: 160, y1: 60, x2: 160, y2: 300, length: 240, cumulativeBefore: 100 },
  { id: 2, x1: 160, y1: 300, x2: 320, y2: 300, length: 160, cumulativeBefore: 340 },
  { id: 3, x1: 320, y1: 300, x2: 320, y2: 60, length: 240, cumulativeBefore: 500 },
  { id: 4, x1: 320, y1: 60, x2: 560, y2: 60, length: 240, cumulativeBefore: 740 },
  { id: 5, x1: 560, y1: 60, x2: 560, y2: 300, length: 240, cumulativeBefore: 980 },
  { id: 6, x1: 560, y1: 300, x2: 640, y2: 300, length: 80, cumulativeBefore: 1220 },
];
const TOTAL_TRACK_LENGTH = 1300;

function projectOntoSegment(px: number, py: number, seg: Segment) {
  const dx = seg.x2 - seg.x1;
  const dy = seg.y2 - seg.y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return { x: seg.x1, y: seg.y1, dist: Math.hypot(px - seg.x1, py - seg.y1), t: 0 };
  }
  let t = ((px - seg.x1) * dx + (py - seg.y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = seg.x1 + t * dx;
  const projY = seg.y1 + t * dy;
  const dist = Math.hypot(px - projX, py - projY);
  return { x: projX, y: projY, dist, t };
}

export const MouseMazeActivity: React.FC<MouseMazeActivityProps> = ({ onComplete }) => {
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 60, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [shields, setShields] = useState(3);
  const [errors, setErrors] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'completed'>('ready');
  const [statusMsg, setStatusMsg] = useState('Clique na gotinha de água e conduza-a com carinho pelo canal até a Grande Árvore!');

  const containerRef = useRef<HTMLDivElement>(null);
  const ballGroupRef = useRef<SVGGElement>(null);
  const isCompletedRef = useRef(false);
  const lastCollisionTime = useRef(0);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cachedRect = useRef<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 0,
    width: 700,
    height: 360,
  });
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 60, y: 60 });
  const currentSegmentRef = useRef<number>(0);

  // Mantém refs sincronizados com estado
  useEffect(() => {
    currentPosRef.current = ballPos;
  }, [ballPos]);

  useEffect(() => {
    currentSegmentRef.current = currentSegment;
  }, [currentSegment]);

  const triggerVictory = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    setGameState('completed');
    setIsDragging(false);
    setProgress(100);
    setBallPos({ x: 640, y: 300 });
    if (ballGroupRef.current) {
      ballGroupRef.current.setAttribute('transform', 'translate(640, 300)');
    }
    setStatusMsg('Maravilha! Você conduziu a gotinha de água fresca com precisão e regou a Grande Árvore!');
    sounds.coin();
    sounds.victoryFanfare();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

    setTimeout(() => {
      onComplete({
        wpm: 0,
        accuracy: Math.max(70, 100 - errors * 10),
        errors,
        rewardXp: 60,
        rewardCoins: 45,
      });
    }, 1300);
  }, [errors, onComplete]);

  // Atualização direta e instantânea da posição da bola sem atraso de CSS
  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState === 'completed') return;
    e.preventDefault();

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      cachedRect.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width || 700,
        height: rect.height || 360,
      };

      const scaleX = 700 / cachedRect.current.width;
      const scaleY = 360 / cachedRect.current.height;
      const rawX = (e.clientX - cachedRect.current.left) * scaleX;
      const rawY = (e.clientY - cachedRect.current.top) * scaleY;

      // Guarda o deslocamento relativo entre o ponto de clique e o centro da bola
      dragOffset.current = {
        x: rawX - currentPosRef.current.x,
        y: rawY - currentPosRef.current.y,
      };
    }

    setIsDragging(true);
    setHasStarted(true);
    setGameState('playing');
    sounds.mouseClick();
    setStatusMsg('Arraste a bola suavemente pelo túnel até a meta!');
  };

  // Movimento de alto desempenho com 0ms de latência
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (isCompletedRef.current) return;

    const { left, top, width, height } = cachedRect.current;
    if (width === 0 || height === 0) return;

    const scaleX = 700 / width;
    const scaleY = 360 / height;
    const rawX = (clientX - left) * scaleX;
    const rawY = (clientY - top) * scaleY;

    // Posição alvo compensando o ponto onde o usuário clicou na bola
    const targetX = rawX - dragOffset.current.x;
    const targetY = rawY - dragOffset.current.y;

    const segIdx = currentSegmentRef.current;

    // Encontra projeção nos segmentos próximos
    const projections = SEGMENTS.map((seg) => ({
      seg,
      ...projectOntoSegment(targetX, targetY, seg),
    }));

    // Permite navegar nos segmentos adjacentes
    const accessible = projections.filter((p) => Math.abs(p.seg.id - segIdx) <= 1);
    accessible.sort((a, b) => a.dist - b.dist);
    const best = accessible[0];

    if (!best) return;

    // Verificação de barreiras e limites do túnel
    const hitsBarrier1 = targetX >= 194 && targetX <= 230 && targetY <= 265;
    const hitsBarrier2 = targetX >= 434 && targetX <= 470 && targetY >= 95;
    const isOutsideCorridor = best.dist > 40; // Margem confortável para resposta imediata

    let finalX = targetX;
    let finalY = targetY;

    if (hitsBarrier1 || hitsBarrier2 || isOutsideCorridor) {
      // Confinamento na linha segura do túnel se tentar atravessar a parede
      finalX = best.x;
      finalY = best.y;

      const now = Date.now();
      if (now - lastCollisionTime.current > 500) {
        lastCollisionTime.current = now;
        sounds.errorThud();
        setErrors((prev) => prev + 1);
        setShields((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            const resetSeg = SEGMENTS[segIdx];
            finalX = resetSeg.x1;
            finalY = resetSeg.y1;
            setStatusMsg('Escudos esgotados! Mantenha a bola dentro do túnel azul.');
            return 3;
          }
          setStatusMsg(`Atenção à parede! Escudos restantes: ${next}`);
          return next;
        });
      }
    }

    // Aplica a posição diretamente no nó SVG no mesmo instante do evento (Zero Lag)
    if (ballGroupRef.current) {
      ballGroupRef.current.setAttribute('transform', `translate(${finalX}, ${finalY})`);
    }
    currentPosRef.current = { x: finalX, y: finalY };

    // Avanço de segmento
    if (best.seg.id > segIdx) {
      currentSegmentRef.current = best.seg.id;
      setCurrentSegment(best.seg.id);
      sounds.keyClick();
    } else if (best.seg.id < segIdx && best.t < 0.2) {
      currentSegmentRef.current = best.seg.id;
      setCurrentSegment(best.seg.id);
    }

    // Atualização de progresso
    const distanceSoFar = best.seg.cumulativeBefore + best.t * best.seg.length;
    const pct = Math.min(100, Math.round((distanceSoFar / TOTAL_TRACK_LENGTH) * 100));
    setProgress(pct);

    // Checagem de meta
    const distToFinish = Math.hypot(finalX - 640, finalY - 300);
    if (distToFinish < 40 || (best.seg.id === 6 && best.t >= 0.85)) {
      triggerVictory();
    }
  }, [triggerVictory]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    // Salva a posição final no estado React
    setBallPos(currentPosRef.current);
    if (!isCompletedRef.current) {
      setStatusMsg('Bola parada. Clique e continue arrastando até a meta!');
    }
  }, []);

  // Listeners globais no window para rastreamento instantâneo a 60/120fps sem perder o cursor
  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onPointerUp = () => {
      handleEnd();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  const resetMaze = () => {
    isCompletedRef.current = false;
    setIsDragging(false);
    setGameState('ready');
    setBallPos({ x: 60, y: 60 });
    currentPosRef.current = { x: 60, y: 60 };
    currentSegmentRef.current = 0;
    setCurrentSegment(0);
    setShields(3);
    setProgress(0);
    setHasStarted(false);
    if (ballGroupRef.current) {
      ballGroupRef.current.setAttribute('transform', 'translate(60, 60)');
    }
    setStatusMsg('Clique na gotinha de água e conduza-a com carinho pelo canal até a Grande Árvore!');
  };

  return (
    <div className="flex flex-col items-center space-y-3.5 select-none w-full max-w-4xl mx-auto">
      {/* Barra de Status e Indicadores */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💧</span>
            <span className="text-xs font-bold text-slate-300">Gotas de Reserva:</span>
            <div className="flex space-x-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    s <= shields ? 'bg-sky-400 border-sky-300 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300">
            <Move className="w-3.5 h-3.5 text-sky-400" />
            <span>Progresso da Água: <b className="text-sky-400">{progress}%</b></span>
          </div>

          <div className="text-xs text-slate-400">
            Toques na margem: <b className="text-amber-400">{errors}</b>
          </div>
        </div>

        <button
          onClick={resetMaze}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Recomeçar</span>
        </button>
      </div>

      {/* Mensagem Instrutiva Dinâmica */}
      <div className={`text-xs text-center px-4 py-2 rounded-xl w-full border font-medium transition-all ${
        gameState === 'completed'
          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md'
          : isDragging
          ? 'bg-sky-950/60 border-sky-500/50 text-sky-300 shadow-md'
          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-inner'
      }`}>
        {statusMsg}
      </div>

      {/* Arena Interativa do Labirinto com SVG Responsivo */}
      <div
        ref={containerRef}
        className="relative w-full h-[360px] bg-slate-950 border-2 border-emerald-700/50 rounded-2xl overflow-hidden shadow-2xl touch-none"
      >
        {/* Grade ecológica de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(#064e3b_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none" />

        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 700 360"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradiente da Gotinha de Água */}
            <radialGradient id="ballGlow" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="35%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>

            {/* Gradiente da Grande Árvore / Meta */}
            <radialGradient id="goalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
          </defs>

          {/* Margens e Pedrinhas do Canal (Cinza/Verde ardósia suave) */}
          <rect
            x="200"
            y="0"
            width="24"
            height="260"
            rx="10"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="2"
          />
          <rect
            x="440"
            y="100"
            width="24"
            height="260"
            rx="10"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Leito Suave do Canal de Irrigação (Brilho Aquático) */}
          <path
            d="M 60 60 L 160 60 L 160 300 L 320 300 L 320 60 L 560 60 L 560 300 L 640 300"
            fill="none"
            stroke="#0369a1"
            strokeWidth="64"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-30"
          />
          {/* Trilha da Água Limpa do Canal */}
          <path
            d="M 60 60 L 160 60 L 160 300 L 320 300 L 320 60 L 560 60 L 560 300 L 640 300"
            fill="none"
            stroke="#0284c7"
            strokeWidth="50"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />
          {/* Linha Guia Tracejada Central */}
          <path
            d="M 60 60 L 160 60 L 160 300 L 320 300 L 320 60 L 560 60 L 560 300 L 640 300"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="2"
            strokeDasharray="8 8"
            className="opacity-50"
          />

          {/* Marcador de Início (Nascente de Água) */}
          <circle cx="60" cy="60" r="28" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" opacity="0.7" />
          <text x="60" y="64" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            FONTE
          </text>

          {/* Marcador de Chegada (Grande Árvore Florida) */}
          <circle cx="640" cy="300" r="32" fill="url(#goalGlow)" stroke="#6ee7b7" strokeWidth="3" className="animate-pulse" />
          <text x="640" y="296" textAnchor="middle" fontSize="20">
            🌳
          </text>
          <text x="640" y="316" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            ÁRVORE
          </text>

          {/* A GOTINHA DE ÁGUA ARRASTÁVEL COM RESPOSTA 1:1 EM TEMPO REAL */}
          <g
            ref={ballGroupRef}
            transform={`translate(${ballPos.x}, ${ballPos.y})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            style={{ willChange: 'transform' }}
          >
            {/* Halo Suave de Água ao Redor da Gota */}
            <circle
              r={isDragging ? 26 : 22}
              fill={isDragging ? '#38bdf8' : '#0284c7'}
              opacity={isDragging ? 0.45 : 0.25}
            />
            {/* Anel de Destaque */}
            <circle
              r={19}
              fill="none"
              stroke={isDragging ? '#e0f2fe' : '#ffffff'}
              strokeWidth={isDragging ? 2.5 : 1.5}
            />
            {/* Corpo da Gotinha de Água */}
            <circle
              r={16}
              fill="url(#ballGlow)"
              stroke="#0284c7"
              strokeWidth="2"
              className="drop-shadow-md"
            />
            {/* Ponto de Brilho de Água Cristalina */}
            <circle cx="-5" cy="-6" r="3.5" fill="#ffffff" opacity="0.9" />
            {/* Olhinhos fofos */}
            <circle cx="-5" cy="-1" r="2" fill="#082f49" />
            <circle cx="5" cy="-1" r="2" fill="#082f49" />
            <circle cx="-4" cy="-2" r="0.7" fill="#ffffff" />
            <circle cx="6" cy="-2" r="0.7" fill="#ffffff" />
            {/* Bochechinhas suaves */}
            <circle cx="-8" cy="4" r="2" fill="#38bdf8" opacity="0.7" />
            <circle cx="8" cy="4" r="2" fill="#38bdf8" opacity="0.7" />
            {/* Sorriso fofo */}
            <path d="M -3 3 Q 0 6 3 3" fill="none" stroke="#082f49" strokeWidth="1.2" strokeLinecap="round" />

            {/* Dica Visual "Arraste" Flutuante quando parada no início */}
            {!hasStarted && (
              <g transform="translate(0, -32)" className="pointer-events-none">
                <rect x="-44" y="-12" width="88" height="20" rx="10" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="0" y="2" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  Arraste-me ➔
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Orientação Ergonômica e Construtiva */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-start space-x-3 text-xs text-slate-300 max-w-2xl">
        <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b className="text-sky-300">Preservação da Água & Cuidado com a Floresta:</b> Segure o botão esquerdo com firmeza e suavidade, conduzindo a gotinha com o antebraço ao longo do canal para levar vida à Grande Árvore.
        </div>
      </div>
    </div>
  );
};
