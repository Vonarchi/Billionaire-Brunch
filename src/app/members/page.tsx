import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/records/views";
import { getPublicMembers } from "@/lib/dal/catalog";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const members = await getPublicMembers();
  return (
    <>
      <PageIntro
        kicker="Members"
        title="Principals."
        lede="Public profiles are published by the collective. The full directory, including what members have and need, lives with approved members."
      />
      <section className="shell page-pad">
        <div className="member-index">
          {members.map((member) => (
            <Link key={member.slug} href={`/members/${member.slug}`}>
              <strong>{member.fullName}</strong>
              <span className="quiet">{member.title}</span>
              <p>{member.iNeed}</p>
            </Link>
          ))}
        </div>
        {members.length === 0 ? <p className="quiet">No public members yet.</p> : null}
      </section>
    </>
  );
}
