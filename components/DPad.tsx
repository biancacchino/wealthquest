"use client";

export default function DPad({
  onMove
}: {
  onMove: (direction: "up" | "down" | "left" | "right") => void;
}) {
  return (
    <div className="dpad" aria-label="Movement controls">
      <span />
      <button onClick={() => onMove("up")}>↑</button>
      <span />
      <button onClick={() => onMove("left")}>←</button>
      <span />
      <button onClick={() => onMove("right")}>→</button>
      <span />
      <button onClick={() => onMove("down")}>↓</button>
      <span />
    </div>
  );
}
