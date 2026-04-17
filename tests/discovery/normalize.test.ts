import { describe, expect, it } from "vitest";
import { dedupe, normalizeUrl } from "@/server/discovery/normalize";

describe("normalizeUrl", () => {
  it("extracts eTLD+1 and strips www", () => {
    expect(normalizeUrl("https://www.Example.IT/about")).toMatchObject({
      normalizedDomain: "example.it",
      domain: "example.it",
    });
  });

  it("keeps subdomain in domain but normalizes to registrable", () => {
    const r = normalizeUrl("https://shop.example.com/products");
    expect(r).toMatchObject({
      normalizedDomain: "example.com",
      domain: "shop.example.com",
    });
  });

  it("rejects non-http protocols", () => {
    expect(normalizeUrl("mailto:foo@bar.com")).toBeNull();
    expect(normalizeUrl("ftp://example.com")).toBeNull();
  });

  it("rejects IP hosts", () => {
    expect(normalizeUrl("http://192.168.1.1/")).toBeNull();
  });

  it("rejects blocked hosts (social, marketplaces, directories)", () => {
    expect(normalizeUrl("https://www.facebook.com/somepage")).toBeNull();
    expect(normalizeUrl("https://www.amazon.it/dp/123")).toBeNull();
    expect(normalizeUrl("https://www.paginegialle.it/foo")).toBeNull();
  });

  it("rejects hosted-platform subdomains", () => {
    expect(
      normalizeUrl("https://store-name.myshopify.com/products/x"),
    ).toBeNull();
    expect(normalizeUrl("https://blog.wordpress.com/")).toBeNull();
  });

  it("rejects malformed URLs", () => {
    expect(normalizeUrl("")).toBeNull();
    expect(normalizeUrl("not-a-url")).toBeNull();
  });
});

describe("dedupe", () => {
  it("removes duplicates by normalizedDomain", () => {
    const input = [
      { normalizedDomain: "a.it", domain: "a.it", sourceUrl: "https://a.it" },
      {
        normalizedDomain: "a.it",
        domain: "www.a.it",
        sourceUrl: "https://www.a.it/x",
      },
      { normalizedDomain: "b.it", domain: "b.it", sourceUrl: "https://b.it" },
    ];
    const out = dedupe(input);
    expect(out).toHaveLength(2);
    expect(out.map((c) => c.normalizedDomain)).toEqual(["a.it", "b.it"]);
  });

  it("respects existing set", () => {
    const input = [
      { normalizedDomain: "a.it", domain: "a.it", sourceUrl: "https://a.it" },
      { normalizedDomain: "b.it", domain: "b.it", sourceUrl: "https://b.it" },
    ];
    const out = dedupe(input, new Set(["a.it"]));
    expect(out.map((c) => c.normalizedDomain)).toEqual(["b.it"]);
  });
});
