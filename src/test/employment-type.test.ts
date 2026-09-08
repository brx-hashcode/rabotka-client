// @vitest-environment node
// Pure predicates over an offer's employment type — no DOM or React runtime.
import { describe, expect, it } from "vitest";

import {
  closesOnFill,
  isCompletable,
  isDatedMission,
  scheduledAtLabel,
} from "@/lib/employment-type";
import {
  jobStatusLabel,
  closedToCandidatesReason,
} from "@/features/employer/config/job-status";

const ONGOING = ["CDD", "CDI", "STAGE"] as const;

describe("isDatedMission", () => {
  it("is true only for a MISSION", () => {
    expect(isDatedMission("MISSION")).toBe(true);
    for (const type of ONGOING) expect(isDatedMission(type)).toBe(false);
  });

  it.each([null, undefined, ""])("treats %p as a MISSION", (value) => {
    // The fail-safe direction. A missing type has to behave as it always has —
    // if an absent field silently took the newer branch, an offer would stop
    // getting its reminders and its worker would lose the ability to confirm
    // the work is done.
    expect(isDatedMission(value)).toBe(true);
  });
});

describe("closesOnFill", () => {
  it("is what ends an ongoing engagement, never a MISSION", () => {
    // A MISSION runs to its date and its worker confirms it finished. The
    // others end at hiring: Rabotka's part is the recruitment.
    expect(closesOnFill("MISSION")).toBe(false);
    for (const type of ONGOING) expect(closesOnFill(type)).toBe(true);
  });
});

describe("isCompletable (does the worker confirm this?)", () => {
  it("is the worker's call only on a MISSION", () => {
    // An ongoing engagement has no moment the worker could confirm — the work
    // carries on off-platform — so the API refuses it, and offering the action
    // would produce an error they cannot act on.
    expect(isCompletable("MISSION")).toBe(true);
    for (const type of ONGOING) expect(isCompletable(type)).toBe(false);
  });
});

describe("scheduledAtLabel", () => {
  it("names the mission date on a MISSION and the deadline otherwise", () => {
    // One column, two meanings. Asking an employer for "la date de la mission"
    // on a CDI is how you get one invented.
    expect(scheduledAtLabel("MISSION")).toMatch(/mission/i);
    for (const type of ONGOING) {
      expect(scheduledAtLabel(type)).toMatch(/ouverte jusqu'au/i);
    }
  });
});

describe("jobStatusLabel", () => {
  it("says Pourvue, not Terminée, when an ongoing engagement closes", () => {
    // COMPLETED means "the work is done" on a MISSION and "recruiting is over"
    // on the rest — where the job itself is only just starting. Telling an
    // employer their new permanent hire is "Terminée" reads as a failure.
    for (const type of ONGOING) {
      expect(jobStatusLabel("COMPLETED", type)).toBe("Pourvue");
    }
  });

  it("keeps Terminée on a MISSION, where the work really did end", () => {
    expect(jobStatusLabel("COMPLETED", "MISSION")).toBe("Terminée");
    expect(jobStatusLabel("COMPLETED")).toBe("Terminée");
  });

  it("leaves every other status alone", () => {
    expect(jobStatusLabel("ACTIVE", "CDI")).toBe("Ouverte");
    expect(jobStatusLabel("FILLED", "CDI")).toBe("Pourvue");
  });
});

describe("closedToCandidatesReason", () => {
  it("explains a closed engagement as recruitment ending", () => {
    expect(closedToCandidatesReason("COMPLETED", "CDI")).toMatch(
      /recrutement/i,
    );
    expect(closedToCandidatesReason("COMPLETED", "MISSION")).toMatch(
      /terminée/i,
    );
  });
});
