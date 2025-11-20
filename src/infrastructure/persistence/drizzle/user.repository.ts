import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE } from './drizzle.module';
import type { DrizzleDatabase } from './drizzle.service';
import { users } from './schema';
import type { UserRepository } from '@domain/users/repositories/user.repository';
import { User } from '@domain/users/entities/user.entity';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  async save(user: User): Promise<User> {
    const snapshot = user.toJSON();
    await this.db
      .insert(users)
      .values({
        id: snapshot.id,
        name: snapshot.name,
        phone: snapshot.phone,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: snapshot.name,
          phone: snapshot.phone,
          updatedAt: snapshot.updatedAt,
        },
      });

    return user;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db.select().from(users).orderBy(users.createdAt);
    return rows.map((row) => this.mapRow(row));
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id));
    return row ? this.mapRow(row) : null;
  }

  async delete(user: User): Promise<void> {
    await this.db.delete(users).where(eq(users.id, user.id));
  }

  private readonly mapRow = (row: typeof users.$inferSelect): User =>
    User.restore({
      id: row.id,
      name: row.name,
      phone: row.phone,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
}
