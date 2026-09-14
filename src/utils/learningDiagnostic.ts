import { PlayerStats, Difficulty, IslandDef } from '../types';
import { ISLANDS } from '../data/curriculum';

export interface SkillDomain {
  id: string;
  name: string;
  icon: string;
  score: number; // 0 a 100%
  status: 'otimo' | 'praticar' | 'atencao';
  description: string;
  islandId: number;
}

export interface WeakKeyInfo {
  key: string;
  errorCount: number;
  finger: string;
  hand: 'Mão Esquerda' | 'Mão Direita';
  tip: string;
}

export interface RecommendedActivity {
  islandId: number;
  activityIdx: number;
  activityTitle: string;
  islandName: string;
  islandIcon: string;
  reason: string;
  priority: 'alta' | 'media';
}

export interface DiagnosticReport {
  overallAccuracy: number;
  wpm: number;
  totalErrorsMapped: number;
  masteryLevel: string;
  domains: SkillDomain[];
  weakKeys: WeakKeyInfo[];
  recommendations: RecommendedActivity[];
  pedagogicalAdvice: string;
}

const KEY_FINGER_MAP: { [key: string]: { finger: string; hand: 'Mão Esquerda' | 'Mão Direita'; tip: string } } = {
  a: { finger: 'Mínimo', hand: 'Mão Esquerda', tip: 'Mantenha o mínimo apoiado na tecla A sem pressionar com força.' },
  s: { finger: 'Anelar', hand: 'Mão Esquerda', tip: 'Use o dedo anelar esquerdo com toque suave e elástico.' },
  d: { finger: 'Médio', hand: 'Mão Esquerda', tip: 'O dedo médio esquerdo é o centro de controle das teclas D, E e C.' },
  f: { finger: 'Indicador', hand: 'Mão Esquerda', tip: 'Sinta a marquinha em relevo da tecla F para nunca se perder!' },
  g: { finger: 'Indicador', hand: 'Mão Esquerda', tip: 'Estenda o indicador esquerdo da tecla F para o G e retorne.' },
  h: { finger: 'Indicador', hand: 'Mão Direita', tip: 'Estenda o indicador direito da tecla J para o H e retorne.' },
  j: { finger: 'Indicador', hand: 'Mão Direita', tip: 'Sinta a marquinha em relevo da tecla J como base guia.' },
  k: { finger: 'Médio', hand: 'Mão Direita', tip: 'O dedo médio direito controla a tecla K e sobe para o I.' },
  l: { finger: 'Anelar', hand: 'Mão Direita', tip: 'O anelar direito repousa sobre a letra L.' },
  ç: { finger: 'Mínimo', hand: 'Mão Direita', tip: 'O dedo mínimo direito aciona o Ç na linha-base ABNT2.' },
  q: { finger: 'Mínimo', hand: 'Mão Esquerda', tip: 'Suba o dedo mínimo esquerdo da letra A diretamente para o Q.' },
  w: { finger: 'Anelar', hand: 'Mão Esquerda', tip: 'Suba o anelar esquerdo da letra S para o W.' },
  e: { finger: 'Médio', hand: 'Mão Esquerda', tip: 'Suba o dedo médio esquerdo da letra D para o E.' },
  r: { finger: 'Indicador', hand: 'Mão Esquerda', tip: 'Suba o indicador esquerdo do F para o R.' },
  t: { finger: 'Indicador', hand: 'Mão Esquerda', tip: 'Estenda o indicador esquerdo para o T na diagonal.' },
  y: { finger: 'Indicador', hand: 'Mão Direita', tip: 'Estenda o indicador direito do J para o Y.' },
  u: { finger: 'Indicador', hand: 'Mão Direita', tip: 'Suba o indicador direito do J para o U.' },
  i: { finger: 'Médio', hand: 'Mão Direita', tip: 'Suba o dedo médio direito do K para o I.' },
  o: { finger: 'Anelar', hand: 'Mão Direita', tip: 'Suba o anelar direito do L para o O.' },
  p: { finger: 'Mínimo', hand: 'Mão Direita', tip: 'Suba o mínimo direito do Ç para o P.' },
  z: { finger: 'Mínimo', hand: 'Mão Esquerda', tip: 'Desça o dedo mínimo esquerdo suavemente para o Z.' },
  x: { finger: 'Anelar', hand: 'Mão Esquerda', tip: 'Desça o anelar esquerdo do S para o X.' },
  c: { finger: 'Médio', hand: 'Mão Esquerda', tip: 'Desça o dedo médio esquerdo do D para o C.' },
  v: { finger: 'Indicador', hand: 'Mão Esquerda', tip: 'Desça o indicador esquerdo do F para o V.' },
  b: { finger: 'Indicador', hand: 'Mão Esquerda', tip: 'Desça o indicador esquerdo para o B.' },
  n: { finger: 'Indicador', hand: 'Mão Direita', tip: 'Desça o indicador direito do J para o N.' },
  m: { finger: 'Indicador', hand: 'Mão Direita', tip: 'Desça o indicador direito para o M.' },
  '´': { finger: 'Mínimo', hand: 'Mão Direita', tip: 'Bata primeiro o acento agudo e só depois a vogal desejada.' },
  '~': { finger: 'Mínimo', hand: 'Mão Direita', tip: 'O til fica ao lado do Enter, acionado pelo dedo mínimo direito.' },
};

