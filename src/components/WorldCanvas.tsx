import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IslandDef, AvatarConfig } from '../types';
import { sounds } from '../audio/soundEngine';
import { speakText } from '../speech/tts';
import { Volume2, HelpCircle, Compass, Sparkles } from 'lucide-react';

interface WorldCanvasProps {
  islands: IslandDef[];
  currentIslandIdx: number;
  avatar: AvatarConfig;
  isPresentation?: boolean;
  onSelectIsland: (islandId: number) => void;
  onOpenHelp: () => void;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  islands,
  currentIslandIdx,
  avatar,
  isPresentation = false,
  onSelectIsland,
  onOpenHelp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Posição do jogador no mundo (coordenadas relativas de 0 a 1000 x 720)
  const playerRef = useRef({
    x: 180,
    y: 560,
    walkFrame: 0,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const [approachedIsland, setApproachedIsland] = useState<IslandDef | null>(null);

  // Layout geométrico das 10 ilhas pedagógicas
  const islandCoords = useRef([
    { x: 140, y: 150, r: 84 }, // 0: Mouse
    { x: 380, y: 130, r: 86 }, // 1: Teclado
    { x: 620, y: 180, r: 84 }, // 2: Home Row
    { x: 860, y: 140, r: 86 }, // 3: QWERTY
    { x: 230, y: 370, r: 88 }, // 4: ZXCVB
    { x: 500, y: 350, r: 86 }, // 5: Palavras
    { x: 770, y: 380, r: 88 }, // 6: Acentuação
    { x: 160, y: 590, r: 84 }, // 7: Símbolos
    { x: 480, y: 580, r: 88 }, // 8: NitroType
    { x: 800, y: 590, r: 96 }, // 9: Cidadela / Certificado
  ]);

  // Redimensionamento responsivo do Canvas
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Loop de Renderização e Física do Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const rect = container.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      // Movimentação do Jogador
      const speed = 3.2;
      let dx = 0;
      let dy = 0;
      const keys = keysPressed.current;

      if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
      if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
      if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;

      if (dx !== 0 || dy !== 0) {
        const mag = Math.hypot(dx, dy) || 1;
        playerRef.current.x += (dx / mag) * speed;
        playerRef.current.y += (dy / mag) * speed;
        playerRef.current.walkFrame += 0.2;

        // Limites do mundo
        playerRef.current.x = Math.max(50, Math.min(950, playerRef.current.x));
        playerRef.current.y = Math.max(70, Math.min(660, playerRef.current.y));
      }

      // Proximidade com ilhas
      let near: IslandDef | null = null;
      islandCoords.current.forEach((coord, i) => {
        const dist = Math.hypot(playerRef.current.x - coord.x, playerRef.current.y - coord.y);
        if (dist < coord.r + 40) {
          near = islands[i] || null;
        }
      });
      setApproachedIsland(near);

      // Escala lógica para renderizar mundo 1000x720 no canvas responsivo
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      const scaleX = W / 1000;
      const scaleY = H / 720;
      ctx.scale(scaleX, scaleY);

      // 1. Fundo Oceano Tecnológico
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 720);
      oceanGrad.addColorStop(0, '#06162d');
      oceanGrad.addColorStop(0.5, '#0a2540');
      oceanGrad.addColorStop(1, '#051b2c');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1000, 720);

