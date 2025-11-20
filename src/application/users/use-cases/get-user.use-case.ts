import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/tokens';
import type { User } from '@domain/users/entities/user.entity';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface GetUserInput {
  id: string;
}

@Injectable()
export class GetUserUseCase implements UseCase<GetUserInput, User | null> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ id }: GetUserInput): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
