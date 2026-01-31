# MVP Spec — Pokémon-Style Financial Literacy Game (Empowerment Pillar)

## Product summary
A web-based, Pokémon-inspired “overworld + encounters” game that teaches kids/teens financial literacy through interactive decision scenarios. Players explore a small map, meet NPCs, and trigger “money encounters” (spending choices). The game uses simulations and calm explanations to show consequences (tradeoffs, goal delays) without shaming, blocking, or competitive gamification.

## Pillar alignment (Empowerment)
This project empowers young users by building practical skills: decision-making, planning, and understanding tradeoffs with a limited allowance cycle.

## Target user
Canadian kids/teens with allowance or limited spending money. Secondary user: parent/guardian who wants a calm tool that builds judgment, not obedience.

## Wealthsimple-aligned principles (non-negotiables)
- Autonomy: player always chooses; no hard “fail” states.
- Calm finance: no timers, no fear language, no streak pressure.
- Transparency: show “what changed” in plain language.
- Beginner-respect: no jargon, minimal numbers, use examples.
- No manipulation: no points/coins/leaderboards; progress is insight/unlocks.

---

# Core MVP loop
1. Onboarding: set weekly allowance + pick a goal (e.g., headphones).
2. Overworld: explore a small town map (grid movement).
3. Encounters: step onto special tiles or talk to NPCs to trigger scenarios.
4. Decision: Buy / Skip / “Try it first” (simulate) + optional reflection.
5. Consequence: show “What changed?” card (balance, goal ETA, upcoming events).
6. End of week: summary screen; prompt to replay the week with different choices.

---

# MVP features (must have)

## 1) Onboarding (2 minutes)
Inputs:
- Weekly allowance:  /  /  (preset buttons + custom)
- Savings goal: choose 1 of 3 (Headphones , Game , Outfit )
- Optional: choose “Play style” (more text vs more icons)

Output:
- Creates a Save File (localStorage)
- Starts Day 1 of 7

## 2) Overworld Map (Pokémon vibe, web-simple)
- Single page with a tile grid (e.g., 12x8) OR background image with snapped coordinates.
- Player moves with arrow keys (or on-screen d-pad on mobile).
- Collision is simple: cannot enter blocked tiles (buildings/walls).
- Interact key (Space/Enter) opens NPC dialogue if adjacent.

Tiles:
- Walkable paths
- 3 encounter tiles (Shop, Arcade, Friend Invite)
- 2 NPC tiles (Mentor, Parent)

## 3) Dialogue system (NPCs)
- Dialogue modal with 1–3 lines at a time.
- “Next” continues.
- Some dialogues trigger an encounter.

NPCs:
- Mentor NPC: explains concepts gently (“tradeoffs”, “goal delay”)
- Parent NPC: optional “Ask a parent” message (non-functional in MVP; just demonstrates flow)

## 4) Encounters (the learning engine)
Each encounter includes:
- Scenario title + short context
- Choice buttons: Buy / Skip / Try it first
- If Buy: apply cost, update state, show consequences
- If Skip: update state (no cost), show consequences
- Try it first: show a mini-simulation preview of the next 2–3 days, then return to choice

Encounters (MVP set of 3):
1) Corner Store: “Snack for ”
2) Arcade: “New game for ”
3) Friend Invite: “Movie night on Friday costs ” (shows planning ahead)

## 5) “What Changed?” card (post-choice)
Always show a calm explanation card after any decision:
- Remaining balance (simple)
- Goal progress status (visual + “X weeks left”)
- 1–2 plain-language lines:
  - “Buying this means you may not afford movie night.”
  - “Skipping keeps you on track for your goal.”

Optional reflection (no scoring):
- “Was this worth it?” Yes / Not sure / No
Store in history.

## 6) End-of-week summary
After Day 7 (or when player taps “Finish Week”):
- Timeline of key choices (3–5 items)
- Goal status
- A neutral recap:
  - “You chose 2 purchases and skipped 1.”
  - “Your goal is 2 weeks away at this pace.”
