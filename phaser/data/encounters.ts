export type EncounterCategory = 'need' | 'want' | 'social';

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  emoji?: string;
  category?: EncounterCategory;
}

export interface EncounterDefinition {
  id: string;
  title: string;
  prompt: string;
  cost: number;
  category: EncounterCategory;
  tile: {
    x: number;
    y: number;
  };
  notes: {
    buy: string[];
    skip: string[];
  };
  shopItems: ShopItem[];
}

export const ENCOUNTERS: EncounterDefinition[] = [
  {
    id: 'corner_store',
    title: 'Corner Store',
    prompt: 'Snack for $4',
    cost: 4,
    category: 'want',
    tile: { x: 2, y: 2 },
    notes: {
      buy: [
        'You get a quick snack now, but your goal takes longer.',
        'Small choices can add up over the week.'
      ],
      skip: [
        'Skipping keeps your money for bigger plans.',
        'You stay on track for your goal.'
      ]
    },
    shopItems: [
      { id: 'chip_bag', name: 'Chip Bag', price: 2.00, emoji: '🥔', category: 'want' },
      { id: 'candy_bar', name: 'Candy Bar', price: 1.50, emoji: '🍫', category: 'want' },
      { id: 'soda', name: 'Soda', price: 2.50, emoji: '🥤', category: 'want' },
      { id: 'sandwich', name: 'Sandwich', price: 4.00, emoji: '🥪', category: 'need' },
    ]
  },
  {
    id: 'arcade',
    title: 'Arcade',
    prompt: 'New game for $8',
    cost: 8,
    category: 'want',
    tile: { x: 9, y: 2 },
    notes: {
      buy: [
        'Fun now means less money for later.',
        'Your goal may take another week.'
      ],
      skip: [
        'You keep your balance for your goal.',
        'Waiting can make big goals easier.'
      ]
    },
    shopItems: [
      { id: 'arcade_token', name: 'Arcade Tokens', price: 5.00, emoji: '🎮', category: 'want' },
      { id: 'slushie', name: 'Slushie', price: 2.00, emoji: '🧊', category: 'want' },
      { id: 'game_voucher', name: '5-Game Voucher', price: 10.00, emoji: '🎫', category: 'want' },
      { id: 'snacks', name: 'Arcade Snacks', price: 3.50, emoji: '🍿', category: 'want' },
    ]
  },
  {
    id: 'friend_invite',
    title: 'Friend Invite',
    prompt: 'Movie night on Friday costs $10',
    cost: 10,
    category: 'social',
    tile: { x: 6, y: 6 },
    notes: {
      buy: [
        'You spend money now and have less for your goal.',
        'Planning ahead helps avoid surprises.'
      ],
      skip: [
        'You keep your balance for your goal.',
        'Saying no can help with long-term plans.'
      ]
    },
    shopItems: [
      { id: 'movie_ticket', name: 'Movie Ticket', price: 10.00, emoji: '🎬', category: 'social' },
      { id: 'popcorn', name: 'Popcorn', price: 5.00, emoji: '🍿', category: 'want' },
      { id: 'candy', name: 'Theater Candy', price: 4.00, emoji: '🍬', category: 'want' },
      { id: 'drink', name: 'Soda Combo', price: 6.00, emoji: '🥤', category: 'want' },
    ]
  }
];
