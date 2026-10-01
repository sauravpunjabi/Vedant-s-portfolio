"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/content";
import { ease } from "./motion";

export const stages = [
  { id: "ingest", label: "Ingest", note: "intro", color: "var(--ink)" },
  { id: "bronze", label: "Bronze", note: "about", color: "var(--bronze)" },
  { id: "silver", label: "Silver", note: "experience", color: "var(--silver)" },
  { id: "gold", label: "Gold", note: "projects", color: "var(--gold)" },
  { id: "serve", label: "Serve", note: "contact", color: "var(--c-yellow)" },
];

// Where each section starts, as a fraction of total scroll, so rail nodes line up with the fill.
function useStageStops(enabled: boolean) {
  const [stops, setStops] = useState(stages.map((_, i) => i / (stages.length - 1)));
  useEffect(() => {
    if (!enabled) return;
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setStops(
        stages.map((s) => {
          const el = document.getElementById(s.id);
          return el ? Math.min(1, Math.max(0, (el.getBoundingClientRect().top + window.scrollY) / max)) : 0;
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [enabled]);
  return stops;
}

export function SiteNav({ rail = false }: { rail?: boolean }) {
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const stops = useStageStops(rail);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    let i = 0;
    stops.forEach((s, j) => p + 0.02 >= s && (i = j));
    setActive(i);
  });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      menuButton.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="topbar">
        <Link href="/" className="brand" aria-label={`${profile.name}, home`}>
          <span className="brand-mark" aria-hidden>
            VS
          </span>
          <span className="brand-name mono">{profile.name}</span>
        </Link>

        {rail && (
          <span className="topbar-stage mono" aria-hidden>
            <span className="swatch" style={{ background: stages[active].color }} />
            {stages[active].label}
          </span>
        )}

        <nav className="topbar-links" aria-label="Primary">
          <a href={profile.resume} className="link-u mono" download>
            Résumé ↓
          </a>
          <a href="/#serve" className="btn btn-ink">
            Get in touch
          </a>
        </nav>

        <button
          ref={menuButton}
          className="menu-btn mono"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>

        {rail && <motion.div className="topbar-progress" style={{ scaleX: fill }} aria-hidden />}
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease }}
          >
            <ol>
              {stages.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: 0.12 + i * 0.05 }}
                >
                  <a ref={i === 0 ? firstLink : undefined} href={`/#${s.id}`} onClick={() => setOpen(false)}>
                    <span className="mono">0{i}</span>
                    {s.label}
                    <span className="menu-note mono">{s.note}</span>
                  </a>
                </motion.li>
              ))}
            </ol>
            <a className="btn btn-ink" href={profile.resume} download>
              Download résumé
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {rail && (
        <nav className="rail" aria-label="Sections">
          <div className="rail-track" aria-hidden>
            <motion.div className="rail-fill" style={{ scaleY: fill }} />
            <span className="rail-packet" />
            <span className="rail-packet" />
            <span className="rail-packet" />
          </div>
          <ol>
            {stages.map((s, i) => (
              <li key={s.id} style={{ top: `${stops[i] * 100}%` }}>
                <a href={`#${s.id}`} aria-current={active === i ? "location" : undefined}>
                  <span className="rail-dot" style={{ "--c": s.color } as React.CSSProperties} />
                  <span className="rail-label mono">
                    {s.label}
                    <span className="rail-note">{s.note}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </>
  );
}
