"use client";

import { LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { dirtySpellings, junkRows, skills } from "@/lib/content";
import { ease } from "./motion";

type Row = { key: string; raw: string; clean: string; group: string | null; reason?: string };

const cleanRows: Row[] = skills.flatMap((g) =>
  g.items.map((item) => ({ key: item, raw: dirtySpellings[item] ?? item, clean: item, group: g.group })),
);
const junk: Row[] = junkRows.map((j, i) => ({ key: `junk-${i}`, raw: j.raw, clean: j.raw, group: null, reason: j.reason }));

// Deterministic shuffle so server and client agree on the mess.
const rawOrder = [...cleanRows, ...junk]
  .map((row, i) => ({ row, k: (i * 7919 + 13) % 101 }))
  .sort((a, b) => a.k - b.k)
  .map(({ row }) => row);
const tilt = (i: number) => ((i * 37) % 13) - 6;

const stats = {
  rowsIn: rawOrder.length,
  nulls: junk.filter((r) => r.reason === "null").length,
  dupes: junk.filter((r) => r.reason === "duplicate").length,
  normalized: cleanRows.filter((r) => r.raw !== r.clean).length,
  rowsOut: cleanRows.length,
};

type Stage = "raw" | "cleaning" | "clean";

export function Skills() {
  const [stage, setStage] = useState<Stage>("raw");
  const bin = useRef<HTMLUListElement>(null);
  // Dragging only with a mouse/pen; on phones the chips must not block scrolling.
  const [canDrag, setCanDrag] = useState(false);
  useEffect(() => setCanDrag(matchMedia("(pointer: fine)").matches), []);

  const run = () => {
    if (stage === "raw") {
      setStage("cleaning");
      setTimeout(() => setStage("clean"), 900);
    } else if (stage === "clean") setStage("raw");
  };

  const chip = (row: Row, i: number) => {
    const showClean = stage !== "raw";
    const dropped = Boolean(row.reason) && stage === "cleaning";
    return (
      <motion.li
        key={row.key}
        layoutId={row.key}
        className={`chip${row.reason ? " chip-junk" : ""}${dropped ? " chip-dropped" : ""}${stage === "cleaning" && row.raw !== row.clean ? " chip-fixed" : ""}`}
        initial={false}
        animate={{ rotate: stage === "clean" ? 0 : tilt(i) }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        drag={stage === "raw" && canDrag}
        dragConstraints={bin}
        dragSnapToOrigin
        dragElastic={0.25}
        whileDrag={{ scale: 1.12, rotate: 0, zIndex: 5, cursor: "grabbing" }}
      >
        {showClean && !row.reason ? row.clean : row.raw}
        {dropped && <span className="chip-reason mono">{row.reason}</span>}
      </motion.li>
    );
  };

  return (
    <div className="skills">
      <div className="skills-bar">
        <p className="mono skills-status" aria-live="polite">
          {stage === "raw" && (
            <>
              <b>{stats.rowsIn} rows</b> · unvalidated · drag them around
            </>
          )}
          {stage === "cleaning" && <b>Running transform…</b>}
          {stage === "clean" && (
            <>
              <b>{stats.rowsIn} in</b> → {stats.nulls} nulls dropped · {stats.dupes} duplicate merged · {stats.normalized}{" "}
              normalized → <b>{stats.rowsOut} out</b>
            </>
          )}
        </p>
        <button className={`btn ${stage === "clean" ? "btn-line" : "btn-accent"}`} onClick={run} disabled={stage === "cleaning"}>
          {stage === "clean" ? "↺ Reset to raw" : stage === "cleaning" ? "Running…" : "▶ Run transform"}
        </button>
      </div>

      <LayoutGroup>
        {stage === "clean" ? (
          <div className="skill-groups">
            {skills.map((g, gi) => (
              <motion.section
                key={g.group}
                className="skill-group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease, delay: gi * 0.04 }}
              >
                <h3 className="mono">
                  {g.group} <span>{g.items.length}</span>
                </h3>
                <ul>{cleanRows.filter((r) => r.group === g.group).map(chip)}</ul>
              </motion.section>
            ))}
          </div>
        ) : (
          <ul ref={bin} className="bin" aria-label="Skills, unsorted">
            {rawOrder.map(chip)}
          </ul>
        )}
      </LayoutGroup>
    </div>
  );
}
