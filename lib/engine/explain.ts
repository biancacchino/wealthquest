import { EncounterDefinition, GameState, ChoiceType } from "./types";
import { forecast } from "./forecast";

export function explainImpact(
  state: GameState,
  encounter: EncounterDefinition,
  choice: ChoiceType
) {
  const notes: string[] = [];
  if (choice === "buy") {
    notes.push(`Buying this uses $${encounter.cost} from your balance.`);
  } else {
    notes.push("Skipping keeps your balance the same for now.");
  }

  const predictedState: GameState = {
    ...state,
    week: {
      ...state.week,
      balance:
        choice === "buy"
          ? Math.max(0, state.week.balance - encounter.cost)
          : state.week.balance
    }
  };

  const { goalETAWeeks, canAffordEventIds } = forecast(predictedState);

  if (goalETAWeeks === 0) {
    notes.push("You are already at your goal amount.");
  } else {
    notes.push(`At this pace, your goal is about ${goalETAWeeks} week(s) away.`);
  }

  if (choice === "buy") {
    const upcomingLabels = predictedState.week.upcomingEvents
      .filter((event) => !canAffordEventIds.includes(event.id))
      .map((event) => event.label);
    if (upcomingLabels.length > 0) {
      notes.push(`This could make it harder to afford: ${upcomingLabels.join(", ")}.`);
    }
  }

  return notes;
}
