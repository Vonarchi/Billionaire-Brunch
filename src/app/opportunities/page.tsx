import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/records/views";
import { getPublicOpportunities } from "@/lib/dal/catalog";
import { opportunityLabel } from "@/lib/labels";

export const metadata: Metadata = { title: "Opportunities" };

export default async function OpportunitiesPage() {
  const opportunities = await getPublicOpportunities();
  return (
    <>
      <PageIntro
        kicker="Opportunities"
        title="What is open."
        lede="Public opportunities can be read by anyone. Members-only and private work stays inside the portal."
      />
      <section className="shell page-pad">
        <div className="ledger ledger-labeled">
          {opportunities.map((item) => (
            <Link key={item.slug} href={`/opportunities/${item.slug}`}>
              <span className="meta">{opportunityLabel(item.type)}</span>
              <strong>{item.title}</strong>
              <span>{item.company?.name}</span>
              <span className="meta">{item.location}</span>
            </Link>
          ))}
        </div>
        {opportunities.length === 0 ? <p className="quiet">No public opportunities at the moment.</p> : null}
      </section>
    </>
  );
}
