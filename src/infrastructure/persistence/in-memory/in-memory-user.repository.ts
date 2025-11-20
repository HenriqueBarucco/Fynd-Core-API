import { Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { UserRepository } from '@domain/repositories/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly items = new Map<string, User>([
    [
      '1',
      {
        id: '1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        createdAt: new Date('2020-01-01T00:00:00Z'),
        updatedAt: new Date('2020-01-01T00:00:00Z'),
      },
    ],
  ]);

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }
}
