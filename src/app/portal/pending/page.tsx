import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/dal/session";

export const instant = false;

export default async function PendingPage() {
  const viewer = await requireViewer();
  if (viewer.preview || viewer.membershipStatus === "approved") redirect("/portal");

  return (
    <>
      <p className="kicker">Membership</p>
      <h1 className="page-title">Your request is {viewer.membershipStatus}.</h1>
      <p className="quiet">
        The portal opens after an administrator approves the profile. You can sign out from the menu.
        Settings stay available once you are admitted.
      </p>
    </>
  );
}
