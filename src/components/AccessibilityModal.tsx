import React, { useState, useEffect } from 'react';
import { GameSettings, VisionMode, FontSize } from '../types';
import { sounds } from '../audio/soundEngine';
import { speakText, getPtBRVoices } from '../speech/tts';
import { X, Sliders, Volume2, Eye, Type, Zap, Check } from 'lucide-react';

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

          {/* Tamanho de Texto */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
              <Type className="w-4 h-4" />
              <span>Tamanho do Texto</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'small', label: 'Pequeno' },
                { id: 'normal', label: 'Normal' },
                { id: 'large', label: 'Grande' },
                { id: 'xl', label: 'Muito Grande' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => update('fontSize', f.id as FontSize)}
                  className={`py-2 rounded-xl border font-bold text-center transition ${
                    current.fontSize === f.id
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
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
