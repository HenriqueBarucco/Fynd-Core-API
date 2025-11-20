import { Inject, Injectable } from '@nestjs/common';
import { GROUP_REPOSITORY } from '@domain/tokens';
import type { Group } from '@domain/groups/entities/group.entity';
import type { GroupRepository } from '@domain/groups/repositories/group.repository';
import type { UseCase } from '@application/contracts/use-case.interface';

export interface GetGroupInput {
  id: string;
}

@Injectable()
export class GetGroupUseCase implements UseCase<GetGroupInput, Group | null> {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  execute({ id }: GetGroupInput): Promise<Group | null> {
    return this.groupRepository.findById(id);
  }
}
