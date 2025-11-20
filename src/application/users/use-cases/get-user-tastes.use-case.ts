import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '@application/contracts/use-case.interface';
import { USER_REPOSITORY, USER_TASTE_REPOSITORY } from '@domain/tokens';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import type { UserTasteRepository } from '@domain/users/repositories/user-taste.repository';
import type { UserTaste } from '@domain/users/entities/user-taste.entity';

export interface GetUserTastesInput {
  userId: string;
}

@Injectable()
export class GetUserTastesUseCase
  implements UseCase<GetUserTastesInput, UserTaste[] | null>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_TASTE_REPOSITORY)
    private readonly userTasteRepository: UserTasteRepository,
  ) {}

  async execute({ userId }: GetUserTastesInput): Promise<UserTaste[] | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    const tastes = await this.userTasteRepository.findManyByUserId(userId);
    return tastes;
  }
}
