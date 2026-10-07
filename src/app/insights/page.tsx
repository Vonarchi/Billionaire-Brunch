import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/records/views";
import { getPublicInsights } from "@/lib/dal/catalog";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Insights" };

export default async function InsightsPage() {
  const insights = await getPublicInsights();
  return (
    <>
      <PageIntro kicker="Insights" title="Notes from the collective." />
      <section className="shell page-pad insight-list">
        {insights.map((insight) => (
          <Link key={insight.slug} href={`/insights/${insight.slug}`}>
            <span className="meta">{insight.publishedAt ? formatDate(insight.publishedAt) : "Note"}</span>
            <strong>{insight.title}</strong>
            <span className="quiet">{insight.excerpt}</span>
          </Link>
        ))}
      </section>
    </>
  );
}
