import { GameState } from "./types";

export function forecast(state: GameState) {
  const remainingGoal = Math.max(
    0,
    state.settings.goal.cost - state.week.goalSaved
  );
  const futureEventCosts = state.week.upcomingEvents
    .filter((event) => event.dayIndex >= state.week.dayIndex)
    .reduce((sum, event) => sum + event.cost, 0);
  const expectedSavingsThisWeek = Math.max(0, state.week.balance - futureEventCosts);
  const weeklySavingsRate = Math.max(1, expectedSavingsThisWeek || state.settings.weeklyAllowance * 0.5);
  const goalETAWeeks = remainingGoal === 0 ? 0 : Math.ceil(remainingGoal / weeklySavingsRate);

  return {
    goalETAWeeks,
    canAffordEventIds: state.week.upcomingEvents
      .filter((event) => event.cost <= state.week.balance)
      .map((event) => event.id)
  };
}
