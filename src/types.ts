export type Difficulty = 'easy' | 'intermediate' | 'hard';

export type VisionMode = 'normal' | 'prot' | 'deut' | 'trit' | 'low-vision' | 'mono';

export type FontSize = 'small' | 'normal' | 'large' | 'xl' | '2xl';

export type ThemeMode = 'dark' | 'light';

export interface AvatarConfig {
  gender: 'female' | 'male' | 'neutral';
  skin: string;
  hair: string;
  hairStyle: 'spikes' | 'curly' | 'long' | 'bob' | 'fade' | 'braids';
  shirt: string;
  outfit: 'hoodie' | 'jacket' | 'tech' | 'shirt';
  accessory: 'none' | 'headset' | 'glasses' | 'cap' | 'visor' | 'earrings' | 'bandana' | 'badge';
  accessoryColor: string;
  face: 'smile' | 'happy' | 'cool';
  eyes: 'round' | 'soft' | 'bright';
  item: string;
}

export interface ActivityGuide {
  objective: string;
  howToPlay: string;
  fingers: string;
  pedagogicalTip: string;
}

export interface ActivityDef {
  id: string;
  title: string;
  type:
    | 'mouse-maze'
    | 'backspace-workshop'
    | 'shift-caps-lab'
    | 'arrow-pilot'
    | 'asdf-garden'
    | 'target'
    | 'double-click'
    | 'right-click'
    | 'scroll'
    | 'drag-drop'
    | 'mouse-reflex'
    | 'typing'
    | 'sequence'
    | 'reaction'
    | 'nitro-race'
    | 'bubble-tetris'
    | 'code-typing'
    | 'crossword'
    | 'connect-dots'
    | 'memory-game'
    | 'snake-game'
    | 'musical-keyboard'
    | 'pac-man'
    | 'ring-toss'
    | 'moto-game'
    | 'makeup'
    | 'makeup-game'
    | 'room-decor'
    | 'penalty-kick'
    | 'basketball-game'
    | 'tennis-game'
    | 'robot-lego-game'
    | 'word-search-game'
    | 'million-show-game'
    | 'mario-kong-platformer';
  guide: ActivityGuide;
  targetText?: string;
  prompt?: string;
  options?: string[];
  correctOption?: string;
  rewardXp: number;
  rewardCoins: number;
}

export interface IslandDef {
  id: number;
  name: string;
  icon: string;
  color: string;
  npcName: string;
  npcAvatar: string;
  npcTitle: string;
  goal: string;
  pedagogicalModule: string;
  activities: ActivityDef[];
}

export interface PlayerStats {
  xp: number;
  coins: number;
  gems: number;
  wpm: number;
  accuracy: number;
  combo: number;
  completedPhases: number[];
  activitiesDone: boolean[][];
  errors: Record<string, number>;
  historyWpm: number[];
  inventory: string[];
  playerName: string;
}

export interface GameSettings {
  difficulty: Difficulty;
  sound: boolean;
  soundVolume: number;
  voiceEnabled: boolean;
  voiceName: string;
  voiceRate: number;
  voiceVolume: number;
  voicePitch: number;
  autoVoice: boolean;
  themeColor: string;
  accentColor: string;
  visionMode: VisionMode;
  highContrast: boolean;
  patternMode: boolean;
  reducedMotion: boolean;
  themeMode: ThemeMode;
  fontSize: FontSize;
  largeTargets: boolean;
  focusHighlight: boolean;
  presentationMode: boolean;
}
