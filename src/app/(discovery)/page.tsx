"use client";

import React, { useState } from "react";
import { CandidateList } from "./components/CandidateList";
import { DiscoveryCriteriaForm } from "./components/DiscoveryCriteriaForm";
import { RunStatusPanel } from "./components/RunStatusPanel";

export default function DiscoveryPage() {
  const [run, setRun] = useState<{ id: string; status: string; discovered: number; stoppedAt?: string } | null>(null);
  const [candidates, setCandidates] = useState<{ domain: string; platform: string; score: number }[]>([]);

  async function handleStart(payload: Record<string, unknown>) {
    const response = await fetch("/api/discovery-runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setRun({ id: data.id, status: data.status, discovered: 0 });

    const events = new EventSource(`/api/discovery-runs/${data.id}/events`);
    events.onmessage = (evt) => {
      const next = JSON.parse(evt.data);
      setRun({ id: next.id, status: next.status, discovered: next.discovered, stoppedAt: next.stoppedAt });
      if (next.candidates) setCandidates(next.candidates);
      if (next.status === "completed" || next.status === "aborted") events.close();
    };
  }

  async function handleStop() {
    if (!run) return;
    await fetch(`/api/discovery-runs/${run.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "stop" })
    });
    setRun({ ...run, status: "aborted", stoppedAt: new Date().toISOString() });
  }

  return (
    <main>
      <h1>Lead Discovery</h1>
      <DiscoveryCriteriaForm onSubmit={handleStart} />
      <RunStatusPanel run={run} onStop={handleStop} />
      <CandidateList candidates={candidates} />
    </main>
  );
}
