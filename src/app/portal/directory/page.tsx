import { DirectoryBrowser } from "@/components/portal/browsers";
import { requireMember } from "@/lib/dal/session";
import { getDirectory } from "@/lib/dal/portal";

export const instant = false;

export default async function DirectoryPage() {
  await requireMember();
  const members = await getDirectory();
  return (
    <>
      <p className="kicker">Directory</p>
      <h1 className="page-title">Members.</h1>
      <DirectoryBrowser members={members} />
    </>
  );
}
