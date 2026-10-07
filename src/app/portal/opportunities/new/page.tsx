import { ActionForm } from "@/components/ui/action-form";
import { createOpportunity } from "@/lib/actions/member";
import { requireMember } from "@/lib/dal/session";
import { getCompaniesForViewer } from "@/lib/dal/portal";
import { OPPORTUNITY_TYPES, VISIBILITIES } from "@/lib/labels";

export const instant = false;

export default async function NewOpportunityPage() {
  await requireMember();
  const companies = await getCompaniesForViewer();

  return (
    <>
      <p className="kicker">Opportunities</p>
      <h1 className="page-title">Create an opportunity.</h1>
      <p className="quiet">It stays pending until an administrator approves it. Visibility is honored after approval.</p>
      <ActionForm action={createOpportunity} submitLabel="Submit opportunity">
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Type
          <select name="opportunity_type" defaultValue="strategic_partner">
            {OPPORTUNITY_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Visibility
          <select name="visibility" defaultValue="members">
            {VISIBILITIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Company
          <select name="company_id" defaultValue="">
            <option value="">None</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input name="location" />
        </label>
        <label>
          Deadline
          <input name="deadline" type="date" />
        </label>
        <label>
          Summary
          <textarea name="summary" />
        </label>
        <label>
          Description
          <textarea name="description" />
        </label>
      </ActionForm>
    </>
  );
}
