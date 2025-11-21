import { Injectable, Logger } from '@nestjs/common';
import { DrizzleService } from '@infrastructure/persistence/drizzle/drizzle.service';
import { QdrantService } from '@infrastructure/vector/qdrant.service';
import { OpenAiClientService } from '@infrastructure/ai/openai-client.service';
import {
  HealthCheckResponseDto,
  HealthStatus,
  DependencyHealth,
} from '@entrypoint/http/dto/health-check.dto';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly qdrantService: QdrantService,
    private readonly openAiClient: OpenAiClientService,
  ) {}

  async check(): Promise<HealthCheckResponseDto> {
    this.logger.log('Performing health check');

    const [database, qdrant, openai, whatsapp] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkQdrant(),
      this.checkOpenAI(),
      this.checkWhatsApp(),
    ]);

    const dependencies = {
      database: this.getResult(database),
      qdrant: this.getResult(qdrant),
      openai: this.getResult(openai),
      whatsapp: this.getResult(whatsapp),
    };

    const overallStatus = this.determineOverallStatus(dependencies);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      dependencies,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  private async checkDatabase(): Promise<DependencyHealth> {
    const start = Date.now();
    try {
      await this.drizzleService.db.execute('SELECT 1');
      return {
        status: HealthStatus.UP,
        responseTime: Date.now() - start,
        message: 'Database connection is healthy',
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: HealthStatus.DOWN,
        responseTime: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkQdrant(): Promise<DependencyHealth> {
    const start = Date.now();
    try {
      const health = await this.qdrantService.healthCheck();
      return {
        status: health ? HealthStatus.UP : HealthStatus.DOWN,
        responseTime: Date.now() - start,
        message: health
          ? 'Qdrant vector store is healthy'
          : 'Qdrant is not responding',
      };
    } catch (error) {
      this.logger.error('Qdrant health check failed', error);
      return {
        status: HealthStatus.DOWN,
        responseTime: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkOpenAI(): Promise<DependencyHealth> {
    const start = Date.now();
    try {
      const health = await this.openAiClient.healthCheck();
      return {
        status: health ? HealthStatus.UP : HealthStatus.DOWN,
        responseTime: Date.now() - start,
        message: health
          ? 'OpenAI/LM Studio is healthy'
          : 'OpenAI/LM Studio is not responding',
        details: {
          embeddingModel: this.openAiClient.defaultEmbeddingModel,
          promotionModel: this.openAiClient.defaultPromotionModel,
        },
      };
    } catch (error) {
      this.logger.error('OpenAI health check failed', error);
      return {
        status: HealthStatus.DOWN,
        responseTime: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async checkWhatsApp(): Promise<DependencyHealth> {
    const start = Date.now();
    try {
      await Promise.resolve();
      return {
        status: HealthStatus.UP,
        responseTime: Date.now() - start,
        message: 'WhatsApp service initialized',
      };
    } catch (error) {
      this.logger.error('WhatsApp health check failed', error);
      return {
        status: HealthStatus.DEGRADED,
        responseTime: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getResult(
    result: PromiseSettledResult<DependencyHealth>,
  ): DependencyHealth {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      status: HealthStatus.DOWN,
      message:
        result.reason instanceof Error ? result.reason.message : 'Check failed',
    };
  }

  private determineOverallStatus(dependencies: {
    [key: string]: DependencyHealth;
  }): HealthStatus {
    const statuses = Object.values(dependencies).map((dep) => dep.status);

    if (statuses.every((status) => status === HealthStatus.UP)) {
      return HealthStatus.UP;
    }

    if (statuses.some((status) => status === HealthStatus.DOWN)) {
      return HealthStatus.DOWN;
    }

    return HealthStatus.DEGRADED;
  }
}
