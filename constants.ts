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
  { id: "coffee", name: "Coffee", price: 2.0, iconName: "CoffeeIcon", category: 'want' as const },
  { id: "latte", name: "Latte", price: 3.0, iconName: "DrinkIcon", category: 'want' as const },
  { id: "iced_coffee", name: "Iced Coffee", price: 3.0, iconName: "DrinkIcon", category: 'want' as const },
  { id: "donut", name: "Donut", price: 1.0, iconName: "SweetIcon", category: 'want' as const },
  { id: "muffin", name: "Muffin", price: 2.0, iconName: "SweetIcon", category: 'want' as const },
];

// Mall shop items
export const MALL_SHOP_ITEMS = [
  { id: "school_supplies", name: "School Supplies", price: 8.0, iconName: "BookIcon", category: 'need' as const },
  { id: "toiletries", name: "Toiletries", price: 6.0, iconName: "BottleIcon", category: 'need' as const },
  { id: "clothes", name: "Clothes", price: 25.0, iconName: "ShirtIcon", category: 'want' as const },
  { id: "shoes", name: "Shoes", price: 40.0, iconName: "ShoeIcon", category: 'want' as const },
  { id: "video_game", name: "Video Game", price: 50.0, iconName: "GameIcon", category: 'want' as const },
  { id: "gift", name: "Gift for Friend", price: 15.0, iconName: "GiftIcon", category: 'social' as const },
];

// Movies shop items
export const MOVIES_SHOP_ITEMS = [
  { id: "movie_ticket", name: "Movie Ticket", price: 12.0, iconName: "TicketIcon", category: 'social' as const },
  { id: "popcorn", name: "Popcorn", price: 7.0, iconName: "FoodIcon", category: 'want' as const },
  { id: "candy", name: "Candy", price: 5.0, iconName: "SweetIcon", category: 'want' as const },
  { id: "drink", name: "Drink", price: 5.0, iconName: "DrinkIcon", category: 'want' as const },
  { id: "combo_deal", name: "Combo Deal", price: 15.0, iconName: "FoodIcon", category: 'want' as const },
];

// Arcade shop items
export const ARCADE_SHOP_ITEMS = [
  { id: "tokens_10", name: "10 Tokens", price: 5.0, iconName: "GameIcon", category: 'want' as const },
  { id: "tokens_25", name: "25 Tokens", price: 10.0, iconName: "GameIcon", category: 'want' as const },
  { id: "tokens_50", name: "50 Tokens", price: 18.0, iconName: "GameIcon", category: 'want' as const },
  { id: "snacks", name: "Snacks", price: 4.0, iconName: "FoodIcon", category: 'want' as const },
  { id: "prize", name: "Prize Redemption", price: 8.0, iconName: "GiftIcon", category: 'want' as const },
];

// Pizza shop items
export const PIZZA_SHOP_ITEMS = [
  { id: "slice", name: "Pizza Slice", price: 3.0, iconName: "PizzaIcon", category: 'need' as const },
  { id: "whole_pizza", name: "Whole Pizza", price: 15.0, iconName: "PizzaIcon", category: 'social' as const },
  { id: "drink", name: "Drink", price: 2.0, iconName: "DrinkIcon", category: 'want' as const },
  { id: "garlic_knots", name: "Garlic Knots", price: 4.0, iconName: "FoodIcon", category: 'want' as const },
  { id: "dessert", name: "Dessert", price: 5.0, iconName: "SweetIcon", category: 'want' as const },
];
