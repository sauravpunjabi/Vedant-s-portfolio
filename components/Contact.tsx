"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/content";

const QUERY = "SELECT channel, value FROM contact;";

const rows = [
  { channel: "email", value: profile.email, href: `mailto:${profile.email}`, copy: profile.email },
  { channel: "phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}`, copy: profile.phone },
  { channel: "linkedin", value: "in/vedant-singh-0162v0162", href: profile.linkedin, external: true },
  { channel: "credly", value: "vedant-singh / badges", href: profile.credly, external: true },
  { channel: "resume", value: "Vedant_Singh_Resume.pdf", href: profile.resume, download: true },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="copy mono"
      onClick={async () => {
        await navigator.clipboard?.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      aria-label={`Copy ${label}`}
    >
      <span aria-live="polite">{copied ? "copied ✓" : "copy"}</span>
    </button>
  );
}

export function ContactQuery() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const done = typed >= QUERY.length;

  useEffect(() => {
    if (!inView) return;
    if (reduce) return setTyped(QUERY.length);
    const id = setInterval(() => setTyped((t) => (t >= QUERY.length ? (clearInterval(id), t) : t + 1)), 32);
    return () => clearInterval(id);
  }, [inView, reduce]);

  return (
    <div ref={ref} className="psql">
      <div className="psql-bar mono" aria-hidden>
        <span className="psql-dots">
          <i />
          <i />
          <i />
        </span>
        psql — vedant@portfolio
      </div>
      <div className="psql-body mono">
        <p className="psql-line">
          <span className="psql-prompt">vedant=#</span> <span aria-label={QUERY}>{QUERY.slice(0, typed)}</span>
          {!done && <span className="caret" aria-hidden />}
        </p>

        <motion.table
          className="psql-table"
          initial="hidden"
          animate={done ? "shown" : "hidden"}
          variants={{ shown: { transition: { staggerChildren: 0.08 } } }}
        >
          <thead>
            <tr>
              <th scope="col">channel</th>
              <th scope="col">value</th>
              <th>
                <span className="sr-only">actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <motion.tr
                key={r.channel}
                variants={{ hidden: { opacity: 0, x: -10 }, shown: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.3 }}
              >
                <td className="psql-key">{r.channel}</td>
                <td>
                  <a
                    href={r.href}
                    {...(r.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    {...(r.download ? { download: true } : {})}
                  >
                    {r.value}
                    {r.external && <span aria-hidden> ↗</span>}
                  </a>
                </td>
                <td className="psql-act">{r.copy && <CopyButton value={r.copy} label={r.channel} />}</td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>

        <motion.p className="psql-foot" initial={{ opacity: 0 }} animate={{ opacity: done ? 1 : 0 }} transition={{ delay: 0.5 }}>
          ({rows.length} rows)
          <br />
          <span className="psql-prompt">vedant=#</span> <span className="caret" aria-hidden />
        </motion.p>
      </div>
    </div>
  );
}
