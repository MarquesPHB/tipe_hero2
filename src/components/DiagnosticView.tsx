import React from 'react';
import { PlayerStats, Difficulty } from '../types';
import { generateLearningDiagnostic, SkillDomain, RecommendedActivity } from '../utils/learningDiagnostic';
import { sounds } from '../audio/soundEngine';
import { speakText } from '../speech/tts';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Play,
  Volume2,
  Sparkles,
  Zap,
  Target,
  Brain,
  HelpCircle,
  Flame,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface DiagnosticViewProps {
  stats: PlayerStats;
  difficulty: Difficulty;
  activitiesDoneByIsland: { [islandId: number]: boolean[] };
  onSelectActivity: (islandId: number, activityIdx: number) => void;
  onStartCustomKeyDrill: (keys: string[]) => void;
  onChangeDifficulty: (d: Difficulty) => void;
  onBackToWorld?: () => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  stats,
  difficulty,
  activitiesDoneByIsland,
  onSelectActivity,
  onStartCustomKeyDrill,
  onChangeDifficulty,
  onBackToWorld,
}) => {
  const diagnostic = generateLearningDiagnostic(stats, activitiesDoneByIsland);

  const getStatusBadge = (status: SkillDomain['status']) => {
    switch (status) {
      case 'otimo':
        return (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Dominado
          </span>
        );
      case 'praticar':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Praticar Mais
          </span>
        );
      case 'atencao':
        return (
          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <AlertCircle className="w-3 h-3" /> Requer Atenção
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* CABEÇALHO DO DIAGNÓSTICO */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {onBackToWorld && (
                <button
                  onClick={() => {
                    sounds.keyClick();
                    onBackToWorld();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition flex items-center space-x-1 active:scale-95"
                  title="Voltar ao mapa inicial do jogo"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              )}
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-amber-400" />
                Mapeamento de Dificuldades & Recomendações
              </span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-sky-500/40">
                IA Pedagógica
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Diagnóstico do Aluno
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              O sistema analisa cada tecla pressionada, sua velocidade (WPM) e taxa de precisão, recomendando exatamente quais exercícios você deve treinar para superar qualquer dificuldade.
            </p>
          </div>

          {/* Cards de Métricas de Digitação */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[85px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Velocidade</span>
              <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
                {diagnostic.wpm}
              </span>
              <span className="text-[9px] text-slate-500 block">WPM (ppm)</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[85px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Toques</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {diagnostic.cpm}
              </span>
              <span className="text-[9px] text-slate-500 block">TPM (toques/min)</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[85px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Precisão</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {diagnostic.overallAccuracy}%
              </span>
              <span className="text-[9px] text-slate-500 block">taxa de acerto</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[85px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Erros</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                {diagnostic.totalErrorsMapped}
              </span>
              <span className="text-[9px] text-slate-500 block">teclas críticas</span>
            </div>
          </div>
        </div>

        {/* Histórico Visual de Velocidade WPM */}
        {stats.historyWpm && stats.historyWpm.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span className="font-bold">Evolução do Ritmo (Últimas Sessões):</span>
            </div>
            <div className="flex items-end gap-1.5 h-10 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800">
              {stats.historyWpm.slice(-10).map((histWpm, idx) => {
                const maxWpm = Math.max(50, ...stats.historyWpm);
                const barHeightPercent = Math.max(20, Math.round((histWpm / maxWpm) * 100));
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center group relative cursor-pointer"
                    title={`Sessão ${idx + 1}: ${histWpm} WPM`}
                  >
                    <div
                      className="w-3 bg-gradient-to-t from-sky-600 to-sky-400 rounded-t group-hover:from-amber-400 group-hover:to-yellow-300 transition-all"
                      style={{ height: `${barHeightPercent}%` }}
                    />
                  </div>
                );
              })}
              <span className="text-[10px] font-mono text-sky-400 ml-1.5 font-bold self-center">
                {stats.historyWpm[stats.historyWpm.length - 1]} WPM atual
              </span>
            </div>
          </div>
        )}

        {/* Conselho Pedagógico */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-amber-300">Orientação do Mentor Pedagógico:</span>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {diagnostic.pedagogicalAdvice}
            </p>
          </div>
          <button
            onClick={() => speakText(diagnostic.pedagogicalAdvice)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Ouvir conselho por voz"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: IDENTIFICAÇÃO DE DIFICULDADES DO ALUNO */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-rose-400" />
              Identificação de Dificuldades do Aluno
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              Exercícios com Maior Índice de Dificuldade
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Exercícios onde o sistema registrou menor precisão, erros acumulados ou que exigem coordenação motora nas teclas mais desafiadoras para você.
            </p>
          </div>
          <span className="text-xs text-slate-400 shrink-0 hidden md:inline bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            🎯 Treino focado em superação
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diagnostic.difficultExercises.map((diff, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition hover:border-slate-600 bg-slate-950/90 ${
                diff.severity === 'alta'
                  ? 'border-rose-500/40 shadow-[0_0_15px_#f43f5e15]'
                  : 'border-amber-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{diff.islandIcon}</span>
                    <span className="text-[11px] font-bold text-slate-400">{diff.islandName}</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      diff.severity === 'alta'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {diff.severity === 'alta' ? 'Alta Dificuldade' : 'Requer Atenção'}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white mt-1 leading-snug">
                  {diff.activityTitle}
                </h4>

                <p className="text-xs text-slate-300 mt-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                  🔍 <b className="text-amber-300">Motivo:</b> {diff.reason}
                </p>

                {(diff.recordedAccuracy !== undefined || diff.recordedWpm !== undefined) && (
                  <div className="mt-2.5 flex items-center gap-2">
                    {diff.recordedAccuracy !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        Precisão: <b className="text-rose-400">{diff.recordedAccuracy}%</b>
                      </span>
                    )}
                    {diff.recordedWpm !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        Ritmo: <b className="text-sky-400">{diff.recordedWpm} WPM</b>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  sounds.mouseClick();
                  onSelectActivity(diff.islandId, diff.activityIdx);
                }}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center space-x-1.5 shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Superar Esta Dificuldade</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 1: RECOMENDAÇÕES PERSONALIZADAS ("O QUE TREINAR AGORA") */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Prioridades de Treino Sugeridas
            </div>
            <h3 className="text-lg font-black text-white">
              Atividades que Você Deve Treinar Mais
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Clique em "Treinar Agora" para abrir a missão diretamente
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diagnostic.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all hover:scale-[1.02] ${
                rec.priority === 'alta'
                  ? 'bg-gradient-to-b from-slate-950 to-slate-900 border-amber-500/50 shadow-[0_0_15px_#f59e0b22]'
                  : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{rec.islandIcon}</span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      rec.priority === 'alta'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}
                  >
                    {rec.priority === 'alta' ? 'Alta Prioridade' : 'Recomendado'}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-400">{rec.islandName}</div>
                <h4 className="text-sm font-black text-white mt-0.5 leading-snug">
                  {rec.activityTitle}
                </h4>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  💡 {rec.reason}
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.mouseClick();
                  onSelectActivity(rec.islandId, rec.activityIdx);
                }}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center space-x-2 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Treinar Agora</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 2: TECLAS PROBLEMÁTICAS & MAPA DE ERROS */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Mapeamento de Teclas com Maior Índice de Erros
            </div>
            <h3 className="text-lg font-black text-white">
              Teclas que Precisam de Mais Prática Motora
            </h3>
          </div>

          {diagnostic.weakKeys.length > 0 && (
            <button
              onClick={() => {
                const keys = diagnostic.weakKeys.map((k) => k.key.toLowerCase());
                onStartCustomKeyDrill(keys);
              }}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition self-start sm:self-auto"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Praticar Todas as Teclas Problemáticas</span>
            </button>
          )}
        </div>

        {diagnostic.weakKeys.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950/70 border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white">Nenhuma Tecla Crítica Identificada!</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Parabéns! Seus acertos estão equilibrados por todo o teclado. Continue praticando para alcançar marcas ainda mais altas de velocidade.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {diagnostic.weakKeys.map((k, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-rose-400/80 flex items-center justify-center text-xl font-black text-white font-mono shadow-[0_0_12px_#f43f5e44]">
                      {k.key}
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-1 rounded-lg border border-rose-500/30">
                      {k.errorCount} erros
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-400">
                    ✋ <b>{k.hand}</b>
                  </div>
                  <div className="text-[11px] font-semibold text-sky-400 mt-0.5">
                    👉 Dedo: <b>{k.finger}</b>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 bg-slate-900 p-2 rounded-lg border border-slate-800 leading-relaxed">
                    {k.tip}
                  </p>
                </div>

                <button
                  onClick={() => onStartCustomKeyDrill([k.key.toLowerCase()])}
                  className="mt-3 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition text-center"
                >
                  Treinar Tecla {k.key}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEÇÃO 3: RADAR DE HABILIDADES & DOMÍNIOS */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Áreas de Domínio do Teclado & Mouse
            </div>
            <h3 className="text-lg font-black text-white">
              Status por Competência Didática
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Escala de 0 a 100% de domínio
          </span>
        </div>

        <div className="space-y-3.5">
          {diagnostic.domains.map((d) => (
            <div
              key={d.id}
              className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start sm:items-center space-x-3 flex-1">
                <span className="text-2xl p-2 bg-slate-900 rounded-xl border border-slate-800 shrink-0">
                  {d.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{d.name}</span>
                    {getStatusBadge(d.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2 max-w-md">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        d.score >= 75
                          ? 'bg-emerald-400'
                          : d.score >= 50
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                <span className="font-mono text-sm font-black text-white">
                  {d.score}%
                </span>
                <button
                  onClick={() => onSelectActivity(d.islandId, 0)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 transition flex items-center space-x-1"
                >
                  <span>Ir à Ilha</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
