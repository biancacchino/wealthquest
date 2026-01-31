import React, { useState } from "react";
import { UserProfile } from "../types";
import {
  loadUser,
  saveUser,
  createInitialGameState,
} from "../services/storage";

interface LoginScreenProps {
  onSuccess: (user: UserProfile, isNew: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    const existingUser = loadUser(username);

    if (existingUser) {
      // Simple password check (in real app, hash and compare)
      if (existingUser.passwordHash === password) {
        onSuccess(existingUser, false);
      } else {
        setError("Invalid credentials");
      }
    } else {
      // Create new user flow implicitly or explicitly
      // For this demo, let's treat unknown user + password as registration attempt
      // if the user wants to login, they should exist.
      // Let's add two buttons instead.
      setError("No saved game found.");
    }
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    const existingUser = loadUser(username);
    if (existingUser) {
      setError("User already exists");
      return;
    }

    const newUser: UserProfile = {
      username,
      passwordHash: password,
      characterId: null,
      gameState: createInitialGameState(),
    };
    saveUser(newUser);
    onSuccess(newUser, true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-900 text-white p-4">
      <div className="mb-8 text-center animate-pulse">
        <h1
          className="text-6xl text-yellow-400 font-bold mb-2 press-start tracking-tighter drop-shadow-md"
          style={{ textShadow: "4px 4px 0 #b45309" }}
        >
          WEALTH
        </h1>
        <h1
          className="text-6xl text-yellow-400 font-bold press-start tracking-tighter drop-shadow-md"
          style={{ textShadow: "4px 4px 0 #b45309" }}
        >
          QUEST
        </h1>
        <p className="text-[10px] text-yellow-200 mt-6 font-mono tracking-widest uppercase opacity-80">
          Play your life. Live the outcome.
        </p>
      </div>

      <div className="bg-gray-800 p-1 rounded border-4 border-gray-600 w-full max-w-lg">
        <div className="bg-gray-200 border-4 border-gray-400 p-8 text-black">
          {error && (
            <div className="text-red-600 text-xs mb-4 text-center">{error}</div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                className="w-full bg-white border-2 border-gray-400 p-4 font-mono uppercase focus:outline-none focus:border-black"
                maxLength={12}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-gray-400 p-4 font-mono focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex gap-2 mt-4">
              <div className="flex-1 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleRegister}
                  className="w-full bg-green-600 text-white p-2 text-xs font-bold hover:bg-green-700 border-b-4 border-green-800 active:border-b-0 active:mt-1"
                >
                  NEW ACCOUNT
                </button>
                <span className="text-[10px] text-gray-500 text-center font-bold">
                  Start fresh
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white p-2 text-xs font-bold hover:bg-blue-700 border-b-4 border-blue-800 active:border-b-0 active:mt-1"
                >
                  CONTINUE
                </button>
                <span className="text-[10px] text-gray-500 text-center font-bold">
                  Load your progress
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Made at ElleHacks 2026 by Lori, Bianca, Tracy
      </p>
    </div>
  );
};
