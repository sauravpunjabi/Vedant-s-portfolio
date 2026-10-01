import { del, list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import seed from "@/data/projects.json";

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  period: string;
  stat: string;
  statLabel: string;
  stack: string[];
  highlights: string[];
  body: string;
  repoUrl: string;
  liveUrl: string;
  cover: string;
  published: boolean;
};

// Each save writes a new uniquely-named blob, so a read can never get a stale CDN copy.
const BLOB_KEY = "data/projects.json";
const BLOB_PREFIX = "data/projects";
const LOCAL_FILE = path.join(process.cwd(), "data", "projects.json");

// With a Blob token (Vercel) data lives in Blob; without one (local dev) it lives in data/projects.json.
export const storageMode = () => (process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local");

export async function getAllProjects(): Promise<Project[]> {
  if (storageMode() === "local") {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8").catch(() => JSON.stringify(seed)));
  }
  const latest = (await savedVersions())[0];
  if (!latest) return seed as Project[]; // first deploy: nothing saved yet
  const res = await fetch(latest.url);
  if (!res.ok) throw new Error(`Couldn't read projects from Blob (${res.status}).`);
  return res.json();
}

async function savedVersions() {
  const { blobs } = await list({ prefix: BLOB_PREFIX });
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
}

export async function getPublishedProjects() {
  return (await getAllProjects()).filter((p) => p.published);
}

// ponytail: whole-file read-modify-write, fine for one admin; needs a real DB if several people edit at once.
export async function saveProjects(list: Project[]) {
  const json = JSON.stringify(list, null, 2) + "\n";
  if (storageMode() === "blob") {
    const old = await savedVersions();
    await put(BLOB_KEY, json, { access: "public", addRandomSuffix: true, contentType: "application/json" });
    if (old.length) await del(old.map((b) => b.url));
  } else if (process.env.VERCEL) {
    throw new Error("No Blob store connected. In Vercel, open Storage → Create → Blob and connect it to this project.");
  } else {
    await fs.writeFile(LOCAL_FILE, json);
  }
}

const IMAGE_TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function uploadCover(file: File): Promise<string> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Cover must be a WebP, JPEG, PNG, AVIF or GIF image.");
  if (file.size > 4 * 1024 * 1024) throw new Error("Cover is larger than 4MB.");
  const name = `${crypto.randomUUID()}.${ext}`;

  if (storageMode() === "blob") {
    return (await put(`covers/${name}`, file, { access: "public", contentType: file.type })).url;
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function removeCover(url: string) {
  if (!url) return;
  if (url.includes(".blob.vercel-storage.com")) {
    if (storageMode() === "blob") await del(url).catch(() => {});
  } else if (url.startsWith("/uploads/")) {
    await fs.unlink(path.join(process.cwd(), "public", "uploads", path.basename(url))).catch(() => {});
  }
}
