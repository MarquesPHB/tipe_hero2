import React, { useState, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { HelpCircle, Users, Sparkles, CheckCircle2, XCircle, Trophy, SkipForward } from 'lucide-react';

interface MillionShowActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface Question {
  id: number;
  prize: string;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

const PRIZES = ['1.000', '10.000', '50.000', '100.000', '500.000', '1 MILHÃO!'];

const QUESTIONS: Question[] = [
  {
    id: 1,
    prize: 'R$ 1.000',
    question: 'Em que linha do teclado ficam localizadas as teclas-guia F e J?',
    options: [
      { key: 'A', text: 'Linha Superior (Números)' },
      { key: 'B', text: 'Linha-Base (Linha Central)' },
      { key: 'C', text: 'Linha Inferior (Barra de Espaço)' },
      { key: 'D', text: 'Teclado Numérico da Direita' },
    ],
    correct: 'B',
    explanation: 'As teclas F e J possuem pequenos relevos táteis e ficam no centro da Linha-Base!',
  },
  {
    id: 2,
    prize: 'R$ 10.000',
    question: 'Qual é o atalho universal do teclado usado para COPIAR um texto selecionado?',
    options: [
      { key: 'A', text: 'Ctrl + V' },
      { key: 'B', text: 'Ctrl + Z' },
      { key: 'C', text: 'Ctrl + C' },
      { key: 'D', text: 'Alt + F4' },
    ],
    correct: 'C',
    explanation: 'Ctrl + C copia o conteúdo para a área de transferência!',
  },
  {
    id: 3,
    prize: 'R$ 50.000',
    question: 'Qual a diferença entre a tecla BACKSPACE e a tecla DELETE?',
    options: [
      { key: 'A', text: 'Backspace apaga à esquerda e Delete apaga à frente (direita)' },
      { key: 'B', text: 'As duas fazem exatamente a mesma coisa sem nenhuma diferença' },
      { key: 'C', text: 'Delete só apaga imagens e Backspace só apaga texto' },
      { key: 'D', text: 'Backspace desliga o monitor e Delete reinicia o computador' },
    ],
    correct: 'A',
    explanation: 'Backspace apaga o caractere anterior (à esquerda); Delete apaga o caractere posterior (à direita)!',
  },
  {
    id: 4,
    prize: 'R$ 100.000',
    question: 'Qual dedo deve ser usado para pressionar a Barra de Espaço na digitação profissional?',
    options: [
      { key: 'A', text: 'Dedo indicador da mão esquerda' },
      { key: 'B', text: 'Dedo mindinho' },
      { key: 'C', text: 'Dedo polegar (direito ou esquerdo)' },
      { key: 'D', text: 'A palma inteira da mão' },
    ],
    correct: 'C',
    explanation: 'Os dois dedos polegares descansam confortavelmente sobre a barra de espaço para digitação fluida!',
  },
  {
    id: 5,
    prize: 'R$ 500.000',
    question: 'No padrão brasileiro de teclado ABNT2, qual tecla exclusiva permite digitar a letra "Ç"?',
    options: [
      { key: 'A', text: 'Não existe, é necessário digitar vírgula e letra C' },
      { key: 'B', text: 'A tecla dedicada Ç ao lado da letra L na linha-base' },
      { key: 'C', text: 'Apenas segurando a tecla Alt Gr' },
      { key: 'D', text: 'A tecla Tab' },
    ],
    correct: 'B',
    explanation: 'O teclado padrão brasileiro ABNT2 possui a tecla Ç dedicada na linha-base ao lado da letra L!',
  },
  {
    id: 6,
    prize: 'R$ 1 MILHÃO!',
    question: 'Qual é a postura correta recomendada para os pulsos durante a digitação no computador?',
    options: [
      { key: 'A', text: 'Pulsos dobrados e apoiados com força na quina da mesa' },
      { key: 'B', text: 'Pulsos retos, alinhados com o antebraço, flutuando suavemente' },
      { key: 'C', text: 'Braços cruzados sobre o teclado' },
      { key: 'D', text: 'Dedos esticados e rígidos sem flexão' },
    ],
    correct: 'B',
    explanation: 'Manter os pulsos neutros e retos evita lesões por esforço repetitivo (LER) e garante máxima agilidade!',
  },
];

export const MillionShowActivity: React.FC<MillionShowActivityProps> = ({ onComplete }) => {
  const [qIdx, setQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [eliminatedKeys, setEliminatedKeys] = useState<string[]>([]);
  const [usedCardsHelp, setUsedCardsHelp] = useState(false);
  const [usedCollegeHelp, setUsedCollegeHelp] = useState(false);
  const [usedSkipHelp, setUsedSkipHelp] = useState(false);
  const [collegeStats, setCollegeStats] = useState<string | null>(null);

  const currentQ = QUESTIONS[qIdx];

  // Physical keyboard listener for keys A, B, C, D
  useEffect(() => {
    if (isAnswerRevealed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        if (!eliminatedKeys.includes(key)) {
          handleSelect(key as 'A' | 'B' | 'C' | 'D');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qIdx, isAnswerRevealed, eliminatedKeys]);

  const handleSelect = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    setSelectedOption(optionKey);
    sounds.keyClick();
    setIsAnswerRevealed(true);

    if (optionKey === currentQ.correct) {
      setIsCorrect(true);
      sounds.coin();

      if (qIdx + 1 >= QUESTIONS.length) {
        sounds.victoryFanfare();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      }
    } else {
      setIsCorrect(false);
      sounds.errorThud();
    }
  };

  const handleNext = () => {
    if (isCorrect) {
      if (qIdx + 1 >= QUESTIONS.length) {
        // Complete the activity!
        onComplete({
          wpm: 40,
          accuracy: 100,
          errors: 0,
          rewardXp: 100,
          rewardCoins: 100,
        });
      } else {
        setQIdx((prev) => prev + 1);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
        setIsCorrect(false);
        setEliminatedKeys([]);
        setCollegeStats(null);
      }
    } else {
      // Retry question
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setIsCorrect(false);
    }
  };

  const handleUseCards = () => {
    if (usedCardsHelp || isAnswerRevealed) return;
    sounds.coin();
    setUsedCardsHelp(true);
    // Eliminate 2 wrong answers
    const wrong = currentQ.options
      .filter((o) => o.key !== currentQ.correct)
      .map((o) => o.key);
    const toEliminate = wrong.slice(0, 2);
    setEliminatedKeys(toEliminate);
  };

  const handleUseCollege = () => {
    if (usedCollegeHelp || isAnswerRevealed) return;
    sounds.coin();
    setUsedCollegeHelp(true);
    setCollegeStats(`📊 Votação dos Universitários: ${currentQ.correct}: 82% | Outras opções: 18%`);
  };

  const handleSkip = () => {
    if (usedSkipHelp || isAnswerRevealed) return;
    sounds.coin();
    setUsedSkipHelp(true);
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setEliminatedKeys([]);
      setCollegeStats(null);
    }
  };

  return (
    <div className="flex flex-col space-y-4 max-w-3xl mx-auto select-none">
      {/* Header Estilo Show do Milhão SNES */}
      <div className="bg-slate-900 border-4 border-amber-400 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 snes-bezel">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 border-2 border-amber-300 text-slate-950 flex items-center justify-center text-xl font-bold shadow">
            💰
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-amber-300 tracking-wider font-mono">
              JOGO DO MILHÃO RETRÔ 16-BIT
            </h3>
            <p className="text-xs text-slate-300">
              Pergunta {qIdx + 1} de {QUESTIONS.length}
            </p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border-2 border-amber-400 text-center shadow-lg">
          <span className="text-[10px] text-slate-400 block font-mono uppercase">Valendo</span>
          <span className="text-lg sm:text-xl font-black text-amber-400 font-mono animate-pulse">
            {currentQ.prize}
          </span>
        </div>
      </div>

      {/* Pergunta em Destaque */}
      <div className="bg-slate-950 border-4 border-indigo-500/60 rounded-3xl p-6 shadow-2xl text-center snes-bezel relative">
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold block mb-2 font-mono">
          PERGUNTA #{currentQ.id}
        </span>
        <h2 className="text-lg sm:text-xl font-black text-white leading-relaxed">
          {currentQ.question}
        </h2>

        {collegeStats && (
          <div className="mt-3 text-xs font-bold text-cyan-300 bg-cyan-950/80 p-2 rounded-xl border border-cyan-500/40 animate-in fade-in">
            {collegeStats}
          </div>
        )}
      </div>

      {/* 4 Alternativas (A, B, C, D) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt) => {
          const isEliminated = eliminatedKeys.includes(opt.key);
          const isSelected = selectedOption === opt.key;
          const isTargetCorrect = opt.key === currentQ.correct;

          let btnClass = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400 hover:bg-slate-800';

          if (isEliminated) {
            btnClass = 'bg-slate-950 border-slate-800 text-slate-600 line-through opacity-30 cursor-not-allowed';
          } else if (isAnswerRevealed) {
            if (isTargetCorrect) {
              btnClass = 'bg-emerald-600 border-emerald-300 text-white font-black shadow-[0_0_20px_#10b98188] scale-[1.02]';
            } else if (isSelected) {
              btnClass = 'bg-rose-600 border-rose-300 text-white font-black shadow-[0_0_20px_#f43f5e88]';
            } else {
              btnClass = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={opt.key}
              disabled={isEliminated || isAnswerRevealed}
              onClick={() => handleSelect(opt.key)}
              className={`p-4 rounded-2xl border-2 font-bold text-left flex items-center space-x-3.5 transition-all shadow-md active:scale-95 ${btnClass}`}
            >
              <span className="w-9 h-9 rounded-xl bg-slate-950/80 border border-current flex items-center justify-center font-mono text-sm shrink-0 font-black">
                {opt.key}
              </span>
              <span className="text-xs sm:text-sm">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Ajudas do Show do Milhão */}
      {!isAnswerRevealed && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={handleUseCollege}
            disabled={usedCollegeHelp}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-sky-500/40 bg-sky-950/50 hover:bg-sky-900 text-sky-300 text-xs font-bold disabled:opacity-40 transition shadow"
          >
            <Users className="w-4 h-4" />
            <span>Universitários</span>
          </button>

          <button
            onClick={handleUseCards}
            disabled={usedCardsHelp}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-950/50 hover:bg-amber-900 text-amber-300 text-xs font-bold disabled:opacity-40 transition shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>Cartas (Eliminar 2)</span>
          </button>

          <button
            onClick={handleSkip}
            disabled={usedSkipHelp || qIdx >= QUESTIONS.length - 1}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-purple-500/40 bg-purple-950/50 hover:bg-purple-900 text-purple-300 text-xs font-bold disabled:opacity-40 transition shadow"
          >
            <SkipForward className="w-4 h-4" />
            <span>Pular Pergunta</span>
          </button>
        </div>
      )}

      {/* Feedback & Botão Próximo / Tentar Novamente */}
      {isAnswerRevealed && (
        <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-center space-y-3 animate-in fade-in shadow-xl">
          <div className="text-xs sm:text-sm font-bold text-slate-200">
            {isCorrect ? (
              <span className="text-emerald-400">🎉 RESPOSTA CERTA! PARABÉNS!</span>
            ) : (
              <span className="text-rose-400">❌ Que pena, você errou esta!</span>
            )}
            <p className="text-xs text-slate-400 mt-1">{currentQ.explanation}</p>
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition active:scale-95 shadow-lg"
          >
            {isCorrect
              ? qIdx + 1 >= QUESTIONS.length
                ? '🏆 Resgatar 1 Milhão e Concluir!'
                : 'Próxima Pergunta ➔'
              : 'Tentar Novamente ↺'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MillionShowActivity;
