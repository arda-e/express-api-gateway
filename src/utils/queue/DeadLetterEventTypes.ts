import { EventType, EventPayloadMap } from "./EventTypes";

export interface DeadLetterPayload {
  originalJobId?: string;
  data: EventPayloadMap[EventType];
  reason: string;
  failedAt: string;
}

// FUTURE: DLQ for multiple queues in the future:
export enum DeadLetterType {
  FromEventQueue = "FromEventQueue",
}

export type DeadLetterPayloadMap = {
  [DeadLetterType.FromEventQueue]: DeadLetterPayload;
};
