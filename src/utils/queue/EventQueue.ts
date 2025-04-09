import { singleton } from "tsyringe";
import { RedisManager } from "@utils/RedisManager";

import { BaseQueue } from "./BaseQueue";
import { EventPayloadMap, EventType } from "./EventTypes";

@singleton()
export class EventQueue extends BaseQueue<EventPayloadMap[EventType]> {
  constructor(redisManager: RedisManager) {
    super("events", redisManager);
  }

  public async addEvent<K extends EventType>(type: K, payload: EventPayloadMap[K]) {
    return this.addJob(type, payload, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });
  }
}
