import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Monogram } from "@/components/ui/monogram";
import { Prose } from "@/components/ui/prose";
import { expressInterest, registerForEvent } from "@/lib/actions/public";
import { formatDate, formatDateTime, publicHref } from "@/lib/format";
import { opportunityLabel, visibilityLabel } from "@/lib/labels";
import type { CollectiveEvent, Company, Insight, Member, Opportunity } from "@/lib/types";

export function PageIntro({ kicker, title, lede }: { kicker: string; title: string; lede?: string }) {
  return (
    <header className="page-pad" style={{ paddingBottom: 0 }}>
      <div className="shell">
        <p className="kicker">{kicker}</p>
        <h1 className="page-title">{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
    </header>
  );
}

function WebsiteLink({ href }: { href: string | null }) {
  const url = publicHref(href);
  if (!url) return null;
  return <a href={url}>Website</a>;
}

function SocialLinks({ member }: { member: Member }) {
  const links = [
    ["LinkedIn", publicHref(member.socials.linkedin)],
    ["X", publicHref(member.socials.x)],
    ["Instagram", publicHref(member.socials.instagram)],
    ["Website", publicHref(member.socials.website)],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  if (!links.length) return null;
  return (
    <div className="stack-row">
      {links.map(([label, href]) => (
        <a key={label} href={href}>
          {label}
        </a>
      ))}
    </div>
  );
}

export function MemberView({ member }: { member: Member }) {
  return (
    <article className="shell page-pad">
      <p className="kicker">{member.city ?? "Member"}</p>
      <div className="split">
        <div className="portrait">
          <Monogram name={member.fullName} imageUrl={member.photoUrl} />
        </div>
        <div>
          <h1 className="page-title">{member.fullName}</h1>
          <p className="meta">{member.title}</p>
          <p className="lede">{member.bio}</p>
          <div className="chips">
            {member.expertise.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="chips">
            {member.industries.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          {member.companies.length ? (
            <p>
              {member.companies.map((company, index) => (
                <span key={company.slug}>
                  {index > 0 ? " · " : ""}
                  <Link href={`/portfolio/${company.slug}`}>{company.name}</Link>
                  {company.role ? ` — ${company.role}` : ""}
                </span>
              ))}
            </p>
          ) : null}
          <SocialLinks member={member} />
        </div>
      </div>
      <div className="have-need">
        <article>
          <h2>I have</h2>
          <p>{member.iHave || "—"}</p>
        </article>
        <article>
          <h2>I need</h2>
          <p>{member.iNeed || "—"}</p>
        </article>
      </div>
    </article>
  );
}

export function CompanyView({ company }: { company: Company }) {
  const founders = company.people.filter((person) => person.founder);
  return (
    <article className="shell page-pad">
      <p className="kicker">{company.industry}</p>
      <div className="split">
        <Monogram name={company.name} imageUrl={company.logoUrl} />
        <div>
          <h1 className="page-title">{company.name}</h1>
          <p className="meta">{company.stage}</p>
          <p className="lede">{company.description}</p>
          <WebsiteLink href={company.website} />
        </div>
      </div>
      {company.metrics.length ? (
        <div className="metrics">
          {company.metrics.map((metric) => (
            <div className="metric" key={metric.id}>
              <strong>{metric.value}</strong>
              <span className="meta">{metric.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="split">
        <section>
          <h2>Services</h2>
          <div className="chips">
            {company.services.map((service) => (
              <span key={service}>{service}</span>
            ))}
          </div>
          <h2>Founders</h2>
          {founders.length ? (
            <ul className="clean-list">
              {founders.map((person) => (
                <li key={person.slug}>
                  <Link href={`/members/${person.slug}`}>{person.name}</Link>
                  {person.title ? ` — ${person.title}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="quiet">Founders appear when they are linked to the company.</p>
          )}
        </section>
        <section>
          <h2>Achievements</h2>
          {company.achievements.length ? (
            company.achievements.map((item) => (
              <article key={item.id} className="panel">
                <h3>
                  {item.title}
                  {item.year ? <span className="meta"> {item.year}</span> : null}
                </h3>
                <p>{item.description}</p>
              </article>
            ))
          ) : (
            <p className="quiet">No achievements published yet.</p>
          )}
        </section>
      </div>
      <section>
        <h2>Current opportunities</h2>
        <div className="ledger ledger-labeled">
          {company.opportunities.map((item) => (
            <Link key={item.slug} href={`/opportunities/${item.slug}`}>
              <span className="meta">{opportunityLabel(item.type)}</span>
              <strong>{item.title}</strong>
            </Link>
          ))}
        </div>
        {company.opportunities.length === 0 ? <p className="quiet">No open public opportunities.</p> : null}
      </section>
    </article>
  );
}

export function OpportunityView({ opportunity }: { opportunity: Opportunity }) {
  return (
    <article className="shell page-pad">
      <p className="kicker">{opportunityLabel(opportunity.type)}</p>
      <h1 className="page-title">{opportunity.title}</h1>
      <p className="meta">
        {opportunity.company ? (
          <Link href={`/portfolio/${opportunity.company.slug}`}>{opportunity.company.name}</Link>
        ) : (
          "Collective"
        )}
        {opportunity.location ? ` · ${opportunity.location}` : ""}
        {opportunity.deadline ? ` · ${formatDate(opportunity.deadline)}` : ""}
        {opportunity.visibility !== "public" ? ` · ${visibilityLabel(opportunity.visibility)}` : ""}
      </p>
      <p className="lede">{opportunity.summary}</p>
      <Prose text={opportunity.description} />
      <section className="panel narrow">
        <h2>Express interest</h2>
        <p className="quiet">Members and outside visitors can both begin here.</p>
        <ActionForm action={expressInterest} submitLabel="Submit interest">
          <input type="hidden" name="opportunity_id" value={opportunity.id} />
          <label>
            Name
            <input name="guest_name" autoComplete="name" />
          </label>
          <label>
            Email
            <input name="guest_email" type="email" autoComplete="email" />
          </label>
          <label>
            Company
            <input name="guest_company" />
          </label>
          <label>
            Note
            <textarea name="message" required />
          </label>
        </ActionForm>
      </section>
    </article>
  );
}

export function EventView({ event }: { event: CollectiveEvent }) {
  return (
    <article className="shell page-pad">
      <p className="kicker">{event.series ?? "Event"}</p>
      <h1 className="page-title">{event.title}</h1>
      <p className="meta">
        {formatDateTime(event.startsAt)} · {event.location} · {event.capacity} seats
        {event.inviteOnly ? " · Invite only" : ""}
        {event.requiresApproval ? " · Approval required" : ""}
      </p>
      <Prose text={event.description} />
      {event.sponsors.length ? (
        <p className="meta">Sponsors: {event.sponsors.map((sponsor) => sponsor.name).join(" · ")}</p>
      ) : null}
      <section className="panel narrow">
        <h2>Request a seat</h2>
        <ActionForm action={registerForEvent} submitLabel="Register">
          <input type="hidden" name="event_id" value={event.id} />
          <label>
            Name
            <input name="guest_name" autoComplete="name" />
          </label>
          <label>
            Email
            <input name="guest_email" type="email" autoComplete="email" />
          </label>
          <label>
            Company
            <input name="guest_company" />
          </label>
          <label>
            Title
            <input name="guest_title" />
          </label>
          <label>
            Referral source
            <input name="referral_source" />
          </label>
        </ActionForm>
      </section>
    </article>
  );
}

export function InsightView({ insight }: { insight: Insight }) {
  return (
    <article className="shell page-pad reading">
      <p className="kicker">{insight.publishedAt ? formatDate(insight.publishedAt) : "Insight"}</p>
      <h1 className="page-title">{insight.title}</h1>
      <p className="lede">{insight.excerpt}</p>
      <Prose text={insight.body} />
    </article>
  );
}
