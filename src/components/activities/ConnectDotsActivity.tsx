import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, MousePointerClick, RefreshCw, CheckCircle2, Star } from 'lucide-react';

interface ConnectDotsActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Point {
  id: number;
  x: number;
  y: number;
  label?: string;
}

interface DrawingPreset {
  name: string;
  emoji: string;
  description: string;
  points: Point[];
  closedPathD: string;
  fillColor: string;
  strokeColor: string;
}

const PRESETS: DrawingPreset[] = [
  {
    name: 'Estrela Dourada do Vale',
    emoji: '⭐',
    description: 'Conecte os pontos numerados de 1 a 10 para acender a estrela brilhante!',
    points: [
      { id: 1, x: 300, y: 45 },
      { id: 2, x: 345, y: 135 },
      { id: 3, x: 450, y: 145 },
      { id: 4, x: 370, y: 215 },
      { id: 5, x: 400, y: 320 },
      { id: 6, x: 300, y: 260 },
      { id: 7, x: 200, y: 320 },
      { id: 8, x: 230, y: 215 },
      { id: 9, x: 150, y: 145 },
      { id: 10, x: 255, y: 135 },
    ],
    closedPathD:
      'M 300 45 L 345 135 L 450 145 L 370 215 L 400 320 L 300 260 L 200 320 L 230 215 L 150 145 L 255 135 Z',
    fillColor: '#fbbf24',
    strokeColor: '#d97706',
  },
  {
    name: 'Barquinho do Lago Digital',
    emoji: '⛵',
    description: 'Conecte os pontos de 1 a 9 para içar as velas do barquinho navegante!',
    points: [
      { id: 1, x: 300, y: 50 },  // topo mastro
      { id: 2, x: 420, y: 200 }, // ponta vela direita
      { id: 3, x: 300, y: 200 }, // centro base mastro
      { id: 4, x: 180, y: 200 }, // ponta vela esquerda
      { id: 5, x: 140, y: 260 }, // proa casco esquerdo
      { id: 6, x: 200, y: 330 }, // fundo esquerdo
      { id: 7, x: 400, y: 330 }, // fundo direito
      { id: 8, x: 460, y: 260 }, // popa casco direito
      { id: 9, x: 300, y: 260 }, // centro casco
    ],
    closedPathD:
      'M 300 50 L 420 200 L 300 200 L 180 200 Z M 140 260 L 200 330 L 400 330 L 460 260 Z',
    fillColor: '#38bdf8',
    strokeColor: '#0284c7',
  },
  {
    name: 'Casinha da Aventura',
    emoji: '🏡',
    description: 'Conecte os pontos de 1 a 8 para erguer as paredes e o telhado da casa!',
    points: [
      { id: 1, x: 300, y: 55 },  // topo do telhado
      { id: 2, x: 440, y: 155 }, // beiral direito
      { id: 3, x: 440, y: 325 }, // canto inferior direito
      { id: 4, x: 340, y: 325 }, // porta direita
      { id: 5, x: 340, y: 235 }, // porta topo
      { id: 6, x: 260, y: 235 }, // porta topo esq
      { id: 7, x: 260, y: 325 }, // porta esquerda
      { id: 8, x: 160, y: 325 }, // canto inferior esq
    ],
    closedPathD:
      'M 300 55 L 440 155 L 440 325 L 340 325 L 340 235 L 260 235 L 260 325 L 160 325 L 160 155 Z',
    fillColor: '#a855f7',
    strokeColor: '#7e22ce',
  },
];

const PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

