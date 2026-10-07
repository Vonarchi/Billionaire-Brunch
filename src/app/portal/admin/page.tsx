import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import {
  assignSponsor,
  createEvent,
  createPartner,
  createResource,
  publishPost,
  setFeatured,
  setMemberStatus,
  setRecordState,
  setRegistrationStatus,
} from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/dal/session";
import { getAdminDesk } from "@/lib/dal/portal";
import { VISIBILITIES, opportunityLabel } from "@/lib/labels";

export const instant = false;

export default async function AdminPage() {
  await requireAdmin();
  const desk = await getAdminDesk();

  return (
    <>
      <p className="kicker">Admin desk</p>
      <h1 className="page-title">Stewardship.</h1>

      <section className="admin-block" id="members">
        <h2>Members</h2>
        {desk.members.map((member) => (
          <article key={member.id} className="desk-row">
            <div>
              <strong>{member.fullName}</strong>
              <p className="quiet">
                {member.membershipStatus} · {member.title}
              </p>
            </div>
            <div className="inline-actions">
              {(["approved", "rejected", "suspended"] as const).map((status) => (
                <ActionForm key={status} action={setMemberStatus} submitLabel={status}>
                  <input type="hidden" name="id" value={member.id} />
                  <input type="hidden" name="status" value={status} />
                </ActionForm>
              ))}
              <ActionForm action={setFeatured} submitLabel={member.featured ? "Unfeature" : "Feature"}>
                <input type="hidden" name="table" value="profiles" />
                <input type="hidden" name="id" value={member.id} />
                <input type="hidden" name="featured" value={member.featured ? "false" : "true"} />
              </ActionForm>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-block" id="companies">
        <h2>Companies</h2>
        {desk.companies.map((company) => (
          <article key={company.id} className="desk-row">
            <div>
              <Link href={`/portfolio/${company.slug}`}>{company.name}</Link>
              <p className="quiet">
                {company.status} · {company.visibility} · {company.industry}
              </p>
            </div>
            <div className="inline-actions">
              <ActionForm action={setRecordState} submitLabel="Approve">
                <input type="hidden" name="table" value="companies" />
                <input type="hidden" name="id" value={company.id} />
                <input type="hidden" name="status" value="approved" />
              </ActionForm>
              <ActionForm action={setFeatured} submitLabel={company.is_featured ? "Unfeature" : "Feature"}>
                <input type="hidden" name="table" value="companies" />
                <input type="hidden" name="id" value={company.id} />
                <input type="hidden" name="featured" value={company.is_featured ? "false" : "true"} />
              </ActionForm>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-block" id="opportunities">
        <h2>Opportunities</h2>
        {desk.opportunities.map((item) => (
          <article key={item.id} className="desk-row">
            <div>
              <Link href={`/opportunities/${item.slug}`}>{item.title}</Link>
              <p className="quiet">
                {opportunityLabel(item.opportunity_type)} · {item.status} · {item.visibility}
              </p>
            </div>
            <div className="inline-actions">
              <ActionForm action={setRecordState} submitLabel="Approve">
                <input type="hidden" name="table" value="opportunities" />
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="status" value="approved" />
              </ActionForm>
              <ActionForm action={setRecordState} submitLabel="Close">
                <input type="hidden" name="table" value="opportunities" />
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="status" value="closed" />
              </ActionForm>
              <ActionForm action={setFeatured} submitLabel={item.is_featured ? "Unfeature" : "Feature"}>
                <input type="hidden" name="table" value="opportunities" />
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="featured" value={item.is_featured ? "false" : "true"} />
              </ActionForm>
              <ActionForm action={setRecordState} submitLabel="Set visibility">
                <input type="hidden" name="table" value="opportunities" />
                <input type="hidden" name="id" value={item.id} />
                <select name="visibility" defaultValue={item.visibility}>
                  {VISIBILITIES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </ActionForm>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-block" id="events">
        <h2>Events and guests</h2>
        <ActionForm action={createEvent} submitLabel="Publish event">
          <label>
            Series
            <input name="series" placeholder="The Capital Table" />
          </label>
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Description
            <textarea name="description" />
          </label>
          <label>
            Starts
            <input name="starts_at" type="datetime-local" required />
          </label>
          <label>
            Location
            <input name="location" />
          </label>
          <label>
            Capacity
            <input name="capacity" type="number" min={1} defaultValue={24} />
          </label>
          <label>
            Visibility
            <select name="visibility" defaultValue="public">
              {VISIBILITIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="check">
            <input name="invite_only" type="checkbox" /> Invite only
          </label>
          <label className="check">
            <input name="requires_approval" type="checkbox" /> Require approval
          </label>
        </ActionForm>
        {desk.events.map((event) => (
          <p key={event.id}>
            <Link href={`/events/${event.slug}`}>{event.series ? `${event.series} — ` : ""}{event.title}</Link>
            <span className="quiet"> · {event.status}</span>
          </p>
        ))}
        <h3>Guest approvals</h3>
        {desk.registrations.map((registration) => (
          <article key={registration.id} className="panel">
            <strong>{registration.guestName || "Member"}</strong>
            <p className="quiet">
              {registration.guestTitle} {registration.guestCompany ? `· ${registration.guestCompany}` : ""} ·{" "}
              {registration.eventTitle} · referred by {registration.referralSource || "—"} · {registration.status}
            </p>
            <div className="inline-actions">
              {(["approved", "waitlisted", "declined"] as const).map((status) => (
                <ActionForm key={status} action={setRegistrationStatus} submitLabel={status}>
                  <input type="hidden" name="id" value={registration.id} />
                  <input type="hidden" name="status" value={status} />
                </ActionForm>
              ))}
            </div>
          </article>
        ))}
        <h3>Assign a sponsor</h3>
        <ActionForm action={assignSponsor} submitLabel="Assign sponsor">
          <label>
            Event
            <select name="event_id">
              {desk.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Partner
            <select name="partner_id">
              {desk.partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>
        </ActionForm>
      </section>

      <section className="admin-block" id="partners">
        <h2>Partners</h2>
        <ActionForm action={createPartner} submitLabel="Add partner">
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Tier
            <input name="tier" placeholder="Capital" />
          </label>
          <label>
            Description
            <textarea name="description" />
          </label>
          <label>
            Website
            <input name="website" />
          </label>
        </ActionForm>
        {desk.partners.map((partner) => (
          <p key={partner.id}>
            {partner.name} <span className="quiet">· {partner.tier}</span>
          </p>
        ))}
      </section>

      <section className="admin-block" id="insights">
        <h2>Insights</h2>
        <ActionForm action={publishPost} submitLabel="Publish">
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Excerpt
            <input name="excerpt" />
          </label>
          <label>
            Body
            <textarea name="body" />
          </label>
          <label>
            Visibility
            <select name="visibility" defaultValue="public">
              {VISIBILITIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </ActionForm>
        {desk.posts.map((post) => (
          <p key={post.id}>
            <Link href={`/insights/${post.slug}`}>{post.title}</Link>
            <span className="quiet"> · {post.status}</span>
          </p>
        ))}
      </section>

      <section className="admin-block">
        <h2>Resources</h2>
        <ActionForm action={createResource} submitLabel="Publish resource">
          <label>
            Title
            <input name="title" required />
          </label>
          <label>
            Category
            <input name="category" />
          </label>
          <label>
            Summary
            <textarea name="summary" />
          </label>
          <label>
            URL
            <input name="url" />
          </label>
        </ActionForm>
      </section>

      <section className="admin-block" id="inquiries">
        <h2>Connect inquiries</h2>
        {desk.inquiries.map((inquiry) => (
          <article key={inquiry.id} className="panel">
            <h3>
              {inquiry.name} · {inquiry.interest}
            </h3>
            <p className="quiet">
              {inquiry.email} {inquiry.organization ? `· ${inquiry.organization}` : ""}
            </p>
            <p>{inquiry.message}</p>
          </article>
        ))}
      </section>
    </>
  );
}
