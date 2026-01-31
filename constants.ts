import { CharacterId, Monster } from './types';

export const CHARACTERS: Record<CharacterId, { name: string; color: string; spriteSheet: string; cols: number; rows: number }> = {
  green_cap: { 
    name: 'Alex', 
    color: '#22c55e', 
    spriteSheet: '/assets/sprites/prf.png',
    cols: 4,
    rows: 2
  },
  black_cap: { 
    name: 'Robin', 
    color: '#f97316', 
    spriteSheet: '/assets/sprites/prf.png',
    cols: 4,
    rows: 2
  },
};

export const STARTERS: Monster[] = [
  {
    id: 'bulba',
    name: 'BULBASAUR',
    type: 'grass',
    level: 5,
    hp: { current: 20, max: 20 },
    sprite: 'https://picsum.photos/seed/bulba/64/64'
  },
  {
    id: 'char',
    name: 'CHARMANDER',
    type: 'fire',
    level: 5,
    hp: { current: 19, max: 19 },
    sprite: 'https://picsum.photos/seed/char/64/64'
  },
  {
    id: 'squirt',
    name: 'SQUIRTLE',
    type: 'water',
    level: 5,
    hp: { current: 21, max: 21 },
    sprite: 'https://picsum.photos/seed/squirt/64/64'
  }
];

export const SAVE_PREFIX = 'ellehacks26_save_';
