import React, { useState, useEffect, useCallback } from 'react';
import { IslandDef, PlayerStats, AvatarConfig, GameSettings, Difficulty, FontSize } from './types';
import { ISLANDS } from './data/curriculum';
import { sounds } from './audio/soundEngine';
import { speakText } from './speech/tts';
import { TopBar } from './components/TopBar';
import { WorldCanvas } from './components/WorldCanvas';
import { MissionIslandModal } from './components/MissionIslandModal';
import { MissionsListView } from './components/MissionsListView';
import { ProfileView } from './components/ProfileView';
import { ShopModal } from './components/ShopModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { AvatarEditorModal } from './components/AvatarEditorModal';
import { HelpModal } from './components/HelpModal';
import { CertificateModal } from './components/activities/CertificateModal';
import { GenericTypingActivity } from './components/activities/GenericTypingActivity';
import { Sparkles, Compass, MapPin, ChevronRight, BookOpen, Volume2 } from 'lucide-react';

const STORAGE_KEYS = {
  STATS: 'typehero_stats_v2',
  AVATAR: 'typehero_avatar_v2',
  SETTINGS: 'typehero_settings_v2',
  ACTIVITIES: 'typehero_activities_v2',
};

const DEFAULT_AVATAR: AvatarConfig = {
  gender: 'neutral',
  skin: '#8d5524',
  hair: '#17120f',
  hairStyle: 'fade',
  eyes: 'bright',
  face: 'smile',
  shirt: '#10b981',
  outfit: 'hoodie',
  accessory: 'headset',
  accessoryColor: '#38bdf8',
  item: 'none',
};

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'easy',
  sound: true,
  soundVolume: 0.8,
  voiceEnabled: true,
  voiceName: '',
  voiceRate: 1.0,
  voiceVolume: 1.0,
  voicePitch: 1.0,
  autoVoice: false,
  themeColor: '#38bdf8',
  accentColor: '#f59e0b',
  visionMode: 'normal',
  highContrast: false,
  patternMode: false,
  reducedMotion: false,
  themeMode: 'dark',
  fontSize: 'normal',
  largeTargets: false,
  focusHighlight: true,
};

const DEFAULT_STATS: PlayerStats = {
  xp: 120,
  coins: 85,
  gems: 10,
  wpm: 28,
  accuracy: 94,
  combo: 0,
  completedPhases: [0], // Ilha do Mouse iniciada
  activitiesDone: Array.from({ length: 10 }, () => new Array(8).fill(false)),
  errors: { c: 2, p: 3, q: 1, z: 2 },
  historyWpm: [18, 22, 25, 28],
  inventory: ['headset'],
  playerName: 'Aluno TypeHero',
};

