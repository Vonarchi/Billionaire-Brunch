import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/records/views";
import { getPublicCompanies } from "@/lib/dal/catalog";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const companies = await getPublicCompanies();
  return (
    <>
      <PageIntro
        kicker="Portfolio"
        title="Companies held in common view."
        lede="Operating companies across technology, real estate, media, healthcare, and distribution. Metrics describe the work. Revenue is not required."
      />
      <section className="shell page-pad">
        <div className="ledger">
          {companies.map((company, index) => (
            <Link key={company.slug} href={`/portfolio/${company.slug}`}>
              <span className="index-no">{String(index + 1).padStart(2, "0")}</span>
              <strong>{company.name}</strong>
              <span>{company.industry}</span>
              <span className="meta">{company.stage}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
