import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { requireAdmin } from "@/lib/auth";
import { getAllProjects } from "@/lib/projects";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const project = id === "new" ? undefined : (await getAllProjects()).find((p) => p.id === id);
  if (id !== "new" && !project) notFound();

  return (
    <main id="main" className="admin-wrap">
      <Link href="/admin" className="back mono">
        ← Projects
      </Link>
      <h1 className="h-md">{project ? `Edit “${project.title}”` : "New project"}</h1>
      <ProjectForm project={project} />
    </main>
  );
}
