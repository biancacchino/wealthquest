import { UserProfile, GameState, MoneyGoal, MoneyState } from '../types';
import { SAVE_PREFIX } from '../constants';

const SESSION_KEY = 'ellehacks26_session';

export const createInitialGameState = (): GameState => ({
  level: 1,
  location: 'PALLET TOWN',
  inventory: ['POTION'],
  party: [],
  lastSaved: new Date().toISOString(),
  money: createInitialMoneyState()
});

const createInitialMoneyState = (): MoneyState => ({
  cash: 25,
  bank: 0,
  tfsa: 0,
  goal: getDefaultGoal(),
  history: []
});

const getDefaultGoal = (): MoneyGoal => ({
  id: 'headphones',
  label: 'Headphones',
  cost: 60
});

export const saveUser = (user: UserProfile) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${SAVE_PREFIX}${user.username}`, JSON.stringify(user));
};

export const loadUser = (username: string): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(`${SAVE_PREFIX}${username}`);
  return data ? JSON.parse(data) : null;
};

export const setCurrentSession = (username: string) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, username);
};

export const getCurrentSession = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const username = sessionStorage.getItem(SESSION_KEY);
  if (!username) return null;
  return loadUser(username);
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
};
