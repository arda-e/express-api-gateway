import "reflect-metadata";
import { Worker, Job } from "bullmq";
import { MailService } from "@utils/MailService";
import { container } from "tsyringe";
import { RedisManager } from "@utils/RedisManager";

import {
  EventPayloadMap,
  EventType,
  PermissionUpdatedPayload,
  UserRegisteredPayload,
} from "./EventTypes";
import { DeadLetterQueue } from "./DeadLetterQueue";

const redisManager = container.resolve(RedisManager);
(async () => await redisManager.initialize())();

const mailService = container.resolve(MailService);

const handlers: {
  [K in EventType]: (job: Job<EventPayloadMap[K], any, K>) => Promise<void>;
} = {
  [EventType.UserRegistered]: async (job: Job<UserRegisteredPayload, any, EventType>) => {
    const { email } = job.data;
    await mailService.sendWelcomeEmail(email);
  },
  [EventType.PermissionUpdated]: async (job: Job<PermissionUpdatedPayload, any, EventType>) => {
    const { userId, permissionId, changedBy } = job.data;
    // TODO: Implement permission updated email
    // await mailService.sendPermissionUpdatedEmail(userId, permissionId, changedBy);
  },
};

const worker = new Worker(
  "events",
  async (job: Job<UserRegisteredPayload, any, EventType.UserRegistered>) => {
    const eventType = job.name;
    if (eventType in handlers) {
      await handlers[eventType](job);
    }
  },
  {
    connection: redisManager.getRedisClient() as any,
  },
);

const deadLetterQueue = container.resolve(DeadLetterQueue);

worker.on("failed", async (job, err) => {
  //? TODO: Could unknown failures moved to a separate log file or pushed to a system_error queue.
  if (!job) return;

  const maxAttempts = job.opts.attempts || 1;

  if (job.attemptsMade >= maxAttempts) {
    console.warn(`💀 Moving job [${job.name}] to DLQ`);

    await deadLetterQueue.pushFailedJob(job.name, job.data, err.message, job.id);
  } else {
    console.warn(
      `Job [${job.name}] failed but will retry (attempt ${job.attemptsMade + 1}/${maxAttempts})`,
    );
  }
});
