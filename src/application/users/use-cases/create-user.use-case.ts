import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/tokens';
import { User } from '@domain/users/entities/user.entity';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface CreateUserInput {
  name: string;
  phone: string;
}

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserInput, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const user = User.create({ ...input });
    await this.userRepository.save(user);
    return user;
  }
}
