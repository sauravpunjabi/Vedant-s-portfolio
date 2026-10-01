"use client";

import { useActionState, useState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="form">
      <div className="field">
        <label htmlFor="password">Password</label>
        <div className="pw">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={Boolean(state?.error)}
            aria-describedby={state?.error ? "pw-error" : undefined}
          />
          <button type="button" className="pw-toggle mono" onClick={() => setShow((s) => !s)} aria-pressed={show}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {state?.error && (
          <p id="pw-error" className="field-error" role="alert">
            {state.error}
          </p>
        )}
      </div>
      <button className="btn btn-ink btn-block" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
