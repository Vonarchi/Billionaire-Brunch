"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-solid" type="submit" disabled={pending}>
      {pending ? "Sending…" : label}
    </button>
  );
}

export function ActionForm({
  action,
  submitLabel,
  children,
  className = "form-grid",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className={className}>
      {children}
      <input className="honeypot" tabIndex={-1} autoComplete="off" name="company_website" aria-hidden="true" />
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.message ? <p className="form-ok">{state.message}</p> : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
