import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@domain/tokens';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface DeleteUserInput {
  id: string;
}

@Injectable()
export class DeleteUserUseCase implements UseCase<DeleteUserInput, boolean> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ id }: DeleteUserInput): Promise<boolean> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      return false;
    }

    await this.userRepository.delete(user);
    return true;
  }
}
