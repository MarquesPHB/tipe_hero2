import React from 'react';

interface VirtualABNT2KeyboardProps {
  activeKey?: string;
  suggestedFinger?: string;
  pressedKeys?: Set<string>;
}

interface KeyData {
  label: string;
  shiftLabel?: string;
  finger: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';
  width?: string;
  code?: string;
}

export const VirtualABNT2Keyboard: React.FC<VirtualABNT2KeyboardProps> = ({
  activeKey = '',
  suggestedFinger = '',
  pressedKeys = new Set(),
}) => {
  const fingerColors: Record<string, { bg: string; border: string; text: string; name: string }> = {
    'left-pinky': { bg: 'bg-rose-950/40', border: 'border-rose-500/50', text: 'text-rose-300', name: 'Mínimo Esq.' },
    'left-ring': { bg: 'bg-amber-950/40', border: 'border-amber-500/50', text: 'text-amber-300', name: 'Anular Esq.' },
    'left-middle': { bg: 'bg-emerald-950/40', border: 'border-emerald-500/50', text: 'text-emerald-300', name: 'Médio Esq.' },
    'left-index': { bg: 'bg-sky-950/40', border: 'border-sky-500/50', text: 'text-sky-300', name: 'Indicador Esq.' },
    'right-index': { bg: 'bg-cyan-950/40', border: 'border-cyan-500/50', text: 'text-cyan-300', name: 'Indicador Dir.' },
    'right-middle': { bg: 'bg-emerald-950/40', border: 'border-emerald-500/50', text: 'text-emerald-300', name: 'Médio Dir.' },
    'right-ring': { bg: 'bg-amber-950/40', border: 'border-amber-500/50', text: 'text-amber-300', name: 'Anular Dir.' },
    'right-pinky': { bg: 'bg-purple-950/40', border: 'border-purple-500/50', text: 'text-purple-300', name: 'Mínimo Dir.' },
    thumb: { bg: 'bg-indigo-950/40', border: 'border-indigo-500/50', text: 'text-indigo-300', name: 'Polegares' },
  };

  const rows: KeyData[][] = [
    // Fileira dos Números (4ª fileira)
    [
      { label: '\'', shiftLabel: '"', finger: 'left-pinky' },
      { label: '1', shiftLabel: '!', finger: 'left-pinky' },
      { label: '2', shiftLabel: '@', finger: 'left-ring' },
      { label: '3', shiftLabel: '#', finger: 'left-middle' },
      { label: '4', shiftLabel: '$', finger: 'left-index' },
      { label: '5', shiftLabel: '%', finger: 'left-index' },
      { label: '6', shiftLabel: '¨', finger: 'right-index' },
      { label: '7', shiftLabel: '&', finger: 'right-index' },
      { label: '8', shiftLabel: '*', finger: 'right-middle' },
      { label: '9', shiftLabel: '(', finger: 'right-ring' },
      { label: '0', shiftLabel: ')', finger: 'right-pinky' },
      { label: '-', shiftLabel: '_', finger: 'right-pinky' },
      { label: '=', shiftLabel: '+', finger: 'right-pinky' },
      { label: 'Backspace', finger: 'right-pinky', width: 'w-20' },
    ],
    // Fileira Superior (3ª fileira)
    [
      { label: 'Tab', finger: 'left-pinky', width: 'w-14' },
      { label: 'Q', finger: 'left-pinky' },
      { label: 'W', finger: 'left-ring' },
      { label: 'E', finger: 'left-middle' },
      { label: 'R', finger: 'left-index' },
      { label: 'T', finger: 'left-index' },
      { label: 'Y', finger: 'right-index' },
      { label: 'U', finger: 'right-index' },
      { label: 'I', finger: 'right-middle' },
      { label: 'O', finger: 'right-ring' },
      { label: 'P', finger: 'right-pinky' },
      { label: '´', shiftLabel: '`', finger: 'right-pinky' },
      { label: '[', shiftLabel: '{', finger: 'right-pinky' },
      { label: 'Enter', finger: 'right-pinky', width: 'w-16' },
    ],
    // Linha-Base (2ª fileira)
    [
      { label: 'Caps', finger: 'left-pinky', width: 'w-16' },
      { label: 'A', finger: 'left-pinky' },
      { label: 'S', finger: 'left-ring' },
      { label: 'D', finger: 'left-middle' },
      { label: 'F', finger: 'left-index' }, // nub
      { label: 'G', finger: 'left-index' },
      { label: 'H', finger: 'right-index' },
      { label: 'J', finger: 'right-index' }, // nub
      { label: 'K', finger: 'right-middle' },
      { label: 'L', finger: 'right-ring' },
      { label: 'Ç', finger: 'right-pinky' },
      { label: '~', shiftLabel: '^', finger: 'right-pinky' },
      { label: ']', shiftLabel: '}', finger: 'right-pinky' },
    ],
    // Fileira Inferior (1ª fileira)
    [
      { label: 'Shift', finger: 'left-pinky', width: 'w-20' },
      { label: '\\', shiftLabel: '|', finger: 'left-pinky' },
      { label: 'Z', finger: 'left-pinky' },
      { label: 'X', finger: 'left-ring' },
      { label: 'C', finger: 'left-middle' },
      { label: 'V', finger: 'left-index' },
      { label: 'B', finger: 'left-index' },
      { label: 'N', finger: 'right-index' },
      { label: 'M', finger: 'right-middle' },
      { label: ',', shiftLabel: '<', finger: 'right-middle' },
      { label: '.', shiftLabel: '>', finger: 'right-ring' },
      { label: ';', shiftLabel: ':', finger: 'right-pinky' },
      { label: '/', shiftLabel: '?', finger: 'right-pinky' },
      { label: 'Shift', finger: 'right-pinky', width: 'w-16' },
    ],
    // Barra de Espaço e Modificadores
    [
      { label: 'Ctrl', finger: 'left-pinky', width: 'w-14' },
      { label: 'Alt', finger: 'thumb', width: 'w-14' },
      { label: 'Espaço', finger: 'thumb', width: 'flex-1 max-w-md' },
      { label: 'AltGr', finger: 'thumb', width: 'w-16' },
      { label: 'Ctrl', finger: 'right-pinky', width: 'w-14' },
    ],
  ];

  const cleanActive = (activeKey || '').toUpperCase();

  return (
    <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto select-none">
      {/* Legenda de dedos */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-semibold">Cores por Dedo (ABNT2):</span>
          {Object.entries(fingerColors).map(([key, item]) => (
            <span
              key={key}
              className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${item.bg} ${item.border} ${item.text}`}
            >
              {item.name}
            </span>
          ))}
        </div>
        {suggestedFinger && (
          <div className="bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/40 font-bold text-xs">
            👉 Dedo recomendado: {suggestedFinger}
          </div>
        )}
      </div>

      {/* Grid do teclado */}
      <div className="space-y-1.5 min-w-[620px]">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 justify-center">
            {row.map((k, kIdx) => {
              const isTarget =
                cleanActive === k.label.toUpperCase() ||
                (k.shiftLabel && cleanActive === k.shiftLabel.toUpperCase()) ||
                (cleanActive === ' ' && k.label === 'Espaço');
              const isPressed = pressedKeys.has(k.label.toLowerCase()) || (k.label === 'Espaço' && pressedKeys.has(' '));
              const fingerInfo = fingerColors[k.finger];
              const isTactileNub = k.label === 'F' || k.label === 'J';

              return (
                <div
                  key={kIdx}
                  className={`relative flex flex-col items-center justify-center p-1 rounded-lg border text-xs font-bold transition-all ${
                    k.width || 'w-10'
                  } h-11 ${
                    isTarget
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_#f59e0b] scale-105 z-10 animate-pulse'
                      : isPressed
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-95'
                      : `${fingerInfo.bg} ${fingerInfo.border} text-slate-200 hover:border-slate-400`
                  }`}
                >
                  {k.shiftLabel && (
                    <span className="text-[10px] opacity-70 leading-none">{k.shiftLabel}</span>
                  )}
                  <span className="leading-tight">{k.label}</span>

                  {/* Relevo tátil de referência para os dedos indicadores em F e J */}
                  {isTactileNub && (
                    <div className="absolute bottom-1 w-3 h-0.5 bg-amber-400 rounded-full" title="Marca tátil para indicador" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
