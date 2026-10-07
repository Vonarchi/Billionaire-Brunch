import { notFound } from "next/navigation";
import { OpportunityView } from "@/components/records/views";
import { requireMember } from "@/lib/dal/session";
import { getOpportunityForViewer } from "@/lib/dal/portal";

export const instant = false;

export default async function PortalOpportunityPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireMember();
  const { slug } = await params;
  const opportunity = await getOpportunityForViewer(slug);
  if (!opportunity) notFound();
  return <OpportunityView opportunity={opportunity} />;
}
