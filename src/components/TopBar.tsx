import React from 'react';
import { AvatarConfig, Difficulty, FontSize, PlayerStats, ThemeMode } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { sounds } from '../audio/soundEngine';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Gem,
  Coins,
  Trophy,
  Award,
  Sliders,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Gauge,
  Brain,
} from 'lucide-react';

interface TopBarProps {
  currentTab: 'world' | 'missions' | 'diagnostic' | 'shop' | 'profile' | 'settings';
  stats: PlayerStats;
  avatar: AvatarConfig;
  difficulty: Difficulty;
  soundEnabled: boolean;
  fontSize: FontSize;
  themeMode: ThemeMode;
  presentationMode: boolean;
  onTabChange: (tab: 'world' | 'missions' | 'diagnostic' | 'shop' | 'profile' | 'settings') => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onToggleSound: () => void;
  onOpenAvatarEditor: () => void;
  onDecreaseFontSize: () => void;
  onIncreaseFontSize: () => void;
  onToggleTheme: () => void;
  onTogglePresentationMode: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  stats,
  avatar,
  difficulty,
  soundEnabled,
  fontSize,
  themeMode,
  presentationMode,
  onTabChange,
  onDifficultyChange,
  onToggleSound,
  onOpenAvatarEditor,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onToggleTheme,
  onTogglePresentationMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 shadow-md">
      <div className={`${presentationMode ? 'w-full px-1 sm:px-3' : 'max-w-7xl mx-auto'} flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 transition-all`}>
        {/* Marca TypeHero */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('world')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 border-2 border-amber-400/80 flex items-center justify-center text-xl text-white font-bold shadow-[0_0_15px_#38bdf833]">
            ⌨
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white leading-none">
              Type<span className="text-amber-400">Hero</span>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Academia de Destreza Digital
            </div>
          </div>
        </div>

        {/* Abas Principais de Navegação */}
        <nav className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'world', label: 'Mundo', icon: '🏠' },
            { id: 'missions', label: 'Missões', icon: '🗺️' },
            { id: 'diagnostic', label: 'Diagnóstico', icon: '📊' },
            { id: 'shop', label: 'Loja', icon: '🎒' },
            { id: 'profile', label: 'Perfil', icon: '🧑' },
            { id: 'settings', label: 'Ajustes', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.keyClick();
                onTabChange(tab.id as 'world' | 'missions' | 'diagnostic' | 'shop' | 'profile' | 'settings');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                currentTab === tab.id
                  ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Painel do Aluno: Dificuldade + Moedas + XP + Avatar */}
        <div className="flex items-center space-x-3">
          {/* Seletor Rápido de Dificuldade */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px]">
            {(['easy', 'intermediate', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                className={`px-2 py-1 rounded font-semibold transition ${
                  difficulty === d
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 'easy' ? 'Fácil' : d === 'intermediate' ? 'Intermed.' : 'Difícil'}
              </button>
            ))}
          </div>

          {/* Controle Universal de Fonte: A- e A+ com indicador de escala */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 space-x-1" title="Ajuste Universal do Tamanho da Fonte">
            <button
              onClick={() => {
                sounds.keyClick();
                onDecreaseFontSize();
              }}
              disabled={fontSize === 'small'}
              className="px-2 py-1 rounded-lg text-xs font-serif font-black text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition"
              title="Diminuir tamanho da fonte de todo o jogo (A-)"
            >
              A−
            </button>
            <span className="text-[11px] font-mono font-bold text-sky-400 px-1 select-none whitespace-nowrap">
              {fontSize === 'small'
                ? '85%'
                : fontSize === 'normal'
                ? '100%'
                : fontSize === 'large'
                ? '120%'
                : fontSize === 'xl'
                ? '145%'
                : '170%'}
            </span>
            <button
              onClick={() => {
                sounds.keyClick();
                onIncreaseFontSize();
              }}
              disabled={fontSize === '2xl'}
              className="px-2 py-1 rounded-lg text-sm font-serif font-black text-amber-400 hover:text-amber-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition"
              title="Aumentar tamanho da fonte de todo o jogo (A+)"
            >
              A+
            </button>
          </div>

          {/* Botão Modo Apresentação (Preencher tela toda) */}
          <button
            onClick={() => {
              sounds.keyClick();
              onTogglePresentationMode();
            }}
            className={`h-9 px-2.5 sm:px-3 rounded-xl border flex items-center space-x-1.5 text-xs font-bold transition active:scale-95 shadow-sm ${
              presentationMode
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-amber-300 shadow-[0_0_15px_#f59e0b80] font-black'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={
              presentationMode
                ? 'Sair do Modo Apresentação (Restaurar tela normal) [ESC ou F11]'
                : 'Ativar Modo Apresentação para preencher a tela toda [F11]'
            }
          >
            {presentationMode ? (
              <>
                <Minimize2 className="w-4 h-4 text-slate-950 shrink-0" />
                <span className="hidden sm:inline font-black">Tela Cheia</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Apresentação</span>
              </>
            )}
          </button>

          {/* Alternador Modo Claro / Escuro */}
          <button
            onClick={() => {
              sounds.keyClick();
              onToggleTheme();
            }}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs transition ${
              themeMode === 'light'
                ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200'
                : 'bg-slate-900 border-slate-700 text-amber-400 hover:text-amber-300'
            }`}
            title={themeMode === 'light' ? 'Mudar para Modo Noturno / Escuro' : 'Mudar para Modo Claro / Diurno'}
          >
            {themeMode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Som Toggle */}
          <button
            onClick={onToggleSound}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs transition ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-sky-400 hover:text-sky-300'
                : 'bg-slate-900 border-rose-900/50 text-rose-400'
            }`}
            title={soundEnabled ? 'Sons de jogo ativados' : 'Sons desativados'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Métrica de Velocidade WPM (Palavras por Minuto) com link direto para o Diagnóstico */}
          <button
            onClick={() => {
              sounds.keyClick();
              onTabChange('diagnostic');
            }}
            className="hidden sm:flex items-center space-x-1.5 bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 px-2.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95"
            title="Métrica de Digitação: Palavras por Minuto (Clique para abrir Diagnóstico de Dificuldades)"
          >
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-sky-400 font-black">{stats.wpm}</span>
            <span className="text-[10px] text-slate-400">WPM</span>
          </button>

          {/* Moedas e Gemas */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold">
            <div className="flex items-center space-x-1 text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>{stats.coins}</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center space-x-1 text-cyan-400">
              <Gem className="w-3.5 h-3.5" />
              <span>{stats.gems}</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="text-emerald-400 font-mono">
              {stats.xp} <span className="text-[10px] text-slate-400">XP</span>
            </div>
          </div>

          {/* Avatar Clicável */}
          <button
            onClick={onOpenAvatarEditor}
            className="w-10 h-10 rounded-full border-2 border-amber-400 bg-slate-800 overflow-hidden shadow-md hover:scale-105 transition flex items-center justify-center cursor-pointer"
            title="Personalizar seu Avatar"
          >
            <AvatarDisplay avatar={avatar} size={36} />
          </button>
        </div>
      </div>
    </header>
  );
};
