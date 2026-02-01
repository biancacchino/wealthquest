import { UserProfile, GameState, MoneyGoal, MoneyState, InvestmentType } from '../types';
import { SAVE_PREFIX } from '../constants';

const SESSION_KEY = 'ellehacks26_session';

const MARKETS: Record<InvestmentType, { volatility: number, trend: number }> = {
  etf: { volatility: 0.8, trend: 0.05 },
  stocks: { volatility: 2.0, trend: 0.02 },
  bonds: { volatility: 0.3, trend: 0.02 },
  minerals: { volatility: 1.2, trend: 0.01 },
  crypto: { volatility: 5.0, trend: 0.0 }, 
  real_estate: { volatility: 0.5, trend: 0.03 },
  options: { volatility: 8.0, trend: -0.1 }
};

export const createInitialGameState = (): GameState => ({
  level: 1,
  location: 'PALLET TOWN',
  inventory: ['POTION'],
  party: [],
  lastSaved: new Date().toISOString(),
  money: createInitialMoneyState()
});

const generateInitialHistory = (): Record<InvestmentType, number[]> => {
  const history: Record<string, number[]> = {};
  const points = 20;

  (Object.keys(MARKETS) as InvestmentType[]).forEach(type => {
    const config = MARKETS[type];
    const series = [100]; // Start at index 100
    for(let i=1; i<points; i++) {
        const prev = series[i-1];
        const changePercent = (Math.random() - 0.5) * config.volatility + config.trend;
        const next = Math.max(10, prev * (1 + changePercent / 100)); 
        series.push(next);
    }
    history[type] = series;
  });

  return history as Record<InvestmentType, number[]>;
}

const createInitialMoneyState = (): MoneyState => ({
  balance: 25,
  bankBalance: 0,
  portfolio: {
    etf: 0,
    stocks: 0,
    bonds: 0,
    crypto: 0,
    minerals: 0,
    real_estate: 0,
    options: 0
  },
  marketTrends: generateInitialHistory(),
  goal: getDefaultGoal(),
  history: [],
  bankHistory: []
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

// Returns a new MoneyState with updated market prices and portfolio values
export const simulateMarketStep = (state: MoneyState): MoneyState => {
  const newTrends = { ...state.marketTrends };
  const newPortfolio = { ...state.portfolio };

  // Initialize if missing (e.g. old save)
  if (!newTrends.etf) { // quick check
      const init = generateInitialHistory();
      Object.assign(newTrends, init);
  }

  (Object.keys(MARKETS) as InvestmentType[]).forEach(type => {
     const config = MARKETS[type];
     if (!newTrends[type]) newTrends[type] = [100];

     const series = [...newTrends[type]];
     const prev = series[series.length - 1];
     
     // Random movement
     const changePercent = (Math.random() - 0.5) * config.volatility + config.trend;
     const next = Math.max(10, prev * (1 + changePercent / 100)); // Floor at 10 to avoid 0
     
     series.push(next);
     if (series.length > 50) series.shift(); // Keep last 50 points
     
     newTrends[type] = series;

     // Update portfolio value if they own any
     // Formula: NewValue = OldValue * (NextPrice / PrevPrice)
     if (newPortfolio[type] > 0) {
        newPortfolio[type] = newPortfolio[type] * (next / prev);
     }
  });

  return {
      ...state,
      marketTrends: newTrends,
      portfolio: newPortfolio
  };
};
