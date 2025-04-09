import { JobsOptions } from "bullmq";

export interface IQueue<T> {
  /**
   * Adds an event to the event queue.
   *
   * @param type - The type of the event being added.
   * @param data - The data associated with the event.
   * @returns A promise that resolves when the event has been added to the queue.
   */
  addJob(name: string, data: T, options: JobsOptions): Promise<void>;
  /**
   * Retrieves statistics about the jobs in the event queue.
   *
   * @returns A promise that resolves with the job statistics.
   */
  getJobStats(): Promise<Record<string, any>>;
  /**
   * Removes a job from the event queue.
   *
   * @param id - The ID of the job to be removed.
   * @returns A promise that resolves when the job has been removed from the queue.
   */
  removeJob(id: string): Promise<void>;
}

//  /**
//   * Processes an event from the event queue.
//   *
//   * @param type - The type of the event being processed.
//   * @param data - The data associated with the event.
//   * @returns A promise that resolves when the event has been processed.
//   */
//   processEvent<T = unknown>(type: EventType, data: T): Promise<void>
