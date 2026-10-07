import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { signUp } from "@/lib/actions/auth";

export const instant = false;
export const metadata: Metadata = { title: "Request account" };

export default function SignupPage() {
  return (
    <section className="shell page-pad measure">
      <p className="kicker">Request</p>
      <h1 className="page-title">Ask to enter.</h1>
      <p className="quiet">
        Your name is stored as profile information. It does not grant a role. An administrator approves membership.
      </p>
      <ActionForm action={signUp} submitLabel="Request account">
        <label>
          Name
          <input name="full_name" required autoComplete="name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" />
        </label>
      </ActionForm>
      <p>
        <Link href="/auth/login">Already admitted? Sign in</Link>
      </p>
    </section>
  );
}
