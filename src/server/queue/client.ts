export type QueueJob = { runId: string };

const queue: QueueJob[] = [];

export const queueClient = {
  add(job: QueueJob) {
    queue.push(job);
  },
  shift(): QueueJob | undefined {
    return queue.shift();
  }
};
