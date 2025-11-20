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
import { CreateGroupUseCase } from '@application/groups/use-cases/create-group.use-case';
import { GetGroupsUseCase } from '@application/groups/use-cases/get-groups.use-case';
import { GetGroupUseCase } from '@application/groups/use-cases/get-group.use-case';
import { UpdateGroupUseCase } from '@application/groups/use-cases/update-group.use-case';
import { DeleteGroupUseCase } from '@application/groups/use-cases/delete-group.use-case';
import { CreateGroupDto } from '@entrypoint/http/dto/create-group.dto';
import { UpdateGroupDto } from '@entrypoint/http/dto/update-group.dto';
import { GroupResponseDto } from '@entrypoint/http/dto/group-response.dto';
import { UuidV8Pipe } from '@entrypoint/http/pipes/uuid-v8.pipe';

@ApiTags('Groups')
@Controller('groups')
export class GroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly getGroupsUseCase: GetGroupsUseCase,
    private readonly getGroupUseCase: GetGroupUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly deleteGroupUseCase: DeleteGroupUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create group',
    description: 'Registers a group referenced by an external identifier.',
  })
  @ApiCreatedResponse({ description: 'Group created.', type: GroupResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  async create(@Body() body: CreateGroupDto): Promise<GroupResponseDto> {
    const group = await this.createGroupUseCase.execute(body);
    return GroupResponseDto.fromEntity(group);
  }

  @Get()
  @ApiOperation({ summary: 'List groups', description: 'Lists all groups.' })
  @ApiOkResponse({
    description: 'Groups retrieved.',
    type: GroupResponseDto,
    isArray: true,
  })
  async findAll(): Promise<GroupResponseDto[]> {
    const groups = await this.getGroupsUseCase.execute();
    return groups.map((group) => GroupResponseDto.fromEntity(group));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group', description: 'Retrieves a group.' })
  @ApiOkResponse({ description: 'Group found.', type: GroupResponseDto })
  @ApiNotFoundResponse({ description: 'Group not found.' })
  async findOne(
    @Param('id', UuidV8Pipe) id: string,
  ): Promise<GroupResponseDto> {
    const group = await this.getGroupUseCase.execute({ id });

    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }

    return GroupResponseDto.fromEntity(group);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group', description: 'Updates a group.' })
  @ApiOkResponse({ description: 'Group updated.', type: GroupResponseDto })
  @ApiNotFoundResponse({ description: 'Group not found.' })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  async update(
    @Param('id', UuidV8Pipe) id: string,
    @Body() body: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    const group = await this.updateGroupUseCase.execute({ id, ...body });

    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }

    return GroupResponseDto.fromEntity(group);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete group', description: 'Deletes a group.' })
  @ApiNoContentResponse({ description: 'Group deleted.' })
  @ApiNotFoundResponse({ description: 'Group not found.' })
  async delete(@Param('id', UuidV8Pipe) id: string): Promise<void> {
    const deleted = await this.deleteGroupUseCase.execute({ id });

    if (!deleted) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }
  }
}
