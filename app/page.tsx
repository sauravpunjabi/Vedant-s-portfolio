import { ContactQuery } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { CountUp, Reveal, SplitHeading, Stamp } from "@/components/motion";
import { ProjectList } from "@/components/Projects";
import { SiteNav } from "@/components/SiteNav";
import { Skills } from "@/components/Skills";
import { Kicker, Rich } from "@/components/ui";
import { awards, certifications, education, experience, metrics, profile } from "@/lib/content";
import { getPublishedProjects } from "@/lib/projects";

function StampFace({ count, name }: { count: string; name: string }) {
  const ring = `${name} · GlobalLogic · `.toUpperCase();
  const id = `ring-${name.replace(/\W+/g, "-")}`;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`${count} ${name}, GlobalLogic`}>
      <defs>
        <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>
      <g filter="url(#rough)">
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="5" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="2" />
        <text className="stamp-ring">
          <textPath href={`#${id}`} textLength="480">
            {ring}
          </textPath>
        </text>
        <text x="100" y="118" textAnchor="middle" className="stamp-count">
          {count}
        </text>
      </g>
    </svg>
  );
}

export default async function Home() {
  const projects = await getPublishedProjects();

  return (
    <>
      <SiteNav rail />
      {/* Roughens stamp edges like real ink. */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="3.5" />
        </filter>
      </svg>

      <main id="main">
        <Hero />

        <section id="bronze" className="section">
          <div className="wrap">
            <Kicker index="01" layer="Bronze" note="raw, as it arrived" color="var(--bronze)" />
            <div className="about">
              <SplitHeading text="The raw stuff." className="h-xl" />
              <div className="about-copy">
                {profile.bio.map((p, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <p className="lead">
                      <Rich text={p} />
                    </p>
                  </Reveal>
                ))}
                <Reveal delay={0.16}>
                  <p className="note">
                    This site is laid out like one of my pipelines: <b>Bronze</b> is raw, <b>Silver</b> is cleaned and
                    joined, <b>Gold</b> is ready to use. Below are my skills exactly as messy as a real source feed.
                  </p>
                </Reveal>
              </div>
            </div>
            <Skills />
          </div>
        </section>

        <section id="silver" className="section section-alt">
          <div className="wrap">
            <Kicker index="02" layer="Silver" note="cleaned & joined" color="var(--silver)" />
            <SplitHeading text="Where I've worked." className="h-xl" />

            <ul className="metrics">
              {metrics.map((m, i) => (
                <li key={m.label}>
                  <Reveal delay={i * 0.05} className="metric">
                    <span className="metric-value tnum">
                      <CountUp value={m.value} />
                      {m.suffix}
                    </span>
                    <span className="metric-label mono">{m.label}</span>
                  </Reveal>
                </li>
              ))}
            </ul>

            <ol className="timeline">
              {experience.map((job) => (
                <li key={job.period} className="job">
                  <Reveal className="job-head">
                    <p className="mono job-period">{job.period}</p>
                    <h3 className="job-role">{job.role}</h3>
                    <p className="job-co">
                      {job.company}
                      {job.client && <span> · client: {job.client}</span>}
                    </p>
                    {job.note && <p className="mono job-note">↑ {job.note}</p>}
                    <p className="mono job-place">{job.place}</p>
                  </Reveal>
                  <ul className="job-points">
                    {job.points.map((pt, i) => (
                      <li key={i}>
                        <Reveal delay={i * 0.04} y={16}>
                          <Rich text={pt} />
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="gold" className="section section-ink">
          <div className="wrap">
            <Kicker index="03" layer="Gold" note="curated, business-ready" color="var(--gold)" />
            <div className="gold-head">
              <SplitHeading text="Things I've built." className="h-xl" />
              <p className="mono gold-count">
                SELECT * FROM projects → {projects.length} {projects.length === 1 ? "row" : "rows"}
              </p>
            </div>
            <ProjectList projects={projects} />

            <div className="creds">
              <div>
                <h3 className="h-md">Certified &amp; stamped.</h3>
                <p className="muted">
                  Verified badges live on{" "}
                  <a className="link-u" href={profile.credly} target="_blank" rel="noreferrer">
                    Credly ↗
                  </a>
                </p>
              </div>
              <ul className="tickets">
                {certifications.map((c, i) => (
                  <li key={c.name}>
                    <Reveal delay={i * 0.08}>
                      <div className="ticket">
                        <span className="mono ticket-issuer">{c.issuer}</span>
                        <span className="ticket-name">{c.name}</span>
                        <span className="mono ticket-no">CERT-{String(i + 1).padStart(3, "0")}</span>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
              <div className="stamps">
                {awards.map((a, i) => (
                  <Stamp key={a.name} rotate={i ? 7 : -9} delay={i * 0.15}>
                    <StampFace count={a.count} name={a.name} />
                  </Stamp>
                ))}
              </div>
              <Reveal className="edu">
                <p className="mono muted">Education · {education.period}</p>
                <p className="edu-degree">{education.degree}</p>
                <p className="muted">
                  {education.school}. Coursework: {education.coursework}.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="serve" className="section section-signal">
          <div className="wrap serve">
            <div>
              <Kicker index="04" layer="Serving" note="query me" color="var(--c-yellow)" />
              <SplitHeading text="Query me." className="h-xxl" />
              <p className="lead serve-lead">
                Data that needs moving, cleaning or trusting? A team that wants someone who reads the logs? Run the
                query, or just write.
              </p>
            </div>
            <ContactQuery />
          </div>
        </section>
      </main>

      <footer className="footer mono">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>Hand-built with Next.js · {profile.location}</span>
        <a href="#ingest" className="link-u">
          Back to top ↑
        </a>
      </footer>
    </>
  );
}