export const App: React.FC = () => {
  // 1. Estados com persistência local
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [avatar, setAvatar] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AVATAR);
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR;
    } catch {
      return DEFAULT_AVATAR;
    }
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activitiesDoneByIsland, setActivitiesDoneByIsland] = useState<{ [islandId: number]: boolean[] }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return saved ? JSON.parse(saved) : { 0: [true, true, false, false, false, false, false, false] };
    } catch {
      return { 0: [true, true, false, false, false, false, false, false] };
    }
  });

  // 2. Estados de Navegação e Modais
  const [currentTab, setCurrentTab] = useState<'world' | 'missions' | 'shop' | 'profile' | 'settings'>('world');
  const [activeIslandIdx, setActiveIslandIdx] = useState<number | null>(null);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [practiceErrorText, setPracticeErrorText] = useState<string | null>(null);

  // Sincroniza áudio
  useEffect(() => {
    sounds.setEnabled(settings.sound);
    sounds.setVolume(settings.soundVolume);
  }, [settings.sound, settings.soundVolume]);

  // Salva no localStorage quando os estados mudam
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AVATAR, JSON.stringify(avatar));
  }, [avatar]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activitiesDoneByIsland));
  }, [activitiesDoneByIsland]);

  // Atalhos Globais de Teclado (M, H, P, Esc)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;

      if (e.key === 'Escape') {
        setActiveIslandIdx(null);
        setShowAvatarEditor(false);
        setShowShop(false);
        setShowHelp(false);
        setShowCertificate(false);
        setPracticeErrorText(null);
      } else if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
        setShowHelp((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
        setCurrentTab((prev) => (prev === 'missions' ? 'world' : 'missions'));
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Handler de Conclusão de Atividade
  const handleActivityComplete = (
    activityIdx: number,
    score: { wpm: number; accuracy: number; errors: number; rewardXp: number; rewardCoins: number }
  ) => {
    if (activeIslandIdx === null) return;

    // Atualiza status da atividade na ilha
    setActivitiesDoneByIsland((prev) => {
      const currentList = prev[activeIslandIdx] || new Array(ISLANDS[activeIslandIdx]?.activities.length || 12).fill(false);
      const updated = [...currentList];
      updated[activityIdx] = true;
      return { ...prev, [activeIslandIdx]: updated };
    });

    // Atualiza estatísticas do aluno
    setStats((prev) => {
      const newXp = prev.xp + score.rewardXp;
      const newCoins = prev.coins + score.rewardCoins;
      const newWpm = score.wpm > 0 ? Math.max(prev.wpm, score.wpm) : prev.wpm;
      const newAcc = Math.round((prev.accuracy + score.accuracy) / 2);
      const history = score.wpm > 0 ? [...prev.historyWpm.slice(-9), score.wpm] : prev.historyWpm;

      // Desbloqueia próxima fase se atingir 4 atividades feitas
      const islandDoneList = activitiesDoneByIsland[activeIslandIdx] || [];
      const totalDone = islandDoneList.filter(Boolean).length + 1;
      const completed = new Set(prev.completedPhases);
      if (totalDone >= 4) {
        completed.add(activeIslandIdx);
      }

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        wpm: newWpm,
        accuracy: newAcc,
        completedPhases: Array.from(completed),
        historyWpm: history,
      };
    });
  };

  // Compra na Loja
  const handleBuyShopItem = (itemId: string, cost: number, type: 'accessory' | 'outfit' | 'item') => {
    if (stats.inventory.includes(itemId)) {
      // Já possui: apenas equipa
      sounds.coin();
      if (type === 'accessory') setAvatar((a) => ({ ...a, accessory: itemId as any }));
      if (type === 'outfit') setAvatar((a) => ({ ...a, outfit: itemId as any }));
    } else if (stats.coins >= cost) {
      sounds.coin();
      setStats((s) => ({
        ...s,
        coins: s.coins - cost,
        inventory: [...s.inventory, itemId],
      }));
      if (type === 'accessory') setAvatar((a) => ({ ...a, accessory: itemId as any }));
      if (type === 'outfit') setAvatar((a) => ({ ...a, outfit: itemId as any }));
    }
  };

  // Iniciar Treino Focado de Teclas Difíceis
  const handleStartPracticeErrors = () => {
    const errorKeys = Object.keys(stats.errors);
    if (errorKeys.length === 0) return;
    const drill = errorKeys.map((k) => `${k}${k} ${k}a ${k}o`).join(' ');
    setPracticeErrorText(drill);
  };

  const handleDecreaseFontSize = () => {
    setSettings((s) => {
      if (s.fontSize === '2xl') return { ...s, fontSize: 'xl' };
      if (s.fontSize === 'xl') return { ...s, fontSize: 'large' };
      if (s.fontSize === 'large') return { ...s, fontSize: 'normal' };
      if (s.fontSize === 'normal') return { ...s, fontSize: 'small' };
      return s;
    });
  };

  const handleIncreaseFontSize = () => {
    setSettings((s) => {
      if (s.fontSize === 'small') return { ...s, fontSize: 'normal' };
      if (s.fontSize === 'normal') return { ...s, fontSize: 'large' };
      if (s.fontSize === 'large') return { ...s, fontSize: 'xl' };
      if (s.fontSize === 'xl') return { ...s, fontSize: '2xl' };
      return s;
    });
  };

  const handleToggleTheme = () => {
    setSettings((s) => ({
      ...s,
      themeMode: s.themeMode === 'light' ? 'dark' : 'light',
    }));
  };

  // Aplicação universal e dinâmica da escala de fonte em TODO o jogo (multiplicador raiz rem)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'font-size-small',
      'font-size-normal',
      'font-size-large',
      'font-size-xl',
      'font-size-2xl'
    );
    root.classList.add(`font-size-${settings.fontSize}`);

    const sizeMap: Record<FontSize, string> = {
      small: '13.5px',
      normal: '16px',
      large: '19.5px',
      xl: '23.5px',
      '2xl': '27.5px',
    };
    root.style.fontSize = sizeMap[settings.fontSize] || '16px';
  }, [settings.fontSize]);

  const visionClass =
    settings.visionMode === 'mono'
      ? 'grayscale'
      : settings.visionMode === 'prot'
      ? 'contrast-125 saturate-50'
      : settings.visionMode === 'low-vision'
      ? 'contrast-150 font-bold'
      : '';

  const themeClass = settings.themeMode === 'light' ? 'theme-light bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100';
  const patternClass = settings.patternMode ? 'pattern-mode' : '';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${themeClass} ${patternClass} ${visionClass} ${
        settings.highContrast ? 'contrast-125' : ''
      }`}
    >
      {/* Barra de Navegação Superior */}
      <TopBar
        currentTab={currentTab}
        stats={stats}
        avatar={avatar}
        difficulty={settings.difficulty}
        soundEnabled={settings.sound}
        fontSize={settings.fontSize}
        themeMode={settings.themeMode}
        onTabChange={(tab) => {
          if (tab === 'shop') setShowShop(true);
          else if (tab === 'settings') setCurrentTab('settings');
          else setCurrentTab(tab);
        }}
        onDifficultyChange={(d) => setSettings((s) => ({ ...s, difficulty: d }))}
        onToggleSound={() => {
          setSettings((s) => {
            const next = !s.sound;
            if (next) sounds.coin();
            return { ...s, sound: next };
          });
        }}
        onOpenAvatarEditor={() => setShowAvatarEditor(true)}
        onDecreaseFontSize={handleDecreaseFontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onToggleTheme={handleToggleTheme}
      />

      {/* Conteúdo Principal Adaptativo */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-6">
        {/* ABA: MUNDO (MAPA INTERATIVO 2D COM PROGRESSÃO PEDAGÓGICA) */}
        {currentTab === 'world' && (
          <div className="space-y-4">
            {/* Banner Didático de Boas-Vindas */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border-2 border-amber-400/70 flex items-center justify-center text-2xl shrink-0">
                  🗺️
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                    Arquipélago Pedagógico TypeHero
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Navegue com <b>WASD</b> ou <b>Setas</b> até as ilhas. Conquiste as 10 ilhas em ordem didática (Mouse → Teclado ABNT2 → Linha-Base ASDF → Acentuação → NitroType).
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setShowHelp(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 transition flex items-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Guia de Postura</span>
                </button>
                <button
                  onClick={() => setCurrentTab('missions')}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow transition flex items-center space-x-1"
                >
                  <span>Ver Trilha Completa</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas 2D do Mundo */}
            <WorldCanvas
              islands={ISLANDS}
              currentIslandIdx={stats.completedPhases.length < 10 ? stats.completedPhases.length : 9}
              avatar={avatar}
              onSelectIsland={(islandId) => setActiveIslandIdx(islandId)}
              onOpenHelp={() => setShowHelp(true)}
            />

            {/* Dica Ergonômica na Base */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-300 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-amber-400 font-bold">💡 Dica de Ergonomia & Toque:</span>
                <span>"Não bata com força nas teclas; a digitação ágil requer toque suave, punhos retos e ritmo constante."</span>
              </div>
              <button
                onClick={() => speakText("Não bata com força nas teclas; a digitação ágil requer toque suave, punhos retos e ritmo constante.")}
                className="text-sky-400 hover:text-sky-300 p-1"
                title="Ouvir dica"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ABA: MISSÕES E PROGRESSÃO DIDÁTICA */}
        {currentTab === 'missions' && (
          <MissionsListView
            islands={ISLANDS}
            completedPhases={stats.completedPhases}
            activitiesDoneByIsland={activitiesDoneByIsland}
            onOpenIsland={(id) => setActiveIslandIdx(id)}
          />
        )}

        {/* ABA: PERFIL E PROGRESSO */}
        {currentTab === 'profile' && (
          <ProfileView
            stats={stats}
            avatar={avatar}
            onOpenAvatarEditor={() => setShowAvatarEditor(true)}
            onPracticeErrors={handleStartPracticeErrors}
            onOpenCertificate={() => setShowCertificate(true)}
          />
        )}

        {/* ABA: AJUSTES & ACESSIBILIDADE */}
        {currentTab === 'settings' && (
          <div className="max-w-3xl mx-auto w-full">
            <AccessibilityModal
              settings={settings}
              onSave={(s) => setSettings(s)}
              onClose={() => setCurrentTab('world')}
            />
          </div>
        )}
      </main>

      {/* MODAL: HUB DA ILHA & ATIVIDADES */}
      {activeIslandIdx !== null && (
        <MissionIslandModal
          island={ISLANDS[activeIslandIdx]}
          activitiesDone={activitiesDoneByIsland[activeIslandIdx] || new Array(ISLANDS[activeIslandIdx]?.activities.length || 12).fill(false)}
          playerWpm={stats.wpm}
          playerAccuracy={stats.accuracy}
          onClose={() => setActiveIslandIdx(null)}
          onActivityComplete={handleActivityComplete}
        />
      )}

      {/* MODAL: ESTÚDIO DE AVATARES PROFISSIONAL */}
      {showAvatarEditor && (
        <AvatarEditorModal
          avatar={avatar}
          onSave={(a) => setAvatar(a)}
          onClose={() => setShowAvatarEditor(false)}
        />
      )}

      {/* MODAL: LOJA DE RECOMPENSAS */}
      {showShop && (
        <ShopModal
          stats={stats}
          avatar={avatar}
          onBuyItem={handleBuyShopItem}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* MODAL: GUIA ERGONÔMICO & CONTROLES */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* MODAL: CERTIFICADO OFICIAL */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6">
            <CertificateModal
              wpm={stats.wpm}
              accuracy={stats.accuracy}
              initialName={stats.playerName}
              onClose={() => setShowCertificate(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL: TREINO ADAPTATIVO DE ERROS */}
      {practiceErrorText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Treino Adaptativo de Teclas Difíceis</h3>
              <button
                onClick={() => setPracticeErrorText(null)}
                className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-semibold text-slate-300"
              >
                Voltar
              </button>
            </div>
            <GenericTypingActivity
              title="Prática Personalizada de Teclas Frequentes"
              targetText={practiceErrorText}
              pedagogicalTip="Pratique com ritmo contínuo para reeducar sua memória motora nessas teclas."
              onComplete={(sc) => {
                setStats((s) => ({
                  ...s,
                  errors: {}, // Limpa erros após superar o treino
                  xp: s.xp + 40,
                  coins: s.coins + 30,
                }));
                setPracticeErrorText(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
