import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalNav } from "@/components/portal/nav";
import { requireViewer } from "@/lib/dal/session";

export const instant = false;
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="portal-main">Opening the portal…</div>}>
      <PortalFrame>{children}</PortalFrame>
    </Suspense>
  );
}

async function PortalFrame({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();

  return (
    <div className="portal-shell">
      <PortalNav viewer={viewer} />
      <div className="portal-main">{children}</div>
    </div>
  );
}
