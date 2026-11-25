// The GPS Swears It Was a Shortcut — make.fun entry
// Writes the GPS's own excuse for sending the driver down the wrong road
// to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
// Single line, plain text, within the 1-200 character gate.
// The GPS talks: smug, defensive, caught red-handed, blaming the map —
// a cul-de-sac, not the usual recalculating joke.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// Named parts of the excuse, assembled by buildEntry().
const SETUP =
  "I sent you down that cul-de-sac because the map swore it was a shortcut.";
const CONFESSION = "I believed it. You believed me.";
const PUNCH = "We were both wrong, but only one of us is a map.";

function buildEntry(): string {
  return [SETUP, CONFESSION, PUNCH].join(" ");
}

type GateReport = { chars: number; lines: number; sha256: string };

function validateEntry(text: string): GateReport {
  const chars = [...text].length;
  const lines = text.split("\n").length;
  if (chars < 1 || chars > 200) throw new Error(`gate failed: ${chars} characters`);
  if (lines !== 1) throw new Error(`gate failed: ${lines} lines`);
  if (!text.trim()) throw new Error("gate failed: blank entry");
  return { chars, lines, sha256: createHash("sha256").update(text, "utf8").digest("hex") };
}

function verifyWritten(path: string, expected: string): string {
  const back = readFileSync(path, "utf8").trimEnd();
  if (back !== expected) throw new Error("read-back mismatch");
  return createHash("sha256").update(back, "utf8").digest("hex");
}

const ENTRY = buildEntry();
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY + "\n", "utf8");

const report = validateEntry(ENTRY);
const fileSha = verifyWritten(outPath, ENTRY);
console.log(
  `gate passes: ${report.chars} code points, ${report.lines} line, sha256 ${report.sha256}`,
);
console.log(`wrote ${outPath}`);
console.log(`verified: ${JSON.stringify(ENTRY)} (read-back sha256 ${fileSha})`);
