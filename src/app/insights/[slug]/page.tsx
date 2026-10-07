import { Suspense } from "react";
import { notFound } from "next/navigation";
import { InsightView } from "@/components/records/views";
import { getPublicInsight } from "@/lib/dal/catalog";
import { getInsightForViewer } from "@/lib/dal/portal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = await getPublicInsight(slug);
  return { title: insight?.title ?? "Insight" };
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="shell page-pad">Opening note…</div>}>
      <InsightRoute params={params} />
    </Suspense>
  );
}

async function InsightRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = (await getPublicInsight(slug)) ?? (await getInsightForViewer(slug));
  if (!insight) notFound();
  return <InsightView insight={insight} />;
}
