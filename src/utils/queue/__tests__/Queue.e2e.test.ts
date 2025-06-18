import "reflect-metadata";

// Mock RedisManager to avoid real Redis connections during tests
jest.mock("@utils/RedisManager", () => {
  class MockRedisManager {
    public async initialize() {}
    public getRedisClient() {
      return {};
    }
    public async close() {}
  }
  return { RedisManager: MockRedisManager };
});

// Lightweight in-memory stub for bullmq used by the queues
jest.mock("bullmq", () => {
  let id = 0;
  return {
    Queue: jest.fn().mockImplementation(() => {
      const jobs: any[] = [];
      return {
        add: jest.fn(async (name: string, data: any) => {
          const job = {
            id: String(++id),
            name,
            data,
            remove: async () => {
              const idx = jobs.findIndex((j) => j.id === job.id);
              if (idx !== -1) jobs.splice(idx, 1);
            },
          };
          jobs.push(job);
          return job;
        }),
        getJob: jest.fn(async (jobId: string) => jobs.find((j) => j.id === jobId) || null),
        getJobs: jest.fn(async () => [...jobs]),
        getWaitingCount: jest.fn(async () => jobs.length),
        getActiveCount: jest.fn(async () => 0),
        getCompletedCount: jest.fn(async () => 0),
        getFailedCount: jest.fn(async () => 0),
        getDelayedCount: jest.fn(async () => 0),
      };
    }),
    Worker: jest.fn(),
    Job: jest.fn(),
  };
});

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
    // Instances resolved here use the mocked RedisManager and bullmq
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
