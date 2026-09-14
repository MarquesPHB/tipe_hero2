import React, { useState } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, MousePointerClick, RefreshCw } from 'lucide-react';

interface ConnectDotsActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Point {
  id: number;
  x: number;
  y: number;
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
    name: 'Estrela Mágica',
    emoji: '⭐',
    description: 'Conecte os pontos de 1 a 10 para desenhar a linda estrela dourada!',
    points: [
      { id: 1, x: 300, y: 50 },
      { id: 2, x: 340, y: 140 },
      { id: 3, x: 440, y: 150 },
      { id: 4, x: 360, y: 220 },
      { id: 5, x: 390, y: 320 },
      { id: 6, x: 300, y: 260 },
      { id: 7, x: 210, y: 320 },
      { id: 8, x: 240, y: 220 },
      { id: 9, x: 160, y: 150 },
      { id: 10, x: 260, y: 140 },
    ],
    closedPathD:
      'M 300 50 L 340 140 L 440 150 L 360 220 L 390 320 L 300 260 L 210 320 L 240 220 L 160 150 L 260 140 Z',
    fillColor: '#fbbf24',
    strokeColor: '#f59e0b',
  },
  {
    name: 'Barquinho a Vela',
    emoji: '⛵',
    description: 'Conecte os pontos de 1 a 9 para montar o barquinho que navega no mar!',
    points: [
      { id: 1, x: 300, y: 60 },
      { id: 2, x: 420, y: 240 },
      { id: 3, x: 300, y: 240 },
      { id: 4, x: 180, y: 240 },
      { id: 5, x: 220, y: 320 },
      { id: 6, x: 380, y: 320 },
      { id: 7, x: 430, y: 250 },
      { id: 8, x: 300, y: 250 },
      { id: 9, x: 300, y: 120 },
    ],
    closedPathD:
      'M 300 60 L 420 240 L 300 240 L 180 240 L 220 320 L 380 320 L 430 250 L 300 250 Z',
    fillColor: '#38bdf8',
    strokeColor: '#0284c7',
  },
];

const NOTE_FREQS = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99];

export const ConnectDotsActivity: React.FC<ConnectDotsActivityProps> = ({ onComplete }) => {
  const [currentPresetIdx, setCurrentPresetIdx] = useState(0);
  const [connectedIds, setConnectedIds] = useState<number[]>([]);
  const [nextExpectedId, setNextExpectedId] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [completedDrawingsCount, setCompletedDrawingsCount] = useState(0);

  const preset = PRESETS[currentPresetIdx];

  const handleDotClick = (pointId: number) => {
    if (isCompleted) return;

    if (pointId === nextExpectedId) {
      // Play ascending musical chime
      const noteIdx = (nextExpectedId - 1) % NOTE_FREQS.length;
      sounds.playPianoNote(NOTE_FREQS[noteIdx], 0.35);

      const newConnected = [...connectedIds, pointId];
      setConnectedIds(newConnected);

      if (pointId === preset.points.length) {
        // Completed this drawing!
        setIsCompleted(true);
        sounds.coin();
        sounds.victoryFanfare();
        confetti({ particleCount: 100, spread: 85, origin: { y: 0.6 } });

        const newCount = completedDrawingsCount + 1;
        setCompletedDrawingsCount(newCount);

        if (newCount >= PRESETS.length || currentPresetIdx >= PRESETS.length - 1) {
          setTimeout(() => {
            onComplete({
              wpm: 32,
              accuracy: Math.max(88, 100 - errors * 4),
              errors,
              rewardXp: 70,
              rewardCoins: 45,
            });
          }, 1800);
        }
      } else {
        setNextExpectedId(pointId + 1);
      }
    } else {
      sounds.errorThud();
      setErrors((prev) => prev + 1);
    }
  };

  const handleNextDrawing = () => {
    if (currentPresetIdx < PRESETS.length - 1) {
      setCurrentPresetIdx((prev) => prev + 1);
      setConnectedIds([]);
      setNextExpectedId(1);
      setIsCompleted(false);
    }
  };

  // Generate SVG path for already connected points
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
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{preset.emoji}</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Ligar os Pontos: {preset.name}
              <span className="text-xs font-normal text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-500/30">
                Ponto {Math.min(nextExpectedId, preset.points.length)} de {preset.points.length}
              </span>
            </h3>
            <p className="text-xs text-slate-300">{preset.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-xl">
          <MousePointerClick className="w-4 h-4 text-amber-400" />
          <span>Clique no ponto {nextExpectedId}</span>
        </div>
      </div>

      {/* Interactive Drawing Canvas */}
      <div className="relative w-full h-[380px] bg-slate-950 border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <svg viewBox="0 0 600 380" className="w-full h-full">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* If completed, show filled completed silhouette */}
          {isCompleted && (
            <path
              d={preset.closedPathD}
              fill={preset.fillColor}
              stroke={preset.strokeColor}
              strokeWidth="5"
              className="animate-in fade-in zoom-in duration-500 opacity-80"
              filter="url(#glowEffect)"
            />
          )}

          {/* Connected Lines so far */}
          {linesPathD && (
            <path
              d={linesPathD}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* The Points */}
          {preset.points.map((pt) => {
            const isConnected = connectedIds.includes(pt.id);
            const isNext = pt.id === nextExpectedId && !isCompleted;

            return (
              <g
                key={pt.id}
                onClick={() => handleDotClick(pt.id)}
                className="cursor-pointer group"
              >
                {/* Glow ring around the active next point */}
                {isNext && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    fill="#38bdf8"
                    opacity={0.3}
                    className="animate-ping"
                  />
                )}

                {/* Point Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isNext ? 14 : isConnected ? 10 : 12}
                  fill={isConnected ? '#34d399' : isNext ? '#38bdf8' : '#1e293b'}
                  stroke={isConnected ? '#a7f3d0' : isNext ? '#ffffff' : '#64748b'}
                  strokeWidth={isNext ? 3 : 2}
                  className="transition-all duration-200 group-hover:scale-125"
                />

                {/* Point Number Badge */}
                <text
                  x={pt.x}
                  y={pt.y + 4}
                  textAnchor="middle"
                  fill={isConnected ? '#064e3b' : isNext ? '#0f172a' : '#ffffff'}
                  fontSize={isNext ? '12' : '11'}
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

        {/* Completion Card Overlay */}
        {isCompleted && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30 animate-in fade-in">
            <span className="text-6xl animate-bounce">{preset.emoji}</span>
            <h3 className="text-xl font-black text-white">Desenho Revelado com Sucesso!</h3>
            <p className="text-xs text-slate-300 max-w-md text-center">
              Excelente coordenação motora! Você conectou todos os pontos de 1 a {preset.points.length} e deu vida a este lindo desenho!
            </p>

            {currentPresetIdx < PRESETS.length - 1 ? (
              <button
                onClick={handleNextDrawing}
                className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg active:scale-95 transition flex items-center space-x-2"
              >
                <span>Próximo Desenho</span>
                <span>➔</span>
              </button>
            ) : (
              <div className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/40">
                ✨ Todos os desenhos completados com perfeição!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ergonomic Tip */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-start space-x-3 text-xs text-slate-300 w-full">
        <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <b className="text-sky-300">Coordenação Visomotora:</b> Aponte o cursor no centro do número que está brilhando e clique com suavidade no botão esquerdo, treinando a precisão do mouse e a sequência numérica!
        </div>
      </div>
    </div>
  );
};