      // Ondulações sutis de água
      ctx.fillStyle = '#38bdf80f';
      for (let i = 0; i < 20; i++) {
        const wx = (i * 55 + Date.now() * 0.015) % 1050 - 50;
        const wy = (i * 37) % 720;
        ctx.beginPath();
        ctx.ellipse(wx, wy, 45, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Pontes e Trilhas Luminosas Conectando as Ilhas
      ctx.strokeStyle = '#38bdf844';
      ctx.lineWidth = 6;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      for (let i = 0; i < islandCoords.current.length - 1; i++) {
        const from = islandCoords.current[i];
        const to = islandCoords.current[i + 1];
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Renderização das Ilhas
      islandCoords.current.forEach((coord, i) => {
        const island = islands[i];
        if (!island) return;
        const isCurrent = i === currentIslandIdx;

        // Sombra da Ilha
        ctx.fillStyle = '#00000055';
        ctx.beginPath();
        ctx.ellipse(coord.x, coord.y + 24, coord.r * 1.05, coord.r * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Base da Ilha com Gradiente
        const islGrad = ctx.createRadialGradient(
          coord.x,
          coord.y - 10,
          10,
          coord.x,
          coord.y,
          coord.r
        );
        islGrad.addColorStop(0, isCurrent ? '#f59e0b' : island.color);
        islGrad.addColorStop(0.8, '#0f172a');
        islGrad.addColorStop(1, '#020617');

        ctx.fillStyle = islGrad;
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, coord.r, 0, Math.PI * 2);
        ctx.fill();

        // Anel de Destaque
        ctx.strokeStyle = isCurrent ? '#fbbf24' : '#ffffff26';
        ctx.lineWidth = isCurrent ? 4 : 2;
        ctx.stroke();

        // Ícone da Ilha
        ctx.font = '36px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(island.icon, coord.x, coord.y - 12);

        // Título da Ilha
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(`${i + 1}. ${island.name}`, coord.x, coord.y + coord.r + 18);

        // NPC da Ilha
        ctx.font = '24px system-ui';
        ctx.fillText(island.npcAvatar, coord.x + coord.r * 0.5, coord.y - coord.r * 0.4);
      });

      // 4. Renderização do Jogador
      const px = playerRef.current.x;
      const py = playerRef.current.y;
      const bob = Math.sin(playerRef.current.walkFrame) * 2;

      // Sombra do jogador
      ctx.fillStyle = '#00000066';
      ctx.beginPath();
      ctx.ellipse(px, py + 16, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Corpo estilizado do jogador
      ctx.fillStyle = avatar.shirt || '#10b981';
      ctx.beginPath();
      ctx.roundRect(px - 10, py - 10 + bob, 20, 18, 5);
      ctx.fill();

      // Cabeça
      ctx.fillStyle = avatar.skin || '#8d5524';
      ctx.beginPath();
      ctx.arc(px, py - 18 + bob, 9, 0, Math.PI * 2);
      ctx.fill();

      // Cabelo
      ctx.fillStyle = avatar.hair || '#21160f';
      ctx.beginPath();
      ctx.arc(px, py - 22 + bob, 9, Math.PI, Math.PI * 2);
      ctx.fill();

      // Nome flutuante do jogador
      ctx.fillStyle = '#ffd447';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Você', px, py - 32 + bob);

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [islands, currentIslandIdx, avatar]);

  // Teclado com prevenção de rolagem
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em formulário
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      keysPressed.current[e.key] = true;

      // Espaço entra na ilha aproximada
      if (e.key === ' ' && approachedIsland) {
        sounds.mouseClick();
        onSelectIsland(approachedIsland.id);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete keysPressed.current[e.key];
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [approachedIsland, onSelectIsland]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
    const clickY = ((e.clientY - rect.top) / rect.height) * 720;

    // Checa se clicou em alguma ilha
    islandCoords.current.forEach((coord, i) => {
      const d = Math.hypot(clickX - coord.x, clickY - coord.y);
      if (d <= coord.r) {
        sounds.mouseClick();
        onSelectIsland(i);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        isPresentation ? 'h-[calc(100vh-160px)] min-h-[560px]' : 'h-[520px] lg:h-[620px]'
      } rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl select-none transition-all`}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-pointer"
        tabIndex={0}
        aria-label="Mapa do Mundo TypeHero. Use WASD ou as setas para mover seu avatar."
      />

      {/* HUD Superior */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl pointer-events-auto flex items-center space-x-2.5 shadow-lg">
          <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
          <div>
            <div className="text-xs font-bold text-white leading-tight">
              {approachedIsland ? approachedIsland.name : 'Arquipélago TypeHero'}
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              {approachedIsland ? approachedIsland.goal : 'Caminhe com WASD ou Setas até uma ilha'}
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pointer-events-auto">
          <button
            onClick={() =>
              speakText(
                approachedIsland
                  ? `${approachedIsland.name}. ${approachedIsland.goal}. Pressione Espaço para entrar na missão!`
                  : 'Bem-vindo ao mapa do TypeHero. Mova seu personagem até as ilhas para aprender digitação e informática!'
              )
            }
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center shadow-lg transition"
            title="Ouvir instrução por voz"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenHelp}
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shadow-lg transition"
            title="Ajuda e Controles"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Balao de Acao quando perto de Ilha */}
      {approachedIsland && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <button
            onClick={() => onSelectIsland(approachedIsland.id)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-[0_0_25px_#f59e0b88] flex items-center space-x-2 border-2 border-white active:scale-95 transition-all animate-bounce"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pressione ESPAÇO para entrar em {approachedIsland.name}</span>
          </button>
        </div>
      )}
    </div>
  );
};
