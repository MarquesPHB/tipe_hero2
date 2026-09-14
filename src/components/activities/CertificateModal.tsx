import React, { useState } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Award, Printer, Download, CheckCircle, Sparkles } from 'lucide-react';

interface CertificateModalProps {
  wpm: number;
  accuracy: number;
  initialName?: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  wpm,
  accuracy,
  initialName = 'Aluno TypeHero',
  onClose,
}) => {
  const [name, setName] = useState(initialName);
  const [issued, setIssued] = useState(false);

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIssued(true);
    sounds.victoryFanfare();
    confetti({ particleCount: 120, spread: 90 });
  };

  const handlePrint = () => {
    sounds.mouseClick();
    window.print();
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-2xl mx-auto">
      {!issued ? (
        <form onSubmit={handleIssue} className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl mx-auto">
            🎓
          </div>
          <h3 className="text-xl font-bold text-white">Parabéns pela Conclusão do Curso!</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Você completou a jornada pedagógica do TypeHero World, dominando o mouse, o teclado ABNT2, a linha-base e a acentuação brasileira. Digite seu nome completo para emitir seu Certificado Oficial:
          </p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-xl bg-slate-950 border-2 border-amber-400/60 text-amber-200 font-bold text-lg text-center focus:outline-none focus:border-amber-300"
            placeholder="Digite seu nome completo aqui..."
            required
          />

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-lg active:scale-95 transition"
          >
            GERAR MEU CERTIFICADO
          </button>
        </form>
      ) : (
        <div className="w-full space-y-4">
          {/* Certificado Estilizado para Impressão */}
          <div
            id="print-certificate"
            className="relative bg-gradient-to-br from-amber-50 via-white to-amber-100/60 text-slate-900 p-8 sm:p-10 rounded-2xl border-8 border-double border-amber-600 shadow-2xl overflow-hidden select-none"
          >
            {/* Brasão Dourado de Fundo */}
            <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none text-9xl">
              🏆
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-3xl">⌨️</span>
                <span className="text-xs tracking-[0.25em] font-extrabold uppercase text-amber-900">
                  ACADEMIA TYPEHERO DE DESTREZA DIGITAL
                </span>
                <span className="text-3xl">🖱️</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 border-b-2 border-amber-500/50 pb-2">
                CERTIFICADO DE MÉRITO PEDAGÓGICO
              </h2>

              <p className="text-xs uppercase text-slate-600 tracking-wider">
                Certificamos com louvor que
              </p>

              <div className="text-2xl sm:text-4xl font-extrabold text-amber-950 underline decoration-amber-500 decoration-wavy underline-offset-8 py-2">
                {name}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto">
                completou com êxito todas as etapas de <b>Alfabetização Digital, Ergonomia, Domínio do Mouse e Digitação ABNT2 com os 10 Dedos</b>, atingindo excelente destreza motora, velocidade e postura correta.
              </p>

              {/* Métricas Conquistadas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 max-w-md mx-auto">
                <div className="bg-amber-100/80 border border-amber-300 p-2.5 rounded-lg text-center">
                  <div className="text-[10px] text-amber-800 font-semibold uppercase">Velocidade Final</div>
                  <div className="text-xl font-black text-amber-950">{wpm || 35} WPM</div>
                </div>
                <div className="bg-emerald-100/80 border border-emerald-300 p-2.5 rounded-lg text-center">
                  <div className="text-[10px] text-emerald-800 font-semibold uppercase">Precisão Média</div>
                  <div className="text-xl font-black text-emerald-950">{accuracy || 98}%</div>
                </div>
                <div className="bg-sky-100/80 border border-sky-300 p-2.5 rounded-lg text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-sky-800 font-semibold uppercase">Status</div>
                  <div className="text-sm font-black text-sky-950">Aprovado ✓</div>
                </div>
              </div>

              {/* Selo e Assinaturas */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-300 text-xs">
                <div className="text-left space-y-1">
                  <div className="w-28 border-b border-slate-500" />
                  <span className="font-bold text-[11px] text-slate-800">Profª Maya & Mestre Byte</span>
                  <div className="text-[9px] text-slate-500">Coordenação de Informática Básica</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-md flex items-center justify-center text-slate-950 font-bold text-center text-[10px] uppercase leading-tight">
                    Selo de<br />Excelência
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="w-28 border-b border-slate-500 ml-auto" />
                  <span className="font-bold text-[11px] text-slate-800">Mestre Hero</span>
                  <div className="text-[9px] text-slate-500">Chanceler TypeHero World</div>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-600 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
