"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type Phaser from "phaser";
import {
  UserProfile,
  MoneyState,
  ChoiceEvent,
  PlayerStats,
  EncounterCategory,
  InvestmentType,
} from "../types";
import {
  clearSession,
  saveUser,
  simulateMarketStep,
} from "../services/storage";
import { RetroBox } from "./RetroBox";
import { PhaserGame } from "./PhaserGame";
import { ENCOUNTERS } from "../phaser/data/encounters";
import { MoneyHUD } from "./MoneyHUD";
import { MONEY_GOALS } from "../constants";
import { ShopCartPopup, ShopItem } from "./ShopCartPopup";
import { BeachPopup } from "./BeachPopup";
import { useRetroAudio } from "../hooks/useRetroAudio";
import { BankPopup } from "./BankPopup";
import { NysePopup } from "./NysePopup";
import { LibraryPopup } from "./LibraryPopup";
import { ApartmentRestPopup } from "./ApartmentRestPopup";
import { GoalReachedPopup } from "./GoalReachedPopup";
import {
  COFFEE_SHOP_ITEMS,
  MALL_SHOP_ITEMS,
  MOVIES_SHOP_ITEMS,
  ARCADE_SHOP_ITEMS,
  PIZZA_SHOP_ITEMS,
} from "../constants";
import {
  BusIcon,
  MovieIcon,
  PizzaIcon,
  HomeIcon,
  CoffeeIcon,
  BankIcon,
  ArcadeIcon,
  MallIcon,
  BreadIcon,
  MilkIcon,
  FruitIcon,
  EggIcon,
  MedicineIcon,
} from "./PixelIcons";

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
  DOOR_BANK: "BANK",
  DOOR_BUS_BANK: "Bus Stop (Bank)",
  DOOR_ARCADE: "Arcade",
  DOOR_BUS_ARCADE: "Bus Stop (Arcade)",
  DOOR_BEACH: "Beach",
  DOOR_BUS_MALL: "Bus Stop (Mall)",
  // Fallbacks if needed
  DOOR_CORNER_STORE: "Corner Store",
};

const BUS_STOPS = [
  // Offsetting landing positions by +50 on Y to ensure player lands safely OUTSIDE the trigger zone
  { id: "DOOR_BUS_MOVIES", name: "Movies", icon: MovieIcon, x: 1435, y: 788 },
  {
    id: "DOOR_BUS_PIZZA",
    name: "Pizza Plaza",
    icon: PizzaIcon,
    x: 1449,
    y: 422,
  },
  {
    id: "DOOR_BUS_APARTMENT",
    name: "Residences",
    icon: HomeIcon,
    x: 515,
    y: 345,
  },
  {
    id: "DOOR_BUS_COFFEE",
    name: "Coffee District",
    icon: CoffeeIcon,
    x: 147,
    y: 665,
  },
  { id: "DOOR_BUS_BANK", name: "BANK", icon: BankIcon, x: 182, y: 864 },
  { id: "DOOR_BUS_ARCADE", name: "Arcade", icon: ArcadeIcon, x: 665, y: 885 },
  { id: "DOOR_BUS_MALL", name: "Mall", icon: MallIcon, x: 793, y: 739 },
];

// Market shop items
const MARKET_SHOP_ITEMS: ShopItem[] = [
  {
    id: "bread",
    name: "Bread",
    price: 2.0,
    iconName: "BreadIcon",
    category: "need",
  },
  {
    id: "milk",
    name: "Milk",
    price: 1.5,
    iconName: "MilkIcon",
    category: "need",
  },
  {
    id: "fruit",
    name: "Fruit",
    price: 2.5,
    iconName: "FruitIcon",
    category: "need",
  },
  {
    id: "eggs",
    name: "Eggs",
    price: 1.8,
    iconName: "EggIcon",
    category: "need",
  },
  {
    id: "medicine",
    name: "Medicine",
    price: 5.0,
    iconName: "MedicineIcon",
    category: "need",
  },
];

