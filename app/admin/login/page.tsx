import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { isAdmin } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main id="main" className="login">
      <div className="login-card">
        <p className="mono kicker">
          <span className="swatch" style={{ background: "var(--c-yellow)" }} aria-hidden />
          Restricted · operator console
        </p>
        <h1 className="h-md">Sign in to manage projects</h1>
        <LoginForm />
      </div>
    </main>
  );
}
