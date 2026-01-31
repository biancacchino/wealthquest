import { Goal } from "../lib/engine/types";

export default function GoalCompanion({
  goal,
  saved
}: {
  goal: Goal;
  saved: number;
}) {
  const progress = Math.min(100, Math.round((saved / goal.cost) * 100));
  return (
    <div className="card stack">
      <h4>Your goal</h4>
      <p>
        {goal.id === "headphones" && "Headphones"}
        {goal.id === "game" && "Game"}
        {goal.id === "outfit" && "Outfit"}
      </p>
      <div className="goal-bar">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p>
        ${saved} of ${goal.cost} saved
      </p>
    </div>
  );
}
