import { scoreFit, type FitInput } from "./fit";
import { scoreOpportunity, type OpportunityInput } from "./opportunity";
import { scoreCommercial, type CommercialInput } from "./commercial";
import { scoreContactability } from "./contactability";
import { SCORE_WEIGHTS as W } from "./config";
import type { ContactSignals } from "../crawl/detect/contact";

export interface ScoreInput {
  fit: FitInput;
  opportunity: OpportunityInput;
  commercial: CommercialInput;
  contact: ContactSignals;
}

export interface ScoreOutput {
  fitScore: number;
  opportunityScore: number;
  commercialScore: number;
  contactabilityScore: number;
  totalScore: number;
  scoreReasons: string[];
}

export function score(input: ScoreInput): ScoreOutput {
  const fit = scoreFit(input.fit);
  const opp = scoreOpportunity(input.opportunity);
  const comm = scoreCommercial(input.commercial);
  const cont = scoreContactability(input.contact);

  const total = Math.round(
    fit.score * W.fit +
    opp.score * W.opportunity +
    comm.score * W.commercial +
    cont.score * W.contactability,
  );

  const allReasons = [
    ...opp.reasons,
    ...fit.reasons,
    ...cont.reasons,
    ...comm.reasons,
  ];

  return {
    fitScore: fit.score,
    opportunityScore: opp.score,
    commercialScore: comm.score,
    contactabilityScore: cont.score,
    totalScore: Math.min(100, total),
    scoreReasons: allReasons.slice(0, 3),
  };
}