export const ConnectDotsActivity: React.FC<ConnectDotsActivityProps> = ({ onComplete }) => {
  const [currentPresetIdx, setCurrentPresetIdx] = useState(0);
  const [connectedIds, setConnectedIds] = useState<number[]>([]);
  const [nextExpectedId, setNextExpectedId] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const preset = PRESETS[currentPresetIdx];

  // Track mouse coordinates for dynamic connection rubber-band line
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isCompleted || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 380;
    setMousePos({ x, y });
  };

  const handleDotClick = (pointId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isCompleted) return;

    if (pointId === nextExpectedId) {
      // Ascending chime note
      const noteIdx = (nextExpectedId - 1) % PENTATONIC_FREQS.length;
      sounds.playPianoNote(PENTATONIC_FREQS[noteIdx], 0.35);

      const newConnected = [...connectedIds, pointId];
      setConnectedIds(newConnected);

      if (pointId === preset.points.length) {
        // Complete current drawing!
        setIsCompleted(true);
        sounds.coin();
        sounds.victoryFanfare();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } else {
        setNextExpectedId(pointId + 1);
      }
    } else if (pointId > nextExpectedId) {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
    }
  };

  const handleAdvanceOrComplete = () => {
    sounds.coin();
    if (currentPresetIdx < PRESETS.length - 1) {
      setCurrentPresetIdx((prev) => prev + 1);
      setConnectedIds([]);
      setNextExpectedId(1);
      setIsCompleted(false);
      setMousePos(null);
    } else {
      onComplete({
        wpm: 34,
        accuracy: Math.max(88, 100 - errors * 3),
        errors,
        rewardXp: 75,
        rewardCoins: 50,
      });
    }
  };

  // Last connected point for the rubber band line
  const lastConnectedPoint = connectedIds.length > 0
    ? preset.points.find((p) => p.id === connectedIds[connectedIds.length - 1])
    : null;

  // SVG path for already connected points
  const linesPathD = connectedIds
    .map((id, index) => {
      const pt = preset.points.find((p) => p.id === id);
      if (!pt) return '';
      return `${index === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 sm:px-5 shadow-lg gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-3xl filter drop-shadow">{preset.emoji}</span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              Ligar os Pontos: {preset.name}
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-500/40">
                Desenho {currentPresetIdx + 1} de {PRESETS.length}
              </span>
            </h3>
            <p className="text-xs text-slate-300">{preset.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3.5 py-1.5 rounded-xl shadow">
          <MousePointerClick className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Próximo ponto: #{nextExpectedId}</span>
        </div>
      </div>

      {/* Interactive Drawing Canvas */}
      <div className="relative w-full h-[380px] bg-slate-950 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center cursor-crosshair">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <svg
          ref={svgRef}
          viewBox="0 0 600 380"
          className="w-full h-full"
          onMouseMove={handleMouseMove}
        >
          <defs>
            <linearGradient id="connectLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Filled completed silhouette when finished */}
          {isCompleted && (
            <path
              d={preset.closedPathD}
              fill={preset.fillColor}
              stroke={preset.strokeColor}
              strokeWidth="6"
              className="transition-all duration-700 opacity-90"
              filter="url(#neonGlow)"
            />
          )}

          {/* Connected Lines so far */}
          {linesPathD && (
            <path
              d={linesPathD}
              fill="none"
              stroke="url(#connectLineGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Dynamic rubber-band line to cursor */}
          {!isCompleted && lastConnectedPoint && mousePos && (
            <line
              x1={lastConnectedPoint.x}
              y1={lastConnectedPoint.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity={0.7}
              pointerEvents="none"
            />
          )}

          {/* The Points */}
          {preset.points.map((pt) => {
            const isConnected = connectedIds.includes(pt.id);
            const isNext = pt.id === nextExpectedId && !isCompleted;

            return (
              <g
                key={pt.id}
                onClick={(e) => handleDotClick(pt.id, e)}
                className="cursor-pointer select-none"
              >
                {/* Generous invisible hit target to guarantee clicks always register smoothly */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={32}
                  fill="transparent"
                  className="cursor-pointer"
                />

                {/* Animated pulsing ring for the next target */}
                {isNext && (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={24}
                      fill="#38bdf8"
                      opacity={0.3}
                      className="animate-ping"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={18}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      strokeDasharray="4 2"
                    />
                  </>
                )}

                {/* Main dot circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isNext ? 15 : isConnected ? 12 : 13}
                  fill={isConnected ? '#10b981' : isNext ? '#38bdf8' : '#1e293b'}
                  stroke={isConnected ? '#a7f3d0' : isNext ? '#ffffff' : '#64748b'}
                  strokeWidth={isNext ? 3 : 2}
                  className="transition-transform duration-150 hover:scale-125"
                />

                {/* Point Number Badge */}
                <text
                  x={pt.x}
                  y={pt.y + 4.5}
                  textAnchor="middle"
                  fill={isConnected ? '#064e3b' : isNext ? '#0f172a' : '#ffffff'}
                  fontSize={isNext ? '13' : '11'}
                  fontWeight="black"
                  fontFamily="sans-serif"
                  pointerEvents="none"
                >
                  {pt.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Completion Modal Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center space-y-3 p-6 z-30 animate-in fade-in">
            <span className="text-6xl animate-bounce">{preset.emoji}</span>
            <h3 className="text-xl sm:text-2xl font-black text-white text-center">
              Desenho Revelado com Sucesso!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md text-center">
              Excelente coordenação motora! Você ligou com perfeição todos os {preset.points.length} pontos e concluiu o <b className="text-amber-400">{preset.name}</b>!
            </p>

            <div className="pt-3 flex items-center space-x-3">
              <button
                onClick={handleAdvanceOrComplete}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-[0_0_20px_#f59e0b55] active:scale-95 transition flex items-center space-x-2"
              >
                <span>{currentPresetIdx < PRESETS.length - 1 ? 'Próximo Desenho' : 'Concluir Missão ➔'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ergonomic & Pedagogical Tip */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-start space-x-3 text-xs text-slate-300 w-full shadow">
        <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <b className="text-sky-300">Coordenação Visomotora & Atenção:</b> Aponte o cursor no centro de cada número brilhante e dê um clique suave com o botão esquerdo. Siga a sequência crescente (1, 2, 3...) para revelar o desenho completo!
        </div>
      </div>
    </div>
  );
};
export default ConnectDotsActivity;
