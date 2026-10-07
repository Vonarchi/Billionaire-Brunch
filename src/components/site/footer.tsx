import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="kicker">Billionaire Brunch</p>
          <p className="serif footer-mark">Build. Connect. Own.</p>
          <p>A private collective.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/about">About</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/members">Members</Link>
          <Link href="/opportunities">Opportunities</Link>
          <Link href="/events">The Capital Table</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/partners">Partners</Link>
          <Link href="/connect">Connect</Link>
          <Link href="/auth/login">Enter</Link>
        </nav>
      </div>
    </footer>
  );
}
