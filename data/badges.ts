import type { Badge, BadgeId } from '../types';
import { Award, Zap, Star, Target, Gem, CheckCircle } from 'lucide-react';

// We only store the static part of the badge. `earnedOn` is added when awarded.
type BadgeDefinition = Omit<Badge, 'earnedOn'>;

export const ALL_BADGES: Record<BadgeId, BadgeDefinition> = {
  firstCheckIn: {
    id: 'firstCheckIn',
    name: 'Primeiro Passo',
    description: 'Você fez seu primeiro check-in e iniciou sua jornada!',
    icon: 'Star'
  },
  perfectDay: {
    id: 'perfectDay',
    name: 'Dia Perfeito',
    description: 'Completou todas as refeições e tarefas de um dia.',
    icon: 'CheckCircle'
  },
  streak3: {
    id: 'streak3',
    name: 'Na Trilha Certa',
    description: 'Manteve uma sequência de 3 dias de check-ins.',
    icon: 'Zap'
  },
  streak7: {
    id: 'streak7',
    name: 'Semana de Sucesso',
    description: 'Completou 7 dias seguidos de check-ins!',
    icon: 'Award'
  },
  pointCollector100: {
    id: 'pointCollector100',
    name: 'Colecionador',
    description: 'Acumulou 100 pontos.',
    icon: 'Gem'
  },
  pointCollector500: {
    id: 'pointCollector500',
    name: 'Mestre dos Pontos',
    description: 'Acumulou 500 pontos. Uau!',
    icon: 'Gem'
  },
  goalReached: {
    id: 'goalReached',
    name: 'Meta Atingida!',
    description: 'Parabéns! Você alcançou seu peso ideal.',
    icon: 'Target'
  },
};
