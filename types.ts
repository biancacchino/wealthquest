// Placeholder types required by other files if they are not fully replaced yet.
// Since we are replacing everything, this might not be needed, but good to have if we need to shim something.
// The user provided types.ts will be placed in the root or lib/types.ts depending on preference.
// Based on the user's attached files, they seem to be using a flat structure or specific folders.
// Let's stick to the user's provided structure as much as possible but adapt it to Next.js.
// The user provided an App.tsx which is typical for Vite/CRA, but we are in Next.js.
// We need to convert App.tsx logic into app/page.tsx.

export type CharacterId = 'green_cap' | 'black_cap';

export interface Monster {
  id: string;
  name: string;
  type: 'grass' | 'fire' | 'water';
  level: number;
  hp: { current: number; max: number };
  sprite: string;
}

export type MoneyGoalId = 'treat' | 'headphones' | 'game' | 'outfit' | 'biggoal';

export interface MoneyGoal {
  id: MoneyGoalId;
  label: string;
  cost: number;
}

export type EncounterCategory = 'need' | 'want' | 'social';

export interface ChoiceEvent {
  id: string;
  encounterId: string;
  choice: 'buy' | 'skip';
  cost: number;
  category?: EncounterCategory;
  reflection?: 'yes' | 'unsure' | 'no';
  deltas: {
    balanceAfter: number;
    notes: string[];
  };
}

export interface PlayerStats {
  futurePreparedness: number; // 0-100: How well player is building toward long-term goals
  financialMindfulness: number; // 0-100: Intentional decision-making awareness
}

export interface BankTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'interest';
  amount: number;
  date: string;
  balanceAfter: number;
}

export type InvestmentType = 'etf' | 'stocks' | 'bonds' | 'minerals' | 'crypto' | 'real_estate' | 'options';

export interface MoneyState {
  balance: number;
  bankBalance: number;
  portfolio: Record<InvestmentType, number>;
  marketTrends: Record<InvestmentType, number[]>;
  goal: MoneyGoal;
  history: ChoiceEvent[];
  bankHistory: BankTransaction[];
}

export interface GameState {
  level: number;
  location: string;
  inventory: string[];
  party: Monster[];
  lastSaved: string;
  money: MoneyState;
}

export interface UserProfile {
  username: string;
  passwordHash: string;
  characterId: CharacterId | null;
  gameState: GameState;
}

export enum AppView {
  LOGIN = 'LOGIN',
  INTRO = 'INTRO',
  CHAR_SELECT = 'CHAR_SELECT',
  CONTINUE_PROMPT = 'CONTINUE_PROMPT',
  LOADING = 'LOADING',
  OVERWORLD = 'OVERWORLD'
}
