import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Human readable name for the user.' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Primary phone number for the user.' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
