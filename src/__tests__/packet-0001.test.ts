import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const p = (...parts: string[]) => path.join(repoRoot, ...parts);

describe("packet-0001: scaffolding + shared UI patterns (sanity)", () => {
  it("required files exist", () => {
    const files = [
      "src/app/layout.tsx",
      "src/app/page.tsx",
      "src/app/app/page.tsx",
      "src/components/ErrorState.tsx",
      "src/components/EmptyState.tsx",
      "src/components/FormField.tsx",
      "src/components/LoadingState.tsx",
      "src/lib/validation.ts",
      "src/components/Nav.tsx",
    ];

    for (const f of files) {
      expect(fs.existsSync(p(f))).toBe(true);
    }
  });

  it("layout includes nav placeholder and logged-in/out placeholder", () => {
    const layoutPath = p("src/app/layout.tsx");
    expect(fs.existsSync(layoutPath)).toBe(true);

    const src = fs.readFileSync(layoutPath, "utf8");

    // nav items
    expect(src).toMatch(/Home/);
    expect(src).toMatch(/Train/);
    expect(src).toMatch(/Generate/);
    expect(src).toMatch(/History/);

    // some logged-in/logged-out placeholder wording (flexible)
    expect(src).toMatch(/log(ged)?\s*-?in|signed\s*-?in|auth/i);
    expect(src).toMatch(/log(ged)?\s*-?out|signed\s*-?out|guest/i);
  });

  it("Nav renders expected link labels (sanity)", () => {
    const navPath = p("src/components/Nav.tsx");
    expect(fs.existsSync(navPath)).toBe(true);

    const src = fs.readFileSync(navPath, "utf8");
    expect(src).toMatch(/Home/);
    expect(src).toMatch(/Train/);
    expect(src).toMatch(/Generate/);
    expect(src).toMatch(/History/);
  });

  it("shared components include required state semantics (sanity)", () => {
    const errorPath = p("src/components/ErrorState.tsx");
    const emptyPath = p("src/components/EmptyState.tsx");
    const loadingPath = p("src/components/LoadingState.tsx");

    expect(fs.existsSync(errorPath)).toBe(true);
    expect(fs.existsSync(emptyPath)).toBe(true);
    expect(fs.existsSync(loadingPath)).toBe(true);

    const errorSrc = fs.readFileSync(errorPath, "utf8");
    const emptySrc = fs.readFileSync(emptyPath, "utf8");
    const loadingSrc = fs.readFileSync(loadingPath, "utf8");

    // Error: banner-ish + retry button
    expect(errorSrc).toMatch(/Retry/i);
    expect(errorSrc).toMatch(/error/i);

    // Empty: icon + heading + CTA link
    expect(emptySrc).toMatch(/empty/i);
    expect(emptySrc).toMatch(/href=|<Link/i);

    // Loading: skeleton-ish
    expect(loadingSrc).toMatch(/skeleton|animate|pulse|loading/i);
  });

  it("FormField includes label + inline error rendering (sanity)", () => {
    const ffPath = p("src/components/FormField.tsx");
    expect(fs.existsSync(ffPath)).toBe(true);

    const src = fs.readFileSync(ffPath, "utf8");
    expect(src).toMatch(/label/i);
    expect(src).toMatch(/children/i);
    expect(src).toMatch(/error/i);
  });

  it("placeholder protected route exists and renders a stub (no auth yet)", () => {
    const protectedPath = p("src/app/app/page.tsx");
    expect(fs.existsSync(protectedPath)).toBe(true);

    const src = fs.readFileSync(protectedPath, "utf8");
    // Accept any explicit stub language indicating it will be guarded later
    expect(src).toMatch(/protected|guard|auth|stub|placeholder/i);
  });
});
