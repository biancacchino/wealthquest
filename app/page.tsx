"use client";

import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, CharacterId } from '../types';
import { getCurrentSession, setCurrentSession, saveUser, createInitialGameState } from '../services/storage';
import { LoginScreen } from '../components/LoginScreen';
import { IntroScene } from '../components/IntroScene';
import { CharacterSelect } from '../components/CharacterSelect';
import { LoadingScreen } from '../components/LoadingScreen';
import { Overworld } from '../components/Overworld';
import { RetroBox } from '../components/RetroBox';

// Ensure we are client-side only for this logic to avoid hydration mismatches with localStorage
export default function App() {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const sessionUser = getCurrentSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      setView(AppView.OVERWORLD);
    }
  }, []);

  if (!isClient) return null; // Avoid hydration mismatch

  const handleLoginSuccess = (user: UserProfile, isNew: boolean) => {
    setCurrentUser(user);
    if (isNew) {
      setView(AppView.INTRO);
    } else {
      setView(AppView.CONTINUE_PROMPT);
    }
  };

  const handleIntroComplete = () => {
    setView(AppView.CHAR_SELECT);
  };

  const handleCharacterSelected = (id: CharacterId) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, characterId: id };
    saveUser(updatedUser);
    setCurrentUser(updatedUser);
    setCurrentSession(updatedUser.username);
    setView(AppView.LOADING);
  };

  const handleContinue = (fresh: boolean) => {
    if (!currentUser) return;
    if (fresh) {
      const resetUser = { ...currentUser, characterId: null, gameState: createInitialGameState() };
      setCurrentUser(resetUser);
      saveUser(resetUser);
      setView(AppView.INTRO);
    } else {
      setCurrentSession(currentUser.username);
      setView(AppView.LOADING);
    }
  };

  const handleLoadComplete = () => {
    setView(AppView.OVERWORLD);
  };

  return (
    <div className="min-h-screen bg-black">
      {view === AppView.LOGIN && (
        <LoginScreen onSuccess={handleLoginSuccess} />
      )}

      {view === AppView.CONTINUE_PROMPT && currentUser && (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
          <RetroBox title="SAVE DATA DETECTED" className="max-w-md w-full">
            <p className="text-sm mb-6 leading-loose font-bold">
              Trainer {currentUser.username}, your journey was paused at {currentUser.gameState.location}. 
              Continue where you left off?
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleContinue(false)}
                className="bg-black text-white p-3 uppercase text-xs hover:bg-gray-800 border-4 border-black font-bold"
              >
                Continue Adventure
              </button>
              <button 
                onClick={() => handleContinue(true)}
                className="bg-red-600 text-white p-3 uppercase text-xs hover:bg-red-700 border-4 border-black font-bold"
              >
                Start New Save
              </button>
            </div>
          </RetroBox>
        </div>
      )}

      {view === AppView.INTRO && currentUser && (
        <IntroScene username={currentUser.username} onFinished={handleIntroComplete} />
      )}

      {view === AppView.CHAR_SELECT && (
        <CharacterSelect onSelected={handleCharacterSelected} />
      )}

      {view === AppView.LOADING && currentUser && (
        <LoadingScreen onLoadComplete={handleLoadComplete} characterName={currentUser.username} />
      )}

      {view === AppView.OVERWORLD && currentUser && (
        <Overworld user={currentUser} onLogout={() => setView(AppView.LOGIN)} />
      )}
    </div>
  );
}
