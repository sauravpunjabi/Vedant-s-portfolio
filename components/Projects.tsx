"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/projects";
import { pad } from "./ui";

export function ProjectRow({ project: p, index }: { project: Project; index: number }) {
  return (
    <>
      <span className="prow-idx mono">{pad(index + 1)}</span>
      {p.cover && <img className="prow-thumb" src={p.cover} alt="" loading="lazy" decoding="async" />}
      <span className="prow-main">
        <span className="prow-title">{p.title || "Untitled project"}</span>
        <span className="prow-sum">{p.summary}</span>
        {p.stack.length > 0 && <span className="prow-stack mono">{p.stack.join("  ·  ")}</span>}
      </span>
      {p.stat && (
        <span className="prow-stat">
          <b>{p.stat}</b>
          <span className="mono">{p.statLabel}</span>
        </span>
      )}
      <span className="prow-arrow" aria-hidden>
        →
      </span>
    </>
  );
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const [hovered, setHovered] = useState<Project | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 });
  const sy = useSpring(y, { stiffness: 260, damping: 28 });

  if (!projects.length) {
    return (
      <div className="empty">
        <p className="mono">0 rows returned</p>
        <p>Nothing in the Gold layer yet. New projects land here as soon as they&rsquo;re published.</p>
      </div>
    );
  }

  return (
    <div
      onPointerMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
      }}
    >
      <ol className="plist">
        {projects.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
          >
            <Link
              href={`/projects/${p.slug}`}
              className="prow"
              onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(p)}
              onPointerLeave={() => setHovered(null)}
            >
              <ProjectRow project={p} index={i} />
            </Link>
          </motion.li>
        ))}
      </ol>

      <AnimatePresence>
        {hovered?.cover && (
          <motion.div
            key={hovered.id}
            className="pcursor"
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            aria-hidden
          >
            <img src={hovered.cover} alt="" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
