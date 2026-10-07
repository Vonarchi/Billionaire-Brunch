import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EventView } from "@/components/records/views";
import { getPublicEvent } from "@/lib/dal/catalog";
import { getEventForViewer } from "@/lib/dal/portal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  return { title: event ? `${event.series ? `${event.series} — ` : ""}${event.title}` : "Event" };
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="shell page-pad">Opening event…</div>}>
      <EventRoute params={params} />
    </Suspense>
  );
}

async function EventRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = (await getPublicEvent(slug)) ?? (await getEventForViewer(slug));
  if (!event) notFound();
  return <EventView event={event} />;
}
