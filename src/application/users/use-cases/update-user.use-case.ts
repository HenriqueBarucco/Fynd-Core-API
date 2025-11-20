import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/tokens';
import type { User } from '@domain/users/entities/user.entity';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface UpdateUserInput {
  id: string;
  name?: string;
  phone?: string;
}

@Injectable()
export class UpdateUserUseCase
  implements UseCase<UpdateUserInput, User | null>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserInput): Promise<User | null> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      return null;
    }

    user.update({ name: input.name, phone: input.phone });
    await this.userRepository.save(user);
    return user;
  }
}
