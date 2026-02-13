import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const p = (...parts: string[]) => path.join(repoRoot, ...parts);

describe("packet-0002: prisma schema + ORM setup (sanity)", () => {
  it("required files exist", () => {
    const files = [
      "src/lib/db.ts",
      "src/prisma/schema.prisma",
      "src/lib/db/queries.ts",
    ];

    for (const f of files) {
      expect(fs.existsSync(p(f))).toBe(true);
    }
  });

  it("schema.prisma defines user, tone_profile (userId unique), and drafts with timestamps", () => {
    const schemaPath = p("src/prisma/schema.prisma");
    expect(fs.existsSync(schemaPath)).toBe(true);

    const schema = fs.readFileSync(schemaPath, "utf8");

    // models exist
    expect(schema).toMatch(/model\s+User\b/);
    expect(schema).toMatch(/model\s+ToneProfile\b|model\s+tone_profiles\b|model\s+Tone_Profile\b/);
    expect(schema).toMatch(/model\s+Draft\b|model\s+drafts\b/);

    // tone_profile userId unique constraint (DB-enforced)
    expect(schema).toMatch(/userId\s+\w+/);
    expect(schema).toMatch(/@unique\b[^\n]*\buserId\b|userId[^\n]*@unique/);

    // drafts timestamps
    expect(schema).toMatch(/createdAt\b/);
    expect(schema).toMatch(/updatedAt\b/);

    // drafts text fields
    expect(schema).toMatch(/generatedText\b/);
    expect(schema).toMatch(/editedText\b/);

    // updatedAt should be auto-updated in prisma
    expect(schema).toMatch(/updatedAt[^\n]*@updatedAt/);
  });

  it("db client module exports/initializes PrismaClient (sanity)", () => {
    const dbPath = p("src/lib/db.ts");
    expect(fs.existsSync(dbPath)).toBe(true);

    const src = fs.readFileSync(dbPath, "utf8");
    expect(src).toMatch(/PrismaClient/);
    // either direct export or singleton pattern
    expect(src).toMatch(/export\s+(const|default)\s+\w+|module\.exports/);
  });

  it("query helpers require userId and filter by it (static sanity checks)", () => {
    const qPath = p("src/lib/db/queries.ts");
    expect(fs.existsSync(qPath)).toBe(true);

    const src = fs.readFileSync(qPath, "utf8");

    // ensure userId is part of public helper signatures somewhere
    expect(src).toMatch(/userId\s*:\s*string|userId\s*:\s*\w+/);

    // ensure queries include where: { userId: ... } patterns
    expect(src).toMatch(/where\s*:\s*\{[^\}]*userId\s*:\s*/s);

    // ensure tone profile access is user-scoped somewhere
    expect(src).toMatch(/ToneProfile|toneProfile|tone_profile/);
    expect(src).toMatch(/userId/);

    // ensure drafts access is user-scoped somewhere
    expect(src).toMatch(/Draft|draft/);
    expect(src).toMatch(/userId/);
  });
});
