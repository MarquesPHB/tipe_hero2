import React, { useState, useEffect } from 'react';
import { sounds } from '../../audio/soundEngine';
import confetti from 'canvas-confetti';
import { Music, Sparkles, Trophy, Play, CheckCircle2 } from 'lucide-react';

interface MusicalKeyboardActivityProps {
  onComplete: (score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }) => void;
}

interface KeyNote {
  note: string;
  name: string;
  keyChar: string;
  freq: number;
  isBlack?: boolean;
  color: string;
}

const PIANO_KEYS: KeyNote[] = [
  { note: 'C4', name: 'Dó', keyChar: 'A', freq: 261.63, color: 'from-rose-500 to-pink-500' },
  { note: 'C#4', name: 'Dó#', keyChar: 'W', freq: 277.18, isBlack: true, color: 'from-slate-800 to-slate-900' },
  { note: 'D4', name: 'Ré', keyChar: 'S', freq: 293.66, color: 'from-amber-500 to-orange-500' },
  { note: 'D#4', name: 'Ré#', keyChar: 'E', freq: 311.13, isBlack: true, color: 'from-slate-800 to-slate-900' },
  { note: 'E4', name: 'Mi', keyChar: 'D', freq: 329.63, color: 'from-yellow-400 to-amber-400' },
  { note: 'F4', name: 'Fá', keyChar: 'F', freq: 349.23, color: 'from-emerald-500 to-green-500' },
  { note: 'F#4', name: 'Fá#', keyChar: 'T', freq: 369.99, isBlack: true, color: 'from-slate-800 to-slate-900' },
  { note: 'G4', name: 'Sol', keyChar: 'G', freq: 392.0, color: 'from-sky-500 to-cyan-500' },
  { note: 'G#4', name: 'Sol#', keyChar: 'Y', freq: 415.3, isBlack: true, color: 'from-slate-800 to-slate-900' },
  { note: 'A4', name: 'Lá', keyChar: 'H', freq: 440.0, color: 'from-indigo-500 to-blue-500' },
  { note: 'A#4', name: 'Lá#', keyChar: 'U', freq: 466.16, isBlack: true, color: 'from-slate-800 to-slate-900' },
  { note: 'B4', name: 'Si', keyChar: 'J', freq: 493.88, color: 'from-purple-500 to-indigo-500' },
  { note: 'C5', name: 'Dó+', keyChar: 'K', freq: 523.25, color: 'from-pink-500 to-rose-500' },
];

// Simple melody: "Dó-Ré-Mi-Fá"
// Dó, Ré, Mi, Fá, Fá, Fá, Dó, Ré, Dó, Ré, Ré, Ré...
const SONG_NOTES = ['A', 'S', 'D', 'F', 'F', 'F', 'A', 'S', 'A', 'S', 'S', 'S'];

