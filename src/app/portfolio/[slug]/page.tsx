import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CompanyView } from "@/components/records/views";
import { getPublicCompany } from "@/lib/dal/catalog";
import { getCompanyForViewer } from "@/lib/dal/portal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = await getPublicCompany(slug);
  return { title: company?.name ?? "Company" };
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="shell page-pad">Opening company…</div>}>
      <CompanyRoute params={params} />
    </Suspense>
  );
}

async function CompanyRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = (await getPublicCompany(slug)) ?? (await getCompanyForViewer(slug));
  if (!company) notFound();
  return <CompanyView company={company} />;
}
