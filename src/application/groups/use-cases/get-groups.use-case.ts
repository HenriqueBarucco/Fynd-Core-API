import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@domain/tokens';
import type { Group } from '@domain/groups/entities/group.entity';
import type { GroupRepository } from '@domain/groups/repositories/group.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

@Injectable()
export class GetGroupsUseCase implements UseCase<void, Group[]> {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  execute(): Promise<Group[]> {
    return this.groupRepository.findAll();
  }
}
