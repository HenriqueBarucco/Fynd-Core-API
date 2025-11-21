import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchUsersByTasteQueryDto {
  @ApiProperty({ description: 'Taste label used as the search seed.' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({
    description: 'Minimum similarity score between 0 and 1.',
    minimum: 0,
    maximum: 1,
    default: 0.1,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : Number(value),
  )
  @IsNumber()
  @Min(0)
  @Max(1)
  scoreThreshold?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of unique users to return.',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
