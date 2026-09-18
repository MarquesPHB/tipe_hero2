import React from 'react';
import { PlayerStats, AvatarConfig } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { sounds } from '../audio/soundEngine';
import { Trophy, Zap, Gauge, Coins, Gem, Award, Flame, RotateCcw, Sparkles, Target, BarChart3 } from 'lucide-react';

interface ProfileViewProps {
  stats: PlayerStats;
  avatar: AvatarConfig;
  onOpenAvatarEditor: () => void;
  onPracticeErrors: () => void;
  onOpenCertificate: () => void;
  onOpenDiagnostic?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  stats,
  avatar,
  onOpenAvatarEditor,
  onPracticeErrors,
  onOpenCertificate,
  onOpenDiagnostic,
}) => {
  const completedCount = stats.completedPhases.length;
  const errorEntries = Object.entries(stats.errors)
    .filter(([_, count]) => (count as number) > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 8);

  const badges = [
    { id: 'first_step', icon: '🏁', name: 'Primeiro Passo', desc: 'Iniciou a jornada no TypeHero', unlocked: stats.xp > 0 },
    { id: 'mouse_master', icon: '🖱️', name: 'Mão Firme', desc: 'Completou a Ilha do Mouse', unlocked: stats.completedPhases.includes(0) },
    { id: 'keyboard_master', icon: '⌨️', name: 'Operador ABNT2', desc: 'Dominou o Vale do Teclado', unlocked: stats.completedPhases.includes(1) },
    { id: 'home_row', icon: '🌿', name: 'Base Inabalável', desc: 'Conquistou a Floresta Home Row', unlocked: stats.completedPhases.includes(2) },
    { id: 'accents', icon: '✨', name: 'Mestre dos Acentos', desc: 'Acentuação e cedilha impecáveis', unlocked: stats.completedPhases.includes(6) },
    { id: 'nitro', icon: '🏎️', name: 'Velocista Nitro', desc: 'Superou a pista NitroType', unlocked: stats.completedPhases.includes(8) },
    { id: 'graduated', icon: '🎓', name: 'Hero Certificado', desc: 'Concluiu todos os 10 módulos', unlocked: completedCount >= 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Card Principal de Perfil */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group cursor-pointer" onClick={onOpenAvatarEditor}>
          <div className="w-32 h-36 rounded-2xl bg-slate-950 border-2 border-amber-400/80 flex items-center justify-center overflow-hidden shadow-xl group-hover:scale-105 transition">
            <AvatarDisplay avatar={avatar} size={110} animate={true} />
          </div>
          <button className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full font-black text-[10px] shadow border border-white flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-black text-white">{stats.playerName || 'Aluno TypeHero'}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              {completedCount >= 10 ? '🎓 Graduado Oficial' : '🌟 Aventureiro Digital'}
            </span>
          </div>

          <p className="text-xs text-slate-300 max-w-lg">
            Progresso Geral: <b>{completedCount} de 10 ilhas dominadas</b>. Aperfeiçoando o controle motor do mouse, o toque tátil com os 10 dedos e a velocidade no teclado ABNT2.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              onClick={onOpenAvatarEditor}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-600 transition"
            >
              Personalizar Roupas e Cabelo
            </button>
            {onOpenDiagnostic && (
              <button
                onClick={onOpenDiagnostic}
                className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-xs font-bold text-sky-300 border border-sky-500/40 transition flex items-center space-x-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Ver Diagnóstico & WPM</span>
              </button>
            )}
            {completedCount >= 10 && (
              <button
                onClick={onOpenCertificate}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center space-x-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Ver Meu Certificado Oficial</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas Chave */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center space-x-1.5 text-sky-400 text-xs font-semibold mb-1">
            <Gauge className="w-4 h-4" />
            <span>Recorde WPM</span>
          </div>
          <span className="text-3xl font-black text-white font-mono">{stats.wpm}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">palavras por minuto</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center space-x-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <Zap className="w-4 h-4" />
            <span>Precisão Média</span>
          </div>
          <span className="text-3xl font-black text-white font-mono">{Math.round(stats.accuracy)}%</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">acertos sem errar</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center space-x-1.5 text-amber-400 text-xs font-semibold mb-1">
            <Trophy className="w-4 h-4" />
            <span>Ilhas Vencidas</span>
          </div>
          <span className="text-3xl font-black text-white font-mono">{completedCount}/10</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">módulos completos</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="flex items-center justify-center space-x-1.5 text-indigo-400 text-xs font-semibold mb-1">
            <Flame className="w-4 h-4" />
            <span>XP Total</span>
          </div>
          <span className="text-3xl font-black text-white font-mono">{stats.xp}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">experiência adquirida</span>
        </div>
      </div>

      {/* Gráfico de Evolução WPM */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Histórico de Desempenho e Ritmo (Últimas Sessões)
        </h3>
        <div className="h-28 flex items-end gap-2 pt-4 px-2 border-b border-slate-800">
          {stats.historyWpm.map((val, idx) => {
            const h = Math.max(12, Math.min(100, val * 1.5));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition">
                  {val}
                </span>
                <div
                  style={{ height: `${h}%` }}
                  className="w-full bg-gradient-to-t from-sky-600 to-amber-400 rounded-t-md group-hover:brightness-125 transition"
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Sessões Anteriores</span>
          <span>Mais Recente</span>
        </div>
      </div>

      {/* Teclas Críticas para Praticar */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Treino Adaptativo de Teclas Frequentes</h3>
            <p className="text-xs text-slate-400">
              O jogo detectou essas teclas com maior índice de correção durante suas atividades:
            </p>
          </div>
          {errorEntries.length > 0 && (
            <button
              onClick={onPracticeErrors}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition"
            >
              Praticar Dificuldades
            </button>
          )}
        </div>

        {errorEntries.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {errorEntries.map(([k, errCount]) => (
              <div
                key={k}
                className="bg-rose-950/40 border border-rose-500/40 px-3 py-1.5 rounded-xl flex items-center space-x-2"
              >
                <span className="font-mono font-black text-sm text-rose-300">{k}</span>
                <span className="text-[11px] text-rose-400/80">{errCount} erro(s)</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl">
            ✨ Excelente! Você ainda não cometeu erros frequentes nas sessões recentes.
          </div>
        )}
      </div>

      {/* Galeria de Conquistas */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-white">Medalhas e Conquistas Pedagógicas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`flex items-center space-x-3 p-3 rounded-2xl border transition ${
                b.unlocked
                  ? 'bg-slate-950/80 border-amber-500/40'
                  : 'bg-slate-950/30 border-slate-800 opacity-60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                {b.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>{b.name}</span>
                  {b.unlocked && <span className="text-amber-400 text-[10px]">✓ Conquistada</span>}
                </div>
                <div className="text-[11px] text-slate-400">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
