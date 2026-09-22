// @vitest-environment node
// A pure predicate over an application status — no DOM, no React runtime.
import { describe, expect, it } from "vitest";

import { chattableApplicationId } from "@/features/discussions/chattable";

describe("chattableApplicationId", () => {
  it.each(["PENDING", "VIEWED", "WAITING_PAYMENT", "ACCEPTED", "STARTED"])(
    "offers the conversation on a %s application",
    (status) => {
      expect(chattableApplicationId("a-1", status)).toBe("a-1");
    },
  );

  it.each(["REJECTED", "CANCELLED", "END"])(
    "hides it on a %s application",
    (status) => {
      // The thread is closed server-side in these states, so a button here
      // would render a control the API then refuses. A dead control is worse
      // than no control.
      expect(chattableApplicationId("a-1", status)).toBeNull();
    },
  );

  it("hides it on a status this client has never heard of", () => {
    // A status added server-side must fail CLOSED here. The opposite default
    // would light the button up for every future state by accident.
    expect(chattableApplicationId("a-1", "SOMETHING_NEW")).toBeNull();
  });

  it("agrees with the backend on how many statuses are chattable", () => {
    // Five, matching LIVE_APPLICATION_STATUSES in ProfileChatService. If the
    // two drift, an employer sees a button the worker does not — the kind of
    // asymmetry nobody reports and everybody notices.
    const all = [
      "PENDING",
      "VIEWED",
      "WAITING_PAYMENT",
      "ACCEPTED",
      "STARTED",
      "REJECTED",
      "CANCELLED",
      "END",
    ];
    const offered = all.filter((s) => chattableApplicationId("a", s) !== null);
    expect(offered).toHaveLength(5);
  });
});
