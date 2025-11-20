import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE } from './drizzle.module';
import type { DrizzleDatabase } from './drizzle.service';
import { groups } from './schema';
import type { GroupRepository } from '@domain/groups/repositories/group.repository';
import { Group } from '@domain/groups/entities/group.entity';

@Injectable()
export class DrizzleGroupRepository implements GroupRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  async save(group: Group): Promise<Group> {
    const snapshot = group.toJSON();
    await this.db
      .insert(groups)
      .values({
        id: snapshot.id,
        externalId: snapshot.externalId,
        description: snapshot.description,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoUpdate({
        target: groups.id,
        set: {
          externalId: snapshot.externalId,
          description: snapshot.description,
          updatedAt: snapshot.updatedAt,
        },
      });

    return group;
  }

  async findAll(): Promise<Group[]> {
    const rows = await this.db.select().from(groups).orderBy(groups.createdAt);
    return rows.map((row) => this.mapRow(row));
  }

  async findById(id: string): Promise<Group | null> {
    const [row] = await this.db.select().from(groups).where(eq(groups.id, id));
    return row ? this.mapRow(row) : null;
  }

  async delete(group: Group): Promise<void> {
    await this.db.delete(groups).where(eq(groups.id, group.id));
  }

  private readonly mapRow = (row: typeof groups.$inferSelect): Group =>
    Group.restore({
      id: row.id,
      externalId: row.externalId,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
}
