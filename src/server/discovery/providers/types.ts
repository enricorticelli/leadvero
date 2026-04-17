import type { CandidateInput, DiscoveryRunInput } from "../types";

export interface Provider {
  name: string;
  fetch(criteria: DiscoveryRunInput): Promise<CandidateInput[]>;
}
