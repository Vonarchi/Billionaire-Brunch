import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MemberView } from "@/components/records/views";
import { getPublicMember } from "@/lib/dal/catalog";
import { getMemberForViewer } from "@/lib/dal/portal";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = await getPublicMember(slug);
  return { title: member?.fullName ?? "Member" };
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="shell page-pad">Opening profile…</div>}>
      <MemberRoute params={params} />
    </Suspense>
  );
}

async function MemberRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = (await getPublicMember(slug)) ?? (await getMemberForViewer(slug));
  if (!member || member.membershipStatus === "pending") notFound();
  return <MemberView member={member} />;
}
