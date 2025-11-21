import { ApiProperty } from '@nestjs/swagger';
import type {
  SearchUsersByTasteOutput,
  UserTasteSearchMatch,
} from '@application/users/use-cases/search-users-by-taste.use-case';
import { UserResponseDto } from '@entrypoint/http/dto/user-response.dto';

export class UserTasteMatchDto {
  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({
    format: 'uuid',
    description: 'Identifier of the matched taste.',
  })
  tasteId!: string;

  @ApiProperty({ description: 'Search label stored with the taste vector.' })
  matchedLabel!: string;

  @ApiProperty({
    description: 'Original label provided when the taste was stored.',
    required: false,
  })
  matchedOriginalLabel?: string;

  @ApiProperty({
    description: 'Similarity score reported by Qdrant.',
    minimum: 0,
    maximum: 1,
  })
  score!: number;

  static fromMatch(match: UserTasteSearchMatch): UserTasteMatchDto {
    const dto = new UserTasteMatchDto();
    dto.user = UserResponseDto.fromEntity(match.user);
    dto.tasteId = match.match.tasteId;
    dto.matchedLabel = match.match.label;
    dto.matchedOriginalLabel = match.match.originalLabel;
    dto.score = match.match.score;
    return dto;
  }
}

export class UserTasteSearchResponseDto {
  @ApiProperty({ description: 'Original input label after cleanup.' })
  originalLabel!: string;

  @ApiProperty({
    description: 'Search-friendly label used to generate embeddings.',
  })
  searchLabel!: string;

  @ApiProperty({
    description: 'Users ranked by similarity to the requested taste.',
    type: UserTasteMatchDto,
    isArray: true,
  })
  results!: UserTasteMatchDto[];

  static fromUseCaseOutput(
    output: SearchUsersByTasteOutput,
  ): UserTasteSearchResponseDto {
    const dto = new UserTasteSearchResponseDto();
    dto.originalLabel = output.query.originalLabel;
    dto.searchLabel = output.query.searchLabel;
    dto.results = output.matches.map((match) =>
      UserTasteMatchDto.fromMatch(match),
    );
    return dto;
  }
}
