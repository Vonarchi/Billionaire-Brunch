"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/actions/auth";
import type { Viewer } from "@/lib/types";

const links = [
  ["/portal", "Dashboard"],
  ["/portal/directory", "Directory"],
  ["/portal/companies", "Companies"],
  ["/portal/opportunities", "Opportunities"],
  ["/portal/introductions", "Introductions"],
  ["/portal/events", "Events"],
  ["/portal/documents", "Documents"],
  ["/portal/resources", "Resources"],
  ["/portal/settings", "Settings"],
] as const;

export function PortalNav({ viewer }: { viewer: Viewer }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <aside className="portal-nav">
      <p className="kicker">{viewer.role === "admin" ? "Admin" : "Member"}</p>
      <strong className="portal-name">{viewer.fullName}</strong>
      {links.map(([href, label]) => {
        const current = ready && (href === "/portal" ? pathname === href : pathname.startsWith(href));
        return (
          <Link key={href} href={href} aria-current={current ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
      {viewer.role === "admin" || viewer.preview ? (
        <Link href="/portal/admin" aria-current={ready && pathname.startsWith("/portal/admin") ? "page" : undefined}>
          Admin desk
        </Link>
      ) : null}
      {viewer.preview ? null : (
        <form action={signOut}>
          <button className="btn btn-ghost" type="submit">
            Sign out
          </button>
        </form>
      )}
    </aside>
  );
}
