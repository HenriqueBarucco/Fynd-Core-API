import { ApiProperty } from '@nestjs/swagger';
import { Group } from '@domain/groups/entities/group.entity';

export class GroupResponseDto {
  @ApiProperty({ description: 'Group identifier (UUID v8).', format: 'uuid' })
  public readonly id: string;

  @ApiProperty({ description: 'External identifier associated to the group.' })
  public readonly externalId: string;

  @ApiProperty({ description: 'Readable description of the group.' })
  public readonly description: string;

  @ApiProperty({ description: 'Creation timestamp in ISO 8601.' })
  public readonly createdAt: string;

  @ApiProperty({ description: 'Last update timestamp in ISO 8601.' })
  public readonly updatedAt: string;

  constructor(
    id: string,
    externalId: string,
    description: string,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.externalId = externalId;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromEntity(group: Group): GroupResponseDto {
    return new GroupResponseDto(
      group.id,
      group.externalId,
      group.description,
      group.createdAt.toISOString(),
      group.updatedAt.toISOString(),
    );
  }
}
