"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveGameState } from "../../lib/storage";
import { GameState, GoalId } from "../../lib/engine/types";

const goals: { id: GoalId; label: string; cost: number }[] = [
  { id: "headphones", label: "Headphones", cost: 60 },
  { id: "game", label: "Game", cost: 30 },
  { id: "outfit", label: "Outfit", cost: 45 }
];

const allowanceOptions = [10, 15, 25];

export default function OnboardingPage() {
  const router = useRouter();
  const [weeklyAllowance, setWeeklyAllowance] = useState<number>(15);
  const [customAllowance, setCustomAllowance] = useState<string>("");
  const [goalId, setGoalId] = useState<GoalId>("headphones");
  const [playStyle, setPlayStyle] = useState<"text" | "icons">("text");

  const handleStart = () => {
    const allowance = customAllowance
      ? Math.max(1, Number(customAllowance))
      : weeklyAllowance;
    const goal = goals.find((goal) => goal.id === goalId) ?? goals[0];

    const state: GameState = {
      version: 1,
      createdAt: new Date().toISOString(),
      settings: {
        weeklyAllowance: allowance,
        goal: { id: goal.id, cost: goal.cost },
        playStyle
      },
      week: {
        dayIndex: 0,
        balance: allowance,
        goalSaved: 0,
        upcomingEvents: [
          {
            id: "friend-invite",
            dayIndex: 4,
            label: "Movie night",
            cost: 10
          }
        ],
        history: [],
        unlockedInsights: []
      }
    };

    saveGameState(state);
    router.push("/game");
  };

  return (
    <div className="stack">
      <h1>Set up your week</h1>
      <div className="card stack">
        <h2>Weekly allowance</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {allowanceOptions.map((value) => (
            <button
              key={value}
              className={
                weeklyAllowance === value && !customAllowance
                  ? "button-primary"
                  : "button-secondary"
              }
              onClick={() => {
                setWeeklyAllowance(value);
                setCustomAllowance("");
              }}
            >
              ${value}
            </button>
          ))}
        </div>
        <label>
          Custom amount
          <input
            type="number"
            value={customAllowance}
            onChange={(event) => setCustomAllowance(event.target.value)}
            placeholder="Enter a custom amount"
            style={{ marginTop: 8, padding: 8, borderRadius: 8, border: "1px solid #cbd5f5" }}
          />
        </label>
      </div>

      <div className="card stack">
        <h2>Savings goal</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {goals.map((goal) => (
            <button
              key={goal.id}
              className={goalId === goal.id ? "button-primary" : "button-secondary"}
              onClick={() => setGoalId(goal.id)}
            >
              {goal.label} (${goal.cost})
            </button>
          ))}
        </div>
      </div>

      <div className="card stack">
        <h2>Play style</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className={playStyle === "text" ? "button-primary" : "button-secondary"}
            onClick={() => setPlayStyle("text")}
          >
            More text
          </button>
          <button
            className={playStyle === "icons" ? "button-primary" : "button-secondary"}
            onClick={() => setPlayStyle("icons")}
          >
            More icons
          </button>
        </div>
      </div>

      <button className="button-primary" onClick={handleStart}>
        Start Day 1
      </button>
    </div>
  );
}
