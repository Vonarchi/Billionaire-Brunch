import Link from "next/link";
import { Suspense } from "react";
import { PrimaryNav } from "@/components/site/primary-nav";
import { getOptionalViewer } from "@/lib/dal/session";
import type { Viewer } from "@/lib/types";

const links = [
  ["/portfolio", "Portfolio"],
  ["/members", "Members"],
  ["/opportunities", "Opportunities"],
  ["/events", "Events"],
  ["/insights", "Insights"],
  ["/partners", "Partners"],
  ["/about", "About"],
  ["/connect", "Connect"],
] as const;

function StaticNav({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <nav className={className} aria-label={label}>
      {links.map(([href, text]) => (
        <Link key={href} href={href}>
          {text}
        </Link>
      ))}
    </nav>
  );
}

function HeaderFrame({ viewer }: { viewer: Viewer | null }) {
  return (
    <header className="site-header">
      <div className="shell header-bar">
        <Link className="wordmark" href="/">
          <strong>BILLIONAIRE BRUNCH</strong>
          <span>Build. Connect. Own.</span>
        </Link>
        <Suspense fallback={<StaticNav className="nav-full" label="Primary" />}>
          <PrimaryNav className="nav-full" label="Primary" links={links} />
        </Suspense>
        <div className="header-tools">
          <details className="nav-disclosure">
            <summary>Menu</summary>
            <Suspense fallback={<StaticNav label="Mobile" />}>
              <PrimaryNav label="Mobile" links={links} />
            </Suspense>
          </details>
          <Link className="btn btn-ghost" href={viewer && !viewer.preview ? "/portal" : "/auth/login"}>
            {viewer && !viewer.preview ? "Portal" : "Enter"}
          </Link>
        </div>
      </div>
    </header>
  );
}

async function HeaderAuth() {
  const viewer = await getOptionalViewer();
  return <HeaderFrame viewer={viewer} />;
}

export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderFrame viewer={null} />}>
      <HeaderAuth />
    </Suspense>
  );
}
