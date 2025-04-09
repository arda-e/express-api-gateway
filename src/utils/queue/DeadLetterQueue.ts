import { RedisManager } from "@utils/RedisManager";
import { singleton } from "tsyringe";

import { BaseQueue } from "./BaseQueue";
import { DeadLetterData, IDeadLetterQueue } from "./IDeadLetterQueue";
import { DeadLetterType } from "./DeadLetterEventTypes";
import { EventQueue } from "./EventQueue";
import { EventPayloadMap, EventType } from "./EventTypes";

/**
 * Represents a dead letter queue for handling failed jobs.
 * Extends the BaseQueue class and implements the IDeadLetterQueue interface.
 */
@singleton()
export class DeadLetterQueue extends BaseQueue<DeadLetterData> implements IDeadLetterQueue {
  constructor(redisManager: RedisManager) {
    super("dead_letter", redisManager);
  }
  //? TODO: keep jobname or use DeadLetterType.FromEventQueue,
  public async pushFailedJob(jobName: string, data: any, reason: string, originalJobId?: string) {
    await this.addJob(DeadLetterType.FromEventQueue, {
      originalJobId,
      data,
      reason,
      failedAt: new Date().toISOString(),
    });
  }

  public async requeueJob(jobId: string, eventQueue: EventQueue) {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;

    const { originalJobId, data, reason, failedAt } = job.data;

    const type = job.name as EventType;
    const payload = data as EventPayloadMap[EventType];

    await eventQueue.addJob(type, {
      ...payload,
      meta: {
        requeuedAt: new Date().toISOString(),
        originalJobId,
        retryContext: {
          reason,
          failedAt,
        },
      },
    });

    await job.remove();
    return job;
  }
}
