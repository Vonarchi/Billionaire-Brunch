import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { opportunityLabel } from "@/lib/labels";
import type { CollectiveEvent, Company, Insight, Member, Opportunity, Partner } from "@/lib/types";

export function HomePage({
  companies,
  opportunities,
  members,
  capitalTable,
  partners,
  insights,
}: {
  companies: Company[];
  opportunities: Opportunity[];
  members: Member[];
  capitalTable: CollectiveEvent | null;
  partners: Partner[];
  insights: Insight[];
}) {
  return (
    <>
      <section className="hero">
        <div className="shell">
          <p className="kicker">Private collective</p>
          <h1 className="display">
            Build.
            <br />
            Connect.
            <br />
            <em>Own.</em>
          </h1>
          <p className="hero-copy">
            A private coalition of entrepreneurs combining technology, real estate, media, healthcare,
            relationships and capital to build generational economic power.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-solid" href="/portfolio">
              Explore Our Portfolio
            </Link>
            <Link className="btn btn-ghost" href="/connect">
              Connect With Us
            </Link>
          </div>
          <p className="disciplines">
            <span>Technology</span>
            <span>Real estate</span>
            <span>Media</span>
            <span>Healthcare</span>
            <span>Capital</span>
          </p>
        </div>
      </section>

      <section className="section" id="philosophy">
        <div className="shell">
          <p className="kicker">Our philosophy</p>
          <div className="philosophy">
            <article>
              <p className="index-no">01</p>
              <h3>Build.</h3>
              <p>
                Companies, properties, platforms, and partnerships are assembled with the discipline of
                an institution. The work is to make something that can be held.
              </p>
            </article>
            <article>
              <p className="index-no">02</p>
              <h3>Connect.</h3>
              <p>
                Introductions are deliberate. Talent, distribution, relationships, and capital move
                through trusted rooms — not through a public feed.
              </p>
            </article>
            <article>
              <p className="index-no">03</p>
              <h3>Own.</h3>
              <p>
                Equity, audience, and real assets stay with the people who build them. The aim is
                generational economic power.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-follow">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="kicker">Member companies</p>
              <h2>The portfolio.</h2>
            </div>
            <Link className="text-link" href="/portfolio">
              All companies
            </Link>
          </div>
          <div className="ledger">
            {companies.slice(0, 6).map((company, index) => (
              <Link key={company.slug} href={`/portfolio/${company.slug}`}>
                <span className="index-no">{String(index + 1).padStart(2, "0")}</span>
                <strong>{company.name}</strong>
                <span>{company.industry}</span>
                <span className="meta">{company.stage}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-follow">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="kicker">Current opportunities</p>
              <h2>Open work.</h2>
            </div>
            <Link className="text-link" href="/opportunities">
              The board
            </Link>
          </div>
          <div className="ledger ledger-labeled">
            {opportunities.slice(0, 4).map((item) => (
              <Link key={item.slug} href={`/opportunities/${item.slug}`}>
                <span className="meta">{opportunityLabel(item.type)}</span>
                <strong>{item.title}</strong>
                <span>{item.company?.name}</span>
                <span className="meta">{item.location}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-follow">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="kicker">Featured members</p>
              <h2>The room.</h2>
            </div>
            <Link className="text-link" href="/members">
              Directory
            </Link>
          </div>
          <div className="member-index">
            {members.map((member) => (
              <Link key={member.slug} href={`/members/${member.slug}`}>
                <strong>{member.fullName}</strong>
                <span className="quiet">{member.title}</span>
                <p>{member.iHave}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="capital-table">
        <div className="shell">
          <div className="capital-frame">
            <p className="kicker">The Capital Table</p>
            <h2>{capitalTable ? capitalTable.title : "A private dinner."}</h2>
            <p className="lede">
              {capitalTable
                ? capitalTable.description
                : "The collective’s primary room. Principals, a finite guest list, and a reason to sit down."}
            </p>
            {capitalTable ? (
              <p className="meta">
                {formatDateTime(capitalTable.startsAt)} · {capitalTable.location}
              </p>
            ) : null}
            <div className="hero-actions">
              <Link className="btn btn-solid" href={capitalTable ? `/events/${capitalTable.slug}` : "/events"}>
                Request a seat
              </Link>
              <Link className="btn btn-ghost" href="/events">
                All events
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-follow">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="kicker">Strategic partners</p>
              <h2>Alongside.</h2>
            </div>
            <Link className="text-link" href="/partners">
              Partners
            </Link>
          </div>
          <div className="partner-line">
            {partners.map((partner) => (
              <article key={partner.id}>
                <strong>{partner.name}</strong>
                <p className="quiet">
                  {partner.tier} — {partner.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-follow">
        <div className="shell">
          <div className="section-head">
            <div>
              <p className="kicker">Latest insights</p>
              <h2>Notes.</h2>
            </div>
            <Link className="text-link" href="/insights">
              All insights
            </Link>
          </div>
          <div className="insight-list">
            {insights.slice(0, 3).map((insight) => (
              <Link key={insight.slug} href={`/insights/${insight.slug}`}>
                <strong>{insight.title}</strong>
                <span className="quiet">{insight.excerpt}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="shell connect-band">
          <div>
            <p className="kicker">Connect with the collective</p>
            <h2>The door is intentional.</h2>
          </div>
          <Link className="btn btn-solid" href="/connect">
            Connect With Us
          </Link>
        </div>
      </section>
    </>
  );
}
