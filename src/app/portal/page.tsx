import Link from "next/link";
import { requireMember } from "@/lib/dal/session";
import { getEventsForViewer, getIntroductions, getOpportunitiesForViewer } from "@/lib/dal/portal";

export const instant = false;

export default async function DashboardPage() {
  const viewer = await requireMember();
  const [opportunities, events, introductions] = await Promise.all([
    getOpportunitiesForViewer(),
    getEventsForViewer(),
    getIntroductions(viewer),
  ]);
  const nextEvent = events[0];
  const openIntros = introductions.filter((item) => item.status === "requested" && item.direction === "received");

  return (
    <>
      <p className="kicker">Dashboard</p>
      <h1 className="page-title">{viewer.preview ? "The room." : `${viewer.fullName.split(" ")[0]}.`}</h1>
      <p className="quiet">The private side of the collective. Public pages only show what an administrator has released.</p>
      <div className="stat-row">
        <article className="metric">
          <strong>{opportunities.length}</strong>
          <span className="meta">Open opportunities</span>
        </article>
        <article className="metric">
          <strong>{openIntros.length}</strong>
          <span className="meta">Introductions waiting</span>
        </article>
        <article className="metric">
          <strong>{events.length}</strong>
          <span className="meta">Upcoming events</span>
        </article>
      </div>
      {nextEvent ? (
        <p>
          Next room: <Link href={`/events/${nextEvent.slug}`}>{nextEvent.series ? `${nextEvent.series} — ` : ""}{nextEvent.title}</Link>
        </p>
      ) : null}
      <div className="stack-row">
        <Link className="btn btn-solid" href="/portal/opportunities/new">
          Post an opportunity
        </Link>
        <Link className="btn btn-ghost" href="/portal/directory">
          Directory
        </Link>
      </div>
    </>
  );
}
