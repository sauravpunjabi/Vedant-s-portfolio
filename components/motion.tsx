"use client";

import { animate, MotionConfig, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

// Words slide up out of a mask, one after another.
export function SplitHeading({ text, as: Tag = "h2", className }: { text: string; as?: "h1" | "h2"; className?: string }) {
  return (
    <Tag className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="word-mask" aria-hidden>
          <motion.span
            className="word"
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.8, ease, delay: i * 0.07 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (!inView) {
      el.textContent = "0";
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease,
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <>
      <span ref={ref} aria-hidden>
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}

// A rubber stamp that lands with a thunk when scrolled into view.
export function Stamp({ children, rotate = -8, delay = 0 }: { children: React.ReactNode; rotate?: number; delay?: number }) {
  return (
    <motion.div
      className="stamp"
      initial={{ opacity: 0, scale: 1.5, rotate: rotate - 14 }}
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ type: "spring", stiffness: 420, damping: 17, delay }}
      whileHover={{ rotate: rotate + 6, scale: 1.04 }}
    >
      {children}
    </motion.div>
  );
}
