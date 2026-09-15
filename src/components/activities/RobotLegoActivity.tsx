import React, { useState, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Bot, Wrench, Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface RobotLegoActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface RobotPart {
  id: number;
  name: string;
  type: string;
  codeWord: string;
  color: string;
  description: string;
}

const ROBOT_PARTS: RobotPart[] = [
  {
    id: 1,
    name: 'Esteira de Tração Blindada',
    type: 'Base Lego',
    codeWord: 'BASE',
    color: '#334155',
    description: 'Chassi reforçado com rodas e esteiras para terrenos difíceis.',
  },
  {
    id: 2,
    name: 'Reator de Fusão Cyber',
    type: 'Coração de Energia',
    codeWord: 'ENERGIA',
    color: '#06b6d4',
    description: 'Bateria de cristal azul que alimenta todos os servos motores.',
  },
  {
    id: 3,
    name: 'Torso Blindado de Titânio',
    type: 'Tronco Modular',
    codeWord: 'ROBO',
    color: '#3b82f6',
    description: 'Armadura peitoral com encaixes de pinos Lego reforçados.',
  },
  {
    id: 4,
    name: 'Braços Hidráulicos com Canhão',
    type: 'Membros Superiores',
    codeWord: 'LASER',
    color: '#f59e0b',
    description: 'Garras mecânicas de precisão e emissor laser de feixe triplo.',
  },
  {
    id: 5,
    name: 'Cabeça com Visor Neon Cyberpunk',
    type: 'Cérebro Quântico',
    codeWord: 'FUTURO',
    color: '#10b981',
    description: 'Processador de inteligência artificial com sensores ópticos.',
  },
];

export const RobotLegoActivity: React.FC<RobotLegoActivityProps> = ({ onComplete }) => {
  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  const [assembledParts, setAssembledParts] = useState<number[]>([]);
  const [typedLetters, setTypedLetters] = useState<string>('');
  const [isActivated, setIsActivated] = useState(false);
  const [errors, setErrors] = useState(0);

  const currentPart = ROBOT_PARTS[currentPartIdx];

  // Listen to physical keyboard typing
  useEffect(() => {
    if (isActivated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        const expectedLetter = currentPart.codeWord[typedLetters.length];

        if (key === expectedLetter) {
          sounds.keyClick();
          const nextTyped = typedLetters + key;
          setTypedLetters(nextTyped);

          if (nextTyped === currentPart.codeWord) {
            // Part assembled!
            sounds.coin();
            const newAssembled = [...assembledParts, currentPart.id];
            setAssembledParts(newAssembled);
            setTypedLetters('');

            if (currentPartIdx + 1 >= ROBOT_PARTS.length) {
              // All parts assembled -> Activate Robot!
              setIsActivated(true);
              sounds.victoryFanfare();
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
            } else {
              setCurrentPartIdx((prev) => prev + 1);
            }
          }
        } else {
          sounds.errorThud();
          setErrors((err) => err + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPart, typedLetters, currentPartIdx, assembledParts, isActivated]);

  const handleFinish = () => {
    onComplete({
      wpm: 35,
      accuracy: Math.max(85, 100 - errors * 3),
      errors,
      rewardXp: 90,
      rewardCoins: 65,
    });
  };

  return (
    <div className="flex flex-col space-y-4 max-w-3xl mx-auto select-none">
      {/* Header Oficina Mecha SNES */}
      <div className="bg-slate-900 border-4 border-cyan-400 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 snes-bezel">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 border-2 border-cyan-300 text-white flex items-center justify-center text-xl font-bold shadow">
            🤖
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-cyan-300 tracking-wider font-mono">
              OFICINA LEGO & MONTAGEM DE ROBÔ 16-BIT
            </h3>
            <p className="text-xs text-slate-300">
              Progresso de Montagem: {assembledParts.length} de {ROBOT_PARTS.length} peças
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {ROBOT_PARTS.map((p) => (
            <div
              key={p.id}
              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-mono font-bold transition-all ${
                assembledParts.includes(p.id)
                  ? 'bg-emerald-500 border-emerald-300 text-slate-950 scale-105'
                  : p.id === currentPart?.id
                  ? 'bg-amber-400 border-amber-200 text-slate-950 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {p.id}
            </div>
          ))}
        </div>
      </div>

      {/* Bancada 2D de Montagem do Robô (SVG Ilustrado) */}
      <div className="relative w-full h-[360px] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl snes-bezel flex items-center justify-center">
        {/* Grade de Pinos Lego de Fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_2px,transparent_2px)] [background-size:20px_20px] opacity-15" />

        <svg viewBox="0 0 500 360" className="w-full h-full">
          {/* Piso da esteira */}
          <rect x="50" y="300" width="400" height="40" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <line x1="50" y1="315" x2="450" y2="315" stroke="#f59e0b" strokeWidth="3" strokeDasharray="15 15" />

          {/* PARTE 1: BASE / ESTEIRA (id: 1) */}
          {assembledParts.includes(1) && (
            <g className="animate-in fade-in zoom-in duration-300">
              {/* Esteira de borracha preta */}
              <rect x="175" y="270" width="150" height="35" rx="12" fill="#0f172a" stroke="#475569" strokeWidth="3" />
              {/* Rodas dentadas */}
              <circle cx="200" cy="287" r="10" fill="#64748b" />
              <circle cx="250" cy="287" r="10" fill="#64748b" />
              <circle cx="300" cy="287" r="10" fill="#64748b" />
              {/* Pinos Lego no topo da base */}
              <rect x="210" y="264" width="12" height="6" fill="#475569" rx="2" />
              <rect x="244" y="264" width="12" height="6" fill="#475569" rx="2" />
              <rect x="278" y="264" width="12" height="6" fill="#475569" rx="2" />
            </g>
          )}

          {/* PARTE 2: REATOR DE ENERGIA (id: 2) */}
          {assembledParts.includes(2) && (
            <g className="animate-in fade-in zoom-in duration-300">
              <circle cx="250" cy="215" r="22" fill="#0891b2" stroke="#67e8f9" strokeWidth="3" />
              <circle cx="250" cy="215" r="12" fill="#22d3ee" className="animate-pulse" />
              <line x1="250" y1="195" x2="250" y2="235" stroke="#ffffff" strokeWidth="2" />
              <line x1="230" y1="215" x2="270" y2="215" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}

          {/* PARTE 3: TORSO BLINDADO (id: 3) */}
          {assembledParts.includes(3) && (
            <g className="animate-in fade-in zoom-in duration-300">
              <polygon
                points="210,170 290,170 305,260 195,260"
                fill="#2563eb"
                stroke="#60a5fa"
                strokeWidth="4"
              />
              <rect x="235" y="180" width="30" height="20" rx="3" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1" />
              {/* Pinos Lego de encaixe nos ombros */}
              <circle cx="205" cy="180" r="5" fill="#f59e0b" />
              <circle cx="295" cy="180" r="5" fill="#f59e0b" />
            </g>
          )}

          {/* PARTE 4: BRAÇOS E CANHÕES (id: 4) */}
          {assembledParts.includes(4) && (
            <g className="animate-in fade-in zoom-in duration-300">
              {/* Braço Esquerdo */}
              <rect x="145" y="185" width="55" height="18" rx="6" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
              <polygon points="145,182 125,194 145,206" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
              {/* Braço Direito (Canhão) */}
              <rect x="300" y="185" width="60" height="18" rx="6" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
              <rect x="360" y="188" width="20" height="12" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
              {isActivated && (
                <line x1="380" y1="194" x2="480" y2="194" stroke="#f43f5e" strokeWidth="4" strokeDasharray="8 4" className="animate-pulse" />
              )}
            </g>
          )}

          {/* PARTE 5: CABEÇA COM VISOR NEON (id: 5) */}
          {assembledParts.includes(5) && (
            <g className="animate-in fade-in zoom-in duration-300">
              {/* Pescoço */}
              <rect x="242" y="155" width="16" height="15" fill="#475569" />
              {/* Cabeça Bloco Lego */}
              <rect x="215" y="90" width="70" height="65" rx="10" fill="#059669" stroke="#34d399" strokeWidth="4" />
              {/* Pinos de Lego no topo da cabeça */}
              <rect x="225" y="80" width="14" height="10" fill="#10b981" rx="2" />
              <rect x="261" y="80" width="14" height="10" fill="#10b981" rx="2" />
              {/* Antena Cyber */}
              <line x1="250" y1="80" x2="250" y2="60" stroke="#facc15" strokeWidth="3" />
              <circle cx="250" cy="56" r="6" fill="#ef4444" className="animate-ping" />
              {/* Visor Neon */}
              <rect
                x="225"
                y="110"
                width="50"
                height="18"
                rx="4"
                fill={isActivated ? '#38bdf8' : '#047857'}
                stroke="#ffffff"
                strokeWidth="2"
                className={isActivated ? 'animate-pulse shadow-lg' : ''}
              />
            </g>
          )}
        </svg>

        {/* Overlay de Conclusão / Ativação */}
        {isActivated && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500 border-4 border-white text-slate-950 flex items-center justify-center text-3xl font-bold animate-bounce shadow-[0_0_30px_#10b981]">
              ⚡
            </div>
            <h3 className="text-2xl font-black text-white">ROBÔ TITÃ 100% OPERACIONAL!</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Todas as peças Lego foram montadas e calibradas com sucesso através da sua digitação impecável!
            </p>
            <button
              onClick={handleFinish}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-[0_0_25px_#10b98166] active:scale-95 transition flex items-center space-x-2"
            >
              <span>Coletar Recompensa & Salvar Robô ➔</span>
            </button>
          </div>
        )}
      </div>

      {/* Painel de Digitação da Peça Atual */}
      {!isActivated && currentPart && (
        <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-center shadow-xl">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
            Peça Atual: {currentPart.type} - <span className="text-white">{currentPart.name}</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">{currentPart.description}</p>

          <div className="text-xs text-slate-300 mb-2">
            Digite a palavra-código no seu teclado para encaixar a peça:
          </div>

          <div className="flex items-center justify-center gap-2">
            {currentPart.codeWord.split('').map((char, cIdx) => {
              const isTyped = cIdx < typedLetters.length;
              const isNext = cIdx === typedLetters.length;

              return (
                <div
                  key={cIdx}
                  className={`w-12 h-12 rounded-xl border-2 font-mono text-xl font-black flex items-center justify-center transition-all ${
                    isTyped
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_#06b6d466] scale-95'
                      : isNext
                      ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_20px_#f59e0b88] scale-105 animate-bounce'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotLegoActivity;
