// file: src/utils/dtos/pagination.dto.ts
import { IsInt, Min, IsOptional } from 'class-validator';

export class PaginationDTO {
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
