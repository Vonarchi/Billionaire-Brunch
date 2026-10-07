import { ActionForm } from "@/components/ui/action-form";
import { requestIntroduction, setIntroductionStatus } from "@/lib/actions/member";
import { requireMember } from "@/lib/dal/session";
import { getDirectory, getIntroductions } from "@/lib/dal/portal";
import { formatDate } from "@/lib/format";

export const instant = false;

export default async function IntroductionsPage() {
  const viewer = await requireMember();
  const [introductions, members] = await Promise.all([getIntroductions(viewer), getDirectory()]);

  return (
    <>
      <p className="kicker">Introductions</p>
      <h1 className="page-title">Ask before you connect.</h1>
      <ActionForm action={requestIntroduction} submitLabel="Request introduction">
        <label>
          Member
          <select name="recipient_id" defaultValue="">
            <option value="" disabled>
              Choose
            </option>
            {members
              .filter((member) => member.id !== viewer.id)
              .map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
          </select>
        </label>
        <label>
          Subject
          <input name="subject" required />
        </label>
        <label>
          Context
          <textarea name="message" required />
        </label>
      </ActionForm>
      <div className="stack" style={{ marginTop: "2rem" }}>
        {introductions.map((item) => (
          <article key={item.id} className="panel">
            <p className="meta">
              {item.direction} · {item.status} · {formatDate(item.createdAt)}
            </p>
            <h2>{item.subject}</h2>
            <p>
              {item.counterpart} — {item.message}
            </p>
            {item.direction === "received" && item.status === "requested" ? (
              <div className="inline-actions">
                <ActionForm action={setIntroductionStatus} submitLabel="Accept">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="status" value="accepted" />
                </ActionForm>
                <ActionForm action={setIntroductionStatus} submitLabel="Decline">
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="status" value="declined" />
                </ActionForm>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