export const MusicalKeyboardActivity: React.FC<MusicalKeyboardActivityProps> = ({ onComplete }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [songStep, setSongStep] = useState(0);
  const [totalNotesPlayed, setTotalNotesPlayed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const nextExpectedKey = SONG_NOTES[songStep];

  const playNoteByKey = (keyChar: string) => {
    const keyData = PIANO_KEYS.find((k) => k.keyChar.toUpperCase() === keyChar.toUpperCase());
    if (!keyData) return;

    sounds.playPianoNote(keyData.freq, 0.45);
    setActiveKey(keyData.keyChar);
    setTimeout(() => setActiveKey(null), 250);

    const newTotal = totalNotesPlayed + 1;
    setTotalNotesPlayed(newTotal);

    // Song progression
    if (keyData.keyChar.toUpperCase() === nextExpectedKey) {
      const nextStep = songStep + 1;
      setSongStep(nextStep);

      if (nextStep >= SONG_NOTES.length && !isFinished) {
        setIsFinished(true);
        sounds.victoryFanfare();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

        setTimeout(() => {
          onComplete({
            wpm: 38,
            accuracy: 99,
            errors: 0,
            rewardXp: 85,
            rewardCoins: 55,
          });
        }, 1500);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyUpper = e.key.toUpperCase();
      const match = PIANO_KEYS.find((k) => k.keyChar === keyUpper);
      if (match) {
        e.preventDefault();
        playNoteByKey(keyUpper);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [songStep, isFinished]);

  const whiteKeys = PIANO_KEYS.filter((k) => !k.isBlack);

  return (
    <div className="flex flex-col items-center space-y-4 select-none w-full max-w-3xl mx-auto">
      {/* Top Header Card */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎹</span>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              Teclado Musical: Sinfonia dos Dedos
              <span className="text-xs font-normal text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-500/30">
                Canção: {songStep} de {SONG_NOTES.length} notas
              </span>
            </h3>
            <p className="text-xs text-slate-300">Toque as teclas indicadas na linha-base A, S, D, F, G, H, J, K!</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-xl">
          <Music className="w-4 h-4" />
          <span>Notas tocadas: {totalNotesPlayed}</span>
        </div>
      </div>

      {/* Melody Guide Track */}
      <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex flex-col items-center space-y-2">
        <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
          <span>Melodia: "Dó-Ré-Mi-Fá"</span>
          <span className="text-slate-500">• Toque a tecla brilhante</span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {SONG_NOTES.map((kChar, idx) => {
            const isCurrent = idx === songStep;
            const isDone = idx < songStep;
            const noteObj = PIANO_KEYS.find((pk) => pk.keyChar === kChar);

            return (
              <div
                key={idx}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 scale-110 shadow-[0_0_12px_#fbbf24] animate-bounce'
                    : isDone
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {noteObj?.name || kChar} ({kChar})
              </div>
            );
          })}
        </div>
      </div>

      {/* The Piano Keyboard Component */}
      <div className="relative w-full bg-slate-950 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex justify-center">
        {/* White Keys Container */}
        <div className="relative flex justify-center space-x-1 sm:space-x-2 bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-inner">
          {whiteKeys.map((key) => {
            const isCurrentInSong = key.keyChar === nextExpectedKey && !isFinished;
            const isPressed = activeKey === key.keyChar;

            return (
              <button
                key={key.note}
                onClick={() => playNoteByKey(key.keyChar)}
                className={`relative w-12 sm:w-16 h-48 sm:h-56 rounded-b-xl flex flex-col justify-end items-center pb-3 font-bold transition-all shadow-md active:translate-y-1 ${
                  isPressed
                    ? 'bg-amber-300 text-slate-950 scale-95 shadow-[0_0_20px_#fbbf24]'
                    : isCurrentInSong
                    ? 'bg-sky-100 border-2 border-sky-400 text-sky-950 shadow-[0_0_15px_#38bdf8]'
                    : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300'
                }`}
              >
                <span className="text-xs font-black text-slate-500 mb-0.5">{key.note}</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-900">{key.name}</span>
                <span className="text-xs font-mono font-black text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md mt-1">
                  [{key.keyChar}]
                </span>

                {isCurrentInSong && (
                  <div className="absolute top-2 w-3 h-3 rounded-full bg-sky-500 animate-ping" />
                )}
              </button>
            );
          })}

          {/* Black Keys Positioned Absolutely */}
          {/* Note: In octave C-D-E-F-G-A-B, black keys are at C#(1), D#(2), F#(4), G#(5), A#(6) */}
          <div className="absolute top-3 sm:top-4 inset-x-0 flex justify-center pointer-events-none px-3 sm:px-4">
            <div className="relative flex space-x-1 sm:space-x-2">
              {/* C#4 */}
              <button
                onClick={() => playNoteByKey('W')}
                className={`pointer-events-auto absolute left-9 sm:left-12 w-8 sm:w-10 h-28 sm:h-32 bg-slate-900 border-x border-b border-slate-700 rounded-b-lg flex flex-col justify-end items-center pb-2 z-10 transition-all ${
                  activeKey === 'W' ? 'bg-amber-500 scale-95 shadow-[0_0_12px_#f59e0b]' : 'hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-white">Dó#</span>
                <span className="text-[9px] font-mono text-slate-400">[W]</span>
              </button>

              {/* D#4 */}
              <button
                onClick={() => playNoteByKey('E')}
                className={`pointer-events-auto absolute left-22 sm:left-30 w-8 sm:w-10 h-28 sm:h-32 bg-slate-900 border-x border-b border-slate-700 rounded-b-lg flex flex-col justify-end items-center pb-2 z-10 transition-all ${
                  activeKey === 'E' ? 'bg-amber-500 scale-95 shadow-[0_0_12px_#f59e0b]' : 'hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-white">Ré#</span>
                <span className="text-[9px] font-mono text-slate-400">[E]</span>
              </button>

              {/* F#4 */}
              <button
                onClick={() => playNoteByKey('T')}
                className={`pointer-events-auto absolute left-48 sm:left-66 w-8 sm:w-10 h-28 sm:h-32 bg-slate-900 border-x border-b border-slate-700 rounded-b-lg flex flex-col justify-end items-center pb-2 z-10 transition-all ${
                  activeKey === 'T' ? 'bg-amber-500 scale-95 shadow-[0_0_12px_#f59e0b]' : 'hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-white">Fá#</span>
                <span className="text-[9px] font-mono text-slate-400">[T]</span>
              </button>

              {/* G#4 */}
              <button
                onClick={() => playNoteByKey('Y')}
                className={`pointer-events-auto absolute left-61 sm:left-84 w-8 sm:w-10 h-28 sm:h-32 bg-slate-900 border-x border-b border-slate-700 rounded-b-lg flex flex-col justify-end items-center pb-2 z-10 transition-all ${
                  activeKey === 'Y' ? 'bg-amber-500 scale-95 shadow-[0_0_12px_#f59e0b]' : 'hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-white">Sol#</span>
                <span className="text-[9px] font-mono text-slate-400">[Y]</span>
              </button>

              {/* A#4 */}
              <button
                onClick={() => playNoteByKey('U')}
                className={`pointer-events-auto absolute left-74 sm:left-102 w-8 sm:w-10 h-28 sm:h-32 bg-slate-900 border-x border-b border-slate-700 rounded-b-lg flex flex-col justify-end items-center pb-2 z-10 transition-all ${
                  activeKey === 'U' ? 'bg-amber-500 scale-95 shadow-[0_0_12px_#f59e0b]' : 'hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-white">Lá#</span>
                <span className="text-[9px] font-mono text-slate-400">[U]</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ergonomic & Musical Insight */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-start space-x-3 text-xs text-slate-300 w-full">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <b className="text-amber-300">Conexão Teclado & Música:</b> Observe como os 8 dedos descansam exatamente sobre a linha-base A-S-D-F e G-H-J-K! Cada dedo é responsável por uma nota musical harmônica.
        </div>
      </div>
    </div>
  );
};
