import { HomePage } from "@/components/home/home-page";
import {
  getFeaturedMembers,
  getPublicCompanies,
  getPublicEvents,
  getPublicInsights,
  getPublicOpportunities,
  getPublicPartners,
} from "@/lib/dal/catalog";

export default async function Page() {
  const [companies, opportunities, members, events, partners, insights] = await Promise.all([
    getPublicCompanies(),
    getPublicOpportunities(),
    getFeaturedMembers(),
    getPublicEvents(),
    getPublicPartners(),
    getPublicInsights(),
  ]);
  const capitalTable =
    events.find((event) => event.series?.toLowerCase() === "the capital table") ?? events[0] ?? null;

  return (
    <HomePage
      companies={companies}
      opportunities={opportunities}
      members={members}
      capitalTable={capitalTable}
      partners={partners}
      insights={insights}
    />
  );
}
