import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '@application/users/use-cases/create-user.use-case';
import { GetUsersUseCase } from '@application/users/use-cases/get-users.use-case';
import { GetUserUseCase } from '@application/users/use-cases/get-user.use-case';
import { UpdateUserUseCase } from '@application/users/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '@application/users/use-cases/delete-user.use-case';
import { UserResponseDto } from '@entrypoint/http/dto/user-response.dto';
import { CreateUserDto } from '@entrypoint/http/dto/create-user.dto';
import { UpdateUserDto } from '@entrypoint/http/dto/update-user.dto';
import { UuidV8Pipe } from '@entrypoint/http/pipes/uuid-v8.pipe';
import { AddUserTasteUseCase } from '@application/users/use-cases/add-user-taste.use-case';
import { RemoveUserTasteUseCase } from '@application/users/use-cases/remove-user-taste.use-case';
import { AddUserTasteDto } from '@entrypoint/http/dto/add-user-taste.dto';
import { UserTasteResponseDto } from '@entrypoint/http/dto/user-taste-response.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly addUserTasteUseCase: AddUserTasteUseCase,
    private readonly removeUserTasteUseCase: RemoveUserTasteUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Creates a user with a server-generated UUID v8 identifier.',
  })
  @ApiCreatedResponse({
    description: 'User created successfully.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(body);
    return UserResponseDto.fromEntity(user);
  }

  @Get()
  @ApiOperation({
    summary: 'List users',
    description: 'Returns all users ordered by creation date.',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully.',
    type: UserResponseDto,
    isArray: true,
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.getUsersUseCase.execute();
    return users.map((user) => UserResponseDto.fromEntity(user));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user',
    description: 'Retrieves a user by its UUID v8 identifier.',
  })
  @ApiOkResponse({ description: 'User found.', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async findOne(@Param('id', UuidV8Pipe) id: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return UserResponseDto.fromEntity(user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Partially updates user attributes.',
  })
  @ApiOkResponse({ description: 'User updated.', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  async update(
    @Param('id', UuidV8Pipe) id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserUseCase.execute({ id, ...body });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return UserResponseDto.fromEntity(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Removes a user permanently.',
  })
  @ApiNoContentResponse({ description: 'User deleted.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async delete(@Param('id', UuidV8Pipe) id: string): Promise<void> {
    const deleted = await this.deleteUserUseCase.execute({ id });

    if (!deleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  @Post(':id/tastes')
  @ApiOperation({
    summary: 'Add user taste',
    description:
      'Generates an embedding for the provided taste and stores it for similarity searches.',
  })
  @ApiCreatedResponse({
    description: 'Taste stored and indexed successfully.',
    type: UserTasteResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async addTaste(
    @Param('id', UuidV8Pipe) id: string,
    @Body() body: AddUserTasteDto,
  ): Promise<UserTasteResponseDto> {
    const taste = await this.addUserTasteUseCase.execute({
      userId: id,
      label: body.taste,
    });

    if (!taste) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return UserTasteResponseDto.fromEntity(taste);
  }

  @Delete(':userId/tastes/:tasteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove user taste',
    description: 'Removes the taste vector from storage and Qdrant.',
  })
  @ApiNoContentResponse({ description: 'Taste removed.' })
  @ApiNotFoundResponse({ description: 'Taste or user not found.' })
  async deleteTaste(
    @Param('userId', UuidV8Pipe) userId: string,
    @Param('tasteId', UuidV8Pipe) tasteId: string,
  ): Promise<void> {
    const deleted = await this.removeUserTasteUseCase.execute({
      userId,
      tasteId,
    });

    if (!deleted) {
      throw new NotFoundException(
        `Taste ${tasteId} for user ${userId} not found or already removed`,
      );
    }
  }
}
