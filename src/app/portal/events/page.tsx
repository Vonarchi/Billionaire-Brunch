import Link from "next/link";
import { requireMember } from "@/lib/dal/session";
import { getEventsForViewer } from "@/lib/dal/portal";
import { formatDateTime } from "@/lib/format";

export const instant = false;

export default async function PortalEventsPage() {
  await requireMember();
  const events = await getEventsForViewer();
  return (
    <>
      <p className="kicker">Events</p>
      <h1 className="page-title">Rooms.</h1>
      <div className="ledger">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.slug}`}>
            <span className="meta">{event.series ?? "Session"}</span>
            <strong>{event.title}</strong>
            <span>{formatDateTime(event.startsAt)}</span>
            <span className="meta">{event.inviteOnly ? "Invite only" : `${event.capacity} seats`}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
