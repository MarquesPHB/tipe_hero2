import React, { useState, useEffect } from 'react';
import { GameSettings, VisionMode, FontSize } from '../types';
import { sounds } from '../audio/soundEngine';
import { speakText, getPtBRVoices } from '../speech/tts';
import { X, Sliders, Volume2, Eye, Type, Zap, Check, Maximize2, Minimize2 } from 'lucide-react';

interface AccessibilityModalProps {
  settings: GameSettings;
  onSave: (updated: GameSettings) => void;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [current, setCurrent] = useState<GameSettings>({ ...settings });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setVoices(getPtBRVoices());
  }, []);

  const update = <K extends keyof GameSettings>(field: K, val: GameSettings[K]) => {
    sounds.keyClick();
    setCurrent((prev) => ({ ...prev, [field]: val }));
  };

  const handleTestVoice = () => {
    speakText('Olá! Este é um teste da voz narradora do TypeHero. Ajuste a velocidade e o tom conforme sua preferência.', {
      enabled: true,
      rate: current.voiceRate,
      volume: current.voiceVolume,
      pitch: current.voicePitch,
      voiceName: current.voiceName,
    });
  };

  const handleSave = () => {
    sounds.coin();
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Configurações e Acessibilidade Inclusiva</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
          {/* Modos de Visão e Daltonismo */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-sm font-bold text-sky-400">
              <Eye className="w-4 h-4" />
              <span>Modos de Visão e Contraste</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Ajuste as cores para maior conforto ou filtros específicos para daltonismo e baixa visão:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {[
                { id: 'normal', name: '👁️ Padrão' },
                { id: 'prot', name: '🔴 Protanopia' },
                { id: 'deut', name: '🟢 Deuteranopia' },
                { id: 'trit', name: '🔵 Tritanopia' },
                { id: 'low-vision', name: '🔎 Baixa Visão' },
                { id: 'mono', name: '⚫ Monocromático' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => update('visionMode', m.id as VisionMode)}
                  className={`py-2 px-3 rounded-xl border font-bold text-left transition ${
                    current.visionMode === m.id
                      ? 'bg-sky-500 text-slate-950 border-sky-300 shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => update('highContrast', !current.highContrast)}
                className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-between transition ${
                  current.highContrast
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                <span>Alto Contraste</span>
                <span>{current.highContrast ? 'ATIVO' : 'DESATIVADO'}</span>
              </button>

              <button
                onClick={() => update('patternMode', !current.patternMode)}
                className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-between transition ${
                  current.patternMode
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                <span>Padrões e Texturas</span>
                <span>{current.patternMode ? 'ATIVO' : 'DESATIVADO'}</span>
              </button>
            </div>
          </div>

          {/* Modo de Iluminação / Tema */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-400">Tema Visual (Modo Claro & Escuro)</span>
              <span className="text-[11px] text-slate-400">
                {current.themeMode === 'light' ? '☀️ Modo Claro Ativo' : '🌙 Modo Escuro Ativo'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => update('themeMode', 'dark')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center space-x-2 transition ${
                  current.themeMode !== 'light'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                <span>🌙 Modo Escuro (Noturno)</span>
              </button>
              <button
                onClick={() => update('themeMode', 'light')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center space-x-2 transition ${
                  current.themeMode === 'light'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow font-black'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                <span>☀️ Modo Claro (Diurno)</span>
              </button>
            </div>
          </div>

          {/* Modo Apresentação / Tela Cheia */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
                <Maximize2 className="w-4 h-4" />
                <span>Modo Apresentação (Preencher a Tela Toda)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {current.presentationMode ? '🖥️ Tela Cheia Ativa' : 'Janela Normal'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Expande todo o jogo para preencher 100% da tela do computador ou projetor multimídia, ideal para aulas e apresentações.
            </p>
            <button
              type="button"
              onClick={() => update('presentationMode', !current.presentationMode)}
              className={`w-full py-2.5 px-4 rounded-xl border font-bold flex items-center justify-center space-x-2 transition ${
                current.presentationMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              {current.presentationMode ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Desativar Modo Apresentação</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  <span>Ativar Modo Apresentação (Tela Cheia)</span>
                </>
              )}
            </button>
          </div>

          {/* Tamanho de Texto - Botões Padrão A- / A / A+ */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
                <Type className="w-4 h-4" />
                <span>Tamanho da Fonte (Acessibilidade Visual)</span>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-500/30">
                {current.fontSize === 'small'
                  ? '85% (Compacto)'
                  : current.fontSize === 'normal'
                  ? '100% (Padrão)'
                  : current.fontSize === 'large'
                  ? '120% (Ampliado)'
                  : current.fontSize === 'xl'
                  ? '145% (Grande)'
                  : '170% (Máximo Extra)'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Use os botões universais abaixo para aumentar ou reduzir o tamanho das letras e elementos em toda a plataforma:
            </p>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (current.fontSize === '2xl') update('fontSize', 'xl');
                  else if (current.fontSize === 'xl') update('fontSize', 'large');
                  else if (current.fontSize === 'large') update('fontSize', 'normal');
                  else if (current.fontSize === 'normal') update('fontSize', 'small');
                }}
                disabled={current.fontSize === 'small'}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition shadow"
                title="Diminuir tamanho da fonte de todo o jogo (A-)"
              >
                <span className="text-base font-serif">A−</span>
                <span className="text-xs font-normal text-slate-300">Diminuir</span>
              </button>

              <button
                type="button"
                onClick={() => update('fontSize', 'normal')}
                className="py-3 px-5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-sm flex items-center justify-center space-x-1 active:scale-95 transition shadow"
                title="Redefinir para o tamanho padrão de fábrica (100%)"
              >
                <span className="text-sm font-serif">A</span>
                <span className="text-[11px] font-normal text-slate-400">Padrão</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (current.fontSize === 'small') update('fontSize', 'normal');
                  else if (current.fontSize === 'normal') update('fontSize', 'large');
                  else if (current.fontSize === 'large') update('fontSize', 'xl');
                  else if (current.fontSize === 'xl') update('fontSize', '2xl');
                }}
                disabled={current.fontSize === '2xl'}
                className="flex-1 py-3 px-4 rounded-xl border border-sky-500/40 bg-sky-950/60 hover:bg-sky-900 text-sky-300 font-black text-base flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition shadow"
                title="Aumentar tamanho da fonte de todo o jogo (A+)"
              >
                <span className="text-lg font-serif">A+</span>
                <span className="text-xs font-normal text-slate-300">Aumentar</span>
              </button>
            </div>
          </div>

          {/* Sons e Efeitos Sonoros */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-bold text-emerald-400">
                <Volume2 className="w-4 h-4" />
                <span>Efeitos Sonoros do Jogo</span>
              </div>
              <button
                onClick={() => update('sound', !current.sound)}
                className={`px-3 py-1 rounded-lg font-bold border transition ${
                  current.sound
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {current.sound ? 'LIGADO' : 'MUTADO'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Volume dos Efeitos:</span>
                <b>{Math.round(current.soundVolume * 100)}%</b>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={current.soundVolume}
                onChange={(e) => update('soundVolume', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Narração por Voz (TTS) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-purple-400">Narração e Leitor de Instruções</span>
              <button
                onClick={handleTestVoice}
                className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-lg border border-purple-600/50 font-bold transition"
              >
                🎙️ Testar Voz
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Voz em Português:</label>
              <select
                value={current.voiceName}
                onChange={(e) => update('voiceName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-semibold focus:outline-none"
              >
                <option value="">Voz padrão do sistema (Português)</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Velocidade da Fala:</span>
                <b>{current.voiceRate.toFixed(1)}x</b>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={current.voiceRate}
                onChange={(e) => update('voiceRate', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-xs shadow-lg transition"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Preferências</span>
          </button>
        </div>
      </div>
    </div>
  );
};
