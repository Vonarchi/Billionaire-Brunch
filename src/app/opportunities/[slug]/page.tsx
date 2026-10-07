import { Suspense } from "react";
import { notFound } from "next/navigation";
import { OpportunityView } from "@/components/records/views";
import { getPublicOpportunity } from "@/lib/dal/catalog";
import { getOpportunityForViewer } from "@/lib/dal/portal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunity = await getPublicOpportunity(slug);
  return { title: opportunity?.title ?? "Opportunity" };
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="shell page-pad">Opening opportunity…</div>}>
      <OpportunityRoute params={params} />
    </Suspense>
  );
}

async function OpportunityRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunity = (await getPublicOpportunity(slug)) ?? (await getOpportunityForViewer(slug));
  if (!opportunity) notFound();
  return <OpportunityView opportunity={opportunity} />;
}
