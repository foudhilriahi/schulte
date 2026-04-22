export type Recommendation = "Hire" | "Interview" | "Request More Info" | "Reject";

const RECOMMENDATION_LABELS_FR: Record<Recommendation, string> = {
  Hire: "Embaucher",
  Interview: "Entretien",
  "Request More Info": "Demander plus d'informations",
  Reject: "Refuser",
};

export function recommendationToFrench(value: string): string {
  if (value in RECOMMENDATION_LABELS_FR) {
    return RECOMMENDATION_LABELS_FR[value as Recommendation];
  }
  return value;
}