// Compute player stats from money state - reflects Wealthsimple's tone of insights, not scores
const computeStats = (money: MoneyState): PlayerStats => {
  const history = money.history;

  // Base stats when no history
  if (history.length === 0) {
    return {
      futurePreparedness: 50, // Start neutral
      financialMindfulness: 50,
    };
  }

  // --- Future Preparedness ---
  // Measures: goal progress, skip ratio (delayed gratification), balance buffer

  // Total balance for calculations (cash on hand + bank savings)
  const totalBalance = money.balance + (money.bankBalance || 0);

  // Goal progress (0-100): How close to achieving the goal (based on bank savings)
  const safeSavings = money.bankBalance || 0;
  const goalProgress = Math.min(100, (safeSavings / money.goal.cost) * 100);

  // Skip ratio (0-100): Higher skips = better delayed gratification
  const totalChoices = history.length;
  const skips = history.filter((e) => e.choice === "skip").length;
  const skipRatio = totalChoices > 0 ? (skips / totalChoices) * 100 : 50;

  // Buffer score (0-100): Having money above $0 shows emergency mindset
  // $25+ buffer = 100%, $0 = 0%
  const bufferScore = Math.min(100, (totalBalance / 25) * 100);

  // Weighted calculation for Future Preparedness
  const futurePreparedness = Math.round(
    goalProgress * 0.5 + skipRatio * 0.3 + bufferScore * 0.2,
  );

  // --- Financial Mindfulness ---
  // Measures: needs vs wants ratio (weighted by cost), balanced decisions, variety of choices

  const purchases = history.filter((e) => e.choice === "buy");

  // Cost-weighted needs score: larger purchases have more impact
  let needsScore = 50;
  if (purchases.length > 0) {
    const totalSpent = purchases.reduce((sum, e) => sum + (e.cost || 0), 0);

    if (totalSpent > 0) {
      // Weight each category by its cost contribution
      // Needs = +1.0, Social = random 0.3-0.5 (slightly negative to neutral), Wants = 0
      let weightedSum = 0;
      purchases.forEach((e) => {
        const cost = e.cost || 0;
        let categoryWeight = 0;

        if (e.category === "need") {
          categoryWeight = 1.0;
        } else if (e.category === "social") {
          // Random between slightly negative (0.3) and neutral (0.5)
          categoryWeight = Math.random() < 0.5 ? 0.3 : 0.5;
        } else {
          // 'want' category
          categoryWeight = 0;
        }

        // Weight by cost relative to total spending
        weightedSum += categoryWeight * (cost / totalSpent);
      });

      needsScore = Math.min(100, weightedSum * 100);
    }
  }

  // Balanced decisions (0-100): Not always buying OR always skipping shows thoughtfulness
  // Perfect balance (50/50) = 100, all one way = lower
  const buyRatio = totalChoices > 0 ? purchases.length / totalChoices : 0.5;
  const balanceScore = 100 - Math.abs(buyRatio - 0.5) * 200; // 50/50 = 100, 100/0 = 0

  // Variety score (0-100): Engaging with different encounter types
  const uniqueEncounters = new Set(history.map((e) => e.encounterId)).size;
  const varietyScore = Math.min(100, (uniqueEncounters / 3) * 100); // 3 encounter types = max

  // Weighted calculation for Financial Mindfulness
  const financialMindfulness = Math.round(
    needsScore * 0.4 + balanceScore * 0.4 + varietyScore * 0.2,
  );

  return {
    futurePreparedness: Math.max(0, Math.min(100, futurePreparedness)),
    financialMindfulness: Math.max(0, Math.min(100, financialMindfulness)),
  };
};

