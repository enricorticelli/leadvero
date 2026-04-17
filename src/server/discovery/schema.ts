import { z } from "zod";

export const DiscoveryPlatformSchema = z.enum(["wordpress", "shopify", "both"]);

export const DiscoveryRunInputSchema = z.object({
  keyword: z.string().min(1),
  country: z.string().min(1),
  city: z.string().optional(),
  language: z.string().optional(),
  platform: DiscoveryPlatformSchema
});

export type DiscoveryRunInput = z.infer<typeof DiscoveryRunInputSchema>;
