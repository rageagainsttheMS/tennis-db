# New match data (`seed-files/`): analysis and seeding plan

*Written 2026-11-11 from a profile of the six files in `seed-files/` and the live database.*

## Summary

The new files aren't a reformatted `Match.csv`. They come from a **different data source**, with its own player IDs, no tournament IDs, different statistics and about 30 times the volume. Loading them means changing the data model, the importer and some of the UI, not just the column mapping.

**Recommendation:** replace the 2024 `Match.csv` data with the new source, using a cleaner schema in which players and tournaments are created from the match data. Rewrite the importer as a tested, re-runnable per-season loader. Only **3 players and 4 tournaments** in the live database were entered by hand, so moving them over is a small manual mapping.

The four open questions (source and licence, Challengers, betting odds, lost stats) are settled: see [Decisions](#decisions-made-2026-11-11). The converter is written, and its dry run is in [Dry-run results](#dry-run-results-2026-11-11). The sections in between are the original analysis of all 81,618 rows, Challengers included.

---

## What's in the new files

| | |
| --- | --- |
| Files | `2021-atp-season.csv` … `2026-atp-season.csv`, identical 49-column headers |
| Rows | **81,618** (10,193 in 2021 rising to 15,878 in 2026). The current database has 2,779 |
| Date range | 5 Jan 2021 → 12 Nov 2026. 2026 is in progress and includes 58 `SCHEDULED` future matches |
| Match ID | `match_id`, unique across all files (no duplicates) |
| Tour level | `ATP Tour` 24,886 · `ATP Chall` (Challenger) **56,689** · `ATP Exhib` 43 |
| Outcome | `status_extra`: FINISHED 77,824 · RETIRED 2,709 · CANCELED 605 · WALKOVER 409 · AWARDED 13 · SCHEDULED 58 |
| Players | 3,391 distinct `home_id`/`away_id` values. Names are abbreviated: `Dimitrov G.`, `Galovic V.` |
| Stats coverage | Aces, double faults and serve/return/break-point percentages are filled for ~98–99% of played matches. Rank and ranking points are filled for only **~70%** |

For the 2024 ATP Tour main draw, the new source has 2,859 played matches against 2,778 in `Match.csv`, so the coverage is comparable.

## How it differs from `Match.csv`

### 1. Home/away instead of winner/loser
Each row has `home_*` and `away_*` columns, and `winner_code` says who won: `1` = home, `2` = away, empty = no result. The importer has to turn this into winner/loser columns, which is what the app uses. 55 finished rows have a winner who won fewer sets. These are retirements, so the code must follow `winner_code`, not the set count.

### 2. A different player ID system, and no overlap
New IDs look like `479435`. The old ones are ATP codes like `D875`. **None of the 312 old player IDs appear in the new data**, and names don't match directly either (`Grigor Dimitrov` vs `Dimitrov G.`). So every existing link between a `Player` and its matches (`Player.playerMatchId` ↔ `winnerId`/`loserId`) breaks.

Data-quality points:
- **19 abbreviated names belong to more than one player** (e.g. `Zhang Z.` is two different people, as is `Martin A.`). Players must be keyed by ID, never by name, and search will show apparent duplicates unless there's something to tell them apart.
- **8 IDs appear with more than one spelling** (e.g. `Miguel G.` / `Miguel L. A.`). Use the most recent spelling.

### 3. No tournament ID
There's only a `tournament` name, and the name carries several kinds of information that need splitting out:

| Raw name | Event | Notes |
| --- | --- | --- |
| `Brisbane ATP` | Brisbane | Tour level |
| `Brisbane ATP - Qualification` | Brisbane | Qualifying rounds of the same event (511 such names) |
| `Rotterdam ATP (indoor)` | Rotterdam | Indoor flag |
| `Finals - Turin ATP - Play Offs (indoor)` | ATP Finals | Knockout stage after round robin |
| `Adelaide 2 ATP` | Adelaide 2 | A second event in the same city and season |
| `Antalya Chall. Men` | Antalya | Challenger level |
| `US Open ATP - WIC` | US Open | Unclear (possibly a wild-card event), so check before importing |

There are 1,050 distinct raw names. The tournament **level** is mostly missing: the data says Tour vs Challenger, but not Grand Slam / Masters 1000 / 500 / 250. Grand Slams, the Finals and team events can be recognised by name. **ATP 500 vs 250 needs a small lookup list**, because which events are 500s changes from year to year.

Names also differ from the current ones: `French Open ATP` vs `Roland Garros`, and `Finals - Turin ATP` vs `ATP Finals`.

### 4. Different statistics

| Shown in the app today | In the new data? |
| --- | --- |
| Aces, double faults | ✅ counts |
| First serve %, 1st/2nd serve points won % | ❌ not available |
| Service points won | ✅ as a **%** (`service_points_won_perc`) |
| Break points saved / faced | ⚠️ only **% saved** (and % won on return), not the counts |
| Service games | ❌ |
| Match length (minutes) | ❌ |
| Seed, entry (Q/WC/LL), hand, height, age, country | ❌ |
| Score | ⚠️ set-by-set games (e.g. 7-6, 7-5) with no tiebreak points, so the score string has to be built |
| Best of 3/5 | ❌ derive it: Grand Slam main draw = 5, otherwise 3 |
| — | ➕ **new:** return points won %, break points won %, ranking points, betting odds (match and first set), Tour/Challenger level, retired/walkover/awarded status |

**This is the biggest product trade-off.** The match page loses its first-serve breakdown, service games, break-point counts and duration, for every season including 2024, if `Match.csv` is replaced. It gains return and break-point percentages, plus far more matches.

### 5. Rounds use different names
| New | App code (`ROUND_TYPES`) |
| --- | --- |
| `Final` | `F` |
| `Semi-finals` | `SF` |
| `Quarter-finals` | `QF` |
| `1/8-finals` | `R16` |
| `1/16-finals` | `R32` |
| `1/32-finals` | `R64` |
| `1/64-finals` | `R128` |
| `Qualifier` (and any row from a "- Qualification" event) | new `Q` |
| empty, in the Finals / Next Gen / United Cup / ATP Cup | `RR` (round robin / group stage) |
| empty, in the Davis Cup | new `TIE` (or skip team events) |
| `3rd place` / `5th place` | new `BR` / placement (Olympics bronze medal match, United Cup) |

I checked the mapping against the 2024 ATP Tour counts: Final 67, SF 134, QF 253 and `1/8-finals` 511. Each round has about twice the matches of the next, so `1/8-finals` = R16 and `1/16-finals` = R32.

### 6. Other differences
- **Surface** is lowercase (`hard`, `clay`, `grass`) where the old data had `Hard`. `no surface` (625 rows) means Davis Cup.
- **Dates:** each match has its own Unix timestamp. The old data had only one `YYYYMMDD` string per tournament, stored as text. Store a real `DateTime`.
- **Exhibitions** (43 rows) have no ranks and half have no stats. Skip them.

## What needs to change

### Data model ([prisma/schema.prisma](../prisma/schema.prisma))
- **Player** becomes generated from the data and keyed by the source ID (`sourceId` unique). The curated bio fields (hand, backhand, birthplace, turned pro, profile, image) become **optional**, because thousands of players will have only a name and ID. `playerMatchId` goes away.
- **Tournament** becomes the event (e.g. Brisbane) with a stable slug ID, a level (`GS`, `M1000`, `500`, `250`, `FINALS`, `TEAM`, `CHALLENGER`, …), an indoor flag, and the curated description and image. The season moves onto the match, so one tournament page can show every year.
- **Match:**
  - `sourceMatchId` (unique), `season`, `date` (DateTime), `tourLevel`, `status` (`COMPLETED`/`RETIRED`/`WALKOVER`/`AWARDED`), `isQualifying`
  - **real foreign keys**: `tournamentId`, `winnerId`, `loserId` → `Player`
  - `round`, `surface`, `bestOf`, a built `score` string, sets won
  - ranks and points (nullable), aces, double faults, and the four percentages
  - optionally the odds
  - The current snake_case columns (`w_1stIn` …) are dropped.
- **Indexes:** `(winnerId)`, `(loserId)`, `(tournamentId, season)` and `(date)`. With 80k rows, profile and tournament pages will be slow without them, and today there are none.
- Since the data is replaced anyway, this is a good moment to **squash the 18 migrations** into one baseline (Tier 1 #5 in the improvements doc).

### Importer (replaces [db/importMatches.ts](../db/importMatches.ts))
- `db/seed/` with:
  - a **pure normalizer** (one CSV row → a normalized match, or a reason for skipping it)
  - a tournament-name parser
  - round/status/surface mappings
  - a loader
- **Unit tests for the normalizer**: name parsing, round mapping, home/away → winner/loser, retirements, walkovers, missing ranks. This is the riskiest code, and these are exactly the cases above.
- **Per-season, re-runnable loads:** in one transaction, delete that season's matches, then insert them in batches (`createMany` of ~1,000). Players and tournaments are upserted. Re-running 2026 picks up newly finished matches and corrections. A `--season 2026` flag loads one file.
- **Skip** `CANCELED` and `SCHEDULED` rows and exhibitions, and print a summary of what was skipped and why.
- A `--dry-run` mode that parses and validates everything without writing, so the 1,050 tournament names can be reviewed before anything changes.
- **Volume:** 81k rows is a few tens of MB in Postgres, well within Neon's free tier. Loading in batches of 1,000 is about 80 round trips per full run.

### Hand-entered data in the live database
Only **3 players** (Alcaraz, Sinner, Djokovic, 2 with images) and **4 tournaments** (the Grand Slams) exist. Keep their bios and images with a small mapping file (old → new source ID, old → new tournament slug) applied after the import. Watch for `Roland Garros` ↔ `French Open`.

### UI
- **[MatchDetails](../components/ui/MatchDetails.tsx)** and [lib/stats/match-stats.ts](../lib/stats/match-stats.ts): show the stats this source has (aces, double faults, service points won %, return points won %, break points saved % and won %), drop the rest, and label retirements and walkovers. Update the tests to match.
- **Match tables and round filter:** new rounds (`Q`, `RR`, `TIE`), real dates, and a status badge (RET / W/O).
- **Player profile:** must render for players with no curated bio. **Paginate** match history, since active players have hundreds of matches.
- **Tournament page:** a season selector, and qualifying shown separately from the main draw.
- **Search:** thousands of players now, so add an index (`pg_trgm` is ideal), and show something to tell apart `Zhang Z.` and `Zhang Z.`.
- **Admin "create player":** players exist automatically, so this becomes "edit a player's bio". Same for tournaments.
- **Filters:** default lists to ATP Tour level if Challengers are imported.

## Suggested order
1. ~~Settle the four decisions below.~~ Done.
2. ~~Write the normalizer and its tests, then run `--dry-run` on all six files and review the report (unparsed tournament names, unknown rounds, skipped rows).~~ Done.
3. Write the schema migration and squash the old migrations. Do this on a **Neon branch** first, not the production database.
4. Import into the branch, update the UI and run the e2e tests against it.
5. Switch production: migrate, import, apply the hand-entered mapping, and deploy.

## Decisions (made 2026-11-11)
1. **Source and licence.** The files come from https://tennisdata.app/downloads/, which says "Feel free to use the files in any way you like" and that current-season files are updated hourly. Coverage is described as "safely above 95%", not complete. Credit the source in the README.
2. **Challengers:** skipped. Only ATP Tour rows (`tour_type` 1) are imported.
3. **Betting odds:** dropped. The importer never reads the odds columns.
4. **Lost stats:** accepted. First-serve %, service games, break-point counts and match length go away, and `Match.csv` is replaced.

## Dry-run results (2026-11-11)

The converter ([db/seed/normalize.ts](../db/seed/normalize.ts), [db/seed/tournaments.ts](../db/seed/tournaments.ts)) and the dry run ([db/seed/dry-run.ts](../db/seed/dry-run.ts)) are written and tested. Run `npm run db:seed:dry-run` to reproduce this. It reads the files and never connects to the database.

| Season | Rows | Imported | Skipped |
| --- | --- | --- | --- |
| 2021 | 10,193 | 3,894 | 6,280 Challenger, 19 exhibition |
| 2022 | 12,914 | 4,028 | 8,868 Challenger, 18 exhibition |
| 2023 | 13,691 | 4,253 | 9,438 Challenger |
| 2024 | 14,322 | 4,260 | 10,056 Challenger, 6 exhibition |
| 2025 | 14,620 | 4,074 | 10,526 Challenger, 19 cancelled, 1 with no winner |
| 2026 | 15,878 | 4,117 | 11,521 Challenger, 232 cancelled, 5 scheduled, 3 unknown stage |
| **Total** | 81,618 | **24,626** | |

- **Players:** 1,174. **Tournaments:** 100. No duplicate match IDs.
- **Status:** 23,831 completed, 651 retired, 136 walkovers, 8 awarded.
- **Coverage of played matches:** set scores 100%, aces 99%, serve percentages 99%, both players' ranks 71%.
- **Check that the parsing is right:** each Grand Slam has exactly 762 main-draw matches (6 seasons × 127) and 672 qualifying matches (6 × 112).
- **Only 4 rows need a look:** 3 rows of `US Open ATP - WIC` (2026, a stage name the parser doesn't know, skipped) and 1 finished match with no winner recorded (Shanghai 2025, skipped).
- **Same short name, different players** (3 at tour level): `Martin A.`, `Johnson S.`, `Nava E.`
- **One player ID, two spellings** (2): `Muhamad Rifqi F.` / `Rifqi Fitriadi M.`, and `Miguel L.` / `Miguel G.`

### Choices the converter makes (review these)
- **Levels:** Grand Slams and Masters 1000s are fixed lists. ATP 500s are a list written from memory, with three events promoted in 2025 (Dallas, Doha, Munich) and Astana as a 500 in 2022 only. Everything else at tour level is an ATP 250. Check the 500 list against the ATP calendar.
- **Merged events:** Montreal and Toronto are one tournament ("Canadian Open"). The Next Gen Finals in Milan and Jeddah are one tournament. The host city is kept as a detail.
- **Renamed events:** French Open → Roland Garros, London → Queen's Club, Finals - Turin → ATP Finals, Hertogenbosch → 's-Hertogenbosch.
- **Qualifying** shares the main event's tournament and gets round `Q`.
- **Best of 5:** Grand Slam main draws, plus any match where the winner took three sets.
- **Non-tour events that the source labels "ATP Tour"** are currently imported: Davis Cup (516 matches, 2023 onwards only), United Cup (123), ATP Cup (85), Olympic Games (128), Laver Cup (45), Asian Games (37) and Hopman Cup (14). Asian Games and Hopman Cup aren't ATP events and could be dropped.

### Further decisions (2026-11-11)
- Asian Games and Hopman Cup are dropped (`excluded-event`), and so are **qualifying draws**. The dry run now imports **16,717 matches, 767 players, 98 tournaments**. Ranks are present for both players in 98% of played matches (most missing ranks were in qualifying).
- `Match.csv`, `db/importMatches.ts` and `prisma/commands.txt` are deleted.

## Status (2026-11-11)
- **Done, and loaded into Neon branch `br-old-hill-a73ka2u7`** (endpoint `ep-raspy-feather-a7vk7n0o`):
  - Migration `20261111000000_tennisdata_source` applied. No schema drift.
  - The 3 hand-entered players and 4 Grand Slams are carried over: Alcaraz → `115728`, Sinner → `225761`, Djokovic → `181695`, and the Slams moved to the slugs `australian-open`, `roland-garros`, `wimbledon` and `us-open`.
  - `npm run db:seed` loaded all six seasons in ~29 s. Re-running a season keeps match IDs.
- **UI** updated for the new data: player profiles, tournament seasons, match statistics and the admin lists.
- **Production is unchanged.** Until it's migrated, don't deploy this code: the deployed app would query columns production doesn't have.

### Switching production over
1. Back up production, e.g. by creating a Neon branch from it as a restore point.
2. `DATABASE_URL=<production> npx prisma migrate deploy`
3. `DATABASE_URL=<production> npm run db:seed`
4. Merge and push the code to `main`, which deploys it.
5. Smoke-test the live site, then delete the work branch in Neon.

Between steps 2 and 4 the live site runs old code against the new schema, so it errors until the deploy finishes (a few minutes). To avoid that, do steps 2–3 shortly before merging.
