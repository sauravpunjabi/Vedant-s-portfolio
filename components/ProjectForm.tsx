"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { saveProject } from "@/app/admin/actions";
import type { Project } from "@/lib/projects";
import { slugify } from "@/lib/slug";
import { ProjectRow } from "./Projects";

// Shrink covers in the browser so uploads stay small and fast.
async function shrinkImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file; // keep animation
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const encode = (type: string, q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
  let blob = await encode("image/webp", 0.82);
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg", 0.85); // Safari can't write WebP
  if (!blob) return file;
  return new File([blob], `cover.${blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type });
}

const fieldsOf = (p?: Project) => ({
  title: p?.title ?? "",
  slug: p?.slug ?? "",
  summary: p?.summary ?? "",
  period: p?.period ?? "",
  stat: p?.stat ?? "",
  statLabel: p?.statLabel ?? "",
  stack: p?.stack.join(", ") ?? "",
  highlights: p?.highlights.join("\n") ?? "",
  body: p?.body ?? "",
  repoUrl: p?.repoUrl ?? "",
  liveUrl: p?.liveUrl ?? "",
  published: p?.published ?? true,
});

export function ProjectForm({ project }: { project?: Project }) {
  const [state, dispatch, pending] = useActionState(saveProject, undefined);
  const [v, setV] = useState(() => fieldsOf(project));
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [cover, setCover] = useState<{ file: File | null; url: string }>({ file: null, url: project?.cover ?? "" });
  const [removeCover, setRemoveCover] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const errors = state?.errors ?? {};

  const set = (key: keyof ReturnType<typeof fieldsOf>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setDirty(true);
    setV((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "title" && !slugTouched ? { slug: slugify(String(value)) } : {}),
    }));
    if (key === "slug") setSlugTouched(true);
  };

  useEffect(() => {
    const first = Object.keys(state?.errors ?? {})[0];
    if (first) document.getElementById(first)?.focus();
  }, [state]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setImgBusy(true);
    try {
      const small = await shrinkImage(file);
      setCover((old) => {
        if (old.file) URL.revokeObjectURL(old.url);
        return { file: small, url: URL.createObjectURL(small) };
      });
      setRemoveCover(false);
      setDirty(true);
    } finally {
      setImgBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete("coverPicker");
    if (cover.file) fd.set("coverFile", cover.file);
    if (removeCover) fd.set("removeCover", "1");
    startTransition(() => dispatch(fd));
  };

  const preview: Project = {
    id: "preview",
    slug: v.slug,
    title: v.title,
    summary: v.summary || "Your one-line summary shows here.",
    period: v.period,
    stat: v.stat,
    statLabel: v.statLabel,
    stack: v.stack.split(",").map((s) => s.trim()).filter(Boolean),
    highlights: [],
    body: "",
    repoUrl: "",
    liveUrl: "",
    cover: removeCover ? "" : cover.url,
    published: v.published,
  };

  const field = (
    id: keyof ReturnType<typeof fieldsOf>,
    label: string,
    opts: { required?: boolean; help?: string; area?: number; type?: string; placeholder?: string; max?: number } = {},
  ) => {
    const props = {
      id,
      name: id,
      value: String(v[id]),
      onChange: set(id),
      required: opts.required,
      placeholder: opts.placeholder,
      maxLength: opts.max,
      "aria-invalid": Boolean(errors[id]),
      "aria-describedby": [errors[id] && `${id}-err`, opts.help && `${id}-help`].filter(Boolean).join(" ") || undefined,
    };
    return (
      <div className="field">
        <label htmlFor={id}>
          {label}
          {opts.required && <span aria-hidden> *</span>}
        </label>
        {opts.area ? <textarea rows={opts.area} {...props} /> : <input type={opts.type ?? "text"} {...props} />}
        {opts.help && (
          <p id={`${id}-help`} className="field-help">
            {opts.help}
            {opts.max && ` ${String(v[id]).length}/${opts.max}`}
          </p>
        )}
        {errors[id] && (
          <p id={`${id}-err`} className="field-error" role="alert">
            {errors[id]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form className="pform" onSubmit={onSubmit} noValidate>
      <input type="hidden" name="id" value={project?.id ?? ""} />

      <div className="pform-fields">
        {state?.message && (
          <p className="flash flash-error" role="alert">
            {state.message}
          </p>
        )}

        <p className="form-intro">
          Only <b>Title</b> and <b>One-line summary</b> are required. Everything else is optional and can be added
          later.
        </p>

        <fieldset>
          <legend className="mono">01 · Basics</legend>
          {field("title", "Title", { required: true, placeholder: "e.g. Real-time Clickstream Lakehouse" })}
          {field("slug", "Page address", {
            help: `The project's link: /projects/${v.slug || "…"}. Fills in from the title; change it only if you want a shorter link.`,
          })}
          {field("summary", "One-line summary", {
            required: true,
            area: 2,
            max: 220,
            help: "Shows in the project list. What it is and why it matters.",
          })}
        </fieldset>

        <fieldset>
          <legend className="mono">02 · Details</legend>
          <div className="field" role="group" aria-labelledby="result-label" aria-describedby="result-help">
            <span id="result-label" className="label">
              Key result
            </span>
            <p id="result-help" className="field-help">
              One number that sums up the impact, shown big next to the project (see the preview). For example{" "}
              <b>~40%</b> + <b>less processing time</b>. Leave both empty if there isn&rsquo;t one.
            </p>
            <div className="field-row">
              {field("stat", "Number", { placeholder: "e.g. ~40%" })}
              {field("statLabel", "What it measures", { placeholder: "e.g. less processing time" })}
            </div>
          </div>
          {field("period", "Timeframe", { placeholder: "e.g. Jan – Mar 2026", help: "Shown at the top of the project page." })}
          {field("stack", "Tech stack", {
            placeholder: "e.g. PySpark, Delta Lake, BigQuery",
            help: "Tools you used, separated by commas.",
          })}
          {field("highlights", "Key contributions", {
            area: 5,
            placeholder: "e.g. Cut pipeline runtime 40% by repartitioning on event date",
            help: "One point per line: what you built and what changed because of it. Shown as a numbered list on the project page.",
          })}
          {field("body", "Longer write-up", {
            area: 6,
            help: "Background, decisions, lessons learned. Shown below the list. Leave a blank line between paragraphs.",
          })}
        </fieldset>

        <fieldset>
          <legend className="mono">03 · Links &amp; cover</legend>
          <div className="field-row">
            {field("liveUrl", "Live demo link", { type: "url", placeholder: "https://…", help: "Adds a “Live” button." })}
            {field("repoUrl", "Source code link", { type: "url", placeholder: "https://github.com/…", help: "Adds a “Code” button." })}
          </div>

          <div className="field">
            <span className="label">Cover image</span>
            <label
              className={`drop${imgBusy ? " drop-busy" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickImage(e.dataTransfer.files[0]);
              }}
            >
              {cover.url && !removeCover ? (
                <img src={cover.url} alt="Cover preview" />
              ) : (
                <span className="drop-empty">
                  <b>{imgBusy ? "Optimizing…" : "Drop an image or click to choose"}</b>
                  <span className="mono">JPG, PNG, WebP or GIF · resized to 1600px before upload</span>
                </span>
              )}
              <input
                ref={fileInput}
                type="file"
                name="coverPicker"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="sr-only"
                onChange={(e) => pickImage(e.target.files?.[0])}
              />
            </label>
            {cover.url && !removeCover && (
              <div className="drop-tools">
                <button type="button" className="btn btn-line btn-sm" onClick={() => fileInput.current?.click()}>
                  Replace
                </button>
                <button
                  type="button"
                  className="btn btn-line btn-sm"
                  onClick={() => {
                    setRemoveCover(true);
                    setCover((c) => ({ ...c, file: null }));
                    setDirty(true);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mono">04 · Visibility</legend>
          <label className="switch">
            <input type="checkbox" name="published" checked={v.published} onChange={set("published")} />
            <span className="switch-track" aria-hidden />
            <span>
              <b>{v.published ? "Live on the site" : "Draft"}</b>
              <span className="field-help">Drafts are saved but hidden from visitors.</span>
            </span>
          </label>
        </fieldset>
      </div>

      <aside className="pform-preview" aria-label="Preview">
        <p className="mono muted">Live preview · how it appears in the list</p>
        <div className="preview-box section-ink">
          <div className="prow prow-static">
            <ProjectRow project={preview} index={0} />
          </div>
        </div>
      </aside>

      <div className="savebar">
        <Link href="/admin" className="btn btn-line">
          Cancel
        </Link>
        <button className="btn btn-ink" disabled={pending || imgBusy}>
          {pending ? "Saving…" : project ? "Save changes" : "Publish project"}
        </button>
      </div>
    </form>
  );
}
