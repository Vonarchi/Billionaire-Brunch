import type { Metadata } from "next";
import { PageIntro } from "@/components/records/views";
import { getPublicPartners } from "@/lib/dal/catalog";
import { publicHref } from "@/lib/format";

export const metadata: Metadata = { title: "Partners" };

export default async function PartnersPage() {
  const partners = await getPublicPartners();
  return (
    <>
      <PageIntro
        kicker="Partners"
        title="Strategic partners."
        lede="Capital, counsel, wealth, and talent sit alongside the collective. Sponsorship of a specific evening is managed with the event."
      />
      <section className="shell page-pad partner-line">
        {partners.map((partner) => {
          const website = publicHref(partner.website);
          return (
            <article key={partner.id}>
              <p className="meta">{partner.tier}</p>
              <h2>{partner.name}</h2>
              <p className="quiet">{partner.description}</p>
              {website ? <a href={website}>Website</a> : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
