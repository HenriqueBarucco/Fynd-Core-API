import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'External identifier coming from upstream systems.',
  })
  @IsString()
  @IsNotEmpty()
  externalId!: string;

  @ApiProperty({ description: 'Human readable description of the group.' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
