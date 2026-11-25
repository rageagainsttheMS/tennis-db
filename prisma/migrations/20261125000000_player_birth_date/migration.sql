-- Replace the free-text age with a birth date, so the age shown on a profile never goes stale.
-- Existing age values can't be converted to a date and are dropped; re-enter them as birth dates.
ALTER TABLE "Player" ADD COLUMN "birthDate" DATE;
ALTER TABLE "Player" DROP COLUMN "age";
