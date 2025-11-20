import { ApiProperty } from '@nestjs/swagger';
import type { UserTaste } from '@domain/users/entities/user-taste.entity';

export class UserTasteResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ description: 'Embedding model used to vectorize this taste' })
  embeddingModel!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  static fromEntity(taste: UserTaste): UserTasteResponseDto {
    const dto = new UserTasteResponseDto();
    dto.id = taste.id;
    dto.userId = taste.userId;
    dto.label = taste.label;
    dto.embeddingModel = taste.embeddingModel;
    dto.createdAt = taste.createdAt.toISOString();
    dto.updatedAt = taste.updatedAt.toISOString();
    return dto;
  }
}
