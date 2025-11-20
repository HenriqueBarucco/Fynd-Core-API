import { ApiProperty } from '@nestjs/swagger';
import { User } from '@domain/users/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ description: 'User identifier (UUID v8).', format: 'uuid' })
  public readonly id: string;

  @ApiProperty({ description: 'Current user name.' })
  public readonly name: string;

  @ApiProperty({ description: 'User phone number.' })
  public readonly phone: string;

  @ApiProperty({ description: 'Creation timestamp in ISO 8601.' })
  public readonly createdAt: string;

  @ApiProperty({ description: 'Last update timestamp in ISO 8601.' })
  public readonly updatedAt: string;

  constructor(
    id: string,
    name: string,
    phone: string,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto(
      user.id,
      user.name,
      user.phone,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
    );
  }
}
