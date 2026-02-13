import { describe, it, expect, vi } from "vitest";

function flattenChildren(node: any): any[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenChildren);
  if (typeof node !== "object") return [];

  const children = node?.props?.children;
  return [node, ...flattenChildren(children)];
}

function findAllByType(tree: any, type: any) {
  return flattenChildren(tree).filter((n) => n && typeof n === "object" && n.type === type);
}

function findAllLinks(tree: any) {
  // next/link typically renders to an element with props.href at the React element level.
  return flattenChildren(tree).filter((n) => n && typeof n === "object" && n.props && "href" in n.props);
}

// ---------- Home page CTA routing ----------
describe("Packet 0008 - Home page CTA gating", () => {
  it("routes primary CTA to /login when logged out", async () => {
    vi.resetModules();

    vi.mock("@/lib/auth", () => ({
      getSession: vi.fn(async () => null),
    }));

    const Page = (await import("@/app/page")).default;

    const tree = await (Page as any)();
    const links = findAllLinks(tree);

    expect(links.some((l) => l.props.href === "/login")).toBe(true);
  });

  it("routes primary CTA to /train when logged in but not trained", async () => {
    vi.resetModules();

    vi.mock("@/lib/auth", () => ({
      getSession: vi.fn(async () => ({ user: { id: "u1" }, trained: false })),
    }));

    const Page = (await import("@/app/page")).default;

    const tree = await (Page as any)();
    const links = findAllLinks(tree);

    expect(links.some((l) => l.props.href === "/train")).toBe(true);
  });

  it("routes primary CTA to /generate when logged in and trained", async () => {
    vi.resetModules();

    vi.mock("@/lib/auth", () => ({
      getSession: vi.fn(async () => ({ user: { id: "u1" }, trained: true })),
    }));

    const Page = (await import("@/app/page")).default;

    const tree = await (Page as any)();
    const links = findAllLinks(tree);

    expect(links.some((l) => l.props.href === "/generate")).toBe(true);
  });
});

// ---------- Nav integration ----------
describe("Packet 0008 - Nav session state + protected navigation", () => {
  it("shows Login/Signup when logged out", async () => {
    vi.resetModules();

    vi.mock("next/navigation", () => ({
      usePathname: vi.fn(() => "/"),
      redirect: vi.fn(),
    }));

    vi.mock("@/lib/auth", () => ({
      useClientSession: vi.fn(() => ({ status: "unauthenticated", data: null })),
    }));

    const Nav = (await import("@/components/Nav")).default;

    const tree = (Nav as any)();
    const links = findAllLinks(tree);

    expect(links.some((l) => l.props.href === "/login")).toBe(true);
    expect(links.some((l) => l.props.href === "/signup")).toBe(true);
  });

  it("after logout action, session ends and subsequent protected page redirects to /login", async () => {
    vi.resetModules();

    const redirect = vi.fn();

    vi.mock("next/navigation", () => ({
      usePathname: vi.fn(() => "/generate"),
      redirect,
    }));

    // Nav uses a client session hook; protected pages typically use server session.
    vi.mock("@/lib/auth", () => ({
      useClientSession: vi.fn(() => ({ status: "authenticated", data: { user: { id: "u1" }, trained: true } })),
      logout: vi.fn(async () => undefined),
      getSession: vi.fn(async () => null), // after logout, server session is gone
    }));

    const GeneratePage = (await import("@/app/generate/page")).default;

    await (GeneratePage as any)();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});

// ---------- Login/Signup cross-links ----------
describe("Packet 0008 - Login/Signup cross-links", () => {
  it("Login page includes link to /signup", async () => {
    vi.resetModules();

    const Page = (await import("@/app/login/page")).default;
    const tree = await (Page as any)();

    const links = findAllLinks(tree);
    expect(links.some((l) => l.props.href === "/signup")).toBe(true);
  });

  it("Signup page includes link to /login", async () => {
    vi.resetModules();

    const Page = (await import("@/app/signup/page")).default;
    const tree = await (Page as any)();

    const links = findAllLinks(tree);
    expect(links.some((l) => l.props.href === "/login")).toBe(true);
  });
});
