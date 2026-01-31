"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type Phaser from "phaser";
import { UserProfile, MoneyState, ChoiceEvent } from "../types";
import { clearSession, saveUser } from "../services/storage";
import { RetroBox } from "./RetroBox";
import { PhaserGame } from "./PhaserGame";
import { ENCOUNTERS } from "../phaser/data/encounters";

// Mapping of Door IDs to display names
const DOOR_MAPPING: Record<string, string> = {
  DOOR_CORNER_STORE: "Corner Store",
  DOOR_ARCADE: "Arcade",
  DOOR_APARTMENT: "Apartment Complex",
  DOOR_MALL: "Mall",
  DOOR_WORK: "Workplace",
  DOOR_COFFEE: "Coffee Shop",
  DOOR_BUSSTOP: "Bus Stop",
};

interface OverworldProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Overworld: React.FC<OverworldProps> = ({
  user,
  onLogout,
}: OverworldProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(
    null,
  );
  const [activeDoorId, setActiveDoorId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<"choice" | "preview" | "result">(
    "choice",
  );
  const [resultNotes, setResultNotes] = useState<string[]>([]);
  const [money, setMoney] = useState<MoneyState>(() =>
    ensureMoneyState(user.gameState.money),
  );

  useEffect(() => {
    setMoney(ensureMoneyState(user.gameState.money));
  }, [user.username]);

  const handleLogout = () => {
    clearSession();
    onLogout();
  };

  const activeEncounter = useMemo(
    () =>
      ENCOUNTERS.find((encounter) => encounter.id === activeEncounterId) ||
      null,
    [activeEncounterId],
  );

  const setMovementLocked = useCallback((isLocked: boolean) => {
    const world = gameRef.current?.scene?.getScene("World") as
      | {
          setMovementLocked?: (locked: boolean) => void;
        }
      | undefined;
    if (world?.setMovementLocked) {
      world.setMovementLocked(isLocked);
    }
  }, []);

  const markEncounterComplete = useCallback((encounterId: string) => {
    const world = gameRef.current?.scene?.getScene("World") as
      | {
          markEncounterComplete?: (id: string) => void;
        }
      | undefined;
    if (world?.markEncounterComplete) {
      world.markEncounterComplete(encounterId);
    }
  }, []);

  const handleEncounter = useCallback(
    (encounterId: string) => {
      // Check if it's a door
      if (DOOR_MAPPING[encounterId]) {
        setActiveDoorId(encounterId);
        setMovementLocked(true);
        return;
      }

      // Otherwise handle as normal encounter
      setActiveEncounterId(encounterId);
      setModalStep("choice");
      setResultNotes([]);
      setMovementLocked(true);
    },
    [setMovementLocked],
  );

  const closeEncounter = () => {
    setActiveEncounterId(null);
    setModalStep("choice");
    setResultNotes([]);
    setMovementLocked(false);
  };

  const closeDoor = () => {
    setActiveDoorId(null);
    setMovementLocked(false);
    // Step back slightly to avoid re-triggering immediately
    const world = gameRef.current?.scene?.getScene("World") as any;
    if (world && world.pushPlayerBack) {
      world.pushPlayerBack();
    }
  };

  const enterBuilding = () => {
    // TODO: Navigate to building Scene or Page
    console.log(`Entering ${DOOR_MAPPING[activeDoorId || ""]}`);
    alert(`Entered ${DOOR_MAPPING[activeDoorId || ""]}! (Placeholder)`);
    closeDoor();
  };

  const saveMoneyState = (updatedMoney: MoneyState) => {
    setMoney(updatedMoney);
    const updatedUser = {
      ...user,
      gameState: {
        ...user.gameState,
        money: updatedMoney,
        lastSaved: new Date().toISOString(),
      },
    };
    saveUser(updatedUser);
  };

  const applyChoice = (choice: "buy" | "skip") => {
    if (!activeEncounter) return;

    const newBalance =
      choice === "buy"
        ? Math.max(0, money.balance - activeEncounter.cost)
        : money.balance;
    const goalETAWeeks = calculateGoalETAWeeks(
      newBalance,
      money.weeklyAllowance,
      money.goal.cost,
    );
    const notes = activeEncounter.notes[choice];

    const event: ChoiceEvent = {
      id: createEventId(),
      dayIndex: money.dayIndex,
      encounterId: activeEncounter.id,
      choice,
      cost: activeEncounter.cost,
      deltas: {
        balanceAfter: newBalance,
        goalETAWeeks,
        notes,
      },
    };

    const updatedMoney: MoneyState = {
      ...money,
      balance: newBalance,
      dayIndex: Math.min(6, money.dayIndex + 1),
      history: [...money.history, event],
    };

    saveMoneyState(updatedMoney);
    markEncounterComplete(activeEncounter.id);
    setResultNotes(notes);
    setModalStep("result");
  };

  const preview = useMemo(() => {
    if (!activeEncounter) return null;
    const buyBalance = Math.max(0, money.balance - activeEncounter.cost);
    const skipBalance = money.balance;
    return {
      buyETA: calculateGoalETAWeeks(
        buyBalance,
        money.weeklyAllowance,
        money.goal.cost,
      ),
      skipETA: calculateGoalETAWeeks(
        skipBalance,
        money.weeklyAllowance,
        money.goal.cost,
      ),
      buyBalance,
      skipBalance,
    };
  }, [activeEncounter, money.balance, money.weeklyAllowance, money.goal.cost]);

    const preview = useMemo(() => {
        if (!activeEncounter) return null;
        const buyBalance = Math.max(0, money.balance - activeEncounter.cost);
        const skipBalance = money.balance;
        return {
            buyETA: calculateGoalETAWeeks(buyBalance, money.weeklyAllowance, money.goal.cost),
            skipETA: calculateGoalETAWeeks(skipBalance, money.weeklyAllowance, money.goal.cost),
            buyBalance,
            skipBalance
        };
    }, [activeEncounter, money.balance, money.weeklyAllowance, money.goal.cost]);

    return (
        <div className="flex flex-col min-h-screen bg-[#0b0f19] text-white relative overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-6 z-10">
                <PhaserGame
                    onEncounter={handleEncounter}
                    onReady={(game: Phaser.Game) => {
                        gameRef.current = game;
                    }}
                    characterId={user.characterId}
                />
            </div>

      {activeEncounter && (
        <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center p-4">
          <RetroBox title={activeEncounter.title} className="max-w-lg w-full">
            <div className="space-y-4">
              <p className="text-sm font-bold">{activeEncounter.prompt}</p>

              {modalStep === "choice" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => applyChoice("buy")}
                    className="bg-green-600 text-white p-3 uppercase text-xs font-bold border-2 border-black"
                  >
                    Buy (${activeEncounter.cost})
                  </button>
                  <button
                    onClick={() => applyChoice("skip")}
                    className="bg-yellow-500 text-black p-3 uppercase text-xs font-bold border-2 border-black"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => setModalStep("preview")}
                    className="bg-blue-600 text-white p-3 uppercase text-xs font-bold border-2 border-black"
                  >
                    Try it first
                  </button>
                </div>
              )}

              {modalStep === "preview" && preview && (
                <div className="space-y-3 text-sm">
                  <p className="font-bold">Quick preview (next 2–3 days)</p>
                  <div className="bg-gray-100 text-black p-3 border-2 border-black">
                    <p>
                      Buy: balance ${preview.buyBalance}, goal ETA{" "}
                      {preview.buyETA} weeks
                    </p>
                    <p>
                      Skip: balance ${preview.skipBalance}, goal ETA{" "}
                      {preview.skipETA} weeks
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalStep("choice")}
                      className="flex-1 bg-gray-200 text-black p-2 uppercase text-xs font-bold border-2 border-black"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {modalStep === "result" && (
                <div className="space-y-3 text-sm">
                  <p className="font-bold">What changed?</p>
                  <ul className="list-disc pl-4">
                    {resultNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                  <p>Balance now: ${money.balance}</p>
                  <p>
                    Goal ETA:{" "}
                    {calculateGoalETAWeeks(
                      money.balance,
                      money.weeklyAllowance,
                      money.goal.cost,
                    )}{" "}
                    weeks
                  </p>
                  <button
                    onClick={closeEncounter}
                    className="w-full bg-black text-white p-2 uppercase text-xs font-bold border-2 border-black"
                  >
                    Keep exploring
                  </button>
                </div>
              )}
            </div>
          </RetroBox>
        </div>
      )}

      {activeDoorId && activeDoorId !== "DOOR_BUSSTOP" && (
        <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center p-4">
          <RetroBox
            title={DOOR_MAPPING[activeDoorId]}
            className="max-w-sm w-full"
          >
            <div className="space-y-6 text-center">
              <p className="text-sm">
                Would you like to enter{" "}
                <strong>{DOOR_MAPPING[activeDoorId]}</strong>?
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={enterBuilding}
                  className="bg-green-600 hover:bg-green-500 text-white p-3 uppercase text-xs font-bold border-2 border-black transition-colors"
                >
                  Yes, Enter
                </button>
                <button
                  onClick={closeDoor}
                  className="bg-red-600 hover:bg-red-500 text-white p-3 uppercase text-xs font-bold border-2 border-black transition-colors"
                >
                  No, Stay Outside
                </button>
              </div>
            </div>
          </RetroBox>
        </div>
      )}

      {/* BUS STOP SPECIAL POPUP */}
      {activeDoorId === "DOOR_BUSSTOP" && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-4">
          <div className="relative bg-white text-black p-4 rounded max-w-md w-full border-4 border-yellow-500">
            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-4 uppercase">
              Bus Schedule
            </h2>

            {/* Bus Schedule Image */}
            <div className="flex justify-center mb-4">
              <img
                src="/assets/ui/BusPop.png"
                alt="Bus Schedule"
                className="max-h-64 object-contain border-2 border-black"
              />
            </div>

            {/* Destination Buttons */}
            <div className="space-y-2">
              <p className="text-center font-bold mb-2">Select Destination:</p>

              <button
                onClick={() => {
                  alert("Traveling to Downtown...");
                  closeDoor();
                }}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-2 px-4 font-bold border-2 border-black flex justify-between"
              >
                <span>Downtown</span>
                <span>$2.50</span>
              </button>

              <button
                onClick={() => {
                  alert("Traveling to Residential District...");
                  closeDoor();
                }}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-2 px-4 font-bold border-2 border-black flex justify-between"
              >
                <span>Residential Area</span>
                <span>$2.50</span>
              </button>

              <button
                onClick={closeDoor}
                className="w-full bg-gray-200 hover:bg-gray-300 text-black py-2 px-4 font-bold border-2 border-black mt-4"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ensureMoneyState = (moneyState?: MoneyState): MoneyState => {
  if (moneyState) return moneyState;
  return {
    weeklyAllowance: 20,
    balance: 20,
    goal: {
      id: "headphones",
      label: "Headphones",
      cost: 60,
    },
    dayIndex: 0,
    history: [],
  };
};

const calculateGoalETAWeeks = (
  balance: number,
  weeklyAllowance: number,
  goalCost: number,
) => {
  if (goalCost <= balance) return 0;
  if (weeklyAllowance <= 0) return 99;
  return Math.ceil((goalCost - balance) / weeklyAllowance);
};

const createEventId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};
