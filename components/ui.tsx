import { Fragment } from "react";

// Renders "plain **highlighted** plain" with the starred parts marked.
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

export function Kicker({ index, layer, note, color }: { index: string; layer: string; note: string; color: string }) {
  return (
    <p className="kicker mono">
      <span>{index}</span>
      <span className="swatch" style={{ background: color }} aria-hidden />
      <span>{layer} layer</span>
      <span className="kicker-note">· {note}</span>
    </p>
  );
}

export const pad = (n: number) => String(n).padStart(2, "0");
