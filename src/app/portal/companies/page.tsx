import Link from "next/link";
import { requireMember } from "@/lib/dal/session";
import { getCompaniesForViewer } from "@/lib/dal/portal";

export const instant = false;

export default async function CompaniesPage() {
  await requireMember();
  const companies = await getCompaniesForViewer();
  return (
    <>
      <p className="kicker">Companies</p>
      <h1 className="page-title">Manage companies.</h1>
      <Link className="btn btn-solid" href="/portal/companies/new">
        Add a company
      </Link>
      <div className="ledger" style={{ marginTop: "1.5rem" }}>
        {companies.map((company) => (
          <Link key={company.id} href={`/portal/companies/${company.id}`}>
            <span className="meta">{company.status}</span>
            <strong>{company.name}</strong>
            <span>{company.industry}</span>
            <span className="meta">{company.visibility}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
