import { describe, expect, it } from "vitest";
import { getApplicationAnalysisText } from "@/lib/applicationText";

describe("getApplicationAnalysisText", () => {
  it("prefers cvTextSnapshot when available", () => {
    const result = getApplicationAnalysisText({
      cvTextSnapshot: "snapshot",
      candidateCV: { cvText: "candidate" },
      cvText: "legacy",
    });

    expect(result).toBe("snapshot");
  });

  it("falls back to candidateCV then cvText", () => {
    expect(
      getApplicationAnalysisText({
        candidateCV: { cvText: "candidate" },
        cvText: "legacy",
      }),
    ).toBe("candidate");

    expect(getApplicationAnalysisText({ cvText: "legacy" })).toBe("legacy");
    expect(getApplicationAnalysisText({})).toBe("");
  });
});
