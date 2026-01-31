"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { UserProfile, MoneyState, ChoiceEvent } from '../types';
import { clearSession, saveUser } from '../services/storage';
import { RetroBox } from './RetroBox';
import { PhaserGame } from './PhaserGame';
import { ENCOUNTERS } from '../phaser/data/encounters';

interface OverworldProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Overworld: React.FC<OverworldProps> = ({ user, onLogout }: OverworldProps) => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null);
    const [modalStep, setModalStep] = useState<'choice' | 'preview' | 'result'>('choice');
    const [resultNotes, setResultNotes] = useState<string[]>([]);
    const [money, setMoney] = useState<MoneyState>(() => ensureMoneyState(user.gameState.money));

    useEffect(() => {
        setMoney(ensureMoneyState(user.gameState.money));
    }, [user.username]);

  const handleLogout = () => {
    clearSession();
    onLogout();
  };

    const activeEncounter = useMemo(
        () => ENCOUNTERS.find((encounter) => encounter.id === activeEncounterId) || null,
        [activeEncounterId]
    );

    const setMovementLocked = useCallback((isLocked: boolean) => {
        const world = gameRef.current?.scene?.getScene('World') as {
            setMovementLocked?: (locked: boolean) => void;
        } | undefined;
        if (world?.setMovementLocked) {
            world.setMovementLocked(isLocked);
        }
    }, []);

    const markEncounterComplete = useCallback((encounterId: string) => {
        const world = gameRef.current?.scene?.getScene('World') as {
            markEncounterComplete?: (id: string) => void;
        } | undefined;
        if (world?.markEncounterComplete) {
            world.markEncounterComplete(encounterId);
        }
    }, []);

    const handleEncounter = useCallback((encounterId: string) => {
        setActiveEncounterId(encounterId);
        setModalStep('choice');
        setResultNotes([]);
        setMovementLocked(true);
    }, [setMovementLocked]);

    const closeEncounter = () => {
        setActiveEncounterId(null);
        setModalStep('choice');
        setResultNotes([]);
        setMovementLocked(false);
    };

    const saveMoneyState = (updatedMoney: MoneyState) => {
        setMoney(updatedMoney);
        const updatedUser = {
            ...user,
            gameState: {
                ...user.gameState,
                money: updatedMoney,
                lastSaved: new Date().toISOString()
            }
        };
        saveUser(updatedUser);
    };

    const applyChoice = (choice: 'buy' | 'skip') => {
        if (!activeEncounter) return;

        const newBalance = choice === 'buy'
            ? Math.max(0, money.balance - activeEncounter.cost)
            : money.balance;
        const goalETAWeeks = calculateGoalETAWeeks(newBalance, money.weeklyAllowance, money.goal.cost);
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
                notes
            }
        };

        const updatedMoney: MoneyState = {
            ...money,
            balance: newBalance,
            dayIndex: Math.min(6, money.dayIndex + 1),
            history: [...money.history, event]
        };

        saveMoneyState(updatedMoney);
        markEncounterComplete(activeEncounter.id);
        setResultNotes(notes);
        setModalStep('result');
    };

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

                            {modalStep === 'choice' && (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => applyChoice('buy')}
                                        className="bg-green-600 text-white p-3 uppercase text-xs font-bold border-2 border-black"
                                    >
                                        Buy (${activeEncounter.cost})
                                    </button>
                                    <button
                                        onClick={() => applyChoice('skip')}
                                        className="bg-yellow-500 text-black p-3 uppercase text-xs font-bold border-2 border-black"
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={() => setModalStep('preview')}
                                        className="bg-blue-600 text-white p-3 uppercase text-xs font-bold border-2 border-black"
                                    >
                                        Try it first
                                    </button>
                                </div>
                            )}

                            {modalStep === 'preview' && preview && (
                                <div className="space-y-3 text-sm">
                                    <p className="font-bold">Quick preview (next 2–3 days)</p>
                                    <div className="bg-gray-100 text-black p-3 border-2 border-black">
                                        <p>Buy: balance ${preview.buyBalance}, goal ETA {preview.buyETA} weeks</p>
                                        <p>Skip: balance ${preview.skipBalance}, goal ETA {preview.skipETA} weeks</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setModalStep('choice')}
                                            className="flex-1 bg-gray-200 text-black p-2 uppercase text-xs font-bold border-2 border-black"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modalStep === 'result' && (
                                <div className="space-y-3 text-sm">
                                    <p className="font-bold">What changed?</p>
                                    <ul className="list-disc pl-4">
                                        {resultNotes.map((note, idx) => (
                                            <li key={idx}>{note}</li>
                                        ))}
                                    </ul>
                                    <p>Balance now: ${money.balance}</p>
                                    <p>Goal ETA: {calculateGoalETAWeeks(money.balance, money.weeklyAllowance, money.goal.cost)} weeks</p>
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
        </div>
    );
};

const ensureMoneyState = (moneyState?: MoneyState): MoneyState => {
    if (moneyState) return moneyState;
    return {
        weeklyAllowance: 20,
        balance: 20,
        goal: {
            id: 'headphones',
            label: 'Headphones',
            cost: 60
        },
        dayIndex: 0,
        history: []
    };
};

const calculateGoalETAWeeks = (balance: number, weeklyAllowance: number, goalCost: number) => {
    if (goalCost <= balance) return 0;
    if (weeklyAllowance <= 0) return 99;
    return Math.ceil((goalCost - balance) / weeklyAllowance);
};

const createEventId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};
