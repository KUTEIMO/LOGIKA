/** Ruta de aprendizaje LOGIKA — requisitos de módulo y certificados */
export const LEARNING_PATH = [
  {
    id: 'logic',
    order: 1,
    title: 'Lógica proposicional',
    icon: 'calculator',
    color: 'purple',
    certificateTitle: 'Certificado · Lógica Proposicional',
    requirements: {
      tablesGenerated: 3,
      quizzesCorrect: 2
    },
    xpReward: 80
  },
  {
    id: 'sets',
    order: 2,
    title: 'Teoría de conjuntos',
    icon: 'share-2',
    color: 'blue',
    certificateTitle: 'Certificado · Teoría de Conjuntos',
    requirements: {
      learnCount: 2,
      practiceWins: 2
    },
    xpReward: 80
  },
  {
    id: 'graphs',
    order: 3,
    title: 'Teoría de grafos',
    icon: 'network',
    color: 'green',
    certificateTitle: 'Certificado · Teoría de Grafos',
    requirements: {
      dijkstraRuns: 1,
      bfsRuns: 1
    },
    xpReward: 80
  },
  {
    id: 'relations',
    order: 4,
    title: 'Relaciones y matrices',
    icon: 'arrow-left-right',
    color: 'violet',
    certificateTitle: 'Certificado · Relaciones',
    requirements: {
      checksRun: 4
    },
    xpReward: 80
  }
];

/** Certificado global por XP total (además de módulos) */
export const XP_MILESTONES = [
  { xp: 400, title: 'Explorador LOGIKA', subtitle: '400 XP acumulados' },
  { xp: 800, title: 'Estudiante destacado', subtitle: '800 XP acumulados' }
];

export const SCHOOL_ROUTE_CERTIFICATE = {
  id: 'school_route',
  title: 'Ruta del Programador',
  subtitle: 'Ingeniería de Sistemas · Unisimón Cúcuta',
  minXp: 0
};
