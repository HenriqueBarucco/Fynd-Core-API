import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthCheckService } from '@application/services/health-check.service';
import { HealthCheckResponseDto, HealthStatus } from '../dto/health-check.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @ApiOperation({ summary: 'Check health status of all dependencies' })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    type: HealthCheckResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - one or more dependencies are unhealthy',
  })
  async check(@Res() res: Response): Promise<Response> {
    const result = await this.healthCheckService.check();
    const statusCode =
      result.status === HealthStatus.UP
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(result);
  }
}
