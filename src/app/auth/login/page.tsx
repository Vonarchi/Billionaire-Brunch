import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ActionForm } from "@/components/ui/action-form";
import { signIn } from "@/lib/actions/auth";
import { getOptionalViewer } from "@/lib/dal/session";

export const instant = false;
export const metadata: Metadata = { title: "Enter" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<div className="shell page-pad">Opening…</div>}>
      <LoginForm searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const viewer = await getOptionalViewer();
  if (viewer) redirect("/portal");
  const next = (await searchParams).next ?? "/portal";

  return (
    <section className="shell page-pad measure">
      <p className="kicker">Enter</p>
      <h1 className="page-title">The portal.</h1>
      <p className="quiet">Approved members continue. New accounts remain pending until an administrator admits them.</p>
      <ActionForm action={signIn} submitLabel="Sign in">
        <input type="hidden" name="next" value={next} />
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
      </ActionForm>
      <p>
        <Link href="/auth/signup">Request an account</Link>
      </p>
    </section>
  );
}
