import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@domain/tokens';
import { Group } from '@domain/groups/entities/group.entity';
import type { GroupRepository } from '@domain/groups/repositories/group.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface CreateGroupInput {
  externalId: string;
  description: string;
}

@Injectable()
export class CreateGroupUseCase implements UseCase<CreateGroupInput, Group> {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(input: CreateGroupInput): Promise<Group> {
    const group = Group.create({ ...input });
    await this.groupRepository.save(group);
    return group;
  }
}
