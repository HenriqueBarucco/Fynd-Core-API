import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@domain/tokens';
import type { Group } from '@domain/groups/entities/group.entity';
import type { GroupRepository } from '@domain/groups/repositories/group.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface UpdateGroupInput {
  id: string;
  externalId?: string;
  description?: string;
}

@Injectable()
export class UpdateGroupUseCase
  implements UseCase<UpdateGroupInput, Group | null>
{
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: UpdateGroupInput): Promise<Group | null> {
    const group = await this.groupRepository.findById(input.id);

    if (!group) {
      return null;
    }

    group.update({
      externalId: input.externalId,
      description: input.description,
    });
    await this.groupRepository.save(group);
    return group;
  }
}
