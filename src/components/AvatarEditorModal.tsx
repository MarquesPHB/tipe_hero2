import React from 'react';
import { AvatarConfig } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { sounds } from '../audio/soundEngine';
import { X, Check, Sparkles, User, Palette } from 'lucide-react';

interface AvatarEditorModalProps {
  avatar: AvatarConfig;
  onSave: (updated: AvatarConfig) => void;
  onClose: () => void;
}

const SKIN_TONES = [
  { val: '#f8d5b8', name: 'Claro' },
  { val: '#e7b98a', name: 'Dourado' },
  { val: '#c98b5d', name: 'Moreno' },
  { val: '#8d5524', name: 'Castanho' },
  { val: '#5b351f', name: 'Escuro' },
  { val: '#2f1c13', name: 'Profundo' },
];

const HAIR_COLORS = [
  { val: '#17120f', name: 'Preto' },
  { val: '#3b2416', name: 'Castanho' },
  { val: '#7a4b27', name: 'Caramelo' },
  { val: '#b56a3c', name: 'Ruivo' },
  { val: '#d6a15d', name: 'Loiro' },
  { val: '#8b5cf6', name: 'Roxo Neon' },
  { val: '#0ea5e9', name: 'Azul Cyber' },
];

const SHIRT_COLORS = [
  { val: '#10b981', name: 'Verde Esmeralda' },
  { val: '#3b82f6', name: 'Azul Real' },
  { val: '#ec4899', name: 'Rosa Vibrante' },
  { val: '#f97316', name: 'Laranja Solar' },
  { val: '#8b5cf6', name: 'Roxo Galáctico' },
  { val: '#0f172a', name: 'Grafite Noturno' },
  { val: '#06b6d4', name: 'Ciano Claro' },
  { val: '#eab308', name: 'Dourado Ouro' },
];

export const AvatarEditorModal: React.FC<AvatarEditorModalProps> = ({
  avatar,
  onSave,
  onClose,
}) => {
  const [current, setCurrent] = React.useState<AvatarConfig>({ ...avatar });

  const update = <K extends keyof AvatarConfig>(field: K, value: AvatarConfig[K]) => {
    sounds.keyClick();
    setCurrent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    sounds.coin();
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Estúdio de Avatares TypeHero</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo: Visualizador + Opções */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4">
          {/* Coluna Esquerda: Prévia Grande do Avatar */}
          <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
            <AvatarDisplay avatar={current} size={150} animate={true} />
            <span className="text-xs font-semibold text-amber-300 mt-2">Visual em tempo real</span>
          </div>

          {/* Coluna Direita: Seletores */}
          <div className="sm:col-span-2 space-y-4 text-xs">
            {/* Tom de Pele */}
            <div>
              <span className="font-bold text-slate-300 block mb-1.5">Tom de Pele:</span>
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((s) => (
                  <button
                    key={s.val}
                    onClick={() => update('skin', s.val)}
                    style={{ backgroundColor: s.val }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      current.skin === s.val ? 'border-amber-400 scale-110 shadow-md' : 'border-slate-600'
                    }`}
                    title={s.name}
                  />
                ))}
              </div>
            </div>

            {/* Estilo e Cor de Cabelo */}
            <div>
              <span className="font-bold text-slate-300 block mb-1.5">Penteado:</span>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[
                  { id: 'long', name: 'Longo' },
                  { id: 'fade', name: 'Curto/Fade' },
                  { id: 'curly', name: 'Cacheado' },
                  { id: 'braids', name: 'Tranças' },
                  { id: 'bob', name: 'Bob Reto' },
                  { id: 'spikes', name: 'Espinhos' },
                ].map((h) => (
                  <button
                    key={h.id}
                    onClick={() => update('hairStyle', h.id as AvatarConfig['hairStyle'])}
                    className={`px-2 py-1.5 rounded-lg border font-semibold text-[11px] transition ${
                      current.hairStyle === h.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {h.name}
                  </button>
                ))}
              </div>

              <span className="font-bold text-slate-300 block mb-1.5">Cor do Cabelo:</span>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map((h) => (
                  <button
                    key={h.val}
                    onClick={() => update('hair', h.val)}
                    style={{ backgroundColor: h.val }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      current.hair === h.val ? 'border-amber-400 scale-110 shadow-md' : 'border-slate-600'
                    }`}
                    title={h.name}
                  />
                ))}
              </div>
            </div>

            {/* Traje e Cor */}
            <div>
              <span className="font-bold text-slate-300 block mb-1.5">Modelo do Traje:</span>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {[
                  { id: 'hoodie', name: 'Moletom com Capuz' },
                  { id: 'jacket', name: 'Jaqueta Bomber' },
                  { id: 'tech', name: 'Traje Cibernético' },
                  { id: 'shirt', name: 'Camiseta Básica' },
                ].map((o) => (
                  <button
                    key={o.id}
                    onClick={() => update('outfit', o.id as AvatarConfig['outfit'])}
                    className={`px-2 py-1.5 rounded-lg border font-semibold text-[11px] transition ${
                      current.outfit === o.id
                        ? 'bg-sky-500 text-slate-950 border-sky-300 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {o.name}
                  </button>
                ))}
              </div>

              <span className="font-bold text-slate-300 block mb-1.5">Cor da Roupa:</span>
              <div className="flex flex-wrap gap-2">
                {SHIRT_COLORS.map((c) => (
                  <button
                    key={c.val}
                    onClick={() => update('shirt', c.val)}
                    style={{ backgroundColor: c.val }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      current.shirt === c.val ? 'border-white scale-110 shadow-md' : 'border-slate-600'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Acessórios Profissionais */}
            <div>
              <span className="font-bold text-slate-300 block mb-1.5">Acessório:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'headset', name: '🎧 Headset' },
                  { id: 'glasses', name: '👓 Óculos' },
                  { id: 'cap', name: '🧢 Boné' },
                  { id: 'visor', name: '🥽 Visor Cyber' },
                  { id: 'badge', name: '⭐ Broche' },
                  { id: 'earrings', name: '💎 Brincos' },
                  { id: 'none', name: 'Nenhum' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => update('accessory', a.id as AvatarConfig['accessory'])}
                    className={`px-2 py-1.5 rounded-lg border font-semibold text-[11px] transition ${
                      current.accessory === a.id
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg transition"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Meu Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
