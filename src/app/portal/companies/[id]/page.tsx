import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { addAchievement, addMetric, updateCompany } from "@/lib/actions/member";
import { requireMember } from "@/lib/dal/session";
import { getCompanyById } from "@/lib/dal/portal";
import { METRIC_LABELS } from "@/lib/labels";

export const instant = false;

export default async function CompanyManagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireMember();
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) notFound();

  return (
    <>
      <p className="kicker">{company.status}</p>
      <h1 className="page-title">{company.name}</h1>
      <p>
        <Link href={`/portfolio/${company.slug}`}>View profile</Link>
      </p>
      <ActionForm action={updateCompany} submitLabel="Save company">
        <input type="hidden" name="company_id" value={company.id} />
        <label>
          Name
          <input name="name" defaultValue={company.name} />
        </label>
        <label>
          Logo URL
          <input name="logo_url" defaultValue={company.logoUrl ?? ""} />
        </label>
        <label>
          Industry
          <input name="industry" defaultValue={company.industry} />
        </label>
        <label>
          Stage
          <input name="stage" defaultValue={company.stage} />
        </label>
        <label>
          Description
          <textarea name="description" defaultValue={company.description} />
        </label>
        <label>
          Services
          <input name="services" defaultValue={company.services.join(", ")} />
        </label>
        <label>
          Website
          <input name="website" defaultValue={company.website ?? ""} />
        </label>
      </ActionForm>

      <section className="admin-block">
        <h2>Metrics</h2>
        <ul>
          {company.metrics.map((metric) => (
            <li key={metric.id}>
              {metric.label}: {metric.value}
            </li>
          ))}
        </ul>
        <ActionForm action={addMetric} submitLabel="Add metric">
          <input type="hidden" name="company_id" value={company.id} />
          <label>
            Label
            <input name="label" list="metric-labels" />
            <datalist id="metric-labels">
              {METRIC_LABELS.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
          </label>
          <label>
            Value
            <input name="value" placeholder="11, 18, 1.2M" />
          </label>
        </ActionForm>
      </section>

      <section className="admin-block">
        <h2>Achievements</h2>
        <ul>
          {company.achievements.map((item) => (
            <li key={item.id}>
              {item.title}
              {item.year ? ` (${item.year})` : ""}
            </li>
          ))}
        </ul>
        <ActionForm action={addAchievement} submitLabel="Add achievement">
          <input type="hidden" name="company_id" value={company.id} />
          <label>
            Title
            <input name="title" />
          </label>
          <label>
            Year
            <input name="year" inputMode="numeric" />
          </label>
          <label>
            Description
            <textarea name="description" />
          </label>
        </ActionForm>
      </section>
    </>
  );
}
