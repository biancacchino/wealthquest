import { CharacterId, Monster } from './types';

export const CHARACTERS: Record<CharacterId, { name: string; color: string; spriteSheet: string; cols: number; rows: number }> = {
  green_cap: { 
    name: 'Alex', 
    color: '#22c55e', 
    spriteSheet: '/assets/sprites/RegularPoseBoy.png',
    cols: 4,
    rows: 4
  },
  black_cap: { 
    name: 'Robin', 
    color: '#f97316', 
    spriteSheet: '/assets/sprites/RegularPoseGirl.png',
    cols: 4,
    rows: 4
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

// Money goals aligned with Wealthsimple values:
// - Progress as clarity, not power
// - Plain language descriptions
// - Achievable targets that teach saving fundamentals
export const MONEY_GOALS = [
  {
    id: 'treat' as const,
    label: 'Treat Yourself',
    cost: 35,
    description: 'A small reward for practicing patience',
    emoji: '🍦',
  },
  {
    id: 'headphones' as const,
    label: 'Headphones',
    cost: 60,
    description: 'Save up for something you can use every day',
    emoji: '🎧',
  },
  {
    id: 'game' as const,
    label: 'Video Game',
    cost: 50,
    description: 'Plan ahead for entertainment',
    emoji: '🎮',
  },
  {
    id: 'outfit' as const,
    label: 'New Outfit',
    cost: 75,
    description: 'A bigger goal takes more planning',
    emoji: '👕',
  },
  {
    id: 'biggoal' as const,
    label: 'Big Goal',
    cost: 100,
    description: 'The bigger the goal, the better it feels to reach it',
    emoji: '🌟',
  },
] as const;

export type MoneyGoalId = typeof MONEY_GOALS[number]['id'];

// Coffee shop items
export const COFFEE_SHOP_ITEMS = [
  { id: "coffee", name: "Coffee", price: 2.0, emoji: "☕️" },
  { id: "latte", name: "Latte", price: 3.0, emoji: "🥛" },
  { id: "iced_coffee", name: "Iced Coffee", price: 3.0, emoji: "🧊" },
  { id: "donut", name: "Donut", price: 1.0, emoji: "🍩" },
  { id: "muffin", name: "Muffin", price: 2.0, emoji: "🧁" },
];
