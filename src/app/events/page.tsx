import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/records/views";
import { getPublicEvents } from "@/lib/dal/catalog";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const events = await getPublicEvents();
  const capital = events.filter((event) => event.series?.toLowerCase() === "the capital table");
  const others = events.filter((event) => event.series?.toLowerCase() !== "the capital table");

  return (
    <>
      <PageIntro
        kicker="Events"
        title="The Capital Table."
        lede="A private dinner series for principals. Seats are finite. Invite-only evenings require approval, and a full room moves guests to the waitlist."
      />
      <section className="shell page-pad">
        <div className="ledger ledger-labeled">
          {[...capital, ...others].map((event) => (
            <Link key={event.slug} href={`/events/${event.slug}`}>
              <span className="meta">{event.series ?? "Session"}</span>
              <strong>{event.title}</strong>
              <span>{formatDateTime(event.startsAt)}</span>
              <span className="meta">{event.inviteOnly ? "Invite only" : event.location}</span>
            </Link>
          ))}
        </div>
        {events.length === 0 ? <p className="quiet">No public events are scheduled.</p> : null}
      </section>
    </>
  );
}
