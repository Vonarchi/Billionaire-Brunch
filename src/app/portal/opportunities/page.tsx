import Link from "next/link";
import { OpportunityBrowser } from "@/components/portal/browsers";
import { requireMember } from "@/lib/dal/session";
import { getOpportunitiesForViewer } from "@/lib/dal/portal";

export const instant = false;

export default async function PortalOpportunitiesPage() {
  await requireMember();
  const opportunities = await getOpportunitiesForViewer();
  const privateOnes = opportunities.filter((item) => item.visibility === "private");

  return (
    <>
      <p className="kicker">Opportunity board</p>
      <h1 className="page-title">Open work.</h1>
      <Link className="btn btn-solid" href="/portal/opportunities/new">
        Create opportunity
      </Link>
      <section className="admin-block">
        <h2>Visible to you</h2>
        <OpportunityBrowser opportunities={opportunities} />
      </section>
      <section className="admin-block">
        <h2>Private</h2>
        <OpportunityBrowser opportunities={privateOnes} privateOnly />
      </section>
    </>
  );
}
