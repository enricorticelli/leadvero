import React from "react";

type RunStatus = { id: string; status: string; discovered: number; stoppedAt?: string };

type Props = {
  run: RunStatus | null;
  onStop: () => Promise<void> | void;
};

export function RunStatusPanel({ run, onStop }: Props) {
  if (!run) return <p>No active run</p>;
  return (
    <section>
      <p>Status: {run.status}</p>
      <p>discovered: {run.discovered}</p>
      {run.stoppedAt ? <p>stoppedAt: {run.stoppedAt}</p> : null}
      {run.status !== "aborted" && run.status !== "completed" ? (
        <button onClick={() => onStop()}>Stop discovery run</button>
      ) : (
        <p>{run.status === "aborted" ? "aborted" : "completed"}</p>
      )}
    </section>
  );
}
