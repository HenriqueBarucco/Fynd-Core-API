import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/tokens';
import type { User } from '@domain/users/entities/user.entity';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

@Injectable()
export class GetUsersUseCase implements UseCase<void, User[]> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
