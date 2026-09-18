import React, { useState, useEffect } from 'react';
import { IslandDef, ActivityDef } from '../types';
import { sounds } from '../audio/soundEngine';
import { speakText } from '../speech/tts';
import { X, CheckCircle, Play, Volume2, HelpCircle, BookOpen } from 'lucide-react';
import { MouseMazeActivity } from './activities/MouseMazeActivity';
import { BackspaceWorkshopActivity } from './activities/BackspaceWorkshopActivity';
import { ShiftCapsLabActivity } from './activities/ShiftCapsLabActivity';
import { ArrowPilotActivity } from './activities/ArrowPilotActivity';
import { AsdfGardenActivity } from './activities/AsdfGardenActivity';
import { GenericTypingActivity } from './activities/GenericTypingActivity';
import { TargetClickActivity } from './activities/TargetClickActivity';
import { NitroRaceActivity } from './activities/NitroRaceActivity';
import { MouseScrollActivity } from './activities/MouseScrollActivity';
import { MouseDragDropActivity } from './activities/MouseDragDropActivity';
import { MouseReflexActivity } from './activities/MouseReflexActivity';
import { BubbleTetrisActivity } from './activities/BubbleTetrisActivity';
import { CertificateModal } from './activities/CertificateModal';
import { CrosswordActivity } from './activities/CrosswordActivity';
import { ConnectDotsActivity } from './activities/ConnectDotsActivity';
import { MemoryGameActivity } from './activities/MemoryGameActivity';
import { SnakeGameActivity } from './activities/SnakeGameActivity';
import { MusicalKeyboardActivity } from './activities/MusicalKeyboardActivity';
import { PacManActivity } from './activities/PacManActivity';
import { RingTossActivity } from './activities/RingTossActivity';
import { MotoGameActivity } from './activities/MotoGameActivity';
import { MakeupActivity } from './activities/MakeupActivity';
import { RoomDecorActivity } from './activities/RoomDecorActivity';
import { PenaltyKickActivity } from './activities/PenaltyKickActivity';
import { BasketballActivity } from './activities/BasketballActivity';
import { TennisActivity } from './activities/TennisActivity';
import { RobotLegoActivity } from './activities/RobotLegoActivity';
import { WordSearchActivity } from './activities/WordSearchActivity';
import { MillionShowActivity } from './activities/MillionShowActivity';
import { MarioKongPlatformerActivity } from './activities/MarioKongPlatformerActivity';

interface MissionIslandModalProps {
  island: IslandDef;
  activitiesDone: boolean[];
  playerWpm: number;
  playerAccuracy: number;
  isPresentation?: boolean;
  initialActivityIdx?: number | null;
  onClose: () => void;
  onActivityComplete: (
    activityIdx: number,
    score: {
      wpm: number;
      accuracy: number;
      errors: number;
      rewardXp: number;
      rewardCoins: number;
      missedKeys?: string[];
    }
  ) => void;
}

