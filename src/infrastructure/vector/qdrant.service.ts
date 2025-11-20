import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

interface UserTastePoint {
  id: string;
  vector: number[];
  payload?: Record<string, unknown>;
}

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly logger = new Logger(QdrantService.name);
  private readonly client: QdrantClient;
  private readonly collectionName: string;
  private readonly vectorSize: number;
  private readonly distance: 'Cosine' | 'Dot' | 'Euclid';

  constructor(private readonly configService: ConfigService) {
    const url =
      this.configService.get<string>('QDRANT_URL') ?? 'http://localhost:6333';
    const apiKey = this.configService.get<string>('QDRANT_API_KEY');

    this.collectionName =
      this.configService.get<string>('QDRANT_COLLECTION') ?? 'user_tastes';
    this.vectorSize =
      this.configService.get<number>('QDRANT_VECTOR_SIZE') ?? 1024;
    this.distance =
      this.configService.get<'Cosine' | 'Dot' | 'Euclid'>('QDRANT_DISTANCE') ??
      'Cosine';

    this.client = new QdrantClient({ url, apiKey });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureCollection();
  }

  async upsert(points: UserTastePoint[]): Promise<void> {
    if (!points.length) {
      return;
    }

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: points as never,
    });
  }

  async delete(pointIds: Array<string | number>): Promise<void> {
    if (!pointIds.length) {
      return;
    }

    await this.client.delete(this.collectionName, {
      points: pointIds,
    });
  }

  private async ensureCollection(): Promise<void> {
    try {
      const description = await this.client.getCollection(this.collectionName);
      this.validateVectorSize(description);
      return;
    } catch (error) {
      if (!this.isCollectionMissing(error)) {
        throw error instanceof Error ? error : new Error(String(error));
      }

      this.logger.warn(
        `Collection ${this.collectionName} missing in Qdrant, attempting to create`,
        error instanceof Error ? error : undefined,
      );
    }

    await this.client.createCollection(this.collectionName, {
      vectors: {
        size: this.vectorSize,
        distance: this.distance,
      },
    });
  }

  private validateVectorSize(description: unknown): void {
    const size = this.extractVectorSize(description);

    if (size === null) {
      return;
    }

    if (size !== this.vectorSize) {
      throw new Error(
        `Qdrant collection ${this.collectionName} is configured with vector size ${size}, but the application expects ${this.vectorSize}. ` +
          'Drop the collection or set QDRANT_VECTOR_SIZE to match the existing size before restarting.',
      );
    }
  }

  private extractVectorSize(description: unknown): number | null {
    if (!description || typeof description !== 'object') {
      return null;
    }

    const result = (description as { result?: unknown }).result;

    if (!result || typeof result !== 'object') {
      return null;
    }

    const config = (result as { config?: unknown }).config;
    if (!config || typeof config !== 'object') {
      return null;
    }

    const params = (config as { params?: unknown }).params;
    if (!params || typeof params !== 'object') {
      return null;
    }

    const vectors = (params as { vectors?: unknown }).vectors;

    if (!vectors || typeof vectors !== 'object') {
      return null;
    }

    const size = (vectors as { size?: unknown }).size;
    return typeof size === 'number' ? size : null;
  }

  private isCollectionMissing(error: unknown): boolean {
    if (!error) {
      return false;
    }

    if (
      typeof error === 'object' &&
      'status' in error &&
      (error as { status?: number }).status === 404
    ) {
      return true;
    }

    return error instanceof Error
      ? /not\s+found/i.test(error.message) || /404/.test(error.message)
      : false;
  }
}
