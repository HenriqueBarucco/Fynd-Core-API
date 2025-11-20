import { User } from '@domain/entities/user.entity';

export class UserResponseDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto(
      user.id,
      user.name,
      user.email,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
    );
  }
}
