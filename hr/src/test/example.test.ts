import { describe, it, expect } from "vitest";
import { recommendationToFrench } from "@/lib/recommendation-labels";

describe("recommendationToFrench", () => {
  it("traduit une recommandation connue", () => {
    expect(recommendationToFrench("Interview")).toBe("Entretien");
  });

  it("retourne la valeur brute si inconnue", () => {
    expect(recommendationToFrench("Other")).toBe("Other");
  });
});