export function generateLearningDiagnostic(
  stats: PlayerStats,
  activitiesDoneByIsland: { [islandId: number]: boolean[] }
): DiagnosticReport {
  const errors = stats.errors || {};
  const totalErrors = Object.values(errors).reduce((a, b) => a + b, 0);

  // Mapeia fraquezas por grupo de teclas
  const homeKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'];
  const upperKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const lowerKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
  const accentKeys = ['´', '~', '^', '`', 'ç'];
  const numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '@', '#', '$', '%'];

  const countErrorsInGroup = (keys: string[]) =>
    keys.reduce((sum, k) => sum + (errors[k] || 0) + (errors[k.toUpperCase()] || 0), 0);

  const homeErrors = countErrorsInGroup(homeKeys);
  const upperErrors = countErrorsInGroup(upperKeys);
  const lowerErrors = countErrorsInGroup(lowerKeys);
  const accentErrors = countErrorsInGroup(accentKeys);
  const numErrors = countErrorsInGroup(numKeys);

  // Calcula taxa de conclusão por ilha
  const getIslandDonePercent = (islandId: number) => {
    const list = activitiesDoneByIsland[islandId] || [];
    const total = ISLANDS[islandId]?.activities.length || 8;
    const done = list.filter(Boolean).length;
    return Math.round((done / total) * 100);
  };

  const mouseProgress = getIslandDonePercent(0);
  const homeProgress = Math.round((getIslandDonePercent(1) + getIslandDonePercent(2)) / 2);
  const upperProgress = getIslandDonePercent(3);
  const lowerProgress = getIslandDonePercent(4);
  const wordsProgress = getIslandDonePercent(5);
  const accentProgress = getIslandDonePercent(6);
  const numProgress = getIslandDonePercent(7);
  const speedProgress = getIslandDonePercent(8);

  // Calcula pontuação de domínio (0 a 100) combinando conclusão e erros
  const calcDomainScore = (progress: number, groupErrors: number) => {
    const penalty = Math.min(35, groupErrors * 5);
    const base = Math.max(10, Math.round(progress * 0.7 + (stats.accuracy || 80) * 0.3));
    return Math.max(10, Math.min(100, base - penalty));
  };

  const domains: SkillDomain[] = [
    {
      id: 'mouse',
      name: 'Coordenação com o Mouse',
      icon: '🖱️',
      score: calcDomainScore(mouseProgress, 0),
      status: mouseProgress >= 70 ? 'otimo' : mouseProgress >= 35 ? 'praticar' : 'atencao',
      description: 'Precisão nos cliques simples, duplo clique, botão direito e ligar os pontos.',
      islandId: 0,
    },
    {
      id: 'home_row',
      name: 'Linha-Base ABNT2 (ASDF / JKLÇ)',
      icon: '🌿',
      score: calcDomainScore(homeProgress, homeErrors),
      status: homeErrors > 4 ? 'atencao' : homeProgress >= 60 ? 'otimo' : 'praticar',
      description: 'Posição de repouso dos 8 dedos e ancoragem tátil nas teclas guia F e J.',
      islandId: 2,
    },
    {
      id: 'upper_row',
      name: 'Linha Superior (QWERT / YUIOP)',
      icon: '⛰️',
      score: calcDomainScore(upperProgress, upperErrors),
      status: upperErrors > 3 ? 'atencao' : upperProgress >= 60 ? 'otimo' : 'praticar',
      description: 'Extensão ascendente dos dedos sem mover os pulsos da mesa.',
      islandId: 3,
    },
    {
      id: 'lower_row',
      name: 'Linha Inferior (ZXCVB / NM)',
      icon: '🌊',
      score: calcDomainScore(lowerProgress, lowerErrors),
      status: lowerErrors > 3 ? 'atencao' : lowerProgress >= 60 ? 'otimo' : 'praticar',
      description: 'Flexão dos dedos para a fileira inferior mantendo a suavidade.',
      islandId: 4,
    },
    {
      id: 'accents',
      name: 'Acentuação Gráfica & Cedilha',
      icon: '🏛️',
      score: calcDomainScore(accentProgress, accentErrors),
      status: accentErrors > 3 ? 'atencao' : accentProgress >= 50 ? 'otimo' : 'praticar',
      description: 'Mecanismo de bater o acento (agudo, circunflexo, til) antes da vogal.',
      islandId: 6,
    },
    {
      id: 'symbols_nums',
      name: 'Números e Sinais de Pontuação',
      icon: '🏙️',
      score: calcDomainScore(numProgress, numErrors),
      status: numErrors > 3 ? 'atencao' : numProgress >= 50 ? 'otimo' : 'praticar',
      description: 'Fileira numérica superior combinada com o acionamento do Shift.',
      islandId: 7,
    },
    {
      id: 'speed_reflexes',
      name: 'Velocidade e Ritmo Esportivo',
      icon: '🏎️',
      score: calcDomainScore(speedProgress, 0),
      status: stats.wpm >= 35 ? 'otimo' : stats.wpm >= 20 ? 'praticar' : 'atencao',
      description: 'Fluência motora sem pausas bruscas para alcançar altos ritmos de WPM.',
      islandId: 8,
    },
  ];

  // Identifica as 4 piores teclas do usuário
  const sortedErrorKeys = Object.entries(errors)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const weakKeys: WeakKeyInfo[] = sortedErrorKeys.map(([k, count]) => {
    const lowerKey = k.toLowerCase();
    const info = KEY_FINGER_MAP[lowerKey] || {
      finger: 'Dedo correspondente',
      hand: 'Mão Direita',
      tip: `Pratique a tecla "${k}" observando a posição correta no teclado virtual.`,
    };
    return {
      key: k.toUpperCase(),
      errorCount: count,
      finger: info.finger,
      hand: info.hand,
      tip: info.tip,
    };
  });

  // Recomendações personalizadas de atividades específicas
  const recommendations: RecommendedActivity[] = [];

  // Se tem muitas fraquezas em acentos
  if (accentErrors >= 2 || accentProgress < 30) {
    recommendations.push({
      islandId: 6,
      activityIdx: 0,
      activityTitle: '1. O Segredo do Acento Agudo (´)',
      islandName: 'Templo dos Acentos e Cedilha',
      islandIcon: '🏛️',
      reason: 'Detectamos dúvidas ao acentuar palavras. Lembre-se: aperte primeiro o acento e depois a vogal.',
      priority: 'alta',
    });
  }

  // Se tem erros na linha superior (ex: p, q, o, w)
  if (upperErrors >= 3 || upperProgress < 40) {
    recommendations.push({
      islandId: 3,
      activityIdx: 0,
      activityTitle: '1. Escalada Inicial: E e I',
      islandName: 'Picos da Linha Superior',
      islandIcon: '⛰️',
      reason: 'Seus dedos indicadores e médios precisam de mais firmeza ao subir para as vogais E e I.',
      priority: 'alta',
    });
  }

  // Se mouse não foi dominado
  if (mouseProgress < 60) {
    recommendations.push({
      islandId: 0,
      activityIdx: 8, // Ligar os pontos
      activityTitle: '9. Ligar os Pontos: Desenhos Mágicos',
      islandName: 'Ilha do Mouse',
      islandIcon: '🖱️',
      reason: 'Excelente para exercitar a precisão do cursor e a firmeza dos cliques em sequência!',
      priority: 'media',
    });
  }

  // Se a velocidade WPM for baixa ou precisão precisar de treino
  if (stats.wpm < 25) {
    recommendations.push({
      islandId: 1,
      activityIdx: 8, // Cobrinha ou bolhas
      activityTitle: '9. Jogo da Cobrinha Amiga do Jardim',
      islandName: 'Vale do Teclado ABNT2',
      islandIcon: '⌨️',
      reason: 'Ótimo para treinar a agilidade de reação nas setas de navegação de forma descontraída.',
      priority: 'media',
    });
  }

  // Se a linha-base ainda tiver atividades incompletas
  if (homeProgress < 80 && recommendations.length < 3) {
    recommendations.push({
      islandId: 2,
      activityIdx: 8, // Musical keyboard
      activityTitle: '9. Teclado Musical: Sinfonia dos Dedos',
      islandName: 'Floresta da Linha-Base',
      islandIcon: '🌿',
      reason: 'Tocar melodias fortalece a memória auditiva e o posicionamento de repouso dos 8 dedos.',
      priority: 'media',
    });
  }

  // Garante ao menos 3 recomendações úteis
  if (recommendations.length < 3) {
    recommendations.push({
      islandId: 5,
      activityIdx: 8, // Crossword
      activityTitle: '9. Palavras Cruzadas do Saber',
      islandName: 'Deserto das Palavras Reais',
      islandIcon: '🏜️',
      reason: 'Reforça a formação de palavras completas e a ortografia de maneira inteligente.',
      priority: 'media',
    });
  }

  // Nível geral de maestria
  let masteryLevel = 'Iniciante Curioso 🌱';
  if (stats.wpm >= 40 && stats.accuracy >= 94) {
    masteryLevel = 'Mestre Digitador de Elite 🏆';
  } else if (stats.wpm >= 28 && stats.accuracy >= 90) {
    masteryLevel = 'Digitador Veloz & Preciso ⭐';
  } else if (stats.wpm >= 18 || stats.accuracy >= 85) {
    masteryLevel = 'Praticante em Plena Evolução 🚀';
  }

  let pedagogicalAdvice = 'Mantenha os punhos sempre retos e flutuando suavemente sobre o teclado. O segredo da velocidade nunca é a força, mas sim a calma e a precisão do toque!';
  if (totalErrors > 15) {
    pedagogicalAdvice = 'Percebemos alguns erros concentrados. Experimente diminuir ligeiramente o ritmo para focar na precisão de 95% ou mais; a velocidade virá naturalmente com a confiança!';
  } else if (stats.accuracy >= 96) {
    pedagogicalAdvice = 'Sua precisão está impecável! Agora você pode tentar o Modo Difícil no menu superior para desafiar sua velocidade contra os pilotos Nitro!';
  }

  return {
    overallAccuracy: stats.accuracy || 92,
    wpm: stats.wpm || 24,
    totalErrorsMapped: totalErrors,
    masteryLevel,
    domains,
    weakKeys,
    recommendations: recommendations.slice(0, 3),
    pedagogicalAdvice,
  };
}
