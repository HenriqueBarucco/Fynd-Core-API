import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GetUserUseCase } from '@application/use-cases/get-user.use-case';
import { UserResponseDto } from '@entrypoint/http/dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return UserResponseDto.fromEntity(user);
  }
}
