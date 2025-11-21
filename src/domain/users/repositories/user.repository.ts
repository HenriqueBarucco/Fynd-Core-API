import { User } from '@domain/users/entities/user.entity';

export interface UserRepository {
  save(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findManyByIds(ids: string[]): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  delete(user: User): Promise<void>;
}
