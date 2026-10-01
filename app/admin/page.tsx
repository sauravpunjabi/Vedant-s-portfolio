import Link from "next/link";
import { ConfirmButton } from "@/components/ConfirmButton";
import { requireAdmin } from "@/lib/auth";
import { getAllProjects, storageMode } from "@/lib/projects";
import { deleteProject, logout, moveProject, togglePublished } from "./actions";

type Props = { searchParams: Promise<{ saved?: string; deleted?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  await requireAdmin();
  const [projects, { saved, deleted }] = await Promise.all([getAllProjects(), searchParams]);
  const live = projects.filter((p) => p.published).length;

  return (
    <main id="main" className="admin-wrap">
      <header className="admin-top">
        <div>
          <p className="mono kicker">
            <span className="swatch" style={{ background: "var(--gold)" }} aria-hidden />
            Gold layer · {storageMode() === "blob" ? "Vercel Blob" : "local file (dev)"}
          </p>
          <h1 className="h-md">Projects</h1>
          <p className="muted">
            {projects.length} total · {live} live · {projects.length - live} draft
          </p>
        </div>
        <div className="admin-actions">
          <Link href="/" className="btn btn-line" target="_blank">
            View site ↗
          </Link>
          <form action={logout}>
            <button className="btn btn-line">Log out</button>
          </form>
          <Link href="/admin/projects/new" className="btn btn-ink">
            + New project
          </Link>
        </div>
      </header>

      {(saved || deleted) && (
        <p className="flash" role="status">
          {saved ? `Saved “${saved}”. The site is updated.` : `Deleted “${deleted}”.`}
          <Link href="/admin" className="flash-x" aria-label="Dismiss">
            ×
          </Link>
        </p>
      )}

      {projects.length === 0 ? (
        <div className="empty empty-admin">
          <p className="mono">0 rows</p>
          <p>No projects yet. Add your first one and it shows up on the site right away.</p>
          <Link href="/admin/projects/new" className="btn btn-ink">
            + New project
          </Link>
        </div>
      ) : (
        <ol className="arows">
          {projects.map((p, i) => (
            <li key={p.id} className="arow">
              <span className="mono arow-idx">{String(i + 1).padStart(2, "0")}</span>
              {p.cover ? <img src={p.cover} alt="" className="arow-thumb" /> : <span className="arow-thumb arow-thumb-empty" />}
              <div className="arow-main">
                <Link href={`/admin/projects/${p.id}`} className="arow-title">
                  {p.title}
                </Link>
                <span className="mono muted arow-slug">/projects/{p.slug}</span>
              </div>
              <form action={togglePublished}>
                <input type="hidden" name="id" value={p.id} />
                <button className={`status mono ${p.published ? "status-live" : ""}`} title="Click to toggle">
                  {p.published ? "● Live" : "○ Draft"}
                </button>
              </form>
              <div className="arow-tools">
                <form action={moveProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <button name="dir" value="up" className="icon-btn" disabled={i === 0} aria-label={`Move ${p.title} up`}>
                    ↑
                  </button>
                  <button
                    name="dir"
                    value="down"
                    className="icon-btn"
                    disabled={i === projects.length - 1}
                    aria-label={`Move ${p.title} down`}
                  >
                    ↓
                  </button>
                </form>
                <Link href={`/admin/projects/${p.id}`} className="btn btn-line btn-sm">
                  Edit
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton message={`Delete “${p.title}”? This can't be undone.`} className="btn btn-danger btn-sm">
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
