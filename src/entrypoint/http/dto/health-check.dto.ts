import { ApiProperty } from '@nestjs/swagger';

export enum HealthStatus {
  UP = 'up',
  DOWN = 'down',
  DEGRADED = 'degraded',
}

export class DependencyHealth {
  @ApiProperty({ enum: HealthStatus })
  status: HealthStatus;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  responseTime?: number;

  @ApiProperty({ required: false })
  details?: Record<string, unknown>;
}

export class HealthCheckResponseDto {
  @ApiProperty({ enum: HealthStatus })
  status: HealthStatus;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'object' } })
  dependencies: {
    database: DependencyHealth;
    qdrant: DependencyHealth;
    openai: DependencyHealth;
    whatsapp: DependencyHealth;
  };

  @ApiProperty({ required: false })
  uptime?: number;
}
