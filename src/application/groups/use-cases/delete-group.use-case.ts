import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@domain/tokens';
import type { GroupRepository } from '@domain/groups/repositories/group.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface DeleteGroupInput {
  id: string;
}

@Injectable()
export class DeleteGroupUseCase implements UseCase<DeleteGroupInput, boolean> {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute({ id }: DeleteGroupInput): Promise<boolean> {
    const group = await this.groupRepository.findById(id);

    if (!group) {
      return false;
    }

    await this.groupRepository.delete(group);
    return true;
  }
}
