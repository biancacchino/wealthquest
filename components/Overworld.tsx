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
import { MoneyHUD } from "./MoneyHUD";
import { MONEY_GOALS } from "../constants";
import { ShopPopup } from "./ShopPopup";

// Mapping of Door IDs to display names
const DOOR_MAPPING: Record<string, string> = {
  DOOR_APARTMENT: "Apartment",
  DOOR_BUS_APARTMENT: "Bus Stop (Apartment)",
  DOOR_WORK: "Work",
  DOOR_LIBRARY: "Library",
  DOOR_NYSE: "NYSE",
  DOOR_PIZZA: "Pizza Shop",
  DOOR_BUS_PIZZA: "Bus Stop (Pizza)",
  DOOR_MOVIES: "Movies",
  DOOR_BUS_MOVIES: "Bus Stop (Movies)",
  DOOR_MALL: "Mall",
  DOOR_MARKET: "Market",
  DOOR_COFFEE: "Coffee Shop",
  DOOR_BUS_COFFEE: "Bus Stop (Coffee)",
  DOOR_BANK: "Bank",
  DOOR_BUS_BANK: "Bus Stop (Bank)",
  DOOR_ARCADE: "Arcade",
  DOOR_BUS_ARCADE: "Bus Stop (Arcade)",
  DOOR_BEACH: "Beach",
  // Fallbacks if needed
  DOOR_CORNER_STORE: "Corner Store",
};

