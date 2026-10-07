import { requireMember } from "@/lib/dal/session";
import { getResources } from "@/lib/dal/portal";

export const instant = false;

export default async function ResourcesPage() {
  await requireMember();
  const resources = await getResources();
  return (
    <>
      <p className="kicker">Resources</p>
      <h1 className="page-title">Practice.</h1>
      <div className="partner-line">
        {resources.map((resource) => (
          <article key={resource.id}>
            <p className="meta">{resource.category}</p>
            <h2>{resource.title}</h2>
            <p className="quiet">{resource.summary}</p>
            {resource.url ? <a href={resource.url}>Open</a> : null}
          </article>
        ))}
      </div>
    </>
  );
}
