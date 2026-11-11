import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import type { RawSeedRow } from "./normalize";

export interface SeasonFile {
  season: number;
  path: string;
}

const SEASON_FILE = /^(\d{4})-atp-season\.csv$/;

/** Season files in `dir`, oldest first. Pass `season` to pick one. */
export function listSeasonFiles(dir: string, season?: number): SeasonFile[] {
  return fs
    .readdirSync(dir)
    .map((name) => ({ name, match: SEASON_FILE.exec(name) }))
    .filter((entry): entry is { name: string; match: RegExpExecArray } => entry.match !== null)
    .map(({ name, match }) => ({ season: Number(match[1]), path: path.join(dir, name) }))
    .filter((file) => season === undefined || file.season === season)
    .sort((a, b) => a.season - b.season);
}

export function readSeasonFile(filePath: string): RawSeedRow[] {
  return parse(fs.readFileSync(filePath), { columns: true, skip_empty_lines: true, bom: true });
}
