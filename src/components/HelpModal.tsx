import React from 'react';
import { X, Hand, Mouse, Keyboard, Sparkles, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⌨️</span>
            <div>
              <h2 className="text-lg font-bold text-white">Guia Prático de Digitação & Utilização do Mouse</h2>
              <p className="text-[11px] text-slate-400">
                Técnicas de toque ágil com os 10 dedos, precisão do mouse e ergonomia de mãos e punhos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
          {/* Ergonomia Direta das Mãos, Punhos e Dedos */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-extrabold text-amber-400 flex items-center space-x-2">
              <Hand className="w-4 h-4 text-amber-400" />
              <span>Ergonomia Prática das Mãos, Punhos e Dedos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <span className="text-base">🤲</span>
                  <span>1. Punhos Retos e Alinhados</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Mantenha os punhos em linha reta com os antebraços enquanto digita. Evite dobrar o pulso para cima ou pressioná-lo contra a quina da mesa.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <span className="text-base">🎹</span>
                  <span>2. Toque Macio e Elástico</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Tecle com suavidade, como em um piano clássico. Deixe os dedos tocarem e subirem rapidamente, sem aplicar força excessiva nas teclas.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <Mouse className="w-4 h-4 text-sky-400" />
                  <span>3. Empunhadura Leve do Mouse</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Apoie a palma suavemente sobre o mouse sem apertar suas laterais. Conduza o mouse deslizando com o antebraço em vez de torcer o punho bruscamente.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <span className="text-base">🖱️</span>
                  <span>4. Posição dos Dedos no Mouse</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  O dedo indicador repousa sobre o botão esquerdo e o dedo médio sobre o botão direito. A rodinha do scroll é acionada com toque suave pelo indicador ou médio.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <span className="text-base">🎯</span>
                  <span>5. Curvatura Natural dos Dedos</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Curve os dedos levemente como se estivesse segurando uma pequena esfera imaginária. Toque as teclas com as pontas e almofadas dos dedos.
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <span className="text-base">✨</span>
                  <span>6. Microrrelaxamento das Mãos</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Entre exercícios de digitação veloz, solte as mãos, abra e feche os dedos suavemente para manter a circulação fluida e os tendões relaxados.
                </p>
              </div>
            </div>
          </div>

          {/* Posicionamento dos 10 Dedos na Linha-Base */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-extrabold text-sky-400 flex items-center space-x-2">
              <Keyboard className="w-4 h-4 text-sky-400" />
              <span>Posição Inicial dos 10 Dedos na Linha-Base (ASDF - JKLÇ)</span>
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              O teclado ABNT2 possui pequenas elevações táteis nas teclas <b>F</b> e <b>J</b>. Use-as como referência tátil sem olhar: coloque o indicador esquerdo no <b>F</b> e o direito no <b>J</b>. Seus outros dedos repousam naturalmente sobre <b>A S D</b> e <b>K L Ç</b>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <b className="text-rose-400">Mão Esquerda:</b>
                <div className="text-slate-300">
                  Mínimo no <b>A</b> · Anular no <b>S</b> · Médio no <b>D</b> · Indicador no <b>F</b> (e estende ao <b>G</b>). Polegar na barra de espaço.
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <b className="text-sky-400">Mão Direita:</b>
                <div className="text-slate-300">
                  Indicador no <b>J</b> (e estende ao <b>H</b>) · Médio no <b>K</b> · Anular no <b>L</b> · Mínimo no <b>Ç</b>. Polegar na barra de espaço.
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Jogo */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-sm font-extrabold text-emerald-400">🎮 Navegação no Jogo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <b>WASD ou Setas:</b> Movimentar o personagem pelo mapa.
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <b>Barra de Espaço:</b> Interagir com a ilha próxima.
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <b>Clique do Mouse:</b> Selecionar ilhas ou alvos nas atividades.
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition"
          >
            Praticar Agora!
          </button>
        </div>
      </div>
    </div>
  );
};
