import "reflect-metadata";

import { container } from "tsyringe";
import { RedisManager } from "@utils/RedisManager";

import { EventQueue } from "../EventQueue";
import { DeadLetterQueue } from "../DeadLetterQueue";
import { EventType } from "../EventTypes";

describe("Queue E2E", () => {
  let eventQueue: EventQueue;
  let dlq: DeadLetterQueue;
  let redisManager: RedisManager;

  beforeAll(async () => {
    redisManager = container.resolve(RedisManager);
    await redisManager.initialize();
    eventQueue = container.resolve(EventQueue);
    dlq = container.resolve(DeadLetterQueue);
  });

  it("adds a job to EventQueue and verifies Redis connection", async () => {
    await eventQueue.addEvent(EventType.UserRegistered, {
      userId: "test-user",
      email: "fail@simulate.com",
    });

    const jobs = await eventQueue.getJobs(["waiting", "active"]);
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].name).toBe(EventType.UserRegistered);
  });

  it("moves failed job to DeadLetterQueue and requeues it", async () => {
    // simulate failure by creating job and manually moving to DLQ
    const fakeJobData = {
      email: "fail@simulate.com",
      userId: "fail-user",
    };

    await dlq.pushFailedJob(EventType.UserRegistered, fakeJobData, "Simulated Error", "dlq-id-1");

    const dlqJobs = await dlq.getJobs(["waiting", "active"]);
    expect(dlqJobs.length).toBeGreaterThan(0);
    const dlqJob = dlqJobs[0];
    if (!dlqJob.id) {
      throw new Error("DLQ job ID is undefined");
    }
    const requeued = await dlq.requeueJob(dlqJob.id, eventQueue);
    expect(requeued).toBeTruthy();

    const jobsAfterRequeue = await eventQueue.getJobs(["waiting", "active"]);
    expect(jobsAfterRequeue.some((j) => j.data.meta?.originalJobId === "dlq-id-1")).toBe(true);
  });
});
