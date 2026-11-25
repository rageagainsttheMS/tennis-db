import { describe, expect, it } from "vitest";
import { ageFromBirthDate, toDateInputValue } from "@/lib/utils/utils";

describe("ageFromBirthDate", () => {
  const born = new Date("2003-05-05T00:00:00Z");

  it.each([
    ["the day before the birthday", "2026-05-04T23:59:59Z", 22],
    ["on the birthday", "2026-05-05T00:00:00Z", 23],
    ["later in the year", "2026-11-25T12:00:00Z", 23],
    ["earlier in the year", "2026-01-10T00:00:00Z", 22],
  ])("counts whole years %s", (_, today, expected) => {
    expect(ageFromBirthDate(born, new Date(today))).toBe(expected);
  });

  it("handles a 29 February birthday in a non-leap year", () => {
    const leap = new Date("2004-02-29T00:00:00Z");
    expect(ageFromBirthDate(leap, new Date("2026-02-28T00:00:00Z"))).toBe(21);
    expect(ageFromBirthDate(leap, new Date("2026-03-01T00:00:00Z"))).toBe(22);
  });

  it("accepts a serialised date and returns null without a valid date", () => {
    expect(ageFromBirthDate("2003-05-05T00:00:00.000Z", new Date("2026-11-25T00:00:00Z"))).toBe(23);
    expect(ageFromBirthDate(null)).toBeNull();
    expect(ageFromBirthDate("not a date")).toBeNull();
  });
});

describe("toDateInputValue", () => {
  it("formats a date for a date input", () => {
    expect(toDateInputValue(new Date("2003-05-05T00:00:00Z"))).toBe("2003-05-05");
    expect(toDateInputValue(null)).toBe("");
  });
});
