"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { getAllProjects, removeCover, saveProjects, uploadCover, type Project } from "@/lib/projects";

export type LoginState = { error?: string } | undefined;

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  if (!process.env.ADMIN_PASSWORD) return { error: "ADMIN_PASSWORD isn't set on the server. Add it to .env.local or your Vercel env vars." };
  if (!checkPassword(String(form.get("password") ?? ""))) {
    // ponytail: fixed delay slows guessing; add per-IP rate limiting if the URL ever gets hammered.
    await new Promise((r) => setTimeout(r, 900));
    return { error: "That password didn't match. Check caps lock and try again." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export type SaveState = { errors?: Record<string, string>; message?: string } | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function httpUrl(value: string) {
  if (!value) return "";
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function saveProject(_: SaveState, form: FormData): Promise<SaveState> {
  await requireAdmin();
  const list = await getAllProjects();
  const id = text(form, "id");
  const existing = list.find((p) => p.id === id);
  const errors: Record<string, string> = {};

  const title = text(form, "title");
  if (!title) errors.title = "Give the project a title.";
  const slug = slugify(text(form, "slug") || title);
  if (!slug && title) errors.slug = "Use at least one letter or number in the URL.";
  else if (list.some((p) => p.slug === slug && p.id !== id)) errors.slug = `“${slug}” is already used by another project.`;
  const summary = text(form, "summary");
  if (!summary) errors.summary = "Add a one-line summary. It shows in the project list.";

  const repoUrl = httpUrl(text(form, "repoUrl"));
  if (repoUrl === null) errors.repoUrl = "Use a full link starting with https://";
  const liveUrl = httpUrl(text(form, "liveUrl"));
  if (liveUrl === null) errors.liveUrl = "Use a full link starting with https://";

  if (Object.keys(errors).length) return { errors };

  let cover = existing?.cover ?? "";
  const file = form.get("coverFile");
  try {
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadCover(file);
      await removeCover(cover);
      cover = uploaded;
    } else if (form.get("removeCover") === "1") {
      await removeCover(cover);
      cover = "";
    }

    const project: Project = {
      id: existing?.id ?? crypto.randomUUID(),
      slug,
      title,
      summary,
      period: text(form, "period"),
      stat: text(form, "stat"),
      statLabel: text(form, "statLabel"),
      stack: text(form, "stack").split(",").map((s) => s.trim()).filter(Boolean),
      highlights: lines(text(form, "highlights")),
      body: text(form, "body"),
      repoUrl: repoUrl ?? "",
      liveUrl: liveUrl ?? "",
      cover,
      published: form.get("published") === "on",
    };

    await saveProjects(existing ? list.map((p) => (p.id === id ? project : p)) : [project, ...list]);
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Saving failed. Try again." };
  }

  refresh();
  redirect(`/admin?saved=${encodeURIComponent(title)}`);
}

export async function deleteProject(form: FormData) {
  await requireAdmin();
  const list = await getAllProjects();
  const gone = list.find((p) => p.id === text(form, "id"));
  if (!gone) redirect("/admin");
  await saveProjects(list.filter((p) => p !== gone));
  await removeCover(gone.cover);
  refresh();
  redirect(`/admin?deleted=${encodeURIComponent(gone.title)}`);
}

export async function moveProject(form: FormData) {
  await requireAdmin();
  const list = await getAllProjects();
  const i = list.findIndex((p) => p.id === text(form, "id"));
  const j = i + (form.get("dir") === "up" ? -1 : 1);
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await saveProjects(list);
  refresh();
}

export async function togglePublished(form: FormData) {
  await requireAdmin();
  const list = await getAllProjects();
  await saveProjects(list.map((p) => (p.id === text(form, "id") ? { ...p, published: !p.published } : p)));
  refresh();
}
