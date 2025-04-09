export interface IDeadLetterQueue {
  /**
   * Pushes a failed job to the dead letter queue.
   *
   * @param jobName - The name of the job that failed.
   * @param data - The data associated with the failed job.
   * @param reason - The reason why the job failed.
   * @param originalJobId - The ID of the original job, if available.
   * @returns A promise that resolves when the job has been pushed to the dead letter queue.
   */
  pushFailedJob(
    jobName: string,
    data: unknown,
    reason: string,
    originalJobId?: string,
  ): Promise<void>;
}

export interface DeadLetterData {
  originalJobId?: string;
  data: any;
  reason: string;
  failedAt: string;
}
