import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AddUserTasteDto {
  @ApiProperty({
    description:
      'Short description of the taste/preference to associate with the user',
    example: 'retro gaming coupons',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  taste!: string;
}
