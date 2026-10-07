import { ActionForm } from "@/components/ui/action-form";
import { createCompany } from "@/lib/actions/member";
import { requireMember } from "@/lib/dal/session";
import { VISIBILITIES } from "@/lib/labels";

export const instant = false;

export default async function NewCompanyPage() {
  await requireMember();
  return (
    <>
      <p className="kicker">Companies</p>
      <h1 className="page-title">Add a company.</h1>
      <p className="quiet">New companies stay pending until an administrator approves public visibility.</p>
      <ActionForm action={createCompany} submitLabel="Create company">
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Your title
          <input name="title" placeholder="Founder" />
        </label>
        <label>
          Industry
          <input name="industry" />
        </label>
        <label>
          Stage
          <input name="stage" placeholder="Operating" />
        </label>
        <label>
          Description
          <textarea name="description" />
        </label>
        <label>
          Services, comma separated
          <input name="services" />
        </label>
        <label>
          Website
          <input name="website" type="url" />
        </label>
        <label>
          Visibility once approved
          <select name="visibility" defaultValue="public">
            {VISIBILITIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </ActionForm>
    </>
  );
}
