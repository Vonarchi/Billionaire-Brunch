import type { Metadata } from "next";
import { ActionForm } from "@/components/ui/action-form";
import { PageIntro } from "@/components/records/views";
import { submitInquiry } from "@/lib/actions/public";

export const metadata: Metadata = { title: "Connect" };

export default function ConnectPage() {
  return (
    <>
      <PageIntro
        kicker="Connect"
        title="Connect with the collective."
        lede="Membership, partnership, and The Capital Table begin with a direct note. The room stays private."
      />
      <section className="shell page-pad measure">
        <ActionForm action={submitInquiry} submitLabel="Send">
          <label>
            Name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Organization
            <input name="organization" />
          </label>
          <label>
            Interest
            <select name="interest" defaultValue="Membership">
              <option>Membership</option>
              <option>Partnership</option>
              <option>The Capital Table</option>
              <option>Opportunity</option>
              <option>Press</option>
            </select>
          </label>
          <label>
            Message
            <textarea name="message" required />
          </label>
        </ActionForm>
      </section>
    </>
  );
}