export const MissionIslandModal: React.FC<MissionIslandModalProps> = ({
  island,
  activitiesDone,
  playerWpm,
  playerAccuracy,
  isPresentation = false,
  initialActivityIdx = null,
  onClose,
  onActivityComplete,
}) => {
  const [activeActivityIdx, setActiveActivityIdx] = useState<number | null>(initialActivityIdx);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (initialActivityIdx !== undefined && initialActivityIdx !== null && island.activities[initialActivityIdx]) {
      setActiveActivityIdx(initialActivityIdx);
      const act = island.activities[initialActivityIdx];
      speakText(`${act.title}. ${act.guide.objective}`);
    }
  }, [initialActivityIdx, island]);

  const handleStartActivity = (idx: number) => {
    sounds.keyClick();
    setActiveActivityIdx(idx);
    const act = island.activities[idx];
    speakText(`${act.title}. ${act.guide.objective}`);
  };

  const handleFinish = (score: {
    wpm: number;
    accuracy: number;
    errors: number;
    rewardXp: number;
    rewardCoins: number;
    missedKeys?: string[];
  }) => {
    if (activeActivityIdx === null) return;
    onActivityComplete(activeActivityIdx, score);
    setActiveActivityIdx(null);
  };

  const currentAct: ActivityDef | null = activeActivityIdx !== null ? island.activities[activeActivityIdx] : null;

  // Renderizador específico de atividade com base no tipo
  const renderActivityContent = () => {
    if (!currentAct || activeActivityIdx === null) return null;

    if (currentAct.id === 'cert-issue-certificate') {
      return (
        <CertificateModal
          wpm={playerWpm}
          accuracy={playerAccuracy}
          onClose={() => {
            handleFinish({ wpm: playerWpm, accuracy: playerAccuracy, errors: 0, rewardXp: 150, rewardCoins: 150 });
          }}
        />
      );
    }

    if (currentAct.type === 'mouse-maze') {
      return <MouseMazeActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'backspace-workshop') {
      return <BackspaceWorkshopActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'shift-caps-lab') {
      return <ShiftCapsLabActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'arrow-pilot') {
      return <ArrowPilotActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'asdf-garden') {
      return <AsdfGardenActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'nitro-race') {
      return <NitroRaceActivity targetText={currentAct.targetText} onComplete={handleFinish} />;
    }
    if (currentAct.type === 'target') {
      return <TargetClickActivity mode="simple" onComplete={handleFinish} />;
    }
    if (currentAct.type === 'double-click') {
      return <TargetClickActivity mode="double" onComplete={handleFinish} />;
    }
    if (currentAct.type === 'right-click') {
      return <TargetClickActivity mode="right" onComplete={handleFinish} />;
    }
    if (currentAct.type === 'scroll' || (currentAct.type as string) === 'mouse-scroll') {
      return <MouseScrollActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'drag-drop' || (currentAct.type as string) === 'mouse-drag') {
      return <MouseDragDropActivity onComplete={handleFinish} />;
    }
    if ((currentAct.type as string) === 'mouse-reflex') {
      return <MouseReflexActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'bubble-tetris') {
      const pool = currentAct.targetText
        ? Array.from(new Set(currentAct.targetText.toLowerCase().replace(/[^a-zá-úãõç0-9]/g, ''))).slice(0, 10)
        : ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ç'];
      return (
        <BubbleTetrisActivity
          title={currentAct.title}
          charPool={pool.length > 0 ? pool : ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ç']}
          targetPops={16}
          onComplete={handleFinish}
        />
      );
    }
    if (currentAct.type === 'crossword') {
      return <CrosswordActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'connect-dots') {
      return <ConnectDotsActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'memory-game') {
      return <MemoryGameActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'snake-game') {
      return <SnakeGameActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'musical-keyboard') {
      return <MusicalKeyboardActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'pac-man') {
      return <PacManActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'ring-toss') {
      return <RingTossActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'moto-game') {
      return <MotoGameActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'makeup' || currentAct.type === 'makeup-game') {
      return <MakeupActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'room-decor') {
      return <RoomDecorActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'penalty-kick') {
      return <PenaltyKickActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'basketball-game') {
      return <BasketballActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'tennis-game') {
      return <TennisActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'robot-lego-game') {
      return <RobotLegoActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'word-search-game') {
      return <WordSearchActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'million-show-game') {
      return <MillionShowActivity onComplete={handleFinish} />;
    }
    if (currentAct.type === 'mario-kong-platformer') {
      return <MarioKongPlatformerActivity onComplete={handleFinish} />;
    }

    // Default: GenericTypingActivity
    return (
      <GenericTypingActivity
        title={currentAct.title}
        targetText={currentAct.targetText || 'asdf jklç qwert yuiop zxcvb'}
        suggestedFinger={currentAct.guide.fingers}
        pedagogicalTip={currentAct.guide.pedagogicalTip}
        onComplete={handleFinish}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        className={`relative w-full ${
          isPresentation ? 'max-w-6xl lg:max-w-7xl' : 'max-w-4xl'
        } bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-7 shadow-2xl my-auto transition-all`}
      >
        {/* Header da Ilha */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-white/20"
              style={{ backgroundColor: island.color }}
            >
              {island.icon}
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                {island.pedagogicalModule}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {island.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => speakText(`${island.name}. ${island.goal}. Converse com ${island.npcName}.`)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 flex items-center justify-center transition"
              title="Ouvir instruções da ilha"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diálogo Pedagógico do NPC da Ilha */}
        {!activeActivityIdx && (
          <div className="my-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shrink-0 shadow">
              {island.npcAvatar}
            </div>
            <div>
              <div className="text-xs font-extrabold text-amber-400">
                {island.npcName} · <span className="text-slate-400 font-normal">{island.npcTitle}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                "{island.goal} Pratique as 8 atividades na sequência didática para consolidar sua memória muscular!"
              </p>
            </div>
          </div>
        )}

        {/* Se uma atividade estiver aberta: Renderiza o jogo */}
        {activeActivityIdx !== null && currentAct ? (
          <div className="space-y-4 pt-2">
            {/* Cabeçalho da Atividade Ativa */}
            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                  <span>{currentAct.title}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  <b>Objetivo:</b> {currentAct.guide.objective}
                </p>
              </div>

              <button
                onClick={() => setActiveActivityIdx(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
              >
                Voltar à Lista
              </button>
            </div>

            {/* Conteúdo Dinâmico */}
            {renderActivityContent()}
          </div>
        ) : (
          /* Lista das 8 Atividades com Cartões Didáticos Ricos */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {island.activities.map((act, aIdx) => {
                const isCompleted = activitiesDone[aIdx];
                return (
                  <div
                    key={act.id}
                    className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                          Atividade {aIdx + 1}
                        </span>
                        {isCompleted ? (
                          <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Concluída</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-bold">
                            + {act.rewardXp} XP
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1 leading-snug">
                        {act.title}
                      </h4>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2">
                        {act.guide.objective}
                      </p>

                      <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1 mb-3">
                        <div>
                          <b className="text-slate-300">Dedos:</b> {act.guide.fingers}
                        </div>
                        <div className="text-amber-300/90 italic line-clamp-1">
                          "{act.guide.pedagogicalTip}"
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartActivity(aIdx)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md active:scale-95 ${
                        isCompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Praticar Novamente' : 'Iniciar Atividade'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
