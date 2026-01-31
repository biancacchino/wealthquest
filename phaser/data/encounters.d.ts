export interface EncounterDefinition {
  id: string;
  title: string;
  prompt: string;
  cost: number;
  tile: {
    x: number;
    y: number;
  };
  notes: {
    buy: string[];
    skip: string[];
  };
}

export const ENCOUNTERS: EncounterDefinition[];
