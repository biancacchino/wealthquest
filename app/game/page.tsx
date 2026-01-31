"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import OverworldMap, { Tile } from "../../components/OverworldMap";
import DialogueModal from "../../components/DialogueModal";
import EncounterModal from "../../components/EncounterModal";
import WhatChangedCard from "../../components/WhatChangedCard";
import DPad from "../../components/DPad";
import GoalCompanion from "../../components/GoalCompanion";
import { encounters } from "../../lib/content/encounters";
import { dialogues } from "../../lib/content/dialogues";
import {
  EncounterDefinition,
  GameState,
  TryItFirstPreview
} from "../../lib/engine/types";
import { loadGameState, saveGameState } from "../../lib/storage";
import { simulateDecision, tryItFirstPreview } from "../../lib/engine/rules";

const width = 12;
const height = 8;

const blockedTiles = new Set(["0,0", "1,0", "2,0", "10,0", "11,0", "0,7", "11,7", "6,2", "6,3"]);
const encounterTiles = new Map([
  ["3,2", "corner-store"],
  ["8,3", "arcade"],
  ["5,6", "friend-invite"]
]);
const npcTiles = new Map([
  ["2,5", "mentor"],
  ["9,5", "parent"]
]);

const createTiles = (): Tile[][] => {
  const rows: Tile[][] = [];
  for (let y = 0; y < height; y += 1) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x += 1) {
      const key = `${x},${y}`;
      if (blockedTiles.has(key)) {
        row.push({ type: "blocked", label: "" });
      } else if (encounterTiles.has(key)) {
        row.push({ type: "encounter", id: encounterTiles.get(key), label: "E" });
      } else if (npcTiles.has(key)) {
        row.push({ type: "npc", id: npcTiles.get(key), label: "N" });
      } else {
        row.push({ type: "walkable", label: "" });
      }
    }
    rows.push(row);
  }
  return rows;
};

export default function GamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [activeEncounter, setActiveEncounter] = useState<EncounterDefinition | null>(null);
  const [preview, setPreview] = useState<TryItFirstPreview | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<string[] | null>(null);
  const [whatChanged, setWhatChanged] = useState<{
    balance: number;
    goalETAWeeks: number;
    notes: string[];
    eventId: string;
  } | null>(null);

  const tiles = useMemo(() => createTiles(), []);

  useEffect(() => {
    const saved = loadGameState();
    if (!saved) {
      router.push("/onboarding");
      return;
    }
    setGameState(saved);
  }, [router]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") movePlayer("up");
      if (event.key === "ArrowDown") movePlayer("down");
      if (event.key === "ArrowLeft") movePlayer("left");
      if (event.key === "ArrowRight") movePlayer("right");
      if (event.key === "Enter" || event.key === " ") {
        handleInteract();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const movePlayer = (direction: "up" | "down" | "left" | "right") => {
    if (activeEncounter || activeDialogue || whatChanged) return;
    setPlayerPosition((prev) => {
      const next = { ...prev };
      if (direction === "up") next.y -= 1;
      if (direction === "down") next.y += 1;
      if (direction === "left") next.x -= 1;
      if (direction === "right") next.x += 1;
      if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) {
        return prev;
      }
      const key = `${next.x},${next.y}`;
      if (blockedTiles.has(key)) {
        return prev;
      }

      const encounterId = encounterTiles.get(key);
      if (encounterId && gameState) {
        const alreadyDone = gameState.week.history.some(
          (event) => event.encounterId === encounterId
        );
        if (!alreadyDone) {
          const encounter = encounters.find((item) => item.id === encounterId) || null;
          if (encounter) {
            setActiveEncounter(encounter);
          }
        }
      }

      return next;
    });
  };

  const handleInteract = () => {
    if (activeEncounter || activeDialogue || whatChanged) return;
    const adjacent = [
      { x: playerPosition.x + 1, y: playerPosition.y },
      { x: playerPosition.x - 1, y: playerPosition.y },
      { x: playerPosition.x, y: playerPosition.y + 1 },
      { x: playerPosition.x, y: playerPosition.y - 1 }
    ];
    const npc = adjacent
      .map((pos) => npcTiles.get(`${pos.x},${pos.y}`))
      .find(Boolean);
    if (npc === "mentor") {
      setActiveDialogue(dialogues.mentor);
    }
    if (npc === "parent") {
      setActiveDialogue(dialogues.parent);
    }
  };

  const handleDecision = (choice: "buy" | "skip") => {
    if (!gameState || !activeEncounter) return;
    const { nextState, deltas } = simulateDecision(gameState, activeEncounter, choice);
    setGameState(nextState);
    saveGameState(nextState);
    const lastEvent = nextState.week.history[nextState.week.history.length - 1];
    setWhatChanged({
      balance: deltas.balanceAfter,
      goalETAWeeks: deltas.goalETAWeeks,
      notes: deltas.notes,
      eventId: lastEvent.id
    });
    setActiveEncounter(null);
    setPreview(null);
  };

  const handleReflection = (value: "yes" | "unsure" | "no") => {
    if (!gameState || !whatChanged) return;
    const updatedHistory = gameState.week.history.map((event) =>
      event.id === whatChanged.eventId ? { ...event, reflection: value } : event
    );
    const nextState: GameState = {
      ...gameState,
      week: {
        ...gameState.week,
        history: updatedHistory
      }
    };
    setGameState(nextState);
    saveGameState(nextState);
    setWhatChanged(null);
  };

  const handleFinishWeek = () => {
    router.push("/summary");
  };

  if (!gameState) {
    return <p>Loading your town...</p>;
  }

  return (
    <div className="stack">
      <h1>Town Square — Day {gameState.week.dayIndex + 1}</h1>
      <p>Balance: ${gameState.week.balance}</p>
      <div className="map-wrap">
        <OverworldMap tiles={tiles} playerPosition={playerPosition} />
        <div className="stack">
          <GoalCompanion goal={gameState.settings.goal} saved={gameState.week.goalSaved} />
          <div className="card stack">
            <h4>How to play</h4>
            <p>Move with arrow keys or the pad. Step on yellow tiles to trigger encounters.</p>
            <p>Press Space/Enter next to green NPCs to talk.</p>
          </div>
          <button className="button-secondary" onClick={handleFinishWeek}>
            Finish Week
          </button>
          <DPad onMove={movePlayer} />
        </div>
      </div>

      {activeDialogue ? (
        <DialogueModal
          title="Town Guide"
          lines={activeDialogue}
          onClose={() => setActiveDialogue(null)}
        />
      ) : null}

      {activeEncounter ? (
        <EncounterModal
          encounter={activeEncounter}
          preview={preview}
          onTryIt={() => setPreview(tryItFirstPreview(gameState, activeEncounter))}
          onDecision={handleDecision}
          onClose={() => {
            setActiveEncounter(null);
            setPreview(null);
          }}
        />
      ) : null}

      {whatChanged ? (
        <WhatChangedCard
          balance={whatChanged.balance}
          goalETAWeeks={whatChanged.goalETAWeeks}
          notes={whatChanged.notes}
          onReflect={handleReflection}
        />
      ) : null}
    </div>
  );
}
