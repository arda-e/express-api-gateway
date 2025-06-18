import { RedisManager } from "@utils/RedisManager";
import { Queue, JobsOptions, JobState, Job } from "bullmq";
import { EventType } from "@utils/queue/EventTypes";

import { IQueue } from "./IQueue";

export abstract class BaseQueue<T> implements IQueue<T> {
  protected queue: Queue;
  protected queueName: string;

  constructor(queueName: string, redisManager: RedisManager) {
    this.queueName = queueName;
    const redis = redisManager.getRedisClient();

    this.queue = new Queue<T>(this.queueName, {
      connection: redis as any, // BullMQ uses ioredis types which are not compatible with the RedisManager
    });
  }

  public async addJob(name: string, data: T, options: JobsOptions = {}): Promise<void> {
    await this.queue.add(name, data, options);
  }

  public async removeJob(id: string): Promise<void> {
    const job = await this.queue.getJob(id);
    if (job) await job.remove();
  }

  public async getJobStats(): Promise<Record<string, any>> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  public async getJobs(state: JobState | JobState[]): Promise<Job[]> {
    return this.queue.getJobs(state);
  }

  public async dispatchMany(events: { type: EventType; payload: any }[]): Promise<void> {
    const jobs = events.map((e) =>
      this.queue.add(e.type, e.payload, {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      }),
    );
    await Promise.all(jobs);
  }
}
