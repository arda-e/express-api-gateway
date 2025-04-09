import { Request, Response, NextFunction } from "express";
import { inject, singleton } from "tsyringe";
import { ApiResponse } from "@utils/Response";
import { Route } from "@utils/decorators";

import QueueService from "./queue.service";

@singleton()
export class QueueController {
  constructor(@inject(QueueService) private readonly queueService: QueueService) {}

  @Route()
  public async getAllItemsInQueue(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<ApiResponse<null>> {
    const items = await this.queueService.getAllItemsInQueue("events");
    return ApiResponse.success(items, "Items retrieved successfully");
  }

  @Route()
  public async requeueFromDLQ(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<ApiResponse<null>> {
    const { jobId } = req.body;
    await this.queueService.requeueFromDeadLetter(jobId);
    return ApiResponse.success(null, "Job requeued successfully");
  }
}

export default QueueController;
