"use client";

import { EncounterDefinition, TryItFirstPreview } from "../lib/engine/types";

export default function EncounterModal({
  encounter,
  preview,
  onTryIt,
  onDecision,
  onClose
}: {
  encounter: EncounterDefinition;
  preview?: TryItFirstPreview | null;
  onTryIt: () => void;
  onDecision: (choice: "buy" | "skip") => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal stack">
        <h3>{encounter.title}</h3>
        <p>{encounter.context}</p>
        <p>
          Cost: <strong>${encounter.cost}</strong>
        </p>
        {preview ? (
          <div className="card stack">
            <strong>Try it first preview</strong>
            <p>{preview.summary}</p>
            {preview.days.map((day) => (
              <div key={day.dayLabel}>
                <div className="badge">{day.dayLabel}</div>
                <p>Balance: ${day.balance}</p>
                <ul>
                  {day.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="button-primary" onClick={() => onDecision("buy")}>
            Buy
          </button>
          <button className="button-secondary" onClick={() => onDecision("skip")}>
            Skip
          </button>
          <button className="button-ghost" onClick={onTryIt}>
            Try it first
          </button>
          <button className="button-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
