import type { Metadata } from "next";
import { PageIntro } from "@/components/records/views";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageIntro
        kicker="About"
        title="A private headquarters."
        lede="Billionaire Brunch is the digital headquarters of a private Black-led coalition of entrepreneurs, business owners, technologists, real-estate professionals, media executives, and investors."
      />
      <section className="shell page-pad">
        <div className="philosophy">
          <article>
            <h2>What it connects</h2>
            <p>Talent. Businesses. Relationships. Capital. Technology. Real estate. Distribution. Opportunities.</p>
          </article>
          <article>
            <h2>What it is not</h2>
            <p>
              This is not a traditional networking website. There is no public feed of strangers, no
              leaderboard, and no obligation to perform a personal brand.
            </p>
          </article>
          <article>
            <h2>How membership works</h2>
            <p>
              Request an account, then wait for approval. Approved members enter the directory, the
              opportunity board, introductions, events, and the document room. Administrators decide
              what the public is allowed to see.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
