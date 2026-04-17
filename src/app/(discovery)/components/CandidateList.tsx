import React from "react";

type Candidate = { domain: string; platform: string; score: number };

export function CandidateList({ candidates }: { candidates: Candidate[] }) {
  if (!candidates.length) return <p>No candidates yet</p>;
  return (
    <ul>
      {candidates.map((candidate) => (
        <li key={`${candidate.domain}-${candidate.platform}`}>
          {candidate.domain} ({candidate.platform}) - {candidate.score}
        </li>
      ))}
    </ul>
  );
}
