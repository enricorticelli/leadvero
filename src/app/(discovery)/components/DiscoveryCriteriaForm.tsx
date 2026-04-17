import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DiscoveryRunInputSchema } from "../../../server/discovery/schema";
import type { DiscoveryRunInput } from "../../../server/discovery/types";

type Props = { onSubmit: (payload: DiscoveryRunInput) => Promise<void> | void };

export function DiscoveryCriteriaForm({ onSubmit }: Props) {
  const { register, handleSubmit } = useForm<DiscoveryRunInput>({
    resolver: zodResolver(DiscoveryRunInputSchema),
    defaultValues: { keyword: "", country: "", city: "", language: "", platform: "both" }
  });

  return (
    <form onSubmit={handleSubmit(async (data) => onSubmit(data))}>
      <input aria-label="keyword" placeholder="Keyword" {...register("keyword")} />
      <input aria-label="country" placeholder="Country" {...register("country")} />
      <input aria-label="city" placeholder="City (optional)" {...register("city")} />
      <input aria-label="language" placeholder="Language (optional)" {...register("language")} />
      <select aria-label="platform" {...register("platform")}>
        <option value="wordpress">WordPress</option>
        <option value="shopify">Shopify</option>
        <option value="both">Both</option>
      </select>
      <button type="submit">Start Discovery Run</button>
    </form>
  );
}
