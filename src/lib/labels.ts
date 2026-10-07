export const OPPORTUNITY_TYPES = [
  ["strategic_partner", "Strategic Partner"],
  ["capital", "Capital"],
  ["customer", "Customer"],
  ["distribution", "Distribution"],
  ["real_estate", "Real Estate"],
  ["acquisition", "Acquisition"],
  ["joint_venture", "Joint Venture"],
  ["sponsorship", "Sponsorship"],
  ["vendor", "Vendor"],
  ["talent", "Talent"],
  ["other", "Other"],
] as const;

export const VISIBILITIES = [
  ["public", "Public"],
  ["members", "Members Only"],
  ["private", "Private"],
] as const;

export const METRIC_LABELS = [
  "Years operating",
  "Properties",
  "Customers",
  "Locations",
  "Audience",
  "Projects",
  "Ventures",
  "Employees",
  "Markets",
  "Transactions",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number][0];
export type Visibility = (typeof VISIBILITIES)[number][0];

const opportunityLabels = Object.fromEntries(OPPORTUNITY_TYPES) as Record<
  OpportunityType,
  string
>;

const visibilityLabels = Object.fromEntries(VISIBILITIES) as Record<
  Visibility,
  string
>;

export function opportunityLabel(type: string) {
  return opportunityLabels[type as OpportunityType] ?? "Opportunity";
}

export function visibilityLabel(visibility: string) {
  return visibilityLabels[visibility as Visibility] ?? visibility;
}
