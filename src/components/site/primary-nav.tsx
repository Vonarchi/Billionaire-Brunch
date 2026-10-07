"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function PrimaryNav({
  links,
  label,
  className,
}: {
  links: readonly (readonly [string, string])[];
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <nav className={className} aria-label={label}>
      {links.map(([href, text]) => {
        const current = ready && (pathname === href || pathname.startsWith(`${href}/`));
        return (
          <Link key={href} href={href} aria-current={current ? "page" : undefined}>
            {text}
          </Link>
        );
      })}
    </nav>
  );
}
