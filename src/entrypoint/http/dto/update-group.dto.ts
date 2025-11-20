import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGroupDto {
  @ApiPropertyOptional({ description: 'External identifier override.' })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiPropertyOptional({ description: 'Updated group description.' })
  @IsString()
  @IsOptional()
  description?: string;
}
