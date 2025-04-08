import { Queue } from "bullmq";

import { IEventQueue } from "./IEventQueue";
import { EventType } from "./EventTypes";

export class EventQueue implements IEventQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("event-queue", {
      connection: {
        host: "redis", //TODO: Get the host from the RedisManager
        port: 6379,
      },
    });
  }

  async addEvent<T = unknown>(type: EventType, data: T) {
    await this.queue.add(type, data);
  }

  async processEvent(event: any) {}
  async getJobStats(): Promise<any> {
    return this.queue.getJobCounts();
  }
  async removeJob(id: string): Promise<any> {
    return this.queue.remove(id);
  }
  async getJob(id: string): Promise<any> {
    return this.queue.getJob(id);
  }
}
