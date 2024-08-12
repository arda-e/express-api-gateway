import { ApiResponse } from './ApiResponse';
import BaseModel from '../Model';

export type SuccessResponse<T> = ApiResponse<T> & { status: 'success' };
export type ErrorResponse = ApiResponse<null> & { status: 'error' };
export type ResourceResponse<T extends BaseModel> = SuccessResponse<T>;
export type ListResponse<T extends BaseModel> = SuccessResponse<T[]>;
export type DeleteResponse = SuccessResponse<{ deleted: boolean }>;
export type UpdateResponse<T extends BaseModel> = ResourceResponse<T>;
