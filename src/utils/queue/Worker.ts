import "reflect-metadata";
import { Worker, Job } from "bullmq";
import { MailService } from "@utils/MailService";
import { container } from "tsyringe";
import { RedisManager } from "@utils/RedisManager";

import { EventType } from "./EventTypes";

const redisManager = container.resolve(RedisManager);
(async () => await redisManager.initialize())();

const mailService = container.resolve(MailService);

const handleEvent = async (job: Job<any, any, EventType>) => {
  switch (job.name as EventType) {
    case EventType.UserRegistered:
      const { email } = job.data;
      await mailService.sendWelcomeEmail(email);
      break;
  }
};

const worker = new Worker("events", handleEvent, {
  connection: redisManager.getRedisClient() as any,
});