// Market shop items
const MARKET_SHOP_ITEMS = [
  { id: 'bread', name: 'Bread', price: 2.00, emoji: '🍞' },
  { id: 'milk', name: 'Milk', price: 1.50, emoji: '🥛' },
  { id: 'fruit', name: 'Fruit', price: 2.50, emoji: '🍎' },
  { id: 'eggs', name: 'Eggs', price: 1.80, emoji: '🥚' },
  { id: 'medicine', name: 'Medicine', price: 5.00, emoji: '💊' },
];

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
  const [showShop, setShowShop] = useState(false);
  const [modalStep, setModalStep] = useState<"choice" | "preview" | "result">(
    "choice",
  );
  const [resultNotes, setResultNotes] = useState<string[]>([]);
  const [money, setMoney] = useState<MoneyState>(() =>
    ensureMoneyState(user.gameState.money),
  );
  const [showGoalPicker, setShowGoalPicker] = useState(false);

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
      // Check if it's a door (including market)
      if (DOOR_MAPPING[encounterId]) {
        setActiveDoorId(encounterId);
        setMovementLocked(true);
        return;
      }

      // Otherwise handle as normal shop encounter
      setActiveEncounterId(encounterId);
      setShowShop(true);
      setMovementLocked(true);
    },
    [setMovementLocked],
  );

  const closeEncounter = () => {
    setActiveEncounterId(null);
    setShowShop(false);
    setModalStep("choice");
    setResultNotes([]);
    setMovementLocked(false);
  };

  const notifyDecision = (doorId: string, decision: "yes" | "no") => {
    const world = gameRef.current?.scene?.getScene("World") as any;
    if (world && world.handleDoorDecision) {
      world.handleDoorDecision(doorId, decision);
    }
  };

  const closeDoor = () => {
    setActiveDoorId(null);
    setShowShop(false);
    setMovementLocked(false);
    // Step back slightly to avoid re-triggering immediately
    const world = gameRef.current?.scene?.getScene("World") as any;
    if (world && world.pushPlayerBack) {
      world.pushPlayerBack();
    }
  };

  const enterBuilding = () => {
    if (activeDoorId) {
      notifyDecision(activeDoorId, "yes");
    }
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

  const handleShopPurchase = (itemId: string, itemName: string, price: number) => {
    const newBalance = Math.max(0, money.balance - price);
    const updatedMoney: MoneyState = {
      ...money,
      balance: newBalance,
    };
    saveMoneyState(updatedMoney);
    
    // Mark encounter complete and close shop
    if (activeEncounterId) {
      markEncounterComplete(activeEncounterId);
    }
    closeEncounter();
  };

  // Change savings goal
  const changeGoal = (goalId: string) => {
    const newGoal = MONEY_GOALS.find((g) => g.id === goalId);
    if (!newGoal) return;

    const updatedMoney: MoneyState = {
      ...money,
      goal: {
        id: newGoal.id,
        label: newGoal.label,
        cost: newGoal.cost,
      },
    };
    saveMoneyState(updatedMoney);
    setShowGoalPicker(false);
  };

  // Add money from working at encounters
  const earnMoney = (amount: number, source: string) => {
    const newBalance = money.balance + amount;
    const updatedMoney: MoneyState = {
      ...money,
      balance: newBalance,
    };
    saveMoneyState(updatedMoney);
    return newBalance;
  };

  const applyChoice = (choice: "buy" | "skip") => {
    if (!activeEncounter) return;

    const newBalance =
      choice === "buy"
        ? Math.max(0, money.balance - activeEncounter.cost)
        : money.balance;
    const notes = activeEncounter.notes[choice];

    const event: ChoiceEvent = {
      id: createEventId(),
      encounterId: activeEncounter.id,
      choice,
      cost: activeEncounter.cost,
      deltas: {
        balanceAfter: newBalance,
        notes,
      },
    };

    const updatedMoney: MoneyState = {
      ...money,
      balance: newBalance,
      history: [...money.history, event],
    };

    saveMoneyState(updatedMoney);
    markEncounterComplete(activeEncounter.id);
    setResultNotes(notes);
    setModalStep("result");
  };

  const handleGameReady = useCallback((game: Phaser.Game) => {
    gameRef.current = game;
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-white relative overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-6 z-10">
        <PhaserGame
          onEncounter={handleEncounter}
          onReady={handleGameReady}
          characterId={user.characterId}
        />
      </div>

      {activeDoorId && !activeDoorId.includes("DOOR_BUS") && (
        <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center p-4">
          <RetroBox
            title={DOOR_MAPPING[activeDoorId] || activeDoorId}
            className="max-w-sm w-full text-black"
          >
            <div className="space-y-6 text-center">
              <p className="text-sm">
                Would you like to enter{" "}
                <strong>{DOOR_MAPPING[activeDoorId] || activeDoorId}</strong>?
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={enterBuilding}
                  className="bg-green-600 hover:bg-green-500 text-white p-3 uppercase text-xs font-bold border-2 border-black transition-colors"
                >
                  Yes, Enter
                </button>
                <button
                  onClick={() => {
                    if (activeDoorId) notifyDecision(activeDoorId, "no");
                    closeDoor();
                  }}
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
      {activeDoorId && activeDoorId.includes("DOOR_BUS") && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-4">
          <div className="relative bg-white text-black p-4 rounded max-w-md w-full border-4 border-yellow-500">
            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-4 uppercase">
              {DOOR_MAPPING[activeDoorId]}
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

      {/* SHOP POPUP FOR ENCOUNTERS */}
      {showShop && activeEncounterId && activeEncounter && (
        <ShopPopup
          title={activeEncounter.title}
          items={activeEncounter.shopItems}
          userBalance={money.balance}
          onPurchase={handleShopPurchase}
          onCancel={closeEncounter}
        />
      )}

      {/* SHOP POPUP FOR MARKET DOOR */}
      {showShop && activeDoorId === "DOOR_MARKET" && (
        <ShopPopup
          title="Market"
          items={MARKET_SHOP_ITEMS}
          userBalance={money.balance}
          onPurchase={handleShopPurchase}
          onCancel={closeDoor}
        />
      )}

      {/* GOAL PICKER MODAL */}
      {showGoalPicker && (
        <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4">
          <div
            className="max-w-md w-full"
            style={{
              backgroundColor: "#9ccce8",
              border: "4px solid #5a98b8",
              borderRadius: "8px",
              boxShadow:
                "inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8, 8px 8px 0 rgba(0,0,0,0.3)",
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            {/* Title Bar */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                backgroundColor: "#5a98b8",
                borderRadius: "4px 4px 0 0",
                borderBottom: "2px solid #4888a8",
              }}
            >
              <span className="text-white text-xs font-bold tracking-wide">
                🎯 Choose Your Goal
              </span>
              <button
                onClick={() => setShowGoalPicker(false)}
                className="text-white/70 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Info message */}
              <div
                className="mb-4 p-3 text-center"
                style={{
                  backgroundColor: "#fffef8",
                  border: "3px solid #c8d8e8",
                  borderRadius: "4px",
                }}
              >
                <p className="text-[10px] text-gray-600">
                  Pick something to save for. Your progress carries over!
                </p>
              </div>

              {/* Goal Options */}
              <div className="space-y-2">
                {MONEY_GOALS.map((goal) => {
                  const isCurrentGoal = money.goal.id === goal.id;
                  const progressPercent = Math.min(
                    100,
                    (money.balance / goal.cost) * 100,
                  );
                  const amountNeeded = Math.max(0, goal.cost - money.balance);

                  return (
                    <button
                      key={goal.id}
                      onClick={() => changeGoal(goal.id)}
                      disabled={isCurrentGoal}
                      className={`w-full text-left transition-all ${isCurrentGoal ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
                      style={{
                        backgroundColor: isCurrentGoal ? "#d8f4d8" : "#fffef8",
                        border: `3px solid ${isCurrentGoal ? "#4ade80" : "#c8d8e8"}`,
                        borderRadius: "6px",
                        boxShadow: isCurrentGoal
                          ? "inset 2px 2px 0 #e8ffe8, inset -2px -2px 0 #a8d8a8"
                          : "inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8",
                      }}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">
                            {goal.emoji} {goal.label}
                          </span>
                          <span className="text-xs text-gray-600 font-bold">
                            ${goal.cost}
                          </span>
                        </div>
                        <p className="text-[8px] text-gray-500 mb-2">
                          {goal.description}
                        </p>

                        {/* Mini progress bar */}
                        <div
                          className="h-2 overflow-hidden mb-1"
                          style={{
                            backgroundColor: "#e8e8e0",
                            border: "1px solid #c0c0b0",
                            borderRadius: "2px",
                          }}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${progressPercent}%`,
                              backgroundColor:
                                progressPercent >= 100 ? "#4ade80" : "#58a8d0",
                            }}
                          />
                        </div>

                        <div className="flex justify-between text-[8px] text-gray-500">
                          <span>${money.balance} saved</span>
                          <span>
                            {amountNeeded === 0
                              ? "✓ Ready!"
                              : `$${amountNeeded} to go`}
                          </span>
                        </div>

                        {isCurrentGoal && (
                          <div className="mt-2 text-[8px] text-green-600 font-bold text-center">
                            ✓ Current Goal
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowGoalPicker(false)}
                className="w-full mt-4 py-3 text-xs font-bold transition-colors"
                style={{
                  backgroundColor: "#4888b0",
                  color: "white",
                  borderRadius: "20px",
                  border: "3px solid #3070a0",
                  boxShadow: "inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ensureMoneyState = (moneyState?: MoneyState): MoneyState => {
  if (moneyState) {
    return moneyState;
  }
  return {
    balance: 100,
    goal: {
      id: "headphones",
      label: "Headphones",
      cost: 60,
    },
    history: [],
  };
};

const createEventId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};
