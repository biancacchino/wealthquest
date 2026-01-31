export type GoalId = "headphones" | "game" | "outfit";

export type ChoiceType = "buy" | "skip";

export interface Goal {
  id: GoalId;
  cost: number;
}

export interface Settings {
  weeklyAllowance: number;
  goal: Goal;
  playStyle: "text" | "icons";
}

export interface UpcomingEvent {
  id: string;
  dayIndex: number;
  label: string;
  cost: number;
}

export interface ChoiceEvent {
  id: string;
  dayIndex: number;
  encounterId: string;
  choice: ChoiceType;
  cost?: number;
  reflection?: "yes" | "unsure" | "no";
  deltas: {
    balanceAfter: number;
    goalETAWeeks: number;
    notes: string[];
  };
}

export interface WeekState {
  dayIndex: number;
  balance: number;
  goalSaved: number;
  upcomingEvents: UpcomingEvent[];
  history: ChoiceEvent[];
  unlockedInsights: string[];
}

export interface GameState {
  version: number;
  createdAt: string;
  settings: Settings;
  week: WeekState;
}

export interface EncounterDefinition {
  id: string;
  title: string;
  context: string;
  cost: number;
  dayIndexHint?: number;
  tags?: string[];
}

export interface PreviewDay {
  dayLabel: string;
  balance: number;
  notes: string[];
}

export interface TryItFirstPreview {
  days: PreviewDay[];
  summary: string;
}
