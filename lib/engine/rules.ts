import { v4 as uuidv4 } from "uuid";
import {
  ChoiceType,
  EncounterDefinition,
  GameState,
  TryItFirstPreview
} from "./types";
import { explainImpact } from "./explain";
import { forecast } from "./forecast";

export function simulateDecision(
  state: GameState,
  encounter: EncounterDefinition,
  choice: ChoiceType
) {
  const cost = choice === "buy" ? encounter.cost : 0;
  const nextBalance = Math.max(0, state.week.balance - cost);
  const goalSaved = Math.max(0, state.week.goalSaved + (state.week.balance - nextBalance));

  const nextState: GameState = {
    ...state,
    week: {
      ...state.week,
      dayIndex: Math.min(6, state.week.dayIndex + 1),
      balance: nextBalance,
      goalSaved,
      history: [...state.week.history],
      unlockedInsights: Array.from(new Set([...state.week.unlockedInsights, encounter.id]))
    }
  };

  const notes = explainImpact(state, encounter, choice);
  const { goalETAWeeks } = forecast(nextState);

  const event = {
    id: uuidv4(),
    dayIndex: state.week.dayIndex,
    encounterId: encounter.id,
    choice,
    cost: cost || undefined,
    deltas: {
      balanceAfter: nextBalance,
      goalETAWeeks,
      notes
    }
  };

  nextState.week.history.push(event);

  return { nextState, deltas: event.deltas, notes };
}

export function tryItFirstPreview(
  state: GameState,
  encounter: EncounterDefinition
): TryItFirstPreview {
  const previewBalance = Math.max(0, state.week.balance - encounter.cost);
  const days = [0, 1, 2].map((offset) => {
    const dayIndex = Math.min(6, state.week.dayIndex + offset);
    const dayLabel = `Day ${dayIndex + 1}`;
    const futureEvents = state.week.upcomingEvents.filter(
      (event) => event.dayIndex === dayIndex
    );
    const eventNotes = futureEvents.length
      ? futureEvents.map((event) => `Potential: ${event.label} ($${event.cost})`)
      : ["No planned events today."];
    return {
      dayLabel,
      balance: previewBalance,
      notes: eventNotes
    };
  });

  return {
    days,
    summary:
      "Preview only: if you bought this today, your balance would look like this for the next few days."
  };
}
