import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal, SplitHeading } from "@/components/motion";
import { SiteNav } from "@/components/SiteNav";
import { pad } from "@/components/ui";
import { getPublishedProjects } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getPublishedProjects()).find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getPublishedProjects();
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <>
      <SiteNav />
      <main id="main" className="detail">
        <div className="wrap">
          <Link href="/#gold" className="back mono">
            ← All projects
          </Link>
          <p className="kicker mono">
            <span>{pad(i + 1)}</span>
            <span className="swatch" style={{ background: "var(--gold)" }} aria-hidden />
            <span>Gold layer</span>
            {p.period && <span className="kicker-note">· {p.period}</span>}
          </p>
          <SplitHeading as="h1" text={p.title} className="h-xl detail-title" />

          <Reveal className="detail-meta">
            <p className="lead">{p.summary}</p>
            <dl>
              {p.stat && (
                <div className="detail-stat">
                  <dt className="mono">Result</dt>
                  <dd>
                    <b>{p.stat}</b> {p.statLabel}
                  </dd>
                </div>
              )}
              {p.stack.length > 0 && (
                <div>
                  <dt className="mono">Stack</dt>
                  <dd className="tags">
                    {p.stack.map((s) => (
                      <span key={s} className="tag mono">
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {(p.repoUrl || p.liveUrl) && (
                <div>
                  <dt className="mono">Links</dt>
                  <dd className="detail-links">
                    {p.liveUrl && (
                      <a className="btn btn-ink" href={p.liveUrl} target="_blank" rel="noreferrer">
                        Live ↗
                      </a>
                    )}
                    {p.repoUrl && (
                      <a className="btn btn-line" href={p.repoUrl} target="_blank" rel="noreferrer">
                        Code ↗
                      </a>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>

          {p.cover && (
            <Reveal className="detail-cover">
              <img src={p.cover} alt={`${p.title} cover`} />
            </Reveal>
          )}

          <div className="detail-body">
            {p.highlights.length > 0 && (
              <section>
                <h2 className="mono detail-h">What I did</h2>
                <ol className="detail-points">
                  {p.highlights.map((h, j) => (
                    <li key={j}>
                      <Reveal delay={j * 0.05} y={16}>
                        {h}
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {p.body && (
              <section>
                <h2 className="mono detail-h">Notes</h2>
                {p.body.split(/\n\s*\n/).map((para, j) => (
                  <p key={j} className="detail-para">
                    {para}
                  </p>
                ))}
              </section>
            )}
          </div>

          {next && next.id !== p.id && (
            <Link href={`/projects/${next.slug}`} className="next-project">
              <span className="mono">Next project →</span>
              <span className="next-title">{next.title}</span>
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
