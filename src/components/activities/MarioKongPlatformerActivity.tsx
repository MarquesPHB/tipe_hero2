import React, { useState, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Heart, Flame } from 'lucide-react';

interface MarioKongPlatformerActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface QuestionBlock {
  id: number;
  x: number;
  y: number;
  key: string;
  isHit: boolean;
}

interface Barrel {
  id: number;
  x: number;
  y: number;
  dir: 'left' | 'right';
  level: number;
}

export const MarioKongPlatformerActivity: React.FC<MarioKongPlatformerActivityProps> = ({ onComplete }) => {
  // Player state
  const [playerX, setPlayerX] = useState(60);
  const [playerY, setPlayerY] = useState(290); // Ground level
  const [currentLevel, setCurrentLevel] = useState(0); // 0: ground, 1: mid, 2: top
  const [isJumping, setIsJumping] = useState(false);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState('Pule nos blocos [ ? ] digitando as teclas para subir e desviar dos barris!');

  // Blocks with question marks
  const [blocks, setBlocks] = useState<QuestionBlock[]>([
    { id: 1, x: 160, y: 250, key: 'A', isHit: false },
    { id: 2, x: 300, y: 250, key: 'S', isHit: false },
    { id: 3, x: 440, y: 170, key: 'D', isHit: false },
    { id: 4, x: 260, y: 170, key: 'W', isHit: false },
    { id: 5, x: 120, y: 90, key: 'F', isHit: false },
    { id: 6, x: 280, y: 90, key: 'J', isHit: false },
  ]);

  // Rolling Barrels from Tower Guardian
  const [barrels, setBarrels] = useState<Barrel[]>([
    { id: 1, x: 380, y: 80, dir: 'left', level: 2 },
    { id: 2, x: 100, y: 180, dir: 'right', level: 1 },
  ]);

  // Barrels rolling loop
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setBarrels((prevBarrels) =>
        prevBarrels.map((barrel) => {
          let nextX = barrel.dir === 'right' ? barrel.x + 4 : barrel.x - 4;
          let nextDir = barrel.dir;
          let nextLevel = barrel.level;
          let nextY = barrel.y;

          // Reaching boundaries -> drop to next ramp
          if (nextX > 520 && barrel.dir === 'right') {
            nextDir = 'left';
            if (nextLevel > 0) {
              nextLevel -= 1;
              nextY = nextLevel === 1 ? 180 : 285;
            } else {
              // Loop back to Tower Guardian
              nextX = 400;
              nextY = 80;
              nextLevel = 2;
            }
          } else if (nextX < 40 && barrel.dir === 'left') {
            nextDir = 'right';
            if (nextLevel > 0) {
              nextLevel -= 1;
              nextY = nextLevel === 1 ? 180 : 285;
            } else {
              // Loop back to Tower Guardian
              nextX = 400;
              nextY = 80;
              nextLevel = 2;
            }
          }

          // Check collision with player if not jumping
          if (!isJumping && Math.abs(nextX - playerX) < 26 && Math.abs(nextY - playerY) < 25) {
            sounds.errorThud();
            setLives((l) => Math.max(1, l - 1));
            setFeedback('⚠️ Cuidado com o barril! Pressione a tecla mágica para pular!');
          }

          return { ...barrel, x: nextX, dir: nextDir, level: nextLevel, y: nextY };
        })
      );
    }, 45);

    return () => clearInterval(interval);
  }, [playerX, playerY, isJumping, isFinished]);

  // Physical keyboard listener
  useEffect(() => {
    if (isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();

      // Find if there is an unhit block with this key
      const hitBlock = blocks.find((b) => b.key === key && !b.isHit);

      if (hitBlock) {
        sounds.keyClick();
        triggerJumpToBlock(hitBlock);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerX((x) => Math.min(520, x + 25));
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerX((x) => Math.max(40, x - 25));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blocks, isFinished, playerX]);

  const triggerJumpToBlock = (targetBlock: QuestionBlock) => {
    setIsJumping(true);
    sounds.whoosh();

    // Jump hero towards block
    setPlayerX(targetBlock.x);
    setPlayerY(targetBlock.y + 35);

    setTimeout(() => {
      // Hit block -> Coin sound!
      sounds.coin();
      setCoins((c) => c + 10);
      setBlocks((prev) =>
        prev.map((b) => (b.id === targetBlock.id ? { ...b, isHit: true } : b))
      );

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { x: targetBlock.x / 600, y: targetBlock.y / 350 },
      });

      // Update player level based on block height
      if (targetBlock.y < 120) {
        setCurrentLevel(2);
        setPlayerY(80);
      } else if (targetBlock.y < 200) {
        setCurrentLevel(1);
        setPlayerY(180);
      } else {
        setPlayerY(285);
      }

      setIsJumping(false);

      // Check if all blocks hit
      const allHit = blocks.filter((b) => b.id !== targetBlock.id).every((b) => b.isHit);
      if (allHit) {
        setIsFinished(true);
        sounds.victoryFanfare();
        confetti({ particleCount: 120, spread: 90 });
        setFeedback('🏆 VOCÊ CONQUISTOU A TORRE E SALVOU O REINO!');
        setTimeout(() => {
          onComplete({
            wpm: 38,
            accuracy: 96,
            errors: 0,
            rewardXp: 95,
            rewardCoins: 75,
          });
        }, 2000);
      } else {
        setFeedback(`✨ Bloco [ ${targetBlock.key} ] quebrado! +10 Moedas Douradas Retrô!`);
      }
    }, 250);
  };

  return (
    <div className="flex flex-col space-y-4 max-w-3xl mx-auto select-none">
      {/* Header Retrô 16-bit Plataforma */}
      <div className="bg-slate-900 border-4 border-amber-500 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 snes-bezel">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 border-2 border-amber-300 text-white flex items-center justify-center text-xl font-bold shadow">
            🕹️
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-amber-300 tracking-wider font-mono">
              AVENTURA NAS PLATAFORMAS RETRÔ 16-BIT
            </h3>
            <p className="text-xs text-slate-300">
              Blocos Quebrados: {blocks.filter((b) => b.isHit).length} de {blocks.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 font-mono">
            <span className="text-amber-400 font-black text-lg flex items-center gap-1">
              🪙 {coins}
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 font-mono">
            {Array.from({ length: lives }).map((_, i) => (
              <Heart key={i} className="w-4 h-4 text-rose-500 fill-rose-500" />
            ))}
          </div>
        </div>
      </div>

      {/* Cenário de Plataforma 2D Retrô */}
      <div className="relative w-full h-[350px] bg-gradient-to-b from-indigo-950 via-slate-900 to-amber-950 border-4 border-slate-700 rounded-3xl overflow-hidden shadow-2xl snes-bezel flex items-center justify-center">
        <svg viewBox="0 0 600 350" className="w-full h-full">
          {/* Fundo do Castelo Retrô */}
          <rect x="0" y="0" width="600" height="350" fill="#090d16" />

          {/* RAMPAS E PLATAFORMAS (Vigas de Aço Vermelhas Retrô Arcade) */}
          {/* Nível Térreo */}
          <rect x="20" y="320" width="560" height="20" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <line x1="20" y1="325" x2="580" y2="325" stroke="#fca5a5" strokeWidth="2" strokeDasharray="10 5" />

          {/* Nível 1 (Intermediário) */}
          <rect x="40" y="215" width="520" height="16" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <line x1="40" y1="220" x2="560" y2="220" stroke="#fca5a5" strokeWidth="2" strokeDasharray="10 5" />

          {/* Nível 2 (Superior) */}
          <rect x="40" y="115" width="520" height="16" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <line x1="40" y1="120" x2="560" y2="120" stroke="#fca5a5" strokeWidth="2" strokeDasharray="10 5" />

          {/* Escadas Azuis Retrô */}
          <g stroke="#38bdf8" strokeWidth="3">
            {/* Escada nível 0 ao nível 1 */}
            <line x1="480" y1="215" x2="480" y2="320" />
            <line x1="500" y1="215" x2="500" y2="320" />
            {[230, 250, 270, 290, 310].map((ly) => (
              <line key={ly} x1="480" y1={ly} x2="500" y2={ly} />
            ))}

            {/* Escada nível 1 ao nível 2 */}
            <line x1="100" y1="115" x2="100" y2="215" />
            <line x1="120" y1="115" x2="120" y2="215" />
            {[135, 155, 175, 195].map((ly) => (
              <line key={ly} x1="100" y1={ly} x2="120" y2={ly} />
            ))}
          </g>

          {/* GUARDIÃO DA TORRE NO TOPO (Pixel Art 16-bit) */}
          <g transform="translate(420, 50)">
            <ellipse cx="30" cy="55" rx="25" ry="8" fill="rgba(0,0,0,0.5)" />
            {/* Corpo do Guardião */}
            <rect x="10" y="15" width="40" height="38" rx="8" fill="#581c87" stroke="#3b0764" strokeWidth="2" />
            <ellipse cx="30" cy="30" rx="14" ry="12" fill="#7e22ce" />
            {/* Emblema Dourado com Estrela */}
            <circle cx="30" cy="34" r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <text x="30" y="38" fill="#713f12" fontSize="9" fontWeight="black" textAnchor="middle">★</text>
            {/* Cabeça */}
            <circle cx="30" cy="10" r="14" fill="#581c87" />
            <circle cx="25" cy="8" r="3" fill="#ffffff" />
            <circle cx="35" cy="8" r="3" fill="#ffffff" />
            <circle cx="25" cy="8" r="1.5" fill="#facc15" />
            <circle cx="35" cy="8" r="1.5" fill="#facc15" />
            {/* Braços com Barril Mágico */}
            <rect x="52" y="18" width="22" height="26" rx="4" fill="#92400e" stroke="#451a03" strokeWidth="2" />
            <line x1="52" y1="24" x2="74" y2="24" stroke="#000000" strokeWidth="1.5" />
            <line x1="52" y1="36" x2="74" y2="36" stroke="#000000" strokeWidth="1.5" />
          </g>

          {/* BARRIS ROLANDO */}
          {barrels.map((barrel) => (
            <g key={barrel.id} transform={`translate(${barrel.x}, ${barrel.y})`}>
              <ellipse cx="0" cy="12" rx="10" ry="3" fill="rgba(0,0,0,0.4)" />
              <circle cx="0" cy="0" r="11" fill="#92400e" stroke="#451a03" strokeWidth="2" />
              <line x1="-11" y1="0" x2="11" y2="0" stroke="#f59e0b" strokeWidth="2" />
              <line x1="0" y1="-11" x2="0" y2="11" stroke="#f59e0b" strokeWidth="2" />
            </g>
          ))}

          {/* BLOCOS COM INTERROGAÇÃO [ ? ] */}
          {blocks.map((block) => (
            <g
              key={block.id}
              transform={`translate(${block.x - 16}, ${block.y - 16})`}
              onClick={() => !block.isHit && triggerJumpToBlock(block)}
              className="cursor-pointer"
            >
              {block.isHit ? (
                /* Bloco marrom vazio */
                <rect x="0" y="0" width="32" height="32" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
              ) : (
                /* Bloco Dourado Interrogação */
                <g className="animate-pulse">
                  <rect x="0" y="0" width="32" height="32" rx="4" fill="#facc15" stroke="#ca8a04" strokeWidth="2.5" />
                  {/* Parafusos nos 4 cantos */}
                  <circle cx="4" cy="4" r="1.5" fill="#ca8a04" />
                  <circle cx="28" cy="4" r="1.5" fill="#ca8a04" />
                  <circle cx="4" cy="28" r="1.5" fill="#ca8a04" />
                  <circle cx="28" cy="28" r="1.5" fill="#ca8a04" />
                  {/* Tecla correspondente no centro */}
                  <text
                    x="16"
                    y="22"
                    textAnchor="middle"
                    fill="#713f12"
                    fontSize="16"
                    fontWeight="black"
                    fontFamily="monospace"
                  >
                    {block.key}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* JOGADOR HERÓI AVENTUREIRO (PIXEL ART 16-BIT) */}
          <g transform={`translate(${playerX - 14}, ${playerY - 26})`}>
            {/* Sombra */}
            <ellipse cx="14" cy="30" rx="14" ry="5" fill="rgba(0,0,0,0.4)" />
            {/* Armadura/Túnica Esmeralda */}
            <rect x="8" y="14" width="12" height="14" rx="2" fill="#059669" />
            {/* Cinto e Peitoral Dourado */}
            <rect x="6" y="10" width="16" height="6" fill="#f59e0b" />
            {/* Fivela de Ouro */}
            <circle cx="10" cy="18" r="1.5" fill="#fef08a" />
            <circle cx="18" cy="18" r="1.5" fill="#fef08a" />
            {/* Rosto do Herói */}
            <circle cx="14" cy="6" r="6" fill="#fed7aa" />
            {/* Faixa Heroica na Testa */}
            <rect x="7" y="2" width="14" height="3" rx="1" fill="#0284c7" />
            <polygon points="17,3 24,1 21,5 17,4" fill="#0284c7" />
          </g>
        </svg>

        {/* Modal de Conclusão */}
        {isFinished && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in">
            <span className="text-6xl animate-bounce">👑</span>
            <h3 className="text-2xl font-black text-white">FASE RETRÔ CONCLUÍDA!</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Você escalou o castelo, desviou de todos os barris do Guardião da Torre e recolheu todas as moedas douradas retrô!
            </p>
          </div>
        )}
      </div>

      {/* Feedback e Guia de Teclas */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-center">
        <div className="text-xs sm:text-sm font-bold text-amber-400 mb-2">{feedback}</div>
        <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400">Pressione no teclado físico:</span>
          {blocks
            .filter((b) => !b.isHit)
            .map((b) => (
              <span
                key={b.id}
                className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black font-mono flex items-center justify-center shadow"
              >
                {b.key}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MarioKongPlatformerActivity;
