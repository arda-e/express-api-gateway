import { DeadLetterQueue } from "@utils/queue/DeadLetterQueue";
import { EventQueue } from "@utils/queue/EventQueue";
import { inject, injectable } from "tsyringe";
import { JobState } from "bullmq";

const DEFAULT_JOB_STATES: JobState[] = ["waiting", "active", "failed"];

@injectable()
export class QueueService {
  //? TODO: lazy init or register at startup choose
  constructor(
    @inject(EventQueue) private readonly eventQueue: EventQueue,
    @inject(DeadLetterQueue) private readonly deadLetterQueue: DeadLetterQueue,
  ) {}

  public async getAllItemsInQueue(queueName: "events" | "dead_letter"): Promise<any> {
    const queue = queueName === "events" ? this.eventQueue : this.deadLetterQueue;

    return await queue.getJobs(DEFAULT_JOB_STATES);
  }

  public async requeueFromDeadLetter(jobId: string): Promise<boolean> {
    const job = await this.deadLetterQueue.requeueJob(jobId, this.eventQueue);
    return job !== null;
  }
}

export default QueueService;
