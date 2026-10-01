"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/content";
import { ease } from "./motion";

const LINES = profile.name.toUpperCase().split(" ");
// Letters are heavy and wide at rest and get squeezed thin where the cursor is.
const REST = { wght: 820, wdth: 112 };
const NEAR = { wght: 160, wdth: 64 };

function useNameField(reduce: boolean | null) {
  const letters = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (reduce) return;
    const els = letters.current.filter(Boolean);
    const level = els.map(() => 0);
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let releaseTimer = 0;

    const tick = () => {
      const radius = Math.max(170, window.innerWidth * 0.22);
      const centers = els.map((el) => {
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
      let moving = false;
      els.forEach((el, i) => {
        const d = pointer ? Math.hypot(pointer.x - centers[i][0], pointer.y - centers[i][1]) : Infinity;
        const target = Math.max(0, 1 - d / radius) ** 1.2;
        level[i] += (target - level[i]) * 0.14;
        if (Math.abs(target - level[i]) > 0.002) moving = true;
        const t = level[i];
        el.style.fontVariationSettings = `"wght" ${REST.wght + (NEAR.wght - REST.wght) * t}, "wdth" ${REST.wdth + (NEAR.wdth - REST.wdth) * t}`;
      });
      frame = moving || pointer ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      wake();
    };
    const onLeave = () => {
      pointer = null;
      wake();
    };
    // Touch: a tap squeezes the letters near the finger, then they spring back.
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      onMove(e);
      clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(onLeave, 650);
    };

    const hero = document.getElementById("ingest");
    hero?.addEventListener("pointermove", onMove);
    hero?.addEventListener("pointerleave", onLeave);
    hero?.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(releaseTimer);
      hero?.removeEventListener("pointermove", onMove);
      hero?.removeEventListener("pointerleave", onLeave);
      hero?.removeEventListener("pointerdown", onDown);
    };
  }, [reduce]);

  return letters;
}

function Clock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const set = () => setNow(fmt.format(new Date()));
    set();
    const id = setInterval(set, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tnum">{now} IST</span>;
}

// Illustrative: how many records a 500M/day pipeline moves while you're on the page.
function Ticker() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const perMs = profile.recordsPerDay / 86_400_000;
    const start = performance.now();
    const fmt = new Intl.NumberFormat("en-US");
    const id = setInterval(() => {
      if (ref.current) ref.current.textContent = fmt.format(Math.floor((performance.now() - start) * perMs));
    }, 60);
    return () => clearInterval(id);
  }, []);
  return (
    <span ref={ref} className="tnum" aria-hidden>
      0
    </span>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const letters = useNameField(reduce);
  let n = 0;
  const perSecond = Math.round(profile.recordsPerDay / 86_400).toLocaleString("en-US");

  return (
    <section id="ingest" className="hero" aria-labelledby="hero-name">
      <div className="hero-meta mono">
        <span>Job #0001 — ingest</span>
        <span className="hide-sm">
          {profile.location} · {profile.coords}
        </span>
        <Clock />
      </div>

      <h1 id="hero-name" className="hero-name" aria-label={profile.name}>
        {LINES.map((line, li) => (
          <span key={line} className="hero-line" aria-hidden>
            {[...line].map((ch) => {
              const i = n++;
              return (
                <motion.span
                  key={i}
                  ref={(el) => {
                    if (el) letters.current[i] = el;
                  }}
                  className="hero-letter"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, ease, delay: 0.15 + li * 0.12 + i * 0.035 }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        ))}
      </h1>

      <div className="hero-foot">
        <motion.p
          className="hero-intro"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.7 }}
        >
          {profile.intro}
        </motion.p>

        <motion.div
          className="ticker"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.85 }}
        >
          <p className="mono label">Throughput</p>
          <p className="ticker-big">
            500M+ <span>records / day</span>
          </p>
          <p className="mono label">That&rsquo;s ≈ {perSecond} a second. Since you opened this page:</p>
          <p className="ticker-count mono">
            <Ticker />
            <span className="ticker-unit"> rows</span>
          </p>
        </motion.div>
      </div>

      <div className="hero-bottom mono">
        <a href="#bronze" className="scroll-cue">
          <span className="scroll-cue-line" aria-hidden />
          Scroll to run the pipeline
        </a>
        <span className="hide-sm hint-pointer">↖ Run your cursor across my name</span>
        <span className="hint-touch">Tap my name</span>
      </div>
    </section>
  );
}
