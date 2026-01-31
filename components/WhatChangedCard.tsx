"use client";

export default function WhatChangedCard({
  balance,
  goalETAWeeks,
  notes,
  onReflect
}: {
  balance: number;
  goalETAWeeks: number;
  notes: string[];
  onReflect: (value: "yes" | "unsure" | "no") => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal stack">
        <h3>What changed?</h3>
        <p>
          Remaining balance: <strong>${balance}</strong>
        </p>
        <p>
          Goal timeline: <strong>{goalETAWeeks}</strong> week(s) left
        </p>
        <ul>
          {notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
        <div className="stack">
          <p>Was this worth it?</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="button-primary" onClick={() => onReflect("yes")}>
              Yes
            </button>
            <button
              className="button-secondary"
              onClick={() => onReflect("unsure")}
            >
              Not sure
            </button>
            <button className="button-secondary" onClick={() => onReflect("no")}>
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
