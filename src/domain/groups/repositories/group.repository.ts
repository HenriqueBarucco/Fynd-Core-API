import { Group } from '@domain/groups/entities/group.entity';

export interface GroupRepository {
  save(group: Group): Promise<Group>;
  findAll(): Promise<Group[]>;
  findById(id: string): Promise<Group | null>;
  delete(group: Group): Promise<void>;
}
