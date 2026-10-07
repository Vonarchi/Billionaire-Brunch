import { DocumentForm } from "@/components/portal/document-form";
import { requireMember } from "@/lib/dal/session";
import { getDocuments } from "@/lib/dal/portal";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { visibilityLabel } from "@/lib/labels";

export const instant = false;

export default async function DocumentsPage() {
  const viewer = await requireMember();
  const documents = await getDocuments();
  return (
    <>
      <p className="kicker">Documents</p>
      <h1 className="page-title">The file room.</h1>
      <DocumentForm configured={isSupabaseConfigured()} userId={viewer.id} />
      <div className="stack" style={{ marginTop: "2rem" }}>
        {documents.map((document) => (
          <article key={document.id} className="panel">
            <p className="meta">
              {visibilityLabel(document.visibility)} · {formatDate(document.createdAt)}
            </p>
            <h2>{document.title}</h2>
            <p>{document.description}</p>
          </article>
        ))}
      </div>
    </>
  );
}
