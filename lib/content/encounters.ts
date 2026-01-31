import { EncounterDefinition } from "../engine/types";

export const encounters: EncounterDefinition[] = [
  {
    id: "corner-store",
    title: "Corner Store",
    context: "A cozy shop offers your favorite snack.",
    cost: 6,
    dayIndexHint: 1
  },
  {
    id: "arcade",
    title: "Arcade",
    context: "A new arcade game just dropped.",
    cost: 12,
    dayIndexHint: 3
  },
  {
    id: "friend-invite",
    title: "Friend Invite",
    context: "Movie night on Friday. Plan ahead!",
    cost: 10,
    dayIndexHint: 5
  }
];
