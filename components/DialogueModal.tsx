"use client";

export default function DialogueModal({
  title,
  lines,
  onClose
}: {
  title: string;
  lines: string[];
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal stack">
        <h3>{title}</h3>
        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
        <button className="button-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
