import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUuidV8 } from '@shared/uuid';

@Injectable()
export class UuidV8Pipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUuidV8(value)) {
      throw new BadRequestException('The provided id is not a valid UUID v8');
    }

    return value;
  }
}
