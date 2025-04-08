import { EventType } from "./EventTypes";

export interface IEventQueue {
  addEvent<T = unknown>(type: EventType, data: T): Promise<void>;
  processEvent<T = unknown>(type: EventType, data: T): Promise<void>;
  getJobStats(): Promise<any>;
  removeJob(id: string): Promise<any>;
}