- Button: “Replay Week” (reset week, keep settings)

## 7) Save/Continue (localStorage)
- Save after every encounter.
- Home screen shows:
  - Continue
  - New Game (resets save)

---

# Nice-to-have (only if time permits)
- Sound effects (Howler.js)
- Simple character customization (choose avatar color)
- Additional scenario pack (1–2 more encounters)
- Accessibility toggle: “simple words” mode

---

# Explicit non-goals (do NOT build)
- Banking integration, transactions, KYC
- Login/accounts (unless trivial with Supabase)
- Points/XP/leaderboards/streaks
- Investing, crypto, debt, interest lessons

---

# Data model (TypeScript interfaces)

## GameState
- version: number
- createdAt: string
- settings:
  - weeklyAllowance: number
  - goal:
    - id: 'headphones'|'game'|'outfit'
    - cost: number
- week:
  - dayIndex: number (0..6)
  - balance: number
  - goalSaved: number (optional; can derive as allowance - spending if you prefer)
  - upcomingEvents: { id, dayIndex, label, cost }[]
  - history: ChoiceEvent[]
  - unlockedInsights: string[] (used instead of XP)

## ChoiceEvent
- id: string
- dayIndex: number
- encounterId: string
- choice: 'buy'|'skip'
- cost?: number
- reflection?: 'yes'|'unsure'|'no'
- deltas:
  - balanceAfter: number
  - goalETAWeeks: number
  - notes: string[] (the “What changed?” lines)

---

# Money Engine (pure functions)
Create a /lib/engine module that exports:
- simulateDecision(state, encounter, choice) -> { nextState, deltas, notes }
- forecast(state) -> { goalETAWeeks, canAffordEventIds: string[] }
- explainImpact(state, encounter, choice) -> string[] (plain language)
- tryItFirstPreview(state, encounter) -> Preview (next 2–3 days summary)

Rules (simple but consistent):
- Weekly allowance is loaded at start of week as initial balance.
- Purchases reduce balance immediately.
- Goal ETA can be computed by:
  - remainingGoal = goalCost - goalSaved
  - weeklySavingsRate = (weeklyAllowance - avgWeeklySpendEstimate)
  - For MVP: approximate using current remaining balance + expected future event costs.
Keep it transparent and explain assumptions in text.

---

# Screens / Routes (Next.js)
- / (Home): Continue / New Game
- /onboarding: allowance + goal selection
- /game: overworld + dialogues + encounters
- /summary: end-of-week recap

---

# Component outline
- components/
  - OverworldMap.tsx
  - PlayerSprite.tsx
  - NPC.tsx
  - DialogueModal.tsx
  - EncounterModal.tsx
  - WhatChangedCard.tsx
  - GoalCompanion.tsx (visual goal progress)
  - DPad.tsx (mobile controls)
- lib/
  - engine/
    - types.ts
    - rules.ts
    - explain.ts
    - forecast.ts
  - storage.ts (load/save localStorage)
  - content/
    - encounters.ts (scenario text + costs)
    - dialogues.ts (NPC lines)

---

# MVP acceptance criteria (definition of done)
1) A new user can set allowance + choose a goal and start playing.
2) Player can move on the overworld and trigger all 3 encounters.
3) Each encounter supports Buy/Skip and shows a “What Changed?” explanation.
4) “Try it first” shows a preview (even if simple) and returns to choice.
5) Progress persists on refresh via localStorage.
6) End-of-week summary screen renders and offers Replay Week.
7) No points/XP/leaderboards; tone remains neutral and calm.

---

# Demo script (90 seconds)
1) “This is a Pokémon-style world where choices are the gameplay.”
2) Show onboarding: allowance + goal.
3) Walk to Shop encounter: hit “Try it first” preview.
4) Buy snack: show “What changed?” (balance + goal delay).
5) Walk to Movie invite: show planning ahead.
6) End-of-week summary: “Different choices, different outcomes—no shame.”
7) Close: “Empowerment through decision-making, aligned with Wealthsimple values.”