interface OverworldProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Overworld: React.FC<OverworldProps> = ({
  user,
  onLogout,
}: OverworldProps) => {
  const router = useRouter();
  const gameRef = useRef<Phaser.Game | null>(null);
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(
    null,
  );
  const [activeDoorId, setActiveDoorId] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [showLibraryMenu, setShowLibraryMenu] = useState(false);
  const [showApartmentRest, setShowApartmentRest] = useState(false);
  const [showNyse, setShowNyse] = useState(false);
  const [showGoalReachedPopup, setShowGoalReachedPopup] = useState(false);
  const goalPromptShownAtBalanceRef = useRef(0);
  const [modalStep, setModalStep] = useState<"choice" | "preview" | "result">(
    "choice",
  );
  const [resultNotes, setResultNotes] = useState<string[]>([]);
  const [money, setMoney] = useState<MoneyState>(() =>
    ensureMoneyState(user.gameState.money),
  );
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);
  const [showBeach, setShowBeach] = useState(false);
  const [workEarnings, setWorkEarnings] = useState<number | null>(null);
  const [workCooldownEnd, setWorkCooldownEnd] = useState<number>(0);
  const {
    startBackgroundMusic,
    playFootstep,
    playMoneyGained,
    playInvestmentMade,
    playEnterBuilding,
    playSleep,
  } = useRetroAudio();

  // Compute player stats from money history
  const playerStats = useMemo(() => computeStats(money), [money]);

  useEffect(() => {
    // Attempt to start music on mount (or first interaction dependent)
    const handleInteraction = () => {
      startBackgroundMusic();
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [startBackgroundMusic]);

  useEffect(() => {
    setMoney(ensureMoneyState(user.gameState.money));
  }, [user.username]);

  // Check if user has reached their savings goal
  useEffect(() => {
    const goalCost = money.goal?.cost || 0;
    const bankBalance = money.bankBalance || 0;

    // Only show popup if:
    // 1. Bank balance meets or exceeds goal cost
    // 2. Balance is higher than when we last showed the prompt (so they earned more)
    // 3. Not currently showing the popup
    if (
      goalCost > 0 &&
      bankBalance >= goalCost &&
      bankBalance > goalPromptShownAtBalanceRef.current &&
      !showGoalReachedPopup
    ) {
      setShowGoalReachedPopup(true);
    }
  }, [money.bankBalance, money.goal?.cost, showGoalReachedPopup]);

  const handleGoalPurchaseConfirm = () => {
    const goalCost = money.goal.cost;
    const newBankBalance =
      Math.round((money.bankBalance - goalCost) * 100) / 100;

    // Record the goal purchase as a choice event
    const event: ChoiceEvent = {
      id: createEventId(),
      encounterId: `goal_${money.goal.id}`,
      choice: "buy",
      cost: goalCost,
      category: "want", // Goals are typically wants
      deltas: {
        balanceAfter: money.balance,
        notes: [
          `🎉 Purchased ${money.goal.label} for $${goalCost.toFixed(2)}!`,
        ],
      },
    };

    const updatedMoney: MoneyState = {
      ...money,
      bankBalance: newBankBalance,
      history: [...money.history, event],
    };
    saveMoneyState(updatedMoney);

    setShowGoalReachedPopup(false);
    // Navigate to summary with completed flag
    router.push("/summary?completed=true");
  };

  const handleGoalPurchaseDecline = () => {
    // Record current balance so we don't re-prompt until they earn more
    goalPromptShownAtBalanceRef.current = money.bankBalance;
    setShowGoalReachedPopup(false);
  };

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
        // For market door, do NOT show shop immediately; wait for confirmation
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

  const closeDoor = (skipPushback = false) => {
    setActiveDoorId(null);
    setShowShop(false);
    setShowLibraryMenu(false);
    setShowApartmentRest(false);
    setMovementLocked(false);

    if (!skipPushback) {
      // Step back slightly to avoid re-triggering immediately
      const world = gameRef.current?.scene?.getScene("World") as any;
      if (world && world.pushPlayerBack) {
        world.pushPlayerBack();
      }
    }
  };

  const enterBuilding = () => {
    if (activeDoorId) {
      notifyDecision(activeDoorId, "yes");
    }

    if (activeDoorId === "DOOR_APARTMENT") {
      playSleep();
      setShowApartmentRest(true);
      return;
    }

    playEnterBuilding();

    if (activeDoorId === "DOOR_LIBRARY") {
      setShowLibraryMenu(true);
      return;
    }

    if (activeDoorId === "DOOR_BEACH") {
      setShowBeach(true);
      return;
    }

    if (activeDoorId === "DOOR_APARTMENT") {
      setShowApartmentRest(true);
      return;
    }

    // Check if it's a shop door
    if (activeDoorId === "DOOR_MARKET" || activeDoorId === "DOOR_MALL") {
      setShowShop(true);
      // Do not close door yet, shop is an overlay
      return;
    }
    // Handle Work building - earn random $15-$20 with cooldown
    if (activeDoorId === "DOOR_WORK") {
      const now = Date.now();

      // Check if still on cooldown
      if (now < workCooldownEnd) {
        const secondsLeft = Math.ceil((workCooldownEnd - now) / 1000);
        alert(`You need to rest! Come back in ${secondsLeft} seconds.`);
        closeDoor();
        return;
      }

      // Earn money and start 20 second cooldown
      const earned = Math.floor(Math.random() * 6) + 15; // 15-20 inclusive
      earnMoney(earned, "work");
      setWorkEarnings(earned);
      setWorkCooldownEnd(now + 20000);
      return;
    }

    // Handle Bank
    if (activeDoorId === "DOOR_BANK") {
      setShowBank(true);
      return;
    }

    // Handle NYSE
    if (activeDoorId === "DOOR_NYSE") {
      setShowNyse(true);
      return;
    }

    // Handle Shops
    if (
      activeDoorId === "DOOR_MARKET" ||
      activeDoorId === "DOOR_MALL" ||
      activeDoorId === "DOOR_COFFEE" ||
      activeDoorId === "DOOR_MOVIES" ||
      activeDoorId === "DOOR_ARCADE" ||
      activeDoorId === "DOOR_PIZZA"
    ) {
      setShowShop(true);
      // Do not close door yet, shop is an overlay
      return;
    }

    // TODO: Navigate to building Scene or Page
    console.log(`Entering ${DOOR_MAPPING[activeDoorId || ""]}`);
    alert(`Entered ${DOOR_MAPPING[activeDoorId || ""]}! (Placeholder)`);
    closeDoor();
  };

  const handleBusTravel = (destination: (typeof BUS_STOPS)[0]) => {
    if (!activeDoorId) return;

    const BUS_FARE = 2.0;

    if (money.balance < BUS_FARE) {
      alert(
        `The bus costs $${BUS_FARE.toFixed(2)}. You don't have enough money!`,
      );
      return;
    }

    // Deduct fare and log it
    const newBalance = Math.round((money.balance - BUS_FARE) * 100) / 100;

    const newBusEvent: ChoiceEvent = {
      id: createEventId(),
      encounterId: "bus_ride",
      choice: "buy",
      cost: BUS_FARE,
      category: "need", // Transport is a need
      deltas: {
        balanceAfter: newBalance,
        notes: [`Took the bus to ${destination.name}`],
      },
    };

    const updatedMoney: MoneyState = {
      ...money,
      balance: newBalance,
      history: [...money.history, newBusEvent],
    };
    saveMoneyState(updatedMoney);

    // 1. Set traveling state
    setIsTraveling(true);

    // 2. Notify game of "Yes" decision for the CURRENT door (to start its cooldown)
    notifyDecision(activeDoorId, "yes");

    // 3. Wait 5 seconds then teleport
    setTimeout(() => {
      const world = gameRef.current?.scene?.getScene("World") as any;
      if (world && world.teleportPlayer) {
        world.teleportPlayer(destination.x, destination.y);

        // Also set cooldown on destination so we don't trigger it immediately upon arrival
        if (world.handleDoorDecision) {
          // Treat destination as "visited" so it has a cooldown
          world.handleDoorDecision(destination.id, "yes");
        }
      }

      setIsTraveling(false);
      // Pass true to skip pushing player back to original bus top
      closeDoor(true);
    }, 5000);
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

  const handleMarketTick = useCallback(() => {
    if (!money.portfolio) return;
    const nextMoney = simulateMarketStep(money);
    saveMoneyState(nextMoney);
  }, [money, user]); // Added user dependency as saveMoneyState uses it

  const handleShopPurchase = (items: ShopItem[]) => {
    // Calculate total price
    const totalCost = items.reduce((sum, item) => sum + item.price, 0);

    // Round to 2 decimal places to avoid floating point issues
    // Deduct from balance (money on hand)
    const newBalance =
      Math.round(Math.max(0, money.balance - totalCost) * 100) / 100;

    // Create choice events for each item to record in history
    const newEvents: ChoiceEvent[] = items.map((item) => ({
      id: createEventId(),
      encounterId: activeDoorId || activeEncounterId || `shop_${item.id}`,
      choice: "buy",
      cost: item.price,
      // Default category to 'want' if not provided, though our ShopItem type has it optional.
      // Casting to EncounterCategory to match type expectation
      category: (item.category || "want") as EncounterCategory,
      deltas: {
        balanceAfter: newBalance, // technically this balance is after ALL purchases, but for history tracking individual items it's tricky.
        //Ideally we'd track the batch. For simplicity, we'll log the final balance on each or just the last one?
        // Let's just put the final balance on them.
        notes: [`Purchased ${item.name} for $${item.price.toFixed(2)}`],
      },
    }));

    const updatedMoney: MoneyState = {
      ...money,
      balance: newBalance,
      history: [...money.history, ...newEvents],
    };
    saveMoneyState(updatedMoney);

    // Handle encounter-based shop (Corner Store, Arcade, etc.)
    if (activeEncounterId) {
      markEncounterComplete(activeEncounterId);
      closeEncounter();
    }
    // Handle door-based shop (Market, Mall)
    else if (activeDoorId) {
      setShowShop(false);
      closeDoor();
    }
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

  // Add money from working - goes to balance (money on hand)
  const earnMoney = (amount: number, source: string) => {
    playMoneyGained();
    const newBalance = Math.round((money.balance + amount) * 100) / 100;
    const updatedMoney: MoneyState = {
      ...money,
      balance: newBalance,
    };
    saveMoneyState(updatedMoney);
    return newBalance;
  };

  // Deposit balance to bank
  const depositToBank = (amount: number) => {
    const depositAmount = Math.min(amount, money.balance);
    if (depositAmount <= 0) return;

    const newBankBalance =
      Math.round(((money.bankBalance || 0) + depositAmount) * 100) / 100;
    const updatedMoney: MoneyState = {
      ...money,
      balance: Math.round((money.balance - depositAmount) * 100) / 100,
      bankBalance: newBankBalance,
      bankHistory: [
        ...(money.bankHistory || []),
        {
          id: createEventId(),
          type: "deposit",
          amount: depositAmount,
          date: new Date().toISOString(),
          balanceAfter: newBankBalance,
        },
      ],
    };
    saveMoneyState(updatedMoney);
  };

  const handleDeposit = (amount: number) => {
    if (amount > money.balance) return;
    const newBankBalance = (money.bankBalance || 0) + amount;
    const updatedMoney: MoneyState = {
      ...money,
      balance: money.balance - amount,
      bankBalance: newBankBalance,
      bankHistory: [
        ...(money.bankHistory || []),
        {
          id: createEventId(),
          type: "deposit",
          amount,
          date: new Date().toISOString(),
          balanceAfter: newBankBalance,
        },
      ],
    };
    saveMoneyState(updatedMoney);
  };

  const handleWithdraw = (amount: number) => {
    if (amount > (money.bankBalance || 0)) return;
    const newBankBalance = (money.bankBalance || 0) - amount;
    const updatedMoney: MoneyState = {
      ...money,
      balance: money.balance + amount,
      bankBalance: newBankBalance,
      bankHistory: [
        ...(money.bankHistory || []),
        {
          id: createEventId(),
          type: "withdraw",
          amount,
          date: new Date().toISOString(),
          balanceAfter: newBankBalance,
        },
      ],
    };
    saveMoneyState(updatedMoney);
  };

  const handleInvest = (type: InvestmentType, amount: number) => {
    if (amount > money.balance) return;
    playInvestmentMade();

    // Create new portfolio object
    const currentAmount = money.portfolio?.[type] || 0;
    const newPortfolio = {
      ...(money.portfolio || {
        etf: 0,
        stocks: 0,
        bonds: 0,
        crypto: 0,
        minerals: 0,
        real_estate: 0,
        options: 0,
      }),
      [type]: currentAmount + amount,
    };

    const updatedMoney: MoneyState = {
      ...money,
      balance: Math.round((money.balance - amount) * 100) / 100,
      portfolio: newPortfolio,
      // We could add to history here but bankHistory is separate.
      // Maybe we need an investmentHistory? For now, we just track balance.
    };
    saveMoneyState(updatedMoney);
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
      category: activeEncounter.category,
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
      {/* Money HUD - vertically centered on right side */}
      <MoneyHUD
        money={money}
        stats={playerStats}
        onGoalClick={() => setShowGoalPicker(true)}
        className="absolute top-1/2 right-4 -translate-y-1/2 z-20"
      />

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-6 z-10">
        <PhaserGame
          onEncounter={handleEncounter}
          onReady={handleGameReady}
          characterId={user.characterId}
          onFootstep={playFootstep}
        />
      </div>

      {activeDoorId &&
        !activeDoorId.includes("DOOR_BUS") &&
        !showLibraryMenu &&
        !showApartmentRest && (
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
      {activeDoorId &&
        !activeDoorId.includes("DOOR_BUS") &&
        !showShop &&
        !showBeach &&
        !showLibraryMenu &&
        !showApartmentRest && (
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
        <div
          className={`absolute inset-0 z-20 flex items-center justify-center p-4 ${isTraveling ? "bg-black" : "bg-black/60"}`}
        >
          {/* New Bubbly Blue Container */}
          <div className="bg-[#60a5fa] border-4 border-white rounded-[2rem] shadow-[0_0_0_4px_#3b82f6,0_10px_20px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden flex flex-col md:flex-row relative animate-bounce-in min-h-[400px]">
            {/* Left Side - Big Bus Icon */}
            <div
              className={`bg-[#3b82f6] md:w-1/3 p-6 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${isTraveling ? "w-full md:w-full" : ""}`}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-white"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white"></div>
                <div className="absolute top-1/2 left-1/4 w-3 h-3 rounded-full bg-white"></div>
              </div>

              <div className="relative z-10 text-white text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                  <BusIcon className="w-16 h-16 animate-pulse" />
                </div>
                {isTraveling ? (
                  <h2 className="text-3xl font-bold uppercase tracking-widest text-white drop-shadow-md font-sans mb-2">
                    Departing...
                  </h2>
                ) : (
                  <>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-white drop-shadow-md font-sans">
                      {DOOR_MAPPING[activeDoorId]
                        ?.replace("Bus Stop (", "")
                        .replace(")", "") || "Station"}
                    </h2>
                    <p className="text-xs text-blue-100 mt-2 font-sans opacity-80">
                      City Transit System
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Content */}
            {!isTraveling && (
              <div className="flex-1 p-6 md:p-8 bg-gradient-to-br from-blue-400 to-blue-500">
                <div className="flex flex-col h-full">
                  <h3 className="text-white font-black text-lg mb-4 uppercase drop-shadow-sm flex items-center gap-2">
                    <span>Select Destination</span>
                    <span className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full font-bold ml-auto shadow-sm">
                      $2.25 Fare
                    </span>
                  </h3>

                  {/* Button Grid (2 Columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {BUS_STOPS.filter((stop) => stop.id !== activeDoorId).map(
                      (stop) => (
                        <button
                          key={stop.id}
                          onClick={() => handleBusTravel(stop)}
                          className="bg-white hover:bg-yellow-300 text-blue-900 p-4 rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-3 border-2 border-transparent hover:border-white group min-h-[80px] w-full"
                        >
                          <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-white/50 transition-colors shrink-0">
                            <stop.icon className="w-8 h-8 text-blue-600 group-hover:text-blue-800" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <span className="block font-black text-sm uppercase tracking-tight leading-tight group-hover:text-black break-words">
                              {stop.name}
                            </span>
                          </div>
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (activeDoorId) notifyDecision(activeDoorId, "no");
                      closeDoor();
                    }}
                    className="mt-auto w-full bg-blue-900/40 hover:bg-red-500 hover:text-white text-white/90 py-4 rounded-xl font-bold uppercase text-sm tracking-widest transition-colors backdrop-blur-sm border-2 border-transparent hover:border-white/50"
                  >
                    Cancel Ride
                  </button>
                </div>
              </div>
            )}

            {/* Full width loading bar when traveling */}
            {isTraveling && (
              <div className="absolute bottom-0 left-0 w-full h-8 bg-blue-900">
                <div
                  className="h-full bg-yellow-400 animate-[width_5s_linear_forwards]"
                  style={{
                    width: "0%",
                    animationName: "grow",
                    animationDuration: "5s",
                    animationTimingFunction: "linear",
                    animationFillMode: "forwards",
                  }}
                ></div>
                <style>{`@keyframes grow { from { width: 0%; } to { width: 100%; } }`}</style>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHOCartPopup
          title={activeEncounter.title}
          items={activeEncounter.shopItems.map(item => ({ 
              ...item, 
              iconName: undefined // Mapping legacy items to new format if needed, or update legacy data
          }))}
          userBalance={money.balance}
          bankBalance={money.bankBalance}
          onPurchase={handleShopPurchase}
          onCancel={closeEncounter}
          shopType={"MARKET"} // Fallback
        />
      )}

      {/* SHOP POPUP FOR MARKET DOOR */}
      {showShop && activeDoorId === "DOOR_MARKET" && (
        <ShopCartPopup
          title="Market"
          items={MARKET_SHOP_ITEMS}
          userBalance={money.balance}
          bankBalance={money.bankBalance}
          onPurchase={handleShopPurchase}
          onCancel={closeDoor}
          shopType="MARKET"
        />
      )}

      {/* COFFEE POPUP FOR COFFEE SHOP DOOR */}
      {showShop && activeDoorId === "DOOR_COFFEE" && (
        <ShopCartPopup
          title="Coffee Shop"
          items={COFFEE_SHOP_ITEMS}
          userBalance={money.balance}
          bankBalance={money.bankBalance}
          onPurchase={handleShopPurchase}
          onCancel={closeDoor}
          shopType="COFFEE"
        />
      )}

      {/* MALL POPUP FOR MALL DOOR */}
      {showShop && activeDoorId === "DOOR_MALL" && (
        <ShopCartPopup
          title="Mall"
          items={MALL_SHOP_ITEMS}
          userBalance={money.balance}
          bankBalance={money.bankBalance}
          onPurchase={handleShopPurchase}
          onCancel={closeDoor}
          shopType="MALL"
        />
      )}

      {/* MOVIES POPUP FOR MOVIES DOOR */}
      {showShop && activeDoorId === "DOOR_MOVIES" && (
        <ShopCartPopup
          title="Movies"
          items={MOVIES_SHOP_ITEMS}
          userBalance={money.balance}
          bankBalance={money.bankBalance}
          onPurchase={handleShopPurchase}
          onCancel={closeDoor}
          shopType="MOVIES"
        />
      )}

      {/* ARCADE POPUP FOR ARCADE DOOR */}
      {showShop && activeDoorId === "DOOR_ARCADE" && (
        <ShopCartPopup
          title="Arcade"
          items={ARCADE_SHOP_ITEMS}
          userBalance={money.balance}
          bankBalance={money.bankBalance}
          onPurchase={handleShopPurchase}
          onCancel={closeDoor}
          shopType="MALL" // Arcade fits general mall/fun vibe
        />
      )}

      {/* PIZZA POPUP FOR PIZZA SHOP DOOR */}
      {showShop && activeDoorId === "DOOR_PIZZA" && (
        <ShopCartPopup
          title="Pizza Shop"
          items={PIZZA_SHOP_ITEMS}
          userBalance={money.balance}
          bankBalance={money.bankBalance}
          onPurchase={handleShopPurchase}
          onCancel={closeDoor}
          shopType="PIZZA"
        />
      )}

      {/* BEACH POPUP */}
      {showBeach && activeDoorId === "DOOR_BEACH" && (
        <BeachPopup
          onClose={() => {
            setShowBeach(false);
            closeDoor();
          }}
        />
      )}

      {/* LIBRARY POPUP */}
      {showLibraryMenu && (
        <LibraryPopup
          onClose={() => {
            setShowLibraryMenu(false);
            closeDoor(); // Automatically exit the building when closing library
          }}
        />
      )}

      {showApartmentRest && activeDoorId === "DOOR_APARTMENT" && (
        <ApartmentRestPopup
          money={money}
          onClose={() => {
            setShowApartmentRest(false);
            closeDoor();
          }}
          onGiveUp={() => {
            setShowApartmentRest(false);
            router.push("/summary?completed=false");
          }}
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
                  // Goal progress based on safe savings (bank balance)
                  const safeSavings = money.bankBalance || 0;
                  const progressPercent = Math.min(
                    100,
                    (safeSavings / goal.cost) * 100,
                  );
                  const amountNeeded = Math.max(0, goal.cost - safeSavings);

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
                          <span className="text-sm text-slate-900">
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
                          <span>${safeSavings.toFixed(0)} saved</span>
                          <span>
                            {amountNeeded === 0
                              ? "✓ Ready!"
                              : `$${amountNeeded.toFixed(0)} to go`}
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

      {/* WORK EARNINGS POPUP */}
      {workEarnings !== null && (
        <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-4">
          <div
            className="max-w-sm w-full text-center"
            style={{
              backgroundColor: "#9ccce8",
              border: "4px solid #5a98b8",
              borderRadius: "8px",
              boxShadow:
                "inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8, 8px 8px 0 rgba(0,0,0,0.3)",
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            <div
              className="px-4 py-3"
              style={{
                backgroundColor: "#5a98b8",
                borderRadius: "4px 4px 0 0",
                borderBottom: "2px solid #4888a8",
              }}
            >
              <span className="text-white text-xs font-bold">
                💼 Work Complete!
              </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-4xl">💰</div>
              <p className="text-sm text-gray-700">Great job! You earned:</p>
              <p className="text-2xl font-bold text-green-600">
                ${workEarnings}
              </p>
              <p className="text-[10px] text-gray-500">
                New cash balance: ${money.balance.toFixed(2)}
              </p>
              <p className="text-[10px] text-amber-600">
                💡 Deposit at the bank to keep it safe!
              </p>
              <p className="text-[10px] text-gray-400">
                Come back in 20 seconds to work again!
              </p>
              <button
                onClick={() => {
                  setWorkEarnings(null);
                  closeDoor();
                }}
                className="w-full py-3 text-xs font-bold text-white"
                style={{
                  backgroundColor: "#4888b0",
                  borderRadius: "20px",
                  border: "3px solid #3070a0",
                  boxShadow: "inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888",
                }}
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
      {/* BANK POPUP */}
      {showBank && (
        <BankPopup
          cashBalance={money.balance}
          bankBalance={money.bankBalance || 0}
          portfolio={money.portfolio}
          history={[...(money.history || []), ...(money.bankHistory || [])]}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onClose={() => {
            setShowBank(false);
            closeDoor();
          }}
        />
      )}

      {/* NYSE POPUP */}
      {showNyse && (
        <NysePopup
          cashBalance={money.balance}
          portfolio={money.portfolio}
          marketTrends={money.marketTrends}
          onInvest={handleInvest}
          onTick={handleMarketTick}
          onClose={() => {
            setShowNyse(false);
            closeDoor();
          }}
        />
      )}

      {/* GOAL REACHED POPUP */}
      {showGoalReachedPopup && (
        <GoalReachedPopup
          goal={money.goal}
          bankBalance={money.bankBalance}
          onConfirm={handleGoalPurchaseConfirm}
          onDecline={handleGoalPurchaseDecline}
        />
      )}
    </div>
  );
};

const ensureMoneyState = (moneyState?: MoneyState): MoneyState => {
  if (moneyState) {
    // Handle migration from old cash/bank/tfsa format
    const oldCash = (moneyState as any).cash;
    const oldBank = (moneyState as any).bank;
    const oldTfsa = (moneyState as any).tfsa;

    return {
      balance: moneyState.balance ?? oldCash ?? 25,
      bankBalance: moneyState.bankBalance ?? (oldBank ?? 0) + (oldTfsa ?? 0),
      portfolio: moneyState.portfolio || {
        etf: 0,
        stocks: 0,
        bonds: 0,
        crypto: 0,
        minerals: 0,
        real_estate: 0,
        options: 0,
      },
      marketTrends: moneyState.marketTrends || ({} as any),
      goal: moneyState.goal,
      history: moneyState.history || [],
      bankHistory: moneyState.bankHistory || [],
    };
  }
  return {
    balance: 25,
    bankBalance: 0,
    portfolio: {
      etf: 0,
      stocks: 0,
      bonds: 0,
      crypto: 0,
      minerals: 0,
      real_estate: 0,
      options: 0,
    },
    marketTrends: {} as any,
    goal: {
      id: "headphones",
      label: "Headphones",
      cost: 60,
    },
    history: [],
    bankHistory: [],
  };
};

const createEventId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};
