import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE } from './drizzle.module';
import type { DrizzleDatabase } from './drizzle.service';
import { userTastes } from './schema';
import type { UserTasteRepository } from '@domain/users/repositories/user-taste.repository';
import { UserTaste } from '@domain/users/entities/user-taste.entity';

@Injectable()
export class DrizzleUserTasteRepository implements UserTasteRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  async save(taste: UserTaste): Promise<UserTaste> {
    const snapshot = taste.toJSON();

    await this.db
      .insert(userTastes)
      .values({
        id: snapshot.id,
        userId: snapshot.userId,
        label: snapshot.label,
        normalizedLabel: snapshot.normalizedLabel,
        embeddingModel: snapshot.embeddingModel,
        qdrantPointId: snapshot.qdrantPointId,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      })
      .onConflictDoUpdate({
        target: userTastes.id,
        set: {
          label: snapshot.label,
          normalizedLabel: snapshot.normalizedLabel,
          embeddingModel: snapshot.embeddingModel,
          updatedAt: snapshot.updatedAt,
        },
      });

    return taste;
  }

  async findById(id: string): Promise<UserTaste | null> {
    const [row] = await this.db
      .select()
      .from(userTastes)
      .where(eq(userTastes.id, id));
    return row ? this.mapRow(row) : null;
  }

  async findManyByUserId(userId: string): Promise<UserTaste[]> {
    const rows = await this.db
      .select()
      .from(userTastes)
      .where(eq(userTastes.userId, userId))
      .orderBy(userTastes.createdAt);

    return rows.map((row) => this.mapRow(row));
  }

  async findByUserAndLabel(
    userId: string,
    normalizedLabel: string,
  ): Promise<UserTaste | null> {
    const [row] = await this.db
      .select()
      .from(userTastes)
      .where(
        and(
          eq(userTastes.userId, userId),
          eq(userTastes.normalizedLabel, normalizedLabel),
        ),
      );

    return row ? this.mapRow(row) : null;
  }

  async delete(taste: UserTaste): Promise<void> {
    await this.db.delete(userTastes).where(eq(userTastes.id, taste.id));
  }

  private mapRow(row: typeof userTastes.$inferSelect): UserTaste {
    return UserTaste.restore({
      id: row.id,
      userId: row.userId,
      label: row.label,
      normalizedLabel: row.normalizedLabel,
      embeddingModel: row.embeddingModel,
      qdrantPointId: row.qdrantPointId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
