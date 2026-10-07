"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { opportunityLabel, visibilityLabel } from "@/lib/labels";
import type { Member, Opportunity } from "@/lib/types";

export function DirectoryBrowser({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All");
  const industries = useMemo(
    () => ["All", ...new Set(members.flatMap((member) => member.industries))],
    [members],
  );
  const shown = members.filter((member) => {
    const haystack = `${member.fullName} ${member.title} ${member.expertise.join(" ")} ${member.iHave} ${member.iNeed}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesIndustry = industry === "All" || member.industries.includes(industry);
    return matchesQuery && matchesIndustry;
  });

  return (
    <>
      <div className="split">
        <label>
          Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, expertise, need" />
        </label>
        <label>
          Industry
          <select value={industry} onChange={(event) => setIndustry(event.target.value)}>
            {industries.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="member-index">
        {shown.map((member) => (
          <Link key={member.id} href={`/members/${member.slug}`}>
            <strong>{member.fullName}</strong>
            <span className="quiet">{member.title}</span>
            <p>
              <span className="meta">I have </span>
              {member.iHave}
            </p>
            <p>
              <span className="meta">I need </span>
              {member.iNeed}
            </p>
          </Link>
        ))}
      </div>
      {shown.length === 0 ? <p className="quiet">No members match.</p> : null}
    </>
  );
}

export function OpportunityBrowser({
  opportunities,
  privateOnly = false,
}: {
  opportunities: Opportunity[];
  privateOnly?: boolean;
}) {
  const [type, setType] = useState("All");
  const source = privateOnly ? opportunities.filter((item) => item.visibility === "private") : opportunities;
  const shown = source.filter((item) => type === "All" || item.type === type);

  return (
    <>
      <label>
        Type
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="All">All types</option>
          {[...new Set(source.map((item) => item.type))].map((item) => (
            <option key={item} value={item}>
              {opportunityLabel(item)}
            </option>
          ))}
        </select>
      </label>
      <div className="ledger">
        {shown.map((item) => (
          <Link key={item.id} href={`/opportunities/${item.slug}`}>
            <span className="meta">{opportunityLabel(item.type)}</span>
            <strong>{item.title}</strong>
            <span>{item.company?.name ?? "Collective"}</span>
            <span className="meta">{visibilityLabel(item.visibility)}</span>
          </Link>
        ))}
      </div>
      {shown.length === 0 ? <p className="quiet">Nothing in this view.</p> : null}
    </>
  );
}
