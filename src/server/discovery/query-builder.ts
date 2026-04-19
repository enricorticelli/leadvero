type TargetPlatform = "shopify" | "wordpress" | "both" | "any";

export interface QueryInput {
  keyword?: string | null;
  niche?: string | null;
  city?: string | null;
  country: string;
  language: string;
  targetPlatform: TargetPlatform;
  businessType?: string | null;
}

export interface BuiltQuery {
  q: string;
  intent: "shopify" | "wordpress" | "generic";
}

function base(input: QueryInput): string {
  const parts = [input.keyword, input.niche, input.city]
    .filter((p): p is string => Boolean(p && p.trim()))
    .map((p) => p.trim());
  return parts.join(" ");
}

export function buildQueries(input: QueryInput): BuiltQuery[] {
  const core = base(input);
  if (!core) return [];

  const queries: BuiltQuery[] = [];

  const wantsShopify =
    input.targetPlatform === "shopify" ||
    input.targetPlatform === "both" ||
    input.targetPlatform === "any";
  const wantsWordpress =
    input.targetPlatform === "wordpress" ||
    input.targetPlatform === "both" ||
    input.targetPlatform === "any";
  const wantsGeneric = input.targetPlatform === "any";

  if (wantsShopify) {
    queries.push({ q: `${core} "powered by shopify"`, intent: "shopify" });
    queries.push({ q: `${core} inurl:/collections/`, intent: "shopify" });
  }

  if (wantsWordpress) {
    queries.push({ q: `${core} "powered by wordpress"`, intent: "wordpress" });
    queries.push({ q: `${core} inurl:/wp-content/`, intent: "wordpress" });
  }

  if (wantsGeneric || (!wantsShopify && !wantsWordpress)) {
    queries.push({ q: core, intent: "generic" });
  }

  return queries;
}
